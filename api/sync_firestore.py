from http.server import BaseHTTPRequestHandler
import os
import sqlite3
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Vercel Serverless Function Giriş Noktası
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            BASE_DIR = os.path.dirname(os.path.abspath(__file__))
            DB_PATH = os.path.join(BASE_DIR, 'renault_dacia_oem.db')

            if not firebase_admin._apps:
                # Vercel Environment Variables üzerinden veya key ile başlatma
                cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
                if cred_json:
                    cred = credentials.Certificate(json.loads(cred_json))
                    firebase_admin.initialize_app(cred)
                else:
                    firebase_admin.initialize_app()

            db = firestore.client()

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            query = """
                SELECT 
                    p.oem_code, p.brand, p.part_name, p.category, 
                    GROUP_CONCAT(m.model_or_vin, ',') as compatible_vehicles
                FROM oem_parts p
                LEFT JOIN vehicle_oem_mapping m ON p.oem_code = m.oem_code
                GROUP BY p.oem_code
            """
            cursor.execute(query)
            rows = cursor.fetchall()

            batch = db.batch()
            count = 0

            for row in rows:
                oem_code, brand, part_name, category, vehicles_str = row
                vehicles_list = vehicles_str.split(',') if vehicles_str else []
                raw_keywords = f"{part_name} {oem_code} {brand} {category or ''} {' '.join(vehicles_list)}".lower().split()
                search_keywords = list(set([k for k in raw_keywords if len(k) > 1]))

                doc_ref = db.collection('oem_database').document(oem_code)
                doc_data = {
                    'oem_code': oem_code,
                    'brand': brand,
                    'product_name': part_name,
                    'category': category or 'Genel',
                    'vehicle_model': vehicles_list[0] if vehicles_list else 'Genel',
                    'compatible_vins': vehicles_list,
                    'search_keywords': search_keywords
                }
                batch.set(doc_ref, doc_data)
                count += 1
                if count % 400 == 0:
                    batch.commit()
                    batch = db.batch()

            batch.commit()

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "count": count}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())