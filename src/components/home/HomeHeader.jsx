export default function HomeHeader() {
  return (
    <div className="px-5 pt-5 pb-3 flex items-center justify-between">
      
      {/* Left Side: Brand Icon & Name */}
      <div className="flex items-center gap-3">
        {/* Brand Icon */}
        <div className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center font-black text-lg shadow-[0_4px_14px_rgba(108,43,255,0.3)]">
          V
        </div>
        
        {/* Brand Name */}
        <div className="flex items-center">
          <h1 className="text-[#150734] text-2xl font-black tracking-tight">Val</h1>
          <div className="relative">
            <h1 className="text-[#150734] text-2xl font-black tracking-tight">o</h1>
            <div className="absolute -top-0.5 left-0 w-full h-[4px] bg-brand-accent rounded-full rotate-[-15deg]"></div>
          </div>
        </div>
      </div>

      {/* Right Side: Notification Bell */}
      <button className="relative w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 active:scale-95 transition-transform">
        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-[1.5px] border-white rounded-full"></div>
      </button>

    </div>
  );
}