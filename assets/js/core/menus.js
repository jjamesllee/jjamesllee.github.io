// One owner for mutual exclusion, outside clicks, keyboard navigation, and focus.
const menus = new Set();
let listening = false;

export function registerMenu({
  container,
  trigger,
  panel,
  options,
  render = () => {},
}) {
  if (!container || !trigger || !panel) return null;
  const items = [...options];
  let opened = false;
  const menu = {
    contains: (target) => container.contains(target),
    get opened() {
      return opened;
    },
    close(restoreFocus = false) {
      opened = false;
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      render(false);
      if (restoreFocus) trigger.focus();
    },
    open() {
      menus.forEach((other) => {
        if (other !== menu) other.close();
      });
      opened = true;
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      render(true);
      (
        items.find((item) =>
          item.matches('[aria-checked="true"], [aria-pressed="true"]'),
        ) || items[0]
      )?.focus();
    },
  };
  menus.add(menu);
  menu.close();
  trigger.addEventListener("click", () =>
    opened ? menu.close() : menu.open(),
  );
  trigger.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      menu.open();
    }
  });
  container.addEventListener("keydown", (event) => {
    if (
      !opened ||
      ![
        "ArrowDown",
        "ArrowUp",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (index +
              (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) +
              items.length) %
            items.length;
    items[next]?.focus();
  });
  container.addEventListener("focusout", (event) => {
    // Safari can blur the focused option without focusing the tapped button.
    // Keep it visible until its click runs; outside taps are handled below.
    if (event.relatedTarget && !container.contains(event.relatedTarget))
      menu.close();
  });
  if (!listening) {
    listening = true;
    document.addEventListener("pointerdown", (event) =>
      menus.forEach((item) => {
        if (!item.contains(event.target)) item.close();
      }),
    );
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const active = [...menus].find((item) => item.opened);
      if (active) {
        event.preventDefault();
        active.close(true);
      }
    });
  }
  return menu;
}
