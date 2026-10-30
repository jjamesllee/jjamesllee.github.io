export function initializeSectionIndex() {
  const index = document.querySelector("[data-section-index]");
  const headings = [...document.querySelectorAll("main h2")].filter(
    (heading) =>
      !heading.closest(".project-card, .project-gallery-section, details"),
  );
  if (!headings.length) {
    const title = document.querySelector("main h1");
    if (title) headings.push(title);
  }
  const sectionLabels = {
    overview: "The problem",
    prototype: "Prototype demo",
    "design-selection": "Design decisions",
    "my-contribution": "My contribution",
    validation: "Testing & results",
    teamwork: "Teamwork & reflection",
    documents: "Project documents",
    "solar-challenge": "The challenge",
    "solar-strategy": "Strategy",
    "solar-contribution": "My contribution",
    "solar-results": "Simulation results",
    "solar-limits": "Lessons & limitations",
  };
  const sectionIndexSeen = new Set();
  const indexedHeadings = headings.filter((heading) => {
    const sectionId = heading.closest("section[id]")?.id;
    if (!sectionLabels[sectionId]) return true;
    if (sectionIndexSeen.has(sectionId)) return false;
    sectionIndexSeen.add(sectionId);
    return true;
  });
  indexedHeadings.forEach((heading, i) => {
    if (!heading.id)
      heading.id = `section-${i}-${heading.textContent
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}`;
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent =
      sectionLabels[heading.closest("section[id]")?.id] || heading.textContent;
    link.title = heading.textContent.trim();
    index?.append(link);
  });
  if (index && !headings.length) {
    const note = document.createElement("p");
    note.className = "sidebar-empty";
    note.textContent = "You are all caught up on this page.";
    index.append(note);
  }
  if (index && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            index
              .querySelectorAll("a")
              .forEach((a) => a.removeAttribute("aria-current"));
            index
              .querySelector(`a[href="#${entry.target.id}"]`)
              ?.setAttribute("aria-current", "location");
          }
        }),
      { rootMargin: "-15% 0px -65% 0px" },
    );
    indexedHeadings.forEach((h) => observer.observe(h));
  }
}
