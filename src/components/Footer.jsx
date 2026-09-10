import React from 'react';

export default function Footer({ navigate }) {
  return (
    <footer className="bg-black text-neutral-300 border-t border-neutral-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Marka & Açıklama */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <div 
              onClick={() => navigate('home')} 
              className="cursor-pointer inline-flex items-center gap-2 bg-amber-400 text-black font-black text-xl px-3 py-1.5 rounded-xl"
            >
              <span>OTO</span>
              <span className="bg-black text-amber-400 px-2 py-0.5 rounded-lg text-sm">FAİK</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Renault ve Dacia orijinal yedek parça ambarı. Şasi numarası (VIN) ile %100 uyumlu parça garantisi ve aynı gün kargo imkanı.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('corporate')}
                className="bg-neutral-900 hover:bg-neutral-800 text-amber-400 font-bold text-xs px-4 py-2.5 rounded-xl border border-neutral-800 transition cursor-pointer w-full text-left flex items-center justify-between"
              >
                <span>🏢 Kurumsal & Tamirhane Çözümleri</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Hızlı Linkler & İç Linkleme */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Hızlı Erişim & SEO</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button onClick={() => navigate('home')} className="hover:text-amber-400 transition">
                  Anasayfa & OEM Parça Kataloğu
                </button>
              </li>
              <li>
                <button onClick={() => navigate('track')} className="hover:text-amber-400 transition">
                  Sipariş Takip Ekranı
                </button>
              </li>
              <li>
                <button onClick={() => navigate('cart')} className="hover:text-amber-400 transition">
                  Alışveriş Sepetim
                </button>
              </li>
              <li>
                <button onClick={() => navigate('login')} className="hover:text-amber-400 transition">
                  Üye Girişi / Kayıt Ol
                </button>
              </li>
              <li>
                <button onClick={() => navigate('corporate')} className="hover:text-amber-400 transition">
                  B2B Filo ve Tamirhane Çözümleri
                </button>
              </li>
            </ul>
          </div>

          {/* Popüler Renault & Dacia Modelleri (İç Linkleme) */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Popüler Modeller</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li onClick={() => navigate('home')} className="hover:text-amber-400 cursor-pointer transition">Renault Clio Yedek Parça</li>
              <li onClick={() => navigate('home')} className="hover:text-amber-400 cursor-pointer transition">Renault Megane Orijinal Parça</li>
              <li onClick={() => navigate('home')} className="hover:text-amber-400 cursor-pointer transition">Dacia Duster Süspansiyon & Filtre</li>
              <li onClick={() => navigate('home')} className="hover:text-amber-400 cursor-pointer transition">Renault Fluence Motor Parçaları</li>
              <li onClick={() => navigate('home')} className="hover:text-amber-400 cursor-pointer transition">Dacia Sandero Fren Aksamı</li>
            </ul>
          </div>

          {/* İletişim & Google Harita / Adres */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">İletişim & Konum</h4>
            <div className="space-y-2 text-xs text-neutral-400 mb-4">
              <p>📞 Telefon: <a href="tel:05350755371" className="text-white font-bold hover:text-amber-400">0535 075 5371</a></p>
              <p>📍 Adres: Karapınar Mah. 2. San. Sit. Altınordu, Ordu</p>
              <p>⏰ Çalışma Saatleri: Hafta İçi 08:30 - 19:00</p>
            </div>
            {/* Google Harita Iframe (Karapınar Mah. 2. San. Sit. Altınordu, Ordu) */}
            <div className="rounded-xl overflow-hidden border border-neutral-800 h-28 w-full bg-neutral-900">
              <iframe
                title="Oto Faik Konum"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.4589234!2d37.88!3d40.98!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4063c350a1234567%3A0x89abcdef!2sKarap%C4%B1nar%2C%202.%20Sanayi%20Sit.%20Alt%C4%B1nordu%2FOrdu!5e0!3m2!1str!2str!4v1!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>

        {/* Alt Telif Şeridi */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Oto Faik Parça Deposu. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <button onClick={() => navigate('privacy')} className="hover:text-neutral-400 transition cursor-pointer">
              Gizlilik Politikası & KVKK
            </button>
            <button onClick={() => navigate('privacy')} className="hover:text-neutral-400 transition cursor-pointer">
              Mesafeli Satış Sözleşmesi
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
