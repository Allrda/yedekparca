# models.py
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class CarModel:
    brand: str          # RENAULT / DACIA
    model_name: str     # KADJAR, MEGANE 4, CLIO 5, DUSTER 2
    generation: str    # Mk1, Mk2, Ph1, Ph2
    engine_code: str    # 1.5 dCi K9K, 1.3 TCe H5H, 0.9 TCe H4B

@dataclass
class OEMPart:
    oem_code: str       # Örn: 402064151R
    part_name: str      # Örn: Ön Fren Diski 296mm
    category: str       # Fren Sistemi, Kaporta, Aydınlatma, Motor Aksamı
    sub_category: str   # Disklik & Balata, Farlar, Sensörler
    brand_origin: str   # MAİS (Orijinal), MOTRIO, BOSCH, VALEO
    compatibility: List[CarModel] # Hangi araçlara uyar?