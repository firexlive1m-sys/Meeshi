import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Refund() {
  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-[#F8FAFC] font-sans py-12 md:py-20 px-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-emerald-950/20 via-slate-900/10 to-transparent blur-3xl pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="bg-[#1E293B] border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8">Refund Policy</h1>
          
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Digital Products</h2>
            <p>
              Due to the nature of digital products, which cannot be returned once downloaded, we generally do not offer refunds once the files have been successfully accessed or downloaded.
            </p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Exceptions</h2>
            <p>
              We may consider offering a refund in the following exceptional circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The tool fails to function as described and our support team cannot resolve the issue.</li>
              <li>You made a duplicate purchase by mistake.</li>
              <li>The file was corrupted and we are unable to provide a working replacement.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Requesting a Refund</h2>
            <p>
              To request a refund, please contact our support team via WhatsApp with your order details and a detailed explanation of the issue you are experiencing. All requests must be made within 7 days of the original purchase.
            </p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Processing Time</h2>
            <p>
              Once a refund request is approved, it may take 5-10 business days for the funds to appear back on your original payment method, depending on your bank or credit card provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
