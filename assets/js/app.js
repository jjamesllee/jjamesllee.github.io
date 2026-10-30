import { initializeRecentGallery } from "./features/recent-gallery.js";
import { initializeAppearance } from "./features/appearance.js";
import { initializeProjectFilters } from "./features/project-filters.js";
import { initializeTimeline } from "./features/timeline.js";
import { initializeSectionIndex } from "./features/section-index.js";
import { initializeSidebar } from "./features/sidebar.js";
import { initializeLightbox } from "./features/lightbox.js";
import { initializeNavigation } from "./features/navigation.js";
import { initializeLocalization } from "./localization.js";
import { initializeMotion } from "./core/motion.js";
import { initializePopovers } from "./features/popovers.js";

document.documentElement.classList.add("js-enabled");
initializeMotion();
initializeAppearance();
initializeProjectFilters();
initializeTimeline();
initializeSectionIndex();
initializeSidebar();
initializeLightbox();
initializeNavigation();
initializeLocalization();
initializePopovers();

initializeRecentGallery();
