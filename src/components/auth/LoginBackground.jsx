export default function LoginBackground() {
  return (
    <div className="absolute top-0 left-0 w-full h-80 overflow-hidden pointer-events-none z-0">
      {/* Very faint top gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F2ECFF] to-transparent opacity-60"></div>
      
      {/* Left Building Line Art */}
      <div className="absolute top-16 -left-8 w-64 h-64 opacity-20 text-brand-primary">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
           <rect x="50" y="50" width="60" height="150" />
           <rect x="60" y="60" width="15" height="15" />
           <rect x="85" y="60" width="15" height="15" />
           <rect x="60" y="85" width="15" height="15" />
           <rect x="85" y="85" width="15" height="15" />
           <path d="M70 200 V 170 H 90 V 200" />
           {/* Hotel Sign */}
           <rect x="35" y="90" width="15" height="60" />
           <text x="39" y="105" fontSize="8" fill="currentColor" strokeWidth="0" writingMode="vertical-rl">HOTEL</text>
           <rect x="110" y="80" width="50" height="120" />
           <rect x="120" y="90" width="10" height="10" />
           <rect x="140" y="90" width="10" height="10" />
           {/* Clouds & Trees */}
           <path d="M10 180 Q 20 160 30 180 Z" />
           <path d="M180 40 Q 190 30 200 40 Q 210 50 190 50 H 180 Z" />
        </svg>
      </div>

      {/* Right Hand & Cloche Line Art */}
      <div className="absolute top-32 -right-12 w-64 h-64 opacity-20 text-brand-primary">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
          {/* Hand */}
          <path d="M120 120 C 140 120, 160 140, 190 140 V 160 C 160 160, 140 140, 120 140 C 100 140, 90 150, 80 150 L 60 130 C 80 120, 100 120, 120 120 Z" />
          {/* Cloche */}
          <path d="M70 120 H 170" strokeWidth="2" />
          <path d="M80 115 C 80 70, 160 70, 160 115 Z" />
          {/* Heart Handle */}
          <path d="M115 65 C 115 60, 120 58, 120 62 C 120 58, 125 60, 125 65 C 125 70, 120 73, 120 73 C 120 73, 115 70, 115 65 Z" fill="currentColor" />
          {/* Sparkles */}
          <path d="M160 40 L 165 50 L 175 55 L 165 60 L 160 70 L 155 60 L 145 55 L 155 50 Z" />
        </svg>
      </div>
    </div>
  );
}