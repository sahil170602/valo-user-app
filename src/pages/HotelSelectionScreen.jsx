import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoginBackground from '../components/auth/LoginBackground';

// DUMMY DATA: 5 Hotels, 5 Rooms each
const DUMMY_HOTELS = [
  { id: '1', name: 'Taj Mahal Palace', rooms: ['101', '102', '103', '104', '105'] },
  { id: '2', name: 'The Oberoi', rooms: ['201', '202', '203', '204', '205'] },
  { id: '3', name: 'ITC Grand Chola', rooms: ['301', '302', '303', '304', '305'] },
  { id: '4', name: 'Leela Palace', rooms: ['401', '402', '403', '404', '405'] },
  { id: '5', name: 'JW Marriott', rooms: ['501', '502', '503', '504', '505'] },
];

export default function HotelSelectionScreen({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the data passed from the Login Screen
  const mobileNumber = location.state?.mobileNumber || '';
  const existingName = location.state?.existingName || '';

  // Safety check: redirect to login if no mobile number is present
  useEffect(() => {
    if (!mobileNumber) {
      navigate('/', { replace: true });
    }
  }, [mobileNumber, navigate]);

  // Form State
  const [fullName, setFullName] = useState(existingName);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get available rooms for the currently selected hotel
  const availableRooms = DUMMY_HOTELS.find(h => h.name === selectedHotel)?.rooms || [];

  const handleSaveAndContinue = async () => {
    setIsLoading(true);

    const userData = { 
      mobile_number: mobileNumber,
      full_name: fullName,
      hotel_name: selectedHotel,
      room_number: selectedRoom
    };

    try {
      // 1. Save/Update user profile in Supabase
      const { error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'mobile_number' });

      if (error) throw error;

      // 2. SAVE TO LOCAL STORAGE (Persistence)
      localStorage.setItem('valo_user', JSON.stringify(userData));
      
      // 3. Update global authentication state
      setIsAuthenticated(true);

      // 4. Navigate to Home
      navigate('/home', { replace: true });

    } catch (error) {
      console.error('Error saving profile:', error.message);
      alert('Error saving details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form is complete before enabling button
  const isFormValid = fullName.trim() !== '' && selectedHotel !== '' && selectedRoom !== '';

  return (
    <div className="relative h-[100dvh] bg-[#FAFAFC] flex flex-col font-sans overflow-hidden">
      <LoginBackground />

      {/* Back Button */}
      <div className="relative z-10 px-6 pt-12">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 pt-8 pb-12 w-full max-w-md mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-bold text-[#150734] mb-2 leading-tight">Where are you staying?</h2>
          <p className="text-gray-500 text-[15px]">
            {existingName ? `Welcome back, ${existingName}!` : 'Let us know where to deliver your food.'}
          </p>
        </div>

        {/* Selection Card */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col gap-5 mb-8">
          
          {/* Show Name Field ONLY for new users */}
          {!existingName && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1 text-[13px] uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name" 
                className="w-full bg-[#F9F9FB] border border-gray-200 rounded-2xl px-4 py-4 outline-none text-gray-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-medium"
              />
            </div>
          )}

          {/* Hotel Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1 text-[13px] uppercase tracking-wider">Select Hotel</label>
            <div className="relative">
              <select 
                value={selectedHotel}
                onChange={(e) => {
                  setSelectedHotel(e.target.value);
                  setSelectedRoom(''); 
                }}
                className="w-full appearance-none bg-[#F9F9FB] border border-gray-200 rounded-2xl px-4 py-4 outline-none text-gray-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-semibold"
              >
                <option value="" disabled>Choose your hotel</option>
                {DUMMY_HOTELS.map(hotel => (
                  <option key={hotel.id} value={hotel.name}>{hotel.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Room Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1 text-[13px] uppercase tracking-wider">Room Number</label>
            <div className="relative">
              <select 
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                disabled={!selectedHotel}
                className={`w-full appearance-none border rounded-2xl px-4 py-4 outline-none transition-all font-semibold ${
                  selectedHotel 
                    ? 'bg-[#F9F9FB] border-gray-200 text-gray-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary' 
                    : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <option value="" disabled>Choose room</option>
                {availableRooms.map(room => (
                  <option key={room} value={room}>Room {room}</option>
                ))}
              </select>
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${selectedHotel ? 'text-gray-400' : 'text-gray-300'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button 
          onClick={handleSaveAndContinue}
          disabled={!isFormValid || isLoading}
          className={`w-full mt-auto text-white rounded-2xl py-4.5 flex items-center justify-center gap-2 font-bold text-[17px] transition-all duration-300 shadow-lg ${
            isFormValid 
              ? 'bg-[#4C12D0] hover:bg-brand-dark shadow-[0_8px_20px_rgba(76,18,208,0.3)] active:scale-[0.98]' 
              : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Setting up...
            </span>
          ) : (
            'Start Ordering Food'
          )}
        </button>

      </div>
    </div>
  );
}