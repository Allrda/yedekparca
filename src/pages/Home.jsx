import React, { useState, useEffect } from 'react';
import CategorySidebar from '../components/CategorySidebar';
import ProductCard from '../components/ProductCard';
import VehicleSelectorWidget from '../components/VehicleSelectorWidget';
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
  const [visibleLimit, setVisibleLimit] = useState(36);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

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

  useEffect(() => {
    setVisibleLimit(36);
  }, [searchQuery, selectedCategory, selectedVehicle]);

  const filteredProducts = products.filter(product => {
    const rawQuery = searchQuery ? searchQuery.toLowerCase().trim() : '';
    const cleanQuery = rawQuery.replace(/[^a-z0-9]/g, '');

    const nameMatch = product.name && product.name.toLowerCase().includes(rawQuery);
    
    const oemRaw = product.oem ? product.oem.toLowerCase() : '';
    const oemClean = oemRaw.replace(/[^a-z0-9]/g, '');
    const oemMatch = cleanQuery.length > 0 && (oemClean.includes(cleanQuery) || oemRaw.includes(rawQuery));

    const matchesSearch = !rawQuery || nameMatch || oemMatch;
    const matchesCategory = selectedCategory === 'Tümü' || product.category === selectedCategory;
    
    const vehicleRaw = selectedVehicle ? selectedVehicle.toLowerCase() : 'tüm modeller';
    const matchesVehicle = vehicleRaw === 'tüm modeller' || 
      (product.vehicle && product.vehicle.toLowerCase().includes(vehicleRaw)) ||
      (product.compatibles && product.compatibles.some(c => c.toLowerCase().includes(vehicleRaw)));

    return matchesSearch && matchesCategory && matchesVehicle;
  });

  const displayedProducts = filteredProducts.slice(0, visibleLimit);

  const loadMore = () => {
    setVisibleLimit(prev => prev + 36);
  };

  const faqs = [
    {
      q: "Şasi numarası (VIN) ile yedek parça nasıl seçilir?",
      a: "Aracınızın ruhsatında yer alan 17 haneli şasi numarasını arama çubuğuna veya ürün detayındaki şasi kontrol kutusuna girerek motor, fren ve filtre sisteminizle %100 uyumlu parçaları anında teyit edebilirsiniz."
    },
    {
      q: "Siparişlerim aynı gün kargoya veriliyor mu?",
      a: "Hafta içi saat 16:00'a kadar verilen tüm Renault ve Dacia orijinal yedek parça siparişleriniz aynı gün anlaşmalı kargoya teslim edilmektedir."
    },
    {
      q: "Renault ve Dacia parçalarınız orijinal mi?",
      a: "Evet, kataloğumuzdaki tüm yedek parçalar %100 orijinal OEM standartlarında olup, aracınızın performansını ve ömrünü koruyacak şekilde özenle seçilmektedir."
    },
    {
      q: "Yanlış parça sipariş edersem iade veya değişim yapabilir miyim?",
      a: "Şasi numarası doğrulanarak verilen siparişlerde uyum garantisi veriyoruz. Olası değişim ve iadelerde 14 gün içinde koşulsuz destek sağlıyoruz."
    },
    {
      q: "Ordu dışından sipariş verebilir miyim? Kargo süresi nedir?",
      a: "Tabii ki! Türkiye'nin 81 iline anlaşmalı kargo firmalarımızla güvenli ve sigortalı gönderim yapmaktayız. Genellikle 1-3 iş günü içinde adresinize teslim edilmektedir."
    }
  ];

  const testimonials = [
    {
      name: "Ahmet Yıldırım",
      title: "Oto Tamir Ustası, Ordu",
      comment: "Renault Clio ve Megane araçlar için parça temininde Oto Faik bir numaralı adresimiz. Şasi doğrulaması sayesinde müşterilerimize hiç yanlış parça takmadık."
    },
    {
      name: "Murat Kaya",
      title: "Dacia Duster Sahibi",
      comment: "Aradığım zor bulunur periyodik bakım filtrelerini tam zamanında buldum. Fiyatlar çok uygun ve kargo ertesi gün elimdeydi."
    },
    {
      name: "Hakan Şahin",
      title: "Filo Yöneticisi",
      comment: "Kurumsal yaklaşımınız ve hızlı sevkiyatınız için teşekkür ederim. Tüm Renault filomuzun bakım yedek parçalarını artık buradan alıyoruz."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      
      {/* SCHEMA.ORG FAQ & LOCALBUSINESS JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.a
            }
          }))
        })}
      </script>

      {/* BANNER */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-6 md:p-10 shadow-xl border border-slate-800 overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2 text-white">
            Renault & Dacia Orijinal Yedek Parça Ambarı
          </h1>
          <p className="text-slate-300 text-xs md:text-sm mb-6 leading-relaxed max-w-2xl">
            12.500+ geniş OEM parça kataloğumuzdan şasi numaranızla veya parça adıyla arama yapın, aracınıza tam uyan parçaları hemen keşfedin.
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

      {/* İNTRAKTİF ARAÇ / ŞASİ (VIN) SEÇİCİ WIDGET */}
      <VehicleSelectorWidget 
        selectedVehicle={selectedVehicle} 
        setSelectedVehicle={setSelectedVehicle} 
      />

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

        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h2 className="font-black text-sm md:text-base text-slate-900">
                {selectedVehicle !== 'Tüm Modeller' ? `${selectedVehicle} Yedek Parçaları` : 'Tüm Yedek Parçalar Kataloğu'}
                {selectedCategory !== 'Tümü' ? ` / ${selectedCategory}` : ''}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Toplam {filteredProducts.length.toLocaleString('tr-TR')} parça bulundu (Gösterilen: {Math.min(visibleLimit, filteredProducts.length)})
              </p>
            </div>
            {searchQuery && (
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-xl">
                Arama: "{searchQuery}"
              </span>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-4"></div>
              <p className="text-xs font-bold text-slate-700">OEM Kataloğu Yükleniyor...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm">
              <span className="text-4xl">🔍</span>
              <p className="text-sm font-extrabold text-slate-900 mt-3">Aranan kriterlere uygun parça bulunamadı.</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Arama terimini, parça OEM kodunu veya seçili araç filtresini kontrol edin.</p>
              <button
                onClick={() => { setSelectedCategory('Tümü'); setSelectedVehicle('Tüm Modeller'); setSearchQuery(''); }}
                className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition"
              >
                Tüm Parçaları Göster
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProducts.map(product => (
                  <ProductCard key={product.id || product.oem} product={product} navigate={navigate} />
                ))}
              </div>

              {visibleLimit < filteredProducts.length && (
                <div className="text-center pt-6">
                  <button
                    onClick={loadMore}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs px-8 py-3.5 rounded-2xl shadow-lg transition active:scale-95 cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>↓</span> Daha Fazla Parça Yükle ({filteredProducts.length - visibleLimit} ürün kaldı)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MÜŞTERİ YORUMLARI (TESTIMONIALS) */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
            Müşteri Memnuniyeti
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-3">
            Tamirhaneler ve Sürücüler Ne Diyor?
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Renault ve Dacia parça tedariğinde binlerce mutlu müşterimizin yorumları.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-amber-500 text-sm">★★★★★</div>
                <p className="text-xs text-slate-700 italic leading-relaxed">"{t.comment}"</p>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <p className="font-black text-xs text-slate-900">{t.name}</p>
                <p className="text-[10px] text-slate-500">{t.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SIKÇA SORULAN SORULAR (FAQ ACCORDION) */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
            Merak Edilenler
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-3">
            Sıkça Sorulan Sorular (SSS)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Renault & Dacia yedek parça siparişi ve şasi doğrulama süreci hakkında bilmeniz gerekenler.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 pt-2">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index} 
                className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 text-left font-black text-xs md:text-sm text-slate-900 flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-100 transition"
                >
                  <span>{faq.q}</span>
                  <span className="text-amber-600 font-bold text-base transition-transform duration-300">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
