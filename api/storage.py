import sqlite3
import logging
from typing import List, Dict, Optional
from validator import OEMDataValidator

class OEMDataStorage:
    def __init__(self, db_path: str = "renault_dacia_oem.db"):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Ana OEM Parça Tablosu
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS oem_parts (
                    oem_code TEXT PRIMARY KEY,
                    brand TEXT NOT NULL,
                    part_name TEXT NOT NULL,
                    category TEXT,
                    is_verified INTEGER DEFAULT 1,
                    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Araç Modeli/Şasi - OEM Eşleşme Tablosu
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS vehicle_oem_mapping (
                    model_or_vin TEXT NOT NULL,
                    oem_code TEXT NOT NULL,
                    PRIMARY KEY (model_or_vin, oem_code),
                    FOREIGN KEY (oem_code) REFERENCES oem_parts(oem_code)
                )
            """)
            
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_oem ON oem_parts(oem_code)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_brand ON oem_parts(brand)")
            conn.commit()

    def save_parts_atomically(self, model_or_vin: str, parts: List[Dict]) -> bool:
        """
        Gelen parçaların TAMAMI geçerliyse kaydeder.
        Eğer 1 tanesi bile hatalıysa TRANSACTION ROLLBACK yapar ve hiçbirini kaydetmez.
        """
        # Adım 1: Tüm parçaları önce doğrulamadan geçir
        for part in parts:
            if not OEMDataValidator.validate_part(part):
                logging.error(f"⛔ Kayıt İptal Edildi: {model_or_vin} paketinde hatalı veri bulundu!")
                return False

        # Adım 2: Hata yoksa atomic (bütünleşik) olarak kaydet
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            conn.execute("BEGIN TRANSACTION")

            for part in parts:
                oem = part["oem_code"].strip().upper()
                
                # Parçayı ana tabloya ekle/güncelle
                cursor.execute("""
                    INSERT INTO oem_parts (oem_code, brand, part_name, category, is_verified, last_checked)
                    VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
                    ON CONFLICT(oem_code) DO UPDATE SET
                        part_name = excluded.part_name,
                        category = excluded.category,
                        is_verified = 1,
                        last_checked = CURRENT_TIMESTAMP
                """, (oem, part["brand"].upper(), part["part_name"], part.get("category", "Genel")))

                # Araç - OEM Eşleşmesini ekle
                cursor.execute("""
                    INSERT OR IGNORE INTO vehicle_oem_mapping (model_or_vin, oem_code)
                    VALUES (?, ?)
                """, (model_or_vin.upper(), oem))

            conn.commit()
            logging.info(f"✅ %100 Doğrulanmış Kayıt: {model_or_vin} için {len(parts)} OEM depoya yazıldı.")
            return True

        except Exception as e:
            conn.rollback()
            logging.error(f"💥 Veritabanı İşlem Hatası ({model_or_vin}): {e}")
            return False
        finally:
            conn.close()

    def get_parts_by_model_or_vin(self, identifier: str) -> List[Dict]:
        """Web sitenizin okuyacağı hızlı sorgu metodu."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT p.oem_code, p.brand, p.part_name, p.category 
                FROM oem_parts p
                JOIN vehicle_oem_mapping m ON p.oem_code = m.oem_code
                WHERE m.model_or_vin = ? AND p.is_verified = 1
            """, (identifier.upper(),))
            
            rows = cursor.fetchall()
            return [
                {"oem_code": r[0], "brand": r[1], "part_name": r[2], "category": r[3]}
                for r in rows
            ]