import { motion } from 'motion/react';
import { COMPARISONS } from '../data';
import { XCircle, CheckCircle, Info } from 'lucide-react';

export default function ComparisonTable() {
  return (
    <section id="comparison-section" className="py-16 bg-[#0F172A] relative">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold text-[#3B82F6] uppercase tracking-widest block mb-1">Side-by-Side Analysis</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-display">
            The Difference Is <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-emerald-400 glow-text-purple">Day & Night</span>
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-md mx-auto">
            Compare how a generic seller struggles versus the automated seller using our shipping charge reduction formula.
          </p>
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-[#334155] bg-[#1E293B] shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0F172A] text-xs font-semibold text-gray-300 tracking-wider font-mono">
                <th className="py-4.5 px-6">METRIC / SPEC</th>
                <th className="py-4.5 px-6 text-red-400 bg-red-950/10">WITHOUT AUTOMATION</th>
                <th className="py-4.5 px-6 text-emerald-400 bg-emerald-950/10">WITH MEESHO AUTO TOOL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60 text-gray-300">
              {COMPARISONS.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#334155]/20 transition-colors">
                  <td className="py-4 px-6 font-semibold font-display text-gray-200">
                    {row.criteria}
                  </td>
                  <td className="py-4 px-6 bg-red-950/5 text-gray-400 text-xs flex items-center gap-2">
                    <XCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
                    <span>{row.withoutTool}</span>
                  </td>
                  <td className={`py-4 px-6 bg-emerald-950/5 text-gray-100 text-xs font-semibold ${row.highlight ? 'text-emerald-300 font-bold' : ''}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                      <span>{row.withTool}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Stacked List */}
        <div className="md:hidden space-y-4">
          {COMPARISONS.map((row, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] space-y-3"
            >
              <div className="flex items-center gap-2 border-b border-[#334155] pb-2 text-sm font-bold text-gray-100 font-display">
                <Info className="w-4 h-4 text-[#3B82F6] shrink-0" />
                <span>{row.criteria}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Manual */}
                <div className="p-2.5 rounded-lg bg-red-950/5 border border-red-950/10 space-y-1">
                  <div className="text-[10px] uppercase font-mono font-bold text-red-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Struggling Manual</span>
                  </div>
                  <p className="text-gray-400 font-sans leading-snug">{row.withoutTool}</p>
                </div>

                {/* Automation */}
                <div className="p-2.5 rounded-lg bg-emerald-950/5 border border-emerald-950/20 space-y-1">
                  <div className="text-[10px] uppercase font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 animate-pulse" />
                    <span>Auto Listing</span>
                  </div>
                  <p className="text-emerald-300 font-sans font-bold leading-snug">{row.withTool}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
