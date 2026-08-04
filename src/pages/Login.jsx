import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage({ navigate }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Kayıt Ol (Auth + Firestore veritabanı kaydı)
        const userCredential = await signup(email, password);
        const user = userCredential?.user;
        
        if (user && user.email?.toLowerCase() === 'miracardabayr@gmail.com') {
          navigate('admin');
          return;
        }
      } else {
        // Giriş Yap
        const userCredential = await login(email, password);
        const user = userCredential?.user;

        if (user && user.email?.toLowerCase() === 'miracardabayr@gmail.com') {
          navigate('admin');
          return;
        }
      }
      navigate('home');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kullanımda.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('E-posta veya şifre hatalı.');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifre en az 6 karakter olmalıdır.');
      } else {
        setError('Bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-950">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        
        {/* Başlık */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white tracking-wide">
            {isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {isRegister 
              ? 'Oto Faik ayrıcalıklarından yararlanmak için kaydolun.' 
              : 'Yedek parça siparişlerinizi yönetmek için giriş yapın.'}
          </p>
        </div>

        {/* Tab Değiştirici */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
              !isRegister ? 'bg-amber-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
              isRegister ? 'bg-amber-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs font-bold mb-4 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">E-Posta Adresi</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              className="w-full bg-slate-950 text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-amber-400 focus:outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-amber-400 focus:outline-none transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3.5 rounded-xl transition duration-200 mt-2 shadow-lg shadow-amber-400/10 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'İşlem yapılıyor...' : isRegister ? 'Kayıt Ol ve Başla' : 'Giriş Yap'}
          </button>
        </form>

      </div>
    </div>
  );
}