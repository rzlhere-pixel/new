/** DOM id of a dish row. */
export function itemAnchor(id: string) {
  return `item-${id}`;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll to an element; CSS scroll-margin-top keeps it clear of the sticky bar. */
export function scrollToId(id: string, opts: { flash?: boolean } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  if (opts.flash) {
    el.classList.remove("flash");
    // Restart the animation.
    void el.offsetWidth;
    el.classList.add("flash");
    window.setTimeout(() => el.classList.remove("flash"), 650);
  }
}
