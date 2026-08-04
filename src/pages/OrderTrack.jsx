import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function OrderTrackPage() {
  const [queryInput, setQueryInput] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    setLoading(true);
    setOrders(null);

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('phone', '==', queryInput.trim()));
      const snapshot = await getDocs(q);

      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Sorgulama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-950">📦 Sipariş Takibi</h1>
        <p className="text-xs text-slate-500 mt-2">
          Sipariş verdiğiniz telefon numaranızı girerek canlı durumunu sorgulayabilirsiniz.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input 
          required 
          type="tel" 
          placeholder="Örn: 05317855229" 
          value={queryInput} 
          onChange={(e) => setQueryInput(e.target.value)} 
          className="flex-grow bg-white border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 focus:border-amber-400 focus:outline-none shadow-sm" 
        />
        <button type="submit" disabled={loading} className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs transition shadow-md">
          {loading ? 'Aranıyor...' : 'Sorgula'}
        </button>
      </form>

      {orders !== null && (
        orders.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-xs text-slate-500 shadow-sm">
            Bu telefon numarasına ait sipariş bulunamadı.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-xs font-mono text-slate-400">Sipariş ID: #{order.id.slice(0, 8)}</span>
                  <span className="text-xs font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full">
                    {order.status || 'Hazırlanıyor'}
                  </span>
                </div>
                <div className="mt-4 text-xs space-y-1 text-slate-700">
                  <p><strong>Alıcı:</strong> {order.name}</p>
                  <p><strong>Şasi Kodu:</strong> <span className="font-mono font-bold text-slate-950">{order.vin}</span></p>
                  <p><strong>Toplam Tutar:</strong> {order.totalAmount?.toLocaleString('tr-TR')} TL</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}