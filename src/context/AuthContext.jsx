import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sabit Admin E-posta Adresi
  const ADMIN_EMAIL = 'miracardabayr@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          let userData = userDoc.exists() ? userDoc.data() : null;
          const isAdminUser = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

          // Firestore'da kullanıcı yoksa oluştur
          if (!userData) {
            userData = {
              uid: user.uid,
              email: user.email,
              role: isAdminUser ? 'admin' : 'user',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, userData, { merge: true });
          }

          setCurrentUser({
            uid: user.uid,
            email: user.email,
            role: userData.role || (isAdminUser ? 'admin' : 'user'),
            isAdmin: userData.role === 'admin' || isAdminUser
          });
        } catch (error) {
          console.error("Firestore okuma/yazma hatası:", error);
          const isAdminUser = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            role: isAdminUser ? 'admin' : 'user',
            isAdmin: isAdminUser
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Kayıt Olma Fonksiyonu
  const registerUser = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const isAdminUser = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const newUserObj = {
      uid: user.uid,
      email: user.email,
      role: isAdminUser ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };

    // Firestore `users` koleksiyonuna kayıt ekleme
    try {
      await setDoc(doc(db, 'users', user.uid), newUserObj);
    } catch (e) {
      console.error("Firestore kayıt hatası:", e);
    }

    return userCredential;
  };

  // Giriş Yapma Fonksiyonu
  const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Çıkış Yapma Fonksiyonu
  const logoutUser = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    user: currentUser,
    isAdmin: currentUser?.isAdmin || false,
    login: loginUser,
    signup: registerUser,
    register: registerUser, // İki isimle de çağrılabilsin diye
    logout: logoutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}