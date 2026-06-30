"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Compass,
  Briefcase,
  Users,
  Target,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { smoothScrollTo } from "@/lib/scroll";

// ═══ Shared Founder Images — crossfade between frustrated (bottleneck)
// and confident (AVYSTRA system) states. Defined at module scope so the
// same JSX is reused by both the desktop center node and the mobile
// center node without re-creating the component each render. ═══
function FounderImages({ isResolved }: { isResolved: boolean }) {
  return (
    <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-navy-deep">
      {/* Frustrated state */}
      <img
        src="/founder-frustrated.png"
        alt="Founder — frustrated, bottlenecked"
        referrerPolicy="no-referrer"
        loading="lazy"
        // object-cover fills the entire circle (no empty space). The image
        // is portrait, so the top/bottom overflow and get clipped by the
        // circle's overflow-hidden. object-position "center 25%" biases
        // toward the top so the face + hair stay visible while the lower
        // torso crops. This gives a big, filled, focused portrait.
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{
          opacity: isResolved ? 0 : 1,
          objectPosition: "center 25%",
        }}
      />
      {/* Red tint overlay for frustrated state */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-full"
        style={{
          opacity: isResolved ? 0 : 1,
          background: "radial-gradient(circle, transparent 40%, rgba(239,68,68,0.25) 100%)",
        }}
      />
      {/* Confident state */}
      <img
        src="/founder-confident.png"
        alt="Founder — confident, system in place"
        referrerPolicy="no-referrer"
        loading="lazy"
        // This is a landscape headshot (292×215, aspect 1.358). With
        // object-cover in a square circle, the image fills the circle's
        // HEIGHT exactly (138px) and the left/right sides crop slightly.
        // object-position "center center" keeps the face centered.
        // No transform scale — the image fills the circle naturally with
        // the full height (including hair) visible.
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{
          opacity: isResolved ? 1 : 0,
          objectPosition: "center center",
        }}
      />
      {/* Green tint overlay for confident state */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-full"
        style={{
          opacity: isResolved ? 1 : 0,
          background: "radial-gradient(circle, transparent 40%, rgba(16,185,129,0.2) 100%)",
        }}
      />
    </div>
  );
}

