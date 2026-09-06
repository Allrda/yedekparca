import json
import os
import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, '../src/data/scrapedProducts.json')
CRED_PATH = r"C:\Users\BUYUKSEHIR\Desktop\oto faik tüm arşiv\oto_faik_scraper\serviceAccountKey.json"

if os.path.exists(CRED_PATH):
    print(f"Using Firebase credentials from: {CRED_PATH}")
    cred = credentials.Certificate(CRED_PATH)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
else:
    print("Warning: serviceAccountKey.json not found. Attempting default initialization...")
    if not firebase_admin._apps:
        firebase_admin.initialize_app()

db = firestore.client()

def push_json_to_firestore():
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found!")
        return

    print(f"Reading {JSON_PATH}...")
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"Total {len(products)} products found in scrapedProducts.json. Uploading to Firestore 'products' collection...")

    batch = db.batch()
    count = 0
    total_uploaded = 0

    for prod in products:
        doc_id = str(prod.get('id') or prod.get('oem') or total_uploaded)
        doc_ref = db.collection('products').document(doc_id)
        
        batch.set(doc_ref, prod)
        count += 1
        total_uploaded += 1

        if count >= 400:
            batch.commit()
            batch = db.batch()
            print(f"Uploaded {total_uploaded} / {len(products)} products...")
            count = 0

    if count > 0:
        batch.commit()

    print(f"Successfully uploaded all {total_uploaded} products to Firestore 'products' collection!")

if __name__ == '__main__':
    push_json_to_firestore()
