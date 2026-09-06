import os
import sys
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS

# Vercel modül import çakışmalarını önlemek için api klasörünü yola ekliyoruz
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from storage import OEMDataStorage
from oem_database import RENAULT_DACIA_OEM_MASTER

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

# ⚠️ Vercel Serverless ortamı için SQLite yolunu dinamik hesaplıyoruz
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "renault_dacia_oem.db")

# SQLite Veritabanı Bağlantısı
storage = OEMDataStorage(DB_PATH)

def find_oem_matches(product_name: str):
    """
    Siteden gelen düz ürün adını (örn: "R19 Europa Far Sinyal Kumanda Kolu") 
    hem SQLite veritabanından hem de OEM Master kataloğundan tarayarak eşleştirir.
    """
    clean_name = product_name.lower().strip()
    matched_results = []
    seen_oem_codes = set()

    # 1. Adım: oem_database.py Kataloğunu Tara
    for model, parts in RENAULT_DACIA_OEM_MASTER.items():
        model_readable = model.replace("_", " ")
        for part in parts:
            oem = part["oem_code"]
            part_name_lower = part["part_name"].lower()
            
            # Siteden gelen isimdeki anahtar kelimeler kataloğa uyuyor mu?
            is_match = False
            
            # Kelimeleri bölüp çapraz kontrol yapalım
            name_words = [w for w in clean_name.split() if len(w) > 2]
            matched_word_count = sum(1 for word in name_words if word in part_name_lower or word in model_readable.lower())
            
            if matched_word_count >= 1 or oem.lower() in clean_name:
                is_match = True

            if is_match and oem not in seen_oem_codes:
                seen_oem_codes.add(oem)
                matched_results.append({
                    "oem_code": oem,
                    "matched_model": model_readable,
                    "engine_compatibility": part.get("engine", "Tüm Motorlar"),
                    "category": part.get("category", "Genel")
                })

    return matched_results

@app.route('/api/oem/enrich-product', methods=['POST'])
def enrich_product():
    """
    🔥 SİTENİZİN ÇAĞIRACAĞI ANA ENDPOINT 🔥
    """
    try:
        data = request.get_json()
        if not data or "product_name" not in data:
            return jsonify({"success": False, "message": "Ürün ismi 'product_name' olarak gönderilmedi."}), 400

        site_product_name = data["product_name"]
        oem_matches = find_oem_matches(site_product_name)

        return jsonify({
            "success": True,
            "site_product_name": site_product_name,
            "total_matched_oem": len(oem_matches),
            "oem_details": oem_matches
        }), 200

    except Exception as e:
        logging.error(f"Enrichment Hatası: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"service": "Oto Faik OEM API", "status": "active"}), 200

# Vercel Serverless için 'app' nesnesinin dışarıda bulunması yeterlidir.
if __name__ == "__main__":
    print("\n🚀 Oto Faik Akıllı OEM Eşleştirici Servisi Başlatıldı: http://localhost:5000\n")
    app.run(host='0.0.0.0', port=5000, debug=True)