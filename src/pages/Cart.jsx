import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export default function CartPage({ navigate }) {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h3 className="text-lg font-black text-slate-900">Sepetiniz Boş</h3>
        <button onClick={() => navigate('home')} className="mt-4 bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded">
          Alışverişe Başla
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-xl font-black mb-6">Sepetim</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white border p-4 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={item.image} className="w-12 h-12 object-cover rounded border" alt="" />
                <div>
                  <h4 className="font-bold text-xs">{item.name}</h4>
                  <p className="text-[10px] text-slate-400">OEM: {item.oem}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-100 rounded px-1.5 py-0.5">
                  <button onClick={() => updateQuantity(item.id, -1)} className="font-bold text-xs">-</button>
                  <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="font-bold text-xs">+</button>
                </div>
                <span className="font-bold text-xs">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">🗑️</button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-xs uppercase mb-4 border-b pb-2">Ödeme Özeti</h3>
            <div className="flex justify-between text-xs mb-4">
              <span>Toplam Tutar</span>
              <span className="font-black">{cartTotal.toLocaleString('tr-TR')} TL</span>
            </div>
            <button onClick={() => navigate('checkout')} className="w-full bg-amber-400 text-slate-950 font-black py-2.5 rounded-lg text-xs">
              Siparişi Tamamla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
