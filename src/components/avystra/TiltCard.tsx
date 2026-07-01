"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
}

/**
 * 3D tilt card that follows the cursor with spring physics.
 * GPU-accelerated (transform only). Automatically disabled on
 * touch devices (no mouse → no tilt → zero overhead).
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  scale = 1.02,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Cached bounding rect — set on mouseenter, cleared on mouseleave.
  // Avoids forcing a sync layout read (getBoundingClientRect) on every
  // mousemove event (60-120×/sec). The rect is stable while the pointer
  // stays inside the card; we recompute on the next mouseenter.
  const rectRef = useRef<DOMRect | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Detect touch device — skip all motion value setup on touch
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const check = () => setIsTouch(mediaQuery.matches || "ontouchstart" in window);
    check();
    mediaQuery.addEventListener("change", check);
    return () => mediaQuery.removeEventListener("change", check);
  }, []);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 200,
    damping: 20,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      // Reuse cached rect from mouseenter — avoids per-mousemove layout
      // reads. Falls back to a fresh read if the cache is missing (e.g.
      // mousemove fired without a prior mouseenter).
      let rect = rectRef.current;
      if (!rect) {
        rect = ref.current.getBoundingClientRect();
        rectRef.current = rect;
      }
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY]
  );

  const handleMouseEnter = useCallback(() => {
    setIsActive(true);
    // Cache the card's rect on enter so subsequent mousemove events
    // don't need to query layout.
    if (ref.current) {
      rectRef.current = ref.current.getBoundingClientRect();
    }
  }, []);
  const handleMouseLeave = useCallback(() => {
    setIsActive(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
    // Clear the cached rect so a stale layout isn't reused after the
    // pointer leaves (e.g. if the page scrolled or resized in between).
    rectRef.current = null;
  }, [mouseX, mouseY]);

  // Touch devices: render children without any tilt wrapper
  if (isTouch) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
      }}
      animate={{ scale: isActive ? scale : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
