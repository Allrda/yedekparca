import React, { createContext, useContext, useState, useEffect } from 'react';

// ==========================================
// 1. MOCK VERİLER (Renault Yedek Parça Listesi)
// ==========================================
const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Megane 4 Ön Fren Disk Takımı',
    oem: '402068439R',
    category: 'Fren Sistemi',
    vehicle: 'Megane 4',
    brand: 'Renault MAIS (Orijinal)',
    price: 3450,
    oldPrice: 3800,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
    description: 'Megane 4 1.5 dCi ve 1.3 TCe motor seçenekleriyle tam uyumlu, orijinal Renault MAIS ön fren disk takımı. Güvenliğiniz için orijinal parça tercih edin.',
    compatibles: ['Megane 4 Sedan (2016-2023)', 'Megane 4 Icon', 'Megane 4 Joy', 'Megane 4 Touch']
  },
  {
    id: 'prod-2',
    name: 'Clio 5 Debriyaj Seti (Baskı Balata)',
    oem: '302058412R',
    category: 'Debriyaj & Şanzıman',
    vehicle: 'Clio 5',
    brand: 'Valeo (Muadil)',
    price: 4900,
    oldPrice: 5300,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=400&q=80',
    description: 'Clio 5 1.0 TCe ve 1.5 Blue dCi araçlar için Valeo marka yüksek mukavemetli debriyaj seti. Uzun ömürlü ve yumuşak pedal hissi sağlar.',
    compatibles: ['Clio 5 (2019-2024)', 'Captur 2 (2020-2024)']
  },
  {
    id: 'prod-3',
    name: 'Fluence 1.5 dCi Periyodik Bakım Seti 4\'lü',
    oem: 'MAIS-FL-FILTER',
    category: 'Filtre & Bakım',
    vehicle: 'Fluence',
    brand: 'Renault MAIS (Orijinal)',
    price: 1850,
    oldPrice: 2100,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
    description: 'Fluence 1.5 dCi motorlar için komple bakım seti. Paket içeriği: Motor Yağı (Elf 5W30 4L), Yağ Filtresi, Hava Filtresi, Polen Filtresi.',
    compatibles: ['Fluence 1.5 dCi (2010-2016)', 'Megane 3 1.5 dCi']
  },
  {
    id: 'prod-4',
    name: 'Symbol Sol Dış Dikiz Aynası Elektrikli',
    oem: '963026360R',
    category: 'Kaporta & Karoser',
    vehicle: 'Symbol',
    brand: 'Sardes (Yan Sanayi)',
    price: 1200,
    oldPrice: 1400,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=400&q=80',
    description: 'Renault Symbol 2013-2020 arası modellerle uyumlu, elektrikli ve boyanabilir astarlı sol dış dikiz aynası.',
    compatibles: ['Symbol 3 (2013-2021)', 'Dacia Logan 2']
  },
  {
    id: 'prod-5',
    name: 'Kadjar Ön Amortisör Sağ/Sol Takım',
    oem: '543022513R',
    category: 'Süspansiyon & Alt Takım',
    vehicle: 'Kadjar',
    brand: 'Monroe (Muadil)',
    price: 5200,
    oldPrice: 5900,
    stock: 4,
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=400&q=80',
    description: 'Renault Kadjar için Monroe marka premium konfor sağlayan sağ ve sol ön amortisör seti. Yol tutuşunu maksimuma çıkarır.',
    compatibles: ['Kadjar (2015-2022)', 'Nissan Qashqai J11']
  },
  {
    id: 'prod-6',
    name: 'Megane 4 Bobin & Buji Seti',
    oem: '224011561R',
    category: 'Ateşleme & Elektrik',
    vehicle: 'Megane 4',
    brand: 'Renault MAIS (Orijinal)',
    price: 2950,
    oldPrice: 3200,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=400&q=80',
    description: 'Megane 4 1.3 TCe ve 1.2 TCe benzinli motorlar için ateşleme bobini ve buji takımı. Yakıt tasarrufu ve pürüzsüz ateşleme performansı sunar.',
    compatibles: ['Megane 4 1.3 TCe', 'Clio 5 1.3 TCe', 'Kadjar 1.3 TCe']
  }
];

