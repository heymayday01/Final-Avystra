"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE } from "@/lib/motion";

/**
 * Professional loading screen — clean, minimal, enterprise-grade.
 *
 * PERFORMANCE: Uses opacity-only transitions (no blur, no scale).
 * The previous version used filter:blur() on exit + logo which created
 * GPU compositing layers that caused jank when transitioning to the hero
 * (which also had blur animations). Now it's pure opacity — buttery smooth.
 */
export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const remaining = 100 - prev;
        return prev + Math.max(1, remaining * 0.15);
      });
    }, 70);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-navy-deep"
    >
      {/* Logo — opacity fade-in only (no blur) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        className="mb-8"
      >
        <img
          src="/avystra-logo-new-white.webp"
          alt="AVYSTRA Consulting Pvt. Ltd."
          style={{ height: "90px", width: "auto" }}
        />
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="h-px bg-white/10 rounded-full overflow-hidden"
        style={{ width: "10rem" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background:
              "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))",
            transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </motion.div>

      {/* Percentage */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-3 font-mono text-[10.5px] tracking-[0.3em] text-slate-500 uppercase tabular-nums"
      >
        {Math.round(progress)}%
      </motion.span>
    </motion.div>
  );
}
