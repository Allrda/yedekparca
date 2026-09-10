import json
import logging
from scraper import CatalogScraper
from database import CatalogDatabase
from sync_engine import StockSyncEngine

# Örnek Yerel Stok Veritabanı Simülasyonu (SQL/Excel Veriniz)
MOCK_LOCAL_INVENTORY = {
    "402060010R": {"qty": 12, "price": 2450.00},
    "8200431075": {"qty": 5, "price": 850.50},
    "152090000R": {"qty": 45, "price": 320.00},
    # 7701477028 stokta yok (qty: 0)
}

class OEMServiceOrchestrator:
    def __init__(self):
        self.scraper = CatalogScraper()
        self.db = CatalogDatabase()
        self.sync_engine = StockSyncEngine(local_inventory=MOCK_LOCAL_INVENTORY)

    def process_vin_request(self, vin: str) -> str:
        """
        Arama Akışı:
        1. Önce Veritabanına Bak.
        2. Yoksa Scraper ile Çek ve Kaydet.
        3. Yerel Stok ile Eşleştirip JSON Döndür.
        """
        clean_vin = vin.strip().upper()
        
        # Adım 1: Cache Kontrolü
        catalog_parts = self.db.get_cached_vin(clean_vin)

        # Adım 2: Cache'te yoksa Scraper Çalıştır
        if not catalog_parts:
            catalog_parts = self.scraper.fetch_parts_by_vin(clean_vin)
            if catalog_parts:
                self.db.save_vin_cache(clean_vin, catalog_parts)

        # Adım 3: Stok/Fiyat Eşleştirme (Sync Engine)
        result_data = self.sync_engine.match_and_build_output(clean_vin, catalog_parts)

        # JSON çıktısı üret
        return json.dumps(result_data, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    orchestrator = OEMServiceOrchestrator()

    test_vin = "VF1BZ000000000000"
    
    print("\n--- 🚀 İLK SORGULAMA (Cache BOŞ - Scraper Çalışacak) ---")
    response_1 = orchestrator.process_vin_request(test_vin)
    print(response_1)

    print("\n--- ⚡ İKİNCİ SORGULAMA (Cache DOLU - Doğrudan DB'den Gelecek) ---")
    response_2 = orchestrator.process_vin_request(test_vin)
    print(response_2)