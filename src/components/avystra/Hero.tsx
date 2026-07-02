"use client";

import React, { useRef, useEffect, useCallback, useState, useSyncExternalStore } from "react";
import { ArrowRight, UserPlus, TrendingUp, Building2, Banknote, ClipboardList } from "lucide-react";
import { UnderlineSquiggle } from "./DoodleWidgets";
import { smoothScrollTo } from "@/lib/scroll";
import { useGsapReveal } from "@/lib/useGsapReveal";

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

  // GSAP ScrollTrigger reveals for hero entrance (eyebrow / chips / card /
  // CTAs / trust / marquee). The H1 heading stays on CSS animations
  // (hero-line-1/2/3) per design — GSAP is not applied to it.
  // Timing (all delays from pageReady at T=1.3s):
  // H1 lines: 0.1/0.25/0.4s delays, 0.5s each (finishes at ~0.9s)
  // Eyebrow fires at 0s (above heading). Chips at 0.5s (overlaps H1 line 3).
  // Card at 0.7s. CTAs at 0.9s. Trust at 1.1s. Marquee at 1.2s.
  // Tight sequence, flows top-to-bottom without gaps.
  const eyebrowRef = useGsapReveal<HTMLDivElement>("fade", { delay: 0, duration: 0.5 });
  const chipsRef = useGsapReveal<HTMLDivElement>("fade", { delay: 0.5, duration: 0.45 });
  const cardRef = useGsapReveal<HTMLDivElement>("fade", { delay: 0.7, duration: 0.5 });
  const ctaRef = useGsapReveal<HTMLDivElement>("fade", { delay: 0.9, duration: 0.45 });
  const trustRef = useGsapReveal<HTMLDivElement>("fade", { delay: 1.1, duration: 0.45 });
  const marqueeRef = useGsapReveal<HTMLDivElement>("fade", { delay: 1.2, duration: 0.45 });

  const reducedMotion = useSyncExternalStore(
    reducedMotionSubscribe,
    reducedMotionGetSnapshot,
    reducedMotionGetServerSnapshot
  );
  const [isVisible, setIsVisible] = useState(true);

  // IntersectionObserver for marquee visibility — replaces the per-scroll
  // getBoundingClientRect() call which forced a sync layout read on every
  // frame. IO is zero-cost when the section is offscreen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // CTA micro-interactions are handled purely in CSS (.hero-btn-primary
  // / .hero-btn-secondary) — scale(1.02) + gold glow on hover with
  // power1.inOut easing. No elastic, no JS mouse tracking.

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
      className="relative w-full pt-28 sm:pt-32 lg:pt-36 pb-4 sm:pb-6 overflow-x-hidden bg-transparent"
    >
      <div className="relative max-w-5xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full select-none">
        <div className="flex flex-col items-center text-center w-full">

          {/* Eyebrow badge — refined, subtle */}
          <div ref={eyebrowRef} className="mb-10 sm:mb-12">
            <span className="hero-badge-premium inline-flex items-center gap-2.5 rounded-full border border-gold/25 bg-white/50 backdrop-blur-sm px-5 py-2">
              <span className="relative flex h-1.5 w-1.5">
                {!reducedMotion && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
              </span>
              <span className="text-[10px] sm:text-[11px] text-navy-deep/70 font-mono tracking-[0.24em] font-bold uppercase whitespace-nowrap">
                Leadership &amp; Performance Consulting
              </span>
            </span>
          </div>

          {/* Main heading — refined typography with generous breathing room.
              Solid gold color (no background-clip) prevents iOS question mark clipping. */}
          <h1
            className="font-display font-bold text-[clamp(2.25rem,7vw,5rem)] tracking-[-0.04em] text-navy-deep select-none heading-balance mb-12 sm:mb-14"
            style={{ lineHeight: 1.15 }}
          >
            <span className="block hero-line-1">
              You Built A Team.
            </span>
            <span className="block text-center hero-line-2 mt-1">
              So Why Does Everything Still
            </span>
            <span className="block text-center hero-line-3 mt-1">
              <span className="relative inline-block font-serif italic font-semibold whitespace-nowrap text-gold">
                Depend On You?
                <UnderlineSquiggle className="text-gold/50" delay={1.0} duration={1.0} />
              </span>
            </span>
          </h1>

          {/* Feature chips — refined spacing + smooth hover */}
          <div ref={chipsRef} className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-12 sm:mb-14 max-w-3xl mx-auto">
            {[
              { label: "Hired experienced people", Icon: UserPlus },
              { label: "Promoted managers", Icon: TrendingUp },
              { label: "Created departments", Icon: Building2 },
              { label: "Increased salaries", Icon: Banknote },
              { label: "Held meetings & set targets", Icon: ClipboardList },
            ].map(({ label, Icon }, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/70 bg-white/50 hover:border-gold/35 hover:bg-white/80 transition-[border-color,background-color] duration-500 ease-out-expo"
              >
                <Icon className="w-3.5 h-3.5 text-gold/60 shrink-0" />
                <span className="text-navy-deep/70 font-sans text-[11px] sm:text-[12px] font-medium whitespace-nowrap">
                  You {label}
                </span>
              </div>
            ))}
          </div>

          {/* Bridging content block — cleaner, less dense, better line-height */}
          <div
            ref={cardRef}
            className="hero-card-premium mb-12 sm:mb-14 max-w-2xl mx-auto rounded-2xl px-8 py-8 sm:px-12 sm:py-10 text-center"
          >
            <p className="text-navy-deep font-sans text-lg sm:text-xl font-semibold leading-relaxed mb-5" style={{ lineHeight: 1.5 }}>
              So why does it still feel like the company slows down whenever you step away?
            </p>
            <div className="hero-divider w-12 h-px mx-auto mb-5" />
            <p className="text-navy-deep/80 font-sans text-sm sm:text-base leading-relaxed mb-2" style={{ lineHeight: 1.65 }}>
              Most organizations don&apos;t struggle because people don&apos;t know what to do.
            </p>
            <p className="text-slate-500 font-sans text-sm sm:text-base leading-relaxed font-light mb-6" style={{ lineHeight: 1.65 }}>
              They struggle because knowing and doing are two very different things.
            </p>
            <p className="text-navy-deep font-sans text-xs sm:text-sm font-bold tracking-[0.12em] uppercase">
              That&apos;s the gap{" "}
              <span className="text-gold font-black">AVYSTRA</span>{" "}
              helps organizations close.
            </p>
          </div>

          {/* CTAs — smooth premium hover */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 mb-14 sm:mb-16"
          >
            <button
              onClick={handleScrollToForm}
              className="hero-btn-primary btn-premium group relative cursor-pointer rounded-full px-9 py-4 flex items-center gap-3 focus-ring shadow-lg overflow-hidden"
            >
              <span className="relative z-10 text-white font-mono text-[12px] font-bold tracking-[0.2em] uppercase">
                Talk To Us
              </span>
              <ArrowRight className="relative z-10 w-4 h-4 text-gold group-hover:translate-x-1 transition-transform duration-500 ease-out-expo" />
            </button>

            <button
              onClick={handleScrollToBento}
              className="hero-btn-secondary btn-premium group relative cursor-pointer rounded-full px-9 py-4 focus-ring shadow-sm overflow-hidden"
            >
              <span className="relative z-10 text-navy-deep font-mono text-[12px] font-bold tracking-[0.2em] uppercase">
                See The Problem
              </span>
            </button>
          </div>

          {/* Trust indicators — refined, subtle */}
          <div
            ref={trustRef}
            className="flex flex-wrap justify-center gap-x-10 sm:gap-x-14 gap-y-3 pt-8 border-t border-slate-200/50 w-full max-w-2xl"
          >
            {[
              "Leadership Development",
              "Manager Effectiveness",
              "Team Accountability",
              "Execution Systems",
            ].map((label, i) => (
              <div key={i} className="flex items-center gap-2.5 group cursor-default">
                <span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors duration-500" />
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-navy-deep/50 uppercase tracking-[0.16em] group-hover:text-navy-deep/70 transition-colors duration-500">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div ref={marqueeRef} className="mt-12 w-full border-y border-navy-deep/10 bg-navy-deep py-4 flex items-center relative z-10 overflow-hidden">
        <div
          aria-hidden="true"
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
