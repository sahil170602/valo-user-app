import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Flame, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/home/BottomNav';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestedDishes, setSuggestedDishes] = useState([]); 
  const navigate = useNavigate();
  
  const popularSearches = ['Chicken Biryani', 'Burger', 'Pasta', 'Pizza', 'Salad'];

  // --- Hardware Back Button Logic ---
  useEffect(() => {
    // Push initial state so the first back press doesn't instantly close the app
    window.history.pushState(null, '', window.location.pathname);
    
    const handlePopState = (event) => {
      if (searchQuery) {
        // If there is text in the search bar, clear it and STAY on the page
        setSearchQuery('');
        window.history.pushState(null, '', window.location.pathname);
      } else {
        // If empty, go home
        navigate('/home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [searchQuery, navigate]);

  // Fetch Suggested Dishes
  useEffect(() => {
    async function fetchSuggested() {
      const { data } = await supabase.from('dishes').select('*').eq('is_available', true).limit(4);
      setSuggestedDishes(data || []);
    }
    fetchSuggested();
  }, []);

  // Debounced Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase.from('dishes').select('*').ilike('name', `%${searchQuery}%`).eq('is_available', true);
      setResults(data || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    // 1. Lock the browser scrolling completely (h-[100dvh] + overflow-hidden)
    <div className="h-[100dvh] bg-[#F8F7FC] font-sans flex flex-col overflow-hidden relative">
      
      {/* 2. Header - Changed to pt-5 */}
      <div className="bg-white px-5 pt-4 pb-4 shadow-sm border-b border-gray-100 shrink-0 z-40">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Search</h2>
        
        <div className="relative flex items-center">
          <SearchIcon size={20} className="absolute left-4 text-gray-400" />
          <input 
            type="text" 
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for dishes, cuisines..."
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-2xl py-4 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-[#6C2BFF]/50 focus:border-[#6C2BFF] transition-all shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Scrollable Content Area */}
      <div className="flex-1 px-5 pt-6 overflow-y-auto pb-[calc(7rem+env(safe-area-inset-bottom))] no-scrollbar">
        
        {/* State A: Empty Search Bar */}
        {!searchQuery && (
          <div>
            <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <Flame size={18} className="text-orange-500" /> Popular Right Now
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, i) => (
                <button 
                  key={i}
                  onClick={() => setSearchQuery(term)}
                  className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#F4F0FF] hover:border-[#6C2BFF] hover:text-[#6C2BFF] transition-all"
                >
                  {term}
                </button>
              ))}
            </div>

            <h3 className="font-extrabold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-500" /> Suggested for You
            </h3>
            
            <div className="space-y-4">
              {suggestedDishes.map(dish => (
                <div key={`suggested-${dish.id}`} className="bg-white rounded-[24px] p-3 shadow-sm border border-gray-100 flex gap-4 items-center transition-transform active:scale-[0.98]">
                  <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-50">
                    {dish.image_url && <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />}
                    <div className={`absolute top-1.5 left-1.5 w-3 h-3 rounded-full border-2 border-white ${dish.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                  <div className="flex-1 py-1 pr-2">
                    <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{dish.name}</h4>
                    <span className="font-black text-[#6C2BFF] block mb-2">₹{dish.price}</span>
                    <button className="w-full bg-[#F4F0FF] text-[#6C2BFF] hover:bg-[#6C2BFF] hover:text-white transition-colors py-2 rounded-lg text-xs font-bold">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State B: Loading Search */}
        {loading && searchQuery && (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="w-8 h-8 border-4 border-[#F4F0FF] border-t-[#6C2BFF] rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Searching...</p>
          </div>
        )}

        {/* State C: No Results Found */}
        {!loading && searchQuery && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-black text-gray-900 mb-1">No dishes found</h3>
            <p className="text-sm text-gray-400">We couldn't find anything matching "{searchQuery}"</p>
          </div>
        )}

        {/* State D: Search Results Found */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Found {results.length} results
            </p>
            {results.map(dish => (
              <div key={`result-${dish.id}`} className="bg-white rounded-[24px] p-3 shadow-sm border border-gray-100 flex gap-4 items-center transition-transform active:scale-[0.98]">
                <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-50">
                  {dish.image_url && <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />}
                  <div className={`absolute top-1.5 left-1.5 w-3 h-3 rounded-full border-2 border-white ${dish.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div className="flex-1 py-1 pr-2">
                  <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{dish.name}</h4>
                  <span className="font-black text-[#6C2BFF] block mb-2">₹{dish.price}</span>
                  <button className="w-full bg-[#F4F0FF] text-[#6C2BFF] hover:bg-[#6C2BFF] hover:text-white transition-colors py-2 rounded-lg text-xs font-bold">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}