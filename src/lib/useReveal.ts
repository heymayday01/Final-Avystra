"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * useReveal — the site-wide scroll-reveal primitive.
 *
 * SAFETY DESIGN:
 * This hook NEVER sets opacity:0 or any hidden state in JavaScript.
 * It only ADDS the `.is-revealed` class when an element enters the viewport.
 * The initial hidden state is controlled purely by CSS (`.reveal` class),
 * which is gated behind a `.js` class on <html> (added before paint by an
 * inline script in layout.tsx). This means:
 *   - No JS = no `.js` class = `.reveal` has no hidden state = always visible
 *   - JS runs but IntersectionObserver unavailable = CSS 3s safety fallback
 *   - JS runs + IntersectionObserver works = smooth reveal on scroll
 *   - prefers-reduced-motion = CSS skips transforms, keeps opacity only
 *
 * SPEC:
 * - opacity 0→1 + translateY(24px→0)
 * - Duration: 600ms cubic-bezier(0.16, 1, 0.3, 1) [var(--dur-entrance) var(--ease-out)]
 * - Stagger: 80ms between child elements [var(--stagger)]
 * - IntersectionObserver threshold: 0.15
 * - prefers-reduced-motion: skip transforms, keep opacity only
 *
 * Usage (single element):
 *   const ref = useReveal<HTMLDivElement>();
 *   <div ref={ref} className="reveal">…</div>
 *
 * Usage (staggered children):
 *   const ref = useReveal<HTMLDivElement>({ stagger: true });
 *   <div ref={ref}>
 *     <div className="reveal" data-reveal>…</div>
 *     <div className="reveal" data-reveal>…</div>
 *   </div>
 *   (hook sets --reveal-delay CSS var on each [data-reveal] child automatically)
 */

export interface RevealOptions {
  /** Enable per-child stagger (80ms). Children must have `data-reveal` attribute. */
  stagger?: boolean;
  /** Custom stagger interval in ms (default 80). */
  staggerInterval?: number;
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
      stagger = false,
      staggerInterval = 80,
      threshold = 0.15,
      rootMargin = "0px 0px -10% 0px",
    } = options;

    // Reduced motion: reveal everything immediately, no observer.
    if (prefersReducedMotion()) {
      el.classList.add("is-revealed");
      if (stagger) {
        el.querySelectorAll("[data-reveal]").forEach((child) => {
          child.classList.add("is-revealed");
        });
      }
      return;
    }

    // Build the target list: the container itself (if it has .reveal) + its
    // [data-reveal] children. Apply stagger delays to children via CSS var.
    const targets: HTMLElement[] = [];
    if (el.classList.contains("reveal")) targets.push(el);

    if (stagger) {
      const children = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]"));
      children.forEach((child, i) => {
        child.style.setProperty("--reveal-delay", `${i * staggerInterval}ms`);
      });
      targets.push(...children);
    }

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
