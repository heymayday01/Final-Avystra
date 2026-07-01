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
    if (reducedMotion) return;

    try {
      CustomEase.create("customExpo", "0.22, 1, 0.36, 1");
    } catch (e) {
      // Already created
    }

    // GSAP entrance for the marquee bar (only remaining gsap-hero-fade element)
    const ctx = gsap.context(() => {
      const marqueeBar = sectionRef.current?.querySelector(".gsap-hero-fade");
      if (marqueeBar) {
        gsap.from(marqueeBar, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: "expo.out",
          delay: 1.4,
          clearProps: "all",
        });
      }
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

      <div className="relative max-w-5xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full select-none">
        <div className="flex flex-col items-center text-center w-full">

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 sm:mb-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/60 backdrop-blur-sm px-4 py-1.5 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                {!reducedMotion && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
              </span>
              <span className="text-[10px] sm:text-[11px] text-navy-deep font-mono tracking-[0.22em] font-bold uppercase whitespace-nowrap">
                Leadership &amp; Performance Consulting
              </span>
            </span>
          </motion.div>

          {/* Main heading */}
          <h1
            className="font-display font-bold text-[clamp(2rem,7vw,5.5rem)] tracking-[-0.035em] text-navy-deep select-none heading-balance mb-6 sm:mb-8"
            style={{ lineHeight: 1.3 }}
          >
            <span className="block">
              {["You", "Built", "A", "Team."].map((word, i) => (
                <motion.span
                  key={`w1-${i}`}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1.0, delay: 0.15 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block"
                >
                  {word}{" "}
                </motion.span>
              ))}
            </span>
            {/* Line 2: "So Why Does Everything Still" */}
            <span className="block text-center">
              {["So", "Why", "Does", "Everything", "Still"].map((word, i) => (
                <motion.span
                  key={`w2-${i}`}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1.0, delay: 0.4 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="inline"
                >
                  {word}{" "}
                </motion.span>
              ))}
            </span>
            {/* Line 3: "Depend On You?" (gold, own line) */}
            <span className="block text-center">
              <motion.span
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.0, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative inline text-gold font-serif italic font-semibold whitespace-nowrap"
                style={{ overflow: "visible" }}
              >
                Depend On You?
                <UnderlineSquiggle className="absolute -bottom-2 left-0 w-full h-[6px] text-gold/60" delay={1.1} duration={1.0} />
              </motion.span>
            </span>
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-600 font-sans text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light mb-6 sm:mb-8"
          >
            Most organizations don&apos;t struggle with knowing what to do. They struggle with{" "}
            <span className="font-semibold text-navy-deep">consistently doing it.</span>{" "}
            That&apos;s the gap <span className="font-bold text-gold">AVYSTRA</span> closes.
          </motion.p>

          {/* Feature cards — compact inline chips */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 max-w-3xl mx-auto"
          >
            {[
              { label: "Hired experienced people", Icon: UserPlus },
              { label: "Promoted managers", Icon: TrendingUp },
              { label: "Created departments", Icon: Building2 },
              { label: "Increased salaries", Icon: Banknote },
              { label: "Held meetings & set targets", Icon: ClipboardList },
            ].map(({ label, Icon }, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + idx * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200/80 bg-white/70 shadow-sm hover:border-gold/40 hover:bg-white transition-all duration-300"
              >
                <Icon className="w-3.5 h-3.5 text-gold/70 shrink-0" />
                <span className="text-navy-deep/80 font-sans text-[11px] sm:text-[12px] font-semibold whitespace-nowrap">
                  You {label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Bridging question */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 sm:mb-10 max-w-2xl mx-auto"
          >
            <p className="text-navy-deep font-sans text-base sm:text-lg font-semibold leading-relaxed text-center">
              So why does it still feel like the company slows down whenever you step away?
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-10 sm:mb-14"
          >
            <button
              ref={ctaRef}
              onClick={handleScrollToForm}
              className="group relative cursor-pointer rounded-full bg-navy-deep hover:bg-navy-soft px-8 py-3.5 flex items-center gap-2.5 transition-all duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 shadow-lg"
            >
              <span className="text-white font-mono text-[12px] font-bold tracking-[0.2em] uppercase">
                Talk To Us
              </span>
              <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleScrollToBento}
              className="cursor-pointer rounded-full border border-slate-300 bg-white/70 backdrop-blur-sm px-8 py-3.5 transition-all duration-300 hover:bg-white hover:border-gold/50 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shadow-sm"
            >
              <span className="text-navy-deep font-mono text-[12px] font-bold tracking-[0.2em] uppercase">
                See The Problem
              </span>
            </button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="flex flex-wrap justify-center gap-x-6 sm:gap-x-10 gap-y-3 pt-6 border-t border-slate-200/60 w-full max-w-2xl"
          >
            {[
              "Leadership Development",
              "Manager Effectiveness",
              "Team Accountability",
              "Execution Systems",
            ].map((label, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-gold group-hover:scale-150 transition-transform duration-500" />
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-navy-deep/50 uppercase tracking-[0.15em] group-hover:text-navy-deep transition-colors duration-500">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
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
