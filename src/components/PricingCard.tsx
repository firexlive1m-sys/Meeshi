import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CONFIG } from '../data';
import { ShieldCheck, Zap, Star, Flame, Trophy, RefreshCw, AlertCircle } from 'lucide-react';

interface PricingCardProps {
  onBuyClick?: (planName: string, price: number) => void;
}

export default function PricingCard({ onBuyClick }: PricingCardProps) {
  const [timeLeft, setTimeLeft] = useState(898); // ~14m 58s in seconds
  const [seatsLeft, setSeatsLeft] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 898; // auto reset countdown loop so they never see it hit zero
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Slowly fluctuate seats left to make it look realistic
  useEffect(() => {
    const seatTimer = setInterval(() => {
      setSeatsLeft((prev) => {
        if (prev > 3) {
          // 25% chance of decreasing a seat
          if (Math.random() > 0.75) return prev - 1;
        } else {
          // If 3 seats left, reset to 8 after a while to avoid hitting 0
          if (Math.random() > 0.95) return 8;
        }
        return prev;
      });
    }, 12000);
    return () => clearInterval(seatTimer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
  };

  const originalPrice = CONFIG.originalPrice;
  const price = CONFIG.discountedPrice;
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  const valueStack = [
    { title: "💻 1-Click Auto Listing Bulk Spreadsheet Script", desc: "Process and deploy 500+ catalogs automatically", value: "₹1,999" },
    { title: "📦 Low Shipping Charge Formula", desc: "Calibrate package dimensions to accurately qualify for the lowest shipping tiers legally", value: "₹1,499" },
    { title: "📱 Mobile Upload Bypass Template", desc: "Upload and manage listings directly from your iOS or Android smartphone", value: "₹999" },
    { title: "🎥 Step-by-Step Video Tutorial (Hindi)", desc: "Clear, screen-recorded visual walkthrough with no complex jargon", value: "₹499" },
    { title: "💬 1-on-1 Dedicated WhatsApp Support", desc: "Receive direct, expert assistance for setup and configuration anytime", value: "₹999" }
  ];

  const totalActualWorth = 5995;

  return (
    <section id="pricing-section" className="py-20 relative bg-[#0F172A] overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />

      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-950/20 text-xs font-bold text-[#3B82F6] mb-4 font-mono uppercase shadow-[0_0_15px_rgba(59,130,246,0.15)]"
          >
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            Limited Period Offer
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white font-display uppercase tracking-tight">
            Stop Overpaying, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">Start Earning</span>
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-lg mx-auto">
            Take instant action today. Save thousands in manual labor and listing manager fees.
          </p>
        </div>

        {/* Premium Glow Container Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-md md:max-w-xl mx-auto rounded-3xl bg-[#1E293B] border-2 border-blue-500/40 p-5 sm:p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden group"
        >
          {/* Top Decorative Floating Elements */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/25 transition-all pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3B82F6] to-[#2563EB]" />

          {/* Tag */}
          <div className="absolute top-5 right-5 flex items-center gap-1 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider font-mono shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Trophy className="w-3.5 h-3.5" />
            <span>Best Seller</span>
          </div>

          <div className="text-center md:text-left mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-white font-display mb-1">
              Meesho Instant Listing Pack
            </h3>
            <p className="text-xs text-blue-300 font-sans tracking-wide">
              Complete automated bulk toolkit + secret weight formula
            </p>
          </div>

          {/* Scarcity Notice Strip */}
          <div className="mb-4 bg-amber-500/10 border border-amber-500/20 p-2.5 sm:p-3 rounded-2xl flex items-center gap-2.5 text-left">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs text-amber-300 font-semibold leading-tight">
                Hurry! Only <span className="text-white bg-amber-500/30 px-1.5 py-0.5 rounded font-bold font-mono text-shadow">{seatsLeft} Licenses Left</span> at this giveaway price.
              </p>
              <div className="w-full bg-amber-950/40 h-1.5 mt-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "90%" }}
                  animate={{ width: `${(seatsLeft / 10) * 100}%` }}
                  transition={{ duration: 0.4 }}
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full" 
                />
              </div>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-y border-[#334155] py-5 my-5">
            <div className="text-center sm:text-left">
              <span className="text-xs text-gray-400 line-through font-mono">
                M.R.P: {CONFIG.currency}{originalPrice}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white font-display text-shadow">
                  {CONFIG.currency}{price}
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                  {discountPercent}% OFF LIVE
                </span>
              </div>
            </div>

            {/* Timer countdown visual box */}
            <div className="p-3 bg-red-950/10 border border-red-500/20 rounded-xl flex flex-col items-center min-w-[130px] shadow-[0_0_15px_rgba(239,68,68,0.05)]">
              <span className="text-[10px] uppercase font-mono font-bold text-red-400 tracking-wider">
                PRICE RISES IN
              </span>
              <span className="text-base font-bold text-gray-100 font-mono mt-0.5 text-shadow-red animate-pulse">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* NEW: Dynamic Premium Value Stack Builder */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between border-b border-[#334155] pb-2">
              <h4 className="text-xs font-bold text-[#3B82F6] uppercase tracking-widest font-mono">
                COMPREHENSIVE VALUE STACK:
              </h4>
              <span className="text-[10px] text-gray-400 font-mono font-semibold">EST. VALUE</span>
            </div>
            
            <div className="space-y-3">
              {valueStack.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs leading-relaxed text-gray-300 border-b border-[#334155]/40 pb-3 last:border-0 last:pb-0">
                  <div className="mt-0.5 bg-blue-500/10 text-[#3B82F6] rounded-full p-0.5 border border-blue-500/20 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-bold text-white text-xs leading-tight">{item.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">{item.desc}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-400 shrink-0">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Total Value Calculation Block */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#0F172A] border border-[#334155] flex justify-between items-center text-xs">
              <div className="text-left">
                <span className="text-gray-400 font-medium">Total Package Worth:</span>
                <p className="text-[9px] text-[#3B82F6] font-mono uppercase tracking-wider font-bold mt-0.5">⚡ INCREDIBLE 97% LIFETIME SAVING</p>
              </div>
              <div className="text-right">
                <span className="text-gray-400 line-through font-mono font-medium">₹{totalActualWorth}</span>
                <p className="text-sm font-black text-[#22c55e] font-mono">FREE today</p>
              </div>
            </div>
          </div>

          {/* Conversion CTA */}
          <div className="space-y-4">
            <motion.button 
              onClick={() => {
                if (onBuyClick) {
                  onBuyClick("Meesho Instant Listing Pack", price);
                } else {
                  window.open(CONFIG.ctaRedirectUrl, '_blank');
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="buy-btn-effect w-full h-14 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-bold text-base flex justify-center items-center gap-3.5 border border-blue-400/20 cursor-pointer shadow-[0_0_30px_rgba(59,130,246,0.35)] transition-all duration-300 uppercase tracking-wider font-display"
            >
              <Zap className="w-5 h-5 text-yellow-300 animate-pulse fill-yellow-300" />
              Get Access Now (₹{price})
            </motion.button>

            {/* Satisfaction / Security Notice Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-400 pt-2 font-mono">
              <div className="flex items-center gap-1.5 justify-center">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span>4.9 Star Verified Vendor Rating</span>
              </div>
              
              <div className="flex items-center gap-1.5 justify-center">
                <RefreshCw className="w-3.5 h-3.5 text-[#3B82F6] animate-spin-slow" />
                <span>100% Automatic Refund Guarantee</span>
              </div>
            </div>
          </div>

          {/* Security logos */}
          <div className="mt-6 pt-5 border-t border-[#334155] flex flex-wrap items-center justify-center gap-4.5 opacity-65">
            <img 
              src="https://checkout.razorpay.com/v1/checkout.js" 
              className="hidden" 
              alt="razorpay check" 
            />
            {/* Minimal visual security badge indicators */}
            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-[#0F172A] text-gray-300 border border-[#334155] font-mono">UPI Protected</span>
            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-[#0F172A] text-gray-300 border border-[#334155] font-mono">PCI-DSS Compliant</span>
            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-[#0F172A] text-gray-300 border border-[#334155] font-mono">SSL 256 Encryption</span>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
