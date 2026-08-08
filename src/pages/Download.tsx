import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LogOut, MessageCircle, Download as DownloadIcon, PlayCircle, Loader2, Sparkles, CheckCircle2, FileArchive, Link as LinkIcon, FileText, ShoppingCart, ArrowLeft, Copy, Share2, Laptop, Phone } from 'lucide-react';
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { CONFIG } from '../data';
import { Link } from 'react-router-dom';
import PaymentFormModal from '../components/PaymentFormModal';

export default function Download() {
  const [user, setUser] = useState<any>(null);
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<string>('Mobile');
  const [savingDevice, setSavingDevice] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Phone Auth State
  const [phoneLogin, setPhoneLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [authError, setAuthError] = useState('');

  const isCombo = purchase?.plan?.toLowerCase().includes('combo') || purchase?.plan?.toLowerCase().includes('upgrade');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          let foundPurchase = null;
          let userEmailKey = currentUser.email?.toLowerCase();

          // Check if there is a pending verified purchase in local storage
          const pendingPurchaseStr = localStorage.getItem('verified_purchase');
          if (pendingPurchaseStr) {
            const pendingPurchase = JSON.parse(pendingPurchaseStr);
            const pendingEmail = pendingPurchase.email.toLowerCase();
            const pendingPhone = pendingPurchase.data.phone || '';
            
            // If the logged in user matches the purchase email or phone, save it to Firestore
            const emailMatch = currentUser.email && pendingEmail === currentUser.email.toLowerCase();
            const phoneMatch = currentUser.phoneNumber && pendingPhone && currentUser.phoneNumber.includes(pendingPhone);
            
            if (emailMatch || phoneMatch) {
              await setDoc(doc(db, 'purchases', pendingEmail), pendingPurchase.data, { merge: true });
              // Clear it once saved
              localStorage.removeItem('verified_purchase');
              if (!userEmailKey) {
                userEmailKey = pendingEmail; // Associate this email with the user for querying
              }
            }
          }

          // 1. If we have an email, try to fetch by email ID directly
          if (userEmailKey) {
            const docRef = doc(db, 'purchases', userEmailKey);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              foundPurchase = { ...docSnap.data(), emailId: userEmailKey };
            }
          }

          // 2. If not found by email, and we have a phone number, query by phone number
          if (!foundPurchase && currentUser.phoneNumber) {
            const cleanPhone = currentUser.phoneNumber.replace('+91', '').trim();
            const q = query(collection(db, 'purchases'), where('phone', '==', cleanPhone));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              foundPurchase = { ...querySnapshot.docs[0].data(), emailId: querySnapshot.docs[0].id };
            } else {
              // Try exact match with +91 just in case
              const q2 = query(collection(db, 'purchases'), where('phone', '==', currentUser.phoneNumber));
              const querySnapshot2 = await getDocs(q2);
              if (!querySnapshot2.empty) {
                foundPurchase = { ...querySnapshot2.docs[0].data(), emailId: querySnapshot2.docs[0].id };
              }
            }
          }

          setPurchase(foundPurchase);
        } catch (err) {
          console.error("Error fetching/syncing purchase", err);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (phoneNumber.length !== 10) {
      setAuthError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      setAuthError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (otp.length !== 6) {
      setAuthError('Please enter a valid 6-digit OTP');
      return;
    }
    
    if (!confirmationResult) return;
    
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setAuthError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

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
    setPhoneLogin(false);
    setOtpSent(false);
    setPhoneNumber('');
    setOtp('');
  };

  const handleSaveDevice = async () => {
    if (!purchase?.emailId) return;
    setSavingDevice(true);
    try {
      const docRef = doc(db, 'purchases', purchase.emailId);
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
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white p-4 space-y-6">
        <div className="max-w-md w-full flex justify-start">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E293B] hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all text-sm font-medium text-slate-300 hover:text-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-md w-full bg-[#1E293B] border border-slate-700/50 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-emerald-500/20 blur-2xl rounded-full" />
          
          <h1 className="text-2xl font-bold mb-2">Access Your Purchase</h1>
          <p className="text-gray-400 text-sm mb-6">
            Please log in with the email address or phone number you used during purchase to access your files.
          </p>
          
          {authError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
              {authError}
            </div>
          )}

          {!phoneLogin ? (
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-3.5 px-4 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-sm font-medium">OR</span>
                <div className="flex-grow border-t border-slate-700"></div>
              </div>

              <button
                onClick={() => setPhoneLogin(true)}
                className="w-full flex items-center justify-center gap-3 bg-[#0F172A] border border-slate-700 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Continue with Phone Number
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="text-left space-y-1">
                    <label className="text-sm font-medium text-slate-300">Phone Number</label>
                    <div className="flex items-center border border-slate-700 rounded-xl bg-[#0F172A] overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      <span className="px-3 text-slate-400 border-r border-slate-700 font-medium">+91</span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full bg-transparent px-3 py-3 outline-none text-white font-medium"
                        placeholder="Enter 10-digit number"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneLogin(false);
                      setAuthError('');
                    }}
                    className="w-full text-sm text-slate-400 hover:text-white transition-colors py-2"
                  >
                    Back to Google Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-left space-y-1">
                    <label className="text-sm font-medium text-slate-300">Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 outline-none text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center tracking-[0.5em] text-lg font-bold"
                      placeholder="------"
                    />
                    <p className="text-xs text-slate-400 text-center mt-2">
                      OTP sent to +91 {phoneNumber}
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify & Login'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setAuthError('');
                    }}
                    className="w-full text-sm text-slate-400 hover:text-white transition-colors py-2"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
              <div id="recaptcha-container" className="flex justify-center mt-4"></div>
            </div>
          )}
        </div>

        {/* Need Help Section */}
        <div className="max-w-md w-full bg-[#1E293B]/50 border border-slate-700/30 rounded-2xl p-6 text-center shadow-lg">
          <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            Need Help?
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Facing issues logging in or accessing your purchase? Our support team is here to help.
          </p>
          <a
            href={`https://wa.me/91${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello, I need help with the login page for the Auto Listing Tool.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-bold rounded-xl transition-all border border-[#25D366]/30 text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Contact on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-[#0F172A] text-[#F8FAFC] font-sans selection:bg-[#3B82F6] selection:text-white py-4 md:py-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-emerald-950/20 via-slate-900/10 to-transparent blur-3xl pointer-events-none" />
      
      <div className="max-w-5xl w-full mx-auto px-4 relative z-10">
        {(!purchase || purchase.device) && (
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                Auto Listing Tool
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-400 text-xs">Logged in as {user.email || user.phoneNumber}</p>
                {purchase?.device && (
                  <>
                    <span className="text-gray-600">|</span>
                    <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Device: {purchase.device}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={`https://wa.me/91${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello, I need help with my purchase.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 rounded-lg transition-all text-xs font-bold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Support
              </a>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-all text-xs font-medium text-slate-300 hover:text-white"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </header>
        )}

        {/* User has logged in, but no purchase found */}
        {!purchase ? (
          <div className="bg-[#1E293B] border border-red-500/20 rounded-2xl p-8 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-3">No Purchase Found</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              We couldn't find any purchase associated with <strong>{user.email || user.phoneNumber}</strong>. 
              Please ensure you are logging in with the same email or phone number you used to purchase the tool.
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
                    id: 'PC', 
                    label: '🖥️ PC / Laptop', 
                    sub: 'Computer ya Laptop me setup karne ke liye',
                    tag: 'Recommended'
                  },
                  { 
                    id: 'Mobile', 
                    label: '📱 Mobile (Smartphone)', 
                    sub: 'Android par chalane ke liye' 
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
                        <div className="flex items-center gap-2">
                          <p className={`text-sm md:text-base font-bold transition-colors ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {opt.label}
                          </p>
                          {opt.tag && (
                            <span className="text-[10px] uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold whitespace-nowrap">
                              {opt.tag}
                            </span>
                          )}
                        </div>
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

              <div className="mt-6 text-center">
                <a
                  href={`https://wa.me/91${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello, I need help with my device selection.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 rounded-xl transition-all text-sm font-bold mx-auto"
                >
                  <MessageCircle className="w-4 h-4" />
                  Need Help? Connect on WhatsApp
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* User has purchase and DEVICE is selected! */
          <div className="space-y-8">
            {purchase?.device === 'PC' && (
              <div className="bg-[#1E293B]/80 border border-blue-500/30 rounded-2xl p-6 shadow-lg text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                      <Laptop className="w-5 h-5 text-blue-400" />
                      Access from your PC / Laptop
                    </h4>
                    <p className="text-sm text-slate-400">
                      If you are on your mobile right now, share this link to your computer. Open it there and login to download the extension.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('https://www.autolisting.online/download');
                        alert('Link Copied to Clipboard!');
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-600 text-sm font-bold shadow-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copy URL
                    </button>
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Auto Listing Tool',
                            text: 'Open this link on your PC/Laptop to download the tool:',
                            url: 'https://www.autolisting.online/download'
                          }).catch(() => {});
                        } else {
                          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Open this link on your PC/Laptop to download the tool: https://www.autolisting.online/download')}`, '_blank');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all border border-blue-500 text-sm font-bold shadow-sm shadow-blue-500/20"
                    >
                      <Share2 className="w-4 h-4" />
                      Share URL
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                  
                  <div className={`p-6 md:p-8 grid md:grid-cols-2 gap-8`}>
                    {/* Video side */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-200 flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-[#3B82F6]" />
                        Setup & How To Use
                      </h4>
                      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-700/50">
                        <iframe 
                          className="w-full h-full"
                          src={purchase.device === 'Mobile' ? "https://www.youtube.com/embed/Ho3ga7qOG0M" : "https://www.youtube.com/embed/TKVkFk_ARcw"} 
                          title="Meesho Tutorial Video" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>

                    {/* Resources side */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-200">Resources & Downloads</h4>
                      <div className="space-y-3">
                        {purchase.device === 'Mobile' && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/50 border border-slate-700 hover:border-amber-500/50 rounded-xl transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <DownloadIcon className="w-5 h-5 text-amber-500" />
                              </div>
                              <div>
                                <p className="font-bold text-sm text-slate-200 group-hover:text-white">Kiwi Browser</p>
                                <p className="text-xs text-slate-400">Required browser for mobile extension</p>
                              </div>
                            </div>
                            <a href="https://github.com/kiwibrowser/src.next/releases/download/14310011181/com.kiwibrowser.browser-arm64-14310011181-github.apk" target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-lg shadow-lg transition-all text-center whitespace-nowrap">
                              Download
                            </a>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/50 border border-slate-700 hover:border-[#F43397]/50 rounded-xl transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#F43397]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <DownloadIcon className="w-5 h-5 text-[#F43397]" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-200 group-hover:text-white">
                                Download Extension (.zip)
                              </p>
                              <p className="text-xs text-slate-400">
                                Extension folder to load
                              </p>
                            </div>
                          </div>
                          <a href="https://github.com/user-attachments/files/30838051/meesho_listing_tool.zip" target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-[#F43397] hover:bg-[#d0257c] text-white text-xs font-bold rounded-lg shadow-lg transition-all text-center whitespace-nowrap">
                            Download
                          </a>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/50 border border-slate-700 hover:border-[#3B82F6]/50 rounded-xl transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <LinkIcon className="w-5 h-5 text-[#3B82F6]" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-200 group-hover:text-white">Image Generation Tool</p>
                              <p className="text-xs text-slate-400">Click to open link</p>
                            </div>
                          </div>
                          <a href="https://reduce-shipping-charge.vercel.app/" target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-[#3B82F6] hover:bg-[#2563eb] text-white text-xs font-bold rounded-lg shadow-lg transition-all text-center whitespace-nowrap">
                            Open
                          </a>
                        </div>
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
                    
                    <div className={`p-6 md:p-8 grid md:grid-cols-2 gap-8`}>
                      {/* Video side */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-200 flex items-center gap-2">
                          <PlayCircle className="w-5 h-5 text-[#3B82F6]" />
                          Setup & How To Use
                        </h4>
                        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-700/50">
                          <iframe 
                            className="w-full h-full"
                            src={purchase.device === 'Mobile' ? "https://www.youtube.com/embed/WOPtWcieVHo" : "https://www.youtube.com/embed/tTClmNY37do"}
                            title="Flipkart Tutorial Video" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>

                      {/* Resources side */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-200">Resources & Downloads</h4>
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/50 border border-slate-700 hover:border-[#2874F0]/50 rounded-xl transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#2874F0]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <DownloadIcon className="w-5 h-5 text-[#2874F0]" />
                              </div>
                              <div>
                                <p className="font-bold text-sm text-slate-200 group-hover:text-white">
                                  Download Extension (.zip)
                                </p>
                                <p className="text-xs text-slate-400">
                                  Extension folder to load
                                </p>
                              </div>
                            </div>
                            <a href="https://github.com/user-attachments/files/30656474/Flipkart_Auto_Listing_Tool.zip" target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-[#2874F0] hover:bg-[#1C5ECA] text-white text-xs font-bold rounded-lg shadow-lg transition-all text-center whitespace-nowrap">
                              Download
                            </a>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/50 border border-slate-700 hover:border-[#3B82F6]/50 rounded-xl transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <LinkIcon className="w-5 h-5 text-[#3B82F6]" />
                              </div>
                              <div>
                                <p className="font-bold text-sm text-slate-200 group-hover:text-white">Image Generation Tool</p>
                                <p className="text-xs text-slate-400">Click to open link</p>
                              </div>
                            </div>
                            <a href="https://reduce-shipping-charge.vercel.app/" target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-[#3B82F6] hover:bg-[#2563eb] text-white text-xs font-bold rounded-lg shadow-lg transition-all text-center whitespace-nowrap">
                              Open
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2874F0] to-transparent"></div>
                    <ShoppingCart className="w-12 h-12 text-[#2874F0] mx-auto mb-4 opacity-80" />
                    <h3 className="text-2xl font-black text-white mb-2">Flipkart Auto Listing Tool</h3>
                    <p className="text-slate-400 max-w-md mx-auto mb-6 text-sm">
                      You are currently on the Single Plan. Upgrade your account to get <strong>Lifetime Access</strong> to the Flipkart Auto Listing Tool with <strong>Unlimited Uses</strong>.
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      <span className="px-3 py-1 bg-[#2874F0]/10 text-[#2874F0] rounded-full text-xs font-bold border border-[#2874F0]/20">
                        ₹50 OFF Discount Applied
                      </span>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">
                        Lifetime Access
                      </span>
                    </div>

                    <p className="text-amber-400/90 text-xs mb-6 max-w-sm mx-auto font-medium">
                      Note: After purchase, the Flipkart tool will automatically be unlocked right here on this dashboard for your account!
                    </p>

                    <button 
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="inline-flex items-center gap-2 bg-[#2874F0] hover:bg-[#1C5ECA] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Buy Flipkart Tool (₹149)
                    </button>
                  </div>
                )}
              </div>
          </div>
        )}

        {/* Dashboard Need Help Section */}
        {(purchase && purchase.device) && (
          <div className="mt-12 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700/50 rounded-2xl p-8 text-center shadow-xl">
            <MessageCircle className="w-10 h-10 text-[#25D366] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Need Help with Your Purchase?</h3>
            <p className="text-slate-400 mb-6 max-w-lg mx-auto">
              Are you facing any issues while downloading, setting up, or using the tool? Our support team is here to assist you.
            </p>
            <a
              href={`https://wa.me/91${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello, I need help on the download dashboard for the Auto Listing Tool.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5" />
              Contact WhatsApp Support
            </a>
          </div>
        )}
      </div>

      <PaymentFormModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        planName="Combo Plan Upgrade" 
        planPrice={149}
        initialEmail={user?.email}
        initialName={purchase?.name}
        initialPhone={purchase?.phone}
        isEmailLocked={true}
        isUpgrade={true}
      />
    </div>
  );
}
