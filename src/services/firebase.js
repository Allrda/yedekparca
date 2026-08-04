import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from "firebase/auth";

// Mock Veriler (Fallback için)
export const MOCK_PRODUCTS = [
  {
    id: "7701478505",
    oem: "7701478505",
    oemCode: "7701478505",
    name: "Triger Seti Renault 1.5 dCi",
    category: "Motor",
    vehicle: "Clio 4",
    price: 1850.00,
    stock: 15,
    image: "https://via.placeholder.com/150",
    compatibles: ["Clio 4 1.5 dCi", "Megane 3 1.5 dCi"]
  },
  {
    id: "8200768913",
    oem: "8200768913",
    oemCode: "8200768913",
    name: "Yağ Filtresi Renault",
    category: "Bakım",
    vehicle: "Megane 3",
    price: 250.00,
    stock: 50,
    image: "https://via.placeholder.com/150",
    compatibles: ["Megane 3 1.5 dCi", "Fluence 1.5 dCi"]
  }
];

// Firebase Yapılandırması
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// --- AUTH İŞLEMLERİ ---
export const loginWithFirebase = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const registerWithFirebase = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logoutFromFirebase = () => firebaseSignOut(auth);

// --- FIRESTORE ÜRÜN İŞLEMLERİ ---
export const fetchProductsFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products.length > 0 ? products : MOCK_PRODUCTS;
  } catch (error) {
    console.error("Firestore ürünler çekilirken hata:", error);
    return MOCK_PRODUCTS;
  }
};

export const fetchProductByOEM = async (oemCode) => {
  try {
    const q = query(collection(db, "products"), where("oem", "==", oemCode.trim()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("OEM sorgu hatası:", error);
    return null;
  }
};

export const fetchProductById = async (id) => {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : MOCK_PRODUCTS.find(p => p.id === id) || null;
  } catch (error) {
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  }
};

export const addProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, "products"), {
      ...productData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error("Ürün ekleme hatası:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    await updateDoc(doc(db, "products", id), productData);
    return true;
  } catch (error) {
    console.error("Ürün güncelleme hatası:", error);
    return false;
  }
};

export const deleteProduct = async (id) => {
  try {
    await deleteDoc(doc(db, "products", id));
    return true;
  } catch (error) {
    console.error("Ürün silme hatası:", error);
    return false;
  }
};

// --- SİPARİŞ OLUŞTURMA ---
export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      status: "Beklemede",
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error("Sipariş oluşturma hatası:", error);
    throw error;
  }
};

export const firebaseService = {
  db,
  auth,
  loginWithFirebase,
  registerWithFirebase,
  logoutFromFirebase,
  fetchProducts: fetchProductsFromFirebase,
  fetchProductByOEM,
  fetchProductById,
  getProducts: fetchProductsFromFirebase,
  addProduct,
  updateProduct,
  deleteProduct,
  createOrder
};

export default firebaseService;