import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import the navigation hook
import { supabase } from '../../lib/supabase';

export default function CategoryScroll() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 2. Initialize the hook

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      // Fetch active categories from the database
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
        
      setCategories(data || []);
      setLoading(false);
    }
    fetchCategories();
  }, []);

  return (
    <div className="my-4">
      <div className="px-5 mb-3">
        <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider">
          Browse Categories
        </h3>
      </div>

      {/* Horizontal scroll container */}
      <div className="flex gap-4 overflow-x-auto px-5 pb-2 no-scrollbar">
        {loading ? (
          <div className="w-16 h-16 rounded-2xl bg-gray-100 animate-pulse shrink-0"></div>
        ) : (
          categories.map((category) => (
            <button
              key={category.id}
              /* 3. Redirect to the section dishes grid screen dynamically */
              onClick={() => navigate(`/section/${category.id}`, { state: { sectionName: category.name } })}
              className="flex flex-col items-center gap-2 shrink-0 group active:scale-95 transition-transform"
            >
              {/* Category Circle/Box */}
              <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center text-2xl transition-all group-hover:border-[#6C2BFF] group-hover:bg-[#F4F0FF]">
                {category.image_url ? (
                  <img src={category.image_url} alt={category.name} className="w-10 h-10 object-contain" />
                ) : (
                  <span>🍔</span> // Fallback emoji if no image exists
                )}
              </div>
              
              {/* Category Name */}
              <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">
                {category.name}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}