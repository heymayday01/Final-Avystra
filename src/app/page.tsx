"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import Header from "@/components/avystra/Header";
import Hero from "@/components/avystra/Hero";
import ScrollProgress from "@/components/avystra/ScrollProgress";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { motion, AnimatePresence } from "motion/react";
import { smoothScrollTo } from "@/lib/scroll";
import LoadingScreen from "@/components/avystra/LoadingScreen";
import { PageReadyProvider } from "@/lib/pageReady";

// Eager: only Header, Hero, ScrollProgress, LoadingScreen (above the fold)
// Everything below the fold is lazy-loaded for faster initial paint.
const FounderFrictionSimulator = lazy(() => import("@/components/avystra/FounderFrictionSimulator"));
const Flowchart = lazy(() => import("@/components/avystra/Flowchart"));
const FourPillars = lazy(() => import("@/components/avystra/FourPillars"));
const StatsFounder = lazy(() => import("@/components/avystra/StatsFounder"));
const ProgramsSection = lazy(() => import("@/components/avystra/ProgramsSection"));
const TestimonialsSection = lazy(() => import("@/components/avystra/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/avystra/FAQSection"));
const OGIDiagnostic = lazy(() => import("@/components/avystra/OGIDiagnostic"));
const Footer = lazy(() => import("@/components/avystra/Footer"));

/**
 * Premium WhatsApp glyph — uses the official WhatsApp logo path but rendered
 * in the site's navy/gold palette instead of a garish green circle.
 * This keeps brand recognizability while matching the luxury aesthetic.
 */
