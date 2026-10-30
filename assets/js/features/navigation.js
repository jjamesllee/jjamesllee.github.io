import { motion } from "../core/motion.js";

export function initializeNavigation() {
  const scrollNav = document.querySelector("[data-scroll-nav]");
  if (scrollNav) {
    motion.onChange((reduced) => {
      if (reduced)
        scrollNav.scrollTo({
          left: scrollNav.scrollLeft,
          top: scrollNav.scrollTop,
          behavior: "instant",
        });
    });
    const updateNavProgress = () => {
      const range = scrollNav.scrollWidth - scrollNav.clientWidth;
      scrollNav.classList.toggle("is-scrollable", range > 1);
      const progress =
        range > 1 ? Math.max(0, Math.min(1, scrollNav.scrollLeft / range)) : 1;
      scrollNav.style.setProperty("--nav-progress", `${progress * 100}%`);
    };
    scrollNav.addEventListener("scroll", updateNavProgress, { passive: true });
    if ("ResizeObserver" in window) {
      const navResize = new ResizeObserver(updateNavProgress);
      navResize.observe(scrollNav);
      const primaryNav = scrollNav.querySelector(".primary-nav");
      if (primaryNav) navResize.observe(primaryNav);
    }
    updateNavProgress();
    document.addEventListener("portfolio-language-change", () =>
      requestAnimationFrame(updateNavProgress),
    );
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;
    scrollNav.addEventListener("pointerdown", (event) => {
      if (
        event.pointerType !== "mouse" ||
        event.button !== 0 ||
        !scrollNav.classList.contains("is-scrollable")
      )
        return;
      startX = event.clientX;
      startScroll = scrollNav.scrollLeft;
      dragging = true;
      moved = false;
    });
    scrollNav.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 5) {
        moved = true;
        scrollNav.classList.add("is-dragging");
        scrollNav.setPointerCapture(event.pointerId);
      }
      if (moved) {
        event.preventDefault();
        scrollNav.scrollLeft = startScroll - delta;
      }
    });
    function endNavDrag(event) {
      dragging = false;
      scrollNav.classList.remove("is-dragging");
      if (scrollNav.hasPointerCapture(event.pointerId))
        scrollNav.releasePointerCapture(event.pointerId);
    }
    scrollNav.addEventListener("pointerup", endNavDrag);
    scrollNav.addEventListener("pointercancel", endNavDrag);
    scrollNav.addEventListener("pointerleave", (event) => {
      if (!moved) endNavDrag(event);
    });
    scrollNav.addEventListener(
      "click",
      (event) => {
        if (moved) {
          event.preventDefault();
          event.stopPropagation();
          moved = false;
        }
      },
      true,
    );
    scrollNav.addEventListener("dragstart", (event) => event.preventDefault());
    scrollNav.addEventListener("keydown", (event) => {
      if (
        event.target !== scrollNav ||
        !["ArrowLeft", "ArrowRight"].includes(event.key)
      )
        return;
      event.preventDefault();
      scrollNav.scrollBy({
        left: event.key === "ArrowRight" ? 100 : -100,
        behavior: motion.scrollBehavior,
      });
    });
    const active = scrollNav.querySelector('[aria-current="page"]');
    if (active)
      requestAnimationFrame(() => {
        scrollNav.scrollLeft +=
          active.getBoundingClientRect().left -
          scrollNav.getBoundingClientRect().left -
          (scrollNav.clientWidth - active.offsetWidth) / 2;
        updateNavProgress();
      });
  }
}
