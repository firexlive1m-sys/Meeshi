import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQS } from '../data';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>("faq-1"); // Default open first item

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq-section" className="py-16 relative bg-[#0F172A]">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#334155]/20 to-transparent" />
      
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-10">
          <span className="text-[10px] md:text-sm font-mono tracking-widest text-[#3B82F6] font-bold uppercase block mb-1">
            Still Have Doubts? We Have Answers
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-display">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">Questions</span>
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-lg mx-auto">
            Got queries before committing? Check our simple quick facts list or message support.
          </p>
        </div>

        {/* FAQ Accordion list */}
        <div className="space-y-3">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id}
                className="rounded-xl overflow-hidden bg-[#1E293B] border border-[#334155] shadow-md hover:border-blue-500/20 transition-all duration-350"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full text-left py-4 px-5 flex justify-between items-center gap-4 text-white hover:text-[#3B82F6] font-medium transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4.5 h-4.5 text-[#3B82F6] shrink-0" />
                    <span className="text-xs md:text-sm font-display tracking-tight leading-relaxed">{faq.question}</span>
                  </div>
                  <div className={`p-1 bg-[#0F172A] rounded-full border border-[#334155] text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-[#3B82F6]' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs md:text-xs leading-relaxed text-gray-400 font-sans border-t border-[#334155]/40 bg-[#0F172A]/30">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Call support helper link bottom */}
        <div className="mt-8 text-center p-4 rounded-xl bg-[#1E293B] border border-[#334155] max-w-md mx-auto">
          <p className="text-xs text-gray-400 font-sans">
            Have different, specific questions? Feel free to write to us on WhatsApp.
          </p>
          <a
            href="https://wa.me/916295429762?text=Hi! I have some questions about Meesho Auto listing tool"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3B82F6] mt-2 hover:text-[#2563EB] hover:underline"
          >
            <span>Ask Direct on WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
}
