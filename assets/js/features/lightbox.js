import { sourceAttribute } from "../localization.js";

export function initializeLightbox() {
  const triggers = document.querySelectorAll(
    "[data-lightbox], .project-gallery img",
  );
  if (!triggers.length) return;
  document.querySelectorAll(".gallery-open img").forEach((image) => {
    const markUnavailable = () => {
      const button = image.closest("button");
      if (button.disabled) return;
      button.disabled = true;
      const status = document.createElement("span");
      status.className = "gallery-unavailable";
      status.textContent = "Photo unavailable";
      button.append(status);
    };
    image.addEventListener("error", markUnavailable, { once: true });
    if (image.complete && image.currentSrc && !image.naturalWidth)
      markUnavailable();
  });
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.innerHTML =
    '<button type="button" aria-label="Close image">Close ×</button><img alt=""><p></p>';
  document.body.append(dialog);
  dialog
    .querySelector("button")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lightbox]");
    const image = event.target.closest(".project-gallery img");
    if (!button && !image) return;
    dialog.querySelector("img").src = button?.dataset.lightbox || image.src;
    dialog.querySelector("img").alt = sourceAttribute(
      image || button.querySelector("img"),
      "alt",
    );
    dialog.querySelector("p").textContent = button?.dataset.caption || "";
    dialog.classList.toggle("lightbox--blurred", button?.hasAttribute("data-blurred-photo") || false);
    dialog.showModal();
  });
}
