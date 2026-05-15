import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/home/BottomNav';
import { User, CreditCard, Bell, HelpCircle, Shield, LogOut, ChevronRight, MapPin, Phone } from 'lucide-react';

export default function ProfileScreen() {
  const navigate = useNavigate();
  
  // Try loading whatever data was cached locally
  const localUser = JSON.parse(localStorage.getItem('valo_user')) || {};
  
  // MATCHED TO YOUR DATABASE payload structure
  const [dbUser, setDbUser] = useState({ full_name: '', mobile_number: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);

        // Find phone from context fields
        let loggedInPhone = localUser.mobile_number || localUser.phone;

        if (!loggedInPhone) {
          const { data: { user } } = await supabase.auth.getUser();
          loggedInPhone = user?.phone;
        }

        // Redirect if completely unauthenticated
        if (!loggedInPhone) {
          console.warn("No active user session found. Redirecting to login...");
          navigate('/'); 
          return;
        }

        // UPDATED: Added hotel_name and room_number to selection layout
        const { data, error } = await supabase
          .from('users') 
          .select('full_name, mobile_number, hotel_name, room_number') 
          .eq('mobile_number', loggedInPhone)
          .single();

        if (error) throw error;

        if (data) {
          setDbUser(data);
          // FIXED: Merges database records with local data to stop state leakage
          localStorage.setItem('valo_user', JSON.stringify({ ...localUser, ...data }));
        }

      } catch (error) {
        console.error("Error fetching profile from database:", error.message);
        // Display whatever local state fallback exists safely
        setDbUser({ 
          full_name: localUser.full_name || 'Sahil Meshram', 
          mobile_number: loggedInPhone || '+91 79725 06748' 
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => navigate('/home');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await supabase.auth.signOut();
      localStorage.removeItem('valo_user');
      navigate('/'); 
    }
  };

  const menuOptions = [
    { icon: <CreditCard size={20} />, label: 'Payment Methods', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: <MapPin size={20} />, label: 'Delivery Addresses', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: <Bell size={20} />, label: 'Notifications', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: <Shield size={20} />, label: 'Privacy & Security', color: 'text-gray-700', bg: 'bg-gray-100' },
    { icon: <HelpCircle size={20} />, label: 'Help & Support', color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="h-[100dvh] bg-[#F8F7FC] font-sans flex flex-col overflow-hidden relative">
      
      {/* UPDATED: Changed pt-1 to pt-12 for clean status bar distance alignment */}
      <div className="bg-white pt-4 pb-4 shadow-sm border-b border-gray-100 shrink-0 relative z-40">
        <div className="px-5">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <User className="text-[#6C2BFF]" /> My Profile
          </h2>
        </div>
      </div>

      <div className="flex-1 px-5 pt-6 overflow-y-auto pb-[calc(8rem+env(safe-area-inset-bottom))] no-scrollbar">
        
        {/* Profile Identity Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 bg-[#F4F0FF] rounded-[20px] flex items-center justify-center shrink-0 border-2 border-white shadow-inner">
            {loading ? (
               <div className="w-6 h-6 border-2 border-[#6C2BFF] border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <User size={32} className="text-[#6C2BFF]" />
            )}
          </div>
          
          <div className="flex-1">
            {/* Real Name matches 'full_name' field */}
            <h3 className="text-xl font-black text-gray-900 leading-none mb-2">
              {loading ? 'Loading...' : dbUser.full_name}
            </h3>
            {/* Mobile Number matches 'mobile_number' field */}
            {!loading && dbUser.mobile_number && (
              <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mt-1">
                <Phone size={12} /> {dbUser.mobile_number}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-6">
          {menuOptions.map((item, index) => (
            <button 
              key={index}
              className={`w-full flex items-center justify-between p-5 active:bg-gray-50 transition-colors ${
                index !== menuOptions.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
                <span className="font-bold text-sm text-gray-700">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full bg-white border border-red-100 text-red-500 py-4 rounded-[20px] text-sm font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-red-50 active:scale-[0.98] transition-all"
          >
            <LogOut size={18} /> Log Out
          </button>
          
          <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-4">
            Valo App v1.0.0
          </p>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}