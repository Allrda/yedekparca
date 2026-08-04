import sqlite3
import json
import logging
from typing import List, Dict, Optional

class CatalogDatabase:
    """
    SQLite tabanlı Önbellekleme (Caching) ve Veri Depolama Sınıfı.
    """

    def __init__(self, db_path: str = "oem_catalog_cache.db"):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        """Veritabanı tablolarını (Schema) oluşturur."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # VIN Önbellek Tablosu
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS vin_cache (
                    vin TEXT PRIMARY KEY,
                    parts_json TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Kolay erişim için Indeks
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_vin ON vin_cache(vin)")
            conn.commit()

    def get_cached_vin(self, vin: str) -> Optional[List[Dict[str, str]]]:
        """
        Lokal veritabanında saklanan VIN kaydını getirir.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT parts_json FROM vin_cache WHERE vin = ?", (vin.upper(),))
            row = cursor.fetchone()
            
            if row:
                logging.info(f"✅ Cache HIT: VIN={vin} verisi veritabanından çekildi.")
                return json.loads(row[0])
            
            logging.info(f"❌ Cache MISS: VIN={vin} verisi veritabanında bulunamadı.")
            return None

    def save_vin_cache(self, vin: str, parts: List[Dict[str, str]]):
        """
        Dış kaynaktan çekilen OEM parçalarını lokal veritabanına kaydeder.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            parts_json = json.dumps(parts, ensure_ascii=False)
            
            cursor.execute("""
                INSERT OR REPLACE INTO vin_cache (vin, parts_json) 
                VALUES (?, ?)
            """, (vin.upper(), parts_json))
            
            conn.commit()
            logging.info(f"💾 VIN={vin} verisi yerel veritabanına kaydedildi.")