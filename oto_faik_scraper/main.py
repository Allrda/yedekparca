import os
import sys
import json
import time
import random
import re
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import (
    Progress,
    SpinnerColumn,
    BarColumn,
    TextColumn,
    TaskProgressColumn,
    TimeRemainingColumn,
    MofNCompleteColumn
)
from rich.prompt import Prompt, Confirm

import firebase_admin
from firebase_admin import credentials, firestore

from local_scraper import (
    get_random_headers,
    extract_oem_code,
    parse_chassis_info,
    scrape_product_details,
    auto_discover_categories,
    collect_product_urls_from_category,
    AKBAY_DOMAIN,
    OTOERDEM_DOMAIN
)

console = Console()

DATA_DIR = "data"
JSON_FILE = os.path.join(DATA_DIR, "parcalar.json")
CREDENTIALS_PATH = "serviceAccountKey.json"

BANNER = r"""
  ___ _____ ___    ______ _   _ _   _ 
 / _ \_   _/ _ \   |  ___/ \ | | | / |
| | | || || | | |  | |_ / _ \| | |/| |
| |_| || || |_| |  |  _/ ___ \ | < | |
 \___/ \_/ \___/   |_|/_/   \_\_|\_\|_|
                                      
    [bold yellow]Oto Faik Yüksek Hızlı Paralel Sistem v8.0[/bold yellow]
"""

def init_firebase():
    if not firebase_admin._apps:
        if not os.path.exists(CREDENTIALS_PATH):
            console.print(f"[bold red]HATA:[/bold red] '{CREDENTIALS_PATH}' bulunamadı. Firebase özellikleri kullanılamaz.")
            return None
        cred = credentials.Certificate(CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
    return firestore.client()

def load_existing_data():
    if not os.path.exists(JSON_FILE):
        return {}

    try:
        with open(JSON_FILE, "r", encoding="utf-8") as f:
            items = json.load(f)
            db_map = {}
            for item in items:
                key = item.get("oem_kodu") if item.get("oem_kodu") != "OEM_BULUNAMADI" else item.get("kaynak_url")
                db_map[key] = item
            return db_map
    except Exception:
        return {}

def save_data_to_json(db_map):
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(list(db_map.values()), f, ensure_ascii=False, indent=4)

def show_status_panel():
    existing_map = load_existing_data()
    total_json = len(existing_map)

    table = Table(show_header=True, header_style="bold magenta", expand=True)
    table.add_column("Metrik", style="dim")
    table.add_column("Durum / Değer", justify="right")

    table.add_row("Lokal JSON Yolu", JSON_FILE)
    table.add_row("Mevcut Kayıtlı Benzersiz Parça", f"[bold green]{total_json}[/bold green] adet")
    table.add_row("Hedef Kaynaklar", "[bold yellow]akbayrenault.com + otoerdem.com[/bold yellow]")
    table.add_row("Çalışma Modu", "[bold cyan]Paralel Multi-Threading (12x Hızlı)[/bold cyan]")

    console.print(Panel(table, title="[bold blue]📊 Sistem Durum Özeti[/bold blue]", border_style="blue"))

def run_full_scrape():
    console.print("\n[bold green]🚀 YÜKSEK HIZLI ÇOKLU KAZIMA BAŞLATILIYOR...[/bold green]\n")

    db_map = load_existing_data()
    existing_urls = {v.get("kaynak_url") for v in db_map.values() if v.get("kaynak_url")}
    
    console.print(f"[bold cyan]ℹ Hafızaya Yüklenen Kayıt:[/bold cyan] {len(db_map)} Adet\n")

    session = requests.Session()
    raw_urls = []

    # 1. AKBAY RENAULT KATEGORİ VE LİNK KEŞFİ (CANLI İLERLEME ÇUBUĞUYLA)
    console.print("[bold yellow]🌐 1. Akbay Renault Kategorileri Keşfediliyor...[/bold yellow]")
    akbay_categories = auto_discover_categories(session, AKBAY_DOMAIN)
    console.print(f"  [green]✓[/green] [bold yellow]{len(akbay_categories)}[/bold yellow] adet Akbay kategorisi tespit edildi.")

    if akbay_categories:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            MofNCompleteColumn(),
            console=console
        ) as progress:
            task1 = progress.add_task("[cyan]Akbay Linkleri Toplanıyor...", total=len(akbay_categories))
            
            for cat_url in akbay_categories:
                cat_name = cat_url.split("/")[-1][:22]
                progress.update(task1, description=f"[cyan]Akbay: {cat_name}")
                p_urls = collect_product_urls_from_category(session, cat_url, AKBAY_DOMAIN)
                for u in p_urls:
                    raw_urls.append({"url": u, "site": "akbayrenault"})
                progress.advance(task1)

    # 2. OTO ERDEM KATEGORİ VE LİNK KEŞFİ (CANLI İLERLEME ÇUBUĞUYLA)
    console.print("\n[bold yellow]🌐 2. Oto Erdem Kategorileri Keşfediliyor...[/bold yellow]")
    otoerdem_categories = auto_discover_categories(session, OTOERDEM_DOMAIN)
    console.print(f"  [green]✓[/green] [bold yellow]{len(otoerdem_categories)}[/bold yellow] adet Oto Erdem kategorisi tespit edildi.")

    if otoerdem_categories:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            MofNCompleteColumn(),
            console=console
        ) as progress:
            task2 = progress.add_task("[magenta]Oto Erdem Linkleri Toplanıyor...", total=len(otoerdem_categories))
            
            for cat_url in otoerdem_categories:
                cat_name = cat_url.split("/")[-1][:22]
                progress.update(task2, description=f"[magenta]Oto Erdem: {cat_name}")
                p_urls = collect_product_urls_from_category(session, cat_url, OTOERDEM_DOMAIN)
                for u in p_urls:
                    raw_urls.append({"url": u, "site": "otoerdem"})
                progress.advance(task2)

    # Zaten Çekilmiş Olan Linkleri Önceden Filtrele
    new_urls_to_scrape = [item for item in raw_urls if item["url"] not in existing_urls]

    console.print(f"\n[bold green]🎯 Bulunan Toplam Link:[/bold green] {len(raw_urls)} Adet")
    console.print(f"[bold yellow]⚡ Sıfırdan Çekilecek Yeni Link Sayısı:[/bold yellow] [bold cyan]{len(new_urls_to_scrape)}[/bold cyan] Adet (Zaten çekilenler atlandı!)\n")

    if not new_urls_to_scrape:
        console.print("[bold green]✅ Tüm ürünler zaten veritabanında güncel![/bold green]")
        return

    # 3. PARALEL (MULTI-THREADING) KAZIMA KISMI
    added_count = 0
    MAX_WORKERS = 10

    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            MofNCompleteColumn(),
            TimeRemainingColumn(),
            console=console
        ) as progress:

            task3 = progress.add_task("[green]Paralel Çekiliyor...", total=len(new_urls_to_scrape))

            def worker(item):
                time.sleep(random.uniform(0.5, 1.5))
                s = requests.Session()
                return scrape_product_details(s, item["url"], item["site"])

            with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
                futures = {executor.submit(worker, item): item for item in new_urls_to_scrape}

                for future in as_completed(futures):
                    data = future.result()
                    if data:
                        oem = data["oem_kodu"]
                        key = oem if oem != "OEM_BULUNAMADI" else data["kaynak_url"]

                        db_map[key] = data
                        added_count += 1

                        console.print(f"  [bold green]⊕ EKLENDİ ({data['kaynak_site']}):[/bold green] {data['urun_adi'][:30]} | OEM: [yellow]{oem}[/yellow]")

                    progress.advance(task3)

                    if added_count % 50 == 0:
                        save_data_to_json(db_map)

    except KeyboardInterrupt:
        console.print("\n[bold red]⚠️ İŞLEM KULLANICI TARAFINDAN DURDURULDU (Ctrl+C)![/bold red]")
        console.print("[bold yellow]💾 Şu ana kadar çekilen tüm veriler diske kaydediliyor, lütfen bekleyin...[/bold yellow]")

    finally:
        save_data_to_json(db_map)
        console.print("\n[bold green]✅ VERİLER GÜVENLE JSON'A YAZILDI![/bold green]")
        console.print(f"  • Yeni Eklenen Parça: [bold green]{added_count}[/bold green]")
        console.print(f"  • Toplam Veritabanı Büyüklüğü: [bold cyan]{len(db_map)}[/bold cyan] Adet\n")

