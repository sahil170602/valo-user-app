import SplashBackground from '../components/splash/SplashBackground';

export default function SplashScreen() {
  return (
<div className="relative min-h-screen flex flex-col items-center justify-center bg-[#18043A] overflow-hidden">      
      {/* Very subtle radial gradient to mimic the center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,43,255,0.4)_0%,rgba(0,0,0,0)_70%)] pointer-events-none"></div>

      {/* Background Line Art Icons */}
      <SplashBackground />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* 3D Cloche Icon (Custom SVG) */}
        <div className="relative mb-6">
          {/* Motion lines */}
          <div className="absolute top-1/2 -left-6 flex flex-col gap-1 -translate-y-1/2 opacity-80">
             <div className="h-1 w-4 bg-[#A88BFF] rounded-full"></div>
             <div className="h-1 w-6 bg-[#A88BFF] rounded-full translate-x-2"></div>
          </div>

          <svg width="140" height="100" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="clocheGradient" x1="70" y1="20" x2="70" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9B66FF" />
                <stop offset="1" stopColor="#5B1AE8" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Base Plate */}
            <rect x="15" y="80" width="110" height="6" rx="3" fill="#A88BFF" />
            <rect x="25" y="86" width="90" height="4" rx="2" fill="#7A45FF" opacity="0.6" />
            
            {/* Dome */}
            <path d="M 25 78 C 25 35, 115 35, 115 78 Z" fill="url(#clocheGradient)" filter="url(#glow)" />
            
            {/* Top Heart Handle */}
            <path d="M66 22 C66 18, 70 15, 70 20 C70 15, 74 18, 74 22 C74 26, 70 30, 70 30 C70 30, 66 26, 66 22 Z" fill="#A88BFF" />
            
            {/* Light reflection on dome */}
            <path d="M 35 70 C 35 45, 60 38, 70 38 C 65 42, 45 50, 42 70 Z" fill="#FFFFFF" opacity="0.2" />
          </svg>
        </div>

        {/* Valo Logo Text */}
        <div className="flex items-center justify-center relative mb-3">
          <h1 className="text-white text-7xl font-bold tracking-tight select-none" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Val
          </h1>
          <div className="relative">
             <h1 className="text-white text-7xl font-bold tracking-tight select-none" style={{ fontFamily: 'Poppins, sans-serif' }}>
              o
             </h1>
             {/* Yellow Swoosh over 'o' */}
             <svg className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-4 text-brand-accent" viewBox="0 0 30 15" fill="none">
               <path d="M 2 12 Q 15 0 28 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
             </svg>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-brand-accent font-medium tracking-wide text-sm mt-1">
          Food Delivery for Hotel Guests
        </p>
      </div>

      {/* Bottom Pagination Dots */}
      <div className="absolute bottom-8 flex gap-2">
        <div className="w-4 h-2 bg-brand-primary rounded-full"></div>
        <div className="w-2 h-2 bg-brand-primary/40 rounded-full"></div>
        <div className="w-2 h-2 bg-brand-primary/40 rounded-full"></div>
      </div>

    </div>
  );
}