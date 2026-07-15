import { motion } from 'motion/react';
import { PROBLEMS_SOLUTIONS } from '../data';
import { ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';

export default function ProblemSolution() {
  const { title, problems, solutions } = PROBLEMS_SOLUTIONS;

  return (
    <section id="problem-solution-section" className="py-16 relative bg-[#0F172A] overflow-hidden">
      {/* Absolute glow points for ambient aesthetic */}
      <div className="absolute top-1/4 left-10 w-48 h-48 bg-red-500/5 blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-emerald-500/5 blur-[90px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold text-[#3B82F6] uppercase tracking-widest block mb-1">Modern Challenge vs Solution</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-display">
            {title}
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-sm mx-auto">
            Why many Meesho sellers struggle to grow, and how our automation tool helps you scale successfully.
          </p>
        </div>

        {/* Compact Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          
          {/* Left panel: PROBLEMS container */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6 md:p-8 bg-red-950/5 border border-red-950/20 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 text-red-400 font-bold font-display text-base mb-6 border-b border-red-950/30 pb-3">
                <ShieldAlert className="w-5.5 h-5.5" />
                <span>THE PAINFUL MEESHO TRUDGE</span>
              </div>

              <div className="space-y-6">
                {problems.map((prob, idx) => (
                  <div key={idx} className="space-y-1 text-left">
                    <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wide font-display flex items-center gap-2">
                      <span className="text-red-500 font-mono text-[10px] bg-red-950/30 px-1.5 py-0.5 rounded border border-red-950/40">0{idx + 1}</span>
                      {prob.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed pl-7 font-sans">
                      {prob.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Small bad margin indicator */}
            <div className="mt-8 text-[10px] text-red-400/70 font-mono italic flex items-center gap-1.5">
              <span>➔ Leads to cancellations, penalties & zero orders.</span>
            </div>
          </motion.div>

          {/* Right panel: SOLUTIONS container (Glow effect) */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6 md:p-8 bg-[#1E293B] border border-[#334155] shadow-lg flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold font-display text-base mb-6 border-b border-emerald-900/30 pb-3">
                <CheckCircle className="w-5.5 h-5.5 animate-pulse" />
                <span>THE DUAL FORMULA ADVANTAGE</span>
              </div>

              <div className="space-y-6">
                {solutions.map((sol, idx) => (
                  <div key={idx} className="space-y-1 text-left">
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide font-display flex items-center gap-2">
                      <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">✓ 0{idx+1}</span>
                      {sol.title}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed pl-7 font-sans">
                      {sol.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Success direction */}
            <div className="mt-8 text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span>➔ Instant setup instructions included. No extra downloads.</span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
