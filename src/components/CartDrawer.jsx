import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export default function CartDrawer({ navigate }) {
  const { cartItems, isCartOpen, closeCart, updateQuantity, removeFromCart, cartTotal, cartCount, clearCart } = useContext(CartContext);

  if (!isCartOpen) return null;

  const whatsappMessage = encodeURIComponent(
    `Merhaba Oto Faik, sepetimde ${cartCount} adet ürün bulunuyor. Toplam Tutar: ${cartTotal.toLocaleString('tr-TR')} TL. Siparişimi tamamlamak ve şasi kontrolü yapmak istiyorum.`
  );
  const whatsappUrl = `https://wa.me/905320000000?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={closeCart} 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xl">🛒</span>
              <div>
                <h2 className="font-black text-base">Sepetim ({cartCount} Parça)</h2>
                <p className="text-[10px] text-slate-400">%100 Şasi Uyum Kontrollü Sepet</p>
              </div>
            </div>
            <button 
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Free shipping progress */}
          <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-100 flex items-center justify-between text-xs font-bold text-amber-900">
            <span>🚀 Aynı Gün Kargo & Ücretsiz Teslimat</span>
            <span>{cartTotal >= 1500 ? 'Kargo Bedava! 🎉' : `${(1500 - cartTotal).toLocaleString('tr-TR')} TL kaldı`}</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <span className="text-5xl">🛒</span>
                <p className="font-black text-slate-900 text-base">Sepetiniz Boş</p>
                <p className="text-xs text-slate-500">Renault veya Dacia orijinal yedek parçalarını sepete ekleyin.</p>
                <button 
                  onClick={() => { closeCart(); navigate('home'); }}
                  className="mt-2 bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition"
                >
                  Alışverişe Başla
                </button>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center gap-4 relative group">
                  <div className="w-16 h-16 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-1 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <span className="bg-slate-950 text-amber-400 font-mono text-[9px] font-black px-1.5 py-0.5 rounded">
                      OEM: {item.oem}
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-900 truncate mt-1">{item.name}</h4>
                    <p className="text-xs font-black text-slate-950 mt-1">
                      {(item.price * item.quantity).toLocaleString('tr-TR')} TL
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-500 text-xs transition"
                      title="Ürünü Sil"
                    >
                      🗑️
                    </button>
                    
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg px-1 py-0.5">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-slate-100 rounded"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-slate-100 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout Actions */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Ara Toplam</span>
                  <span>{cartTotal.toLocaleString('tr-TR')} TL</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Kargo (16:00'a kadar Aynı Gün)</span>
                  <span className="text-emerald-600 font-bold">{cartTotal >= 1500 ? 'Ücretsiz' : '49,90 TL'}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                  <span>Genel Toplam</span>
                  <span className="text-amber-600 text-base">
                    {(cartTotal >= 1500 ? cartTotal : cartTotal + (cartTotal > 0 ? 49.90 : 0)).toLocaleString('tr-TR')} TL
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => { closeCart(); navigate('checkout'); }}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition active:scale-95 text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🔒</span> Güvenli Ödemeye Geç
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl shadow transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <span>💬</span> WhatsApp ile Hızlı Sipariş / Şase Kontrol
                </a>

                <button
                  onClick={clearCart}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-rose-600 font-bold py-1 transition"
                >
                  Sepeti Temizle
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
