export function languageFromUrl(href) {
  const value = new URL(href).searchParams.get("lang");
  return value === "en" || value === "zh-Hant" ? value : null;
}

export function localizedPageUrl(href, base, language) {
  const url = new URL(href, base);
  const current = new URL(base);
  if (url.origin !== current.origin || !["http:", "https:"].includes(url.protocol))
    return null;
  const page = !/\.[^/]+$/.test(url.pathname) || /\.html$/i.test(url.pathname);
  if (!page) return null;
  url.searchParams.set("lang", language === "zh-Hant" ? "zh-Hant" : "en");
  return `${url.pathname}${url.search}${url.hash}`;
}
