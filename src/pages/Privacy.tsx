import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-[#F8FAFC] font-sans py-12 md:py-20 px-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-emerald-950/20 via-slate-900/10 to-transparent blur-3xl pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="bg-[#1E293B] border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you make a purchase, such as your email address and payment details. We use this information to deliver the digital products to you and manage your account access.
            </p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to communicate with you about your orders, customer support, and important updates.
            </p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access.
            </p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Third-Party Services</h2>
            <p>
              We may use third-party services for payment processing (e.g., Stripe) and authentication (e.g., Google OAuth). These third parties have their own privacy policies governing the data they collect.
            </p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
