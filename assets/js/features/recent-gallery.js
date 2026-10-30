export function initializeRecentGallery() {
  const gallery = document.querySelector(".selected-gallery");
  if (!gallery) return;
  const progress = gallery.nextElementSibling;
  let start = null;
  let dragged = false;
  const update = () => {
    const maximum = gallery.scrollWidth - gallery.clientWidth;
    progress.disabled = maximum <= 1;
    progress.value = String(maximum > 1 ? gallery.scrollLeft / maximum * 1000 : 0);
  };
  progress.addEventListener("input", () => {
    gallery.scrollLeft = Number(progress.value) / 1000 * (gallery.scrollWidth - gallery.clientWidth);
  });
  gallery.addEventListener("scroll", update, { passive: true });
  new ResizeObserver(update).observe(gallery);
  gallery.addEventListener("dragstart", event => event.preventDefault());
  gallery.addEventListener("pointerdown", event => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    start = { x: event.clientX, scroll: gallery.scrollLeft, id: event.pointerId };
    dragged = false;
  });
  gallery.addEventListener("pointermove", event => {
    if (!start) return;
    const distance = event.clientX - start.x;
    if (Math.abs(distance) > 6 && !dragged) {
      dragged = true;
      gallery.setPointerCapture(start.id);
      gallery.classList.add("is-dragging");
    }
    if (dragged) gallery.scrollLeft = start.scroll - distance;
  });
  const end = () => { start = null; gallery.classList.remove("is-dragging"); };
  window.addEventListener("pointerup", end);
  gallery.addEventListener("pointercancel", end);
  gallery.addEventListener("click", event => {
    if (dragged) { event.preventDefault(); dragged = false; }
  }, true);
  gallery.addEventListener("keydown", event => {
    if (event.target !== gallery || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    gallery.scrollLeft += gallery.clientWidth * (event.key === "ArrowRight" ? 0.6 : -0.6);
  });
  update();
}
