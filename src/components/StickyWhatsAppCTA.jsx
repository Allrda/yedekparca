import React from 'react';

export default function StickyWhatsAppCTA() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Telefon Arama Butonu */}
      <a
        href="tel:05350755371"
        aria-label="Hızlı Telefon Ara"
        className="w-12 h-12 md:w-14 md:h-14 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-full shadow-2xl flex items-center justify-center text-xl md:text-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-amber-400/40 cursor-pointer group relative"
      >
        <span>📞</span>
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
          Hemen Ara: 0535 075 5371
        </span>
      </a>

      {/* WhatsApp Canlı Destek Butonu */}
      <a
        href="https://wa.me/905350755371?text=Merhaba,%20Renault%20Dacia%20yedek%20par%C3%A7a%20i%C3%A7in%20destek%20almak%20istiyorum."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Canlı Destek"
        className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl md:text-3xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-emerald-400/40 cursor-pointer group relative"
      >
        <span>💬</span>
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
          WhatsApp Destek Hattı
        </span>
      </a>
    </div>
  );
}
