"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { BookOpen, Calendar, Users, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TextReveal from "./TextReveal";

interface Program {
  id: string;
  category:
    | "TEAM EFFECTIVENESS"
    | "MANAGER EFFECTIVENESS"
    | "ORGANIZATIONAL PERFORMANCE"
    | "LEADERSHIP DEVELOPMENT";
  title: string;
  description: string;
  audience: string;
  duration: string;
}

// ProgramCard — shared between desktop grid and mobile carousel.
// Hoisted to module scope so it has a stable identity across renders
// and doesn't get re-created on every parent state change.
// NOTE: data-carousel-card is set by the carousel wrapper, not here,
// so the desktop grid cards don't interfere with scroll tracking.
function ProgramCard({ prog }: { prog: Program }) {
  return (
    <article
      className="program-card group relative bg-gradient-to-br from-white to-slate-50/80 border border-slate-100 rounded-3xl p-5 sm:p-8 lg:p-10 flex flex-col justify-between hover:shadow-[0_16px_32px_-16px_rgba(11,27,46,0.10)] hover:border-gold/25 transition-[box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] h-full overflow-hidden"
    >
      {/* Subtle Glow Reflection Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Active Light Line - Top */}
      <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10">
        {/* Category Pill Tag */}
        <div className="inline-flex px-2.5 sm:px-3 py-1 rounded-md border border-slate-200/50 bg-white/50 text-slate-500 text-[9px] sm:text-[11px] font-mono font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-4 sm:mb-6 group-hover:border-gold/30 group-hover:text-gold-hover transition-all duration-500">
          {prog.category}
        </div>

        {/* Program Title */}
        <h3 className="font-display font-bold text-base sm:text-xl text-navy-deep tracking-tight leading-snug mb-2 sm:mb-3 uppercase group-hover:text-gold transition-colors duration-500">
          {prog.title}
        </h3>

        {/* Program Description */}
        <p className="text-slate-600 text-[13px] sm:text-sm font-medium leading-relaxed mb-5 sm:mb-8 opacity-100 transition-opacity duration-700">
          {prog.description}
        </p>
      </div>

      {/* Info Block */}
      <div className="relative z-10 space-y-3 sm:space-y-5 pt-4 sm:pt-6 mt-auto">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-slate-100 via-slate-200/50 to-transparent" />

        <div className="flex flex-col gap-2 sm:gap-2.5">
          <div className="flex items-center gap-2.5 text-slate-400">
            <div className="p-1 sm:p-0 rounded-lg sm:rounded-none bg-gold/10 sm:bg-transparent">
              <Users className="w-3.5 h-3.5 text-gold/70 shrink-0" />
            </div>
            <span className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-wider">
              Audience:{" "}
              <strong className="text-navy-deep font-bold">
                {prog.audience}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400">
            <div className="p-1 sm:p-0 rounded-lg sm:rounded-none bg-gold/10 sm:bg-transparent">
              <Calendar className="w-3.5 h-3.5 text-gold/70 shrink-0" />
            </div>
            <span className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-wider">
              Duration:{" "}
              <strong className="text-navy-deep font-bold">
                {prog.duration}
              </strong>
            </span>
          </div>
        </div>

        {/* Action Link Row — 44px minimum touch target */}
        <a
          href={`https://wa.me/918596059607?text=${encodeURIComponent(
            `Hi AVYSTRA, I would like to enquire about the "${prog.title}" program.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full min-h-[44px] py-3 sm:py-3.5 px-4 rounded-xl bg-navy-deep text-gold hover:bg-gold hover:text-navy-deep transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer text-[10px] sm:text-[10.5px] font-mono font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] group/btn"
          aria-label={`Enquire about ${prog.title} program`}
        >
          <span>Enquire Now</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-gold group-hover/btn:text-navy-deep group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
        </a>
      </div>
    </article>
  );
}

