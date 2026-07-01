"use client";

import React, { useRef, useEffect, useCallback, useState, useSyncExternalStore } from "react";
import { ArrowRight, UserPlus, TrendingUp, Building2, Banknote, ClipboardList } from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { CustomEase } from "gsap/CustomEase";
import { UnderlineSquiggle } from "./DoodleWidgets";
import { smoothScrollTo } from "@/lib/scroll";

// Subscribe to prefers-reduced-motion without setState-in-effect
const reducedMotionSubscribe = (callback: () => void) => {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
};
const reducedMotionGetSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reducedMotionGetServerSnapshot = () => false;

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const reducedMotion = useSyncExternalStore(
    reducedMotionSubscribe,
    reducedMotionGetSnapshot,
    reducedMotionGetServerSnapshot
  );
  const [isVisible, setIsVisible] = useState(true);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // ── Parallax: subtle depth on scroll for the headline block ──
  // Removed parallax transforms + manual IntersectionObserver to reduce
  // per-frame motion value updates during scroll. The marquee pause/
  // play is now handled by a single scroll listener instead of 3
  // useTransform values + 1 IntersectionObserver running simultaneously.
  const springConfig = { damping: 45, stiffness: 120, mass: 0.6 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  // Single lightweight scroll listener for marquee visibility only
  useEffect(() => {
    const handleScroll = () => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      setIsVisible(rect.bottom > 0 && rect.top < window.innerHeight);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // ScrollTrigger is registered globally via @/lib/gsap.
    // CustomEase needs registration here since it's Hero-specific.
    gsap.registerPlugin(CustomEase);

    if (reducedMotion) {
      const validTargets = [
        ".gsap-badge-pop",
        ".gsap-headline-word",
        ".gsap-subheadline-fade",
        ".gsap-cta-fade",
        ".gsap-hero-fade",
      ].filter((selector) => document.querySelector(selector) !== null);

      if (validTargets.length > 0) {
        gsap.set(validTargets, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "none",
          rotateX: 0,
        });
      }
      return;
    }

    try {
      CustomEase.create("customExpo", "0.22, 1, 0.36, 1");
    } catch (e) {
      // Already created
    }

    const ctx = gsap.context(() => {
      gsap.from(".gsap-hero-fade", {
        opacity: 0,
        y: 40,
        duration: 1.2,
        stagger: 0.2,
        ease: "expo.out",
        delay: 0.6,
        clearProps: "all",
      });

      gsap.from(".gsap-trust-item", {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 1.2,
        clearProps: "all",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Magnetic Spring-loaded CTA physics
  useEffect(() => {
    if (reducedMotion) return;
    const cta = ctaRef.current;
    if (!cta) return;

    const xTo = gsap.quickTo(cta, "x", {
      duration: 0.55,
      ease: "elastic.out(1, 0.42)",
    });
    const yTo = gsap.quickTo(cta, "y", {
      duration: 0.55,
      ease: "elastic.out(1, 0.42)",
    });

    let pendingFrame: number | null = null;

    const handleMouseMoveCTA = (e: MouseEvent) => {
      // Throttle to one update per animation frame. mousemove can fire
      // 100+ times/sec on fast machines; gsap.quickTo already smooths the
      // motion, so we only need the latest position per frame.
      if (pendingFrame !== null) return;
      pendingFrame = requestAnimationFrame(() => {
        pendingFrame = null;
        const rect = cta.getBoundingClientRect();
        const ctaX = rect.left + rect.width / 2;
        const ctaY = rect.top + rect.height / 2;

        const dx = e.clientX - ctaX;
        const dy = e.clientY - ctaY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const triggerRadius = Math.max(rect.width, rect.height) / 2 + 65;

        if (distance < triggerRadius) {
          const ratio = (triggerRadius - distance) / triggerRadius;
          const targetX = (dx / distance) * 10 * ratio;
          const targetY = (dy / distance) * 10 * ratio;
          xTo(targetX);
          yTo(targetY);
        } else {
          xTo(0);
          yTo(0);
        }
      });
    };

    const handleMouseLeaveCTA = () => {
      xTo(0);
      yTo(0);
    };

    const handleMouseDownCTA = () => {
      gsap.to(cta, { scale: 0.96, duration: 0.1, ease: "customExpo" });
    };

    const handleMouseUpCTA = () => {
      gsap.to(cta, {
        scale: 1,
        duration: 0.4,
        ease: "elastic.out(1.1, 0.35)",
      });
    };

    window.addEventListener("mousemove", handleMouseMoveCTA);
    cta.addEventListener("mouseleave", handleMouseLeaveCTA);
    cta.addEventListener("mousedown", handleMouseDownCTA);
    cta.addEventListener("mouseup", handleMouseUpCTA);

    return () => {
      if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
      window.removeEventListener("mousemove", handleMouseMoveCTA);
      cta.removeEventListener("mouseleave", handleMouseLeaveCTA);
      cta.removeEventListener("mousedown", handleMouseDownCTA);
      cta.removeEventListener("mouseup", handleMouseUpCTA);
    };
  }, [reducedMotion]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const isCoarse = window.matchMedia("(pointer: coarse)").matches;
      if (isCoarse) return;

      const container = sectionRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const handleScrollToForm = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const message = "Hi AVYSTRA, I visited your website and would like to know more. Can we connect?";
      window.open(`https://wa.me/918596059607?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    },
    []
  );

  const handleScrollToBento = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      smoothScrollTo("bottlenecks");
    },
    []
  );

  return (
    <section
      id="hero-section"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full pt-24 sm:pt-24 lg:pt-28 pb-2 sm:pb-4 overflow-x-hidden bg-transparent"
    >
      {/* Buttery smooth Spring Cursor Spotlight — follows mouse.
          Removed the giant 900px blur-3xl ambient glow that was causing
          scroll jank (mix-blend-color-dodge on a 1200px element forces
          full-layer composite per frame). The page-level ambient
          background now handles depth. */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] pointer-events-none z-0 hidden md:block bg-radial from-gold/[0.05] to-transparent select-none"
        style={{
          x: spotlightX,
          y: spotlightY,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full select-none transform-gpu">
        <div className="flex flex-col items-center justify-center max-w-6xl mx-auto text-center w-full relative z-20 origin-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 md:mb-6 flex flex-col items-center relative z-20"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/60 backdrop-blur-md px-4 py-1.5 shadow-[0_8px_24px_rgba(184,146,78,0.08)] ring-1 ring-white/30 hover:bg-white/80 hover:shadow-[0_12px_32px_rgba(184,146,78,0.15)] transition-all duration-500 cursor-default"
            >
              <span className="relative flex h-1.5 w-1.5">
                {!reducedMotion && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold"></span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-navy-deep font-mono tracking-[0.22em] font-bold uppercase whitespace-nowrap">
                LEADERSHIP &amp; PERFORMANCE CONSULTING
              </span>
            </motion.div>
          </motion.div>

          <div
            className="mb-4 md:mb-6 relative z-20 max-w-[95vw] lg:max-w-none"
          >
            <h1
              className="font-display font-bold text-[clamp(1.85rem,6.2vw,5rem)] tracking-[-0.035em] text-navy-deep select-none text-center heading-balance py-3"
              style={{ lineHeight: 1.5 }}
            >
              <span className="inline-flex flex-wrap justify-center gap-x-[0.22em] mr-[0.22em] align-baseline">
                {["You", "Built", "A", "Team."].map((word, i) => (
                  <motion.span
                    key={`w1-${i}`}
                    initial={{
                      opacity: 0,
                      y: 30,
                      rotateX: 20,
                      z: -50,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      rotateX: 0,
                      z: 0,
                      filter: "blur(0px)",
                    }}
                    transition={{
                      duration: 1.0,
                      delay: 0.15 + i * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="inline-block transform-gpu will-change-[transform,opacity,filter] origin-bottom-left"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              <span className="inline-flex flex-wrap justify-center gap-x-[0.22em] mr-[0.22em] align-baseline">
                {["So", "Why", "Does", "Everything", "Still"].map((word, i) => (
                  <motion.span
                    key={`w2-${i}`}
                    initial={{
                      opacity: 0,
                      y: 30,
                      rotateX: 20,
                      z: -50,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      rotateX: 0,
                      z: 0,
                      filter: "blur(0px)",
                    }}
                    transition={{
                      duration: 1.0,
                      delay: 0.4 + i * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="inline-block transform-gpu will-change-[transform,opacity,filter] origin-bottom-left"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              {/* Gold "Depend On You?" — full Framer Motion animation restored.
                  The key to fixing iOS clipping: generous line-height (1.5 on
                  the h1) + Playfair Display font (standard descender depth) +
                  the span has its OWN line-height of 1.6 so the ? tail has room.
                  No overflow-hidden anywhere in the ancestor chain. */}
              <motion.span
                initial={{ opacity: 0, y: 30, rotateX: 20, z: -50, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, rotateX: 0, z: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.0, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative inline-block transform-gpu will-change-[transform,opacity,filter] origin-bottom-right text-gold font-serif italic font-semibold whitespace-nowrap pl-[0.1em] align-baseline"
                style={{ lineHeight: 1.6, overflow: "visible" }}
              >
                Depend On You?
                <UnderlineSquiggle
                  className="absolute -bottom-1 left-0 w-full h-[6px] text-gold/60"
                  delay={1.1}
                  duration={1.0}
                />
              </motion.span>
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 md:mb-8 relative z-20 w-full max-w-4xl mx-auto animate-fade-in"
          >
            {/* Removed the blur-3xl overlay (expensive composite during scroll).
                The bullets section sits on the cream background which is clean enough. */}

            {/* The 5 bullets straight from PDF Page 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-left mb-6 max-w-4xl mx-auto px-4 select-none">
              {[
                { bullet: "You hired experienced people", Icon: UserPlus },
                { bullet: "You promoted managers", Icon: TrendingUp },
                { bullet: "You created departments", Icon: Building2 },
                { bullet: "You increased salaries", Icon: Banknote },
                { bullet: "You held meetings and set targets", Icon: ClipboardList },
              ].map(({ bullet, Icon }, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.9 + idx * 0.08,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{
                    y: -3,
                    scale: 1.03,
                    transition: { type: "spring", stiffness: 400, damping: 25 },
                  }}
                  className="group/bullet flex items-start gap-2 p-2.5 sm:p-3 rounded-xl border border-slate-200/70 bg-white/60 backdrop-blur-md shadow-[0_4px_12px_rgba(11,27,46,0.03)] hover:border-gold/40 hover:bg-white/90 hover:shadow-[0_8px_24px_rgba(184,146,78,0.08)] transition-all duration-300 cursor-default"
                >
                  <Icon className="w-3.5 h-3.5 text-gold/60 group-hover/bullet:text-gold group-hover/bullet:scale-110 transition-all duration-300 shrink-0 mt-0.5" />
                  <span className="text-slate-700 group-hover/bullet:text-navy-deep font-sans text-[13px] sm:text-sm font-semibold leading-snug transition-colors duration-300">
                    {bullet}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Powerful bridging text block */}
            <div className="group/bridge relative text-center max-w-3xl mx-auto bg-white/50 border border-gold/20 rounded-[1.5rem] p-5 sm:p-7 backdrop-blur-lg shadow-[0_8px_32px_rgba(11,27,46,0.05)] hover:shadow-[0_16px_48px_rgba(184,146,78,0.12)] hover:border-gold/40 transition-all duration-500 overflow-hidden">
              {/* Shimmer sweep on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full group-hover/bridge:translate-x-full transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none" />
              <p className="text-navy-deep font-sans text-sm sm:text-base font-semibold leading-relaxed mb-4">
                So why does it still feel like the company slows down whenever
                you step away?
              </p>

              <div className="space-y-2.5 border-t border-slate-200/60 pt-4 text-left sm:text-center">
                <p className="text-slate-600 font-sans text-[14px] sm:text-[15px] leading-relaxed font-normal">
                  <span className="font-semibold text-navy-deep">
                    Most organizations don&apos;t struggle because people
                    don&apos;t know what to do.
                  </span>{" "}
                  <br />
                  They struggle because knowing and doing are two very different
                  things.
                </p>

                <p className="text-navy-deep font-sans text-[12.5px] sm:text-sm font-bold tracking-wide uppercase pt-1">
                  That&apos;s the gap{" "}
                  <span className="text-gold font-black">AVYSTRA</span>{" "}
                  helps organizations close.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center w-full relative z-30 mt-2"
          >
            {/* Double CTAs with premium magnetic tracking */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6 relative z-40">
              {/* Talk To Us (CTA 1) */}
              <button
                ref={ctaRef}
                onClick={handleScrollToForm}
                className="group relative cursor-pointer overflow-visible p-[1px] rounded-full bg-navy-deep transition-all duration-500 hover:scale-[1.03] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream-bg"
              >
                {/* Backglow element expands and brightens smoothly on hover */}
                <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-gold via-amber-300 to-gold opacity-30 group-hover:opacity-75 blur-[10px] group-hover:blur-[16px] transition-all duration-700 pointer-events-none" />

                {/* Inner button container */}
                <div className="relative rounded-full bg-navy-deep hover:bg-navy-soft px-7 sm:px-8 py-3 sm:py-3.5 flex items-center justify-center gap-2.5 transition-all duration-300">
                  <span className="text-white font-mono text-[11.5px] sm:text-[12.5px] font-bold tracking-[0.2em] uppercase">
                    Talk To Us
                  </span>
                  <ArrowRight className="w-4 h-4 text-gold transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>

              {/* See The Problem (CTA 2) */}
              <button
                onClick={handleScrollToBento}
                className="group relative cursor-pointer overflow-hidden rounded-full border border-slate-300 bg-white/70 px-7 sm:px-8 py-3 sm:py-3.5 backdrop-blur-md transition-all duration-500 hover:bg-white hover:border-gold/50 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shadow-sm flex items-center justify-center gap-2"
              >
                <span className="text-navy-deep font-mono text-[11.5px] sm:text-[12.5px] font-bold tracking-[0.2em] uppercase">
                  See The Problem
                </span>
              </button>
            </div>

            {/* Scroll Indicator — hidden on mobile to eliminate blank space */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="hidden sm:flex mt-4 flex-col items-center gap-2 hover:opacity-100 transition-opacity cursor-ns-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xl p-1.5 outline-none"
              onClick={handleScrollToBento}
              aria-label="Scroll to discover bottlenecks"
            >
              <span
                className="text-[10.5px] font-mono text-slate-600 font-bold uppercase tracking-[0.3em]"
                style={{ writingMode: "vertical-rl" }}
              >
                Scroll to Explore
              </span>
              <div className="w-[1px] h-8 bg-gradient-to-b from-slate-400 to-transparent relative overflow-hidden">
                <motion.div
                  className="w-full h-1/2 bg-navy-deep absolute top-0"
                  animate={
                    reducedMotion ? { y: 0 } : { y: ["-100%", "200%"] }
                  }
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { duration: 1.5, repeat: Infinity, ease: "linear" }
                  }
                />
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-6 sm:mt-8 pt-5 border-t border-navy-deep/8 flex flex-wrap justify-center gap-x-8 gap-y-3 sm:gap-12 gsap-hero-fade">
          {[
            "Leadership Development",
            "Manager Effectiveness",
            "Team Accountability",
            "Execution Systems",
          ].map((label, i) => (
            <div
              key={i}
              className="flex items-center gap-2 sm:gap-3 group mix-blend-multiply gsap-trust-item"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold group-hover:scale-150 transition-transform duration-500" />
              <span className="font-mono text-[10.5px] sm:text-[11.5px] font-black text-navy-deep/50 uppercase tracking-[0.2em] group-hover:text-navy-deep transition-colors duration-500">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="mt-8 w-full border-y border-navy-deep/10 bg-navy-deep py-4 flex items-center relative z-10 overflow-hidden gsap-hero-fade">
        <div
          className="animate-marquee-slow flex whitespace-nowrap gap-x-24 select-none"
          style={{
            animationPlayState:
              isVisible && !reducedMotion ? "running" : "paused",
          }}
        >
          {[1, 2, 3, 4].map((loopIdx) => (
            <React.Fragment key={loopIdx}>
              <span className="font-display font-black text-[10px] tracking-[0.45em] text-white uppercase flex items-center gap-4">
                THINK <span className="text-gold">CLEARLY</span>
              </span>
              <span className="text-slate-500 font-light mx-4">•</span>
              <span className="font-serif italic font-light text-[10px] tracking-[0.25em] text-gold uppercase flex items-center gap-4">
                ACT DECISIVELY
              </span>
              <span className="text-slate-500 font-light mx-4">•</span>
              <span className="font-display font-black text-[10px] tracking-[0.45em] text-white uppercase flex items-center gap-4">
                ELIMINATE <span className="text-gold">FRICTION</span>
              </span>
              <span className="text-slate-500 font-light mx-4">•</span>
              <span className="font-serif italic font-light text-[10px] tracking-[0.25em] text-slate-400 uppercase flex items-center gap-4">
                STREAMLINED SUCCESS
              </span>
              <span className="text-slate-500 font-light mx-4">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
