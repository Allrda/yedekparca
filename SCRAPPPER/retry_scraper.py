import asyncio
import json
import logging
import re
from bs4 import BeautifulSoup
import aiohttp

# --- LOGGING AYARLARI ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("retry_process.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)

# --- AYARLAR ---
FAILED_URLS_FILE = "failed_urls.json"    # Başarısız/Eksik URL listen
OUTPUT_FILE = "retry_success_products.json"  # Başarıyla çekilen ürünler
CONCURRENCY_LIMIT = 5  # Hedef sunucuyu yormamak için eşzamanlı istek limiti (Düşürüldü)
MAX_RETRIES = 4        # Bir URL için maksimum tekrar deneme sayısı
BASE_BACKOFF = 2       # 429 veya 50x durumunda başlanacak bekleme süresi (saniye)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
}

# --- TEMİZLEME VE REGEX FONKSİYONLARI ---
def parse_and_clean_html(html_content, url):
    """HTML içeriğini ayrıştırır, OEM kodu ve fiyat verisini temizler."""
    soup = BeautifulSoup(html_content, "html.parser")
    
    # 1. Başlık Çekme
    title_element = soup.select_one("h1.product-name, h1.page-title, h1")
    baslik = title_element.get_text(strip=True) if title_element else ""
    
    if not baslik:
        return None  # Ürün sayfası değilse veya başlık yoksa atla

    # 2. OEM Kodu Regex Ayrıştırma (Renault Grubu Standart Kodları)
    oem_match = re.search(r'\b(77\d{8}|82\d{8}|28\d{8}|41\d{8}|62\d{8}|85\d{8}|11\d{8}|16\d{8})\b', baslik)
    oem_kodu = oem_match.group(0) if oem_match else ""

    # 3. Fiyat Temizleme (Ham metinden net tutarı çekme)
    price_element = soup.select_one(".product-price, .price, .discount-price")
    raw_price = price_element.get_text(separator=" ", strip=True) if price_element else ""
    
    fiyat_float = None
    prices = re.findall(r'[\d\.]+\,\d{2}', raw_price)
    if prices:
        # Format: "1.102,05" -> 1102.05
        clean_price_str = prices[-1].replace('.', '').replace(',', '.')
        try:
            fiyat_float = float(clean_price_str)
        except ValueError:
            fiyat_float = None

    return {
        "url": url,
        "baslik": baslik,
        "oem_kodu": oem_kodu,
        "fiyat_raw": raw_price,
        "fiyat_float": fiyat_float,
        "status": "success"
    }

# --- HTTP RETRY VE İNCELEME MANTIĞI ---
async def fetch_with_retry(session, url, semaphore):
    async with semaphore:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                async with session.get(url, headers=HEADERS, timeout=15) as response:
                    status = response.status

                    # STATUS 200: Başarılı
                    if status == 200:
                        html = await response.text()
                        product_data = parse_and_clean_html(html, url)
                        if product_data:
                            logging.info(f"[200 OK] Başarıyla çekildi: {url}")
                            return product_data
                        else:
                            logging.warning(f"[DOM HATA] Ürün içeriği okunamadı (404/Kategori Sayfası olabilir): {url}")
                            return None

                    # STATUS 429: Too Many Requests (Rate Limit)
                    elif status == 429:
                        wait_time = BASE_BACKOFF ** attempt
                        logging.warning(f"[429 Rate Limit] {url} - {wait_time}s bekleniyor (Deneme {attempt}/{MAX_RETRIES})")
                        await asyncio.sleep(wait_time)

                    # STATUS 50x: Sunucu Hataları (Timeout, Gateway vb.)
                    elif status in [500, 502, 503, 504]:
                        wait_time = BASE_BACKOFF * attempt
                        logging.warning(f"[{status} Sunucu Hatası] {url} - {wait_time}s bekleniyor (Deneme {attempt}/{MAX_RETRIES})")
                        await asyncio.sleep(wait_time)

                    # STATUS 404/403: Kalıcı Hatalar
                    elif status in [403, 404]:
                        logging.error(f"[{status} Erişim/Bulunamadı] {url} - Yeniden denenmeyecek.")
                        return None

                    else:
                        logging.warning(f"[{status} Bilinmeyen Durum] {url}")

            except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                wait_time = BASE_BACKOFF * attempt
                logging.error(f"[Bağlantı Hatası: {type(e).__name__}] {url} - {wait_time}s sonra tekrar denenecek.")
                await asyncio.sleep(wait_time)

        logging.error(f"[BAŞARISIZ] {MAX_RETRIES} deneme sonunda çekilemedi: {url}")
        return None

# --- ANA ÇALIŞTIRICI ---
async def main():
    # 1. Başarısız URL Listesini Yükle
    try:
        with open(FAILED_URLS_FILE, "r", encoding="utf-8") as f:
            target_urls = json.load(f)
    except FileNotFoundError:
        logging.error(f"'{FAILED_URLS_FILE}' dosyası bulunamadı! Lütfen dosya yolunu kontrol edin.")
        return

    logging.info(f"Toplam {len(target_urls)} adet retry edilecek URL yüklendi.")

    semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)
    results = []

    # 2. Async HTTP Oturumu Başlat
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_with_retry(session, url, semaphore) for url in target_urls]
        
        # İlerleme takibi ile görevleri çalıştır
        completed_tasks = await asyncio.gather(*tasks)

    # 3. Başarılı Sonuçları Filtrele ve Kaydet
    successful_results = [data for data in completed_tasks if data is not None]
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(successful_results, f, ensure_ascii=False, indent=4)

    logging.info("=" * 50)
    logging.info(f"RETRY İŞLEMİ TAMAMLANDI.")
    logging.info(f"İşlenen URL: {len(target_urls)}")
    logging.info(f"Kurtarılan Ürün Sayısı: {len(successful_results)}")
    logging.info(f"Sonuçlar '{OUTPUT_FILE}' dosyasına kaydedildi.")

if __name__ == "__main__":
    asyncio.run(main())