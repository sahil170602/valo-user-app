import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/home/BottomNav';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function SectionDishesScreen() {
  const { sectionId } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();
  
  const sectionName = location.state?.sectionName || 'Dishes';
  const filterType = location.state?.type; 

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // DYNAMIC: Create local tracking cart reference
  const [cart, setCart] = useState([]);

  // Live Sync local state values on mount or storage transmissions
  useEffect(() => {
    const loadCurrentCart = () => {
      setCart(JSON.parse(localStorage.getItem('valo_cart')) || []);
    };
    loadCurrentCart();
    
    window.addEventListener('cart-updated', loadCurrentCart);
    window.addEventListener('storage', loadCurrentCart);
    return () => {
      window.removeEventListener('cart-updated', loadCurrentCart);
      window.removeEventListener('storage', loadCurrentCart);
    };
  }, []);

  // --- Hardware Back Button Logic ---
  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => navigate('/home');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  // --- Dynamic Fetch Logic ---
  useEffect(() => {
    async function fetchSectionDishes() {
      try {
        setLoading(true);
        
        let query = supabase
          .from('dishes')
          .select('*')
          .eq('is_available', true);

        if (filterType === 'category') {
          query = query.eq('category_id', sectionId);
        } else if (filterType === 'section') {
          query = query.eq('section_id', sectionId);
        } else {
          query = query.or(`section_id.eq.${sectionId},category_id.eq.${sectionId}`);
        }

        const { data, error } = await query;

        if (error) throw error;
        setDishes(data || []);
      } catch (error) {
        console.error('Error fetching section dishes:', error.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (sectionId) fetchSectionDishes();
  }, [sectionId, filterType]);

  // Centralized local storage array compiler function
  const updateCartItemQuantity = (dish, newQty) => {
    const currentCart = JSON.parse(localStorage.getItem('valo_cart')) || [];
    let updatedCart = [];

    if (newQty <= 0) {
      updatedCart = currentCart.filter(item => item.dishId !== dish.id);
    } else {
      const cartItem = {
        cartLineId: `${dish.id}`,
        dishId: dish.id,
        name: dish.name,
        image_url: dish.image_url,
        basePrice: dish.price,
        quantity: newQty,
        customization: { pasta: 'Penne', extras: [], instructions: '' }, 
        itemTotal: dish.price * newQty
      };

      const existingIndex = currentCart.findIndex(item => item.dishId === dish.id);
      if (existingIndex > -1) {
        currentCart[existingIndex] = cartItem;
      } else {
        currentCart.push(cartItem);
      }
      updatedCart = currentCart;
    }

    localStorage.setItem('valo_cart', JSON.stringify(updatedCart));
    setCart(updatedCart); 
    window.dispatchEvent(new Event('cart-updated')); // Fire event trace notification
  };

  return (
    <div className="h-[100dvh] bg-[#F8F7FC] font-sans flex flex-col overflow-hidden relative">
      
      {/* Fixed App Header bar (pt-12 alignment for fluid smartphone layout scaling profiles) */}
      <div className="bg-white pt-4 pb-4 px-4 shadow-sm border-b border-gray-100 flex items-center gap-3 shrink-0 z-40">
        <button 
          onClick={() => navigate('/home')}
          className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 active:scale-95 transition-transform border border-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-900 leading-tight">{sectionName}</h2>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
            {loading ? 'Updating list...' : `${dishes.length} Items Available`}
          </p>
        </div>
      </div>

      {/* Independent Scrollable Content Area */}
      <div className="flex-1 px-5 pt-6 overflow-y-auto pb-[calc(8rem+env(safe-area-inset-bottom))] no-scrollbar">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-[#F4F0FF] border-t-[#6C2BFF] rounded-full animate-spin"></div>
          </div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">No dishes found</h3>
            <p className="text-sm text-gray-400">There are no active dishes listed inside this category.</p>
          </div>
        ) : (
          /* Beautiful 2-Column Product Grid Layout */
          <div className="grid grid-cols-2 gap-4">
            {dishes.map(dish => {
              const matchingCartItem = cart.find(item => item.dishId === dish.id);

              return (
                <div 
                  key={dish.id} 
                  onClick={() => navigate(`/dish/${dish.id}`)}
                  className="bg-white rounded-[28px] p-3 shadow-sm border border-gray-100 flex flex-col justify-between transition-transform active:scale-[0.98] select-none cursor-pointer"
                >
                  
                  {/* Top Image Box */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
                    {dish.image_url && (
                      <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                    )}
                    <div className={`absolute top-2.5 left-2.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${dish.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>

                  {/* Bottom Descriptions & Actions */}
                  <div className="flex flex-col flex-1 justify-between px-1">
                    <div className="mb-3">
                      <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[40px]">
                        {dish.name}
                      </h4>
                      <span className="font-black text-base text-[#6C2BFF] mt-1 block">
                        ₹{dish.price}
                      </span>
                    </div>

                    {/* DYNAMIC CART BUTTON CONFIGURATION PANELS */}
                    {!matchingCartItem ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartItemQuantity(dish, 1);
                        }}
                        className="w-full bg-[#F4F0FF] text-[#6C2BFF] active:scale-95 transition-transform py-2.5 rounded-xl text-xs font-black shadow-sm"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between bg-[#F4F0FF] p-1 rounded-xl w-full border border-[#6C2BFF]/10 h-[38px] shrink-0 animate-in fade-in duration-150"
                      >
                        <button 
                          onClick={() => updateCartItemQuantity(dish, matchingCartItem.quantity - 1)}
                          className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-gray-500 font-extrabold shadow-sm active:scale-90 transition-transform"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-gray-900 select-none w-4 text-center">
                          {matchingCartItem.quantity}
                        </span>
                        <button 
                          onClick={() => updateCartItemQuantity(dish, matchingCartItem.quantity + 1)}
                          className="w-7 h-7 bg-[#6C2BFF] rounded-lg flex items-center justify-center text-white font-extrabold active:scale-90 transition-transform"
                        >
                          +
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}