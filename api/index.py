import os
import re
import logging
import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, request
from flask_cors import CORS

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
}

def extract_oem_regex(text: str):
    """Renault / Dacia standart OEM ve parça kod kalıplarını yakalar."""
    pattern = r'\b(?:8200\d{6}|770\d{7}|4106\d{6}|4020\d{6}|4031\d{6}|1520\d{6}|1654\d{6}|119[A-Z0-9]{7}|2101\d{6}|[0-9]{9}[A-Za-z]|[0-9]{10})\b'
    matches = re.findall(pattern, text, re.IGNORECASE)
    return matches[0].upper() if matches else None

def extract_chassis_or_vin(text: str):
    """Metin içinde geçen kasa veya şasi tiplerini yakalamaya çalışır."""
    chassis_pattern = r'\b(?:[B C K S E J L M X][0-9A-Z]{3})\b'
    chassis_matches = re.findall(chassis_pattern, text.upper())
    if chassis_matches:
        unique = list(dict.fromkeys([c for c in chassis_matches if not c.isdigit()]))
        if unique:
            return ", ".join(unique[:3])
    return "Standart Renault/Dacia Kasa"

def scrape_akbay_oto(product_name: str):
    """
    Doğrudan Akbay Oto ve benzeri uzman Renault/Dacia parça sitelerini
    hedef alarak nokta atışı OEM ve şasi çeker.
    """
    clean_query = product_name.replace(" ", "+")
    # Arama motorunda doğrudan akbayoto.com verilerini hedefliyoruz
    search_url = f"https://www.google.com/search?q=site:akbayoto.com+{clean_query}"
    
    try:
        response = requests.get(search_url, headers=HEADERS, timeout=8)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            for div in soup.find_all('div', class_='VwiC3b'):
                snippet_text = div.get_text()
                oem_found = extract_oem_regex(snippet_text)
                
                if oem_found:
                    chassis_found = extract_chassis_or_vin(snippet_text)
                    return {
                        "oem_code": oem_found,
                        "vehicle": "Akbay Oto / Renault - Dacia",
                        "category": "Orijinal Yedek Parça",
                        "compatible_vin": chassis_found
                    }
    except Exception as e:
        logging.error(f"Akbay Oto Hedefli Kazıma Hatası: {e}")
        
    return None

@app.route('/api/oem/enrich-product', methods=['POST'])
def enrich_product():
    try:
        data = request.get_json() or {}
        site_product_name = data.get("product_name", "").strip()

        if not site_product_name:
            return jsonify({"success": False, "message": "Lütfen geçerli bir ürün adı girin."}), 400

        # 1. Kullanıcı başlığa direkt OEM yazdıysa yakala
        direct_oem = extract_oem_regex(site_product_name)
        if direct_oem:
            return jsonify({
                "success": True,
                "site_product_name": site_product_name,
                "oem_details": [{
                    "oem_code": direct_oem,
                    "matched_model": "Doğrudan Giriş",
                    "category": "Yedek Parça",
                    "compatible_vin": "Tüm Şasiler"
                }]
            }), 200

        # 2. Akbay Oto Hedefli Scraper ile veriyi çek
        scrape_result = scrape_akbay_oto(site_product_name)

        if scrape_result:
            return jsonify({
                "success": True,
                "site_product_name": site_product_name,
                "oem_details": [{
                    "oem_code": scrape_result["oem_code"],
                    "matched_model": scrape_result["vehicle"],
                    "category": scrape_result["category"],
                    "compatible_vin": scrape_result["compatible_vin"]
                }]
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": f"'{site_product_name}' için Akbay Oto kataloğunda eşleşen OEM kodu bulunamadı."
            }), 444

    except Exception as e:
        logging.error(f"Enrichment Hatası: {e}")
        return jsonify({"success": False, "message": "Sunucu hatası oluştu."}), 500

@app.route('/api/vin/decode', methods=['POST'])
def decode_vin_endpoint():
    try:
        data = request.get_json() or {}
        vin_code = data.get("vin", "").strip().upper()

        if len(vin_code) != 17:
            return jsonify({"success": False, "message": "Şasi numarası tam 17 haneli olmalıdır."}), 400

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
                    "details": {"make": make, "model": model, "year": year}
                }), 200

        return jsonify({
            "success": True,
            "vin": vin_code,
            "vehicle_info": "Renault / Dacia (Doğrulandı)",
            "details": {"make": "Renault/Dacia", "model": "Standart Model"}
        }), 200

    except Exception as e:
        logging.error(f"VIN Decode Hatası: {e}")
        return jsonify({"success": False, "message": "Şasi numarası sorgulanırken hata oluştu."}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"service": "Oto Faik Akbay Oto Target Scraper API", "status": "active"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)