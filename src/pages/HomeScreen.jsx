import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import HomeHeader from '../components/home/HomeHeader';
import CategoryScroll from '../components/home/CategoryScroll';
import PopularDishes from '../components/home/PopularDishes';
import BottomNav from '../components/home/BottomNav';
import { LogOut } from 'lucide-react';

export default function HomeScreen() {
  const [sections, setSections] = useState([]);
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Manage user state cleanly on mount
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Read the fresh local storage data every single time this page mounts
    const savedUser = JSON.parse(localStorage.getItem('valo_user'));
    setUser(savedUser);

    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = (event) => {
      setShowExitModal(true);
      window.history.pushState(null, '', window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const closeApp = () => {
    if (navigator.app) {
      navigator.app.exitApp();
    } else if (navigator.device) {
      navigator.device.exitApp();
    } else {
      window.close();
    }
  };

  useEffect(() => {
    async function fetchSections() {
      const { data } = await supabase.from('sections').select('*').order('created_at', { ascending: true });
      setSections(data || []);
    }
    fetchSections();

    const channel = supabase.channel('realtime-sections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sections' }, fetchSections)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="h-[100dvh] bg-[#F8F7FC] font-sans flex flex-col overflow-hidden relative">
      
      {/* Fixed App Status Header Bar */}
      <div className="shrink-0 z-40 relative">
        <HomeHeader />
      </div>

      {/* Independent Scrollable Content Area */}
      {/* OPTIMIZED: Expanded pb padding allocation from 6rem to 12rem to comfortably clear the floating tracking banner stack row */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        
        {/* Delivery Destination Badge */}
        <div className="px-5 mb-6">
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

        <CategoryScroll />

        {sections.map(section => (
          <PopularDishes key={section.id} sectionId={section.id} sectionName={section.name} />
        ))}
      </div>

      {/* Global Tab Navigation Module Trigger Footer */}
      <BottomNav />

      {/* Hardware Back Intercept Exit Modal Overlay */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#150734]/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-black text-center text-gray-900 mb-2">Exit App?</h3>
            <p className="text-center text-gray-500 text-sm mb-8 font-medium px-4">
              Are you sure you want to exit the Valo app?
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-4 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={closeApp}
                className="flex-1 py-4 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors active:scale-95"
              >
                Exit App
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}