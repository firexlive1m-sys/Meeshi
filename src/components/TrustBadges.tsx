import { motion } from 'motion/react';
import { TRUST_BADGES } from '../data';
import * as Icons from 'lucide-react';

export default function TrustBadges() {
  return (
    <div id="trust-badges-section" className="py-6 border-y border-[#334155]/40 bg-[#1E293B]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Desktop View: Horizontal 1-row */}
        <div className="hidden md:flex justify-between items-center gap-6">
          {TRUST_BADGES.map((badge, idx) => {
            // Dynamically resolve icon if it exists, fallback to ShieldCheck
            const IconComponent = (Icons as any)[badge.icon] || Icons.ShieldCheck;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex items-center gap-4 flex-1 justify-center border-r last:border-r-0 border-[#334155]/20 py-2"
              >
                <div className="p-2.5 rounded-full bg-[#0F172A] text-[#3B82F6] border border-[#334155]">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-100 tracking-wide font-display">{badge.title}</h4>
                  <p className="text-xs text-gray-400 font-sans mt-0.5">{badge.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile View: 2x2 grid */}
        <div className="grid grid-cols-2 md:hidden gap-4">
          {TRUST_BADGES.map((badge, idx) => {
            const IconComponent = (Icons as any)[badge.icon] || Icons.ShieldCheck;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex flex-col items-center text-center p-3.5 rounded-xl bg-[#1E293B]/30 border border-[#334155]/30"
              >
                <div className="p-2 rounded-full bg-[#0F172A] text-[#3B82F6] mb-2 border border-[#334155]">
                  <IconComponent className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs font-bold text-gray-100 font-display">{badge.title}</h4>
                <p className="text-[10px] text-gray-400 font-sans mt-0.5 line-clamp-2">{badge.desc}</p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
