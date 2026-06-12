import { useEffect, useState } from "react";

/** Live `prefers-reduced-motion` value; `false` until mounted (SSR-safe).
 *  Prefer gating motion in CSS media queries — reach for this only when JS
 *  behavior itself must branch (e.g. suppressing a programmatic snap-back). */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    // Safari ≤13 MediaQueryList lacks addEventListener; use the legacy API
    // there instead of throwing — an uncaught effect error unmounts the
    // whole island.
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);
  return reduced;
}
