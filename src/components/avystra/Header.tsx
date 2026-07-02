"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ScrollTrigger } from "@/lib/gsap";
import AvystraLogo from "./AvystraLogo";
import { smoothScrollTo, scrollToTop } from "@/lib/scroll";

interface NavItem {
  name: string;
  href: string;
  number: string;
  desc: string;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("bottlenecks");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const activeSectionRef = useRef("bottlenecks");

  useEffect(() => {
    // ── Header "scrolled" state — native scroll listener (works on all devices) ──
    // A single passive window scroll listener is cheaper and more reliable than
    // subscribing to Lenis (which may not be ready yet on mobile, requiring a
    // fallback anyway). Lenis on desktop writes to the native scroll position,
    // so this listener fires on both desktop + mobile.
    const handleScrollState = () => {
      const isScrolled = window.scrollY > 15;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    handleScrollState();
    window.addEventListener("scroll", handleScrollState, { passive: true });

    // ── Active-section tracking via ScrollTrigger (synced with Lenis on desktop) ──
    const sections = ["bottlenecks", "process", "programs", "team", "consult"];
    const triggers: ScrollTrigger[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive && activeSectionRef.current !== id) {
              activeSectionRef.current = id;
              setActiveSection(id);
            }
          },
        });
        triggers.push(trigger);
      }
    });

    // Refresh once triggers are created (catches late layout shifts)
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("scroll", handleScrollState);
      triggers.forEach((t) => t.kill());
    };
  }, []);

  const navItems: NavItem[] = useMemo(
    () => [
      {
        name: "The Problem",
        href: "#bottlenecks",
        number: "01",
        desc: "Structural points of friction",
      },
      {
        name: "What We Do",
        href: "#process",
        number: "02",
        desc: "Our procedural roadmap",
      },
      {
        name: "Programs",
        href: "#programs",
        number: "03",
        desc: "Bespoke system training",
      },
      {
        name: "About",
        href: "#about",
        number: "04",
        desc: "The founder's background",
      },
      {
        name: "Contact",
        href: "#contact-wa",
        number: "05",
        desc: "Tell us about your organization",
      },
    ],
    []
  );

  const handleScrollTo = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);

      // "Contact" opens WhatsApp directly — most direct contact method
      if (targetId === "contact-wa") {
        const message = "Hi AVYSTRA, I visited your website and would like to know more. Can we connect?";
        window.open(`https://wa.me/918596059607?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
        return;
      }

      setActiveSection(targetId);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          smoothScrollTo(targetId);
        });
      });
    },
    []
  );

  const headerTransition = useMemo(
    () =>
      shouldReduceMotion
        ? { duration: 0 }
        : {
            opacity: {
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              delay: 0.1,
            },
            y: {
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              delay: 0.1,
            },
          },
    [shouldReduceMotion]
  );

  const navActivePillTransition = useMemo(
    () => ({
      type: "spring" as const,
      stiffness: 380,
      damping: 30,
    }),
    []
  );

  return (
    <div
      className={`fixed left-0 right-0 z-[60] flex justify-center px-4 sm:px-6 lg:px-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled || isOpen ? "top-2 md:top-3" : "top-[36px] sm:top-[48px]"
      }`}
      style={{ pointerEvents: "none" }}
    >
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          borderRadius: isOpen ? "24px" : "100px",
        }}
        transition={headerTransition}
        className={`w-full max-w-6xl pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled || isOpen
            ? "py-2 px-4 sm:px-5 lg:py-1.5 lg:px-5 border border-white/50 bg-white/75 shadow-[0_8px_32px_-8px_rgba(11,27,46,0.18)] backdrop-blur-xl backdrop-saturate-150"
            : "py-2.5 px-4 sm:py-3 sm:px-6 lg:px-8 bg-white/55 backdrop-blur-lg border border-white/30 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Logo brand frame — flex-1 to keep nav centered.
              Added pl-1 on mobile for extra corner padding so the
              "Consulting" subtitle text has breathing room from the edge. */}
          <div className="flex items-center min-w-0 flex-1 pl-1 sm:pl-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                scrollToTop(1.2);
              }}
              className="flex items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-xl shrink-0"
              aria-label="AVYSTRA home"
            >
              <AvystraLogo size="sm" showSubtitle={true} className="scale-110 sm:scale-100" />
            </a>
          </div>

          {/* Desktop Navigation — shows on lg+ (1024px) instead of xl (1280px) */}
          <nav
            className="hidden lg:flex items-center gap-0.5 relative bg-white/80 px-1 py-1 rounded-full border border-white/40 shadow-sm"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {navItems.map((item, i) => {
              const isActive = activeSection === item.href.substring(1);
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onClick={(e) => {
                    setActiveSection(item.href.substring(1));
                    handleScrollTo(e, item.href.substring(1));
                  }}
                  className={`group relative px-4 xl:px-5 py-2 font-display text-[11px] xl:text-[11.5px] uppercase tracking-[0.14em] font-bold transition-colors duration-300 rounded-full z-10 whitespace-nowrap ${
                    isActive
                      ? "text-navy-deep"
                      : "text-navy-deep/55 hover:text-navy-deep"
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>

                  {isActive && !shouldReduceMotion && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-white/80 shadow-sm rounded-full -z-10"
                      transition={navActivePillTransition}
                    />
                  )}

                  {hoveredIndex === i && !isActive && !shouldReduceMotion && (
                    <motion.span
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 bg-white/50 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 450, damping: 28 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* CTA Action — desktop (flex-1 + justify-end keeps nav centered) */}
          <div className="hidden lg:flex items-center justify-end shrink-0 flex-1">
            <a
              href="#consult"
              onClick={(e) => handleScrollTo(e, "consult")}
              className="relative inline-flex items-center gap-2 bg-navy-deep text-white font-display text-[10.5px] uppercase tracking-[0.18em] font-bold px-4 sm:px-5 xl:px-6 py-2.5 rounded-full hover:bg-navy-soft transition-all duration-500 group overflow-hidden shine-on-hover whitespace-nowrap"
            >
              <span className="relative z-10 whitespace-nowrap">Check Your OGI Score</span>
              <ArrowUpRight className="w-3 h-3 text-gold group-hover:rotate-45 transition-transform duration-500 relative z-10" />
            </a>
          </div>

          {/* Mobile/Tablet Menu trigger — shows below lg (1024px) */}
          <div className="lg:hidden flex items-center shrink-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-11 h-11 flex items-center justify-center text-navy-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-full bg-white/80 border border-white/40 shadow-sm transition-all hover:bg-white/90 active:bg-white/95"
              style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
              aria-label="Toggle Menu"
              aria-expanded={isOpen}
            >
              <div className="relative w-5 h-3.5 flex flex-col justify-between items-center">
                <motion.span
                  animate={
                    isOpen ? { rotate: 45, y: 6.25 } : { rotate: 0, y: 0 }
                  }
                  className="w-full h-[1.5px] bg-navy-deep origin-center rounded-full"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                <motion.span
                  animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="w-full h-[1.5px] bg-navy-deep rounded-full"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                <motion.span
                  animate={
                    isOpen ? { rotate: -45, y: -6.25 } : { rotate: 0, y: 0 }
                  }
                  className="w-full h-[1.5px] bg-navy-deep origin-center rounded-full"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Dropdown Menu — compact */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden overflow-hidden"
            >
              <div className="pt-3 pb-1.5 space-y-1">
                {navItems.map((item, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                    key={item.name}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => handleScrollTo(e, item.href.substring(1))}
                      className="flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-xl bg-white/50 hover:bg-white/70 active:bg-white/80 border border-white/30 hover:border-gold/20 transition-all font-sans group cursor-pointer"
                      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", pointerEvents: "auto" }}
                    >
                      <span className="font-mono text-[10.5px] font-bold text-gold tracking-widest opacity-90 shrink-0">
                        {item.number}
                      </span>
                      <span className="font-display font-semibold text-[13px] uppercase tracking-wider text-navy-deep group-hover:translate-x-1 transition-transform flex-1">
                        {item.name}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-navy-deep transition-colors shrink-0" />
                    </a>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.04, duration: 0.35 }}
                >
                  <a
                    href="#consult"
                    onClick={(e) => handleScrollTo(e, "consult")}
                    className="w-full mt-2 py-3.5 min-h-[48px] bg-navy-deep text-white font-bold font-display text-[11.5px] uppercase tracking-[0.16em] flex items-center justify-center gap-2 rounded-xl shadow-lg active:scale-[0.98] transition-transform whitespace-nowrap cursor-pointer"
                    style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", pointerEvents: "auto" }}
                  >
                    Check Your OGI Score
                    <ArrowUpRight className="w-3.5 h-3.5 text-gold" />
                  </a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
}