export default function ProgramsSection() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Track viewport for mobile carousel behavior
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    // Debounce resize — fires up to once per 180ms during a drag-resize
    // instead of on every tick. Matches the createResizeHandler pattern
    // in src/hooks/useSmoothScroll.ts.
    let timer: ReturnType<typeof setTimeout> | null = null;
    const debouncedCheckMobile = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(checkMobile, 180);
    };
    window.addEventListener("resize", debouncedCheckMobile);
    return () => {
      window.removeEventListener("resize", debouncedCheckMobile);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const categories = [
    { key: "ALL", label: "All Catalog" },
    { key: "TEAM EFFECTIVENESS", label: "Team Effectiveness" },
    { key: "MANAGER EFFECTIVENESS", label: "Manager Effectiveness" },
    {
      key: "ORGANIZATIONAL PERFORMANCE",
      label: "Organizational Performance",
    },
    { key: "LEADERSHIP DEVELOPMENT", label: "Leadership" },
  ];

  const programs: Program[] = [
    {
      id: "prog-accountability",
      category: "TEAM EFFECTIVENESS",
      title: "Accountability & Ownership",
      description:
        "The foundation of everything. When nobody takes real ownership, everything else breaks down.",
      audience: "All employees",
      duration: "Half Day / Full Day",
    },
    {
      id: "prog-communication",
      category: "TEAM EFFECTIVENESS",
      title: "Communication Excellence",
      description:
        "Not generic skills. The specific patterns causing the most friction in your teams right now.",
      audience: "All employees",
      duration: "Half Day / Full Day",
    },
    {
      id: "prog-first-time",
      category: "MANAGER EFFECTIVENESS",
      title: "First-Time Manager Excellence",
      description:
        "Most companies promote their best performer — without preparing them to lead. This closes that gap.",
      audience: "New managers",
      duration: "Half Day / Full Day",
    },
    {
      id: "prog-feedback",
      category: "MANAGER EFFECTIVENESS",
      title: "Feedback & Difficult Conversations",
      description:
        "The conversations managers avoid are costing the organization more than they realize.",
      audience: "All managers",
      duration: "Half Day / Full Day",
    },
    {
      id: "prog-workplace",
      category: "ORGANIZATIONAL PERFORMANCE",
      title: "Workplace Effectiveness & Execution",
      description:
        "Busy but not productive. This builds the discipline that turns effort into actual results.",
      audience: "All employees",
      duration: "Half Day / Full Day",
    },
    {
      id: "prog-decision",
      category: "LEADERSHIP DEVELOPMENT",
      title: "Decision-Making Under Uncertainty",
      description:
        "Slow decisions cost more than wrong ones. This builds the confidence to decide and move.",
      audience: "Leaders & managers",
      duration: "Half Day / Full Day",
    },
  ];

  const filteredPrograms = useMemo(
    () =>
      activeTab === "ALL"
        ? programs
        : programs.filter((p) => p.category === activeTab),
    [activeTab]
  );

  // Keep a ref of the active index so the scroll handler doesn't need to
  // recreate on every index change (avoids stale closures + extra renders)
  const activeIndexRef = useRef(0);
  useEffect(() => {
    activeIndexRef.current = activeCarouselIndex;
  }, [activeCarouselIndex]);

  // Reset carousel index when tab changes — this is a legitimate sync of
  // state to an external input (activeTab), so setState here is correct.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveCarouselIndex(0);
    activeIndexRef.current = 0;
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [activeTab]);

  // Debounce timer ref — so we only commit the final active index after
  // scrolling settles (avoids flicker during smooth-scroll animations)
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track which card is centered in the carousel on mobile.
  // Reads activeIndexRef so the callback identity stays stable.
  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current || !isMobile) return;
    const container = carouselRef.current;
    const cards = container.querySelectorAll("[data-carousel-card]");
    if (!cards.length) return;

    const computeClosest = () => {
      const containerCenter =
        container.scrollLeft + container.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, idx) => {
        const cardEl = card as HTMLElement;
        const cardCenter = cardEl.offsetLeft + cardEl.offsetWidth / 2;
        const distance = Math.abs(containerCenter - cardCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
      });
      return closestIndex;
    };

    // Immediate update for responsive feel during drag
    const closestIndex = computeClosest();
    if (closestIndex !== activeIndexRef.current) {
      setActiveCarouselIndex(closestIndex);
    }

    // Debounced final commit — catches the settled position after smooth scroll
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      const finalIndex = computeClosest();
      if (finalIndex !== activeIndexRef.current) {
        activeIndexRef.current = finalIndex;
        setActiveCarouselIndex(finalIndex);
      }
    }, 120);
  }, [isMobile]);

  // Smooth-scroll a specific card into the center of the carousel
  const scrollToCard = useCallback((index: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const card = container.querySelector(
      `[data-carousel-card="${index}"]`
    ) as HTMLElement;
    if (card) {
      const scrollLeft =
        card.offsetLeft - container.clientWidth / 2 + card.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, []);

  // Keyboard navigation for carousel
  const handleCarouselKeydown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isMobile) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = Math.min(activeCarouselIndex + 1, filteredPrograms.length - 1);
        scrollToCard(next);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = Math.max(activeCarouselIndex - 1, 0);
        scrollToCard(prev);
      }
    },
    [isMobile, activeCarouselIndex, filteredPrograms.length, scrollToCard]
  );

  // ProgramCard — hoisted to module scope (see above) so it has a stable
  // identity across re-renders. No `index` prop needed.

  return (
    <section
      id="programs"
      className="relative py-6 bg-transparent border-none overflow-x-hidden md:py-10 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 select-none">
        {/* Section Heading */}
        <div
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 md:mb-8"
        >
          <div className="border border-gold/20 bg-gradient-to-br from-white to-slate-50 border border-slate-100 px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-3 shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11.5px] text-gold font-mono tracking-[0.18em] font-medium uppercase">
              Operational Portfolios
            </span>
          </div>
          <h2 className="font-display font-medium text-4xl sm:text-5xl md:text-6xl text-navy-deep tracking-tight leading-[1.2] mb-6 inline-flex flex-wrap justify-center gap-x-2">
            <TextReveal
              text="Where Most "
              delay={0.2}
              blur={false}
              wordClassName="inline-block"
            />
            <span className="font-serif italic font-light text-gold relative inline-block">
              <TextReveal
                text="Organizations Start"
                delay={0.4}
                blur={false}
                wordClassName="inline-block"
              />
              {/* Static underline — previously an animated width draw, which
                  violated the "no width animation" rule. Now always visible. */}
              <div className="absolute -bottom-2 left-0 h-[3px] bg-gold/40 w-full" />
            </span>
          </h2>
          <TextReveal
            text="Syllabi engineered strictly for execution — bypassing the usual motivation traps and generic trainer scripts."
            as="p"
            className="text-slate-500 font-sans text-base sm:text-lg font-light leading-relaxed max-w-2xl"
            delay={0.6}
            blur={false}
          />
        </div>

        {/* Categories Tab Navigation */}
        <div className="flex flex-nowrap overflow-x-auto scrollbar-none pb-4 lg:pb-0 lg:flex-wrap justify-start lg:justify-center gap-3 mb-6 select-none max-w-4xl mx-auto px-4 lg:px-0 lg:mx-auto" style={{ scrollPaddingRight: '2rem' }}>
          {categories.map((cat) => {
            const isActive = activeTab === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                className={`min-h-[44px] px-4 sm:px-6 py-3 rounded-2xl font-mono text-[10px] sm:text-[12.5px] font-black uppercase tracking-[0.14em] sm:tracking-[0.2em] border transition-all duration-500 cursor-pointer relative group shrink-0 ${
                  isActive
                    ? "bg-navy-deep text-gold border-navy-deep shadow-xl"
                    : "bg-gradient-to-br from-white to-slate-50 border border-slate-100 text-slate-500 hover:text-navy-deep hover:border-slate-300 shadow-sm"
                }`}
                aria-pressed={isActive}
              >
                <span className="relative z-10">{cat.label}</span>
                {isActive && (
                  <>
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent pointer-events-none"
                    />
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-4 right-4 h-[2px] bg-gold rounded-t-full shadow-[0_0_8px_rgba(184,146,78,0.5)]"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* ═══ PREMIUM RESPONSIVE CARD DISPLAY ═══
            Desktop (≥1024px): 3-column grid with equal heights
            Tablet (768–1023px): 2-column grid
            Mobile (<768px): Native swipeable carousel with scroll-snap */}

        {/* DESKTOP & TABLET GRID — hidden on mobile */}
        <div
          className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[400px] items-stretch"
          aria-label="Programs grid"
        >
          <AnimatePresence mode="popLayout">
            {filteredPrograms.map((prog, index) => (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                  delay: index * 0.05,
                }}
                className="h-full"
              >
                <ProgramCard prog={prog} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* MOBILE SWIPEABLE CAROUSEL — premium peek-through design */}
        <div className="md:hidden" aria-label="Programs carousel">
          <div className="relative">
            {/* Carousel track — peek-through with 78% card width */}
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              onKeyDown={handleCarouselKeydown}
              tabIndex={0}
              role="region"
              aria-roledescription="carousel"
              aria-label="Programs carousel — swipe or use arrow keys to navigate"
              className="program-carousel-track flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-pl-5 scroll-pr-5 px-5 pb-5 -mx-4 will-change-transform"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
              }}
            >
              {filteredPrograms.map((prog, index) => (
                <div
                  key={prog.id}
                  data-carousel-card={index}
                  data-active={index === activeCarouselIndex}
                  className={`program-carousel-card shrink-0 w-[80%] snap-center transition-all duration-500 ${
                    index === activeCarouselIndex
                      ? "opacity-100 scale-100"
                      : "opacity-60 scale-95"
                  }`}
                  aria-roledescription="slide"
                  aria-label={`Slide ${index + 1} of ${filteredPrograms.length}: ${prog.title}`}
                >
                  <ProgramCard prog={prog} />
                </div>
              ))}
            </div>

            {/* Right-edge gradient fade */}
            <div
              className={`absolute right-0 top-0 bottom-5 w-12 bg-gradient-to-l from-cream-bg via-cream-bg/80 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
                activeCarouselIndex === filteredPrograms.length - 1
                  ? "opacity-0"
                  : "opacity-100"
              }`}
              aria-hidden="true"
            />
            {/* Left-edge gradient fade */}
            <div
              className={`absolute left-0 top-0 bottom-5 w-8 bg-gradient-to-r from-cream-bg via-cream-bg/80 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
                activeCarouselIndex === 0 ? "opacity-0" : "opacity-100"
              }`}
              aria-hidden="true"
            />
          </div>

          {/* Premium indicator row — dots + counter */}
          <div className="flex items-center justify-between px-5 mt-4">
            {/* Dot indicators — compact, premium */}
            <div
              className="flex items-center gap-1.5"
              role="tablist"
              aria-label="Select program slide"
            >
              {filteredPrograms.map((prog, index) => {
                const isActive = index === activeCarouselIndex;
                return (
                  <button
                    key={prog.id}
                    onClick={() => scrollToCard(index)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 group/dot"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Go to program ${index + 1}: ${prog.title}`}
                  >
                    <span
                      className={`block rounded-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isActive
                          ? "w-5 h-1.5 bg-gold shadow-[0_0_6px_rgba(184,146,78,0.5)]"
                          : "w-1.5 h-1.5 bg-navy-deep/20 group-hover/dot:bg-navy-deep/40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Counter — premium monospace */}
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 flex items-center gap-1">
              <span className="text-navy-deep font-bold text-[11px]">
                {String(activeCarouselIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-slate-300">/</span>
              <span>{String(filteredPrograms.length).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Swipe hint — subtle, only on first card */}
          {activeCarouselIndex === 0 && filteredPrograms.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-1.5 mt-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400"
            >
              <span>Swipe to explore</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </motion.div>
          )}
        </div>

        {/* Bottom Banner */}
        <div
          className="mt-14 p-5 bg-navy-deep border border-slate-800 rounded-3xl text-center max-w-4xl mx-auto shadow-lg relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          <p className="text-slate-200 font-sans text-xs sm:text-[13px] font-medium leading-relaxed">
            Every program connects to{" "}
            <span className="text-white font-bold underline decoration-gold">
              real business outcomes
            </span>{" "}
            — because clarity, accountability, and execution drive performance.
          </p>
        </div>
      </div>
    </section>
  );
}
