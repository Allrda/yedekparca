import re
import logging
from typing import Dict, Optional

class OEMDataValidator:
    """
    Çekilen OEM verilerinin doğruluğunu ve bütünlüğünü denetleyen katı kural motoru.
    """
    
    # Renault & Dacia OEM Kod Formatları (örnek: 402060010R, 7701477028, 8200431075)
    # Genellikle 10 haneli alfanümerik veya R ile biten kodlar.
    OEM_PATTERN = re.compile(r'^[A-Z0-9]{8,12}$')

    @classmethod
    def validate_part(cls, part_data: Dict) -> bool:
        """
        Verinin %100 doğru ve eksiksiz olup olmadığını doğrular.
        Eğer tek bir alan bile hatalıysa False döner ve veri reddedilir.
        """
        oem = part_data.get("oem_code", "").strip().replace(" ", "").upper()
        name = part_data.get("part_name", "").strip()
        brand = part_data.get("brand", "").strip().upper()

        # 1. Marka Kontrolü
        if brand not in ["RENAULT", "DACIA"]:
            logging.error(f"❌ Doğrulama Başarısız: Geçersiz Marka '{brand}'")
            return False

        # 2. OEM Kodu Format Kontrolü
        if not oem or not cls.OEM_PATTERN.match(oem):
            logging.error(f"❌ Doğrulama Başarısız: Hatalı OEM Formatı '{oem}'")
            return False

        # 3. Parça İsmi Kontrolü (Minimum uzunluk ve anlamsız karakter filtresi)
        if not name or len(name) < 3:
            logging.error(f"❌ Doğrulama Başarısız: Eksik Parça İsmi OEM='{oem}'")
            return False

        return True