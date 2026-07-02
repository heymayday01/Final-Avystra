/**
 * Shared smooth-scroll utility.
 *
 * All components use this instead of duplicating the Lenis-vs-native
 * fallback logic. The global hash-link click handler in useSmoothScroll
 * already covers <a href="#..."> navigation; this helper is for
 * programmatic scrolls (button onClick handlers, etc.).
 *
 * Note: Lenis ships its own (incomplete) `window.lenis` type, so we
 * access it via a typed getter to get full autocomplete on methods.
 */

// Minimal Lenis instance interface — only the methods we call
interface LenisLike {
  scrollTo: (
    target: number | HTMLElement | string,
    options?: { offset?: number; duration?: number; immediate?: boolean }
  ) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  resize: () => void;
  destroy: () => void;
  scroll: number;
  velocity: number;
  isScrolling: boolean | string;
  isStopped: boolean;
}

/** Typed getter for the Lenis instance on window */
function getLenis(): LenisLike | undefined {
  return (window as unknown as { lenis?: LenisLike }).lenis;
}

/**
 * Smooth-scroll to a target element.
 * @param target  Element ID (without #) or the element itself
 * @param offset  Pixel offset from top (negative = above the element).
 *                Default -110 to clear the sticky header + promo banner.
 * @param duration Scroll duration in seconds (default 1.0)
 */
export function smoothScrollTo(
  target: string | HTMLElement,
  offset: number = -110,
  duration: number = 1.0
): void {
  const el =
    typeof target === "string" ? document.getElementById(target) : target;
  if (!el) return;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset, duration });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

/**
 * Scroll to top of the page.
 */
export function scrollToTop(duration: number = 1.2): void {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { duration });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/** Export the typed getter for components that need direct Lenis access */
export { getLenis };
