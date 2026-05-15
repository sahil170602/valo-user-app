export default function SplashBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      {/* Top Left - Cloche */}
      <svg className="absolute top-16 left-8 w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M6 14h12M12 4a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8zM12 4v-2M10 2h4" />
      </svg>
      
      {/* Top Right - Burger */}
      <svg className="absolute top-20 right-8 w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M4 14h16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2zM4 10h16a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4zM4 12h16" />
      </svg>

      {/* Mid Left - Fries */}
      <svg className="absolute top-1/4 left-4 w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M8 21h8l2-10H6l2 10zM10 11V3m4 8V3m-6 8l-2-6m10 6l2-6" />
      </svg>

      {/* Mid Right - Drink */}
      <svg className="absolute top-1/3 right-6 w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M6 8h12l-2 14H8L6 8zM8 4h8l-1 4H9L8 4zM12 2v2" />
      </svg>

      {/* Bottom Left - Pizza */}
      <svg className="absolute bottom-1/3 left-6 w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 21L3 8a13 13 0 0 1 18 0l-9 13z" />
        <circle cx="12" cy="11" r="1" />
        <circle cx="9" cy="14" r="1" />
        <circle cx="15" cy="12" r="1" />
      </svg>

      {/* Bottom Right - Bowl */}
      <svg className="absolute bottom-1/4 right-8 w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M4 12a8 8 0 0 0 16 0H4zM12 12V4m-4 8V5m8 7V5" />
      </svg>

      {/* Bottom Center - Hotel Outline (Faded in background) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
        <svg viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full text-white opacity-40">
           <rect x="70" y="30" width="60" height="70" />
           <rect x="80" y="40" width="10" height="10" />
           <rect x="110" y="40" width="10" height="10" />
           <rect x="80" y="60" width="10" height="10" />
           <rect x="110" y="60" width="10" height="10" />
           <path d="M90 100 V 85 H 110 V 100" />
           <text x="82" y="25" fontSize="8" fill="currentColor" strokeWidth="0" className="tracking-widest">HOTEL</text>
           <rect x="20" y="50" width="40" height="50" />
           <rect x="140" y="60" width="40" height="40" />
        </svg>
      </div>
    </div>
  );
}