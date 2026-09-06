import os
import json
import logging
import firebase_admin
from firebase_admin import credentials, firestore

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

CREDENTIALS_PATH = "serviceAccountKey.json"
DATA_PATH = os.path.join("data", "parcalar.json")

def init_firebase_app():
    """Firebase uygulamasını tekil olarak başlatır."""
    if not firebase_admin._apps:
        if not os.path.exists(CREDENTIALS_PATH):
            raise FileNotFoundError(f"'{CREDENTIALS_PATH}' yetki dosyası bulunamadı!")
        cred = credentials.Certificate(CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
    return firestore.client()

def upload_json_to_firestore(json_file_path=DATA_PATH):
    """JSON dosyasını Firestore 'parcalar' koleksiyonuna toplu basar."""
    try:
        db = init_firebase_app()
    except Exception as e:
        logging.error(f"Firebase başlatma hatası: {e}")
        return

    if not os.path.exists(json_file_path):
        logging.error(f"Aktarılacak JSON dosyası bulunamadı: {json_file_path}")
        return

    with open(json_file_path, "r", encoding="utf-8") as f:
        items = json.load(f)

    if not items:
        logging.warning("JSON dosyası boş, aktarılacak kayıt yok.")
        return

    logging.info(f"Toplam {len(items)} kayıt Firestore'a aktarılıyor...")

    collection_ref = db.collection("parcalar")
    batch = db.batch()
    batch_counter = 0
    total_uploaded = 0

    for item in items:
        oem_kodu = item.get("oem_kodu")
        doc_id = oem_kodu if oem_kodu and oem_kodu != "OEM_BULUNAMADI" else collection_ref.document().id

        doc_ref = collection_ref.document(doc_id)
        batch.set(doc_ref, item, merge=True)
        batch_counter += 1

        if batch_counter >= 400:
            batch.commit()
            total_uploaded += batch_counter
            logging.info(f"{total_uploaded} kayıt başarıyla aktarıldı (Batch Commit).")
            batch = db.batch()
            batch_counter = 0

    if batch_counter > 0:
        batch.commit()
        total_uploaded += batch_counter
        logging.info(f"Aktarım tamamlandı! Toplam {total_uploaded} kayıt Firestore'a yüklendi.")

if __name__ == "__main__":
    upload_json_to_firestore()