import json
import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_PATH = os.path.normpath(os.path.join(BASE_DIR, '../../SCRAPPPER/all_products_final.json'))
OUTPUT_PATH = os.path.join(BASE_DIR, '../src/data/scrapedProducts.json')

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

def parse_price(price_str):
    if not price_str:
        return 1.0
    cleaned = re.sub(r'[^\d,\.]', '', price_str)
    if not cleaned:
        return 1.0
    try:
        if ',' in cleaned and '.' in cleaned:
            if cleaned.find('.') < cleaned.find(','):
                cleaned = cleaned.replace('.', '').replace(',', '.')
            else:
                cleaned = cleaned.replace(',', '')
        elif ',' in cleaned:
            cleaned = cleaned.replace(',', '.')
        
        val = float(cleaned)
        return val if val > 0 else 1.0
    except:
        return 1.0

def extract_oem(item):
    oem = item.get('oem_kodu', '')
    if oem and oem.strip():
        return oem.strip()
    
    title = item.get('baslik', '')
    match = re.search(r'\b([0-9A-Z]{8,12})\b', title)
    if match:
        return match.group(1)
    
    url = item.get('url', '')
    parts = url.split('-')
    if parts and parts[-1].isalnum() and len(parts[-1]) >= 6:
        return parts[-1].upper()
    
    return f"OEM{abs(hash(url)) % 10000000}"

def process_data():
    if not os.path.exists(INPUT_PATH):
        print(f"Input file not found: {INPUT_PATH}")
        return

    print(f"Reading {INPUT_PATH}...")
    with open(INPUT_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Processing {len(data)} scraped items...")
    processed = []
    
    categories = ['Motor', 'Fren Sistemi', 'Bakım', 'Süspansiyon', 'Aydınlatma & Kaporta', 'Ateşleme & Elektrik']
    vehicles = ['Clio 4', 'Clio 5', 'Megane 3', 'Megane 4', 'Duster', 'Fluence', 'Symbol', 'Sandero', 'Captur']

    for idx, item in enumerate(data):
        title = item.get('baslik', 'Renault Yedek Parça')
        oem = extract_oem(item)
        price = parse_price(item.get('fiyat'))
        if price <= 1.0:
            price = 1.0

        title_lower = title.lower()
        cat = 'Genel Bakım'
        if 'fren' in title_lower or 'balata' in title_lower or 'disk' in title_lower:
            cat = 'Fren Sistemi'
        elif 'motor' in title_lower or 'triger' in title_lower or 'filtre' in title_lower or 'piston' in title_lower:
            cat = 'Motor & Filtre'
        elif 'buji' in title_lower or 'bobin' in title_lower or 'marş' in title_lower or 'alternatör' in title_lower:
            cat = 'Ateşleme & Elektrik'
        elif 'amortisör' in title_lower or 'salıncak' in title_lower or 'rot' in title_lower:
            cat = 'Süspansiyon & Direksiyon'
        elif 'far' in title_lower or 'tampon' in title_lower or 'ayna' in title_lower or 'stop' in title_lower:
            cat = 'Aydınlatma & Kaporta'

        veh = 'Renault'
        for v in vehicles:
            if v.lower() in title_lower:
                veh = v
                break

        prod = {
            "id": f"SCRAP_{idx}_{oem}",
            "oem": oem,
            "oemCode": oem,
            "name": title,
            "category": cat,
            "vehicle": veh,
            "price": price,
            "stock": 25,
            "image": "https://via.placeholder.com/150",
            "compatibles": item.get('uyumlu_modeller', [veh])
        }
        processed.append(prod)

    print(f"Saving {len(processed)} products to {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(processed, f, ensure_ascii=False, indent=2)
    print("Conversion complete!")

if __name__ == '__main__':
    process_data()
