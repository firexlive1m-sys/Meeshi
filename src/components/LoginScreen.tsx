import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageCircle, AlertCircle } from 'lucide-react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { CONFIG } from '../data';

export default function LoginScreen() {
  const [showEmailPhoneLogin, setShowEmailPhoneLogin] = useState(false);
  const [loginStep, setLoginStep] = useState<'initial' | 'verify' | 'enter_password' | 'create_password'>('initial');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for post-purchase flow
  useEffect(() => {
    const pendingPurchaseStr = localStorage.getItem('verified_purchase');
    if (pendingPurchaseStr) {
      try {
        const pendingPurchase = JSON.parse(pendingPurchaseStr);
        if (pendingPurchase.email && pendingPurchase.data && pendingPurchase.data.phone) {
          setEmail(pendingPurchase.email);
          setPhone(pendingPurchase.data.phone);
          setShowEmailPhoneLogin(true);
          // auto verify
          handleVerify(pendingPurchase.email, pendingPurchase.data.phone);
        }
      } catch (err) {
        console.error("Error reading pending purchase", err);
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleVerify = async (emailToVerify: string, phoneToVerify: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/verify-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToVerify, phone: phoneToVerify })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Purchase not found. Please check your email and phone number or purchase the tool first.");
      } else {
        if (data.hasPassword) {
          setLoginStep('enter_password');
        } else {
          setLoginStep('create_password');
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) return;
    handleVerify(email, phone);
  };

  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (loginStep === 'create_password') {
        if (password.length < 8) {
          setError("Password must be at least 8 characters long.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        // Add flag to DB so next time it shows enter_password
        await setDoc(doc(db, "purchases", email.toLowerCase()), { hasPassword: true }, { merge: true });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Incorrect password. Please try again.");
      } else if (err.code === 'auth/email-already-in-use') {
         setError("You already have an account. Please use 'Continue with Google' or try forgot password.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
      setError(null);
      if (!email) {
          setError("Please enter your email to reset password.");
          return;
      }
      try {
          await sendPasswordResetEmail(auth, email);
          alert("Password reset email sent! Check your inbox.");
      } catch (err) {
          setError("Failed to send reset email.");
      }
  };

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
        
        {loginStep === 'initial' && (
          <>
            <h1 className="text-2xl font-bold mb-2">Access Your Purchase</h1>
            <p className="text-gray-400 text-sm mb-8">
              Please log in with the email address you used during purchase to access your files.
            </p>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-3.5 px-4 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Continue with Google
            </button>

            {!showEmailPhoneLogin && (
              <>
                <div className="my-6 flex items-center justify-center space-x-4">
                  <span className="h-px bg-slate-700 w-full"></span>
                  <span className="text-slate-400 font-medium text-sm">OR</span>
                  <span className="h-px bg-slate-700 w-full"></span>
                </div>

                <button
                  onClick={() => setShowEmailPhoneLogin(true)}
                  className="w-full flex items-center justify-center gap-3 bg-[#0F172A] border border-slate-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Login with Email + Phone
                </button>
              </>
            )}

            {showEmailPhoneLogin && (
              <motion.form 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mt-6 space-y-4 text-left"
                onSubmit={onVerifySubmit}
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Enter your purchased email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    required 
                    className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Enter your 10-digit phone number"
                  />
                </div>

                {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                </button>
              </motion.form>
            )}
          </>
        )}

        {(loginStep === 'enter_password' || loginStep === 'create_password') && (
          <form className="text-left space-y-4" onSubmit={onPasswordSubmit}>
             <button 
                type="button" 
                onClick={() => setLoginStep('initial')}
                className="text-emerald-500 hover:text-emerald-400 text-sm font-medium flex items-center gap-1 mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back
             </button>
             
             {loginStep === 'create_password' ? (
                <>
                  <h2 className="text-xl font-bold text-white mb-1">Set Your Login Password</h2>
                  <p className="text-slate-400 text-sm mb-4">Your purchase is confirmed. Create a password to access your purchase later using your email and phone number.</p>
                </>
             ) : (
                <>
                  <h2 className="text-xl font-bold text-white mb-1">Enter Password</h2>
                  <p className="text-slate-400 text-sm mb-4">Please enter your password to login.</p>
                </>
             )}

             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  minLength={8}
                  className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Minimum 8 characters"
                />
             </div>

             {loginStep === 'create_password' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required 
                    minLength={8}
                    className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Confirm your password"
                  />
                </div>
             )}

             {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

             <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (loginStep === 'create_password' ? 'Set Password' : 'Login')}
             </button>

             {loginStep === 'enter_password' && (
               <div className="text-center mt-4">
                 <button type="button" onClick={handleForgotPassword} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                   Forgot Password?
                 </button>
               </div>
             )}
          </form>
        )}
      </div>

      <div className="max-w-md w-full bg-[#1E293B]/50 border border-slate-700/30 rounded-2xl p-6 text-center shadow-lg">
        <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2">
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          Need Help?
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Facing issues logging in or accessing your purchase? Our support team is here to help.
        </p>
        <a
          href={`https://wa.me/91${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello, I need help accessing my purchased tool.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-bold rounded-lg transition-colors border border-[#25D366]/20"
        >
          <MessageCircle className="w-4 h-4" />
          Contact Support
        </a>
      </div>
    </div>
  );
}
