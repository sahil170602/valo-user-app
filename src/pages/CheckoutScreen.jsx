import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MapPin, CreditCard, Wallet, Banknote, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export default function CheckoutScreen() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); 
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // State to store the generated order ID for the success screen
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const currentCart = JSON.parse(localStorage.getItem('valo_cart')) || [];
    setCartItems(currentCart);

    const savedUser = JSON.parse(localStorage.getItem('valo_user'));
    setUser(savedUser);

    if (currentCart.length === 0) {
      navigate('/home');
    }
  }, [navigate]);

  // --- Hardware Back Button Navigation Handling ---
  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => navigate('/cart');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  // Invoice pricing metrics computations
  const itemTotalSum = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const deliveryFee = itemTotalSum > 0 ? 30 : 0;
  const taxesAndCharges = itemTotalSum > 0 ? 18 : 0;
  const grandTotalPayable = itemTotalSum + deliveryFee + taxesAndCharges;

  // --- Process Order Submission Sequence ---
  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);

      // Generate a dynamic unique clean Order ID format
      const generatedId = `VALO-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);

      // Safely extract the target kitchen ID from the first cart item to ensure precise routing
      const targetKitchenId = cartItems.length > 0 ? cartItems[0].kitchen_id : null;

      const orderPayload = {
        order_id: generatedId,
        user_id: user?.id || null, 
        customer_name: user?.full_name || 'Guest User',
        mobile_number: user?.mobile_number || '',
        
        // FIXED: Use a precise hotel name fallback that matches your kitchen setup
        hotel_name: user?.hotel_name || 'The Valo Grand Hotel', 
        kitchen_id: targetKitchenId, // Included for absolute multi-vendor precision
        
        room_number: user?.room_number || 'N/A',
        items: cartItems,
        payment_method: paymentMethod,
        item_total: itemTotalSum,
        grand_total: grandTotalPayable,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('orders').insert([orderPayload]);
      if (error) throw error;

      // Cache the active order ID in local storage for the global floating tracker widget
      localStorage.setItem('valo_active_order_id', generatedId);

      // Transaction Confirmed: Trigger local cache purification sequence
      setOrderSuccess(true);
      localStorage.removeItem('valo_cart');
      
      // Dispatch events to notify real-time components (BottomNav, ActiveOrderFloatingWidget)
      window.dispatchEvent(new Event('cart-updated')); 
      window.dispatchEvent(new Event('active-order-changed'));

    } catch (error) {
      console.error('Checkout processing breakdown failure:', error.message);
      alert('Order processing error. Please check backend connection rules parameters.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // --- RE-DESIGNED ORDER CONFIRMED SUCCESS SCREEN VIEW ---
  if (orderSuccess) {
    return (
      <div className="h-[100dvh] bg-[#F8F7FC] font-sans flex flex-col items-center justify-between p-6 text-center z-[100] relative">
        
        <div className="w-full pt-12"></div>

        <div className="w-full flex flex-col items-center max-w-sm px-4">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm shadow-green-100">
            <CheckCircle2 size={56} strokeWidth={1.5} />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">Order Confirmed!</h2>
          <p className="text-sm font-semibold text-gray-400">We received your order</p>
          
          <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl mt-4 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Order ID: <span className="text-gray-900 font-black">{orderId}</span>
            </p>
          </div>

          <div className="w-full bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mt-8 flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#F4F0FF] flex items-center justify-center text-[#6C2BFF] shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Delivery</p>
              <h4 className="text-lg font-black text-gray-900 mt-0.5">30 to 35 mins</h4>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button 
            onClick={() => navigate(`/order-details/${orderId}`)}
            className="w-full bg-[#6C2BFF] h-14 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-[#6C2BFF]/20 active:scale-[0.98] transition-all hover:bg-[#5B21E6]"
          >
            Track Order
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-[#F8F7FC] font-sans flex flex-col overflow-hidden relative">
      
      {/* 1. Funnel App Header block */}
      <div className="bg-white pt-4 pb-4 px-5 shadow-sm border-b border-gray-100 flex items-center gap-3 shrink-0 z-40">
        <button onClick={() => navigate('/cart')} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 active:scale-95 transition-transform border border-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Checkout</h2>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Final Confirmation Step</p>
        </div>
      </div>

      {/* 2. Scrollable Forms Content Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-5 pb-[120px] space-y-5">
        
        {/* BLOCK A: Delivery Location Specs */}
        <div className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
            <MapPin size={14} className="text-[#6C2BFF]" />
            <h3>Delivery Destination</h3>
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-base font-black text-gray-900">Room {user?.room_number || 'N/A'}</h4>
            <p className="text-sm font-semibold text-gray-500">{user?.hotel_name || 'The Valo Grand Hotel'}</p>
            <div className="w-full h-px bg-gray-50 my-2"></div>
            <p className="text-xs text-gray-400 font-bold">Contact: {user?.full_name} ({user?.mobile_number})</p>
          </div>
        </div>

        {/* BLOCK B: Payment Instrument Selection */}
        <div className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
            <CreditCard size={14} className="text-[#6C2BFF]" />
            <h3>Payment Options</h3>
          </div>
          
          <div className="space-y-3">
            <label onClick={() => setPaymentMethod('upi')} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-[#6C2BFF] bg-[#F4F0FF]/20' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${paymentMethod === 'upi' ? 'bg-[#6C2BFF] text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                  <Wallet size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-800">Pay via UPI Options</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">GPay / PhonePe / Paytm</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-[#6C2BFF]' : 'border-gray-300'}`}>
                {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 bg-[#6C2BFF] rounded-full"></div>}
              </div>
            </label>

            <label onClick={() => setPaymentMethod('cod')} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#6C2BFF] bg-[#F4F0FF]/20' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-[#6C2BFF] text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                  <Banknote size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-800">Cash on Delivery (COD)</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Pay at your room door step</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#6C2BFF]' : 'border-gray-300'}`}>
                {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-[#6C2BFF] rounded-full"></div>}
              </div>
            </label>
          </div>
        </div>

        {/* BLOCK C: Summary Breakdown */}
        <div className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
            <ShieldCheck size={14} className="text-[#6C2BFF]" />
            <h3>Order Summary Breakdown</h3>
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-500">
            <span>Basket Total Sum</span>
            <span className="text-gray-800">₹{itemTotalSum}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-500">
            <span>Hotel Room Delivery Fees</span>
            <span className="text-gray-800">₹{deliveryFee}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-500">
            <span>Restaurant Taxes & operational GST</span>
            <span className="text-gray-800">₹{taxesAndCharges}</span>
          </div>
          <div className="w-full h-px bg-gray-50 my-2"></div>
          <div className="flex justify-between text-sm font-black text-gray-900">
            <span>Grand Total Amount Payable</span>
            <span className="text-[#6C2BFF] text-base">₹{grandTotalPayable}</span>
          </div>
        </div>

      </div>

      {/* 3. Bottom Sticky Action Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-50 shadow-[0_-8px_35px_rgba(0,0,0,0.03)] flex items-center justify-between gap-5 shrink-0">
        <div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payable Total</span>
          <h3 className="text-2xl font-black text-gray-900 mt-0.5">₹{grandTotalPayable}</h3>
        </div>
        
        <button 
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || cartItems.length === 0}
          className="flex-1 bg-[#6C2BFF] h-14 rounded-2xl flex items-center justify-center gap-2 text-white font-black text-sm shadow-xl shadow-[#6C2BFF]/20 active:scale-[0.98] transition-all hover:bg-[#5B21E6] disabled:bg-gray-200 disabled:shadow-none"
        >
          {isPlacingOrder ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span>Place Order</span>
          )}
        </button>
      </div>

    </div>
  );
}