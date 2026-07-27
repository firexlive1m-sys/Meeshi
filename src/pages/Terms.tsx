import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-[#F8FAFC] font-sans py-12 md:py-20 px-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-emerald-950/20 via-slate-900/10 to-transparent blur-3xl pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="bg-[#1E293B] border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8">Terms & Conditions</h1>
          
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and purchasing our digital tools, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our products.
            </p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. License to Use</h2>
            <p>
              Upon purchase, you are granted a non-exclusive, non-transferable, revocable license to use the tools for your personal or internal business purposes. You may not resell, redistribute, or reverse engineer the tools.
            </p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Updates and Support</h2>
            <p>
              We may provide updates to our tools from time to time. Your purchase includes access to minor updates and basic customer support for the duration specified in your plan.
            </p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Limitation of Liability</h2>
            <p>
              In no event shall AutoListing or its suppliers be liable for any damages arising out of the use or inability to use the materials on our website, even if we have been notified orally or in writing of the possibility of such damage.
            </p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
