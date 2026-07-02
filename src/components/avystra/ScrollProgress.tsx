"use client";

import { useState } from "react";
import { motion, useScroll, useSpring, useMotionValueEvent } from "motion/react";

/**
 * Top-of-page scroll progress bar.
 *
 * Uses motion/react's `useScroll` which reads from the native scroll
 * position that Lenis writes to — no extra scroll listener needed.
 * Visibility is toggled via `useMotionValueEvent` (also derived from the
 * same scroll value) so there's only ONE scroll subscription total.
 */
export default function ScrollProgress() {
  const { scrollYProgress, scrollY } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  const [isVisible, setIsVisible] = useState(false);

  // Single scroll-derived subscription for visibility — no native listener
  useMotionValueEvent(scrollY, "change", (latest) => {
    const shouldShow = latest > 50;
    setIsVisible((prev) => (prev !== shouldShow ? shouldShow : prev));
  });

  return (
    <motion.div
      style={{ scaleX }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold via-navy-deep to-gold z-[9999] origin-left pointer-events-none will-change-transform"
    />
  );
}
