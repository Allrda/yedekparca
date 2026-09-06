import asyncio
import json
import sys
import aiohttp
from bs4 import BeautifulSoup
from tqdm.asyncio import tqdm_asyncio

CONCURRENCY_LIMIT = 15
SEMAPHORE = asyncio.Semaphore(CONCURRENCY_LIMIT)

# İstatistik takibi için sayaçlar
stats = {"basarili": 0, "basarisiz": 0}


async def fetch_product_data(session, url):
    async with SEMAPHORE:
        try:
            async with session.get(
                url, timeout=aiohttp.ClientTimeout(total=15)
            ) as response:
                if response.status != 200:
                    stats["basarisiz"] += 1
                    return None

                html = await response.text()
                soup = BeautifulSoup(html, "lxml")

                title_elem = soup.find("h1")
                title = title_elem.text.strip() if title_elem else ""

                if not title:
                    stats["basarisiz"] += 1
                    return None

                oem_elem = soup.select_one(
                    ".oem-code, .product-code, .stok-kodu, .sku"
                )
                oem = oem_elem.text.strip() if oem_elem else ""

                price_elem = soup.select_one(
                    ".product-price, .price, .fiyat, .current-price"
                )
                price = (
                    price_elem.text.strip() if price_elem else "Fiyat Belirtilmedi"
                )

                models = [
                    li.text.strip()
                    for li in soup.select(
                        ".compatible-models li, .models-list li, .product-features li"
                    )
                ]

                stats["basarili"] += 1

                return {
                    "url": url,
                    "baslik": title,
                    "oem_kodu": oem,
                    "fiyat": price,
                    "uyumlu_modeller": models,
                    "kaynak": "akbayrenault.com",
                }
        except Exception:
            stats["basarisiz"] += 1
            return None


async def main():
    print("=" * 60)
    print(" [2/2] ASENKRON URUN VERI CEKME ISLEMI BASLADI")
    print("=" * 60)

    try:
        with open("urls.json", "r", encoding="utf-8") as f:
            urls = json.load(f)
            if not urls:
                print("[!] 'urls.json' dosyası boş!")
                sys.exit(1)
    except FileNotFoundError:
        print(
            "[!] 'urls.json' dosyası bulunamadı! Önce collector.py çalıştırılmalı."
        )
        sys.exit(1)
    except json.JSONDecodeError:
        print("[!] 'urls.json' dosyası bozuk veya geçersiz JSON formatında.")
        sys.exit(1)

    total_urls = len(urls)
    print(f"[+] İşlenecek Toplam Ürün Sayısı: {total_urls}")
    print(f"[+] Eşzamanlı İstek Limiti      : {CONCURRENCY_LIMIT}\n")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    async with aiohttp.ClientSession(headers=headers) as session:
        tasks = [fetch_product_data(session, url) for url in urls]

        results = await tqdm_asyncio.gather(
            *tasks, desc="Ürünler İndiriliyor", unit="ürün"
        )

        scraped_data = [r for r in results if r is not None]

    with open("all_products_final.json", "w", encoding="utf-8") as f:
        json.dump(scraped_data, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print(" [✓] ISLEM TAMAMLANDI - OZHET RAPOR")
    print(f" [+] Hedeflenen Toplam Ürün Sayısı : {total_urls}")
    print(f" [+] Başarıyla Çekilen Ürün Miktarı: {len(scraped_data)}")
    print(f" [+] Hatalı / Atlanan Ürün Miktarı : {stats['basarisiz']}")
    print(" [+] Kaydedilen Veri Dosyası       : all_products_final.json")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())