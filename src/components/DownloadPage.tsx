import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  CheckCircle, 
  Play, 
  Pause, 
  Phone, 
  Lock, 
  FileDown, 
  ExternalLink, 
  LogOut, 
  User, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface Purchase {
  orderId: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  amount: number;
  planName: string;
  date: string;
}

export default function DownloadPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpSentDetails, setOtpSentDetails] = useState<{ isDev: boolean; debugCode?: string | null } | null>(null);
  const [user, setUser] = useState<Purchase | null>(null);
  const [deviceType, setDeviceType] = useState<'mobile' | 'pc_laptop' | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Video Playing States
  const [activeVideo, setActiveVideo] = useState<'meesho' | 'flipkart' | null>(null);

  // Check URL parameters first for auto-login after payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentSuccess = params.get('payment_success');
    const orderId = params.get('order_id');
    const paramEmail = params.get('email');
    const paramPlan = params.get('plan');
    const paramName = params.get('name');
    const paramPhone = params.get('phone');

    if (paymentSuccess === 'true' && paramEmail && orderId) {
      const autoUser: Purchase = {
        orderId: orderId,
        customerEmail: paramEmail,
        customerName: paramName || 'Customer',
        customerPhone: paramPhone || '',
        planName: paramPlan || 'Meesho Instant Listing Pack',
        amount: 199,
        date: new Date().toISOString()
      };
      setUser(autoUser);
      localStorage.setItem('autolisting_user', JSON.stringify(autoUser));
      
      // Clean up URL query parameters so refresh is safe
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    } else {
      // Check localStorage
      const savedUser = localStorage.getItem('autolisting_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('autolisting_user');
        }
      }
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Sahi email address daalein (Please enter a valid email ID)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || 'OTP send karne me error aaya.');
      } else {
        setIsOtpSent(true);
        setOtpSentDetails({ isDev: data.isDevelopmentMode, debugCode: data.otpDebug });
        setMessage('OTP successfully aapki email ID par bhej diya gya hai!');
      }
    } catch (err) {
      setError('Server se connect karne me dikkat aa rhi hai. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('6-digit OTP code daalein');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Galat OTP code daala hai. Kripya check karein!');
      } else {
        setUser(data.purchase);
        localStorage.setItem('autolisting_user', JSON.stringify(data.purchase));
        setMessage('Login Successful!');
      }
    } catch (err) {
      setError('OTP verify karne me fail hua. Kripya dobara check karein.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setDeviceType(null);
    setIsOtpSent(false);
    setEmail('');
    setOtp('');
    localStorage.removeItem('autolisting_user');
  };

  const isCombo = user?.planName.toLowerCase().includes('combo') || user?.planName.toLowerCase().includes('flipkart');

  const whatsappMessage = user ? `Hi Asgar Sir, maine mobile ke liye select kiya hai.
Maine ${isCombo ? 'Meesho + Flipkart Auto Listing Combo' : 'Meesho Auto Listing Pack'} purchase kiya hai.
Mera email ID: ${user.customerEmail}
Mera number: ${user.customerPhone || 'N/A'}
Mera Order ID: ${user.orderId}
Please mujhe mobile template access de dijiye.` : '';

  const handleMobileRedirect = () => {
    const waUrl = `https://wa.me/916295429762?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans select-none relative overflow-hidden">
      {/* Background radial visual glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[130px] rounded-full pointer-events-none animate-pulse" />

      {/* Modern minimal header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-4 sm:px-8 py-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center border border-blue-400/20 shadow-md">
              <Zap className="w-4.5 h-4.5 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-base tracking-tight font-display">
              Meesho<span className="text-[#3B82F6]">AutoListing</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="text-xs text-slate-400 hover:text-white transition-all font-semibold"
            >
              Back to Home
            </button>
            {user && (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-500/20 text-xs font-bold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          {/* STATE 1: NOT LOGGED IN - Show OTP Login Interface */}
          {!user && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md w-full mx-auto"
            >
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-sky-400 rounded-t-3xl" />
                
                <div className="text-center mb-6 pt-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold font-display">Tool Download Area</h1>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Kripya apna purchase kiya gya email ID daalein aur OTP verify karke tools download karein.
                  </p>
                </div>

                {error && (
                  <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Error!</p>
                      <p className="leading-relaxed">{error}</p>
                    </div>
                  </div>
                )}

                {message && (
                  <div className="p-3 mb-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-semibold">{message}</p>
                  </div>
                )}

                {!isOtpSent ? (
                  /* Form 1: Enter Email ID */
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 pl-1 font-mono">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="enter your email address"
                        className="w-full h-12 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-blue-500 text-sm text-white px-4 outline-none transition-all placeholder:text-slate-600 font-sans"
                        disabled={loading}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-extrabold text-sm uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Login OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Form 2: Verify OTP */
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5 px-1 font-mono">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Verification OTP
                        </label>
                        <button 
                          type="button" 
                          onClick={() => { setIsOtpSent(false); setError(null); }}
                          className="text-[10px] text-blue-400 hover:underline font-bold"
                        >
                          Change Email
                        </button>
                      </div>
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit OTP"
                        className="w-full h-12 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-blue-500 text-center text-lg font-bold tracking-[8px] text-white px-4 outline-none transition-all placeholder:text-slate-600 placeholder:tracking-normal font-mono"
                        disabled={loading}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-sm uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer shadow-lg"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Verify & Access Tools</span>
                        </>
                      )}
                    </button>
                    
                    {otpSentDetails?.isDev && (
                      <div className="mt-4 p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 leading-normal">
                        <p className="font-bold text-white mb-0.5">💡 Developer Mode Active!</p>
                        <p>Real SMTP configurations not detected. Real-time verification bypassed for ease of use:</p>
                        <p className="mt-1">Aap is test OTP code se login kar sakte hain: <strong className="text-white font-mono bg-blue-500/20 px-1.5 py-0.5 rounded text-xs select-text">{otpSentDetails.debugCode || '123456'}</strong></p>
                      </div>
                    )}
                  </form>
                )}

                <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                  <p className="text-[10px] text-gray-500 font-mono">
                    Note: Default Master login bypass code in preview is <strong>123456</strong>.
                  </p>
                </div>
              </div>

              {/* No Purchase Help Prompt */}
              <div className="mt-6 text-center text-xs text-gray-500 leading-relaxed font-sans max-w-xs mx-auto">
                Mera tool purchase kiya hai par email registered nahi bata raha? WhatsApp support par contact karein:<br/>
                <a href="https://wa.me/916295429762" className="text-[#3B82F6] font-bold hover:underline">
                  Chat on WhatsApp (+91 6295429762)
                </a>
              </div>
            </motion.div>
          )}

          {/* STATE 2: DEVICE CHOOSE SELECTOR */}
          {user && !deviceType && (
            <motion.div
              key="device-selector"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl w-full mx-auto"
            >
              <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 bg-slate-900/50 shadow-2xl relative text-center">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-sky-400 rounded-t-3xl" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-xs font-bold text-emerald-400 mb-4 font-mono uppercase shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                  Congratulations {user.customerName}!
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
                  Aap is tool ko kis device me chalana chahte hain?
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-md mx-auto">
                  Apna target device select karein taaki hum aapko compatible files aur guides suggest kar sakein.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  {/* Option 1: Mobile */}
                  <div 
                    onClick={() => setDeviceType('mobile')}
                    className="group border-2 border-slate-800 hover:border-[#3B82F6]/50 bg-slate-950/30 hover:bg-blue-950/10 p-6 rounded-2xl cursor-pointer text-center transition-all flex flex-col justify-between"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform border border-blue-500/20">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Mobile (Phone)</h3>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                        Bina computer ke direct Google Sheets se listing upload setup chahiye
                      </p>
                    </div>
                    <span className="inline-flex text-[10px] uppercase font-mono font-bold px-2 py-1 bg-blue-950/40 text-blue-400 rounded-lg mx-auto mt-4 border border-blue-500/10">
                      WhatsApp Setup Access
                    </span>
                  </div>

                  {/* Option 2: PC / Laptop */}
                  <div 
                    onClick={() => setDeviceType('pc_laptop')}
                    className="group border-2 border-slate-800 hover:border-[#3B82F6]/50 bg-slate-950/30 hover:bg-blue-950/10 p-6 rounded-2xl cursor-pointer text-center transition-all flex flex-col justify-between"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform border border-indigo-500/20">
                      <Laptop className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">PC / Laptop</h3>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                        Sleek excel bulk automation scripts aur instant offline Chrome guides
                      </p>
                    </div>
                    <span className="inline-flex text-[10px] uppercase font-mono font-bold px-2 py-1 bg-indigo-950/40 text-indigo-400 rounded-lg mx-auto mt-4 border border-indigo-500/10">
                      Direct Download
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500 font-mono">
                  <span>Registered: {user.customerEmail}</span>
                  <span>Order ID: {user.orderId.substring(0, 15)}...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 3: MOBILE REDIRECT DISPLAY */}
          {user && deviceType === 'mobile' && (
            <motion.div
              key="mobile-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl w-full mx-auto"
            >
              <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 bg-slate-900/50 shadow-2xl relative text-center">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-green-400 rounded-t-3xl" />

                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <Smartphone className="w-8 h-8" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight text-white">
                  Mobile Setup Completed!
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
                  Mobile phone par bulk listing chalane ke liye direct Google Sheets bypass templates handle chahiye. 
                  Humne special bypass code design kiya hai jo Asgar Sir manually aapko WhatsApp support par activate karke deinge.
                </p>

                {/* Template preview */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left font-mono text-xs text-gray-300 max-w-sm sm:max-w-md mx-auto relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    WA Draft Template
                  </div>
                  <p className="font-bold text-gray-500 mb-2">// Send this message to Asgar Sir:</p>
                  <div className="whitespace-pre-line text-slate-300 break-words leading-tight text-[11px] select-all">
                    {whatsappMessage}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
                  <button
                    onClick={() => setDeviceType(null)}
                    className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-gray-300 font-bold text-xs uppercase tracking-wider cursor-pointer border border-slate-700 transition-all"
                  >
                    Back to Selection
                  </button>
                  <button
                    onClick={handleMobileRedirect}
                    className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                    <span>Send Message on WhatsApp</span>
                  </button>
                </div>

                {/* Need Help hotline */}
                <div className="mt-8 pt-5 border-t border-slate-800 text-center text-xs text-slate-400 font-sans flex items-center justify-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#3B82F6]" />
                  <span>Kuch query h? Support Call Number: <strong className="text-white">+91 6295429762</strong></span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 4: PC / LAPTOP DOWNLOAD DASHBOARD */}
          {user && deviceType === 'pc_laptop' && (
            <motion.div
              key="pc-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 w-full text-left"
            >
              {/* Top Congrats Banner */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/40 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-500/30 bg-blue-950/20 text-[10px] font-bold text-blue-400 font-mono uppercase">
                    Order Verification Successful
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                    Congratulations, {user.customerName}! 🎉
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400 leading-normal max-w-2xl">
                    Aapka account fully active hai. Niche diye gaye tools ki setup files download karein aur training videos complete dekhkar bulk automated listings upload shuru karein!
                  </p>
                </div>

                <div className="flex gap-2.5 shrink-0">
                  <button
                    onClick={() => setDeviceType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs transition-all border border-slate-700 cursor-pointer"
                  >
                    Change Device
                  </button>
                </div>
              </div>

              {/* DYNAMIC TOOL MODULES */}
              <div className="grid grid-cols-1 gap-6">
                {/* TOOL 1: Meesho Auto Listing Tool */}
                <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/50 p-6 md:p-8 flex flex-col lg:flex-row gap-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#3B82F6] rounded-t-3xl" />
                  
                  {/* Left content block: Info & Downloads */}
                  <div className="flex-1 space-y-5 text-left">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider inline-block">
                        Active License: Lifetime Access
                      </span>
                      <h2 className="text-xl md:text-2xl font-black font-display text-white mt-2.5">
                        Meesho Auto Listing & Low Shipping Tool (v4.2)
                      </h2>
                      <p className="text-xs text-gray-400 mt-1 max-w-lg">
                        Smart pre-configured bulk Excel automated scripts compilation sheet. Optimized weight slabs configuration algorithm applied.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] font-mono">Downloads & Templates:</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* File download button */}
                        <a 
                          href="https://docs.google.com/spreadsheets/d/10GqfT3j40p8Xq2u8p_oA0V6T9Y6f8Y2a/export?format=xlsx" 
                          download="Meesho_Bulk_Auto_Listing_Script_v4.2.xlsx"
                          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-blue-500/30 transition-all hover:bg-blue-950/5 text-left group/btn cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-white text-xs leading-tight">Excel Bulk Script File</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-none">v4.2 XLSX (Direct File)</p>
                          </div>
                          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover/btn:bg-blue-500 group-hover/btn:text-white transition-all">
                            <FileDown className="w-4 h-4" />
                          </div>
                        </a>

                        {/* Sheet link button */}
                        <a 
                          href="https://docs.google.com/spreadsheets/d/10GqfT3j40p8Xq2u8p_oA0V6T9Y6f8Y2a/edit?usp=sharing" 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-emerald-500/30 transition-all hover:bg-emerald-950/5 text-left group/btn cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-white text-xs leading-tight">Google Sheets Master</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-none">Use as Copy Online</p>
                          </div>
                          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover/btn:bg-emerald-500 group-hover/btn:text-white transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 font-mono text-[10px] text-gray-500 leading-normal bg-slate-950/30 p-3.5 rounded-2xl border border-slate-800">
                      <p className="font-bold text-gray-400 uppercase">// STEP-BY-STEP QUICK START GUIDE:</p>
                      <p>1. Excel Bulk Script download karein ya Google Sheets link se File &gt; Make a copy karein.</p>
                      <p>2. Catalog information details, titles, weights (formula config) copy-paste daalein.</p>
                      <p>3. Chrome bypass script run karke, Meesho Vendor panel par upload process complete click karein.</p>
                    </div>
                  </div>

                  {/* Right content block: Training Video */}
                  <div className="w-full lg:w-[350px] shrink-0 space-y-3 text-left">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] font-mono">Hindi Tutorial Training (7m):</h3>
                    
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md group/vid">
                      {activeVideo === 'meesho' ? (
                        <video 
                          src="https://res.cloudinary.com/dutdmkrhc/video/upload/v1781288334/InShot_20260525_212334170_de2rkp_kdf2ho.mp4"
                          controls
                          autoPlay
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <img 
                            src="https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=400&q=80" 
                            className="w-full h-full object-cover opacity-45 group-hover/vid:opacity-60 transition-opacity" 
                            alt="Meesho training thumbnail"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          
                          {/* Floating play click indicator */}
                          <button 
                            onClick={() => setActiveVideo('meesho')}
                            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#3B82F6] text-white flex items-center justify-center border border-white/20 shadow-xl group-hover/vid:scale-110 transition-transform cursor-pointer"
                          >
                            <Play className="w-6 h-6 fill-white" />
                          </button>

                          <div className="absolute bottom-3.5 left-4">
                            <p className="font-bold text-xs text-white text-shadow">Meesho Listing Training Video</p>
                            <p className="text-[9px] text-gray-400 font-mono mt-0.5 leading-none">7:25 Mins &bull; High Quality Hindi</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* TOOL 2: Flipkart Auto Listing Tool - Render ONLY for Combo Buyers! */}
                {isCombo ? (
                  <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/50 p-6 md:p-8 flex flex-col lg:flex-row gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500 rounded-t-3xl" />
                    
                    {/* Left content block: Info & Downloads */}
                    <div className="flex-1 space-y-5 text-left">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider inline-block">
                          Active License: Flipkart Addon Combo
                        </span>
                        <h2 className="text-xl md:text-2xl font-black font-display text-white mt-2.5">
                          Flipkart Bulk Auto Listing Excel Tool (v2.0)
                        </h2>
                        <p className="text-xs text-gray-400 mt-1 max-w-lg">
                          Professional bulk catalog uploader tool designed for Flipkart vendor dashboard. Automatically maps vertical parameters, GST slabs, and optimized keyword strings.
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">Downloads & Templates:</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* File download button */}
                          <a 
                            href="https://docs.google.com/spreadsheets/d/10GqfT3j40p8Xq2u8p_oA0V6T9Y6f8Y2a/export?format=xlsx" 
                            download="Flipkart_Bulk_Auto_Listing_Script_v2.0.xlsx"
                            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/30 transition-all hover:bg-indigo-950/5 text-left group/btn cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-white text-xs leading-tight">Flipkart Excel Script</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-none">v2.0 XLSX (Direct File)</p>
                            </div>
                            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover/btn:bg-indigo-500 group-hover/btn:text-white transition-all">
                              <FileDown className="w-4 h-4" />
                            </div>
                          </a>

                          {/* Sheet link button */}
                          <a 
                            href="https://docs.google.com/spreadsheets/d/10GqfT3j40p8Xq2u8p_oA0V6T9Y6f8Y2a/edit?usp=sharing" 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-emerald-500/30 transition-all hover:bg-emerald-950/5 text-left group/btn cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-white text-xs leading-tight">Flipkart Sheets Master</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-none">Use as Copy Online</p>
                            </div>
                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover/btn:bg-emerald-500 group-hover/btn:text-white transition-all">
                              <ExternalLink className="w-4 h-4" />
                            </div>
                          </a>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1 font-mono text-[10px] text-gray-500 leading-normal bg-slate-950/30 p-3.5 rounded-2xl border border-slate-800">
                        <p className="font-bold text-gray-400 uppercase">// FLIPKART SPECIAL SETUP NOTE:</p>
                        <p>1. Google Sheets vertical template open karke make a copy complete click karein.</p>
                        <p>2. Pre-filled parameters mapping columns fill karke listings XLSX download kijiye.</p>
                        <p>3. Flipkart Seller account bulk catalog upload window inside upload submit karein.</p>
                      </div>
                    </div>

                    {/* Right content block: Training Video */}
                    <div className="w-full lg:w-[350px] shrink-0 space-y-3 text-left">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">Hindi Tutorial Training (5m):</h3>
                      
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md group/vid">
                        {activeVideo === 'flipkart' ? (
                          <video 
                            src="https://res.cloudinary.com/dutdmkrhc/video/upload/v1781288334/InShot_20260525_212334170_de2rkp_kdf2ho.mp4"
                            controls
                            autoPlay
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <img 
                              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80" 
                              className="w-full h-full object-cover opacity-45 group-hover/vid:opacity-60 transition-opacity" 
                              alt="Flipkart training thumbnail"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            {/* Floating play click indicator */}
                            <button 
                              onClick={() => setActiveVideo('flipkart')}
                              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white/20 shadow-xl group-hover/vid:scale-110 transition-transform cursor-pointer"
                            >
                              <Play className="w-6 h-6 fill-white" />
                            </button>

                            <div className="absolute bottom-3.5 left-4">
                              <p className="font-bold text-xs text-white text-shadow">Flipkart Listing Training Video</p>
                              <p className="text-[9px] text-gray-400 font-mono mt-0.5 leading-none">5:12 Mins &bull; High Quality Hindi &bull; Combo Exclusive</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Option to upgrade / purchase Flipkart addon */
                  <div className="p-5 sm:p-6 rounded-3xl bg-indigo-950/20 border-2 border-dashed border-indigo-500/20 text-center space-y-4">
                    <div className="max-w-md mx-auto space-y-2">
                      <h3 className="text-base font-bold text-indigo-300">Flipkart Bulk Auto Listing Tool Add-on</h3>
                      <p className="text-xs text-slate-400 leading-normal">
                        Kya aap Meesho ke sath Flipkart par bhi automatic list upload karna chahte hain? Combo pack user bankar Flipkart bulk tool activate karein.
                      </p>
                    </div>
                    <button
                      onClick={() => window.open('/#pricing-section', '_self')}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      <span>Upgrade to Combo Pack</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Dedicated Need Help Section with Phone Contact redirect to WhatsApp */}
              <div className="glass-panel p-6 rounded-3xl border border-[#334155]/60 bg-slate-900/40 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-5 relative">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
                    <HelpCircle className="w-5 h-5 text-emerald-400" />
                    <span>Tool Setup karne me koi help chahiye?</span>
                  </h3>
                  <p className="text-xs text-gray-400 max-w-xl">
                    Excel macros enable karne me issue ho rha ho ya mobile bypass integration clear na ho, direct Asgar Sir se WhatsApp support hotline par help le sakte hain. Standard response time under 15 minutes hai!
                  </p>
                </div>
                
                <a 
                  href={`https://wa.me/916295429762?text=Hi%20Asgar%20Sir,%20maine%20tool%20purchase%20kiya%20hai%20aur%20mujhe%20setup%20me%20help%20chahie.%20Email:%20${encodeURIComponent(user.customerEmail)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-500/10 cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                  <span>Call / Chat +91 6295429762</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-6 border-t border-slate-800/60 bg-slate-950/20 text-center text-[10px] text-gray-600 font-mono mt-auto relative z-10">
        <p>&copy; 2026 Meesho AutoListing Automation Suites. Operating Help hotline +91 6295429762</p>
      </footer>
    </div>
  );
}
