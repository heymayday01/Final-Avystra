"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
}

/**
 * Animated count-up number that triggers when scrolled into view.
 * Uses a lightweight rAF-based tween instead of a persistent spring
 * subscription. The animation auto-cleans up when it finishes —
 * zero ongoing per-frame overhead after the count completes.
 */
export default function CountUp({
  to,
  from = 0,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  delay = 0,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(from);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isInView || isDone) return;

    let rafId: number;
    let startTime: number | null = null;

    const startDelay = setTimeout(() => {
      const animate = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic for a premium deceleration feel
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = from + (to - from) * eased;
        setDisplayValue(current);

        if (progress < 1) {
          rafId = requestAnimationFrame(animate);
        } else {
          setDisplayValue(to);
          setIsDone(true);
        }
      };
      rafId = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(startDelay);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isInView, to, from, duration, delay, isDone]);

  const formatted = displayValue.toFixed(decimals);

  return (
    <span
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0.5,
        transition: "opacity 0.5s ease",
      }}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
