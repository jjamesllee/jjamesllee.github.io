import { registerMenu } from "../core/menus.js";
import {
  preferenceConfig,
  normalizePreferences,
  savePreference,
} from "../core/preferences.js";

export function initializeAppearance() {
  const root = document.documentElement;
  const config = preferenceConfig();
  const system = matchMedia("(prefers-color-scheme: dark)");
  const themeTrigger = document.querySelector("[data-theme-trigger]");
  const themeOptions = [...document.querySelectorAll("[data-theme-option]")];
  const accentOptions = [...document.querySelectorAll("[data-accent-option]")];
  const accentPicker = document.querySelector("[data-accent-picker]");
  if (!themeTrigger || !accentPicker) return;
  const themeMenu = registerMenu({
    container: document.querySelector("[data-theme-picker]"),
    trigger: themeTrigger,
    panel: document.querySelector("#theme-menu"),
    options: themeOptions,
  });
  const accentMenu = registerMenu({
    container: accentPicker,
    trigger: document.querySelector("[data-accent-trigger]"),
    panel: document.querySelector("[data-accent-menu]"),
    options: accentOptions,
    render: (opened) => accentPicker.classList.toggle("is-open", opened),
  });
  function applyMode(value, persist = true) {
    const mode = normalizePreferences({ mode: value }, config).mode;
    root.dataset.themePreference = mode;
    root.dataset.theme =
      mode === "system" ? (system.matches ? "dark" : "light") : mode;
    themeOptions.forEach((option) =>
      option.setAttribute(
        "aria-checked",
        String(option.dataset.themeOption === mode),
      ),
    );
    const label = mode[0].toUpperCase() + mode.slice(1);
    themeTrigger.setAttribute("aria-label", `Appearance: ${label}`);
    themeTrigger.title = `Appearance: ${label}`;
    if (persist) savePreference("portfolio-color-mode", mode);
  }
  function applyAccent(value, persist = true) {
    const accent = normalizePreferences({ accent: value }, config).accent;
    root.dataset.accent = accent;
    accentOptions.forEach((option) =>
      option.setAttribute(
        "aria-pressed",
        String(option.dataset.accentOption === accent),
      ),
    );
    if (persist) savePreference("portfolio-accent", accent);
  }
  themeOptions.forEach((option) =>
    option.addEventListener("click", () => {
      applyMode(option.dataset.themeOption);
      themeMenu?.close(true);
    }),
  );
  accentOptions.forEach((option) =>
    option.addEventListener("click", () => {
      applyAccent(option.dataset.accentOption);
      accentMenu?.close(true);
    }),
  );
  system.addEventListener("change", () => {
    if (root.dataset.themePreference === "system") applyMode("system", false);
  });
  window.addEventListener("storage", (event) => {
    if (event.key === "portfolio-color-mode") applyMode(event.newValue, false);
    if (event.key === "portfolio-accent") applyAccent(event.newValue, false);
  });
  applyMode(root.dataset.themePreference, false);
  applyAccent(root.dataset.accent, false);
}
