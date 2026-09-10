import os
import re
import time
import logging
import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, firestore
from local_scraper import get_random_headers

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

CREDENTIALS_PATH = "serviceAccountKey.json"

def init_firebase_app():
    if not firebase_admin._apps:
        if not os.path.exists(CREDENTIALS_PATH):
            raise FileNotFoundError(f"'{CREDENTIALS_PATH}' yetki dosyası bulunamadı!")
        cred = credentials.Certificate(CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
    return firestore.client()

def check_and_update_item(doc):
    """Firestore dokümanını canlı web sayfasındaki fiyatla karşılaştırır."""
    data = doc.to_dict()
    source_url = data.get("kaynak_url")

    if not source_url:
        return False

    try:
        response = requests.get(source_url, headers=get_random_headers(), timeout=10)
        if response.status_code != 200:
            logging.warning(f"Sayfa çekilemedi (HTTP {response.status_code}): {source_url}")
            return False

        soup = BeautifulSoup(response.text, "html.parser")
        price_tag = soup.find(class_=re.compile(r'price|fiyat', re.I))
        current_price = price_tag.get_text(strip=True) if price_tag else "0.00 TL"

        if current_price != data.get("fiyat"):
            logging.info(f"Fiyat Değişikliği Tespiti [{doc.id}]: {data.get('fiyat')} -> {current_price}")
            doc.reference.update({
                "fiyat": current_price,
                "son_guncelleme": time.strftime("%Y-%m-%d %H:%M:%S")
            })
            return True
        else:
            doc.reference.update({
                "son_guncelleme": time.strftime("%Y-%m-%d %H:%M:%S")
            })
            logging.info(f"Kayıt Güncel [{doc.id}]: {current_price}")
            return False

    except Exception as e:
        logging.error(f"Güncelleme Hatası [{doc.id}]: {e}")
        return False

def run_incremental_update(limit=20):
    """En eski tarihli N adet parçayı sırayla kontrol eder."""
    try:
        db = init_firebase_app()
    except Exception as e:
        logging.error(f"Firebase hatası: {e}")
        return

    logging.info(f"Artımlı güncelleme başlatılıyor (Limit: {limit} kayıt)...")
    docs = list(db.collection("parcalar").order_by("son_guncelleme").limit(limit).stream())

    if not docs:
        logging.warning("Kontrol edilecek kayıt bulunamadı.")
        return

    updated_count = 0
    for idx, doc in enumerate(docs, start=1):
        logging.info(f"[{idx}/{len(docs)}] Kontrol ediliyor: {doc.id}")
        if check_and_update_item(doc):
            updated_count += 1
        time.sleep(5)

    logging.info(f"Artımlı güncelleme bitti. {len(docs)} kayıttan {updated_count} tanesi güncellendi.")

if __name__ == "__main__":
    run_incremental_update(limit=10)