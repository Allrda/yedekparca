import os
import logging
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

# =====================================================================
# ⚙️ CATCAR API AYARLARI
# =====================================================================
# Bu bilgileri Vercel'de Environment Variables (Çevre Değişkenleri) kısmına eklemelisin.
CATCAR_API_KEY = os.getenv("CATCAR_API_KEY", "senin_api_anahtarin_buraya_gelecek")
CATCAR_BASE_URL = os.getenv("CATCAR_BASE_URL", "https://api.catcar.info/v1") # Catcar'ın size verdiği temel endpoint

def query_catcar_for_part(search_term: str):
    """
    Ürün adını veya arama terimini doğrudan Catcar API'sine gönderir.
    Catcar'ın resmi katalog verilerinden dönen OEM kodunu ve araç bilgisini alır.
    """
    # Catcar API dökümanına göre bu endpoint değişebilir (örn: /search, /parts, /articles)
    endpoint = f"{CATCAR_BASE_URL}/search"
    
    headers = {
        "Authorization": f"Bearer {CATCAR_API_KEY}",
        "Accept": "application/json"
    }
    
    params = {
        "q": search_term,
        "language": "tr" # Türkçe sonuç dönmesi için
    }

    try:
        response = requests.get(endpoint, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Catcar'dan dönen verinin yapısına göre burası şekillenir.
            # Örnek Catcar JSON yanıtı varsayımı:
            # {"results": [{"oem_code": "8200402633", "vehicle": "Renault Megane II", "category": "Brakes"}]}
            
            results = data.get("results", [])
            if results:
                first_match = results[0]
                return {
                    "oem_code": first_match.get("oem_code", "Bilinmiyor"),
                    "vehicle": first_match.get("vehicle", "Renault / Dacia"),
                    "category": first_match.get("category", "Yedek Parça"),
                    "compatible_vin": first_match.get("chassis", "Tüm Şasiler")
                }
        else:
            logging.error(f"Catcar API Hatası: {response.status_code} - {response.text}")
            
    except Exception as e:
        logging.error(f"Catcar'a bağlanırken hata oluştu: {e}")

    return None

def query_catcar_by_vin(vin_code: str):
    """
    Müşterinin girdiği 17 haneli Şasi numarasını (VIN) Catcar API'sinden çözer
    ve aracın orijinal katalog bilgilerini getirir.
    """
    endpoint = f"{CATCAR_BASE_URL}/vin/{vin_code}"
    
    headers = {
        "Authorization": f"Bearer {CATCAR_API_KEY}",
        "Accept": "application/json"
    }

    try:
        response = requests.get(endpoint, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "make": data.get("make"),
                "model": data.get("model"),
                "year": data.get("year"),
                "chassis_code": data.get("chassis_code")
            }
        else:
            logging.error(f"Catcar VIN Hatası: {response.status_code} - {response.text}")
            
    except Exception as e:
        logging.error(f"Catcar VIN Sorgusunda hata: {e}")

    return None

# =====================================================================
# 🚀 VERCEL ENDPOINT'LERİ (Admin Paneli ile İletişim Kuran Kısımlar)
# =====================================================================

@app.route('/api/oem/enrich-product', methods=['POST'])
def enrich_product():
    """
    Panelden "Otomatik Çek" butonuna basıldığında çalışan endpoint.
    Doğrudan Catcar API'sini tetikler.
    """
    try:
        data = request.get_json() or {}
        site_product_name = data.get("product_name", "").strip()

        if not site_product_name:
            return jsonify({"success": False, "message": "Lütfen geçerli bir ürün adı girin."}), 400

        # Doğrudan Catcar'a soruyoruz (Aracı yok, kazıma yok, yalan yanlış veri yok)
        catcar_result = query_catcar_for_part(site_product_name)

        if catcar_result:
            return jsonify({
                "success": True,
                "site_product_name": site_product_name,
                "oem_details": [{
                    "oem_code": catcar_result["oem_code"],
                    "matched_model": catcar_result["vehicle"],
                    "category": catcar_result["category"],
                    "compatible_vin": catcar_result["compatible_vin"]
                }]
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": f"Catcar resmi kataloğunda '{site_product_name}' için eşleşen bir sonuç bulunamadı."
            }), 444

    except Exception as e:
        return jsonify({"success": False, "message": "Sunucu hatası oluştu."}), 500


@app.route('/api/vin/decode', methods=['POST'])
def decode_vin_endpoint():
    """
    Şasi numarasını Catcar üzerinden çözer.
    """
    try:
        data = request.get_json() or {}
        vin_code = data.get("vin", "").strip().upper()

        if len(vin_code) != 17:
            return jsonify({"success": False, "message": "Şasi numarası tam 17 haneli olmalıdır."}), 400

        catcar_vin_data = query_catcar_by_vin(vin_code)

        if catcar_vin_data:
            return jsonify({
                "success": True,
                "vin": vin_code,
                "vehicle_info": f"{catcar_vin_data['year']} {catcar_vin_data['make']} {catcar_vin_data['model']}".strip(),
                "details": {
                    "make": catcar_vin_data['make'],
                    "model": catcar_vin_data['model'],
                    "year": catcar_vin_data['year']
                }
            }), 200
        else:
            return jsonify({"success": False, "message": "Catcar sisteminde bu Şasi numarası (VIN) bulunamadı."}), 404

    except Exception as e:
        return jsonify({"success": False, "message": "Şasi numarası sorgulanırken hata oluştu."}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"service": "Oto Faik Catcar API Gateway", "status": "active"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)