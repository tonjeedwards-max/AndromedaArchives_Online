import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("splashSeen");
    if (!seen) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("splashSeen", "1");
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#0a0612]">
            <img
              src="https://media.base44.com/images/public/6a31ab404b56216f56967385/3092b6f21_generated_4ba8b566.png"
              alt=""
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0612]/30 via-[#0a0612]/10 to-[#0a0612]" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative z-10 text-center px-4"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-accent animate-twinkle" />
              <Sparkles className="w-4 h-4 text-accent animate-twinkle" style={{ animationDelay: "0.5s" }} />
              <Sparkles className="w-6 h-6 text-accent animate-twinkle" style={{ animationDelay: "1s" }} />
            </div>
            <h1
              className="font-display text-5xl sm:text-7xl md:text-8xl font-light tracking-tight text-shimmer"
              style={{ textShadow: "0 0 40px rgba(157, 124, 216, 0.5), 0 0 80px rgba(230, 193, 92, 0.3)" }}
            >
              The Andromeda Archive
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-4 text-sm text-muted-foreground font-light tracking-[0.3em] uppercase"
            >
              one of many archives
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
