export function createMotionPolicy(media, animations = () => []) {
  const listeners = new Set();
  media.addEventListener("change", () => {
    if (media.matches) {
      for (const animation of animations()) {
        // Finish finite animations so closing callbacks still settle the DOM.
        try {
          animation.finish();
        } catch {
          animation.cancel();
        }
      }
    }
    listeners.forEach((listener) => listener(media.matches));
  });
  return {
    get matches() {
      return media.matches;
    },
    get reduced() {
      return media.matches;
    },
    get scrollBehavior() {
      return media.matches ? "auto" : "smooth";
    },
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

let policy;
export function initializeMotion() {
  policy ||= createMotionPolicy(
    matchMedia("(prefers-reduced-motion: reduce)"),
    () => document.getAnimations(),
  );
  return policy;
}

export const motion = {
  get matches() {
    return initializeMotion().matches;
  },
  get reduced() {
    return initializeMotion().reduced;
  },
  get scrollBehavior() {
    return initializeMotion().scrollBehavior;
  },
  onChange(listener) {
    return initializeMotion().onChange(listener);
  },
  duration(name) {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--motion-${name}`)
      .trim();
    return parseFloat(value || "0") * (value.endsWith("ms") ? 1 : 1000);
  },
};
