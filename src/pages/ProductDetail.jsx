import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';

export default function ProductCard({ product, navigate }) {
  const { addToCart } = useContext(CartContext);
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div 
      onClick={() => navigate('detail', product.id || product)}
      className="bg-white border border-slate-200/80 rounded-2xl p-4 hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group relative"
    >
      <div>
        {/* Ürün Görseli & Rozetler */}
        <div className="relative w-full h-36 sm:h-44 bg-slate-50 rounded-xl mb-3 overflow-hidden flex items-center justify-center p-2 border border-slate-100">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-3xl text-slate-300">📦</span>
          )}
          
          {product.oem && (
            <span className="absolute top-2 left-2 bg-slate-950 text-amber-400 text-[9px] font-mono font-black px-2 py-0.5 rounded-md tracking-wider shadow-sm">
              OEM: {product.oem}
            </span>
          )}
        </div>

        {/* Araç & Kategori Bilgisi */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold mb-1">
          <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md">{product.vehicle || 'Renault'}</span>
          <span>•</span>
          <span>{product.category || 'Yedek Parça'}</span>
        </div>

        {/* Ürün İsmi */}
        <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug mb-2 group-hover:text-amber-600 transition-colors">
          {product.name}
        </h3>
      </div>

      {/* Fiyat & Ekle Butonu */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <div>
          <span className="text-[9px] text-slate-400 font-bold block uppercase">Fiyat</span>
          <span className="text-sm sm:text-base font-black text-slate-950">{product.price?.toLocaleString('tr-TR')} TL</span>
        </div>

        <button
          onClick={handleAdd}
          className={`px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
            added 
              ? 'bg-emerald-500 text-white shadow-sm' 
              : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-sm'
          }`}
        >
          {added ? (
            <><span>✓</span> Ekledi</>
          ) : (
            <><span>+</span> <span className="hidden sm:inline">Sepete</span></>
          )}
        </button>
      </div>
    </div>
  );
}