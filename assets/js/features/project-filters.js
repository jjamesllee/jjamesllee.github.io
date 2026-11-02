import { motion } from "../core/motion.js";
import { createTranslator } from "./localization-patterns.js";

export const initializeProjectFilters = () => {
  const searchInput = document.querySelector("#project-search");
  const cards = [...document.querySelectorAll("[data-project-card]")];

  if (!searchInput || cards.length === 0) return;

  const translate = createTranslator(
    JSON.parse(document.querySelector("#locale-dictionary")?.textContent || "{}"),
  );
  const searchText = new Map(
    cards.map((card) => {
      const terms = JSON.parse(card.dataset.searchTerms || "[]").filter(Boolean);
      const translatedTerms = terms.map(translate).join(" ");
      return [card, `${card.dataset.search} ${translatedTerms}`.toLowerCase()];
    }),
  );

  const tagButtons = [...document.querySelectorAll("[data-project-tag]")];
  const groups = [...document.querySelectorAll("[data-project-group]")];
  const results = document.querySelector("#project-results");
  const noResults = document.querySelector("#project-no-results");
  const clearButton = document.querySelector("#project-filters-clear");
  const activeTags = new Set();
  const layoutButtons = [...document.querySelectorAll("[data-project-layout]")];
  const projectGroups = document.querySelector("#project-groups");
  function applyProjectLayout(layout, persist = false) {
    const boxed = layout === "boxed";
    projectGroups?.classList.toggle("is-boxed", boxed);
    layoutButtons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(
          button.dataset.projectLayout === (boxed ? "boxed" : "horizontal"),
        ),
      ),
    );
    if (persist) {
      try {
        localStorage.setItem(
          "portfolio-project-layout",
          boxed ? "boxed" : "horizontal",
        );
      } catch {}
      if (!motion.reduced) {
        cards
          .filter((card) => !card.hidden)
          .forEach((card) =>
            card.animate(
              [
                { opacity: 0.35, transform: "translateY(8px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              {
                duration: motion.duration("panel"),
                easing: "cubic-bezier(.22,1,.36,1)",
              },
            ),
          );
      }
    }
  }
  let savedLayout = "horizontal";
  try {
    savedLayout =
      localStorage.getItem("portfolio-project-layout") || savedLayout;
  } catch {}
  applyProjectLayout(savedLayout);
  layoutButtons.forEach((button) =>
    button.addEventListener("click", () =>
      applyProjectLayout(button.dataset.projectLayout, true),
    ),
  );

  const applyFilters = () => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleTotal = 0;

    const cardMatches = (card, requiredTags) => {
      const searchableText = searchText.get(card);
      const projectTags = new Set(card.dataset.tags.split(" ").filter(Boolean));
      const matchesSearch = query === "" || searchableText.includes(query);
      const matchesTags = [...requiredTags].every((tag) =>
        projectTags.has(tag),
      );

      return matchesSearch && matchesTags;
    };

    cards.forEach((card) => {
      const isVisible = cardMatches(card, activeTags);

      card.hidden = !isVisible;
      if (isVisible) visibleTotal += 1;
    });

    tagButtons.forEach((button) => {
      const tag = button.dataset.projectTag;
      const tagsWithoutCurrent = new Set(activeTags);
      tagsWithoutCurrent.delete(tag);
      tagsWithoutCurrent.add(tag);
      const hasMatchingProject = cards.some((card) =>
        cardMatches(card, tagsWithoutCurrent),
      );

      button.hidden = !activeTags.has(tag) && !hasMatchingProject;
    });

    groups.forEach((group) => {
      const groupCards = [...group.querySelectorAll("[data-project-card]")];
      const visibleCards = groupCards.filter((card) => !card.hidden);
      const count = group.querySelector("[data-project-count]");

      count.textContent = `${visibleCards.length} ${visibleCards.length === 1 ? "project" : "projects"}`;
      group.hidden = visibleCards.length === 0;

      if (visibleCards.length > 0 && (query || activeTags.size > 0)) {
        group.open = true;
      }
    });

    results.textContent =
      query || activeTags.size > 0
        ? `${visibleTotal} ${visibleTotal === 1 ? "project matches" : "projects match"} your filters`
        : `${cards.length} ${cards.length === 1 ? "project" : "projects"} total`;
    noResults.hidden = visibleTotal !== 0;
    clearButton.hidden = query === "" && activeTags.size === 0;
  };

  searchInput.addEventListener("input", applyFilters);
  document.addEventListener("portfolio-language-change", applyFilters);

  tagButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tag = button.dataset.projectTag;
      const isActive = activeTags.has(tag);

      if (isActive) activeTags.delete(tag);
      else activeTags.add(tag);

      button.setAttribute("aria-pressed", String(!isActive));
      applyFilters();
    });
  });

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    activeTags.clear();
    tagButtons.forEach((button) =>
      button.setAttribute("aria-pressed", "false"),
    );
    applyFilters();
    groups.forEach((group) => { group.open = false; });
    searchInput.focus();
  });

  applyFilters();
};