const CATEGORIES = [
  'Tümü',
  'Fren Sistemi',
  'Debriyaj & Şanzıman',
  'Filtre & Bakım',
  'Kaporta & Karoser',
  'Süspansiyon & Alt Takım',
  'Ateşleme & Elektrik'
];

const VEHICLES = [
  'Tüm Modeller',
  'Clio 5',
  'Megane 4',
  'Fluence',
  'Symbol',
  'Kadjar'
];

// ==========================================
// 2. DOSYA: src/services/firebase.js (Hata Giderilmiş Güvenli Yapı)
// ==========================================

// Çevre değişkenlerine ES2015 derleyicilerini tetiklemeden dinamik ve güvenli erişim sağlayan yardımcı fonksiyon
const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  try {
    // Statik kod analizi yapan araçların import.meta kontrolünde takılmaması için dinamik Function çağrısı kullanıyoruz
    const metaEnv = Function('return import.meta.env')();
    if (metaEnv && metaEnv[key]) {
      return metaEnv[key];
    }
  } catch (e) {
    // import.meta mevcut değilse veya desteklenmiyorsa sessizce yoksayılır
  }
  return "";
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

const firebaseService = {
  db: {
    getProducts: async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_PRODUCTS), 400);
      });
    },
    addProduct: async (productData) => {
      console.log('Firebase Firestore: "products" koleksiyonuna ekleniyor...', productData);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: 'prod-' + Date.now(), ...productData });
        }, 600);
      });
    }
  },
  auth: {
    signIn: async (email, password) => {
      console.log('Firebase Auth: Giriş yapılıyor...', email);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email && password) {
            resolve({
              uid: 'fb-user-12345',
              email: email,
              displayName: 'Faik Akbay',
              role: email.includes('admin') ? 'admin' : 'user'
            });
          } else {
            reject(new Error('E-posta ve şifre gereklidir.'));
          }
        }, 500);
      });
    },
    signOut: async () => {
      console.log('Firebase Auth: Çıkış yapıldı.');
      return Promise.resolve();
    }
  }
};

