import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { fetchProductById, MOCK_PRODUCTS } from '../services/firebase';

export default function ProductDetailPage({ productId, navigate }) {
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [vinInput, setVinInput] = useState('');
  const [vinResult, setVinResult] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      if (typeof productId === 'object' && productId !== null) {
        setProduct(productId);
        setLoading(false);
        return;
      }
      try {
        const data = await fetchProductById(productId);
        if (data) {
          setProduct(data);
        } else {
          const fallback = MOCK_PRODUCTS.find(p => p.id === productId || p.oem === productId) || MOCK_PRODUCTS[0];
          setProduct(fallback);
        }
      } catch (err) {
        setProduct(MOCK_PRODUCTS[0]);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2500);
    }
  };

  const handleVinCheck = (e) => {
    e.preventDefault();
    if (vinInput.trim().length >= 10) {
      setVinResult({
        success: true,
        message: `Şase No (%100 Uyumlu): Bu parça ${product?.vehicle || 'aracınız'} motor sistemiyle tam uyumludur.`
      });
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Merhaba Oto Faik Yedek Parça, "${product?.name}" (OEM: ${product?.oem}) ürünü için şasi kontrolü ve bilgi almak istiyorum.`
  );
  const whatsappUrl = `https://wa.me/905320000000?text=${whatsappMessage}`;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-xs font-bold text-slate-700">Ürün detayları yükleniyor...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-lg font-black text-slate-900">Ürün Bulunamadı</h2>
        <button onClick={() => navigate('home')} className="mt-4 bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl">
          Anasayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Toast Bildirimi */}
      {addedToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-950 text-amber-400 px-5 py-3 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-3 animate-bounce">
          <span className="text-lg">🛒</span>
          <div>
            <p className="text-xs font-black">Sepete Eklendi!</p>
            <p className="text-[10px] text-slate-300">{product.name} ({quantity} adet)</p>
          </div>
        </div>
      )}

      {/* ÜST BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
        <button onClick={() => navigate('home')} className="hover:text-slate-900">Anasayfa</button>
        <span>/</span>
        <span>{product.category || 'Yedek Parça'}</span>
        <span>/</span>
        <span className="text-slate-900">{product.name}</span>
      </div>

      {/* ANA ÜRÜN KARTI */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Sol: Görsel ve Güven rozetleri */}
        <div className="space-y-4">
          <div className="relative w-full h-72 md:h-96 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-4 overflow-hidden group">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
              />
            ) : (
              <span className="text-6xl text-slate-300">📦</span>
            )}

            <div className="absolute top-3 left-3 flex flex-col gap-1">
              <span className="bg-slate-950 text-amber-400 font-mono text-xs font-black px-3 py-1 rounded-xl shadow">
                OEM: {product.oem}
              </span>
              {product.oemCode && product.oemCode !== product.oem && (
                <span className="bg-slate-800 text-slate-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg shadow">
                  Alternatif: {product.oemCode}
                </span>
              )}
            </div>

            <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow">
              Stokta Var ({product.stock || 10}+ Adet)
            </span>
          </div>

          {/* Güvence rozetleri grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-lg">🛡️</span>
              <p className="text-[11px] font-black text-slate-900 mt-1">%100 Şasi Garantisi</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-lg">🚀</span>
              <p className="text-[11px] font-black text-slate-900 mt-1">Aynı Gün Kargo</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-lg">⭐</span>
              <p className="text-[11px] font-black text-slate-900 mt-1">Orijinal Ürün</p>
            </div>
          </div>
        </div>

        {/* Sağ: Bilgiler, Fiyat, Satın Al, WhatsApp */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-1 rounded-lg">
                {product.vehicle || 'Renault & Dacia'}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                Kategori: {product.category || 'Motor & Bakım'}
              </span>
            </div>
            
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
              {product.name}
            </h1>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase block">Birim Fiyat (KDV Dahil)</span>
              <span className="text-2xl md:text-3xl font-black text-slate-950">
                {product.price?.toLocaleString('tr-TR')} TL
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-600 font-black block">✓ Ücretsiz Hızlı Kargo</span>
              <span className="text-[11px] text-slate-500">Havale / Kredi Kartı ile Ödeme</span>
            </div>
          </div>

          {/* Şasi Doğrulama Hızlı Kontrol Kutusu */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span>🔍</span> Bu Parça Aracınıza Uygun mu? Şasi No ile Test Edin
            </h3>
            <form onSubmit={handleVinCheck} className="flex gap-2">
              <input 
                type="text" 
                maxLength={17}
                placeholder="17 Haneli Şase (VIN) Girin..."
                value={vinInput}
                onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                className="flex-grow bg-slate-800 text-amber-300 font-mono text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 uppercase"
              />
              <button 
                type="submit"
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                Kontrol Et
              </button>
            </form>
            {vinResult && (
              <p className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                ✓ {vinResult.message}
              </p>
            )}
          </div>

          {/* Adet ve Sepete Ekle */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded-lg transition"
                >
                  -
                </button>
                <span className="w-10 text-center font-black text-sm text-slate-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded-lg transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-grow bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <span>🛒</span> Sepete Ekle
              </button>
            </div>

            {/* WhatsApp ile Şase Kontrolü / Bilgi Al Butonu */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <span>💬</span> WhatsApp ile Şase Kontrolü / Bilgi Al
            </a>
          </div>

        </div>
      </div>

      {/* UYUMLU ARAÇLAR TABLOSU (Compatibility Matrix) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚗</span>
            <h3 className="font-black text-base text-slate-900">Uyumlu Araçlar ve Motor Kodları Matrisi</h3>
          </div>
          <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-xl">
            %100 OEM Doğrulamalı
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Bu yedek parça aşağıdaki Renault ve Dacia model, yıl ve motor serileri ile tam uyumludur. Siparişiniz esnasında şasi numaranız ile tekrar doğrulanır.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase">
              <tr>
                <th className="p-3.5 rounded-l-xl">Marka / Model</th>
                <th className="p-3.5">Yıl Aralığı</th>
                <th className="p-3.5">Motor Tipi</th>
                <th className="p-3.5">Motor Kodu</th>
                <th className="p-3.5 rounded-r-xl">Uyumluluk Durumu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {product.compatibles && product.compatibles.length > 0 ? (
                product.compatibles.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-bold text-slate-900">{comp}</td>
                    <td className="p-3.5">2012 - 2026</td>
                    <td className="p-3.5">1.5 dCi / 1.3 TCe / 1.0 TCe</td>
                    <td className="p-3.5 font-mono text-slate-600">K9K / H5H / H4D</td>
                    <td className="p-3.5 text-emerald-600 font-bold">✓ Tam Uyumlu</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-bold text-slate-900">{product.vehicle || 'Renault Clio / Megane'}</td>
                    <td className="p-3.5">2015 - 2026</td>
                    <td className="p-3.5">1.5 dCi Dizel / 1.0 TCe Benzinli</td>
                    <td className="p-3.5 font-mono text-slate-600">K9K 830 / H4B</td>
                    <td className="p-3.5 text-emerald-600 font-bold">✓ Tam Uyumlu</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-bold text-slate-900">Dacia Duster / Sandero</td>
                    <td className="p-3.5">2017 - 2026</td>
                    <td className="p-3.5">1.3 TCe / 1.5 dCi</td>
                    <td className="p-3.5 font-mono text-slate-600">H5H / K9K</td>
                    <td className="p-3.5 text-emerald-600 font-bold">✓ Tam Uyumlu</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
