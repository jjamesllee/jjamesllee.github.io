import {
  createTranslator,
  flattenDictionary,
} from "./features/localization-patterns.js";
import { registerMenu } from "./core/menus.js";
import { savePreference } from "./core/preferences.js";
import { languageFromUrl, localizedPageUrl } from "./core/language-route.js";

const textState = new WeakMap();
const attributeState = new WeakMap();
const attributes = ["aria-label", "title", "alt", "placeholder", "content"];
const ignored = 'script,style,pre,code,svg,textarea,[translate="no"]';
const normalize = (value) => value.replace(/\s+/g, " ").trim();

// Features copying descriptions must copy the English source, not translated DOM.
export function sourceAttribute(element, name) {
  return (
    attributeState.get(element)?.get(name)?.original ??
    element?.getAttribute(name) ??
    ""
  );
}

export function initializeLocalization() {
  const root = document.documentElement;
  const dictionary = flattenDictionary(
    JSON.parse(document.querySelector("#locale-dictionary")?.textContent || "{}"),
  );
  const translate = createTranslator(dictionary);
  const trigger = document.querySelector("[data-language-trigger]");
  const options = [...document.querySelectorAll("[data-language-option]")];
  const label = document.querySelector("[data-language-label]");
  const originalTitle = document.title;
  let language = languageFromUrl(location.href) ||
    (root.dataset.language === "zh-Hant" ? "zh-Hant" : "en");
  const pageLinks = new WeakMap();

  function localizeLinks(region) {
    const links = region.matches?.("a[href]") ? [region] : [];
    links.push(...(region.querySelectorAll?.("a[href]") || []));
    for (const link of links) {
      const href = pageLinks.get(link) ?? link.getAttribute("href");
      if (!href || href.startsWith("#") || link.hasAttribute("download")) continue;
      const localized = localizedPageUrl(href, location.href, language);
      if (!localized) continue;
      pageLinks.set(link, href);
      link.setAttribute("href", localized);
    }
  }
  let queued = false;
  const changed = new Set();

  function applyText(node) {
    const parent = node.parentElement;
    if (!parent || parent.closest(ignored) || !node.nodeValue.trim()) return;
    let state = textState.get(node);
    if (!state || node.nodeValue !== state.last)
      state = { original: node.nodeValue, last: node.nodeValue };
    const original = state.original;
    const translated =
      language === "zh-Hant"
        ? dictionary[parent.dataset.i18n] || translate(original)
        : normalize(original);
    const value =
      language === "zh-Hant"
        ? original.replace(/\S[\s\S]*\S|\S/, translated)
        : original;
    if (node.nodeValue !== value) node.nodeValue = value;
    state.last = value;
    textState.set(node, state);
  }

  function applyAttributes(element) {
    if (element.closest(ignored) || element === trigger) return;
    let states = attributeState.get(element);
    if (!states) {
      states = new Map();
      attributeState.set(element, states);
    }
    for (const name of attributes) {
      if (!element.hasAttribute(name)) continue;
      const current = element.getAttribute(name);
      let state = states.get(name);
      if (!state || current !== state.last)
        state = { original: current, last: current };
      const key = element.getAttribute(`data-i18n-${name}`);
      const value =
        language === "zh-Hant"
          ? dictionary[key] || translate(state.original)
          : state.original;
      if (current !== value) element.setAttribute(name, value);
      state.last = value;
      states.set(name, state);
    }
  }

  function translateRegion(node) {
    if (!node.isConnected) return;
    if (node.nodeType === Node.TEXT_NODE) {
      applyText(node);
      return;
    }
    if (!(node instanceof Element) || node.closest(ignored)) return;
    applyAttributes(node);
    localizeLinks(node);
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) applyText(walker.currentNode);
    node
      .querySelectorAll(attributes.map((name) => `[${name}]`).join(","))
      .forEach(applyAttributes);
  }

  const observe = () =>
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: attributes,
    });
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "childList")
        record.addedNodes.forEach((node) => changed.add(node));
      else changed.add(record.target);
    }
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      observer.disconnect();
      changed.forEach(translateRegion);
      changed.clear();
      observe();
    });
  });

  function setLanguage(value, persist = true) {
    language = value === "zh-Hant" ? "zh-Hant" : "en";
    if (persist) savePreference("portfolio-language", language);
    observer.disconnect();
    translateRegion(document.body);
    document.title =
      language === "zh-Hant" ? translate(originalTitle) : originalTitle;
    const route = localizedPageUrl(location.href, location.href, language);
    if (route) history.replaceState(history.state, "", route);
    root.lang = language;
    root.dataset.language = language;
    root.classList.remove("locale-pending");
    options.forEach((option) =>
      option.setAttribute(
        "aria-checked",
        String(option.dataset.languageOption === language),
      ),
    );
    if (label) label.textContent = language === "zh-Hant" ? "中" : "EN";
    trigger?.setAttribute(
      "aria-label",
      language === "zh-Hant" ? "語言：繁體中文" : "Language: English",
    );
    trigger?.setAttribute(
      "title",
      language === "zh-Hant" ? "語言" : "Language",
    );
    observe();
    document.dispatchEvent(
      new CustomEvent("portfolio-language-change", { detail: { language } }),
    );
  }

  const menu = registerMenu({
    container: document.querySelector("[data-language-picker]"),
    trigger,
    panel: document.querySelector("#language-menu"),
    options,
  });
  options.forEach((option) =>
    option.addEventListener("click", () => {
      setLanguage(option.dataset.languageOption);
      menu?.close(true);
    }),
  );
  window.addEventListener("storage", (event) => {
    if (event.key === "portfolio-language") setLanguage(event.newValue, false);
  });
  setLanguage(language, false);
}
