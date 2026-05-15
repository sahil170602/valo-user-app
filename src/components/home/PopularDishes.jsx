import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function PopularDishes({ sectionId, sectionName }) {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // 1. Local cart state tracker to keep multiple carousels reactive
  const [cart, setCart] = useState([]);

  // Fetch initial cart setup on mount
  useEffect(() => {
    const loadedCart = JSON.parse(localStorage.getItem('valo_cart')) || [];
    setCart(loadedCart);
  }, []);

  useEffect(() => {
    async function fetchDishes() {
      setLoading(true);
      const { data } = await supabase
        .from('dishes')
        .select('*')
        .eq('section_id', sectionId)
        .eq('is_available', true);
      setDishes(data || []);
      setLoading(false);
    }
    if (sectionId) fetchDishes();

    const channel = supabase.channel(`dishes-${sectionId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'dishes', 
        filter: `section_id=eq.${sectionId}` 
      }, fetchDishes)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [sectionId]);

  // 2. Centralized Local Storage Cart Modifier
  const updateCartItemQuantity = (dish, newQty) => {
    const currentCart = JSON.parse(localStorage.getItem('valo_cart')) || [];
    let updatedCart = [];

    if (newQty <= 0) {
      // Remove item completely if count hits zero
      updatedCart = currentCart.filter(item => item.dishId !== dish.id);
    } else {
      const cartItem = {
        cartLineId: `${dish.id}`, // Maintain consistent matching signatures
        dishId: dish.id,
        kitchen_id: dish.kitchen_id, // <-- CRITICAL FIX: Attach multi-vendor routing ID
        name: dish.name,
        image_url: dish.image_url,
        basePrice: dish.price,
        quantity: newQty,
        customization: { pasta: 'Penne', extras: [], instructions: '' }, // Fallback clean defaults
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
    setCart(updatedCart); // Triggers re-render for UI update

    // Broadcast change so the floating BottomNav bubble count updates immediately!
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="px-5 flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-gray-900 text-lg tracking-tight">{sectionName}</h3>
        
        <button 
          onClick={() => navigate(`/section/${sectionId}`, { state: { sectionName, type: 'section' } })}
          className="text-xs font-bold text-[#6C2BFF] bg-[#F4F0FF] px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
        >
          View all
        </button>
      </div>
      
      {/* Horizontal Carousel */}
      <div className="flex gap-5 overflow-x-auto px-5 pb-4 no-scrollbar">
        {loading ? (
           <p className="text-xs text-gray-400">Loading dishes...</p>
        ) : dishes.length === 0 ? (
           <p className="text-xs text-gray-400 italic bg-gray-50 px-4 py-2 rounded-lg">Coming soon...</p>
        ) : (
          dishes.map(dish => {
            // Find if this particular item is added to cart
            const matchingCartItem = cart.find(item => item.dishId === dish.id);

            return (
              /* Card Canvas Container */
              <div 
                key={dish.id} 
                onClick={() => navigate(`/dish/${dish.id}`)}
                className="w-[195px] h-[290px] relative shrink-0 rounded-[32px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-gray-100/60 bg-white group active:scale-[0.98] transition-transform select-none cursor-pointer"
              >
                
                {/* LAYER 1: Full Card Background Image */}
                <div className="absolute inset-0 bg-gray-55">
                  {dish.image_url && (
                    <img src={dish.image_url} className="w-full h-40 object-cover" alt={dish.name} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/ via-transparent to-black/5"></div>
                </div>

                {/* Diet Classification Indicator Badge */}
                <div className={`absolute top-4 left-4 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm z-30 ${dish.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></div>

                {/* LAYER 2: Masked Progressive Backdrop Blur Layer */}
              <div 
                  className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
                  style={{
                    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 60%)',
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 60%)'
                  }}
                >
                  {dish.image_url && (
                    <img 
                      src={dish.image_url} 
                      className="absolute bottom-0 left-0 w-full h-full object-cover blur-xl scale-115 origin-bottom opacity-100" 
                      alt="" 
                    />
                  )}
                  {/* Subtle white glass tint sheet to ensure typography contrast checks pass */}
                  <div className="absolute inset-0 bg-white/10"></div>
                </div>

                {/* LAYER 3: Sharp High-Contrast Text & Action Foreground */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pt-12 z-20 flex flex-col justify-end min-h-[55%] transform translate-z-0 pointer-events-auto">
                  <div className="mb-0">
                    <h4 className="font-extrabold text-gray-900 text-[14px] truncate leading-tight tracking-tight">
                      {dish.name}
                    </h4>
                    <p className="text-[10px] font-medium text-gray-800 mt-1 line-clamp-2 h-7 leading-normal">
                      {dish.description}
                    </p>
                  </div>
                  
                  {/* Price and Transaction Footer */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-900/5">
                    <span className="font-black text-gray-900 text-sm tracking-tight">
                      ₹{dish.price}
                    </span>
                    
                    {/* 3. DYNAMIC INTERACTIVE TRANSACTION BUTTON SWAPPER */}
                    {!matchingCartItem ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Stop details redirection
                          updateCartItemQuantity(dish, 1);
                        }}
                        className="bg-[#6C2BFF] text-white px-3.5 py-2 rounded-xl text-[10px] font-black active:scale-95 transition-transform shadow-md shadow-[#6C2BFF]/15 hover:bg-[#5B21E6]"
                      >
                        Add +
                      </button>
                    ) : (
                      <div 
                        onClick={(e) => e.stopPropagation()} // Stop details redirection on background box click
                        className="flex items-center gap-2 bg-[#F4F0FF] p-1 rounded-xl shrink-0 border border-[#6C2BFF]/10"
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartItemQuantity(dish, matchingCartItem.quantity - 1);
                          }}
                          className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-gray-500 font-extrabold shadow-sm active:scale-90 transition-transform"
                        >
                          -
                        </button>
                        <span className="text-[11px] font-black text-gray-900 w-3.5 text-center select-none">
                          {matchingCartItem.quantity}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartItemQuantity(dish, matchingCartItem.quantity + 1);
                          }}
                          className="w-6 h-6 bg-[#6C2BFF] rounded-lg flex items-center justify-center text-white font-extrabold active:scale-90 transition-transform"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}