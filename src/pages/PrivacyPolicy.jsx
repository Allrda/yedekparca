import React from 'react';

export default function PrivacyPolicyPage({ navigate }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-slate-800">
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
            Yasal Uyumluluk
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-3">
            Gizlilik Politikası ve KVKK Aydınlatma Metni
          </h1>
          <p className="text-xs text-slate-500 mt-1">Son Güncelleme: Eylül 2026</p>
        </div>

        <div className="space-y-4 text-xs md:text-sm leading-relaxed text-slate-600">
          <h2 className="text-base font-black text-slate-900 pt-2">1. Veri Sorumlusu</h2>
          <p>
            Oto Faik Orijinal Yedek Parça ("Oto Faik") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanonu ("KVKK") uyarınca veri sorumlusu sıfatıyla, müşterilerimizin sipariş süreçlerinde paylaştığı kişisel verileri (Ad, soyad, telefon, teslimat adresi, şasi numarası) güvenle işlemekte ve korumaktayız.
          </p>

          <h2 className="text-base font-black text-slate-900 pt-2">2. İşlenen Kişisel Veriler ve Amaçları</h2>
          <p>
            Siparişlerinizin doğru Renault & Dacia yedek parça eşleştirmesi yapılabilmesi ve kargo süreçlerinin yürütülmesi amacıyla şasi numarası (VIN) ve iletişim bilgileriniz işlenmektedir. Bu veriler üçüncü şahıslarla ticari amaçla paylaşılmaz, yalnızca kargo firması ve şasi doğrulama departmanımız ile paylaşılır.
          </p>

          <h2 className="text-base font-black text-slate-900 pt-2">3. Çerez (Cookie) Politikası</h2>
          <p>
            Web sitemizde kullanıcı deneyimini geliştirmek, sepet işlemlerinizi hatırlamak ve site performansını analiz etmek amacıyla çerezler kullanılmaktadır. Tarayıcınız üzerinden çerezleri dilediğiniz zaman engelleyebilirsiniz.
          </p>

          <h2 className="text-base font-black text-slate-900 pt-2">4. Mesafeli Satış Sözleşmesi Özeti</h2>
          <p>
            Oto Faik üzerinden yapacağınız alışverişlerde 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri geçerlidir. Satın alınan orijinal yedek parçalarda cayma hakkı ve iade koşulları kargo teslim tarihinden itibaren 14 günü kapsamaktadır (Ambalajı açılmamış ve monte edilmemiş ürünler için).
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => navigate('home')}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs px-6 py-3 rounded-xl transition cursor-pointer"
          >
            ← Ana Sayfaya Dön
          </button>
          <span className="text-xs text-slate-400 font-medium">Oto Faik - Ordu / Altınordu</span>
        </div>
      </div>
    </div>
  );
}
