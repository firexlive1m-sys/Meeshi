import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LogOut, Download as DownloadIcon, PlayCircle, Loader2, Sparkles, CheckCircle2, FileArchive, Link as LinkIcon, FileText, ShoppingCart } from 'lucide-react';
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Download() {
  const [user, setUser] = useState<any>(null);
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<string>('Mobile');
  const [savingDevice, setSavingDevice] = useState(false);

  const isCombo = purchase?.plan?.toLowerCase().includes('combo');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        try {
          const docRef = doc(db, 'purchases', currentUser.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPurchase(docSnap.data());
          } else {
            setPurchase(null);
          }
        } catch (err) {
          console.error("Error fetching purchase", err);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setPurchase(null);
  };

  const handleSaveDevice = async () => {
    if (!user?.email) return;
    setSavingDevice(true);
    try {
      const docRef = doc(db, 'purchases', user.email);
      await setDoc(docRef, { device: selectedDevice }, { merge: true });
      // Update local state
      setPurchase({ ...purchase, device: selectedDevice });
    } catch (err) {
      console.error("Error saving device", err);
      alert("Failed to save device. Please try again.");
    } finally {
      setSavingDevice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Not Logged In State
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white p-4">
        <div className="max-w-md w-full bg-[#1E293B] border border-slate-700/50 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-emerald-500/20 blur-2xl rounded-full" />
          
          <h1 className="text-2xl font-bold mb-2">Access Your Purchase</h1>
          <p className="text-gray-400 text-sm mb-8">
            Please log in with the email address you used during purchase to access your files.
          </p>
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-3.5 px-4 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
        </div>

        <div className="max-w-md w-full bg-[#1E293B]/50 border border-slate-700/50 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-2">Need Help?</h2>
          <p className="text-slate-400 text-sm mb-5">Having trouble logging in or accessing your downloads? Contact us anytime.</p>
          <a
            href="https://wa.me/916295429762"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)] hover:shadow-[0_0_25px_rgba(37,211,102,0.5)] transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-[#0F172A] text-[#F8FAFC] font-sans selection:bg-[#3B82F6] selection:text-white py-12 md:py-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-emerald-950/20 via-slate-900/10 to-transparent blur-3xl pointer-events-none" />
      
      <div className="max-w-5xl w-full mx-auto px-4 relative z-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              Download Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">Logged in as {user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        {purchase && (
          <div className="mb-10 space-y-6">
            {/* Success Message */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-4">
              <div className="bg-emerald-500/20 p-1.5 rounded-full text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-400">Payment Successful</h3>
                <p className="text-emerald-500/80 text-sm mt-1">Your purchase has been confirmed. Everything is ready to download.</p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-6 overflow-hidden relative">
              <div className="flex flex-col md:flex-row justify-between gap-6 relative">
                {/* Connecting line for desktop */}
                <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-700 hidden md:block z-0"></div>
                <div className="absolute top-5 left-8 w-[50%] h-0.5 bg-emerald-500 hidden md:block z-0"></div>
                
                {/* Steps */}
                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-2 text-left md:text-center w-full md:w-1/4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-400">Step 1</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-medium">Payment Complete</div>
                  </div>
                </div>
                
                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-2 text-left md:text-center w-full md:w-1/4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-400">Step 2</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-medium">Login Complete</div>
                  </div>
                </div>

                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-2 text-left md:text-center w-full md:w-1/4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 ring-4 ring-blue-500/20 flex items-center justify-center text-white shrink-0 shadow-lg">
                    <DownloadIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-400">Step 3</div>
                    <div className="text-xs text-blue-400/80 mt-0.5 font-medium">Download Tool</div>
                  </div>
                </div>

                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-2 text-left md:text-center w-full md:w-1/4 opacity-50">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-300">Step 4</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-medium">Start Using</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User has logged in, but no purchase found */}
        {!purchase ? (
          <div className="bg-[#1E293B] border border-red-500/20 rounded-2xl p-8 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-3">No Purchase Found</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              We couldn't find any purchase associated with <strong>{user.email}</strong>. 
              Please ensure you are logging in with the same email you used to purchase the tool.
            </p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 px-8 rounded-xl transition-all"
            >
              Purchase Now
            </Link>
          </div>
        ) : !purchase.device ? (
          /* User has purchase but NO device selected */
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#1E293B] border-2 border-emerald-500/30 rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(16,185,129,0.15)] text-center">
              <motion.div 
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-bold text-emerald-400 uppercase tracking-wider mx-auto mb-6"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Action Required</span>
              </motion.div>
              
              <h3 className="text-2xl md:text-3xl font-black text-white font-display tracking-tight leading-snug mb-2">
                Aap Kis Device Me Use Karenge?
              </h3>
              <p className="text-emerald-400 font-mono text-[11px] font-semibold tracking-wider uppercase mb-6">
                Device Selection
              </p>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left space-y-2 text-xs mb-8">
                <p className="text-amber-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Important Note / ज़रूरी सूचना:
                </p>
                <div className="space-y-1.5 text-gray-300 leading-relaxed font-medium">
                  <p>
                    Aap jis device me tool chalana chahte hain, <span className="text-white font-bold underline decoration-amber-400/50">usi device ko select karein</span>. Har purchase par sirf <span className="text-amber-300 font-bold">1 Single Device</span> ka access generate hoga.
                  </p>
                  <p className="text-[11px] text-gray-400 italic">
                    (Please select the exact device you will use. Access is limited to only 1 device per purchase and cannot be changed later.)
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1 text-left mb-8">
                {[
                  { 
                    id: 'Mobile', 
                    label: '📱 Mobile (Smartphone)', 
                    sub: 'Android ya iPhone par chalane ke liye' 
                  },
                  { 
                    id: 'PC', 
                    label: '🖥️ PC / Laptop', 
                    sub: 'Computer ya Laptop me setup karne ke liye' 
                  }
                ].map((opt) => {
                  const isSelected = selectedDevice === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedDevice(opt.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' 
                          : 'bg-slate-900/40 border-slate-800 text-gray-300 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className={`text-sm md:text-base font-bold transition-colors ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 leading-normal transition-colors">
                          {opt.sub}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-500' 
                          : 'border-slate-600 bg-transparent'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={handleSaveDevice}
                disabled={savingDevice}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 border border-emerald-400/20 shadow-lg cursor-pointer transition-all duration-150 disabled:opacity-70"
              >
                {savingDevice ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm & Get Access</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* User has purchase and DEVICE is selected! */
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-emerald-500/20 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Subscription
                  </div>
                  <h2 className="text-2xl font-bold text-white">{purchase.plan || 'Meesho Automation Tool'}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Device: <span className="font-bold text-emerald-400">{purchase.device}</span> | Order ID: {purchase.orderId}
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Content Based on Device */}
            <div className="space-y-8">
                {/* Meesho Section */}
                <div className="bg-[#1E293B] border-t-4 border-[#F43397] rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                      <ShoppingCart className="w-6 h-6 text-[#F43397]" />
                      Meesho Auto Listing Tool
                    </h3>
                  </div>
                  
                  <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                    {/* Video side */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-200 flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-[#3B82F6]" />
                        Setup & How To Use
                      </h4>
                      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-700/50">
                        <iframe 
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/YOUR_MEESHO_VIDEO_ID" 
                          title="Meesho Tutorial Video" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mt-2 flex gap-2 items-start">
                        <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
                        <p className="text-amber-500/90 text-xs font-medium leading-relaxed">
                          Please watch the setup video before downloading and using the tool.
                        </p>
                      </div>
                    </div>

                    {/* Resources side */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-200">Resources & Downloads</h4>
                      <div className="space-y-3">
                        <a href="LINK_TO_MEESHO_ZIP" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700 hover:border-[#F43397]/50 rounded-xl transition-all group cursor-pointer">
                          <div className="w-10 h-10 rounded-lg bg-[#F43397]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileArchive className="w-5 h-5 text-[#F43397]" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-200 group-hover:text-white">
                              Tool ZIP File
                            </p>
                            <p className="text-xs text-slate-400">
                              Extension folder to load
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-medium">
                               <span className="bg-slate-800 px-2 py-0.5 rounded">v1.2.0</span>
                               <span>2.4 MB</span>
                               <span>Updated: Today</span>
                            </div>
                          </div>
                        </a>
                        
                        <a href="LINK_TO_IMAGE_TOOL" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700 hover:border-[#3B82F6]/50 rounded-xl transition-all group cursor-pointer">
                          <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <LinkIcon className="w-5 h-5 text-[#3B82F6]" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-200 group-hover:text-white">Image Generation Tool</p>
                            <p className="text-xs text-slate-400">Click to open link</p>
                          </div>
                        </a>

                        <a href="LINK_TO_TEXT_GUIDE" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700 hover:border-emerald-500/50 rounded-xl transition-all group cursor-pointer">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-200 group-hover:text-white">Text Guide</p>
                            <p className="text-xs text-slate-400">Step-by-step instructions</p>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flipkart Section */}
                {isCombo ? (
                  <div className="bg-[#1E293B] border-t-4 border-[#2874F0] rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
                      <h3 className="text-2xl font-black text-white flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 text-[#2874F0]" />
                        Flipkart Auto Listing Tool
                      </h3>
                    </div>
                    
                    <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                      {/* Video side */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-200 flex items-center gap-2">
                          <PlayCircle className="w-5 h-5 text-[#3B82F6]" />
                          Setup & How To Use
                        </h4>
                        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-700/50">
                          <iframe 
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/YOUR_FLIPKART_VIDEO_ID" 
                            title="Flipkart Tutorial Video" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                          ></iframe>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mt-2 flex gap-2 items-start">
                          <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
                          <p className="text-amber-500/90 text-xs font-medium leading-relaxed">
                            Please watch the setup video before downloading and using the tool.
                          </p>
                        </div>
                      </div>

                      {/* Resources side */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-200">Resources & Downloads</h4>
                        <div className="space-y-3">
                          <a href="LINK_TO_FLIPKART_ZIP" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700 hover:border-[#2874F0]/50 rounded-xl transition-all group cursor-pointer">
                            <div className="w-10 h-10 rounded-lg bg-[#2874F0]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <FileArchive className="w-5 h-5 text-[#2874F0]" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-200 group-hover:text-white">
                                Tool ZIP File
                              </p>
                              <p className="text-xs text-slate-400">
                                Extension folder to load
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-medium">
                                 <span className="bg-slate-800 px-2 py-0.5 rounded">v1.2.0</span>
                                 <span>2.4 MB</span>
                                 <span>Updated: Today</span>
                              </div>
                            </div>
                          </a>
                          
                          <a href="LINK_TO_IMAGE_TOOL" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700 hover:border-[#3B82F6]/50 rounded-xl transition-all group cursor-pointer">
                            <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <LinkIcon className="w-5 h-5 text-[#3B82F6]" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-200 group-hover:text-white">Image Generation Tool</p>
                              <p className="text-xs text-slate-400">Click to open link</p>
                            </div>
                          </a>

                          <a href="LINK_TO_TEXT_GUIDE" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700 hover:border-emerald-500/50 rounded-xl transition-all group cursor-pointer">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <FileText className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-200 group-hover:text-white">Text Guide</p>
                              <p className="text-xs text-slate-400">Step-by-step instructions</p>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1E293B] border-t-4 border-slate-600 rounded-2xl overflow-hidden shadow-xl p-8 text-center">
                    <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                    <h3 className="text-2xl font-black text-slate-400 mb-2">Flipkart Auto Listing Tool</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
                      You are currently on the Single Plan. Upgrade to the Combo Plan to get access to the Flipkart Auto Listing Tool as well.
                    </p>
                    <a 
                      href="/#pricing" 
                      className="inline-flex items-center gap-2 bg-[#2874F0] hover:bg-[#1C5ECA] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Buy Flipkart Tool
                    </a>
                  </div>
                )}
              </div>
          </div>
        )}

        {/* Support Section */}
        {purchase && purchase.device && (
          <div className="mt-12 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700/50 rounded-2xl p-8 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-3">Need Help?</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              If you have any issue with login, download, installation or activation, our support team is ready to help.
            </p>
            <a
              href="https://wa.me/916295429762"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)] hover:shadow-[0_0_25px_rgba(37,211,102,0.5)] transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Contact Support
            </a>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800/50 bg-[#0F172A]/80 backdrop-blur-md relative z-10 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Refund Policy</a>
          </div>
          <div>Current Version: 1.2.0</div>
        </div>
      </footer>
    </div>
  );
}
