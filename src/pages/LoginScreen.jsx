import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginBackground from '../components/auth/LoginBackground';
import { COUNTRIES } from '../data/countries'; 
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const navigate = useNavigate();

  const defaultCountry = COUNTRIES.find(c => c.code === 'IN') || COUNTRIES[0];
  
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= selectedCountry.length) {
      setMobileNumber(value);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setMobileNumber('');
  };

  const handleContinue = async () => {
    setIsLoading(true);
    const fullMobileNumber = `${selectedCountry.dial}${mobileNumber}`;

    try {
      // MATCHED TO YOUR DATABASE: 'full_name' and 'mobile_number'
      const { data, error } = await supabase
        .from('users')
        .select('full_name')
        .eq('mobile_number', fullMobileNumber)
        .maybeSingle();

      if (error) throw error;

      const existingName = data?.full_name || '';

      // Navigate to selection screen and pass keys forward
      navigate('/select-hotel', { 
        state: { 
          mobileNumber: fullMobileNumber, 
          existingName: existingName 
        } 
      });

    } catch (error) {
      console.error('Error connecting to database:', error.message);
      alert('Network error. Please try again.');
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="relative h-[100dvh] bg-[#FAFAFC] flex flex-col font-sans overflow-hidden">
      <LoginBackground />

      {/* Top Language Selector */}
      <div className="relative z-10 flex justify-end px-6 pt-1">
        <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-sm font-medium text-gray-700">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          English
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col px-6 pt-0 pb-12 w-full max-w-md mx-auto">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-2">
          <div className="relative mb-4">
             <div className="absolute top-1/2 -left-4 flex flex-col gap-[3px] -translate-y-1/2">
                <div className="h-[2px] w-3 bg-brand-primary rounded-full"></div>
                <div className="h-[2px] w-5 bg-brand-primary rounded-full translate-x-1.5"></div>
             </div>
             <svg width="80" height="60" viewBox="0 0 140 100" fill="none">
                <rect x="15" y="80" width="110" height="6" rx="3" fill="#6C2BFF" />
                <path d="M 25 78 C 25 35, 115 35, 115 78 Z" fill="#6C2BFF" />
                <path d="M66 22 C66 18, 70 15, 70 20 C70 15, 74 18, 74 22 C74 26, 70 30, 70 30 C70 30, 66 26, 66 22 Z" fill="#6C2BFF" />
             </svg>
          </div>

          <div className="flex items-center justify-center relative mb-2">
            <h1 className="text-[#150734] text-5xl font-bold tracking-tight">Val</h1>
            <div className="relative">
               <h1 className="text-[#150734] text-5xl font-bold tracking-tight">o</h1>
               <svg className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-3 text-brand-accent" viewBox="0 0 30 15" fill="none">
                 <path d="M 2 12 Q 15 0 28 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
               </svg>
            </div>
          </div>
          <p className="text-gray-600 font-medium text-[13px] tracking-wide">Food Delivery for Hotel Guests</p>
        </div>

        {/* Welcome Titles */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#150734] mb-1.5">Welcome to Valo!</h2>
          <p className="text-gray-500 text-[15px]">Delicious food, delivered to your<br/>hotel room</p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-[28px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8">
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F4F0FF] flex items-center justify-center text-brand-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-gray-900">Login / Sign up</h3>
              <p className="text-[13px] text-gray-500 mt-0.5">Enter your mobile number to continue</p>
            </div>
          </div>

          <div className="relative">
            <div className={`flex items-center border rounded-2xl p-2 mb-4 transition-all ${isDropdownOpen ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-gray-200 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary'}`}>
              
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-700 font-medium text-sm hover:bg-gray-50 rounded-xl transition-colors shrink-0"
              >
                <span className="text-lg leading-none">{selectedCountry.flag}</span>
                <span>{selectedCountry.dial}</span>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className="w-px h-6 bg-gray-200 mx-2 shrink-0"></div>
              
              <input 
                type="tel" 
                value={mobileNumber}
                onChange={handleNumberChange}
                placeholder={`Enter ${selectedCountry.length} digit number`} 
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-[15px] px-2 py-2 min-w-0"
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 max-h-56 overflow-y-auto custom-scrollbar">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors text-left ${selectedCountry.code === country.code ? 'bg-[#F4F0FF]' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <span className="text-lg leading-none">{country.flag}</span>
                      <span className={`text-sm truncate ${selectedCountry.code === country.code ? 'font-semibold text-brand-primary' : 'font-medium text-gray-800'}`}>
                        {country.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 font-medium shrink-0">{country.dial}</span>
                  </button>
                ))}
              </div>
            )}
            
            {isDropdownOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
            )}
          </div>

          <button 
            onClick={handleContinue}
            disabled={mobileNumber.length !== selectedCountry.length || isLoading}
            className={`w-full text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 font-medium text-[16px] mb-4 transition-all duration-300 ${
              mobileNumber.length === selectedCountry.length 
                ? 'bg-[#4C12D0] hover:bg-brand-dark shadow-[0_4px_14px_rgba(76,18,208,0.4)] cursor-pointer' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Please wait...' : 'Continue'}
            {!isLoading && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
       
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-500 text-[13px] font-medium">or continue with</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-10 relative z-10">
          <button className="flex flex-col items-center justify-center gap-2 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:bg-gray-50 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-[13px] font-semibold text-gray-800">Google</span>
          </button>
          
          <button className="flex flex-col items-center justify-center gap-2 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:bg-gray-50 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black">
              <path d="M16.365 14.48c-.022-2.651 2.164-3.93 2.261-3.99-1.233-1.802-3.154-2.046-3.844-2.072-1.643-.166-3.21.966-4.048.966-.838 0-2.12-.947-3.486-.921-1.785.025-3.428.981-4.348 2.585-1.867 3.238-.477 8.04 1.34 10.665.888 1.282 1.94 2.723 3.313 2.673 1.32-.05 1.815-.85 3.407-.85 1.59 0 2.036.85 3.433.824 1.423-.025 2.336-1.305 3.21-2.583 1.01-1.474 1.426-2.9 1.448-2.977-.033-.013-2.666-1.021-2.686-4.321M14.912 5.516c.72-.87 1.205-2.08 1.073-3.284-1.04.042-2.316.693-3.058 1.56-.66.772-1.246 2.01-1.092 3.187 1.155.09 2.36-.588 3.077-1.463"/>
            </svg>
            <span className="text-[13px] font-semibold text-gray-800">Apple</span>
          </button>
          
          <button className="flex flex-col items-center justify-center gap-2 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:bg-gray-50 transition-colors">
            <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-[13px] font-semibold text-gray-800">Facebook</span>
          </button>
        </div>

        {/* Footer Terms */}
        <div className="mt-auto flex items-start justify-center gap-2 text-[12px] text-gray-500 text-center px-4 relative z-10">
          <svg className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="leading-relaxed">
            By continuing, you agree to our <a href="#" className="text-brand-primary font-medium hover:underline">Terms of Service</a><br/>
            and <a href="#" className="text-brand-primary font-medium hover:underline">Privacy Policy</a>
          </p>
        </div>

      </div>
    </div>
  );
}