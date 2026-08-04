import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/Home';
import ProductDetailPage from './pages/ProductDetail';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import AdminDashboardPage from './pages/AdminDashboard';
import LoginPage from './pages/Login';
import OrderTrackPage from './pages/OrderTrack';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      <Navbar 
        navigate={navigate} 
        searchTerm={searchQuery} 
        setSearchTerm={setSearchQuery} 
      />

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
        {currentPage === 'detail' && <ProductDetailPage productId={selectedProductId} navigate={navigate} />}
        {currentPage === 'cart' && <CartPage navigate={navigate} />}
        {currentPage === 'checkout' && <CheckoutPage navigate={navigate} />}
        {currentPage === 'admin' && <AdminDashboardPage navigate={navigate} />}
        {currentPage === 'login' && <LoginPage navigate={navigate} />}
        {currentPage === 'track' && <OrderTrackPage />}
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