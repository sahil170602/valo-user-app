import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/home/BottomNav';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, FileText, ChevronRight } from 'lucide-react';

export default function CartScreen() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  
  // DYNAMIC: Create reactive state for delivery target address
  const [user, setUser] = useState(null);

  // Load items from local storage cart profile
  useEffect(() => {
    const currentCart = JSON.parse(localStorage.getItem('valo_cart')) || [];
    setCartItems(currentCart);

    // Fetch fresh user metadata parameters on screen paint
    const savedUser = JSON.parse(localStorage.getItem('valo_user'));
    setUser(savedUser);
  }, []);

  // Sync state changes back into client memory storage
  const updateCartStorage = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem('valo_cart', JSON.stringify(updatedCart));
    
    // Broadcast message to update bottom badge in real time
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleIncrement = (cartLineId) => {
    const updated = cartItems.map(item => {
      if (item.cartLineId === cartLineId) {
        const newQty = item.quantity + 1;
        const singleItemPrice = item.itemTotal / item.quantity;
        return { ...item, quantity: newQty, itemTotal: singleItemPrice * newQty };
      }
      return item;
    });
    updateCartStorage(updated);
  };

  const handleDecrement = (cartLineId) => {
    const targetItem = cartItems.find(item => item.cartLineId === cartLineId);
    if (!targetItem) return;

    if (targetItem.quantity <= 1) {
      const updated = cartItems.filter(item => item.cartLineId !== cartLineId);
      updateCartStorage(updated);
    } else {
      const updated = cartItems.map(item => {
        if (item.cartLineId === cartLineId) {
          const newQty = item.quantity - 1;
          const singleItemPrice = item.itemTotal / item.quantity;
          return { ...item, quantity: newQty, itemTotal: singleItemPrice * newQty };
        }
        return item;
      });
      updateCartStorage(updated);
    }
  };

  const handleRemoveItem = (cartLineId) => {
    const updated = cartItems.filter(item => item.cartLineId !== cartLineId);
    updateCartStorage(updated);
  };

  // Pricing calculations parameters
  const itemTotalSum = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const deliveryFee = itemTotalSum > 0 ? 30 : 0;
  const taxesAndCharges = itemTotalSum > 0 ? 18 : 0;
  const grandTotalPayable = itemTotalSum + deliveryFee + taxesAndCharges;

  return (
    <div className="h-[100dvh] bg-[#F8F7FC] font-sans flex flex-col overflow-hidden relative">
      
      {/* Top Header Panel (pt-12 prevents status bar overlaps) */}
      <div className="bg-white pt-4 pb-4 px-5 shadow-sm border-b border-gray-100 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="text-gray-900 active:scale-95 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-black text-gray-900">My Cart</h2>
        </div>
        <span className="bg-[#F4F0FF] text-[#6C2BFF] text-xs font-black px-3 py-1.5 rounded-xl">
          {cartItems.length} Items
        </span>
      </div>

      {/* Main Container Scrolling Box view */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-[220px]">
        
        {/* DYNAMIC: Unified Delivery Location Destination Widget */}
        <div className="mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4F0FF] flex items-center justify-center text-[#6C2BFF]">📍</div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Delivering to</p>
              <h3 className="text-[13px] font-bold text-gray-900 leading-none mt-1">
                {user?.room_number ? `Room ${user.room_number}, ${user.hotel_name || 'Hotel'}` : 'Selecting address...'}
              </h3>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-20 h-20 bg-white border border-gray-100 rounded-[28px] shadow-sm flex items-center justify-center text-gray-300 mb-4">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">Your cart is empty</h3>
            <p className="text-xs font-medium text-gray-400 max-w-[220px]">Add delicious dishes from hotel kitchens to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* List Loop Card Container */}
            {cartItems.map(item => (
              <div key={item.cartLineId} className="bg-white rounded-[28px] p-4 border border-gray-100/70 shadow-sm flex gap-4 relative">
                
                {/* Thumb Image frame column element */}
                <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0 relative">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#F4F0FF] flex items-center justify-center text-xl">🍲</div>
                  )}
                </div>

                {/* Content Descriptions */}
                <div className="flex-1 flex flex-col justify-between min-w-0 pr-2">
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-[14px] truncate leading-tight tracking-tight">{item.name}</h4>
                    
                    {/* Add-on labels tracking specifications badge sub row description */}
                    <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                      {item.customization?.pasta && `${item.customization.pasta}`}
                      {item.customization?.extras?.length > 0 && ` • Extra (${item.customization.extras.map(e => e.name).join(', ')})`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-black text-sm text-[#6C2BFF]">₹{item.itemTotal}</span>
                    
                    {/* Compact Item Counter Controls */}
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-1 rounded-xl shrink-0">
                      <button onClick={() => handleDecrement(item.cartLineId)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm active:scale-90 transition-transform">
                        <Minus size={12} strokeWidth={3} />
                      </button>
                      <span className="text-xs font-black text-gray-900 w-3 text-center select-none">{item.quantity}</span>
                      <button onClick={() => handleIncrement(item.cartLineId)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#6C2BFF] shadow-sm active:scale-90 transition-transform">
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Direct Trash Removal Action */}
                <button onClick={() => handleRemoveItem(item.cartLineId)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Bill Summary Invoice Section Breakdown details widget sheet */}
            <div className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm space-y-3.5">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FileText size={14} /> Bill Details
              </h4>
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Item Total</span>
                <span className="text-gray-800">₹{itemTotalSum}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Hotel Delivery Charges</span>
                <span className="text-gray-800">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Restaurant Taxes & GST</span>
                <span className="text-gray-800">₹{taxesAndCharges}</span>
              </div>
              <div className="w-full h-px bg-gray-50 my-2"></div>
              <div className="flex justify-between text-sm font-black text-gray-900">
                <span>Grand Total</span>
                <span className="text-[#6C2BFF] text-base">₹{grandTotalPayable}</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Floating Sticky Actions Footer bar sheet */}
      {cartItems.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-8 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 shadow-[0_-8px_35px_rgba(0,0,0,0.03)] flex items-center justify-between gap-8">
          <div>
            <span className="text-[14px] font-black text-[#6C2BFF] tracking-wide">Total Bill</span>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">₹{grandTotalPayable}</h3>
          </div>
          <button 
  onClick={() => navigate('/checkout')} // Wired up navigation target route hook link!
  className="flex-1 bg-[#6C2BFF] h-14 rounded-2xl flex items-center justify-center gap-2 text-white font-black text-sm shadow-xl shadow-[#6C2BFF]/20 active:scale-[0.98] transition-all hover:bg-[#5B21E6]"
>
  <span>Proceed to Checkout</span>
</button>
        </div>
      )}

      
    </div>
  );
}