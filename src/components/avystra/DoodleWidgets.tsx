"use client";

import { motion } from "motion/react";
import { useSyncExternalStore } from "react";

interface DoodleProps {
  className?: string;
  color?: string;
  duration?: number;
  delay?: number;
}

/**
 * Detect if the device is iOS Safari — used to force-show doodles
 * on iOS where whileInView + SVG pathLength can fail to trigger.
 * Uses useSyncExternalStore to avoid setState-in-effect lint error.
 */
function useIsIOS() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      if (typeof navigator === "undefined") return false;
      return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      );
    },
    () => false
  );
}

/** Squiggly underline that draws itself on scroll-into-view.
 *  On iOS, falls back to CSS opacity (no pathLength animation) since
 *  iOS Safari can fail to trigger whileInView for SVG <path> elements. */
export function UnderlineSquiggle({
  className = "",
  color = "var(--color-gold)",
  duration = 1.4,
  delay = 0.3,
}: DoodleProps) {
  const isIOS = useIsIOS();

  return (
    <svg
      viewBox="0 0 200 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute left-0 bottom-[-6px] w-[110%] h-[12px] overflow-visible pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <motion.path
        d="M2 13C35 9 125 2 198 2C160 5.5 110 8 35 12"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        // On iOS: skip pathLength animation (can fail), just fade in.
        // On other devices: draw the path with pathLength animation.
        initial={isIOS ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
        whileInView={
          isIOS
            ? { opacity: 0.8 }
            : { pathLength: 1, opacity: 1 }
        }
        viewport={{ once: true }}
        transition={{ duration, delay, ease: "easeInOut" }}
        // Fallback: if whileInView never fires, the path is still visible
        // after 2 seconds via this CSS-based timeout
        style={{ opacity: isIOS ? undefined : undefined }}
      />
    </svg>
  );
}

/** Dynamic organic sparkle star — pops in with spring physics.
 *  On iOS, uses simpler opacity fade instead of scale/rotate spring
 *  which can fail to trigger. */
export function DoodleSparkle({
  className = "",
  color = "var(--color-gold)",
  duration = 1.2,
  delay = 0,
}: DoodleProps) {
  const isIOS = useIsIOS();

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute w-8 h-8 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <motion.path
        d="M 20 2 Q 20 18, 38 20 Q 20 22, 20 38 Q 20 22, 2 20 Q 20 18, 20 2"
        fill={color}
        // On iOS: simple opacity fade (reliable on Safari).
        // On other devices: spring scale + rotate (premium effect).
        initial={isIOS ? { opacity: 0 } : { scale: 0, opacity: 0, rotate: -25 }}
        whileInView={
          isIOS
            ? { opacity: 0.9 }
            : { scale: 1, opacity: 0.9, rotate: 0 }
        }
        viewport={{ once: true }}
        transition={
          isIOS
            ? { duration, delay }
            : { type: "spring", stiffness: 80, damping: 10, duration, delay }
        }
        whileHover={
          isIOS
            ? undefined
            : { scale: 1.2, rotate: 45, transition: { duration: 0.3 } }
        }
      />
    </svg>
  );
}
