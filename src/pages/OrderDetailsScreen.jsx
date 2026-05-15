import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Phone, Bike, ChefHat, CheckCircle2, Package, Truck, AlertTriangle } from 'lucide-react';

export default function OrderDetailsScreen() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch and Sync Live Database Updates ---
  useEffect(() => {
    async function fetchInitialOrder() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error('Error loading order metrics:', err.message);
      } finally {
        setLoading(false);
      }
    }

    if (orderId) fetchInitialOrder();

    // Wire up real-time socket channel for immediate updates from the Kitchen or Rider apps
    const channel = supabase.channel(`live-order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `order_id=eq.${orderId}`
      }, (payload) => {
        setOrder(payload.new);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [orderId]);

  // --- Automated Confirmation Timer Workflow ---
  useEffect(() => {
    if (order && order.status === 'confirmed') {
      // Trigger client-side automated transition to cooking state after 5 seconds
      const autoPrepTimer = setTimeout(async () => {
        try {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'preparing' })
            .eq('order_id', orderId);

          if (error) throw error;
        } catch (err) {
          console.error('Failed to trigger automatic preparation pipeline update:', err.message);
        }
      }, 5000);

      return () => clearTimeout(autoPrepTimer);
    }

    // If order reaches final delivery resolution state, remove floating active lock flags
    if (order && order.status === 'delivered') {
      localStorage.removeItem('valo_active_order_id');
      window.dispatchEvent(new Event('active-order-changed'));
    }
  }, [order, orderId]);

  if (loading) {
    return (
      <div className="h-[100dvh] bg-[#F8F7FC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F4F0FF] border-t-[#6C2BFF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-[100dvh] bg-[#F8F7FC] flex flex-col items-center justify-center p-5">
        <AlertTriangle className="text-amber-500 mb-2" size={32} />
        <p className="text-gray-400 text-sm italic">Tracking record parameters not found.</p>
        <button onClick={() => navigate('/home')} className="mt-4 text-xs font-bold text-white bg-[#6C2BFF] px-4 py-2 rounded-xl">
          Return Home
        </button>
      </div>
    );
  }

  // Define Status Pipeline Stepper Sequence configuration maps
  const statusSteps = [
    { key: 'pending', label: 'Placed', icon: <CheckCircle2 size={16} />, desc: 'Waiting for kitchen acceptance' },
    { key: 'confirmed', label: 'Accepted', icon: <CheckCircle2 size={16} />, desc: 'Order confirmed by kitchen' },
    { key: 'preparing', label: 'Cooking', icon: <ChefHat size={16} />, desc: 'Chef is preparing your meal' },
    { key: 'waiting for pickup', label: 'Packed', icon: <Package size={16} />, desc: 'Food is packed & ready for pickup' },
    { key: 'out for delivery', label: 'On the Way', icon: <Truck size={16} />, desc: 'Rider is approaching your room' },
    { key: 'delivered', label: 'Delivered', icon: <Bike size={16} />, desc: 'Enjoy your fresh hot meal!' }
  ];

  // Calculate current active pointer step configurations index position
  const currentStepIdx = statusSteps.findIndex(step => step.key === order.status);

  return (
    <div className="h-[100dvh] bg-[#F8F7FC] font-sans flex flex-col overflow-hidden relative">
      
      {/* Navigation Header */}
      <div className="bg-white pt-4 pb-4 px-5 shadow-sm border-b border-gray-100 flex items-center gap-3 shrink-0 z-40">
        <button onClick={() => navigate('/home')} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 active:scale-95 transition-transform border border-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Track Order</h2>
          <p className="text-[11px] font-bold text-[#6C2BFF] uppercase tracking-wide">{order.order_id}</p>
        </div>
      </div>

      {/* Main Stepper & Info Canvas wrapper container viewports */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-5 pb-8 space-y-5">
        
        {/* REJECTED FALLBACK NOTICE BANNER CARD */}
        {order.status === 'rejected' ? (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-5 text-center">
            <h3 className="text-red-600 font-black text-lg">Order Rejected</h3>
            <p className="text-sm text-red-500 font-medium mt-1">The kitchen was unable to fulfill your request at this time. Please contact support or try ordering another dish.</p>
          </div>
        ) : (
          /* CORE LIVE PIPELINE TRACKING CARD VERTICAL STEPPER LIST PANEL */
          <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-6">Live Delivery Progress</h3>
            
            <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                
                return (
                  <div key={step.key} className="flex items-start gap-4 relative z-10 transition-opacity">
                    {/* Circle Dot Stepper nodes icons layout */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                      isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                      isCurrent ? 'bg-[#6C2BFF] border-[#6C2BFF] text-white shadow-md shadow-[#6C2BFF]/20 animate-pulse' : 
                      'bg-white border-gray-200 text-gray-300'
                    }`}>
                      {step.icon}
                    </div>

                    <div>
                      <h4 className={`text-sm font-black tracking-tight ${isCurrent ? 'text-gray-900 text-base' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                        {step.label}
                      </h4>
                      {(isCurrent || isCompleted) && (
                        <p className="text-xs font-medium text-gray-400 mt-0.5 leading-tight">{step.desc}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DYNAMIC RIDER ASSIGNMENT NOTIFICATION PROFILE COMPONENT ROW CARD */}
        {order.rider_name && order.status !== 'rejected' && (
          <div className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F0FF] flex items-center justify-center text-[#6C2BFF] shrink-0">
                <Bike size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Valet</p>
                <h4 className="text-base font-black text-gray-900 truncate mt-0.5">{order.rider_name}</h4>
                <p className="text-xs font-semibold text-gray-500">Rider is bringing your meal</p>
              </div>
            </div>
            
            <a 
              href={`tel:${order.rider_mobile}`}
              className="w-11 h-11 bg-green-50 border border-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0 active:scale-90 transition-transform shadow-sm"
            >
              <Phone size={18} className="fill-current" />
            </a>
          </div>
        )}

        {/* SUMMARY DETAILS DESCRIPTION SPEC SHEET CONTAINER */}
        <div className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Items Summary</h3>
          <div className="divide-y divide-gray-50">
            {order.items?.map((item, index) => (
              <div key={index} className="py-3 flex justify-between gap-4 text-sm font-bold last:pb-0 first:pt-0">
                <div className="min-w-0">
                  <p className="text-gray-800 truncate">{item.name} <span className="text-[#6C2BFF] font-black">x{item.quantity}</span></p>
                  <p className="text-[10px] font-medium text-gray-400 truncate mt-0.5">
                    {item.customization?.pasta} {item.customization?.extras?.length > 0 && `• Extras`}
                  </p>
                </div>
                <span className="text-gray-900 shrink-0">₹{item.itemTotal}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}