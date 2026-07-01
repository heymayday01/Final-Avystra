"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * useScrollReveal — the single, site-wide reveal primitive.
 *
 * Design principles (AVYSTRA motion system):
 *  - GSAP ScrollTrigger with `once: true` → fires exactly once on first entry
 *    (functionally equivalent to an IntersectionObserver that disconnects).
 *  - `power2.out` easing for ALL entrances.
 *  - Animates `opacity` + `transform: translateY()` ONLY — never layout
 *    properties (width/height/top/left). GPU-cheap, no main-thread layout.
 *  - Stagger via `ScrollTrigger.batch` at ~90ms per child (within rule's
 *    80–100ms band).
 *  - `prefers-reduced-motion`: no-op — elements are left visible (their CSS
 *    base state keeps them visible; we never hide them in JS).
 *  - Scoped via `gsap.context` so cleanup is automatic on unmount.
 *  - Reads from Lenis via the existing `scrollerProxy` setup (desktop) or
 *    native scroll (mobile) — no new scroll listeners.
 *
 * Usage (single element):
 *   const ref = useScrollReveal<HTMLElement>();
 *   <section ref={ref}>…</section>
 *
 * Usage (staggered children):
 *   const ref = useScrollReveal<HTMLDivElement>({ stagger: 0.09, child: "[data-reveal]" });
 *   <div ref={ref}>
 *     <div data-reveal>…</div>
 *     <div data-reveal>…</div>
 *   </div>
 */

export interface ScrollRevealOptions {
  /** Vertical slide distance in px (default 24, within the 20–30px band). */
  y?: number;
  /** Per-child stagger in seconds (default 0.09 → 90ms). */
  stagger?: number;
  /** Duration in seconds (default 0.6 — under the 600ms ceiling). */
  duration?: number;
  /** Delay before the first element animates, in seconds (default 0). */
  delay?: number;
  /**
   * Child selector for staggered groups. When provided, the hook animates
   * children matching this selector inside the ref'd container instead of
   * the container itself.
   */
  child?: string;
  /** Viewport trigger position (default "85%"). Lower = earlier reveal. */
  start?: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: ScrollRevealOptions = {}
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: leave everything visible. The base CSS keeps elements
    // at opacity:1 when reduced-motion is requested, so we do nothing here.
    if (prefersReducedMotion()) return;

    const {
      y = 24,
      stagger = 0.09,
      duration = 0.6,
      delay = 0,
      child,
      start = "85% bottom",
    } = options;

    const ctx = gsap.context(() => {
      const targets = child
        ? gsap.utils.toArray<HTMLElement>(child, el)
        : [el];

      if (targets.length === 0) return;

      // Single target — animate directly (cheaper than batch for one item).
      if (targets.length === 1 && !child) {
        gsap.fromTo(
          el,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration,
            delay,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start,
              once: true,
            },
          }
        );
        return;
      }

      // Staggered group — ScrollTrigger.batch reveals each child as it
      // enters, staggering siblings that enter together. `once`-equivalent
      // via onEnter (batch only fires onEnter by default; we never revoke).
      ScrollTrigger.batch(targets, {
        start,
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y },
            {
              opacity: 1,
              y: 0,
              duration,
              ease: "power2.out",
              stagger,
              delay,
            }
          );
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return ref;
}

export default useScrollReveal;
