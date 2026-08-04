import React, { useState, useEffect } from 'react';
import CategorySidebar from '../components/CategorySidebar';
import ProductCard from '../components/ProductCard';
import { fetchProductsFromFirebase, MOCK_PRODUCTS } from '../services/firebase';

export default function HomePage({ 
  navigate, 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory, 
  selectedVehicle, 
  setSelectedVehicle 
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProducts() {
      setLoading(true);
      try {
        const firebaseData = await fetchProductsFromFirebase();
        setProducts(firebaseData && firebaseData.length > 0 ? firebaseData : MOCK_PRODUCTS || []);
      } catch (error) {
        setProducts(MOCK_PRODUCTS || []);
      } finally {
        setLoading(false);
      }
    }
    getProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const rawQuery = searchQuery ? searchQuery.toLowerCase().trim() : '';
    const cleanQuery = rawQuery.replace(/[^a-z0-9]/g, '');

    const nameMatch = product.name && product.name.toLowerCase().includes(rawQuery);
    
    const oemRaw = product.oem ? product.oem.toLowerCase() : '';
    const oemClean = oemRaw.replace(/[^a-z0-9]/g, '');
    const oemMatch = oemClean.includes(cleanQuery) || oemRaw.includes(rawQuery);

    const matchesSearch = !rawQuery || nameMatch || oemMatch;
    const matchesCategory = selectedCategory === 'Tümü' || product.category === selectedCategory;
    const matchesVehicle = selectedVehicle === 'Tüm Modeller' || product.vehicle === selectedVehicle;

    return matchesSearch && matchesCategory && matchesVehicle;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* BANNER - Uyumlu Premium Görünüm */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-8 md:p-10 mb-8 shadow-md border border-slate-800 overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-lg uppercase tracking-wider mb-3 inline-block shadow-sm">
            🛡️ %100 Şasi Uyum Garantili Parça Ambarı
          </span>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2 text-white">
            Renault & Dacia Orijinal Yedek Parça
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mb-6 leading-relaxed max-w-xl">
            Sipariş aşamasında gireceğiniz 17 haneli Şasi (VIN) kodunuz uzman ekibimizce kontrol edilir, yanlış parça gönderimi engellenir.
          </p>
          
          {(selectedCategory !== 'Tümü' || selectedVehicle !== 'Tüm Modeller' || searchQuery) && (
            <button 
              onClick={() => { setSelectedCategory('Tümü'); setSelectedVehicle('Tüm Modeller'); setSearchQuery(''); }} 
              className="bg-amber-400 hover:bg-amber-500 transition-colors text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>✕</span> Filtreleri Sıfırla
            </button>
          )}
        </div>
      </div>

      {/* İÇERİK GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1 sticky top-24">
          <CategorySidebar 
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
          />
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-4"></div>
              <p className="text-xs font-bold text-slate-700">OEM Kataloğu Yükleniyor...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm">
              <span className="text-4xl">🔍</span>
              <p className="text-sm font-extrabold text-slate-900 mt-3">Aranan kriterlere uygun parça bulunamadı.</p>
              <p className="text-xs text-slate-500 mt-1">Arama terimini veya parça OEM kodunu kontrol edin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id || product.oem} product={product} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}