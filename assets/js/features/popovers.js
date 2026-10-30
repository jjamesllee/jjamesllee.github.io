export function initializePopovers() {
  const hover = matchMedia("(hover: hover)");
  const records = [...document.querySelectorAll("[data-popover]")].map((root) => {
    const trigger = root.matches("[data-popover-trigger]")
      ? root
      : root.querySelector("[data-popover-trigger]");
    return { root, trigger, pinned: false };
  }).filter((record) => record.trigger);

  function close(record) {
    record.pinned = false;
    record.root.classList.remove("is-open");
    record.trigger.setAttribute("aria-expanded", "false");
  }
  function open(record) {
    records.filter((other) => other !== record).forEach(close);
    record.root.classList.add("is-open");
    record.trigger.setAttribute("aria-expanded", "true");
  }
  for (const record of records) {
    const { root, trigger } = record;
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("click", () => {
      if (record.pinned) close(record);
      else {
        open(record);
        record.pinned = true;
      }
    });
    trigger.addEventListener("keydown", (event) => {
      if (!trigger.matches("button") && ["Enter", " "].includes(event.key)) {
        event.preventDefault();
        trigger.click();
      }
    });
    root.addEventListener("pointerenter", () => {
      if (hover.matches) open(record);
    });
    root.addEventListener("pointerleave", () => {
      if (!record.pinned && !root.contains(document.activeElement)) close(record);
    });
    root.addEventListener("focusin", () => open(record));
    root.addEventListener("focusout", () => queueMicrotask(() => {
      if (!root.contains(document.activeElement)) close(record);
    }));
  }
  document.addEventListener("pointerdown", (event) => {
    records.filter((record) => !record.root.contains(event.target)).forEach(close);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    for (const record of records) {
      if (record.root.classList.contains("is-open") && record.root.contains(document.activeElement))
        record.trigger.focus({ preventScroll: true });
      close(record);
    }
  });
}
