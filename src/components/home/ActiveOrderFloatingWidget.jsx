import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Clock, ChevronRight, ChefHat, Truck, Package, Bike } from 'lucide-react';

export default function ActiveOrderFloatingWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');

  useEffect(() => {
    const checkActiveOrder = () => {
      const id = localStorage.getItem('valo_active_order_id');
      setActiveOrderId(id);
    };

    // Initialize metrics check on widget layer paint routines
    checkActiveOrder();

    window.addEventListener('active-order-changed', checkActiveOrder);
    window.addEventListener('cart-updated', checkActiveOrder);
    return () => {
      window.removeEventListener('active-order-changed', checkActiveOrder);
      window.removeEventListener('cart-updated', checkActiveOrder);
    };
  }, []);

  // Sync real-time updates for status labels changes directly onto widget view frames
  useEffect(() => {
    if (!activeOrderId) return;

    async function fetchStatus() {
      const { data } = await supabase
        .from('orders')
        .select('status')
        .eq('order_id', activeOrderId)
        .single();
      
      if (data) {
        setOrderStatus(data.status);
        if (data.status === 'delivered' || data.status === 'rejected') {
          localStorage.removeItem('valo_active_order_id');
          setActiveOrderId(null);
        }
      }
    }
    fetchStatus();

    const channel = supabase.channel(`float-widget-${activeOrderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `order_id=eq.${activeOrderId}` }, 
      (payload) => {
        const nextStatus = payload.new.status;
        setOrderStatus(nextStatus);
        if (nextStatus === 'delivered' || nextStatus === 'rejected') {
          localStorage.removeItem('valo_active_order_id');
          setActiveOrderId(null);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeOrderId]);

  // Hide floating overlay if no active order is running, or if the user is already looking at tracking/checkout screens
  if (!activeOrderId || location.pathname.includes('/checkout') || location.pathname.includes('/dish') || location.pathname === `/order-details/${activeOrderId}`) {
    return null;
  }

  // Visual text formatting configuration helper maps
  const getStatusLabel = () => {
    switch(orderStatus) {
      case 'pending': return 'Waiting Acceptance';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Chef is Cooking';
      case 'waiting for pickup': return 'Food is Packed';
      case 'out for delivery': return 'Rider en Route';
      default: return 'Tracking Live Order';
    }
  };

  const getStatusIcon = () => {
    switch(orderStatus) {
      case 'preparing': return <ChefHat size={16} className="text-[#6C2BFF]" />;
      case 'waiting for pickup': return <Package size={16} className="text-amber-500" />;
      case 'out for delivery': return <Truck size={16} className="text-blue-500" />;
      default: return <Clock size={16} className="text-[#6C2BFF]" />;
    }
  };

  return (
    <div 
      onClick={() => navigate(`/order-details/${activeOrderId}`)}
      className="fixed bottom-24 left-5 right-5 z-40 bg-white/75 backdrop-blur-xl border border-white/40 rounded-2xl p-3.5 shadow-[0_12px_32px_rgba(108,43,255,0.12)] flex items-center justify-between pointer-events-auto cursor-pointer active:scale-[0.99] transition-transform animate-in slide-in-from-bottom-8 duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
          {getStatusIcon()}
        </div>
        <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Live Active Delivery</p>
          <h4 className="text-sm font-black text-gray-800 leading-none mt-0.5 flex items-center gap-1.5">
            {getStatusLabel()}
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-ping"></span>
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs font-black text-[#6C2BFF] tracking-wide bg-white px-2.5 py-1.5 rounded-xl border border-gray-50 shadow-sm">
        <span>Track</span>
        <ChevronRight size={14} strokeWidth={2.5} />
      </div>
    </div>
  );
}