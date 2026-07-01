"use client";

import React, { useRef, useEffect, useCallback, useState, useSyncExternalStore } from "react";
import { ArrowRight, UserPlus, TrendingUp, Building2, Banknote, ClipboardList } from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { gsap } from "@/lib/gsap";
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

    // GSAP entrance for the marquee bar — single one-shot reveal.
    // power2.out, 0.55s (under the 600ms ceiling), fires once.
    const ctx = gsap.context(() => {
      const marqueeBar = sectionRef.current?.querySelector(".gsap-hero-fade");
      if (marqueeBar) {
        gsap.from(marqueeBar, {
          opacity: 0,
          y: 20,
          duration: 0.55,
          ease: "power2.out",
          delay: 1.2,
          clearProps: "all",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // CTA micro-interactions are now handled purely in CSS (.hero-btn-primary
  // / .hero-btn-secondary) — scale(1.02) + gold glow on hover with
  // power1.inOut easing. No elastic, no JS mouse tracking.

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

          {/* Eyebrow badge — premium with pulsing glow ring */}
          <div className="mb-6 sm:mb-8 hero-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="hero-badge-premium inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/60 backdrop-blur-sm px-4 py-1.5 shadow-sm">
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
          </div>

          {/* Main heading — CSS line reveals. Solid gold color (NOT background-clip
              gradient) so the question mark descender never clips on iOS. */}
          <h1
            className="font-display font-bold text-[clamp(2rem,7vw,5.5rem)] tracking-[-0.035em] text-navy-deep select-none heading-balance mb-8 sm:mb-10"
            style={{ lineHeight: 1.35 }}
          >
            <span className="block hero-line-1">
              You Built A Team.
            </span>
            <span className="block text-center hero-line-2">
              So Why Does Everything Still
            </span>
            <span className="block text-center hero-line-3">
              <span className="inline font-serif italic font-semibold whitespace-nowrap text-gold">
                Depend On You?
              </span>
            </span>
          </h1>

          {/* Gold underline doodle — now a sibling below the heading so it can
              never overlap or clip the question mark. */}
          <div className="hero-line-3 flex justify-center mb-8 sm:mb-10" aria-hidden="true">
            <UnderlineSquiggle className="w-24 sm:w-32 h-[5px] text-gold/60" delay={1.0} duration={1.0} />
          </div>

          {/* Feature chips — staggered pop-in */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 max-w-3xl mx-auto">
            {[
              { label: "Hired experienced people", Icon: UserPlus },
              { label: "Promoted managers", Icon: TrendingUp },
              { label: "Created departments", Icon: Building2 },
              { label: "Increased salaries", Icon: Banknote },
              { label: "Held meetings & set targets", Icon: ClipboardList },
            ].map(({ label, Icon }, idx) => (
              <div
                key={idx}
                className="hero-chip flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-200/80 bg-white/70 shadow-sm hover:border-gold/40 hover:bg-white hover:shadow-md transition-all duration-300"
                style={{ animationDelay: `${0.6 + idx * 0.08}s` }}
              >
                <Icon className="w-3.5 h-3.5 text-gold/70 group-hover:text-gold shrink-0" />
                <span className="text-navy-deep/80 font-sans text-[11px] sm:text-[12px] font-semibold whitespace-nowrap">
                  You {label}
                </span>
              </div>
            ))}
          </div>

          {/* Bridging content block — premium glass card with gold glow */}
          <div
            className="hero-card-premium mb-8 sm:mb-10 max-w-2xl mx-auto rounded-2xl px-6 py-7 sm:px-10 sm:py-9 text-center"
            style={{ animationDelay: "0.8s" }}
          >
            <p className="text-navy-deep font-sans text-base sm:text-lg font-bold leading-relaxed mb-4">
              So why does it still feel like the company slows down whenever you step away?
            </p>
            <div className="hero-divider w-12 h-px mx-auto mb-4" />
            <p className="text-navy-deep/90 font-sans text-sm sm:text-base leading-relaxed mb-1">
              Most organizations don&apos;t struggle because people don&apos;t know what to do.
            </p>
            <p className="text-slate-500 font-sans text-sm sm:text-base leading-relaxed font-light mb-5">
              They struggle because knowing and doing are two very different things.
            </p>
            <p className="text-navy-deep font-sans text-xs sm:text-sm font-bold tracking-wide uppercase">
              That&apos;s the gap{" "}
              <span className="text-gold font-black">AVYSTRA</span>{" "}
              helps organizations close.
            </p>
          </div>

          {/* CTAs — premium with gold sweep */}
          <div
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-10 sm:mb-14 hero-fade-in"
            style={{ animationDelay: "1.0s" }}
          >
            <button
              onClick={handleScrollToForm}
              className="hero-btn-primary group relative cursor-pointer rounded-full px-8 py-3.5 flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 shadow-lg overflow-hidden"
            >
              <span className="relative z-10 text-white font-mono text-[12px] font-bold tracking-[0.2em] uppercase">
                Talk To Us
              </span>
              <ArrowRight className="relative z-10 w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleScrollToBento}
              className="hero-btn-secondary group relative cursor-pointer rounded-full px-8 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shadow-sm overflow-hidden"
            >
              <span className="relative z-10 text-navy-deep font-mono text-[12px] font-bold tracking-[0.2em] uppercase">
                See The Problem
              </span>
            </button>
          </div>

          {/* Trust indicators — premium with gold accent lines */}
          <div
            className="flex flex-wrap justify-center gap-x-8 sm:gap-x-12 gap-y-3 pt-6 border-t border-slate-200/60 w-full max-w-2xl hero-fade-in"
            style={{ animationDelay: "1.2s" }}
          >
            {[
              "Leadership Development",
              "Manager Effectiveness",
              "Team Accountability",
              "Execution Systems",
            ].map((label, i) => (
              <div key={i} className="flex items-center gap-2.5 group cursor-default">
                <span className="w-1 h-1 rounded-full bg-gold/50 group-hover:bg-gold group-hover:scale-150 transition-all duration-500" />
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-navy-deep/40 uppercase tracking-[0.15em] group-hover:text-navy-deep transition-colors duration-500">
                  {label}
                </span>
              </div>
            ))}
          </div>
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
