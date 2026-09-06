import React, { useState, useEffect, useContext } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy, addDoc } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard({ navigate }) {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('orders');

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [enriching, setEnriching] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    oem: '',
    price: '',
    category: 'Fren Sistemi',
    vehicle: 'Clio',
    image: '',
    stock: 10,
    compatibleVin: ''
  });

  // 🔒 Yetki Kontrolü
  useEffect(() => {
    if (authLoading) return;
    const isOwner = currentUser?.email?.toLowerCase() === 'miracardabayr@gmail.com';
    if (!currentUser || !isOwner) {
      alert('Yönetici yetkisi gereklidir.');
      navigate('login');
    }
  }, [currentUser, authLoading, navigate]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (error) {
      console.error('Sipariş hatası:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      setProducts(querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (error) {
      console.error('Ürün hatası:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    const isOwner = currentUser?.email?.toLowerCase() === 'miracardabayr@gmail.com';
    if (currentUser && isOwner) {
      if (orders.length === 0) fetchOrders();
      if (products.length === 0) fetchProducts();
    }
  }, [currentUser]);

  // ⚡ CANLI WEB SCRAPER / API OEM & ŞASİ NO SORGU FONKSİYONU ⚡
  const handleAutoFillOEM = async () => {
    if (!newProduct.name.trim()) {
      alert('Lütfen önce bir ürün adı veya parça tanımı girin.');
      return;
    }

    setEnriching(true);
    try {
      const response = await fetch('/api/oem/enrich-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: newProduct.name })
      });

      const data = await response.json();

      if (data.success && data.oem_details && data.oem_details.length > 0) {
        const bestMatch = data.oem_details[0];

        setNewProduct(prev => ({
          ...prev,
          oem: bestMatch.oem_code || prev.oem,
          vehicle: bestMatch.matched_model || prev.vehicle,
          category: bestMatch.category || prev.category,
          compatibleVin: bestMatch.compatible_vin || prev.compatibleVin
        }));

        alert(`✅ Canlı İnternet Taramasından Veriler Çekildi!\n\nOEM Kodu: ${bestMatch.oem_code || 'Tespit Edilemedi'}\nUyumlu Şasi/Kasa: ${bestMatch.compatible_vin || 'Tüm Standart'}\nModel: ${bestMatch.matched_model}`);
      } else {
        alert(`❌ Eşleşme Bulunamadı:\n${data.message || 'Canlı OEM/Şasi kodu tespit edilemedi. Lütfen ürün ismini kontrol edin.'}`);
      }
    } catch (error) {
      console.error('Canlı OEM API Hatası:', error);
      alert('Canlı OEM servisiyle iletişim kurulurken bir hata oluştu.');
    } finally {
      setEnriching(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      alert('Sipariş güncellenemedi.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bu sipariş tamamen silinecektir?')) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (error) {
      alert('Sipariş silinemedi.');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productPayload = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'products'), productPayload);
      setProducts(prev => [...prev, { id: docRef.id, ...productPayload }]);
      alert('Ürün kataloğa eklendi!');
      setNewProduct({ name: '', oem: '', price: '', category: 'Fren Sistemi', vehicle: 'Clio', image: '', stock: 10, compatibleVin: '' });
    } catch (error) {
      alert('Ürün eklenemedi.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bu ürün katalogdan kaldırılacak?')) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      alert('Ürün silinemedi.');
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingCount = orders.filter(o => !o.status || o.status === 'Hazırlanıyor').length;
  const completedCount = orders.filter(o => o.status === 'Tamamlandı').length;

  const isOwner = currentUser?.email?.toLowerCase() === 'miracardabayr@gmail.com';

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
        <p className="text-xs font-bold text-slate-400">Yönetici Yetkisi Doğrulanıyor...</p>
      </div>
    );
  }

  if (!currentUser || !isOwner) return null;

  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase();
    return (
      (order.name && order.name.toLowerCase().includes(term)) ||
      (order.phone && order.phone.includes(term)) ||
      (order.vin && order.vin.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            ⚙️ Oto Faik <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-xl text-lg">Yönetim Paneli</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Canlı ciro, stoklar ve şasi doğrulamalı sipariş işlemleri</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'orders' ? 'bg-slate-950 text-amber-400 shadow-md' : 'bg-white border text-slate-700 hover:bg-slate-50'}`}
          >
            📦 Siparişler ({orders.length})
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'products' ? 'bg-slate-950 text-amber-400 shadow-md' : 'bg-white border text-slate-700 hover:bg-slate-50'}`}
          >
            🛠️ Katalog Parçaları ({products.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Toplam Ciro</span>
          <p className="text-xl font-black text-slate-950 mt-1">{totalRevenue.toLocaleString('tr-TR')} TL</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-300 p-5 rounded-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">Bekleyen Sipariş</span>
          <p className="text-xl font-black text-amber-900 mt-1">{pendingCount} Sipariş</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-300 p-5 rounded-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Tamamlanan</span>
          <p className="text-xl font-black text-emerald-900 mt-1">{completedCount} Sipariş</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Katalog Parça Sayısı</span>
          <p className="text-xl font-black text-slate-950 mt-1">{products.length} Ürün</p>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <>
          <div className="mb-6">
            <input 
              type="text"
              placeholder="🔍 Müşteri Adı, Telefon veya 17 Haneli VIN Şasi No Sorgula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-3.5 text-xs focus:border-amber-400 focus:outline-none shadow-sm"
            />
          </div>

          {loadingOrders ? (
            <div className="text-center py-12 text-slate-400 text-xs">Yükleniyor...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs shadow-sm">
              Sipariş bulunamadı.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">#{order.id.slice(0, 8)}</span>
                      <h3 className="font-extrabold text-slate-950 text-base">{order.name}</h3>
                      <a href={`tel:${order.phone}`} className="text-xs text-slate-900 font-bold bg-slate-100 px-2.5 py-1 rounded-lg hover:bg-amber-400">
                        📞 {order.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={order.status || 'Hazırlanıyor'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
                      >
                        <option value="Hazırlanıyor">⏳ Hazırlanıyor</option>
                        <option value="Kargolandı">🚚 Kargolandı</option>
                        <option value="Tamamlandı">✅ Tamamlandı</option>
                        <option value="İptal Edildi">❌ İptal Edildi</option>
                      </select>
                      <button onClick={() => handleDeleteOrder(order.id)} className="text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-500 hover:text-white font-bold transition cursor-pointer">
                        Sil
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">🚗 ŞASİ NUMARASI (VIN)</span>
                      <span className="font-mono bg-slate-950 text-amber-400 font-black px-3 py-1.5 rounded-lg block w-fit tracking-wider">
                        {order.vin || 'GİRİLMEDİ'}
                      </span>
                      <span className="text-slate-400 font-bold block mt-3 mb-1">📍 ADRES</span>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{order.address}</p>
                    </div>
                    <div className="lg:col-span-2">
                      <span className="text-slate-400 font-bold block mb-2">📦 SİPARİŞ DÖKÜMÜ</span>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700 border-b border-slate-200/60 pb-1 last:border-0">
                            <span>• {item.name} ({item.quantity || 1} Adet)</span>
                            <span className="font-bold text-slate-950">{item.price} TL</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-100">
                        <span className="text-slate-400 text-[11px]">{order.createdAt ? new Date(order.createdAt).toLocaleString('tr-TR') : ''}</span>
                        <span className="text-base font-black text-slate-950">{order.totalAmount?.toLocaleString('tr-TR')} TL</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm h-fit">
            <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider mb-4">➕ Yeni Ürün Ekle</h3>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <input 
                  required 
                  type="text" 
                  placeholder="Ürün Adı (Örn: R19 Far Sinyal Kumanda Kolu)" 
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none" 
                />
                <button 
                  type="button" 
                  onClick={handleAutoFillOEM} 
                  disabled={enriching}
                  className="mt-1.5 w-full bg-slate-950 hover:bg-slate-800 text-amber-400 text-[11px] font-extrabold py-2 rounded-lg transition cursor-pointer"
                >
                  {enriching ? '🔎 Canlı Web Scraper Taranıyor...' : '⚡ Ürün İsminden Otomatik OEM & Şasi Çek'}
                </button>
              </div>

              <input 
                type="text" 
                placeholder="OEM Kodu (Otomatik Çekilir veya Manuel)" 
                value={newProduct.oem} 
                onChange={e => setNewProduct({...newProduct, oem: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none" 
              />

              <input 
                type="text" 
                placeholder="Uyumlu Şasi No / VIN (Otomatik Dolar)" 
                value={newProduct.compatibleVin} 
                onChange={e => setNewProduct({...newProduct, compatibleVin: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none font-mono" 
              />
              
              <div className="grid grid-cols-2 gap-2">
                <input required type="number" placeholder="Fiyat (TL)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none" />
                <input required type="number" placeholder="Stok" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none">
                  <option value="Fren Sistemi">Fren Sistemi</option>
                  <option value="Motor & Filtre">Motor & Filtre</option>
                  <option value="Aydınlatma">Aydınlatma</option>
                  <option value="Elektrik / Aydınlatma">Elektrik / Aydınlatma</option>
                  <option value="Jant & Kapak">Jant & Kapak</option>
                </select>
                <select value={newProduct.vehicle} onChange={e => setNewProduct({...newProduct, vehicle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none">
                  <option value="Clio">Renault Clio</option>
                  <option value="Megane">Renault Megane</option>
                  <option value="Duster">Dacia Duster</option>
                  <option value="R19 Europa">Renault R19 Europa</option>
                </select>
              </div>

              <input type="url" placeholder="Görsel Bağlantısı (URL)" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none" />
              
              <button type="submit" className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-sm cursor-pointer">
                Kaydet & Yayınla
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider mb-4">📋 Mevcut Ürünler ({products.length})</h3>
            {loadingProducts ? (
              <p className="text-slate-400 text-xs">Yükleniyor...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map(product => (
                  <div key={product.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{product.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {product.vehicle} • <span className="font-mono bg-slate-100 text-slate-800 px-1 py-0.5 rounded">{product.oem || 'OEM Yok'}</span> • <span className="font-bold text-slate-950">{product.price} TL</span>
                      </p>
                      {product.compatibleVin && (
                        <p className="text-[9px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 w-fit">
                          Şasi: {product.compatibleVin}
                        </p>
                      )}
                    </div>
                    <button onClick={() => handleDeleteProduct(product.id)} className="text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg font-bold hover:bg-rose-500 hover:text-white transition cursor-pointer">
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}