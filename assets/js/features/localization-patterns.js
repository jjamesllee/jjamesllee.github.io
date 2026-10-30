// Page and subsection grouping is for authoring; lookups stay shared across pages.
export function flattenDictionary(sections) {
  const dictionary = Object.create(null);
  function visit(section) {
    if (!section || typeof section !== "object" || Array.isArray(section))
      throw new TypeError("Translation sections must be objects.");
    for (const [key, value] of Object.entries(section)) {
      if (typeof value === "string") {
        if (!key.trim() || !value.trim())
          throw new Error("Translation entries must not be empty.");
        if (Object.hasOwn(dictionary, key))
          throw new Error(`Duplicate translation key: ${key}`);
        dictionary[key] = value;
      } else visit(value);
    }
  }
  visit(sections);
  return dictionary;
}

export function createTranslator(sections) {
  const dictionary = flattenDictionary(sections);
  const normalize = (value) => value.replace(/\s+/g, " ").trim();
  const names = (value) =>
    value.replace(
      /Cheng-Chi Lee|James Lee|Cheng-Chi|James(?=['’]s)/g,
      "李承起",
    );
  function translate(value) {
    const key = normalize(value);
    if (dictionary[key]) return dictionary[key];
    let match;
    if ((match = key.match(/^(I|II|III|IV|V) \/\/ (.+)$/)))
      return `${match[1]} // ${translate(match[2])}`;
    if (
      (match = key.match(
        /^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/,
      ))
    ) {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${match[2]} 年 ${months.indexOf(match[1]) + 1} 月`;
    }
    if ((match = key.match(/^(.+?)( \/\/ | · )(\d{4})$/)))
      return `${translate(match[1])}${match[2]}${match[3]}`;
    if (key.endsWith(".") && !key.endsWith("...")) {
      const text = key.slice(0, -1);
      const translated = translate(text);
      if (translated !== text) return `${translated}。`;
    }
    if ((match = key.match(/^Text size: (\d+)%$/)))
      return `文字大小：${match[1]}%`;
    if ((match = key.match(/^Enlarge (triathlon )?photo (\d+)$/)))
      return `放大${match[1] ? "鐵人三項" : ""}照片 ${match[2]}`;
    if ((match = key.match(/^Project (\d+)$/))) return `專題 ${match[1]}`;
    if ((match = key.match(/^(\d+) projects? total$/)))
      return `共 ${match[1]} 個專題`;
    if ((match = key.match(/^(\d+) projects? match(?:es)? your filters$/)))
      return `${match[1]} 個專題符合篩選條件`;
    if ((match = key.match(/^(\d+) projects?$/))) return `${match[1]} 個專題`;
    if ((match = key.match(/^(\d{4}) month timeline$/)))
      return `${match[1]} 年月份時間軸`;
    if ((match = key.match(/^(High School|University) ([+−-])$/)))
      return `${translate(match[1])} ${match[2]}`;
    if ((match = key.match(/^Show (.+)$/))) return `顯示${translate(match[1])}`;
    if ((match = key.match(/^Enlarge image: (.+)$/)))
      return `放大圖片：${translate(match[1])}`;
    if ((match = key.match(/^Appearance: (Light|Dark|System)$/)))
      return `外觀：${translate(match[1])}`;
    if ((match = key.match(/^Language: (.+)$/)))
      return `語言：${match[1] === "English" ? "英文" : "繁體中文"}`;
    if (key.includes(" | "))
      return key
        .split(" | ")
        .map((part) => translate(part))
        .join(" | ");
    return names(key);
  }
  return translate;
}
