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

def live_scrape_oem(product_name: str):
    """
    Ürün adını kullanarak canlı web araması / scraping yapar ve gerçek OEM kodunu & detayları çeker.
    """
    # 1. Ön kontrol: Zaten ürün adı içinde 10 haneli OEM kodu var mı? (Örn: Megane 2 Jant Kapağı 8200402633)
    oem_in_title = extract_oem_from_text(product_name)
    if oem_in_title:
        return {
            "oem_code": oem_in_title,
            "vehicle": "Renault / Dacia",
            "category": "Yedek Parça",
            "source": "Title Direct Match"
        }

    # 2. Canlı Scraper: DuckDuckGo / Google HTML Scrape (API Key bağımsız)
    search_query = f"{product_name} renault oem kodu yedek parça"
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
                    return {
                        "oem_code": oem_found,
                        "vehicle": "Renault / Dacia",
                        "category": "Yedek Parça",
                        "source": "Live Web Crawler"
                    }
    except Exception as e:
        logging.error(f"Scraping Hatası: {e}")

    return None

@app.route('/api/oem/enrich-product', methods=['POST'])
def enrich_product():
    """
    🔥 CANLI TAM OTOMATİK SORGULAMA ENDPOINT'İ 🔥
    """
    try:
        data = request.get_json() or {}
        site_product_name = data.get("product_name", "").strip()

        if not site_product_name:
            return jsonify({"success": False, "message": "Lütfen geçerli bir ürün adı girin."}), 400

        # Canlı Arama/Scrape Mantığı Tetikleniyor
        live_result = live_scrape_oem(site_product_name)

        if live_result:
            return jsonify({
                "success": True,
                "site_product_name": site_product_name,
                "oem_details": [{
                    "oem_code": live_result["oem_code"],
                    "matched_model": live_result["vehicle"],
                    "category": live_result["category"]
                }]
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": f"'{site_product_name}' için canlı internet aramasında OEM kodu tespit edilemedi."
            }), 444

    except Exception as e:
        logging.error(f"Enrichment Hatası: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"service": "Oto Faik Live OEM Scraper API", "status": "active"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)