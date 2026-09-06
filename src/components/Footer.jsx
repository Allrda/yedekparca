import React from 'react';

export default function Footer({ navigate }) {
  return (
    <footer className="bg-black text-neutral-300 border-t border-neutral-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Marka & Açıklama */}
          <div className="col-span-1 md:col-span-1">
            <div 
              onClick={() => navigate('home')} 
              className="cursor-pointer inline-flex items-center gap-2 bg-amber-400 text-black font-black text-xl px-3 py-1.5 rounded-xl mb-4"
            >
              <span>OTO</span>
              <span className="bg-black text-amber-400 px-2 py-0.5 rounded-lg text-sm">FAİK</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Renault ve Dacia orijinal yedek parça deposu. Şasi numarası ile tam uyumlu parça garantisi.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Hızlı Erişim</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button onClick={() => navigate('home')} className="hover:text-amber-400 transition">
                  Anasayfa & Katalog
                </button>
              </li>
              <li>
                <button onClick={() => navigate('cart')} className="hover:text-amber-400 transition">
                  Sepetim
                </button>
              </li>
              <li>
                <button onClick={() => navigate('login')} className="hover:text-amber-400 transition">
                  Giriş Yap / Kayıt Ol
                </button>
              </li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Kategoriler</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li className="hover:text-amber-400 cursor-pointer">Motor & Şanzıman</li>
              <li className="hover:text-amber-400 cursor-pointer">Filtre & Periyodik Bakım</li>
              <li className="hover:text-amber-400 cursor-pointer">Fren Aksamı</li>
              <li className="hover:text-amber-400 cursor-pointer">Süspansiyon & Ön Takım</li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">İletişim & Destek</h4>
            <div className="space-y-2 text-xs text-neutral-400">
              <p>📞 Telefon: <span className="text-white font-bold">0535 075 5371</span></p>
              <p>📍 Adres: Ordu/Altınordu Karapınar Mahallesi 1239. Sokak No:2/A Oto Faik </p>
              <p>⏰ Çalışma Saatleri: Hafta içi 08:30 - 19:00</p>
            </div>
          </div>

        </div>

        {/* Alt Telif Şeridi */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Oto Faik Parça Deposu. Tüm hakları saklıdır. ©️</p>
          <div className="flex gap-4">
            <span className="hover:text-neutral-400 cursor-pointer">Gizlilik Politikası ©️</span>
            <span className="hover:text-neutral-400 cursor-pointer">Mesafeli Satış Sözleşmesi ©️</span>
          </div>
        </div>

      </div>
    </footer>
  );
}