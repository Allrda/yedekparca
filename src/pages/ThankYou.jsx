import React, { useEffect, useState } from 'react';

export default function ThankYouPage({ navigate }) {
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    try {
      const last = localStorage.getItem('lastOrder');
      if (last) {
        setOrderData(JSON.parse(last));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-sm text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-inner">
          ✓
        </div>
        
        <div>
          <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            Siparişiniz Başarıyla Alındı
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-3">
            Teşekkür Ederiz, {orderData?.name || 'Değerli Müşterimiz'}!
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Siparişiniz başarıyla oluşturulmuştur. Uzman ekibimiz 17 haneli şasi numaranızı (<span className="font-mono font-bold text-slate-800">{orderData?.vin || 'N/A'}</span>) kontrol ederek parçaların tam uyumunu teyit edecek ve aynı gün kargoya verecektir.
          </p>
        </div>

        {orderData && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-left space-y-3 max-w-lg mx-auto">
            <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold">Sipariş Numarası:</span>
              <span className="font-black text-slate-900">{orderData.orderNumber || 'OF-884920'}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold">Alıcı Telefon:</span>
              <span className="font-bold text-slate-900">{orderData.phone}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold">Teslimat Adresi:</span>
              <span className="font-medium text-slate-900 truncate max-w-[250px]">{orderData.address}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-slate-500 font-bold">Toplam Tutar:</span>
              <span className="text-base font-black text-slate-950">
                {orderData.totalAmount?.toLocaleString('tr-TR')} TL
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('track')}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs px-6 py-3.5 rounded-2xl shadow-md transition active:scale-95 cursor-pointer"
          >
            📍 Sipariş Durumunu Takip Et
          </button>
          <button
            onClick={() => navigate('home')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs px-6 py-3.5 rounded-2xl transition cursor-pointer"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}
