import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LogOut, Download, PlayCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchase() {
      if (!user?.email) return;
      try {
        const docRef = doc(db, 'purchases', user.email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPurchase(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching purchase", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchase();
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-[#0F172A] text-[#F8FAFC] font-sans selection:bg-[#3B82F6] selection:text-white py-12 md:py-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-emerald-950/20 via-slate-900/10 to-transparent blur-3xl pointer-events-none" />
      
      <div className="max-w-5xl w-full mx-auto px-4 relative z-10">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              My Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">Logged in as {user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        {!purchase ? (
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">No active purchases found.</h2>
            <p className="text-gray-400">If you just made a purchase, please wait a moment or contact support.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-emerald-500/20 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Subscription
                  </div>
                  <h2 className="text-2xl font-bold text-white">{purchase.plan || 'Meesho Automation Tool'}</h2>
                  <p className="text-gray-400 text-sm mt-1">Order ID: {purchase.orderId}</p>
                </div>
                <a 
                  href="https://link-to-your-actual-download-file.zip" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5" />
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