# --- DİĞER MODÜLLER ---
def run_firebase_import():
    db = init_firebase()
    if not db:
        return

    if not os.path.exists(JSON_FILE):
        console.print("[bold red]HATA:[/bold red] 'parcalar.json' dosyası bulunamadı!")
        return

    with open(JSON_FILE, "r", encoding="utf-8") as f:
        items = json.load(f)

    if not items:
        console.print("[yellow]Uyarı:[/yellow] 'parcalar.json' dosyası boş.")
        return

    console.print(f"\n[bold green]⚡ Toplu Yükleme Başlatılıyor ({len(items)} kayıt)...[/bold green]")
    collection_ref = db.collection("parcalar")

    batch = db.batch()
    batch_counter = 0
    total_uploaded = 0

    with Progress(console=console) as progress:
        task = progress.add_task("[magenta]Firestore Batch Yükleme...", total=len(items))

        for item in items:
            oem_kodu = item.get("oem_kodu")
            doc_id = oem_kodu if oem_kodu and oem_kodu != "OEM_BULUNAMADI" else collection_ref.document().id
            doc_ref = collection_ref.document(doc_id)

            batch.set(doc_ref, item, merge=True)
            batch_counter += 1
            progress.advance(task)

            if batch_counter >= 400:
                batch.commit()
                total_uploaded += batch_counter
                batch = db.batch()
                batch_counter = 0

        if batch_counter > 0:
            batch.commit()
            total_uploaded += batch_counter

    console.print(f"[bold green]✅ Başarıyla {total_uploaded} kayıt Firestore'a yüklendi.[/bold green]\n")

