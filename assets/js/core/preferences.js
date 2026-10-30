export function normalizePreferences(values, config) {
  return {
    mode: config.modes.includes(values.mode)
      ? values.mode
      : config.defaults.mode,
    accent: config.accents.includes(values.accent)
      ? values.accent
      : config.defaults.accent,
    language: config.languages.includes(values.language)
      ? values.language
      : config.defaults.language,
  };
}

export function readPreference(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function savePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Private browsing may disable storage. */
  }
}

export function preferenceConfig() {
  return JSON.parse(document.querySelector("#preference-config").textContent);
}
