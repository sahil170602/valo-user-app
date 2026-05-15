import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/home/BottomNav';
import { Receipt, Clock, CheckCircle, XCircle, ChevronRight, ChefHat } from 'lucide-react';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'live', 'completed', 'cancelled'
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('valo_user')) || { room_number: '201' };

  // --- Hardware Back Button Logic ---
  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    
    const handlePopState = () => {
      navigate('/home'); // Go back to home when hardware back is pressed
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  useEffect(() => {
    fetchOrders();

    // Real-time listener: Watch for status changes from the kitchen!
    const channel = supabase.channel('user-orders')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders',
        filter: `room_number=eq.${user.room_number}` // Only listen to this user's orders
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('room_number', user.room_number)
      .order('created_at', { ascending: false });
      
    setOrders(data || []);
    setLoading(false);
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return ['Pending', 'Preparing', 'Ready'].includes(order.status);
    if (activeFilter === 'completed') return order.status === 'Delivered';
    if (activeFilter === 'cancelled') return order.status === 'Cancelled';
    return true;
  });

  const filters = [
    { id: 'all', label: 'Total Orders' },
    { id: 'live', label: 'Live' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'Pending': return { color: 'text-orange-600', bg: 'bg-orange-100', icon: <Clock size={14} /> };
      case 'Preparing': return { color: 'text-blue-600', bg: 'bg-blue-100', icon: <ChefHat size={14} /> };
      case 'Ready': return { color: 'text-[#6C2BFF]', bg: 'bg-[#F4F0FF]', icon: <CheckCircle size={14} /> };
      case 'Delivered': return { color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle size={14} /> };
      case 'Cancelled': return { color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle size={14} /> };
      default: return { color: 'text-gray-600', bg: 'bg-gray-100', icon: <Clock size={14} /> };
    }
  };

  return (
    // 1. Lock the browser scrolling completely
    <div className="h-[100dvh] bg-[#F8F7FC] font-sans flex flex-col overflow-hidden relative">
      
      {/* 2. Locked Header Area (shrink-0 ensures it never squishes) */}
      <div className="bg-white pt-4 pb-4 shadow-sm border-b border-gray-100 shrink-0 relative z-40">
        <div className="px-5 mb-4">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Receipt className="text-[#6C2BFF]" /> My Orders
          </h2>
        </div>

        {/* Filter Scroll Bar */}
        <div className="px-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                activeFilter === f.id 
                ? 'bg-[#6C2BFF] text-white shadow-[0_4px_14px_rgba(108,43,255,0.3)]' 
                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {f.label}
              {f.id === 'all' && <span className="ml-2 opacity-80">({orders.length})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Scrollable Content Area */}
      <div className="flex-1 px-5 pt-6 overflow-y-auto pb-[calc(8rem+env(safe-area-inset-bottom))] no-scrollbar">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-4 border-[#F4F0FF] border-t-[#6C2BFF] rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">No orders found</h3>
            <p className="text-sm text-gray-400">You don't have any {activeFilter === 'all' ? '' : activeFilter} orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const display = getStatusDisplay(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">
                  
                  {/* Top: Status & Time */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${display.bg} ${display.color}`}>
                        {display.icon} {order.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400">
                      {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>

                  {/* Middle: Items Summary */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-relaxed">
                      {order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ') || "Custom Order Items"}
                    </p>
                  </div>

                  {/* Bottom: Total & Action */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Paid</p>
                      <p className="text-lg font-black text-gray-900">₹{order.total_amount || '0'}</p>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-bold text-[#6C2BFF] bg-[#F4F0FF] px-4 py-2.5 rounded-xl hover:bg-[#6C2BFF] hover:text-white transition-colors">
                      Track <ChevronRight size={14} />
                    </button>
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