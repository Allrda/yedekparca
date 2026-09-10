import React from 'react';

export default function NotFoundPage({ navigate }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-100 text-amber-600 rounded-3xl text-4xl font-black mb-2 shadow-inner">
        404
      </div>
      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
        Aradığınız Sayfa Bulunamadı
      </h1>
      <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
        Ulaşmaya çalıştığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir. Renault & Dacia yedek parça kataloğumuza hemen göz atın.
      </p>
      <div className="pt-4 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => navigate('home')}
          className="bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition active:scale-95 cursor-pointer"
        >
          Ana Sayfaya Dön
        </button>
        <a
          href="https://wa.me/905350755371"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <span>💬</span> WhatsApp Destek Hattı
        </a>
      </div>
    </div>
  );
}
