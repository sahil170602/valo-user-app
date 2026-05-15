import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Create a reactive state for the live cart count
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Helper function to read fresh count from storage
    const updateCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('valo_cart')) || [];
      setCartCount(cartItems.length);
    };

    // Initialize count on component mount
    updateCount();

    // 2. Listen to custom event triggers across different screens
    window.addEventListener('cart-updated', updateCount);
    window.addEventListener('storage', updateCount); // Handles cross-tab changes

    return () => {
      window.removeEventListener('cart-updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-[calc(0rem+env(safe-area-inset-bottom))] pointer-events-none">
      <div className="bg-white rounded-[32px] h-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-between px-6 pointer-events-auto relative">
        
        {/* Home */}
        <button 
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center gap-1 transition-colors ${location.pathname === '/home' ? 'text-[#6C2BFF]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* Search */}
        <button 
          onClick={() => navigate('/search')}
          className={`flex flex-col items-center gap-1 transition-colors ${location.pathname === '/search' ? 'text-[#6C2BFF]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px] font-bold">Search</span>
        </button>

        {/* Floating Cart Button */}
        <div className="relative -top-8">
          <button 
            onClick={() => navigate('/cart')}
            className="w-16 h-16 bg-[#6C2BFF] rounded-full shadow-[0_8px_25px_rgba(108,43,255,0.4)] flex items-center justify-center text-white active:scale-90 transition-transform border-4 border-[#F8F7FC]"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            
            {/* FIXED: Now reads the live state count variable instead of static length */}
            {cartCount > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-in scale-in duration-200">
                {cartCount}
              </div>
            )}
          </button>
          
          <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold transition-colors ${location.pathname === '/cart' ? 'text-[#6C2BFF]' : 'text-gray-400'}`}>
            Cart
          </span>
        </div>

        {/* Orders */}
        <button 
          onClick={() => navigate('/orders')}
          className={`flex flex-col items-center gap-1 transition-colors ${location.pathname === '/orders' ? 'text-[#6C2BFF]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-[10px] font-bold">Orders</span>
        </button>

        {/* Profile */}
        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${location.pathname === '/profile' ? 'text-[#6C2BFF]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-bold">Profile</span>
        </button>

      </div>
    </div>
  );
}