import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import HotelSelectionScreen from './pages/HotelSelectionScreen';
import HomeScreen from './pages/HomeScreen';
import SearchScreen from './pages/SearchScreen'; 
import OrdersScreen from './pages/OrdersScreen';
import ProfileScreen from './pages/ProfileScreen';
import SectionDishesScreen from './pages/SectionDishesScreen';
import DishDetailsScreen from './pages/DishDetailsScreen';
import CartScreen from './pages/CartScreen';
import CheckoutScreen from './pages/CheckoutScreen';
import OrderDetailsScreen from './pages/OrderDetailsScreen';

// IMPORT THE GLOBAL FLOATING WIDGET TRACKER LAYOUT LAYER
import ActiveOrderFloatingWidget from './components/home/ActiveOrderFloatingWidget';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Check if user is already logged in
    const savedUser = localStorage.getItem('valo_user');
    if (savedUser) {
      setIsAuthenticated(true);
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* If authenticated, "/" takes them to Home. Otherwise, Login. */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LoginScreen />} />
        <Route path="/select-hotel" element={<HotelSelectionScreen setIsAuthenticated={setIsAuthenticated} />} />
        
        {/* Main App Routes */}
        <Route path="/home" element={<HomeScreen setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/search" element={<SearchScreen />} /> {/* 2. Add the Search Route */}
        <Route path="/orders" element={<OrdersScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/section/:sectionId" element={<SectionDishesScreen />} />
        <Route path="/dish/:dishId" element={<DishDetailsScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/checkout" element={<CheckoutScreen />} />
        <Route path="/order-details/:orderId" element={<OrderDetailsScreen />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* FIXED: Global tracker overlay layer placed outside route switches to inject on home screens seamlessly */}
      <ActiveOrderFloatingWidget />
    </BrowserRouter>
  );
}