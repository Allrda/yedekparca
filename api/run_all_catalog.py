import time
from akbay_style_scraper import RenaultDaciaCatalogScraper
from database_manager import AkbayCatalogDB

def build_full_renault_dacia_database():
    scraper = RenaultDaciaCatalogScraper()
    db = AkbayCatalogDB()

    print("\n=======================================================")
    print("🚀 RENAULT & DACIA TÜM AÇIK KATALOG İÇERİK TARAMASI BAŞLADI")
    print("=======================================================\n")

    for brand, models in scraper.TARGET_MODELS.items():
        print(f"\n--- 🔰 {brand} AÇIK KATALOGLARI İŞLENİYOR ---")
        for model in models:
            # 1. Modeli tara (Örn: KADJAR, CLIO_5, DUSTER_2)
            parts = scraper.scrape_model_catalog(brand, model)
            
            # 2. Veritabanına yaz
            if parts:
                db.save_parts_bulk(parts)
            
            # Sunucuyu yormamak için kısa mola
            time.sleep(1)

    print("\n✅ TÜM RENAULT VE DACIA KATALOĞU AKBAY OTO MİMARİSİNDE BAŞARIYLA İNDİRLDİ VE KAYDEDİLDİ!")

if __name__ == "__main__":
    build_full_renault_dacia_database()