import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Wait for exit animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#212121]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="relative w-64 h-64 flex items-center justify-center p-4"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full animate-pulse" />
            
            <img 
              src="/logo.png" 
              alt="Shalom Logo" 
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="text-primary font-black text-6xl drop-shadow-lg">S</div>';
              }}
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-4 text-center"
          >
            <h1 className="text-4xl font-black text-primary tracking-tighter drop-shadow-md">SHALOM</h1>
            <p className="text-text-main/60 text-sm font-medium uppercase tracking-[0.4em] mt-2">Ho Anao ny Fiadanana</p>
          </motion.div>

          {/* Loading bar */}
          <div className="absolute bottom-12 left-12 right-12 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-primary"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
