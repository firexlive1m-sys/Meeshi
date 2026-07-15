import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SCREENSHOT_SLIDES } from '../data';
import { ArrowLeft, ArrowRight, Eye, ShieldCheck } from 'lucide-react';

export default function ProofSlider() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SCREENSHOT_SLIDES.length);
    }, 4000); // Automatically change slide every 4 seconds
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % SCREENSHOT_SLIDES.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + SCREENSHOT_SLIDES.length) % SCREENSHOT_SLIDES.length);
  };

  return (
    <section id="proof-slider-section" className="py-16 relative bg-[#0F172A]">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-900/10 to-transparent" />
      
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* Section header */}
        <div className="text-center mb-8">
          <span className="text-[10px] md:text-sm font-mono tracking-widest text-[#3B82F6] font-bold uppercase block mb-1">
            Visual Proof & Tool Interface
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-display">
            Screenshots & Seller <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">Proofs</span>
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-lg mx-auto">
            Swipe or use arrow keys to inspect the simple auto-listing workflow.
          </p>
        </div>

        {/* Carousel Outer Wrapper */}
        <div className="relative bg-[#1E293B] border border-[#334155] rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden">
          
          {/* Viewport Box (Fully contained image to prevent ANY cutting of screenshot) */}
          <div className="relative w-full h-[280px] sm:h-[420px] md:h-[540px] bg-[#0F172A] rounded-xl md:rounded-2xl overflow-hidden group flex items-center justify-center">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full flex items-center justify-center relative p-2"
              >
                {/* Screenshot Image Mockup (fully contained, never cropped) */}
                <img
                  src={SCREENSHOT_SLIDES[activeIdx].imageUrl}
                  alt={SCREENSHOT_SLIDES[activeIdx].title}
                  className="max-w-full max-h-full w-auto h-auto object-contain mx-auto rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </AnimatePresence>

            {/* Desktop Navigation Helper Overlays */}
            <div className="absolute top-1/2 -translate-y-1/2 left-3 z-10 hidden md:block">
              <button
                onClick={handlePrev}
                className="p-3 rounded-full bg-[#0F172A]/80 border border-[#334155] text-white hover:bg-[#3B82F6] hover:border-blue-400 transition-all shadow-md cursor-pointer"
                aria-label="Previous image"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-3 z-10 hidden md:block">
              <button
                onClick={handleNext}
                className="p-3 rounded-full bg-[#0F172A]/80 border border-[#334155] text-white hover:bg-[#3B82F6] hover:border-blue-400 transition-all shadow-md cursor-pointer"
                aria-label="Next image"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Security Indicator */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#0F172A]/90 text-[10px] text-[#3B82F6] font-mono border border-[#334155] flex items-center gap-1.5 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Safe Seller Proof
            </div>
          </div>

          {/* Description details card placed neatly below, preventing overlay coverage */}
          <div className="mt-4 p-4 rounded-xl bg-[#0F172A]/40 border border-[#334155] relative">
            <div className="flex gap-2 items-center text-xs text-[#3B82F6] font-mono mb-1">
              <Eye className="w-3.5 h-3.5" />
              <span>Proof Screenshot {activeIdx + 1} of {SCREENSHOT_SLIDES.length}</span>
            </div>
            <h3 className="text-sm md:text-base font-bold text-white font-display mb-1">
              {SCREENSHOT_SLIDES[activeIdx].title}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              {SCREENSHOT_SLIDES[activeIdx].description}
            </p>
          </div>

          {/* Simple Navigation Buttons Row for Mobile Swipe / Dots indicator */}
          <div className="flex justify-between items-center mt-4">
            
            {/* Dots */}
            <div className="flex gap-2 mx-auto sm:mx-0">
              {SCREENSHOT_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`h-2 rounded-full transition-all duration-355 cursor-pointer ${
                    activeIdx === idx ? 'w-6 bg-[#3B82F6]' : 'w-2 bg-[#1E293B] border border-[#334155]'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Mobile Arrows row */}
            <div className="flex gap-2 md:hidden">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-lg bg-[#0F172A]/60 border border-[#334155] text-white hover:bg-[#3B82F6] transition-colors cursor-pointer"
                aria-label="Previous slide"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2.5 rounded-lg bg-[#0F172A]/60 border border-[#334155] text-white hover:bg-[#3B82F6] transition-colors cursor-pointer"
                aria-label="Next slide"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
          
        </div>
        
      </div>
    </section>
  );
}
