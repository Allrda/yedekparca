import os
import re
import json
import time
import random
import logging
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup

# --- Loglama Yapılandırması ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("scraper.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0"
]

DATA_DIR = "data"
OUTPUT_FILE = os.path.join(DATA_DIR, "parcalar.json")

# Hedef Alan Adları
AKBAY_DOMAIN = "https://www.akbayrenault.com"
OTOERDEM_DOMAIN = "https://www.otoerdem.com"

def get_random_headers(referer=AKBAY_DOMAIN):
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": referer
    }

def extract_oem_code(text):
    """Renault & Dacia OEM numaralarını metinden ayıklar."""
    pattern = r'\b(?:[0-9]{10}|[0-9]{5}[A-Z0-9]{5}|[0-9]{9}[R|r]|[0-9]{2}\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{3})\b'
    match = re.search(pattern, text)
    if match:
        return re.sub(r'\s+', '', match.group(0)).upper()
    return "OEM_BULUNAMADI"

def parse_chassis_info(text):
    """Metin içindeki araç model isimlerini tespit eder."""
    models = [
        "R9", "Broadway", "Spring", "Fairway", "R19", "Europa",
        "Clio", "Megane", "Symbol", "Duster", "Logan", "Sandero",
        "Fluence", "Scenic", "Kadjar", "Captur", "Kangoo", "Master",
        "Trafic", "Lodgy", "Dokker", "Koleos", "Taliant", "Talisman", "Austral", "Arkana"
    ]
    found_models = []
    for model in models:
        if re.search(rf'\b{model}\b', text, re.IGNORECASE):
            found_models.append(model.capitalize())
    return list(set(found_models))

def fetch_page(session, url):
    """Güvenli HTTP isteği atar, Rate Limit (429) durumunda bekler."""
    try:
        response = session.get(url, headers=get_random_headers(url), timeout=15)
        if response.status_code == 200:
            return response.text
        elif response.status_code == 429:
            logging.warning("Rate limit algılandı! 60 saniye bekleniyor...")
            time.sleep(60)
            return fetch_page(session, url)
        else:
            logging.error(f"HTTP {response.status_code} Hatası - URL: {url}")
            return None
    except requests.RequestException as e:
        logging.error(f"Bağlantı hatası ({url}): {e}")
        return None

def auto_discover_categories(session, domain):
    """Sitenin ana sayfasından aktif ve çalışan tüm kategori linklerini otomatik bulur."""
    html = fetch_page(session, domain)
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    categories = set()

    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        if "/kategori" in href or "/marka" in href or "/model" in href or "yedek-parca" in href or "/renault" in href or "/dacia" in href:
            full_url = urljoin(domain, href).split("?")[0]
            if full_url != domain and not full_url.endswith("#"):
                categories.add(full_url)

    return list(categories)

def collect_product_urls_from_category(session, category_url, domain):
    """Kategori ve alt sayfalarından ürün linklerini toplar."""
    product_urls = set()
    page_num = 1

    while True:
        current_page_url = f"{category_url}?sayfa={page_num}" if page_num > 1 else category_url
        html = fetch_page(session, current_page_url)

        if not html:
            break

        soup = BeautifulSoup(html, "html.parser")
        found_in_page = 0

        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            if ("/urun/" in href or "/p-" in href or "/urun-detay/" in href or href.endswith(".html")) and not "/kategori/" in href:
                full_url = urljoin(domain, href).split("?")[0]
                if full_url not in product_urls:
                    product_urls.add(full_url)
                    found_in_page += 1

        if found_in_page == 0 or page_num > 40:
            break

        page_num += 1
        time.sleep(1.2)

    return list(product_urls)

def scrape_product_details(session, product_url, site_name="akbayrenault"):
    """Tek bir ürün detay sayfasından net bilgileri çeker."""
    html = fetch_page(session, product_url)
    if not html:
        return None

    soup = BeautifulSoup(html, "html.parser")

    # Ürün Başlığı
    title_tag = (
        soup.find("h1") or
        soup.find(class_=re.compile(r'product-name|product-title|title', re.I))
    )
    title = title_tag.get_text(strip=True) if title_tag else "Bilinmeyen Ürün"

    # Sayfa İçeriğinden OEM ve Şasi Bilgisi
    page_text = soup.get_text()
    oem_code = extract_oem_code(page_text)
    compatible_models = parse_chassis_info(page_text)

    # Fiyat
    price_tag = (
        soup.find(class_=re.compile(r'product-price|current-price|fiyat|price', re.I)) or
        soup.find("span", id=re.compile(r'price', re.I))
    )
    price = price_tag.get_text(strip=True) if price_tag else "0.00 TL"

    return {
        "urun_adi": title,
        "oem_kodu": oem_code,
        "uyumlu_modeller": compatible_models,
        "fiyat": price,
        "kaynak_site": site_name,
        "kaynak_url": product_url,
        "son_guncelleme": time.strftime("%Y-%m-%d %H:%M:%S")
    }