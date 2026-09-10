import React from 'react';

export default function CorporateSolutionsPage({ navigate }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-slate-800">
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
            B2B & Kurumsal Ortaklıklar
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-3">
            Oto Tamirhane ve Filo Çözümleri
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-2 leading-relaxed">
            Oto Faik olarak Renault ve Dacia servislerine, özel oto tamirhanelerine ve kurumsal filo sahiplerine özel toptan yedek parça tedarik ve hızlı şasi eşleştirme hizmeti sunuyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-2xl">⚡</span>
            <h3 className="font-black text-sm text-slate-900">Öncelikli Tedarik</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              12.500+ geniş OEM stoğumuzdan tamirhanenize aynı gün kargo veya Ordu içi hızlı teslimat avantajı.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-2xl">🔍</span>
            <h3 className="font-black text-sm text-slate-900">Uzman VIN Doğrulama</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Yanlış parça sipariş riskini sıfıra indiren şasi numarası (VIN) ile birebir parça uyum garantisi.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-2xl">🤝</span>
            <h3 className="font-black text-sm text-slate-900">Kurumsal İskonto</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Düzenli parça alan tamirhaneler ve filo işletmelerine özel özel fiyatlandırma ve vadeli cari hesap seçenekleri.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div>
            <h4 className="font-black text-sm text-amber-400">Kurumsal Hesap Başvurusu mu Yapmak İstiyorsunuz?</h4>
            <p className="text-xs text-slate-300 mt-1">Bize hemen telefon veya WhatsApp üzerinden ulaşın, işletmenize özel ayrıcalıkları konuşalım.</p>
          </div>
          <a
            href="https://wa.me/905350755371?text=Merhaba,%20kurumsal%20tamirhane%20ve%20filo%20yedek%20par%C3%A7a%20tedariki%20i%C3%A7in%20bilgi%20almak%20istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition whitespace-nowrap shadow-md cursor-pointer"
          >
            💬 Kurumsal WhatsApp Destek
          </a>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => navigate('home')}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs px-6 py-3 rounded-xl transition cursor-pointer"
          >
            ← Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}
