import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, CheckCircle } from 'lucide-react';

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", 
  "Rahul", "Rohan", "Rajesh", "Amit", "Suresh", "Karan", "Vikas", "Anil", "Manoj", "Rakesh", 
  "Vijay", "Sanjay", "Ajay", "Manish", "Sunil", "Ravi", "Mohit", "Nitin", "Deepak", "Vishal",
  "Anjali", "Priya", "Kavita", "Neha", "Pooja", "Sneha", "Ritu", "Anita", "Sunita", "Kiran", 
  "Jyoti", "Deepika", "Nisha", "Swati", "Roshni", "Shruti", "Megha", "Shikha", "Payal", "Sakshi",
  "Ramesh", "Sandeep", "Gaurav", "Prakash", "Dinesh", "Naveen", "Ashish", "Prashant", "Tarun"
];

const LAST_NAMES = [
  "Kumar", "Patel", "Sharma", "Verma", "Singh", "Gupta", "Agarwal", "Das", "Mishra", "Pandey", 
  "Joshi", "Seth", "Mehta", "Jain", "Reddy", "Rao", "Yadav", "Choudhary", "Bansal", "Bhatia",
  "Chauhan", "Dixit", "Garg", "Jha", "Kaur", "Khatri", "Malhotra", "Nair", "Saxena", "Tiwari",
  "Bishnoi", "Sen", "Sinha", "Srivastava", "Deshmukh", "Pawar", "Bhatt", "Kapoor", "Ahuja"
];

const generateRandomName = () => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
};

const generateRandomTime = () => {
  const rand = Math.random();
  if (rand < 0.1) return "just now";
  if (rand < 0.25) return "1m ago";
  if (rand < 0.4) return "2m ago";
  if (rand < 0.6) return `${Math.floor(Math.random() * 3) + 3}m ago`; // 3-5m
  if (rand < 0.8) return `${Math.floor(Math.random() * 6) + 6}m ago`; // 6-11m
  if (rand < 0.95) return `${Math.floor(Math.random() * 10) + 12}m ago`; // 12-21m
  return `${Math.floor(Math.random() * 20) + 22}m ago`; // 22-41m
};

interface SaleNotification {
  name: string;
  time: string;
}

interface LiveSalesNotificationProps {
  isStickyVisible: boolean;
  isChatOpen?: boolean;
}

export default function LiveSalesNotification({ isStickyVisible, isChatOpen = false }: LiveSalesNotificationProps) {
  const [current, setCurrent] = useState<SaleNotification | null>(null);
  const [visible, setVisible] = useState(false);
  const recentNames = useRef<Set<string>>(new Set());

  useEffect(() => {
    let activeTimeout: NodeJS.Timeout;

    const showNotification = () => {
      let name = generateRandomName();
      // Ensure we don't repeat recently used names to keep it random
      while (recentNames.current.has(name)) {
        name = generateRandomName();
      }
      
      // Update recent names, keeping max 20 memory
      recentNames.current.add(name);
      if (recentNames.current.size > 20) {
        const firstItem = recentNames.current.values().next().value;
        if (firstItem) {
          recentNames.current.delete(firstItem);
        }
      }

      setCurrent({
        name,
        time: generateRandomTime()
      });
      setVisible(true);

      // Keep visible for 5 seconds for easy scanning
      activeTimeout = setTimeout(() => {
        setVisible(false);
        scheduleNext();
      }, 5000);
    };

    const scheduleNext = () => {
      // Reduced random delays of 4 to 10 seconds as requested
      const randomDelay = Math.floor(Math.random() * (10000 - 4000 + 1) + 4000);
      
      activeTimeout = setTimeout(() => {
        showNotification();
      }, randomDelay);
    };

    // First trigger after 3 seconds of page load so it feels natural
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, 3000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(activeTimeout);
    };
  }, []);

  return (
    <div 
      id="live-sales-notification-toast" 
      className={`fixed left-3 sm:left-4 z-50 max-w-[280px] w-[calc(100%-1.5rem)] pointer-events-none transition-all duration-[450ms] ease-in-out ${
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
            className="w-full bg-[#1E293B]/95 backdrop-blur-md border border-[#334155] rounded-xl px-2.5 py-2.5 flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.8)] pointer-events-auto"
          >
            {/* Compact Action Icon */}
            <div className="p-1.5 rounded-full bg-blue-500/10 text-[#3B82F6] shrink-0 border border-[#3B82F6]/20">
              <ShoppingBag className="w-4 h-4" />
            </div>

            {/* Structured Compact Content */}
            <div className="flex-1 min-w-0 font-sans text-left leading-none">
              <div className="flex items-center justify-between gap-1">
                {/* 1. Name */}
                <span className="text-[12px] font-semibold text-white truncate">
                  {current.name}
                </span>
                {/* 3. Time */}
                <span className="text-[10px] text-gray-400 font-medium shrink-0">
                  {current.time}
                </span>
              </div>
              
              {/* 2. Meesho Auto Listing Tool Label representing they purchased */}
              <div className="text-[10px] text-gray-400 mt-1.5 font-medium flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold uppercase text-[8.5px] tracking-widest flex items-center gap-0.5">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Purchased
                </span>
                <span className="text-gray-300 truncate">Meesho Auto Listing</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
