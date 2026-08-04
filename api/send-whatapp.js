// api/send-whatsapp.js
export default async function handler(req, res) {
  // Yalnızca POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { name, phone, address, vin, items, totalAmount } = req.body;

    // 🔑 Vercel Environment Variables üzerinden çekilen Twilio bilgileri
    const accountSid = process.env.TWILIO_ACCOUNT_SID; 'ACfa9a3a3bb3f723859e8874e086320c94'
    const authToken = process.env.TWILIO_AUTH_TOKEN; '5f85b3769ae88574e254bdeb379aa4d8'
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '+13609733867';
    const myPhone = process.env.MY_PHONE_NUMBER || '+905317855229';

    if (!accountSid || !authToken) {
      return res.status(500).json({ success: false, error: 'Twilio API bilgileri Vercel ayarlarında eksik!' });
    }

    if (!items || !name) {
      return res.status(400).json({ success: false, error: 'Eksik sipariş verisi!' });
    }

    // 📦 Sipariş Parçaları Şablonu (Adet bilgisi eklendi)
    const itemsSummary = Array.isArray(items) && items.length > 0
      ? items.map(item => `• *${item.name}* (${item.quantity || 1} Adet) - ${Number(item.price || 0).toLocaleString('tr-TR')} TL`).join('\n')
      : '• Parça bilgisi bulunamadı';

    // 💰 Güvenli Toplam Tutar Hesaplama
    const formattedTotal = Number(totalAmount || 0).toLocaleString('tr-TR');

    // 🚨 7/24 SANA GELECEK SIPARİŞ BİLDİRİM ŞABLONU
    const messageBody = 
      `🚗 *OTO FAİK - YENİ SİPARİŞ!*\n\n` +
      `👤 *Müşteri:* ${name}\n` +
      `📞 *Tel:* ${phone}\n` +
      `🔍 *Şasi No:* ${vin}\n` +
      `📍 *Adres:* ${address}\n\n` +
      `📦 *Parçalar:*\n${itemsSummary}\n\n` +
      `💰 *Toplam Tutar:* ${formattedTotal} TL\n` +
      `⏰ *Tarih:* ${new Date().toLocaleString('tr-TR')}`;

    // Twilio REST API Bağlantısı (Basic Auth)
    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const params = new URLSearchParams();
    params.append('From', `whatsapp:${twilioPhone}`);
    params.append('To', `whatsapp:${myPhone}`);
    params.append('Body', messageBody);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      }
    );

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, sid: data.sid });
    } else {
      console.error('Twilio Gönderim Hatası:', data);
      return res.status(500).json({ success: false, error: data.message || 'Twilio mesajı gönderemedi.' });
    }
  } catch (err) {
    console.error('Vercel Serverless Sunucu Hatası:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}