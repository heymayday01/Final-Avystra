/**
 * Centralized GSAP + ScrollTrigger setup.
 *
 * Problem: gsap.registerPlugin(ScrollTrigger) was being called in 4 different
 * files (useSmoothScroll, Header, Hero x2). Each call is idempotent but
 * wasteful, and the scattered setup made it hard to reason about lifecycle.
 *
 * Solution: this module registers the plugin ONCE at import time and exports
 * the gsap + ScrollTrigger instances for consumers to use directly. No more
 * per-component registerPlugin calls.
 *
 * Usage:
 *   import { gsap, ScrollTrigger } from "@/lib/gsap";
 *   // gsap and ScrollTrigger are ready to use — no registerPlugin needed.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ONCE at module load. Subsequent calls are no-ops but this ensures
// it happens before any component uses ScrollTrigger.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
