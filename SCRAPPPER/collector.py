import json
import sys
import xml.etree.ElementTree as ET
import requests
from tqdm import tqdm

SITEMAP_INDEX = "https://www.akbayrenault.com/sitemap.xml"
NAMESPACE = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def fetch_product_urls():
    print("=" * 60)
    print(" [1/2] SITEMAP TARAMA VE LINK TOPLAMA ISLEMI BASLADI")
    print("=" * 60)

    try:
        res = requests.get(SITEMAP_INDEX, headers=HEADERS, timeout=15)
        if res.status_code != 200:
            print(f"[!] Sunucu hata kodu döndürdü: {res.status_code}")
            sys.exit(1)

        root = ET.fromstring(res.content)
    except Exception as e:
        print(f"[!] Sitemap Index okunamadı: {e}")
        sys.exit(1)

    # Ürün sitemap'lerini ayıkla
    product_sitemaps = [
        sitemap.find("ns:loc", NAMESPACE).text
        for sitemap in root.findall("ns:sitemap", NAMESPACE)
        if "sitemap_product_" in sitemap.find("ns:loc", NAMESPACE).text
    ]

    if not product_sitemaps:
        print("[!] Hiç ürün sitemap'i bulunamadı!")
        sys.exit(1)

    print(
        f"[+] Toplam {len(product_sitemaps)} adet ürün sitemap haritası tespit edildi."
    )
    print("[+] URL'ler taranıyor...\n")

    all_urls = []

    for sitemap_url in tqdm(
        product_sitemaps, desc="Sitemap'ler Taranıyor", unit="dosya"
    ):
        try:
            r = requests.get(sitemap_url, headers=HEADERS, timeout=10)
            if r.status_code == 200:
                sub_root = ET.fromstring(r.content)
                for url_node in sub_root.findall("ns:url", NAMESPACE):
                    loc_node = url_node.find("ns:loc", NAMESPACE)
                    if loc_node is not None and loc_node.text:
                        all_urls.append(loc_node.text.strip())
        except Exception:
            continue

    # Tekrarlayan URL'leri temizle
    unique_urls = list(set(all_urls))

    if not unique_urls:
        print("[!] Toplanan geçerli URL bulunamadı, dosya oluşturulmadı.")
        sys.exit(1)

    with open("urls.json", "w", encoding="utf-8") as f:
        json.dump(unique_urls, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print(" [✓] SITEMAP TARAMA TAMAMLANDI")
    print(f" [+] Bulunan Toplam Ham URL   : {len(all_urls)}")
    print(f" [+] Benzersiz Ürün URL Sayısı: {len(unique_urls)}")
    print(" [+] Kaydedilen Dosya         : urls.json")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    fetch_product_urls()