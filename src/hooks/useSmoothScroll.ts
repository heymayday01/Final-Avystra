"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Check if the user prefers reduced motion */
function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Detect touch/mobile devices — Lenis is desktop-only for smooth wheel */
function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

/**
 * Unified smooth-scroll orchestration for the entire site.
 *
 * Architecture:
 * - Desktop: Lenis owns the scroll position (wheel → smoothed scroll).
 *   Lenis drives GSAP's ticker (single rAF loop). ScrollTrigger reads
 *   from Lenis via `scrollerProxy` so triggers stay in sync.
 * - Mobile/Touch: Lenis is NOT initialized. Native touch scrolling works
 *   exactly as the browser intends (no interference, no jank). ScrollTrigger
 *   reads from native scroll. Hash-link clicks use native smooth scroll.
 * - Hash-link clicks are intercepted on ALL devices for consistent
 *   anchor navigation with header-offset.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = getPrefersReducedMotion();
    const isTouch = isTouchDevice();

    // ── Reduced motion: skip Lenis entirely, just reveal content ──
    if (prefersReducedMotion) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.set(
        ".gsap-stagger-card, .gsap-divider, .pillar-fade-up, .pillar-card, .gsap-hero-fade, h2, p",
        { opacity: 1, y: 0, scaleX: 1, scale: 1, filter: "none", rotateX: 0 }
      );
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ── Mobile/Touch: skip Lenis, use native scroll ──
    // Lenis's scrollerProxy breaks native touch scrolling on Chrome mobile.
    // On touch devices we let the browser handle scrolling natively (which
    // is already smooth on mobile) and just wire up ScrollTrigger normally.
    if (isTouch) {
      // Hash-link smooth scroll (native, no Lenis needed)
      const handleHashClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest("a");
        if (!anchor) return;
        const href = anchor.getAttribute("href");
        if (!href || !href.startsWith("#")) return;

        e.preventDefault();
        const targetId = href.substring(1);
        if (targetId === "") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        const element = document.getElementById(targetId);
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top, behavior: "smooth" });
        }
      };
      document.addEventListener("click", handleHashClick);

      // Debounced resize for ScrollTrigger
      let resizeTimer: ReturnType<typeof setTimeout> | null = null;
      const handleResize = () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 180);
      };
      window.addEventListener("resize", handleResize, { passive: true });

      // Provide a lenis-like shim so smoothScrollTo() works on mobile
      (window as unknown as { lenis: unknown }).lenis = {
        scrollTo: (
          target: number | HTMLElement,
          opts?: { offset?: number; duration?: number }
        ) => {
          const offset = opts?.offset ?? 0;
          if (typeof target === "number") {
            window.scrollTo({ top: target, behavior: "smooth" });
          } else if (target instanceof HTMLElement) {
            const top = target.getBoundingClientRect().top + window.scrollY + offset;
            window.scrollTo({ top, behavior: "smooth" });
          }
        },
        on: () => {},
        off: () => {},
        resize: () => {},
        destroy: () => {},
        scroll: 0,
        velocity: 0,
        isScrolling: false,
        isStopped: false,
        options: {},
        raf: () => {},
      };

      return () => {
        document.removeEventListener("click", handleHashClick);
        window.removeEventListener("resize", handleResize);
        if (resizeTimer) clearTimeout(resizeTimer);
        ScrollTrigger.getAll().forEach((t) => t.kill());
        (window as unknown as { lenis: unknown }).lenis = undefined;
      };
    }

    // ═══ DESKTOP ONLY: Full Lenis + scrollerProxy setup ═══

    const lenis = new Lenis({
      // lerp 0.1 = snappy but smooth. Lower values (0.08) felt laggy on long
      // pages; 0.1 responds quickly while still smoothing trackpad jitter.
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      infinite: false,
      autoRaf: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      // Prevent Lenis from intercepting clicks on elements that need native
      // behavior (e.g. links with target=_blank, file downloads).
      prevent: (node) =>
        node.closest("[data-lenis-prevent]") !== null ||
        node.tagName === "VIDEO" ||
        node.tagName === "INPUT" ||
        node.tagName === "TEXTAREA" ||
        node.tagName === "SELECT",
    });

    (window as unknown as { lenis: typeof lenis }).lenis = lenis;

    // Wire Lenis as the ScrollTrigger scroller (desktop only)
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: "transform",
    });

    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    ScrollTrigger.refresh();

    // Hash-link clicks → Lenis smooth scroll
    const handleHashClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      e.preventDefault();
      const targetId = href.substring(1);
      if (targetId === "") {
        lenis.scrollTo(0, { duration: 1.25 });
        return;
      }
      const element = document.getElementById(targetId);
      if (element) {
        lenis.scrollTo(element, { offset: -100, duration: 1.25 });
      }
    };
    document.addEventListener("click", handleHashClick);

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
        lenis.resize();
      }, 180);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      document.removeEventListener("click", handleHashClick);
      window.removeEventListener("resize", handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      gsap.ticker.remove(tickerCallback);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      lenis.destroy();
      (window as unknown as { lenis: typeof lenis | undefined }).lenis = undefined;
    };
  }, []);
}
