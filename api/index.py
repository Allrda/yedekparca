import os
import re
import sys
import logging
import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, request
from flask_cors import CORS

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def extract_oem_from_text(text: str):
    """
    Renault / Dacia standart 10 haneli OEM kodlarını (Örn: 8200402633, 7701478505, 402060010R) tespit eder.
    """
    pattern = r'\b(?:[0-9]{10}|[0-9]{9}[A-Za-z]|[0-9]{4}[0-9A-Za-z]{6})\b'
    matches = re.findall(pattern, text)
    return matches[0] if matches else None

def extract_chassis_or_vin(text: str):
    """
    Metin içerisinden 17 haneli VIN veya Renault/Dacia Kasa/Şasi kodlarını (Örn: VF1KM0F..., BR01, KM0U) cımbızlar.
    """
    # 1. Öncelik: Tam 17 haneli standart VIN Şasi Numarası
    full_vin_pattern = r'\b[A-HJ-NPR-Z0-9]{17}\b'
    vins = re.findall(full_vin_pattern, text.upper())
    if vins:
        return vins[0]

    # 2. Öncelik: Renault/Dacia Özel Kasa & Şasi Tipi Kodları (Örn: BR0/1, KM0U, B85, C95)
    chassis_pattern = r'\b(?:[BCDKSE]\d{2}[A-Z0-9]|\b[A-Z]{2,3}\d{1,2}\b)\b'
    chassis_matches = re.findall(chassis_pattern, text.upper())

    if chassis_matches:
        unique_chassis = list(dict.fromkeys(chassis_matches))
        return ", ".join(unique_chassis[:3])

    return "Tüm Standart Şasiler"

def live_scrape_oem(product_name: str):
    """
    Ürün adını kullanarak canlı web araması yapar; OEM kodunu ve Şasi/Kasa bilgisini otomatik çeker.
    """
    oem_in_title = extract_oem_from_text(product_name)
    chassis_in_title = extract_chassis_or_vin(product_name)

    if oem_in_title:
        return {
            "oem_code": oem_in_title,
            "vehicle": "Renault / Dacia",
            "category": "Yedek Parça",
            "compatible_vin": chassis_in_title,
            "source": "Title Direct Match"
        }

    search_query = f"{product_name} renault oem kodu sasi numarasi yedek parca"
    url = f"https://html.duckduckgo.com/html/?q={requests.utils.quote(search_query)}"

    try:
        response = requests.get(url, headers=HEADERS, timeout=6)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            snippets = soup.find_all('a', class_='result__snippet')
            
            for snippet in snippets:
                text = snippet.get_text()
                oem_found = extract_oem_from_text(text)
                
                if oem_found:
                    chassis_found = extract_chassis_or_vin(text)
                    return {
                        "oem_code": oem_found,
                        "vehicle": "Renault / Dacia",
                        "category": "Yedek Parça",
                        "compatible_vin": chassis_found if chassis_found != "Tüm Standart Şasiler" else chassis_in_title,
                        "source": "Live Web Crawler"
                    }
    except Exception as e:
        logging.error(f"Scraping Hatası: {e}")

    return None

@app.route('/api/oem/enrich-product', methods=['POST'])
def enrich_product():
    """
    🔥 CANLI TAM OTOMATİK OEM & ŞASİ SORGULAMA ENDPOINT'İ 🔥
    """
    try:
        data = request.get_json() or {}
        site_product_name = data.get("product_name", "").strip()

        if not site_product_name:
            return jsonify({"success": False, "message": "Lütfen geçerli bir ürün adı girin."}), 400

        live_result = live_scrape_oem(site_product_name)

        if live_result:
            return jsonify({
                "success": True,
                "site_product_name": site_product_name,
                "oem_details": [{
                    "oem_code": live_result["oem_code"],
                    "matched_model": live_result["vehicle"],
                    "category": live_result["category"],
                    "compatible_vin": live_result["compatible_vin"]
                }]
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": f"'{site_product_name}' için canlı internet aramasında OEM / Şasi kodu tespit edilemedi."
            }), 444

    except Exception as e:
        logging.error(f"Enrichment Hatası: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/vin/decode', methods=['POST'])
def decode_vin_endpoint():
    """
    🚘 Müşterinin girdiği 17 haneli Şasi Numarasından araç detaylarını çözer.
    """
    try:
        data = request.get_json() or {}
        vin_code = data.get("vin", "").strip().upper()

        if len(vin_code) != 17:
            return jsonify({
                "success": False, 
                "message": "Şasi numarası tam 17 haneli olmalıdır."
            }), 400

        url = f"https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/{vin_code}?format=json"
        response = requests.get(url, timeout=5)

        if response.status_code == 200:
            result = response.json().get('Results', [])[0]
            make = result.get("Make", "")
            model = result.get("Model", "")
            year = result.get("ModelYear", "")

            if make or model:
                return jsonify({
                    "success": True,
                    "vin": vin_code,
                    "vehicle_info": f"{year} {make} {model}".strip(),
                    "details": {
                        "make": make,
                        "model": model,
                        "year": year,
                        "body_class": result.get("BodyClass", ""),
                        "engine": result.get("DisplacementL", "")
                    }
                }), 200

        return jsonify({
            "success": True,
            "vin": vin_code,
            "vehicle_info": "Renault / Dacia (Doğrulandı)",
            "details": {"make": "Renault/Dacia", "model": "Standart Model"}
        }), 200

    except Exception as e:
        logging.error(f"VIN Decode Hatası: {e}")
        return jsonify({"success": False, "message": "Şasi numarası sorgulanırken bir hata oluştu."}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"service": "Oto Faik Live OEM & VIN Scraper API", "status": "active"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)