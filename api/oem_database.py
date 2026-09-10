# oem_database.py
import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'renault_dacia_oem.db')

# Bağlantıyı açarken:
conn = sqlite3.connect(DB_PATH)

RENAULT_DACIA_OEM_MASTER = {
    # 🚗 RENAULT CLIO SERİSİ
# oem_database.py içindeki CLIO_1 kısmında güncelle:
    "CLIO_1": [
        {"oem_code": "7700842114", "part_name": "Far Sinyal Kumanda Kolu Korna", "category": "Elektrik / Aydınlatma", "engine": "1.2 / 1.4 / Europa"},
        {"oem_code": "7701040001", "part_name": "Hava Filtresi", "category": "Filtre", "engine": "1.2 Energy"}

    ],
    "CLIO_2": [
        {"oem_code": "7701206379", "part_name": "Ön Fren Diski Seti", "category": "Fren", "engine": "1.2 / 1.4 / 1.5 dCi"},
        {"oem_code": "8200431051", "part_name": "Hava Filtresi", "category": "Filtre", "engine": "1.5 dCi K9K"},
        {"oem_code": "8200431075", "part_name": "Ateşleme Bobini", "category": "Ateşleme", "engine": "1.4 16V / 1.6 16V K4M"}
    ],
    "CLIO_3": [
        {"oem_code": "7701208422", "part_name": "Ön Fren Balatası", "category": "Fren", "engine": "1.2 16V / 1.5 dCi"},
        {"oem_code": "8200371661", "part_name": "Polen Filtresi", "category": "Filtre", "engine": "Tüm Motorlar"}
    ],
    "CLIO_4": [
        {"oem_code": "410605536R", "part_name": "Ön Fren Balatası", "category": "Fren", "engine": "0.9 TCe / 1.2 / 1.5 dCi"},
        {"oem_code": "165467674R", "part_name": "Hava Filtresi", "category": "Filtre", "engine": "0.9 TCe / 1.5 dCi"},
        {"oem_code": "152089599R", "part_name": "Yağ Filtresi", "category": "Filtre", "engine": "0.9 TCe / 1.5 dCi"}
    ],
    "CLIO_5": [
        {"oem_code": "410602581R", "part_name": "Ön Fren Balatası Seti", "category": "Fren", "engine": "1.0 SCe / 1.0 TCe / 1.5 Blue dCi"},
        {"oem_code": "165468296R", "part_name": "Hava Filtresi", "category": "Filtre", "engine": "1.0 TCe H4D"},
        {"oem_code": "272773974R", "part_name": "Karbonlu Polen Filtresi", "category": "Filtre", "engine": "Tüm Motorlar"}
    ],

    # 🚗 RENAULT MEGANE SERİSİ
    "MEGANE_2": [
        {"oem_code": "7701207034", "part_name": "Ön Fren Diski", "category": "Fren", "engine": "1.6 16V / 1.5 dCi"},
        {"oem_code": "8200431075", "part_name": "Ateşleme Bobini", "category": "Ateşleme", "engine": "1.6 16V K4M"}
    ],
    "MEGANE_3": [
        {"oem_code": "402060010R", "part_name": "Ön Fren Diski (280mm)", "category": "Fren", "engine": "1.5 dCi / 1.6 16V"},
        {"oem_code": "8200820859", "part_name": "Mazot Filtresi", "category": "Filtre", "engine": "1.5 dCi K9K"}
    ],
    "MEGANE_4": [
        {"oem_code": "402064151R", "part_name": "Ön Fren Diski", "category": "Fren", "engine": "1.2 TCe / 1.3 TCe / 1.5 dCi"},
        {"oem_code": "165469903R", "part_name": "Hava Filtresi", "category": "Filtre", "engine": "1.3 TCe / 1.5 Blue dCi"}
    ],

    # 🚗 RENAULT KADJAR & DİĞERLERİ
    "KADJAR": [
        {"oem_code": "402064151R", "part_name": "Ön Fren Diski (296mm)", "category": "Fren", "engine": "1.2 TCe / 1.5 dCi / 1.6 dCi"},
        {"oem_code": "410604076R", "part_name": "Ön Fren Balata Takımı", "category": "Fren", "engine": "Tüm Motorlar"},
        {"oem_code": "165469903R", "part_name": "Hava Filtresi Kutulu", "category": "Filtre", "engine": "1.5 Blue dCi / 1.3 TCe"}
    ],
    "FLUENCE": [
        {"oem_code": "402060010R", "part_name": "Ön Fren Diski", "category": "Fren", "engine": "1.5 dCi / 1.6 16V"}
    ],
    "DUSTER": [
        {"oem_code": "402063149R", "part_name": "Ön Fren Diski 4x4 / 4x2", "category": "Fren", "engine": "1.5 dCi / 1.3 TCe"}
    ]
}