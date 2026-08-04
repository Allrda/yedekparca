import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { createOrder } from '../services/firebase';
import emailjs from '@emailjs/browser';

export default function CheckoutPage({ navigate }) {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    address: '', 
    vin: '', 
    cardNumber: '', 
    cardName: '', 
    cardExpiry: '', 
    cardCvv: '' 
  });
  const [loading, setLoading] = useState(false);

  const EMAILJS_SERVICE_ID = 'service_ynr6gqi';
  const EMAILJS_TEMPLATE_ID = 'template_882ih6q';
  const EMAILJS_PUBLIC_KEY = 'Kerlft3Wvgksw8yBH';

  // 🛠️ Kredi Kartı & VIN Maskeleme Mantığı
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      const raw = value.replace(/\D/g, '').slice(0, 16);
      const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, cardNumber: formatted }));
      return;
    }

    if (name === 'cardExpiry') {
      const raw = value.replace(/\D/g, '').slice(0, 4);
      let formatted = raw;
      if (raw.length >= 3) {
        formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
      }
      setFormData(prev => ({ ...prev, cardExpiry: formatted }));
      return;
    }

    if (name === 'vin') {
      const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17);
      setFormData(prev => ({ ...prev, vin: formatted }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendEmailNotification = async (orderData) => {
    const itemsList = orderData.items
      .map(item => `• ${item.name} (${item.quantity || 1} Adet) - ${item.price} TL`)
      .join('\n');

    const templateParams = {
      customer_name: orderData.name,
      customer_phone: orderData.phone,
      customer_address: orderData.address,
      vin_number: orderData.vin,
      total_amount: orderData.totalAmount.toLocaleString('tr-TR'),
      order_items: itemsList,
      to_email: 'miracardabayr@gmail.com'
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
    } catch (error) {
      console.error('❌ E-posta gönderim hatası:', error);
    }
  };

  const sendWhatsAppNotification = async (orderData) => {
    try {
      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
    } catch (error) {
      console.error('❌ Twilio istek hatası:', error);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (formData.vin.length !== 17) {
      alert('Lütfen 17 haneli geçerli Şasi Numarasını (VIN) eksiksiz giriniz.');
      return;
    }

    setLoading(true);
    const orderPayload = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      vin: formData.vin,
      items: cartItems,
      totalAmount: cartTotal,
      createdAt: new Date().toISOString()
    };

    try {
      await createOrder(orderPayload);
      await Promise.allSettled([
        sendEmailNotification(orderPayload),
        sendWhatsAppNotification(orderPayload)
      ]);

      clearCart();
      alert('Siparişiniz başarıyla alındı! Şasi numaranız kontrol edilerek kargoya verilecektir.');
      navigate('home');
    } catch (error) {
      alert('Sipariş verilirken bir sorun oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-black text-slate-950 mb-6 flex items-center gap-2">
        <span>🔒</span> Güvenli Ödeme & Şasi Doğrulama
      </h2>
      
      <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Sol Kolon */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
            <h3 className="font-extrabold text-xs text-amber-600 border-b border-slate-100 pb-2 uppercase tracking-wider">
              1. Alıcı & Teslimat Bilgileri
            </h3>
            <input 
              required 
              type="text" 
              name="name" 
              placeholder="Ad Soyad" 
              value={formData.name} 
              onChange={handleInputChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none" 
            />
            <input 
              required 
              type="tel" 
              name="phone" 
              placeholder="Telefon (05XX...)" 
              value={formData.phone} 
              onChange={handleInputChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none" 
            />
            <textarea 
              required 
              name="address" 
              rows="3" 
              placeholder="Açık Teslimat Adresi" 
              value={formData.address} 
              onChange={handleInputChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none"
            ></textarea>
          </div>

          <div className="bg-amber-500/10 border border-amber-400/40 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-xs text-slate-950 uppercase tracking-wider">
                2. Şasi Numarası (VIN)
              </h3>
              <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                {formData.vin.length}/17
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mb-3">Parça uyumsuzluğunu %100 engellemek için ruhsatınızdaki 17 haneli şasi kodunu girin.</p>
            <input 
              required 
              type="text" 
              name="vin" 
              placeholder="Örn: VF1RFB00000000000" 
              value={formData.vin} 
              onChange={handleInputChange} 
              className="w-full bg-white border border-amber-300 rounded-xl p-3 text-xs font-mono uppercase text-slate-900 tracking-widest focus:border-amber-500 focus:outline-none shadow-sm" 
            />
          </div>
        </div>

        {/* Sağ Kolon */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-extrabold text-xs text-amber-600 border-b border-slate-100 pb-2 uppercase tracking-wider">
              3. Kart Bilgileri
            </h3>
            <input 
              required 
              type="text" 
              name="cardName" 
              placeholder="Kart Üzerindeki İsim" 
              value={formData.cardName} 
              onChange={handleInputChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none" 
            />
            <input 
              required 
              type="text" 
              name="cardNumber" 
              placeholder="**** **** **** ****" 
              value={formData.cardNumber} 
              onChange={handleInputChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono tracking-wider focus:border-amber-400 focus:bg-white focus:outline-none" 
            />
            <div className="grid grid-cols-2 gap-2">
              <input 
                required 
                type="text" 
                name="cardExpiry" 
                placeholder="AA/YY" 
                value={formData.cardExpiry} 
                onChange={handleInputChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:border-amber-400 focus:bg-white focus:outline-none" 
              />
              <input 
                required 
                type="text" 
                name="cardCvv" 
                maxLength="3" 
                placeholder="CVV" 
                value={formData.cardCvv} 
                onChange={handleInputChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:border-amber-400 focus:bg-white focus:outline-none" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-3.5 rounded-xl text-xs transition duration-200 shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sipariş İşleniyor...' : `🔒 Ödemeyi Tamamla (${cartTotal.toLocaleString('tr-TR')} TL)`}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}