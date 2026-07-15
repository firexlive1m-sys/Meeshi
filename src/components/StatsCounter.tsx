import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { STATS } from '../data';
import * as Icons from 'lucide-react';

export default function StatsCounter() {
  return (
    <section id="live-stats-section" className="py-16 relative overflow-hidden bg-[#0F172A]">
      {/* Visual neon circles */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-80 h-80 bg-blue-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-950/20 text-xs font-semibold text-[#3B82F6] mb-3 uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(59,130,246,0.1)]"
          >
            <Icons.Activity className="w-3.5 h-3.5 animate-pulse text-[#3B82F6]" />
            Live Platform Performance
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-extrabold text-white tracking-tight font-display"
          >
            Numbers Jo <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">Jhooth Nahi Bolte</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-sm md:text-base max-w-xl mx-auto mt-2 font-sans"
          >
            Real stats from active Meesho resellers scaling their daily catalogs listings automatically.
          </motion.p>
        </div>

        {/* Counters Grid */}
        {/* Desktop: 4 cards in row | Tablet: 2x2 grid | Mobile: 2 cards per row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((stat, idx) => {
            const IconComponent = (Icons as any)[stat.icon] || Icons.LineChart;
            return (
              <CounterCard
                key={stat.id}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                icon={IconComponent}
                delayIndex={idx}
              />
            );
          })}
        </div>

        {/* Counters Grid Ends */}
      </div>
    </section>
  );
}

interface CounterCardProps {
  key?: string;
  value: number;
  suffix: string;
  label: string;
  icon: any;
  delayIndex: number;
}

function CounterCard({ value, suffix, label, icon: Icon, delayIndex }: CounterCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;

    // Adjust step and duration
    const duration = 1200; // ms
    const increment = end / (duration / 16); // 60fps refresh is ~16ms

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(parseFloat(start.toFixed(1)));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  // Format counter to show clean integer or floats
  const displayVal = count % 1 === 0 ? count.toLocaleString('en-IN') : count.toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delayIndex * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-[#1E293B] border border-[#334155] p-5 md:p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
    >
      {/* Holographic light reflection on hover */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />

      {/* Top row with icon & status pulse */}
      <div className="flex justify-between items-center mb-4">
        <div className="p-3 bg-[#0F172A] rounded-xl text-[#3B82F6] group-hover:text-blue-400 border border-[#334155] group-hover:border-blue-500/20 transition-all duration-300">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Numbers */}
      <div className="mb-2">
        <span className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 font-display">
          {displayVal}{suffix}
        </span>
      </div>

      {/* Label */}
      <p className="text-xs md:text-sm text-gray-400 leading-tight group-hover:text-gray-300 font-sans transition-colors">
        {label}
      </p>
    </motion.div>
  );
}