def run_incremental_update():
    db = init_firebase()
    if not db:
        return

    console.print("\n[bold cyan]🔄 Artımlı Güncelleme Modu Çalıştırılıyor...[/bold cyan]")
    limit_count = int(Prompt.ask("Kaç adet eski kayıt kontrol edilsin?", default="10"))

    docs = list(db.collection("parcalar").order_by("son_guncelleme").limit(limit_count).stream())

    if not docs:
        console.print("[yellow]Veritabanında kontrol edilecek kayıt bulunamadı.[/yellow]")
        return

    with Progress(console=console) as progress:
        task = progress.add_task("[yellow]Fiyatlar Kontrol Ediliyor...", total=len(docs))

        for doc in docs:
            data = doc.to_dict()
            url = data.get("kaynak_url")
            if url:
                try:
                    res = requests.get(url, headers=get_random_headers(url), timeout=10)
                    if res.status_code == 200:
                        soup = BeautifulSoup(res.text, "html.parser")
                        price_tag = soup.find(class_=re.compile(r'price|fiyat', re.I))
                        current_price = price_tag.get_text(strip=True) if price_tag else "0.00 TL"

                        if current_price != data.get("fiyat"):
                            doc.reference.update({
                                "fiyat": current_price,
                                "son_guncelleme": time.strftime("%Y-%m-%d %H:%M:%S")
                            })
                            console.print(f"  [bold yellow]Güncellendi [{doc.id}]:[/bold yellow] {data.get('fiyat')} -> {current_price}")
                except Exception as e:
                    console.print(f"  [bold red]Hata [{doc.id}]:[/bold red] {e}")

            progress.advance(task)
            time.sleep(3)

    console.print("[bold green]✅ Artımlı Güncelleme Tamamlandı.[/bold green]\n")

def run_data_cleaner():
    console.print("\n[bold red]🧹 Veri Düzenleme ve Temizleme Modülü[/bold red]")
    console.print("1. Lokal JSON'daki Mükerrer Kayıtları Sil")
    console.print("2. OEM Kodu Bulunamayan Kayıtları Temizle")
    console.print("3. Firestore Veritabanını Sıfırla")
    console.print("0. İptal / Geri Dön")

    choice = Prompt.ask("Seçiminiz", choices=["1", "2", "3", "0"], default="0")

    if choice == "1":
        existing_map = load_existing_data()
        save_data_to_json(existing_map)
        console.print(f"[bold green]✓ Temizlendi![/bold green] Toplam {len(existing_map)} benzersiz kayıt korundu.")

    elif choice == "2":
        if not os.path.exists(JSON_FILE):
            console.print("[red]JSON dosyası bulunamadı.[/red]")
            return

        with open(JSON_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        filtered = [item for item in data if item.get("oem_kodu") != "OEM_BULUNAMADI"]

        with open(JSON_FILE, "w", encoding="utf-8") as f:
            json.dump(filtered, f, ensure_ascii=False, indent=4)

        console.print(f"[bold green]✓ Temizlendi![/bold green] Hatalı OEM'e sahip {len(data) - len(filtered)} kayıt kaldırıldı.")

    elif choice == "3":
        if Confirm.ask("[bold red]TÜM Firestore veritabanını silmek istediğinize emin misiniz?[/bold red]"):
            db = init_firebase()
            if db:
                docs = db.collection("parcalar").stream()
                count = 0
                for doc in docs:
                    doc.reference.delete()
                    count += 1
                console.print(f"[bold red]💥 Firestore'dan {count} doküman tamamen silindi.[/bold red]")

def main_menu():
    while True:
        console.clear()
        console.print(f"[bold cyan]{BANNER}[/bold cyan]")
        show_status_panel()

        console.print("\n[bold white]YAPMAK İSTEDİĞİNİZ İŞLEMİ SEÇİN:[/bold white]")
        console.print(" [1] 🚀 Kazımaya Başla (Aşırı Hızlı Paralel Mod)")
        console.print(" [2] ⚡ Toplu Firebase Yükleme (JSON -> Firestore)")
        console.print(" [3] 🔄 Artımlı Güncelleme (Canlı Veri/Fiyat Kontrolü)")
        console.print(" [4] 🧹 Veri Düzenle, Temizle veya Mükerrerleri Sil")
        console.print(" [0] ❌ Çıkış Yap")

        choice = Prompt.ask("\n[bold green]Komut Numarası Girin[/bold green]", choices=["1", "2", "3", "4", "0"], default="1")

        if choice == "1":
            run_full_scrape()
            Prompt.ask("\nDevam etmek için [Enter] tuşuna basın...")
        elif choice == "2":
            run_firebase_import()
            Prompt.ask("\nDevam etmek için [Enter] tuşuna basın...")
        elif choice == "3":
            run_incremental_update()
            Prompt.ask("\nDevam etmek için [Enter] tuşuna basın...")
        elif choice == "4":
            run_data_cleaner()
            Prompt.ask("\nDevam etmek için [Enter] tuşuna basın...")
        elif choice == "0":
            console.print("\n[bold yellow]Oto Faik Otomasyon Sisteminden Çıkılıyor... İyi çalışmalar![/bold yellow]\n")
            sys.exit(0)

if __name__ == "__main__":
    main_menu()