// ==========================================
// 3. DOSYA: src/context/AuthContext.jsx
// ==========================================
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('otofaik_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    try {
      const loggedUser = await firebaseService.auth.signIn(email, password);
      setUser(loggedUser);
      localStorage.setItem('otofaik_auth_user', JSON.stringify(loggedUser));
      return loggedUser;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    await firebaseService.auth.signOut();
    setUser(null);
    localStorage.removeItem('otofaik_auth_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// 4. DOSYA: src/context/CartContext.jsx
// ==========================================
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('otofaik_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('otofaik_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, amount) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + amount;
          return { ...item, quantity: newQty < 1 ? 1 : newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

// ==========================================
// SVGS (İkon Kitaplığı - Lucide Bağımlılığı Olmadan Tasarım Güvenliği İçin)
// ==========================================
const Icons = {
  Cart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
    </svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
    </svg>
  ),
  Success: () => (
    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
    </svg>
  )
};

// ==========================================
// 5. DOSYA: src/components/Navbar.jsx
// ==========================================
function Navbar({ navigate, searchQuery, setSearchQuery }) {
  const { cartCount, cartTotal } = useContext(CartContext);
  const { user, logout, isAdmin } = useContext(AuthContext);

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        
        {/* Marka / Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => { setSearchQuery(''); navigate('home'); }}>
          <div className="bg-amber-400 text-slate-950 p-2 rounded-lg font-black text-xl tracking-wider flex items-center gap-1 shadow-inner">
            <span>OTO</span>
            <span className="bg-slate-950 text-white px-1.5 py-0.5 rounded text-sm">FAİK</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">RENAULT & DACIA</h1>
            <p className="text-[10px] text-amber-400 tracking-widest font-medium">YEDEK PARÇA DEPOSU</p>
          </div>
        </div>

        {/* Canlı Arama Çubuğu */}
        <div className="hidden md:flex flex-grow max-w-xl relative">
          <input
            type="text"
            placeholder="Parça adı, OEM kodu veya ürün numarası yazın..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 text-white placeholder-slate-450 pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
          />
          <span className="absolute left-3 top-3 text-slate-400">
            <Icons.Search />
          </span>
        </div>

        {/* Eylem Butonları */}
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button 
              onClick={() => navigate('admin')}
              className="hidden lg:flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-3 py-2 rounded-lg border border-amber-500/20 text-xs font-semibold transition animate-pulse"
            >
              🛠️ Yönetici Paneli
            </button>
          )}

          {/* Oturum Kontrolü */}
          {user ? (
            <div className="relative group flex items-center gap-2 cursor-pointer py-1">
              <div className="w-8 h-8 rounded-full bg-slate-750 flex items-center justify-center text-sm font-semibold text-amber-400 border border-amber-400/50">
                {user.email[0].toUpperCase()}
              </div>
              <div className="hidden xl:block text-left text-xs">
                <p className="font-semibold text-slate-200">Hesabım</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</p>
              </div>
              
              {/* Açılır Profil Menüsü */}
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 w-48 hidden group-hover:block z-50">
                <div className="px-4 py-2 border-b border-slate-700 text-xs font-medium text-slate-300">
                  Hoş geldiniz, <br/><span className="text-amber-400 font-bold">{user.displayName}</span>
                </div>
                {isAdmin && (
                  <button onClick={() => navigate('admin')} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-700 text-slate-200">
                    ⚙️ Panel Yönetimi
                  </button>
                )}
                <button onClick={logout} className="w-full text-left px-4 py-2 text-xs hover:bg-red-500/10 text-red-400">
                  🚪 Çıkış Yap
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => navigate('login')}
              className="text-slate-300 hover:text-amber-400 transition text-xs font-semibold flex items-center gap-1.5"
            >
              <Icons.User />
              <span className="hidden sm:inline">Giriş Yap</span>
            </button>
          )}

          {/* Sepet Widget */}
          <button 
            onClick={() => navigate('cart')}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 p-2.5 rounded-lg flex items-center gap-2 font-bold transition shadow-md hover:shadow-amber-400/20"
          >
            <div className="relative">
              <Icons.Cart />
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-black animate-bounce border border-slate-900">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden lg:block text-left text-xs leading-none">
              <p className="text-[10px] font-medium text-slate-800">Sepetim</p>
              <p className="font-extrabold text-slate-950">{cartTotal.toLocaleString('tr-TR')} TL</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

// ==========================================
// 6. DOSYA: src/components/Footer.jsx
// ==========================================
function Footer({ navigate }) {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-16 pt-12 pb-6 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="space-y-4">
          <div className="bg-amber-400 text-slate-950 p-2 rounded font-black text-base inline-block">
            OTO FAİK RENAULT
          </div>
          <p className="leading-relaxed">
            İstanbul merkezli depomuzdan Türkiye'nin dört bir yanına en hızlı sevkiyat süresiyle Renault, Dacia ve Nissan marka araçlar için uyumlu yedek parçaları sunuyoruz.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">Hızlı Sayfalar</h4>
          <ul className="space-y-2">
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('home'); }} className="hover:text-amber-400 transition">Ana Sayfa</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Hakkımızda</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Banka Hesaplarımız</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Müşteri Yorumları</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">Popüler Seriler</h4>
          <ul className="space-y-2">
            <li><span className="hover:text-amber-400 transition cursor-pointer">Megane 4 Serisi Parçalar</span></li>
            <li><span className="hover:text-amber-400 transition cursor-pointer">Clio 5 Serisi Parçalar</span></li>
            <li><span className="hover:text-amber-400 transition cursor-pointer">Fluence Bakım Ekipmanları</span></li>
            <li><span className="hover:text-amber-400 transition cursor-pointer">Symbol Kaporta Parçaları</span></li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">İrtibat Destek</h4>
          <p>📍 Sanayi Mah. Akbay Cad. No:12 Kartal / İstanbul</p>
          <p>📞 0850 300 34 34</p>
          <p>✉️ destek@otofaikrenault.com</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500">
        <p>© 2026 Oto Faik Renault Parçacı. Tüm Hakları Saklıdır.</p>
        <p>🔒 Güvenli Altyapı | Iyzico & Stripe Entegrasyonuna Hazır</p>
      </div>
    </footer>
  );
}

