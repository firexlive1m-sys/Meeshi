import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag } from 'lucide-react';

interface SaleNotification {
  name: string;
  time: string;
}

const RealisticSalesList: SaleNotification[] = [
  { name: "Rajesh Kumar", time: "just now" },
  { name: "Suresh Patel", time: "1m ago" },
  { name: "Priya Sharma", time: "2m ago" },
  { name: "Anish Sen", time: "3m ago" },
  { name: "Amit Verma", time: "4m ago" },
  { name: "Balaji Textiles", time: "5m ago" },
  { name: "Karan Johar", time: "7m ago" },
  { name: "Ritu Choudhary", time: "9m ago" },
  { name: "S. K. Gupta", time: "11m ago" },
  { name: "Vikas Bishnoi", time: "13m ago" },
  { name: "Dipali Seth", time: "15m ago" }
];

interface LiveSalesNotificationProps {
  isStickyVisible: boolean;
  isChatOpen?: boolean;
}

export default function LiveSalesNotification({ isStickyVisible, isChatOpen = false }: LiveSalesNotificationProps) {
  const [current, setCurrent] = useState<SaleNotification | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let activeTimeout: NodeJS.Timeout;

    const showNotification = () => {
      const randomIndex = Math.floor(Math.random() * RealisticSalesList.length);
      setCurrent(RealisticSalesList[randomIndex]);
      setVisible(true);

      // Keep visible for 4.5 seconds for easy scanning
      activeTimeout = setTimeout(() => {
        setVisible(false);
        scheduleNext();
      }, 4500);
    };

    const scheduleNext = () => {
      // Much faster, natural random delays of 3 to 9 seconds to keep the site lively
      const randomDelay = Math.floor(Math.random() * (9000 - 3000 + 1) + 3000);
      
      activeTimeout = setTimeout(() => {
        showNotification();
      }, randomDelay);
    };

    // First trigger after 2 seconds of page load so it shows up almost immediately
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, 2000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(activeTimeout);
    };
  }, []);

  return (
    <div 
      id="live-sales-notification-toast" 
      className={`fixed left-3 sm:left-4 z-50 max-w-[270px] w-[calc(100%-1.5rem)] pointer-events-none transition-all duration-[450ms] ease-in-out ${
        isStickyVisible 
          ? "bottom-[84px] md:bottom-[140px]" 
          : "bottom-4 md:bottom-6"
      } ${isChatOpen ? "hidden" : ""}`}
      style={isChatOpen ? { display: 'none' } : undefined}
    >
      <AnimatePresence>
        {visible && current && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full bg-[#1E293B]/95 border border-[#334155] rounded-xl px-2.5 py-2 flex items-center gap-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.8)] pointer-events-auto"
          >
            {/* Compact Action Icon */}
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-[#3B82F6] shrink-0 border border-[#334155]">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>

            {/* Structured Compact Content */}
            <div className="flex-1 min-w-0 font-sans text-left leading-none">
              <div className="flex items-center justify-between gap-1">
                {/* 1. Name */}
                <span className="text-[11px] font-bold text-gray-100 truncate">
                  {current.name}
                </span>
                {/* 3. Time */}
                <span className="text-[8px] text-gray-500 font-mono shrink-0">
                  {current.time}
                </span>
              </div>
              
              {/* 2. Meesho Auto Listing Tool Label representing they purchased */}
              <div className="text-[9px] text-gray-400 mt-1 font-medium flex items-center gap-1.5">
                <span className="text-emerald-400 font-extrabold uppercase text-[8.5px] tracking-wider bg-emerald-950/20 px-1 py-0.5 rounded border border-emerald-500/20 shrink-0">Purchased</span>
                <span className="text-gray-200 truncate">Meesho Auto Listing Tool</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
