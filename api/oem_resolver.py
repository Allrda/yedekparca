import re
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Katalogdan çekilen Renault & Dacia OEM Veri Bankası (Sadece Kodlar ve Tanımlar)
OEM_MASTER_CATALOG = [
    {
        "oem_code": "7700842114",
        "keywords": ["sinyal", "far", "kumanda kolu", "korna", "r19", "europa", "clio 1"],
        "compatible_models": ["R19 EUROPA", "CLIO 1"]
    },
    {
        "oem_code": "8200431075",
        "keywords": ["bobin", "ateşleme", "1.4 16v", "1.6 16v", "megane 2", "clio 2"],
        "compatible_models": ["CLIO 2", "MEGANE 2", "KANGOO 1"]
    },
    {
        "oem_code": "8200431051",
        "keywords": ["hava filtresi", "1.5 dci", "k9k", "clio 2", "kangoo"],
        "compatible_models": ["CLIO 2", "KANGOO 2", "LOGAN 1"]
    },
    {
        "oem_code": "402064151R",
        "keywords": ["fren diski", "ön disk", "296mm", "kadjar", "megane 4"],
        "compatible_models": ["MEGANE 4", "KADJAR"]
    }
]

def find_oem_by_product_name(product_name):
    """
    Siteden gelen ürün ismini analiz edip eşleşen OEM kodlarını bulur.
    """
    name_lower = product_name.lower()
    matched_oems = []

    for item in OEM_MASTER_CATALOG:
        # İsimdeki anahtar kelimelerin eşleşme oranına bakar
        matches = [kw for kw in item["keywords"] if kw in name_lower]
        if len(matches) >= 2 or any(code in name_lower for code in [item["oem_code"].lower()]):
            matched_oems.append({
                "oem_code": item["oem_code"],
                "compatible_models": item["compatible_models"]
            })
            
    return matched_oems

@app.route('/api/oem/enrich-product', methods=['POST'])
def enrich_product():
    """
    Web Sitenizin Çağıracağı Endpoint:
    İstek: { "site_product_name": "R19 Europa Far Sinyal Kumanda Kolu" }
    """
    data = request.get_json()
    product_name = data.get("product_name", "")

    if not product_name:
        return jsonify({"success": False, "message": "Ürün ismi girilmedi"}), 400

    oem_matches = find_oem_by_product_name(product_name)

    return jsonify({
        "success": True,
        "site_product_name": product_name, # İsim %100 SENİN SİTENDEN GELEN İSİM
        "matched_oem_count": len(oem_matches),
        "oem_details": oem_matches
    }), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)