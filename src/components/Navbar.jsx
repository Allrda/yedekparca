import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function Navbar({ navigate, searchTerm, setSearchTerm }) {
  const { cartTotal, cartCount } = useContext(CartContext);
  const { currentUser, isAdmin, logout } = useContext(AuthContext);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md text-slate-900 shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        
        {/* ÜST SATIR: LOGO & BUTONLAR */}
        <div className="flex items-center justify-between gap-2 md:gap-6">
          
          {/* LOGO */}
          <div 
            onClick={() => navigate('home')} 
            className="cursor-pointer flex items-center gap-2 group select-none"
          >
            <div className="bg-slate-950 text-amber-400 font-black text-lg md:text-2xl px-3 py-1.5 rounded-xl shadow-md group-hover:scale-105 transition-all duration-300 flex items-center gap-1">
              <span>OTO</span>
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-lg tracking-tight">FAİK</span>
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="font-black text-xs md:text-base tracking-wider text-slate-900 leading-none">
                RENAULT & DACIA
              </span>
              <span className="text-[8px] font-extrabold text-slate-500 tracking-wider uppercase mt-0.5">
                Yedek Parça
              </span>
            </div>
          </div>

          {/* SAĞ KONTROLLER */}
          <div className="flex items-center gap-2">
            
            {/* Sipariş Takip (Mobil Sadece İkon) */}
            <button
              onClick={() => navigate('track')}
              title="Sipariş Takibi"
              className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 md:px-3 md:py-2 rounded-xl transition cursor-pointer"
            >
              <span>📍</span>
              <span className="hidden md:inline">Sipariş Takibi</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-1 rounded-xl">
                {isAdmin && (
                  <button
                    onClick={() => navigate('admin')}
                    className="text-[11px] font-black bg-amber-400 hover:bg-amber-500 text-slate-950 px-2 py-1 md:px-3 md:py-1.5 rounded-lg transition shadow-sm cursor-pointer"
                  >
                    ⚙️ Admin
                  </button>
                )}
                <button
                  onClick={logout}
                  className="text-[11px] font-bold bg-slate-200 text-slate-700 hover:bg-rose-500 hover:text-white px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg transition cursor-pointer"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('login')}
                className="flex items-center gap-1 text-xs font-extrabold text-slate-700 hover:text-slate-950 p-2 md:px-3 md:py-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <span>👤</span>
                <span className="hidden sm:inline">Giriş</span>
              </button>
            )}

            {/* SEPET */}
            <button
              onClick={() => navigate('cart')}
              className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-white font-black px-3 py-2 rounded-xl transition shadow-md active:scale-95 cursor-pointer"
            >
              <span className="text-xs">🛒</span>
              <span className="text-xs font-bold text-amber-400 hidden sm:inline">{cartTotal.toLocaleString('tr-TR')} TL</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* ALT SATIR: MOBİL ARAMA BARI (Mobilde geniş ve kolay basılabilir) */}
        <div className="mt-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Parça adı veya OEM kodu girin (Örn: 7701478505)..."
              className="w-full bg-slate-100 text-slate-900 text-xs font-medium pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-slate-400 shadow-inner"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              🔍
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}