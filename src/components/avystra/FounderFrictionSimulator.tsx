"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useGsapReveal } from "@/lib/useGsapReveal";
import { useGsapCards } from "@/lib/useGsapCards";
import {
  Compass,
  Briefcase,
  Users,
  Target,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

// ═══ Shared Founder Images — crossfade between frustrated (bottleneck)
// and confident (AVYSTRA system) states. Defined at module scope so the
// same JSX is reused by both the desktop center node and the mobile
// center node without re-creating the component each render. ═══
function FounderImages({ isResolved }: { isResolved: boolean }) {
  return (
    <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-navy-deep">
      {/* Frustrated state */}
      <img
        src="/founder-frustrated.webp"
        alt="Founder — frustrated, bottlenecked"
        referrerPolicy="no-referrer"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out-expo"
        style={{
          opacity: isResolved ? 0 : 1,
          objectPosition: "center 25%",
        }}
      />
      {/* Red tint overlay for frustrated state */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 rounded-full"
        style={{
          opacity: isResolved ? 0 : 1,
          background: "radial-gradient(circle, transparent 40%, rgba(239,68,68,0.22) 100%)",
        }}
      />
      {/* Confident state */}
      <img
        src="/founder-confident.webp"
        alt="Founder — confident, system in place"
        referrerPolicy="no-referrer"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out-expo"
        style={{
          opacity: isResolved ? 1 : 0,
          objectPosition: "center center",
        }}
      />
      {/* Green tint overlay for confident state */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 rounded-full"
        style={{
          opacity: isResolved ? 1 : 0,
          background: "radial-gradient(circle, transparent 40%, rgba(16,185,129,0.18) 100%)",
        }}
      />
    </div>
  );
}

export default function FounderFrictionSimulator() {
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  // ── GSAP ScrollTrigger reveals ──
  const subtextRef = useGsapReveal<HTMLParagraphElement>("fade", { duration: 0.6 });
  const toggleRef = useGsapReveal<HTMLDivElement>("fade", { delay: 0.15, duration: 0.6 });
  // Desktop outcome cards are absolutely positioned (corners) — use
  // cardSelector to target only the cards (skip SVG + center node).
  const desktopCardsRef = useGsapCards<HTMLDivElement>({ cardSelector: ".card-premium-dark" });
  const desktopCenterNodeRef = useGsapReveal<HTMLDivElement>("fade", { delay: 0.2, duration: 0.8 });
  const mobileCenterNodeRef = useGsapReveal<HTMLDivElement>("fade", { duration: 0.6 });
  const mobileCardsRef = useGsapCards<HTMLDivElement>();
  const ctaRef = useGsapReveal<HTMLDivElement>("fade", { delay: 0.3, duration: 0.6 });

  // Pause SVG animateMotion + CSS animations when section is off-screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleBookCall = () => {
    // Redirect to WhatsApp with a pre-filled message.
    const message = "Hi AVYSTRA, I visited your website and would like to understand how you can help my organization. Can we connect?";
    const whatsappUrl = `https://wa.me/918596059607?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  // ── Outcome cards — 4 strategic pillars, red when bottlenecked, green when AVYSTRA-aligned ──
  const outcomes = [
    {
      id: "leadership",
      number: "01",
      name: "LEADERSHIP",
      icon: Compass,
      issues: ["Direction unclear to teams", "Every decision escalates upward"],
      solution:
        "Clear direction. Teams know what to do and why.",
      desktopStyle: { left: "0%", top: "0%" },
    },
    {
      id: "managers",
      number: "02",
      name: "MANAGERS",
      icon: Briefcase,
      issues: [
        "Feedback doesn't lead to change",
        "Difficult conversations avoided",
      ],
      solution:
        "Decisions made at the right level. No more bottlenecks.",
      desktopStyle: { right: "0%", top: "0%" },
    },
    {
      id: "teams",
      number: "03",
      name: "TEAMS",
      icon: Users,
      issues: ["No real ownership of outcomes", "Commitments missed repeatedly"],
      solution:
        "Ownership without supervision. Commitments followed through.",
      desktopStyle: { left: "0%", bottom: "0%" },
    },
    {
      id: "execution",
      number: "04",
      name: "EXECUTION",
      icon: Target,
      issues: [
        "Plans lose momentum by mid-year",
        "No measurement or follow-through",
      ],
      solution:
        "Plans that actually get implemented. Results that are measured.",
      desktopStyle: { right: "0%", bottom: "0%" },
    },
  ];

  // Active accent color: red when bottlenecked, green when AVYSTRA system
  const accent = isResolved ? "var(--color-success)" : "var(--color-danger)";
  const accentSoft = isResolved
    ? "rgba(16,185,129,0.35)"
    : "rgba(239,68,68,0.35)";
  const accentFaint = isResolved
    ? "rgba(16,185,129,0.5)"
    : "rgba(239,68,68,0.5)";
  const pulseColor = isResolved ? "var(--color-success)" : "var(--color-danger)";

  return (
    <section
      ref={sectionRef}
      id="bottlenecks"
      className="relative w-full overflow-hidden select-none scroll-mt-20"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, var(--color-navy-deep) 0%, color-mix(in srgb, var(--color-navy-deep) 55%, black) 50%, color-mix(in srgb, var(--color-navy-deep) 35%, black) 100%)",
      }}
    >
      {/* Architectural grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-gold) 1px, transparent 1px), linear-gradient(to bottom, var(--color-gold) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient accent glow — top center, color matches active state */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none transition-colors duration-500"
        style={{
          background: `radial-gradient(ellipse, ${accentSoft} 0%, transparent 70%)`,
          opacity: 0.6,
        }}
      />

      <div className="relative max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 z-10 py-16 sm:py-20 lg:py-24">
        {/* Visually-hidden section heading for screen-reader navigation */}
        <h2 className="sr-only">Founder Dependency Diagnostic</h2>

        {/* ─── HEADER BLOCK ───
            "Interactive Structural Diagnostic" badge removed per spec.
            This section now leads directly with subtext + toggle. */}
        <div className="flex flex-col items-center text-center mb-14 sm:mb-16">
          {/* Subtext */}
          <p
            ref={subtextRef}
            className="text-white/55 font-sans text-sm sm:text-base max-w-[520px] leading-relaxed"
            style={{ letterSpacing: "0.02em" }}
          >
            Toggle between states to see exactly what AVYSTRA engineers.
          </p>
        </div>

        {/* ─── PREMIUM TOGGLE — red/green active pill ─── */}
        <div
          ref={toggleRef}
          className="relative mx-auto mb-14 sm:mb-16 flex items-center h-12 w-full max-w-[380px] rounded-full p-1 backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          {/* Sliding active pill — color matches active state. This is a
              STATE-DRIVEN transition (toggle), not a scroll reveal, so it
              stays as motion. */}
          <motion.div
            className="absolute top-1 bottom-1 left-1 rounded-full"
            animate={{ x: isResolved ? "calc(100% + 0px)" : "0px" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            style={{
              width: "calc(50% - 4px)",
              background: `linear-gradient(135deg, ${accent} 0%, ${isResolved ? "var(--color-success)" : "var(--color-danger)"} 100%)`,
              boxShadow: `0 4px 20px ${accentSoft}, 0 0 0 1px ${accentFaint}`,
            }}
          />
          <button
            onClick={() => setIsResolved(false)}
            aria-label="Show bottlenecked state"
            className={`toggle-pill-btn relative z-10 w-1/2 text-center text-[12px] font-mono tracking-[0.14em] font-bold h-full transition-colors duration-500 ease-out-expo focus-ring ${
              !isResolved
                ? "text-white"
                : "text-white/60 hover:text-white/75"
            }`}
          >
            BOTTLENECKED STATE
          </button>
          <button
            onClick={() => setIsResolved(true)}
            aria-label="Show AVYSTRA system state"
            className={`toggle-pill-btn relative z-10 w-1/2 text-center text-[12px] font-mono tracking-[0.14em] font-bold h-full transition-colors duration-500 ease-out-expo focus-ring ${
              isResolved
                ? "text-white"
                : "text-white/60 hover:text-white/75"
            }`}
          >
            AVYSTRA SYSTEM
          </button>
        </div>

        {/* ═══ DIAGRAM — DESKTOP & TABLET (≥768px) ═══ */}
        <div
          ref={desktopCardsRef}
          className="relative w-full max-w-[1000px] h-[480px] md:h-[520px] lg:h-[560px] mx-auto hidden md:block"
        >
          {/* SVG Connector Lines — color matches active state */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 800 560"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              id="path-tl"
              d="M 400 280 L 160 80"
              fill="none"
              stroke={accentSoft}
              strokeWidth="1"
            />
            <path
              id="path-tr"
              d="M 400 280 L 640 80"
              fill="none"
              stroke={accentSoft}
              strokeWidth="1"
            />
            <path
              id="path-bl"
              d="M 400 280 L 160 480"
              fill="none"
              stroke={accentSoft}
              strokeWidth="1"
            />
            <path
              id="path-br"
              d="M 400 280 L 640 480"
              fill="none"
              stroke={accentSoft}
              strokeWidth="1"
            />

            {/* Animated pulse dots — color matches active state, only render in view */}
            {inView && (
              <>
                <circle r="3.5" fill={pulseColor}>
                  <animateMotion dur="3s" repeatCount="indefinite" begin="0s">
                    <mpath href="#path-tl" />
                  </animateMotion>
                </circle>
                <circle r="3.5" fill={pulseColor}>
                  <animateMotion dur="3s" repeatCount="indefinite" begin="0.75s">
                    <mpath href="#path-tr" />
                  </animateMotion>
                </circle>
                <circle r="3.5" fill={pulseColor}>
                  <animateMotion dur="3s" repeatCount="indefinite" begin="1.5s">
                    <mpath href="#path-bl" />
                  </animateMotion>
                </circle>
                <circle r="3.5" fill={pulseColor}>
                  <animateMotion dur="3s" repeatCount="indefinite" begin="2.25s">
                    <mpath href="#path-br" />
                  </animateMotion>
                </circle>
              </>
            )}
          </svg>

          {/* Outcome cards — glass panels at corners, accent border matches state */}
          {outcomes.map((outcome) => {
            const Icon = outcome.icon;
            return (
              <div
                key={outcome.id}
                className="card-premium-dark absolute w-[200px] md:w-[220px] lg:w-[240px] rounded-2xl p-5 sm:p-6 z-10 overflow-hidden"
                style={{
                  ...outcome.desktopStyle,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderLeft: `2px solid ${accent}`,
                }}
              >
                {/* Header: number + icon + label */}
                <div className="flex items-center gap-2.5 mb-3">
                  <span
                    className="text-[10.5px] font-mono font-bold tracking-[0.15em] transition-colors duration-500"
                    style={{ color: accent }}
                  >
                    {outcome.number}
                  </span>
                  <Icon
                    className="w-[18px] h-[18px] shrink-0 transition-colors duration-500"
                    strokeWidth={1.5}
                    style={{ color: accent }}
                  />
                  <span
                    className="text-[12.5px] font-mono font-bold tracking-[0.15em] uppercase transition-colors duration-500"
                    style={{ color: accent }}
                  >
                    {outcome.name}
                  </span>
                </div>

                {/* Accent divider */}
                <div
                  className="h-px mb-3 transition-colors duration-500"
                  style={{
                    background: `linear-gradient(to right, ${accentSoft}, transparent)`,
                  }}
                />

                {/* Content — switches based on toggle state */}
                <div className="relative min-h-[110px]">
                  {/* Bottlenecked state */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500 ease-out-expo space-y-2"
                    style={{
                      opacity: isResolved ? 0 : 1,
                      pointerEvents: isResolved ? "none" : "auto",
                    }}
                  >
                    {outcome.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-left"
                      >
                        <span
                          className="text-[11.5px] font-bold shrink-0 mt-1 transition-colors duration-500"
                          style={{ color: "color-mix(in srgb, var(--color-danger) 60%, transparent)" }}
                        >
                          ◆
                        </span>
                        <span className="text-white/75 font-sans text-[13px] leading-relaxed font-normal">
                          {issue}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* AVYSTRA system state */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500 ease-out-expo"
                    style={{
                      opacity: isResolved ? 1 : 0,
                      pointerEvents: isResolved ? "auto" : "none",
                    }}
                  >
                    <div className="flex items-start gap-2 text-left">
                      <ShieldCheck
                        className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors duration-500"
                        strokeWidth={2}
                        style={{ color: "var(--color-success)" }}
                      />
                      <span className="text-white/90 font-sans text-[13px] leading-relaxed font-medium">
                        {outcome.solution}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ─── CENTER NODE — founder portrait crossfade, accent ring, label ─── */}
          <div ref={desktopCenterNodeRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <div
              className="relative w-[150px] h-[150px] rounded-full overflow-hidden flex flex-col items-center justify-center text-center transition-all duration-700 ease-out-expo"
              style={{
                border: `1px solid ${accentFaint}`,
                boxShadow: `0 0 0 6px ${accentSoft}19, 0 0 48px ${accentSoft}, inset 0 0 20px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Founder images — crossfade between frustrated/confident states */}
              <FounderImages isResolved={isResolved} />

              {/* Pulsing outer ring */}
              <span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: `1px solid ${accentFaint}`,
                  animation: "centerPulse 2s ease-out infinite",
                }}
              />
            </div>

            {/* Center node label — FOUNDER (bottlenecked) / AVYSTRA SYSTEM (resolved) */}
            <div className="mt-5 text-center">
              <div
                className="text-[13px] font-mono font-bold tracking-[0.18em] uppercase transition-colors duration-500"
                style={{ color: accent }}
              >
                {isResolved ? "AVYSTRA SYSTEM" : "FOUNDER"}
              </div>
              <div className="text-[11px] font-sans text-white/50 mt-1 transition-colors duration-500">
                {isResolved ? "The system that holds" : "Single point of failure"}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ MOBILE STACKED VIEW (<768px) ═══ */}
        <div className="md:hidden flex flex-col items-center">
          {/* Center node — wrapped for scroll reveal (label BELOW circle) */}
          <div ref={mobileCenterNodeRef} className="flex flex-col items-center">
            {/* Center node circle */}
            <div
              className="relative w-[130px] h-[130px] rounded-full overflow-hidden transition-all duration-700 ease-out-expo"
              style={{
                border: `1px solid ${accentFaint}`,
                boxShadow: `0 0 0 6px ${accentSoft}19, 0 0 44px ${accentSoft}, inset 0 0 20px rgba(0,0,0,0.4)`,
              }}
            >
              <FounderImages isResolved={isResolved} />
              <span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: `1px solid ${accentFaint}`,
                  animation: "centerPulse 2s ease-out infinite",
                }}
              />
            </div>

            {/* Center node label — FOUNDER / AVYSTRA SYSTEM */}
            <div className="mt-5 mb-12 text-center">
              <div
                className="text-[12px] font-mono font-bold tracking-[0.18em] uppercase transition-colors duration-500"
                style={{ color: accent }}
              >
                {isResolved ? "AVYSTRA SYSTEM" : "FOUNDER"}
              </div>
              <div className="text-[10.5px] font-sans text-white/50 mt-1 transition-colors duration-500">
                {isResolved ? "The system that holds" : "Single point of failure"}
              </div>
            </div>
          </div>

          {/* Stacked outcome cards */}
          <div
            ref={mobileCardsRef}
            className="w-full grid grid-cols-1 gap-4"
          >
            {outcomes.map((outcome) => {
              const Icon = outcome.icon;
              return (
                <div
                  key={outcome.id}
                  className="card-premium-dark rounded-2xl p-5 sm:p-6"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderLeft: `2px solid ${accent}`,
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <span
                      className="text-[10.5px] font-mono font-bold tracking-[0.15em] transition-colors duration-500"
                      style={{ color: accent }}
                    >
                      {outcome.number}
                    </span>
                    <Icon
                      className="w-[18px] h-[18px] shrink-0 transition-colors duration-500"
                      strokeWidth={1.5}
                      style={{ color: accent }}
                    />
                    <span
                      className="text-[12.5px] font-mono font-bold tracking-[0.15em] uppercase transition-colors duration-500"
                      style={{ color: accent }}
                    >
                      {outcome.name}
                    </span>
                  </div>

                  <div
                    className="h-px mb-3 transition-colors duration-500"
                    style={{
                      background: `linear-gradient(to right, ${accentSoft}, transparent)`,
                    }}
                  />

                  <div className="relative min-h-[80px]">
                    <div
                      className="transition-opacity duration-500 ease-out-expo space-y-2"
                      style={{ display: isResolved ? "none" : "block" }}
                    >
                      {outcome.issues.map((issue, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-left"
                        >
                          <span
                            className="text-[11.5px] font-bold shrink-0 mt-1"
                            style={{ color: "color-mix(in srgb, var(--color-danger) 60%, transparent)" }}
                          >
                            ◆
                          </span>
                          <span className="text-white/75 font-sans text-[13px] leading-relaxed font-normal">
                            {issue}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      className="transition-opacity duration-500 ease-out-expo"
                      style={{ display: isResolved ? "block" : "none" }}
                    >
                      <div className="flex items-start gap-2 text-left">
                        <ShieldCheck
                          className="w-3.5 h-3.5 shrink-0 mt-0.5"
                          strokeWidth={2}
                          style={{ color: "var(--color-success)" }}
                        />
                        <span className="text-white/90 font-sans text-[13px] leading-relaxed font-medium">
                          {outcome.solution}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── BOTTOM CTA STRIP ─── */}
        <div
          ref={ctaRef}
          className="mt-14 sm:mt-16 w-full max-w-[1000px] mx-auto rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(var(--gold-rgb), 0.18)",
          }}
        >
          <p className="font-serif italic text-white text-lg sm:text-xl" style={{ lineHeight: 1.4 }}>
            Recognise your business in the left state?
          </p>
          <button
            onClick={handleBookCall}
            aria-label="Book an assessment call"
            className="btn-premium group inline-flex items-center gap-2 bg-gold text-navy-deep font-sans font-bold text-xs uppercase tracking-[0.12em] px-7 py-3.5 rounded-full hover:bg-gold-light transition-colors duration-500 ease-out-expo cursor-pointer w-full sm:w-auto shrink-0 focus-ring"
          >
            Book an assessment call
            <ArrowRight
              className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-500 ease-out-expo"
              strokeWidth={2.5}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
