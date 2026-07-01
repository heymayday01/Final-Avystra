"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * useReveal — the site-wide scroll-reveal primitive.
 *
 * SAFETY DESIGN (the key lesson from the useScrollReveal regression):
 * This hook NEVER sets opacity:0 or any hidden state in JavaScript.
 * It only ADDS the `.is-revealed` class when an element enters the viewport.
 * The initial hidden state is controlled purely by CSS (`.reveal` class),
 * which is gated behind a `.js` class on <html> (added before paint by an
 * inline script in layout.tsx). This means:
 *   - No JS = no `.js` class = `.reveal` has no hidden state = always visible
 *   - JS runs but IntersectionObserver unavailable = CSS 3s safety fallback
 *     animation forces visibility
 *   - JS runs + IntersectionObserver works = smooth reveal on scroll
 *   - prefers-reduced-motion = CSS forces visible immediately
 *
 * ANIMATION: opacity 0→1 + translateY(24px→0), 0.7s, power2.out easing.
 * GPU-cheap (transform + opacity only). Stagger via inline `--reveal-delay`.
 *
 * Usage (single element):
 *   const ref = useReveal<HTMLDivElement>();
 *   <div ref={ref} className="reveal">…</div>
 *
 * Usage (staggered children):
 *   const ref = useReveal<HTMLDivElement>({ stagger: 0.08 });
 *   <div ref={ref}>
 *     <div className="reveal" style={{ ["--reveal-delay" as any]: "0ms" }}>…</div>
 *     <div className="reveal" style={{ ["--reveal-delay" as any]: "80ms" }}>…</div>
 *   </div>
 *   (or use data-reveal on children + the hook sets stagger delays automatically)
 */

export interface RevealOptions {
  /** Per-child stagger in seconds (default 0.08 = 80ms). Only applies to
   *  children with the `data-reveal` attribute. */
  stagger?: number;
  /** Viewport threshold for triggering (default 0.15 = 15% visible). */
  threshold?: number;
  /** Root margin (default "0px 0px -10% 0px" = trigger slightly before fully in view). */
  rootMargin?: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {}
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      stagger = 0.08,
      threshold = 0.15,
      rootMargin = "0px 0px -10% 0px",
    } = options;

    // Reduced motion: reveal everything immediately, no observer.
    if (prefersReducedMotion()) {
      el.classList.add("is-revealed");
      el.querySelectorAll("[data-reveal]").forEach((child, i) => {
        child.classList.add("is-revealed");
      });
      return;
    }

    // Build the target list: the container itself (if it has .reveal) + its
    // [data-reveal] children. Apply stagger delays to children via CSS var.
    const children = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]"));
    children.forEach((child, i) => {
      child.style.setProperty("--reveal-delay", `${i * stagger * 1000}ms`);
    });

    const targets: HTMLElement[] = [];
    if (el.classList.contains("reveal")) targets.push(el);
    targets.push(...children);

    if (targets.length === 0) return;

    // Fallback: if IntersectionObserver isn't supported, reveal immediately.
    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((t) => t.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    targets.forEach((t) => observer.observe(t));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export default useReveal;