const WhatsAppGlyph = ({ size = 22 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  // pageReady flips AFTER the loading screen fades (800ms load + 500ms fade).
  // All reveal observers + hero CSS animations wait for this — so animations
  // play AFTER the user sees the page, not behind the loading screen.
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    // Disable browser scroll restoration — on reload the browser remembers
    // the scroll position, but with lazy-loaded components + the loading
    // screen, the page height changes after load and the restored position
    // lands in the wrong place. Force scroll to top on every page load.
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Force scroll to top IMMEDIATELY (before any paint) + after Lenis initializes
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Also reset Lenis scroll position if it exists (desktop smooth scroll)
    const lenisInstance = (window as unknown as { lenis?: { scrollTo: (target: number, opts?: { immediate?: boolean }) => void } }).lenis;
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
    }

    // Hide loading screen at 800ms, then mark page ready at 1300ms
    // (after the 500ms fade transition completes).
    const loadTimer = setTimeout(() => setIsLoading(false), 800);
    const readyTimer = setTimeout(() => {
      setPageReady(true);
      // Add .page-ready class to <html> so Hero CSS animations can start
      document.documentElement.classList.add("page-ready");
      // Double-check scroll is at top (Lenis may have moved it)
      window.scrollTo(0, 0);
    }, 1300);
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(readyTimer);
    };
  }, []);

  const leadCount = 0;

  // Set up smooth scrolling
  useSmoothScroll();

  const handleScrollToConsult = () => {
    smoothScrollTo("consult");
  };

  return (
    <PageReadyProvider value={pageReady}>
    <div className="relative min-h-[100dvh] text-navy-deep selection:bg-gold/20 selection:text-gold font-sans antialiased flex flex-col overflow-x-hidden">
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>

      {/* Page content is always mounted (behind the loading screen).
          This prevents the ghost scrollbar that appeared when content
          was conditionally rendered after loading — the layout would
          shift from 0px to full page height, briefly showing a scrollbar. */}
      <div
        className={isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}
        style={{ transition: "opacity 0.5s ease" }}
      >
          {/* ═══ LIVELY AMBIENT BACKGROUND — ENHANCED + GPU-SAFE ═══
              4 drifting orbs with GPU-only animations (transform/opacity).
              Each orb is on its own compositor layer (will-change: transform)
              so animations never trigger main-thread repaint. Radial gradients
              are pre-rendered to the layer once, then only transform changes
              per frame — ~60fps with zero scroll jank.
              Sizes capped at 40vw (down from 60vw) to reduce fill area. */}
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {/* Warm ivory base wash */}
            <div className="absolute inset-0 bg-cream-bg" />

            {/* Gold orb — top left, strong, slow drift */}
            <div
              className="absolute -top-[10%] -left-[8%] w-[40vw] h-[40vw] rounded-full opacity-70 animate-glow-blob"
              style={{
                background:
                  "radial-gradient(circle, rgba(184,146,78,0.40) 0%, transparent 65%)",
                willChange: "transform",
              }}
            />
            {/* Navy orb — bottom right, strong, slow drift (reverse) */}
            <div
              className="absolute top-[55%] -right-[10%] w-[38vw] h-[38vw] rounded-full opacity-60 animate-glow-blob-reverse"
              style={{
                background:
                  "radial-gradient(circle, rgba(11,27,46,0.22) 0%, transparent 65%)",
                willChange: "transform",
                animationDelay: "2s",
              }}
            />
            {/* Central warm gold haze — gentle pulse */}
            <div
              className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[45vw] h-[30vw] rounded-full opacity-60 animate-pulse-slow"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(212,178,106,0.22) 0%, transparent 70%)",
                willChange: "transform, opacity",
              }}
            />
            {/* Accent gold orb — mid-right, small, vivid */}
            <div
              className="absolute top-[45%] right-[8%] w-[22vw] h-[22vw] rounded-full opacity-50 animate-glow-blob"
              style={{
                background:
                  "radial-gradient(circle, rgba(184,146,78,0.30) 0%, transparent 60%)",
                willChange: "transform",
                animationDelay: "4s",
              }}
            />
          </div>

          {/* Top Banner — slim promo bar, visible on ALL viewports.
              On mobile the text is shortened to fit one line without wrapping. */}
          <div
            onClick={handleScrollToConsult}
            className="relative z-50 bg-navy-deep hover:bg-navy-soft border-b border-gold/20 text-center py-1.5 px-3 sm:px-4 cursor-pointer transition-colors duration-300"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-2.5 flex-nowrap">
              <span className="inline-flex items-center gap-1 bg-gold text-navy-deep text-[9px] sm:text-[10.5px] font-mono font-black px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                Take Free
              </span>
              {/* Full text on tablet+ */}
              <span className="hidden sm:inline text-slate-100 font-sans text-[12px] sm:text-[13px] font-medium tracking-wide">
                Check Your Company&apos;s OGI Score for{" "}
                <span className="font-bold underline text-gold">FREE</span> —
                Organizational Growth Index
              </span>
              {/* Compact text on mobile — short enough to fit one line */}
              <span className="sm:hidden text-slate-100 font-sans text-[10.5px] font-medium tracking-wide whitespace-nowrap">
                Check Your OGI Score for{" "}
                <span className="font-bold underline text-gold">FREE</span>
              </span>
            </div>
          </div>

          {/* Premium custom interactions & indicators */}
          <ScrollProgress />

          {/* Premium Sticky Navigation Bar */}
          <Header />

          {/* Hero Block Container */}
          <main id="main" className="relative z-10 pb-4 flex-1">
            {/* Intro Hero with gold back-glowing radial gradients */}
            <Hero />

            {/* Redesigned Founder Dependency Section */}
            <Suspense fallback={<div className="min-h-[60vh]" />}>
              <FounderFrictionSimulator />
            </Suspense>

            {/* Interactive systems flowchart timeline */}
            <Suspense fallback={<div className="min-h-[40vh]" />}>
              <Flowchart />
            </Suspense>

            {/* Four Pillars alignment methodology */}
            <Suspense fallback={<div className="min-h-[50vh]" />}>
              <FourPillars />
            </Suspense>

            {/* Operational Diagnostics statistics, Cumulative Penalty & Founder's Profile Grid */}
            <Suspense fallback={<div className="min-h-[60vh]" />}>
              <StatsFounder />
            </Suspense>

            {/* Bespoke operational capability training programs */}
            <Suspense fallback={<div className="min-h-[50vh]" />}>
              <ProgramsSection />
            </Suspense>

            {/* Client Success Stories */}
            <Suspense fallback={<div className="min-h-[40vh]" />}>
              <TestimonialsSection />
            </Suspense>

            {/* Frequently Asked Questions */}
            <Suspense fallback={<div className="min-h-[30vh]" />}>
              <FAQSection />
            </Suspense>

            {/* OGI Growth Index Diagnostic assessment portal */}
            <Suspense
              fallback={
                <div className="min-h-[50vh] w-full flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
                </div>
              }
            >
              <OGIDiagnostic />
            </Suspense>
          </main>

          {/* Redesigned High-End Aesthetic Footer */}
          <Suspense
            fallback={<div className="h-[200px] w-full bg-navy-deep" />}
          >
            <Footer leadCount={leadCount} />
          </Suspense>

          {/* ═══ PREMIUM FLOATING ACTION STACK ═══
              Two floating buttons stacked vertically on the right edge:
              1. "Check Your OGI Score" — gold pill button, scrolls to #consult
              2. WhatsApp circle button — navy with gold glyph
              Positioned so they never overlap each other or page content. */}

          {/* OGI Score CTA — gold pill, sits above the WhatsApp button */}
          <motion.button
            onClick={() => smoothScrollTo("consult")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-4 sm:right-6 bottom-20 sm:bottom-24 z-[9998] inline-flex items-center gap-2 bg-gold text-navy-deep font-display font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.14em] px-4 sm:px-5 py-3 sm:py-3.5 rounded-full cursor-pointer float-btn-glow border border-gold/40 group hover:bg-gold-light transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap"
            aria-label="Check your OGI Score"
          >
            {/* Zap icon for energy/urgency */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="currentColor"
              className="shrink-0 group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="hidden xs:inline sm:inline">Check OGI Score</span>
            <span className="xs:hidden sm:hidden">OGI Score</span>
          </motion.button>

          {/* WhatsApp circle button — below the OGI button */}
          <motion.a
            href={`https://wa.me/918596059607?text=${encodeURIComponent("Hi AVYSTRA, I visited your website and would like to know more. Can we connect?")}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-[9999] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-navy-deep text-gold flex items-center justify-center cursor-pointer float-btn-glow border border-gold/25 group"
            aria-label="Consult now on WhatsApp"
          >
            {/* Subtle gold ring glow on hover */}
            <span className="absolute inset-0 rounded-full bg-gold/0 group-hover:bg-gold/10 transition-colors duration-300" />
            <WhatsAppGlyph size={22} />
            {/* Pulsing presence indicator */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-gold border-2 border-navy-deep" />
            </span>
          </motion.a>
      </div>
    </div>
    </PageReadyProvider>
  );
}
