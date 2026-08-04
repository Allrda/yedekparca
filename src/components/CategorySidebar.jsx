import React from 'react';

const VEHICLES = ['Tüm Modeller', 'Clio 5', 'Megane 4', 'Fluence', 'Symbol', 'Kadjar', 'Duster', 'Sandero'];
const CATEGORIES = ['Tümü', 'Fren Sistemi', 'Motor & Filtre', 'Ateşleme & Elektrik', 'Süspansiyon & Direksiyon', 'Aydınlatma & Kaporta'];

export default function CategorySidebar({ selectedCategory, setSelectedCategory, selectedVehicle, setSelectedVehicle }) {
  return (
    <div className="space-y-4">
      
      {/* ARAÇ MODELLERİ */}
      <div className="bg-white border border-slate-200/80 p-3.5 md:p-5 rounded-2xl md:rounded-3xl shadow-sm">
        <h3 className="text-[11px] md:text-xs font-black text-slate-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <span>🚗</span> Araç Modeli
        </h3>
        
        {/* MOBİL HIZLI SEÇİM BANTI (Yatay Kaydırma) */}
        <div className="flex md:flex-col overflow-x-auto no-scrollbar gap-1.5 pb-1 md:pb-0">
          {VEHICLES.map(v => (
            <button
              key={v}
              onClick={() => setSelectedVehicle(v)}
              className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                selectedVehicle === v 
                  ? 'bg-amber-400 text-slate-950 shadow-sm' 
                  : 'text-slate-600 bg-slate-50 md:bg-transparent hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{v}</span>
              {selectedVehicle === v && <span className="text-[10px] hidden md:inline">●</span>}
            </button>
          ))}
        </div>
      </div>

      {/* PARÇA KATEGORİSİ */}
      <div className="bg-white border border-slate-200/80 p-3.5 md:p-5 rounded-2xl md:rounded-3xl shadow-sm">
        <h3 className="text-[11px] md:text-xs font-black text-slate-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <span>⚙️</span> Parça Kategorisi
        </h3>
        
        <div className="flex md:flex-col overflow-x-auto no-scrollbar gap-1.5 pb-1 md:pb-0">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                selectedCategory === c 
                  ? 'bg-slate-950 text-amber-400 shadow-sm' 
                  : 'text-slate-600 bg-slate-50 md:bg-transparent hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{c}</span>
              {selectedCategory === c && <span className="text-[10px] hidden md:inline">●</span>}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}