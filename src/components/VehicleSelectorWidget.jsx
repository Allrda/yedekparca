import React, { useState } from 'react';

const BRANDS = [
  { id: 'renault', name: 'Renault', logo: '🚗' },
  { id: 'dacia', name: 'Dacia', logo: '🚙' }
];

const MODELS = {
  renault: ['Clio 4', 'Clio 5', 'Megane 3', 'Megane 4', 'Fluence', 'Symbol', 'Captur', 'Kadjar', 'Talisman', 'Master'],
  dacia: ['Duster', 'Sandero', 'Logan', 'Lodgy', 'Dokker', 'Spring']
};

const YEARS = ['Tüm Yıllar', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010'];

const ENGINES = [
  'Tüm Motorlar', 
  '1.5 dCi (Dizel)', 
  '1.3 TCe (Benzinli)', 
  '1.0 TCe (Benzinli)', 
  '0.9 TCe (Benzinli)', 
  '1.2 TCe (Benzinli)', 
  '1.6 16V (Benzinli/LPG)',
  '1.5 Blue dCi'
];

export default function VehicleSelectorWidget({ selectedVehicle, setSelectedVehicle, onVehicleSelect }) {
  const [selectedBrand, setSelectedBrand] = useState('renault');
  const [selectedModel, setSelectedModel] = useState(selectedVehicle !== 'Tüm Modeller' ? selectedVehicle : '');
  const [selectedYear, setSelectedYear] = useState('Tüm Yıllar');
  const [selectedEngine, setSelectedEngine] = useState('Tüm Motorlar');
  const [vinNumber, setVinNumber] = useState('');
  const [vinChecked, setVinChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('selector'); // 'selector' or 'vin'

  const handleApply = () => {
    if (selectedModel) {
      setSelectedVehicle(selectedModel);
      if (onVehicleSelect) onVehicleSelect({ brand: selectedBrand, model: selectedModel, year: selectedYear, engine: selectedEngine });
    } else {
      setSelectedVehicle('Tüm Modeller');
    }
  };

  const handleVinSubmit = (e) => {
    e.preventDefault();
    if (vinNumber.trim().length >= 10) {
      setVinChecked(true);
      // Automatically map some detected vehicle based on VIN or set generic verified
      setSelectedVehicle('Clio 5'); // simulated match
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-lg">🛡️</span>
          <div>
            <h3 className="font-black text-sm md:text-base tracking-wide text-white">
              Araç & Şasi (VIN) Doğrulama Merkezi
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              100% Uyum Garantili Orijinal Renault & Dacia Parça Seçimi
            </p>
          </div>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('selector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'selector' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'}`}
          >
            Araç Seç
          </button>
          <button
            onClick={() => setActiveTab('vin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'vin' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'}`}
          >
            Şasi No (VIN)
          </button>
        </div>
      </div>

      {activeTab === 'selector' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Marka */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">1. Marka</label>
              <div className="grid grid-cols-2 gap-2">
                {BRANDS.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedBrand(b.id); setSelectedModel(''); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      selectedBrand === b.id 
                        ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-sm' 
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{b.logo}</span>
                    <span>{b.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">2. Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400 transition"
              >
                <option value="">Model Seçiniz...</option>
                {MODELS[selectedBrand]?.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Yıl */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">3. Yıl Aralığı</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400 transition"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Motor Tipi */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">4. Motor Tipi</label>
              <select
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400 transition"
              >
                {ENGINES.map(eng => (
                  <option key={eng} value={eng}>{eng}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-300 flex items-center gap-1.5">
              <span>Aktif Filtre:</span>
              <span className="bg-amber-400/20 text-amber-400 font-extrabold px-2 py-0.5 rounded-lg border border-amber-400/30">
                {selectedVehicle} {selectedYear !== 'Tüm Yıllar' ? `(${selectedYear})` : ''} {selectedEngine !== 'Tüm Motorlar' ? `- ${selectedEngine}` : ''}
              </span>
            </div>

            <div className="flex gap-2">
              {selectedVehicle !== 'Tüm Modeller' && (
                <button
                  onClick={() => { setSelectedVehicle('Tüm Modeller'); setSelectedModel(''); }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Sıfırla
                </button>
              )}
              <button
                onClick={handleApply}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black px-6 py-2.5 rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>🔍</span> Parçaları Filtrele
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleVinSubmit} className="space-y-4">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
            <label className="block text-xs font-bold text-slate-300 mb-2">
              17 Haneli Şasi Numarası (VIN) ile Parça Eşleştirme
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={17}
                placeholder="Örn: VF1RFB00561234567"
                value={vinNumber}
                onChange={(e) => setVinNumber(e.target.value.toUpperCase())}
                className="flex-grow bg-slate-900 border border-slate-700 text-amber-400 font-mono font-black text-sm px-4 py-3 rounded-xl uppercase tracking-wider focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={vinNumber.length < 10}
                className="bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow transition cursor-pointer flex items-center gap-1"
              >
                <span>⚡</span> Şase Doğrula
              </button>
            </div>
            {vinChecked && (
              <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-400 font-bold">
                <span>✓ Şase Başarıyla Doğrulandı: Renault Clio 5 (2021) 1.0 TCe</span>
                <span className="text-white bg-emerald-600 px-2 py-0.5 rounded text-[10px]">Uyumlu Parçalar Listeleniyor</span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Ruhsatınızda yer alan 17 haneli şasi numaranızı girerek aracınıza %100 uyan orijinal fren, motor ve bakım parçalarını anında listeleyin. Uzmanlarımız sipariş sonrasında şasinizi tekrar kontrol eder.
          </p>
        </form>
      )}
    </div>
  );
}
