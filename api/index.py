from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/oem/enrich-product', methods=['POST'])
def enrich_product():
    data = request.get_json() or {}
    product_name = data.get('product_name', '')

    # --- Sizin OEM Sorgulama Mantığınız / Veritabanı Mantığı ---
    # Örnek mantık:
    oem_details = []
    if "far" in product_name.lower():
        oem_details.append({
            "oem_code": "7701478505",
            "matched_model": "R19 Europa",
            "category": "Elektrik / Aydınlatma"
        })

    return jsonify({
        "success": True,
        "oem_details": oem_details
    })

# Vercel için 'app' değişkeninin dışarıda olması yeterlidir