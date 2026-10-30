import { motion } from "../core/motion.js";

export function initializeSidebar() {
  const root = document.documentElement;
  const sidebar = document.querySelector(".social-sidebar");
  const sidebarToggles = [
    ...document.querySelectorAll("[data-sidebar-toggle]"),
  ];
  const sidebarContent = document.querySelector(".sidebar-content");
  if (!sidebar || !sidebarContent || !sidebarToggles.length) return;
  let sidebarMotion = [];
  let sidebarMotionVersion = 0;
  let sidebarExpanded = !root.classList.contains("sidebar-collapsed");
  async function setSidebarExpanded(expanded, animate = true) {
    if (!sidebar || !sidebarContent) return;
    sidebarExpanded = expanded;
    const version = ++sidebarMotionVersion;
    sidebarMotion.forEach((animation) => animation.cancel());
    sidebarMotion = [];
    if (!expanded && sidebar.contains(document.activeElement))
      sidebarToggles[0]?.focus();
    sidebar.inert = false;
    sidebarContent.inert = !expanded;
    sidebarToggles.forEach((button) => {
      button.setAttribute("aria-expanded", String(expanded));
      const label = expanded ? "Collapse table of contents" : "Expand table of contents";
      button.setAttribute("aria-label", label);
      button.title = label;
    });
    const shouldAnimate = animate && !motion.reduced;
    if (
      shouldAnimate &&
      !expanded &&
      !root.classList.contains("sidebar-collapsed")
    ) {
      const fade = sidebarContent.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: motion.duration("reveal"),
        easing: "ease-in-out",
        fill: "forwards",
      });
      sidebarMotion.push(fade);
      try {
        await fade.finished;
      } catch {
        return;
      }
      if (version !== sidebarMotionVersion) return;
    }
    const before = sidebar.getBoundingClientRect();
    const beforePadding = getComputedStyle(sidebar).padding;
    root.classList.toggle("sidebar-collapsed", !expanded);
    sidebar.classList.toggle("is-expanded", expanded);
    const after = sidebar.getBoundingClientRect();
    sidebarMotion.forEach((animation) => animation.cancel());
    sidebarMotion = [];
    if (shouldAnimate) {
      sidebarMotion.push(
        sidebar.animate(
          [
            {
              width: `${before.width}px`,
              height: `${before.height}px`,
              padding: beforePadding,
              overflow: "hidden",
            },
            {
              width: `${after.width}px`,
              height: `${after.height}px`,
              padding: getComputedStyle(sidebar).padding,
              overflow: "hidden",
            },
          ],
          {
            duration: motion.duration("spatial"),
            easing: "cubic-bezier(.22,1,.36,1)",
          },
        ),
      );
      if (expanded)
        sidebarMotion.push(
          sidebarContent.animate(
            [
              { opacity: 0, transform: "translateY(8px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: motion.duration("spatial"),
              delay: 150,
              fill: "backwards",
              easing: "cubic-bezier(.22,1,.36,1)",
            },
          ),
        );
    }
  }
  setSidebarExpanded(!matchMedia("(max-width: 60rem)").matches, false);
  sidebarToggles.forEach((button) =>
    button.addEventListener("click", () =>
      setSidebarExpanded(!sidebarExpanded),
    ),
  );
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !event.defaultPrevented &&
      !root.classList.contains("sidebar-collapsed")
    )
      setSidebarExpanded(false);
  });
}