// ==========================================
// 7. DOSYA: src/components/ProductCard.jsx
// ==========================================
function ProductCard({ product, navigate }) {
  const { addToCart } = useContext(CartContext);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div 
      onClick={() => navigate('detail', product.id)}
      className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-amber-400/50 transition-all duration-350 flex flex-col justify-between overflow-hidden cursor-pointer group"
    >
      <div className="relative">
        {/* Resim alanı */}
        <div className="w-full aspect-[4/3] bg-slate-50 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
        <div className="absolute top-2 left-2 bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded font-mono shadow-sm">
          OEM: {product.oem}
        </div>
        <div className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded font-bold text-white shadow-sm ${
          product.brand.includes('Orijinal') ? 'bg-emerald-600' : 'bg-slate-500'
        }`}>
          {product.brand.includes('Orijinal') ? 'Orijinal MAIS' : 'Yüksek Kalite'}
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <p className="text-amber-500 text-[10px] font-bold uppercase tracking-wider mb-1">{product.vehicle}</p>
          <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2 hover:text-amber-500 transition">
            {product.name}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{product.brand}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
          <div>
            <span className="text-[11px] text-slate-400 line-through block">{product.oldPrice.toLocaleString('tr-TR')} TL</span>
            <span className="text-base font-black text-slate-950">{product.price.toLocaleString('tr-TR')} TL</span>
          </div>
          <button 
            onClick={handleAdd}
            className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1 transition ${
              justAdded 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-900 hover:bg-amber-400 text-white hover:text-slate-950'
            }`}
          >
            {justAdded ? <Icons.Success /> : 'Sepete Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. DOSYA: src/components/CategorySidebar.jsx
// ==========================================
function CategorySidebar({ 
  selectedCategory, 
  setSelectedCategory, 
  selectedVehicle, 
  setSelectedVehicle 
}) {
  return (
    <div className="flex flex-col gap-6 bg-white p-5 rounded-xl border border-slate-150 shadow-sm sticky top-24">
      <div>
        <h3 className="text-slate-900 font-extrabold text-xs border-l-4 border-amber-400 pl-2 mb-4 uppercase tracking-wider">
          🛠️ ARAÇ MODELLERİ
        </h3>
        <div className="flex flex-wrap md:flex-col gap-1">
          {VEHICLES.map(vehicle => (
            <button
              key={vehicle}
              onClick={() => setSelectedVehicle(vehicle)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedVehicle === vehicle 
                  ? 'bg-amber-400 text-slate-950' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🚗 {vehicle}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-slate-900 font-extrabold text-xs border-l-4 border-amber-400 pl-2 mb-4 uppercase tracking-wider">
          ⚙️ PARÇA GRUPLARI
        </h3>
        <div className="flex flex-wrap md:flex-col gap-1">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === category 
                  ? 'bg-amber-400 text-slate-950' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🔧 {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. DOSYA: src/pages/Home.jsx
// ==========================================
function HomePage({ 
  navigate, 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory, 
  selectedVehicle, 
  setSelectedVehicle 
}) {
  const [products] = useState(MOCK_PRODUCTS);

  // Arama, kategori ve araç modeline göre anlık liste filtreleme
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.oem.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Tümü' || product.category === selectedCategory;
    const matchesVehicle = selectedVehicle === 'Tüm Modeller' || product.vehicle === selectedVehicle;

    return matchesSearch && matchesCategory && matchesVehicle;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Büyük Kampanya Bannerı */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-950 to-slate-800 text-white p-8 md:p-12 mb-8 overflow-hidden shadow-xl border border-slate-850">
        <div className="relative z-10 max-w-xl">
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase mb-4 inline-block">
            STOKTAN TESLİMAT & %100 UYUM
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold mb-3">
            Oto Faik ile Renault Yedek Parçada Sıfır Risk!
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed mb-6">
            Ruhsat şase numaranızla parça uyumu kontrol edilir. Yanlış parça alma riskine son verin.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => { setSelectedCategory('Tümü'); setSelectedVehicle('Tüm Modeller'); setSearchQuery(''); }}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black px-4 py-2.5 rounded-lg transition shadow-lg"
            >
              Kataloğu Sıfırla
            </button>
          </div>
        </div>
      </div>

      {/* Ana Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <CategorySidebar 
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
            <h3 className="font-extrabold text-sm text-slate-900">
              {selectedVehicle} &gt; {selectedCategory} ({filteredProducts.length} Ürün Listeleniyor)
            </h3>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 p-12 text-center shadow-sm">
              <span className="text-4xl">🔍</span>
              <h4 className="font-bold text-slate-800 text-sm mt-4">Kriterlere Uygun Parça Bulunamadı</h4>
              <p className="text-xs text-slate-500 mt-1">Lütfen arama kelimenizi veya filtreleri değiştirip tekrar deneyin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. DOSYA: src/pages/ProductDetail.jsx
// ==========================================
function ProductDetailPage({ productId, navigate }) {
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const found = MOCK_PRODUCTS.find(p => p.id === productId);
    setProduct(found || MOCK_PRODUCTS[0]);
  }, [productId]);

  if (!product) return <div className="text-center py-20">Yükleniyor...</div>;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate('home')} className="text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-1">
        ← Kataloğa Dön
      </button>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
        <div className="bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-4">
          <img src={product.image} alt="" className="max-h-[350px] object-contain rounded-lg shadow-sm" />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded">{product.vehicle}</span>
              <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-0.5 rounded">OEM: {product.oem}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-950 mb-4">{product.name}</h2>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-xs text-slate-400 line-through">{product.oldPrice.toLocaleString('tr-TR')} TL</span>
              <span className="text-2xl font-black text-slate-950">{product.price.toLocaleString('tr-TR')} TL</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl mb-6">
              <h4 className="text-xs font-bold text-slate-900 mb-2">Uyumlu Alt Motor & Modeller:</h4>
              <ul className="text-xs text-slate-600 space-y-1">
                {product.compatibles.map((c, i) => <li key={i}>✓ {c}</li>)}
              </ul>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">{product.description}</p>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="w-8 h-8 font-bold">-</button>
              <span className="w-8 text-center text-xs font-bold">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 font-bold">+</button>
            </div>
            <button 
              onClick={handleAddToCart}
              className={`flex-grow bg-slate-900 text-white font-black py-3 rounded-lg text-xs transition ${
                justAdded ? 'bg-emerald-600' : 'hover:bg-amber-400 hover:text-slate-950'
              }`}
            >
              {justAdded ? 'Sepete Eklendi!' : 'Sepete Ekle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 11. DOSYA: src/pages/Cart.jsx
// ==========================================
function CartPage({ navigate }) {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <span className="text-5xl">🛒</span>
        <h3 className="text-lg font-black text-slate-900 mt-4">Sepetiniz Boş</h3>
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
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                  <Icons.Trash />
                </button>
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
            <button onClick={() => navigate('checkout')} className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-2.5 rounded-lg text-xs">
              Siparişi Tamamla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 12. DOSYA: src/pages/Checkout.jsx
// ==========================================
function CheckoutPage({ navigate }) {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    vin: '', // Şase No
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // =======================================================
    // GELECEKTEKİ ÖDEME ENTEGRASYON ALANI (Iyzico / Stripe)
    // =======================================================
    /*
      Örnek olarak Iyzico backend API'sine istek yapma modeli:
      axios.post('/api/iyzico/payment', {
        billingName: formData.name,
        card: { number: formData.cardNumber, cvv: formData.cardCvv, ... },
        products: cartItems,
        chassisNo: formData.vin
      })
    */

    setTimeout(() => {
      setLoading(false);
      clearCart();
      alert('Sipariş Alındı! Teknik ekibimiz şase numaranızı doğrulayarak parçayı kargoya verecektir.');
      navigate('home');
    }, 1800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-xl font-black mb-6">Güvenli Sipariş Sayfası</h2>
      <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Adres ve Şasi Girişi */}
        <div className="space-y-4">
          <div className="bg-white border p-6 rounded-xl space-y-3">
            <h3 className="font-bold text-xs border-b pb-2 uppercase">1. Alıcı & Teslimat</h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Ad Soyad *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded p-2 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Telefon *</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border rounded p-2 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Açık Adres *</label>
              <textarea required name="address" rows="3" value={formData.address} onChange={handleInputChange} className="w-full border rounded p-2 text-xs focus:outline-none"></textarea>
            </div>
          </div>

          <div className="bg-white border p-6 rounded-xl">
            <h3 className="font-bold text-xs border-b pb-2 uppercase flex justify-between items-center">
              <span>2. Şasi Teyit Sistemi</span>
              <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded">Önerilen</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-2 mb-3">
              Parçanın uyumunu garanti altına almak için ruhsattaki 17 haneli şase kodunu yazınız.
            </p>
            <input required type="text" name="vin" maxLength="17" placeholder="VF1..." value={formData.vin} onChange={handleInputChange} className="w-full border rounded p-2 text-xs font-mono uppercase tracking-widest focus:outline-none" />
          </div>
        </div>

        {/* Kart Bilgileri ve Ödeme Tetikleme */}
        <div className="bg-white border p-6 rounded-xl flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-xs border-b pb-2 uppercase">3. Kart Bilgileri</h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Kart Üzerindeki İsim</label>
              <input required type="text" name="cardName" value={formData.cardName} onChange={handleInputChange} className="w-full border rounded p-2 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Kart Numarası</label>
              <input required type="text" name="cardNumber" maxLength="16" placeholder="4543..." value={formData.cardNumber} onChange={handleInputChange} className="w-full border rounded p-2 text-xs focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">SKT (AA/YY)</label>
                <input required type="text" name="cardExpiry" placeholder="04/28" value={formData.cardExpiry} onChange={handleInputChange} className="w-full border rounded p-2 text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">CVV</label>
                <input required type="text" name="cardCvv" maxLength="3" placeholder="***" value={formData.cardCvv} onChange={handleInputChange} className="w-full border rounded p-2 text-xs focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-500">Sipariş Toplamı:</span>
              <span className="text-lg font-black text-slate-900">{cartTotal.toLocaleString('tr-TR')} TL</span>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-amber-400 hover:text-slate-950 text-white font-black py-3 rounded-lg text-xs transition"
            >
              {loading ? 'Ödeme İşleniyor...' : '🔒 Ödemeyi Yap ve Siparişi Tamamla'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

// ==========================================
// 13. DOSYA: src/pages/AdminDashboard.jsx
// ==========================================
function AdminDashboardPage({ navigate }) {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [newProduct, setNewProduct] = useState({
    name: '',
    oem: '',
    category: 'Fren Sistemi',
    vehicle: 'Clio 5',
    brand: '',
    price: '',
    oldPrice: '',
    image: '',
    description: '',
    compatibles: ''
  });

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const added = await firebaseService.db.addProduct({
      ...newProduct,
      price: Number(newProduct.price),
      oldPrice: Number(newProduct.oldPrice || newProduct.price * 1.15),
      stock: 10,
      compatibles: newProduct.compatibles.split(',').map(item => item.trim())
    });

    setProducts([added, ...products]);
    alert('Ürün Firestore\'a kaydedildi (Simüle Edildi).');
    setNewProduct({ name: '', oem: '', category: 'Fren Sistemi', vehicle: 'Clio 5', brand: '', price: '', oldPrice: '', image: '', description: '', compatibles: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black">Yönetici Paneli (Firebase Bağlantılı)</h2>
        <button onClick={() => navigate('home')} className="bg-slate-900 hover:bg-amber-400 hover:text-slate-950 text-white px-3 py-1.5 rounded text-xs transition font-semibold">
          Kataloğa Dön
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white border p-5 rounded-xl">
            <h3 className="font-extrabold text-xs uppercase mb-4 pb-2 border-b">Yeni Parça Ekle</h3>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Parça Adı *</label>
                <input required type="text" name="name" value={newProduct.name} onChange={handleInputChange} className="w-full border rounded p-1.5 text-xs focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">OEM Kodu *</label>
                  <input required type="text" name="oem" value={newProduct.oem} onChange={handleInputChange} className="w-full border rounded p-1.5 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Marka *</label>
                  <input required type="text" name="brand" value={newProduct.brand} onChange={handleInputChange} className="w-full border rounded p-1.5 text-xs focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Kategori</label>
                  <select name="category" value={newProduct.category} onChange={handleInputChange} className="w-full border rounded p-1.5 text-xs focus:outline-none">
                    {CATEGORIES.filter(c => c !== 'Tümü').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Model</label>
                  <select name="vehicle" value={newProduct.vehicle} onChange={handleInputChange} className="w-full border rounded p-1.5 text-xs focus:outline-none">
                    {VEHICLES.filter(v => v !== 'Tüm Modeller').map(veh => <option key={veh} value={veh}>{veh}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Fiyat (TL) *</label>
                  <input required type="number" name="price" value={newProduct.price} onChange={handleInputChange} className="w-full border rounded p-1.5 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Eski Fiyat (TL)</label>
                  <input type="number" name="oldPrice" value={newProduct.oldPrice} onChange={handleInputChange} className="w-full border rounded p-1.5 text-xs focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Resim URL *</label>
                <input required type="text" name="image" value={newProduct.image} onChange={handleInputChange} className="w-full border rounded p-1.5 text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Açıklama</label>
                <textarea name="description" rows="2" value={newProduct.description} onChange={handleInputChange} className="w-full border rounded p-1.5 text-xs focus:outline-none"></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Uyumlu Araçlar (Virgülle Ayırın)</label>
                <input type="text" name="compatibles" value={newProduct.compatibles} onChange={handleInputChange} className="w-full border rounded p-1.5 text-xs focus:outline-none" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-2 rounded text-xs transition hover:bg-amber-400 hover:text-slate-950">
                Kaydet (Firebase API)
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border p-5 rounded-xl">
            <h3 className="font-extrabold text-xs uppercase mb-4 pb-2 border-b">Ürün Listesi (Firestore Verileri)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="p-2">Parça Bilgisi</th>
                    <th className="p-2">OEM Kodu</th>
                    <th className="p-2 text-right">Fiyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="p-2 font-bold">{p.name}</td>
                      <td className="p-2 font-mono text-slate-500">{p.oem}</td>
                      <td className="p-2 text-right font-bold">{p.price.toLocaleString('tr-TR')} TL</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 14. DOSYA: src/pages/Login.jsx
// ==========================================
function LoginPage({ navigate }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password)
      .then((user) => {
        if (user.role === 'admin') {
          navigate('admin');
        } else {
          navigate('home');
        }
      })
      .catch(() => setError('Geçersiz şifre veya e-posta.'));
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white border rounded-2xl p-8 shadow-xl">
        <h2 className="text-xl font-bold text-center mb-6 text-slate-900">Hesap Girişi</h2>
        {error && <div className="bg-red-50 text-red-700 p-2 text-xs rounded mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">E-Posta Adresiniz</label>
            <input required type="email" placeholder="admin@otofaik.com veya musteri@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded p-2 text-xs focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Şifre</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded p-2 text-xs focus:outline-none" />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg text-xs hover:bg-amber-400 hover:text-slate-950 transition">
            Giriş Yap
          </button>
        </form>
        <div className="mt-4 text-center text-[10px] text-slate-400">
          * Yönetici panelini test etmek için e-posta adresine <strong>admin</strong> kelimesini içeren bir adres yazmanız yeterlidir.
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 15. DOSYA: src/App.jsx (Main Routing & Root State)
// ==========================================
export function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedVehicle, setSelectedVehicle] = useState('Tüm Modeller');

  const navigate = (page, productId = null) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (productId) setSelectedProductId(productId);
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Mini Bilgi Barı */}
      <div className="bg-slate-900 text-slate-300 text-[10px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>📞 Telefonla Sipariş Destek Hattı: <strong>0850 300 34 34</strong></span>
          <span className="text-amber-400 font-bold hidden sm:inline">Renault & Dacia Güvenilir Yedek Parçacısı</span>
        </div>
      </div>

      <Navbar navigate={navigate} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="flex-grow">
        {currentPage === 'home' && (
          <HomePage 
            navigate={navigate} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
          />
        )}
        {currentPage === 'detail' && (
          <ProductDetailPage productId={selectedProductId} navigate={navigate} />
        )}
        {currentPage === 'cart' && (
          <CartPage navigate={navigate} />
        )}
        {currentPage === 'checkout' && (
          <CheckoutPage navigate={navigate} />
        )}
        {currentPage === 'admin' && (
          <AdminDashboardPage navigate={navigate} />
        )}
        {currentPage === 'login' && (
          <LoginPage navigate={navigate} />
        )}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}