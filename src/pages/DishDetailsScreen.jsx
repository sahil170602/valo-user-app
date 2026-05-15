import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, Minus, Star, Share2, Heart, Bike } from 'lucide-react';

export default function DishDetailsScreen() {
  const { dishId } = useParams();
  const navigate = useNavigate();

  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // --- Recommendation Engine States ---
  const [sectionDishes, setSectionDishes] = useState([]);
  const [categoryDishes, setCategoryDishes] = useState([]);
  
  // --- Cart & Toggle States ---
  const [isAdded, setIsAdded] = useState(false); 
  const [quantity, setQuantity] = useState(1);
  
  // --- Customization States ---
  const [selectedExtras, setSelectedExtras] = useState([]); 
  const [selectedPasta, setSelectedPasta] = useState('Penne'); 
  const [instructions, setInstructions] = useState('');

  // Fetch logged-in user room configuration safely
  const user = JSON.parse(localStorage.getItem('valo_user')) || { room_number: '305' };

  const extrasOptions = [
    { id: 'cheese', name: 'Extra Cheese', price: 40, icon: '🧀' },
    { id: 'mushrooms', name: 'Mushrooms', price: 40, icon: '🍄' },
    { id: 'broccoli', name: 'Broccoli', price: 40, icon: '🥦' },
    { id: 'corn', name: 'Sweet Corn', price: 30, icon: '🌽' },
  ];

  // --- Hardware Back Button Logic ---
  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => navigate(-1);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  // --- Fetch Dish Details & Cross-Sell Suggestions ---
  useEffect(() => {
    async function fetchDishDetails() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('dishes')
          .select('*')
          .eq('id', dishId)
          .single();

        if (error) throw error;
        setDish(data);

        // Fetch parallel carousels based on matching parameters
        if (data) {
          const [sectionRes, categoryRes] = await Promise.all([
            supabase
              .from('dishes')
              .select('*')
              .eq('section_id', data.section_id)
              .neq('id', data.id) // Exclude current product instance
              .eq('is_available', true)
              .limit(10),
            supabase
              .from('dishes')
              .select('*')
              .eq('category_id', data.category_id)
              .neq('id', data.id) // Exclude current product instance
              .eq('is_available', true)
              .limit(10)
          ]);

          setSectionDishes(sectionRes.data || []);
          setCategoryDishes(categoryRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching dish profiles:', error.message);
      } finally {
        setLoading(false);
      }
    }
    if (dishId) fetchDishDetails();
  }, [dishId]);

  // --- Check if item already exists in cart on mount ---
  // --- Check if item already exists in cart on mount ---
useEffect(() => {
  if (dish) {
    const currentCart = JSON.parse(localStorage.getItem('valo_cart')) || [];
    const existingItem = currentCart.find(item => item.dishId === dish.id);
    
    if (existingItem) {
      setIsAdded(true);
      setQuantity(existingItem.quantity);
      setInstructions(existingItem.customization.instructions || '');
      setSelectedPasta(existingItem.customization.pasta || 'Penne');
    } else {
      // 🚨 FIX: Reset all state variables back to clean defaults when opening a new dish!
      setIsAdded(false);
      setQuantity(1);
      setInstructions('');
      setSelectedPasta('Penne');
      setSelectedExtras([]);
    }
  }
}, [dish, dishId]); // Added dishId tracking to capture transitions cleanly

  // --- Centralized Cart Sync Manager ---
  const syncCartStorage = (newQty) => {
    const currentCart = JSON.parse(localStorage.getItem('valo_cart')) || [];
    
    if (newQty <= 0) {
      const updatedCart = currentCart.filter(item => item.dishId !== dish.id);
      localStorage.setItem('valo_cart', JSON.stringify(updatedCart));
      setIsAdded(false);
      setQuantity(1); 
    } else {
      const cartItem = {
        cartLineId: `${dish.id}`,
        dishId: dish.id,
        name: dish.name,
        image_url: dish.image_url,
        basePrice: basePrice,
        quantity: newQty,
        customization: {
          pasta: selectedPasta,
          extras: selectedExtras.map(e => ({ name: e.name, price: e.price })),
          instructions: instructions.trim()
        },
        itemTotal: finalPricePerItem * newQty
      };

      const existingIndex = currentCart.findIndex(item => item.dishId === dish.id);
      if (existingIndex > -1) {
        currentCart[existingIndex] = cartItem;
      } else {
        currentCart.push(cartItem);
      }
      localStorage.setItem('valo_cart', JSON.stringify(currentCart));
    }
  };

  const handleInitialAdd = () => {
    setIsAdded(true);
    setQuantity(1);
    syncCartStorage(1);
  };

  const handleIncrement = () => {
    const nextQty = quantity + 1;
    setQuantity(nextQty);
    syncCartStorage(nextQty);
  };

  const handleDecrement = () => {
    const nextQty = quantity - 1;
    setQuantity(nextQty <= 0 ? 1 : nextQty);
    syncCartStorage(nextQty);
  };

  const handleToggleExtra = (extra) => {
    let updatedExtras = [];
    if (selectedExtras.some(item => item.id === extra.id)) {
      updatedExtras = selectedExtras.filter(item => item.id !== extra.id);
    } else {
      updatedExtras = [...selectedExtras, extra];
    }
    setSelectedExtras(updatedExtras);
    if (isAdded) {
      setTimeout(() => syncCartStorage(quantity), 50);
    }
  };

  const basePrice = dish?.price || 249;
  const extrasPrice = selectedExtras.reduce((sum, item) => sum + item.price, 0);
  const finalPricePerItem = basePrice + extrasPrice;
  const grandTotal = finalPricePerItem * quantity;

  if (loading) {
    return (
      <div className="h-[100dvh] bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F4F0FF] border-t-[#6C2BFF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="h-[100dvh] bg-[#F8F7FC] flex flex-col items-center justify-center p-5">
        <p className="text-gray-400 text-sm italic">Dish details could not be found.</p>
        <button onClick={() => navigate('/home')} className="mt-4 text-xs font-bold text-[#6C2BFF] bg-[#F4F0FF] px-4 py-2 rounded-xl">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-white font-sans flex flex-col overflow-hidden relative">
      
      {/* 1. Glassy App Navigation Header */}
      <div className="bg-white/60 backdrop-blur-xl pt-4 pb-3 px-5 border-b border-white/20 flex items-center justify-between shrink-0 z-50 sticky top-0 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
        <button onClick={() => navigate(-1)} className="text-gray-900 active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsFavorite(!isFavorite)} className="active:scale-95 transition-transform">
            <Heart size={22} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-900'} />
          </button>
          <button className="text-gray-900 active:scale-95 transition-transform">
            <Share2 size={22} />
          </button>
        </div>
      </div>

      {/* 2. Primary Scrollable Canvas Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[140px] bg-[#F8F7FC]">
        
        {/* Banner Media Hero */}
        <div className="relative w-full h-[350px] bg-gray-100 overflow-hidden shrink-0">
          <img src={dish.image_url || "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600"} alt={dish.name} className="w-full h-full object-cover" />

        </div>

        {/* Content Sheet container overlay */}
        <div className="relative -mt-8 bg-white rounded-t-[38px] px-5 pt-7 z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
          
          <div className="flex items-start justify-between gap-4 mb-1.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{dish.name}</h1>
            <div className="flex items-center gap-2 shrink-0 pt-1">
              <div className={`w-4 h-4 border-2 flex items-center justify-center rounded-[3px] ${dish.is_veg ? 'border-green-600' : 'border-red-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${dish.is_veg ? 'bg-green-600' : 'bg-red-600'}`}></div>
              </div>
              <span className="text-xl font-black text-gray-900">₹{dish.price}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-4">
            <span className="flex items-center gap-0.5 text-amber-500"><Star size={14} className="fill-current" /> 4.6</span>
            <span className="text-gray-200">|</span>
            <span>128 reviews</span>
          </div>

          <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">
            {dish.description || "Creamy pasta tossed in rich white sauce with herbs, mushrooms and a blend of cheese."}
          </p>

          <div className="w-full h-px bg-gray-100 mb-5"></div>

          <h2 className="text-base font-black text-gray-900 tracking-tight mb-4">Customize your dish</h2>

          {/* ADD EXTRAS */}
          <div className="mb-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Add Extras</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {extrasOptions.map(option => {
                const isSelected = selectedExtras.some(item => item.id === option.id);
                return (
                  <div 
                    key={option.id}
                    onClick={() => handleToggleExtra(option)}
                    className={`w-[115px] p-3 rounded-2xl border flex flex-col justify-between shrink-0 relative cursor-pointer select-none transition-all duration-200 ${
                      isSelected ? 'border-[#6C2BFF] bg-[#F4F0FF]/30 shadow-sm' : 'border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)]'
                    }`}
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-lg mb-2">
                        {option.icon}
                      </div>
                      <h4 className="text-xs font-bold text-gray-800 leading-tight mb-1">{option.name}</h4>
                      <p className="text-xs font-extrabold text-gray-400">₹{option.price}</p>
                    </div>
                    
                    <div className="flex justify-end mt-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#6C2BFF] text-white' : 'bg-white border border-gray-200 text-gray-400'
                      }`}>
                        <Plus size={14} className={isSelected ? 'rotate-45 transition-transform' : ''} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        

          {/* SPECIAL INSTRUCTIONS */}
          <div className="mb-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Special Instructions <span className="text-gray-300 normal-case">(Optional)</span></h3>
            <div className="relative">
              <textarea
                value={instructions}
                onChange={(e) => {
                  const val = e.target.value.slice(0, 120);
                  setInstructions(val);
                  if (isAdded) setTimeout(() => syncCartStorage(quantity), 50);
                }}
                placeholder="E.g. No onions, less spicy, extra sauce..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none h-24 resize-none focus:border-[#6C2BFF]/30 focus:bg-white transition-all"
              />
              <span className="absolute bottom-3 right-4 text-[10px] font-bold text-gray-300 tracking-wider">
                {instructions.length}/120
              </span>
            </div>
          </div>

          {/* --- NEW ADDITION: SUGGESTED PRODUCTS PANELS --- */}
          <div className="w-full h-px bg-gray-100 my-6"></div>
          
          {/* CAROUSEL LINE 1: SAME SECTION SUGGESTIONS */}
          {sectionDishes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider mb-3">More from this Section</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {sectionDishes.map(item => (
                  <div key={item.id} onClick={() => navigate(`/dish/${item.id}`)} className="w-[125px] shrink-0 cursor-pointer select-none group">
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 relative mb-2 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                      {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-active:scale-95 transition-transform" />}
                      <div className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full border border-white ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 truncate leading-tight">{item.name}</h4>
                    <p className="text-xs font-black text-[#6C2BFF] mt-0.5">₹{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CAROUSEL LINE 2: SAME CATEGORY SUGGESTIONS */}
          {categoryDishes.length > 0 && (
            <div className="mb-8">
              <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider mb-3">You Might Also Like</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {categoryDishes.map(item => (
                  <div key={item.id} onClick={() => navigate(`/dish/${item.id}`)} className="w-[125px] shrink-0 cursor-pointer select-none group">
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 relative mb-2 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                      {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-active:scale-95 transition-transform" />}
                      <div className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full border border-white ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 truncate leading-tight">{item.name}</h4>
                    <p className="text-xs font-black text-[#6C2BFF] mt-0.5">₹{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. Sticky Consolidated Floating Purchase Action Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-50 shadow-[0_-8px_35px_rgba(0,0,0,0.03)] flex flex-col gap-3 shrink-0">
        
        {!isAdded ? (
          <button 
            onClick={handleInitialAdd}
            className="w-full bg-[#6C2BFF] h-14 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-[#6C2BFF]/15 hover:bg-[#5B21E6] active:scale-[0.99] transition-all"
          >
            <span>Add to Cart</span>
          </button>
        ) : (
          <div className="flex items-center justify-between bg-white border border-gray-200 h-14 px-3 rounded-2xl shadow-sm w-full">
            <button 
              onClick={handleDecrement}
              className="w-12 h-12 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl active:scale-90 transition-transform border border-gray-100"
            >
              <Minus size={18} strokeWidth={2.5} />
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity:</span>
              <span className="text-lg font-black text-gray-900 select-none">{quantity}</span>
              <span className="text-gray-300 mx-1">|</span>
              <span className="text-sm font-black text-[#6C2BFF]">Total: ₹{grandTotal}</span>
            </div>

            <button 
              onClick={handleIncrement}
              className="w-12 h-12 flex items-center justify-center text-[#6C2BFF] bg-[#F4F0FF] rounded-xl active:scale-90 transition-transform"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Dynamic Delivery Context Badge */}
        <div className="flex items-center justify-between px-1 text-xs font-bold text-gray-400 mt-0.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center text-gray-500">
              <Bike size={12} className="text-[#6C2BFF]" />
            </div>
            <p>Delivery in 25–30 mins to <span className="text-gray-800 font-extrabold">Room {user.room_number}</span></p>
          </div>
          <button className="text-[#6C2BFF] font-black tracking-wide">Change</button>
        </div>

      </div>

    </div>
  );
}