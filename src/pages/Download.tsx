import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LogOut, Download as DownloadIcon, PlayCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Download() {
  const [user, setUser] = useState<any>(null);
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white p-4">
        <div className="max-w-md w-full bg-[#1E293B] border border-slate-700/50 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
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
        ) : (
          /* User has purchase! */
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-emerald-500/20 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Subscription
                  </div>
                  <h2 className="text-2xl font-bold text-white">{purchase.plan || 'Meesho Automation Tool'}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Device: {purchase.device || 'Not selected'} | Order ID: {purchase.orderId}
                  </p>
                </div>
                <a 
                  href="https://link-to-your-actual-download-file.zip" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
                >
                  <DownloadIcon className="w-5 h-5" />
                  Download Files
                </a>
              </div>
            </div>

            <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-6 md:p-8 border-b border-slate-700/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-[#3B82F6]" />
                  Setup & Tutorial Video
                </h3>
                <p className="text-gray-400 text-sm mt-1">Watch this quick video to learn how to set up the tool.</p>
              </div>
              <div className="aspect-video w-full bg-black relative">
                {/* Replace with actual video embed */}
                <iframe 
                  className="w-full h-full absolute inset-0"
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
                  title="Tutorial Video" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