export default function FounderFrictionSimulator() {
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

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
    // Redirect to WhatsApp with a pre-filled message tailored to the
    // "book an assessment call" context. The message references the
    // bottlenecked-vs-AVYSTRA-system comparison the user just viewed.
    const message = isResolved
      ? "Hi AVYSTRA, I just went through the Founder Dependency Simulator on your website and I can see how an AVYSTRA-aligned system would work for my organization. I'd like to book an assessment call to discuss how we can build this kind of structure. When are you available?"
      : "Hi AVYSTRA, I just went through the Founder Dependency Simulator on your website and I recognise my business in the bottlenecked state — everything still depends on me. I'd like to book an assessment call to understand how AVYSTRA can help. When are you available?";
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
  const accent = isResolved ? "#10B981" : "#EF4444";
  const accentSoft = isResolved
    ? "rgba(16,185,129,0.35)"
    : "rgba(239,68,68,0.35)";
  const accentFaint = isResolved
    ? "rgba(16,185,129,0.5)"
    : "rgba(239,68,68,0.5)";
  const pulseColor = isResolved ? "#10B981" : "#EF4444";

  return (
    <section
      ref={sectionRef}
      id="bottlenecks"
      className="relative w-full overflow-hidden select-none scroll-mt-20"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #0D1220 0%, #060810 50%, #04060C 100%)",
      }}
    >
      {/* Architectural grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #C9A84C 1px, transparent 1px), linear-gradient(to bottom, #C9A84C 1px, transparent 1px)",
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

      <div className="relative max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 z-10 py-[60px] sm:py-[80px] lg:py-[100px]">
        {/* ─── HEADER BLOCK ───
            "Interactive Structural Diagnostic" badge removed per spec.
            This section now leads directly with subtext + toggle. */}
        <div className="flex flex-col items-center text-center mb-12">
          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/50 font-sans text-sm sm:text-base max-w-[520px] leading-relaxed"
            style={{ letterSpacing: "0.02em" }}
          >
            Toggle between states to see exactly what AVYSTRA engineers.
          </motion.p>
        </div>

        {/* ─── PREMIUM TOGGLE — red/green active pill ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mb-12 flex items-center h-12 w-full max-w-[380px] rounded-full p-1 backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {/* Sliding active pill — color matches active state */}
          <motion.div
            className="absolute top-1 bottom-1 left-1 rounded-full"
            animate={{ x: isResolved ? "calc(100% + 0px)" : "0px" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            style={{
              width: "calc(50% - 4px)",
              background: `linear-gradient(135deg, ${accent} 0%, ${isResolved ? "#34D399" : "#F87171"} 100%)`,
              boxShadow: `0 4px 16px ${accentSoft}, 0 0 0 1px ${accentFaint}`,
            }}
          />
          <button
            onClick={() => setIsResolved(false)}
            aria-label="Show bottlenecked state"
            className={`toggle-pill-btn relative z-10 w-1/2 text-center text-[12px] font-mono tracking-[0.14em] font-bold h-full transition-colors duration-300 ${
              !isResolved
                ? "text-white"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            BOTTLENECKED STATE
          </button>
          <button
            onClick={() => setIsResolved(true)}
            aria-label="Show AVYSTRA system state"
            className={`toggle-pill-btn relative z-10 w-1/2 text-center text-[12px] font-mono tracking-[0.14em] font-bold h-full transition-colors duration-300 ${
              isResolved
                ? "text-white"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            AVYSTRA SYSTEM
          </button>
        </motion.div>

        {/* ═══ DIAGRAM — DESKTOP & TABLET (≥768px) ═══ */}
        <div className="relative w-full max-w-[1000px] h-[480px] md:h-[520px] lg:h-[560px] mx-auto hidden md:block">
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
          {outcomes.map((outcome, index) => {
            const Icon = outcome.icon;
            return (
              <motion.div
                key={outcome.id}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="friction-card absolute w-[200px] md:w-[220px] lg:w-[240px] rounded-2xl p-4 sm:p-5 z-10 transition-colors duration-500 overflow-hidden"
                style={{
                  ...outcome.desktopStyle,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderLeft: `2px solid ${accent}`,
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
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
                    className="absolute inset-0 transition-opacity duration-300 space-y-1.5"
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
                          style={{ color: "#EF444499" }}
                        >
                          ◆
                        </span>
                        <span className="text-white/70 font-sans text-[13px] leading-relaxed font-normal">
                          {issue}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* AVYSTRA system state */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      opacity: isResolved ? 1 : 0,
                      pointerEvents: isResolved ? "auto" : "none",
                    }}
                  >
                    <div className="flex items-start gap-2 text-left">
                      <ShieldCheck
                        className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors duration-500"
                        strokeWidth={2}
                        style={{ color: "#10B981" }}
                      />
                      <span className="text-white/90 font-sans text-[13px] leading-relaxed font-medium">
                        {outcome.solution}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* ─── CENTER NODE — founder portrait crossfade, accent ring, label ─── */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-[140px] h-[140px] rounded-full overflow-hidden flex flex-col items-center justify-center text-center transition-all duration-500"
              style={{
                border: `1px solid ${accentFaint}`,
                boxShadow: `0 0 0 6px ${accentSoft}19, 0 0 40px ${accentSoft}, inset 0 0 20px rgba(0,0,0,0.4)`,
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
            </motion.div>

            {/* Center node label — FOUNDER (bottlenecked) / AVYSTRA SYSTEM (resolved) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-center"
            >
              <div
                className="text-[13px] font-mono font-bold tracking-[0.18em] uppercase transition-colors duration-500"
                style={{ color: accent }}
              >
                {isResolved ? "AVYSTRA SYSTEM" : "FOUNDER"}
              </div>
              <div className="text-[11px] font-sans text-white/45 mt-1 transition-colors duration-500">
                {isResolved ? "The system that holds" : "Single point of failure"}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ═══ MOBILE STACKED VIEW (<768px) ═══ */}
        <div className="md:hidden flex flex-col items-center">
          {/* Center node — label BELOW circle to avoid clipping */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[120px] h-[120px] rounded-full overflow-hidden transition-all duration-500"
            style={{
              border: `1px solid ${accentFaint}`,
              boxShadow: `0 0 0 6px ${accentSoft}19, 0 0 40px ${accentSoft}, inset 0 0 20px rgba(0,0,0,0.4)`,
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
          </motion.div>

          {/* Center node label — FOUNDER / AVYSTRA SYSTEM */}
          <div className="mt-4 mb-10 text-center">
            <div
              className="text-[12px] font-mono font-bold tracking-[0.18em] uppercase transition-colors duration-500"
              style={{ color: accent }}
            >
              {isResolved ? "AVYSTRA SYSTEM" : "FOUNDER"}
            </div>
            <div className="text-[10.5px] font-sans text-white/45 mt-1 transition-colors duration-500">
              {isResolved ? "The system that holds" : "Single point of failure"}
            </div>
          </div>

          {/* Stacked outcome cards */}
          <div className="w-full grid grid-cols-1 gap-4">
            {outcomes.map((outcome, index) => {
              const Icon = outcome.icon;
              return (
                <motion.div
                  key={outcome.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-2xl p-5 transition-colors duration-500"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderLeft: `2px solid ${accent}`,
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
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
                      className="transition-opacity duration-300 space-y-1.5"
                      style={{ display: isResolved ? "none" : "block" }}
                    >
                      {outcome.issues.map((issue, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-left"
                        >
                          <span
                            className="text-[11.5px] font-bold shrink-0 mt-1"
                            style={{ color: "#EF444499" }}
                          >
                            ◆
                          </span>
                          <span className="text-white/70 font-sans text-[13px] leading-relaxed font-normal">
                            {issue}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      className="transition-opacity duration-300"
                      style={{ display: isResolved ? "block" : "none" }}
                    >
                      <div className="flex items-start gap-2 text-left">
                        <ShieldCheck
                          className="w-3.5 h-3.5 shrink-0 mt-0.5"
                          strokeWidth={2}
                          style={{ color: "#10B981" }}
                        />
                        <span className="text-white/90 font-sans text-[13px] leading-relaxed font-medium">
                          {outcome.solution}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── BOTTOM CTA STRIP ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 w-full max-w-[1000px] mx-auto rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <p className="font-serif italic text-white text-lg sm:text-xl">
            Recognise your business in the left state?
          </p>
          <button
            onClick={handleBookCall}
            aria-label="Book an assessment call"
            className="group inline-flex items-center gap-2 bg-gold text-[#0B1B2E] font-sans font-bold text-xs uppercase tracking-[0.12em] px-7 py-3.5 rounded-full hover:bg-gold-light transition-all duration-300 cursor-pointer w-full sm:w-auto shadow-lg hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)] hover:-translate-y-0.5 active:scale-95 shrink-0"
          >
            Book an assessment call
            <ArrowRight
              className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300"
              strokeWidth={2.5}
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
