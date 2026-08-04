import os
import sqlite3
import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'renault_dacia_oem.db')

# 1. Firebase Admin Bağlantısı
# Firebase Console -> Project Settings -> Service Accounts altından indirdiğin JSON dosyasının adını gir:
CRED_PATH = os.path.join(BASE_DIR, 'serviceAccountKey.json')

if os.path.exists(CRED_PATH):
    cred = credentials.Certificate(CRED_PATH)
    firebase_admin.initialize_app(cred)
else:
    # Eğer serviceAccountKey yoksa varsayılan uygulamadan dener
    firebase_admin.initialize_app()

db = firestore.client()

def push_sqlite_to_firestore():
    if not os.path.exists(DB_PATH):
        print(f"❌ Hata: {DB_PATH} dosyası bulunamadı!")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # OEM parçalarını ve araç uyumluluklarını JOIN ile çekiyoruz
    query = """
        SELECT 
            p.oem_code, 
            p.brand, 
            p.part_name, 
            p.category, 
            GROUP_CONCAT(m.model_or_vin, ',') as compatible_vehicles
        FROM oem_parts p
        LEFT JOIN vehicle_oem_mapping m ON p.oem_code = m.oem_code
        GROUP BY p.oem_code
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()

    print(f"📦 Toplam {len(rows)} OEM parçası SQLite'tan okundu. Firestore'a yükleniyor...")

    batch = db.batch()
    count = 0

    for row in rows:
        oem_code, brand, part_name, category, vehicles_str = row
        vehicles_list = vehicles_str.split(',') if vehicles_str else []

        # Otomatik Arama Anahtarları (search_keywords) Oluşturma
        # React tarafındaki 'array-contains' sorgusunun hızlı çalışması için:
        raw_keywords = f"{part_name} {oem_code} {brand} {category or ''} {' '.join(vehicles_list)}".lower().split()
        search_keywords = list(set([k for k in raw_keywords if len(k) > 1]))

        # Firestore belgesi hazırlığı
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

        # Firestore Batch limitine (500) takılmamak için 400'erli grupta bir yazıyoruz
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()
            print(f"🔄 {count} adet parça aktarıldı...")

    # Kalan son parçaları kaydet
    batch.commit()
    print(f"✅ Başarılı! Toplam {count} adet OEM kaydı Firestore 'oem_database' koleksiyonuna yüklendi.")

if __name__ == '__main__':
    push_sqlite_to_firestore()