"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Check if the user prefers reduced motion */
function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Detect touch/mobile devices — Lenis is desktop-only for smooth wheel.
 *  On touch devices, native scrolling is already smooth and Lenis's
 *  touch handling can interfere with native momentum scrolling. */
function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

/** Debounced resize handler factory. */
function createResizeHandler(callback: () => void) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const handler = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(callback, 180);
  };
  return { handler, cleanup: () => { if (timer) clearTimeout(timer); } };
}

/** Hash-link click handler factory — intercepts <a href="#..."> clicks. */
function createHashClickHandler(
  scrollFn: (targetId: string) => void
) {
  const handler = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    e.preventDefault();
    const targetId = href.substring(1);
    scrollFn(targetId);
  };
  return handler;
}

/** Native smooth scroll to an element ID (mobile + reduced-motion fallback). */
function nativeScrollToId(targetId: string, offset = -110) {
  if (targetId === "") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(targetId);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

/**
 * Unified smooth-scroll orchestration for the entire site.
 *
 * Architecture (simplified for reliability + performance):
 * - Desktop (non-touch): Lenis owns the scroll position (wheel → smoothed
 *   scroll). Lenis drives GSAP's ticker (single rAF loop). ScrollTrigger
 *   reads from Lenis via `scrollerProxy` so triggers stay in sync.
 * - Mobile/Touch: Lenis is NOT initialized. Native touch scrolling works
 *   exactly as the browser intends — no interference, no jank. A lenis-like
 *   shim is installed so smoothScrollTo() + Header scroll tracking work.
 * - Reduced motion: skip Lenis entirely, just install the shim for
 *   smoothScrollTo() to work.
 * - Hash-link clicks are intercepted on ALL devices for consistent
 *   anchor navigation with header-offset.
 *
 * NOTE: The previous version installed scrollerProxy on touch devices too,
 * which broke native touch momentum scrolling on some browsers. Now
 * scrollerProxy is desktop-only.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = getPrefersReducedMotion();
    const isTouch = isTouchDevice();

    // ── Mobile/Touch OR Reduced motion: native scroll + lenis shim ──
    // No Lenis instance, no scrollerProxy. Native touch scrolling works
    // perfectly. The shim lets smoothScrollTo() + Header scroll tracking
    // work without a real Lenis instance.
    if (isTouch || prefersReducedMotion) {
      const hashHandler = createHashClickHandler((targetId) =>
        nativeScrollToId(targetId)
      );
      document.addEventListener("click", hashHandler);

      const { handler: resizeHandler, cleanup: resizeCleanup } =
        createResizeHandler(() => ScrollTrigger.refresh());
      window.addEventListener("resize", resizeHandler, { passive: true });

      // Lenis-like shim so smoothScrollTo() + getLenis().on("scroll") work.
      // The `on("scroll", cb)` attaches a real window scroll listener so
      // Header can track scroll position on touch devices.
      const scrollListeners: Array<() => void> = [];
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
        on: (event: string, cb: () => void) => {
          if (event === "scroll") {
            scrollListeners.push(cb);
            window.addEventListener("scroll", cb, { passive: true });
          }
        },
        off: (event: string, cb: () => void) => {
          if (event === "scroll") {
            const idx = scrollListeners.indexOf(cb);
            if (idx >= 0) scrollListeners.splice(idx, 1);
            window.removeEventListener("scroll", cb);
          }
        },
        resize: () => {},
        destroy: () => {
          scrollListeners.forEach((cb) => window.removeEventListener("scroll", cb));
          scrollListeners.length = 0;
        },
        scroll: 0,
        velocity: 0,
        isScrolling: false,
        isStopped: false,
        options: {},
        raf: () => {},
      };

      return () => {
        document.removeEventListener("click", hashHandler);
        window.removeEventListener("resize", resizeHandler);
        resizeCleanup();
        ScrollTrigger.getAll().forEach((t) => t.kill());
        (window as unknown as { lenis: unknown }).lenis = undefined;
      };
    }

    // ═══ DESKTOP ONLY: Full Lenis + scrollerProxy setup ═══

    const lenis = new Lenis({
      // lerp 0.08 = smoother, premium feel. Lower = smoother but laggier.
      // 0.09 was slightly too responsive; 0.08 adds a touch more glide.
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
      infinite: false,
      autoRaf: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      // Prevent Lenis from intercepting clicks on elements that need native
      // behavior (e.g. links with target=_blank, file downloads, form fields).
      prevent: (node) =>
        node.closest("[data-lenis-prevent]") !== null ||
        node.tagName === "VIDEO" ||
        node.tagName === "INPUT" ||
        node.tagName === "TEXTAREA" ||
        node.tagName === "SELECT",
    });

    (window as unknown as { lenis: typeof lenis }).lenis = lenis;

    // Wire Lenis as the ScrollTrigger scroller (desktop only).
    // This is the key fix: scrollerProxy is NOT installed on touch devices,
    // which was breaking native touch momentum scrolling.
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

    // Single scroll listener — Lenis drives ScrollTrigger updates.
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // Single GSAP ticker callback — drives Lenis's rAF. This is the only
    // rAF loop on the page; all GSAP animations + Lenis scroll run off it.
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Refresh Lenis dimensions when ScrollTrigger refreshes.
    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);

    // Initial refresh after setup (catches late layout shifts from fonts/images)
    ScrollTrigger.refresh();

    // Hash-link clicks → Lenis smooth scroll
    const hashHandler = createHashClickHandler((targetId) => {
      if (targetId === "") {
        lenis.scrollTo(0, { duration: 1.25 });
        return;
      }
      const el = document.getElementById(targetId);
      if (el) {
        lenis.scrollTo(el, { offset: -110, duration: 1.0 });
      }
    });
    document.addEventListener("click", hashHandler);

    // Debounced resize — refresh both ScrollTrigger + Lenis
    const { handler: resizeHandler, cleanup: resizeCleanup } =
      createResizeHandler(() => {
        ScrollTrigger.refresh();
        lenis.resize();
      });
    window.addEventListener("resize", resizeHandler, { passive: true });

    return () => {
      document.removeEventListener("click", hashHandler);
      window.removeEventListener("resize", resizeHandler);
      resizeCleanup();
      gsap.ticker.remove(tickerCallback);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      lenis.destroy();
      (window as unknown as { lenis: typeof lenis | undefined }).lenis = undefined;
    };
  }, []);
}
