import { motion } from "../core/motion.js";

export const initializeTimeline = () => {
  const layout = document.querySelector("[data-timeline-layout]");
  const board = document.querySelector("[data-timeline-board]");
  const detail = document.querySelector("[data-timeline-detail]");
  const stages = [...document.querySelectorAll("[data-timeline-stage]")];
  const months = [...document.querySelectorAll("[data-timeline-month]")];
  const edgeButtons = [...document.querySelectorAll("[data-timeline-edge]")];
  const scrollProgress = document.querySelector(
    "[data-timeline-scroll-progress]",
  );
  const toast = document.querySelector("[data-timeline-toast]");

  if (!layout || !board || !detail || stages.length === 0) return;
  if (!layout.hasAttribute("data-timeline-drawer")) return;

  const world = document.createElement("div");
  world.className = "timeline-world";
  world.append(
    board.querySelector(".timeline-section-bar"),
    board.querySelector(".timeline-track"),
  );
  board.prepend(world);
  detail.tabIndex = -1;
  const closeButton = detail.querySelector("[data-timeline-close]");
  const detailDate = detail.querySelector("[data-timeline-detail-date]");
  const detailTitle = detail.querySelector("[data-timeline-detail-title]");
  const detailContent = detail.querySelector("[data-timeline-detail-content]");
  const detailToggle = document.createElement("button");
  detailToggle.type = "button";
  detailToggle.className = "timeline-detail__toggle";
  detailToggle.setAttribute("aria-controls", "timeline-detail-content");
  detailContent.id = "timeline-detail-content";
  detailToggle.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  let detailCollapsed = false;
  function renderDetailState() {
    detail.classList.toggle("is-collapsed", detailCollapsed);
    detailToggle.setAttribute("aria-expanded", String(!detailCollapsed));
    const label = detailCollapsed ? "Expand details" : "Collapse details";
    detailToggle.setAttribute("aria-label", label);
    detailToggle.title = label;
  }
  detailToggle.addEventListener("click", () => {
    detailCollapsed = !detailCollapsed;
    renderDetailState();
  });
  detail.prepend(detailToggle);
  renderDetailState();
  let activeStage = null;
  let activeDetailTrigger = null;
  let toastTimer = null;
  let toastAnimation = null;
  let resizeFrame = null;
  let momentumFrame = null;
  let dragState = null;
  let suppressClick = false;
  let progressFrame = null;

  const updateTimelineSize = () => {
    const openBranch = board.querySelector(
      "[data-timeline-branch-panel]:not([hidden])",
    );
    const trackHeight = Math.max(
      168,
      openBranch ? openBranch.scrollHeight + 250 : 0,
    );
    board.style.setProperty("--timeline-track-height", trackHeight + "px");
    board.style.setProperty(
      "--timeline-top-space",
      Math.max(
        board.clientHeight * 0.6,
        (board.clientHeight - trackHeight - 76) / 2,
      ) + "px",
    );
    world.style.minHeight =
      Math.max(trackHeight + board.clientHeight * 2, board.clientHeight * 3) +
      "px";
  };

  const queueTimelineResize = () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(updateTimelineSize);
  };

  const updateScrollProgress = () => {
    board.style.backgroundPosition = `${-board.scrollLeft}px ${-board.scrollTop}px`;
    const maximumScroll = board.scrollWidth - board.clientWidth;
    const progress = maximumScroll > 0 ? board.scrollLeft / maximumScroll : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
  };

  const showToast = (message) => {
    window.clearTimeout(toastTimer);
    toastAnimation?.cancel();
    toast.textContent = message;
    toast.hidden = false;
    const instant = motion.reduced;
    if (!instant) {
      toastAnimation = toast.animate(
        [
          { opacity: 0, transform: "translate(-50%, -1.5rem)" },
          { opacity: 1, transform: "translate(-50%, 0)" },
        ],
        {
          duration: motion.duration("menu"),
          easing: "cubic-bezier(.22,1,.36,1)",
        },
      );
    }
    toastTimer = window.setTimeout(() => {
      if (motion.reduced) {
        toast.hidden = true;
        return;
      }
      toastAnimation = toast.animate(
        [
          { opacity: 1, transform: "translate(-50%, 0)" },
          { opacity: 0, transform: "translate(-50%, -1.5rem)" },
        ],
        {
          duration: motion.duration("fade"),
          easing: "ease-in",
          fill: "forwards",
        },
      );
      toastAnimation.finished
        .then(() => {
          toast.hidden = true;
        })
        .catch(() => {});
    }, 3200);
  };

  const panelAnimations = new WeakMap();
  function showPanel(panel) {
    panelAnimations.get(panel)?.cancel();
    panel.hidden = false;
    if (!motion.reduced) {
      const animation = panel.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: motion.duration("spatial"),
          easing: "cubic-bezier(.22,1,.36,1)",
        },
      );
      panelAnimations.set(panel, animation);
    }
  }
  function hidePanel(panel, finished = () => {}) {
    panelAnimations.get(panel)?.cancel();
    if (panel.hidden || motion.reduced) {
      panel.hidden = true;
      finished();
      return;
    }
    const animation = panel.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: motion.duration("reveal"),
      easing: "ease-in-out",
    });
    panelAnimations.set(panel, animation);
    animation.finished
      .then(() => {
        panel.hidden = true;
        finished();
      })
      .catch(() => {});
  }
  const hideDetail = () => {
    hidePanel(detail, () => {
      layout.classList.remove("timeline-layout--detail-open");
      queueTimelineResize();
    });
    months.forEach((trigger) => {
      trigger.classList.remove("is-active");
      trigger.setAttribute("aria-expanded", "false");
    });
    activeDetailTrigger = null;
    queueTimelineResize();
  };

  const closeAll = (restoreFocus = true) => {
    const focusTarget = activeStage || activeDetailTrigger;
    hideDetail();

    stages.forEach((stage) => {
      const branch = document.querySelector(`#${stage.dataset.timelineBranch}`);
      hidePanel(branch, queueTimelineResize);
      stage.classList.remove("is-active");
      stage.setAttribute("aria-expanded", "false");
      stage.querySelector("[data-timeline-stage-action]").textContent =
        "Show months +";
    });

    activeStage = null;
    queueTimelineResize();
    if (restoreFocus && focusTarget) focusTarget.focus({ preventScroll: true });
  };

  const showDetail = (trigger) => {
    const template = document.querySelector(
      `#${trigger.dataset.timelineTemplate}`,
    );
    if (!template) return;

    const isSameDetail = activeDetailTrigger === trigger && !detail.hidden;
    months.forEach((month) => {
      const isActive = month === trigger && !isSameDetail;
      month.classList.toggle("is-active", isActive);
      month.setAttribute("aria-expanded", String(isActive));
    });

    if (isSameDetail) {
      hideDetail();
      return;
    }

    activeDetailTrigger = trigger;
    detailDate.textContent = trigger.dataset.timelineDate;
    detailTitle.textContent = trigger.dataset.timelineTitle;
    detailContent.replaceChildren(template.content.cloneNode(true));
    detail.scrollTop = 0;
    if (trigger.hasAttribute("data-timeline-month")) {
      const back = document.createElement("button");
      back.type = "button";
      back.className = "timeline-detail-back";
      back.textContent = "← Back to year";
      back.addEventListener("click", () => {
        const parent = trigger
          .closest(".timeline-stage")
          ?.querySelector("[data-timeline-stage]");
        if (parent) showDetail(parent);
      });
      detailDate.before(back);
    }
    detail
      .querySelectorAll(".timeline-detail-back")
      .forEach((button, i, list) => {
        if (!trigger.hasAttribute("data-timeline-month") || i < list.length - 1)
          button.remove();
      });
    showPanel(detail);
    layout.classList.add("timeline-layout--detail-open");
    requestAnimationFrame(centerActiveCard);
    queueTimelineResize();
    requestAnimationFrame(() => {
      fitTimelineSections();
    });
  };

  stages.forEach((stage) => {
    stage.addEventListener("click", () => {
      const isOpen =
        stage === activeStage && stage.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeAll();
        return;
      }

      closeAll(false);
      const branch = document.querySelector(`#${stage.dataset.timelineBranch}`);
      showPanel(branch);
      stage.setAttribute("aria-expanded", "true");
      stage.classList.add("is-active");
      stage.querySelector("[data-timeline-stage-action]").textContent =
        "Hide months −";
      activeStage = stage;
      showDetail(stage);
      window.requestAnimationFrame(() => {
        queueTimelineResize();
      });
    });
  });

  months.forEach((month) =>
    month.addEventListener("click", () => showDetail(month)),
  );
  detailContent.addEventListener("click", (event) => {
    const link = event.target.closest("[data-month-jump]");
    if (!link) return;
    event.preventDefault();
    const month = months.find(
      (item) => item.dataset.timelineTemplate === link.dataset.monthJump,
    );
    if (month) {
      showDetail(month);
      detail.focus({ preventScroll: true });
    }
  });
  document.addEventListener(
    "click",
    (event) => {
      const clickedEdge =
        event.target instanceof Element
          ? event.target.closest("[data-timeline-edge]")
          : null;
      let collapsed = false;
      edgeButtons.forEach((button) => {
        if (
          button === clickedEdge ||
          button.getAttribute("aria-expanded") !== "true"
        )
          return;
        const direction = button.dataset.timelineEdge;
        button.setAttribute("aria-expanded", "false");
        board.classList.remove(`is-${direction}-revealed`);
        document.querySelector(
          `[data-timeline-edge-label="${direction}"]`,
        ).hidden = true;
        collapsed = true;
      });
      if (collapsed) {
        window.clearTimeout(toastTimer);
        toast.hidden = true;
      }
    },
    true,
  );
  edgeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.timelineEdge;
      const isOpen = button.getAttribute("aria-expanded") === "true";
      const label = document.querySelector(
        `[data-timeline-edge-label="${direction}"]`,
      );

      button.setAttribute("aria-expanded", String(!isOpen));
      board.classList.toggle(`is-${direction}-revealed`, !isOpen);
      label.hidden = isOpen;

      if (isOpen) {
        toast.hidden = true;
        return;
      }

      showToast(button.dataset.timelineMessage);
    });
  });
  board.addEventListener(
    "scroll",
    () => {
      if (progressFrame !== null) return;
      progressFrame = window.requestAnimationFrame(() => {
        updateScrollProgress();
        progressFrame = null;
      });
    },
    { passive: true },
  );

  const stopMomentum = () => {
    window.cancelAnimationFrame(momentumFrame);
    momentumFrame = null;
  };

  motion.onChange((reduced) => {
    if (reduced) stopMomentum();
  });

  const finishDrag = (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const { moved, velocityX, velocityY, lastTime } = dragState;
    dragState = null;
    board.classList.remove("is-dragging");

    if (board.hasPointerCapture(event.pointerId))
      board.releasePointerCapture(event.pointerId);
    if (!moved) return;

    suppressClick = true;
    window.setTimeout(() => {
      suppressClick = false;
    }, 80);

    if (
      event.type === "pointercancel" ||
      performance.now() - lastTime > 100 ||
      motion.reduced
    )
      return;

    let momentumX = velocityX;
    let momentumY = velocityY;
    let previousFrame = performance.now();
    const glide = (time) => {
      const frameRatio = Math.min((time - previousFrame) / (1000 / 60), 3);
      previousFrame = time;
      const decay = Math.pow(0.92, frameRatio);
      momentumX *= decay;
      momentumY *= decay;
      board.scrollLeft += momentumX * frameRatio;
      board.scrollTop += momentumY * frameRatio;

      if (Math.abs(momentumX) > 0.25 || Math.abs(momentumY) > 0.25) {
        momentumFrame = window.requestAnimationFrame(glide);
      } else {
        momentumFrame = null;
      }
    };

    momentumFrame = window.requestAnimationFrame(glide);
  };

  board.addEventListener("pointerdown", (event) => {
    if (
      (event.pointerType !== "mouse" &&
        !layout.classList.contains("is-fullscreen")) ||
      event.button !== 0
    )
      return;
    stopMomentum();
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: board.scrollLeft,
      scrollTop: board.scrollTop,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocityX: 0,
      velocityY: 0,
      moved: false,
    };
  });

  board.addEventListener("pointermove", (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    if (!dragState.moved && Math.hypot(deltaX, deltaY) < 5) return;

    event.preventDefault();
    if (!dragState.moved) board.setPointerCapture(event.pointerId);
    dragState.moved = true;
    board.classList.add("is-dragging");
    board.scrollLeft = dragState.scrollLeft - deltaX;
    board.scrollTop = dragState.scrollTop - deltaY;

    const now = performance.now();
    const elapsed = Math.max(now - dragState.lastTime, 1);
    dragState.velocityX = ((dragState.lastX - event.clientX) / elapsed) * 16;
    dragState.velocityY = ((dragState.lastY - event.clientY) / elapsed) * 16;
    dragState.lastX = event.clientX;
    dragState.lastY = event.clientY;
    dragState.lastTime = now;
  });

  board.addEventListener("pointerup", finishDrag);
  board.addEventListener("pointercancel", finishDrag);
  board.addEventListener(
    "wheel",
    (event) => {
      stopMomentum();
      if (
        board.scrollWidth > board.clientWidth &&
        (event.shiftKey || board.scrollHeight <= board.clientHeight + 1)
      ) {
        event.preventDefault();
        board.scrollLeft += event.deltaX || event.deltaY;
      }
    },
    { passive: false },
  );
  board.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    },
    true,
  );

  detail.addEventListener("toggle", queueTimelineResize, true);
  window.addEventListener("resize", queueTimelineResize);
  closeButton.addEventListener("click", () => closeAll());
  document.addEventListener("keydown", (event) => {
    if (
      !event.defaultPrevented &&
      event.key === "Escape" &&
      !document.querySelector(".lightbox[open]") &&
      (activeStage || !detail.hidden)
    ) {
      event.preventDefault();
      closeAll();
    }
  });

  const expandButton = document.createElement("button");
  expandButton.type = "button";
  expandButton.className =
    "timeline-drawer-handle timeline-drawer-handle--open";
  expandButton.setAttribute("aria-expanded", "false");
  expandButton.setAttribute("aria-label", "Explore my full timeline");
  expandButton.setAttribute("aria-controls", layout.id);
  expandButton.innerHTML =
    '<span class="timeline-drawer-handle__line" aria-hidden="true"></span><span class="timeline-drawer-handle__label">Explore my full timeline</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>';
  document.body.append(expandButton);
  const exitButton = document.createElement("button");
  exitButton.type = "button";
  exitButton.className = "timeline-drawer-handle timeline-drawer-handle--close";
  exitButton.setAttribute("aria-label", "Back to Experiences");
  exitButton.innerHTML =
    '<span class="timeline-drawer-handle__line" aria-hidden="true"></span><span class="timeline-drawer-handle__label">Back to Experiences</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  exitButton.hidden = true;
  layout.prepend(exitButton);
  let viewAnimation;
  const main = document.querySelector("main");
  let drawerOpen = false;

  function scrollToLatest() {
    const cards = stages.filter(
      (stage) => !stage.closest(".timeline-stage").hidden,
    );
    const bounds = cards.map((card) => card.getBoundingClientRect());
    if (!bounds.length) return;
    const viewport = board.getBoundingClientRect();
    const left = Math.min(...bounds.map((rect) => rect.left));
    const right = Math.max(...bounds.map((rect) => rect.right));
    const top = Math.min(...bounds.map((rect) => rect.top));
    const bottom = Math.max(...bounds.map((rect) => rect.bottom));
    const headerBottom =
      document.querySelector(".topbar")?.getBoundingClientRect().bottom ??
      viewport.top;
    board.scrollLeft +=
      (left + right) / 2 - (viewport.left + viewport.right) / 2;
    board.scrollTop +=
      (top + bottom) / 2 -
      (Math.max(viewport.top, headerBottom) + viewport.bottom) / 2;
    updateScrollProgress();
  }
  function setExpanded(expanded) {
    if (drawerOpen === expanded) return;
    drawerOpen = expanded;
    viewAnimation?.cancel();
    expandButton.setAttribute("aria-expanded", String(expanded));
    if (expanded) {
      stopMomentum();
      dragState = null;
      suppressClick = false;
      board.classList.remove(
        "is-dragging",
        "is-past-revealed",
        "is-future-revealed",
      );
      [
        detail,
        ...board.querySelectorAll("[data-timeline-branch-panel]"),
      ].forEach((panel) => {
        panelAnimations.get(panel)?.cancel();
        panel.hidden = true;
      });
      activeStage = null;
      activeDetailTrigger = null;
      layout.classList.remove("timeline-layout--detail-open");
      stages.forEach((stage) => {
        stage.classList.remove("is-active");
        stage.setAttribute("aria-expanded", "false");
        stage.querySelector("[data-timeline-stage-action]").textContent =
          "Show months +";
      });
      months.forEach((month) => month.setAttribute("aria-expanded", "false"));
      groups.forEach((group) => (group.manual = null));
      edgeButtons.forEach((button) =>
        button.setAttribute("aria-expanded", "false"),
      );
      board
        .querySelectorAll("[data-timeline-edge-label]")
        .forEach((label) => (label.hidden = true));
      window.clearTimeout(toastTimer);
      toastAnimation?.cancel();
      toast.hidden = true;
      layout.append(toast);
      document.body.append(layout);
      layout.hidden = false;
      document.body.classList.add("process-expanded");
      main.inert = true;
      expandButton.hidden = true;
      exitButton.hidden = false;
      fitTimelineSections();
      updateTimelineSize();
      requestAnimationFrame(() => {
        updateTimelineSize();
        scrollToLatest();
      });
      board.focus({ preventScroll: true });
    }
    const finishClose = () => {
      if (drawerOpen) return;
      layout.hidden = true;
      document.body.classList.remove("process-expanded");
      main.inert = false;
      expandButton.hidden = false;
      exitButton.hidden = true;
      expandButton.focus({ preventScroll: true });
    };
    if (!motion.reduced) {
      viewAnimation = layout.animate(
        [
          { transform: expanded ? "translateY(100%)" : "translateY(0)" },
          { transform: expanded ? "translateY(0)" : "translateY(100%)" },
        ],
        {
          duration: motion.duration("drawer"),
          easing: "cubic-bezier(.22,1,.36,1)",
        },
      );
      if (!expanded) viewAnimation.finished.then(finishClose).catch(() => {});
    } else if (!expanded) finishClose();
  }
  expandButton.addEventListener("click", () => setExpanded(true));
  exitButton.addEventListener("click", () => setExpanded(false));
  document
    .querySelector(".social-sidebar")
    ?.addEventListener("click", (event) => {
      if (
        layout.classList.contains("is-fullscreen") &&
        event.target.closest('a[href^="#"]')
      )
        setExpanded(false);
    });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !event.defaultPrevented &&
      !document.querySelector(".lightbox[open]") &&
      layout.classList.contains("is-fullscreen") &&
      !activeStage &&
      detail.hidden
    ) {
      event.preventDefault();
      setExpanded(false);
    }
  });
  const latestStage = stages.reduce((latest, stage) =>
    Number(stage.dataset.timelineDate) > Number(latest.dataset.timelineDate)
      ? stage
      : latest,
  );
  const headers = [
    ...board.querySelectorAll(".timeline-section-bar__section[data-era]"),
  ];
  const currentEra = latestStage.closest("[data-era]").dataset.era;
  const groups = headers
    .filter((header) => header.dataset.era !== currentEra)
    .map((header) => {
      const era = header.dataset.era;
      const items = [
        ...board.querySelectorAll(`.timeline-stage[data-era="${era}"]`),
      ];
      const label = header.querySelector("strong").textContent;
      const summary = document.createElement("li");
      summary.className = "timeline-school-summary";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      summary.append(button);
      items[0].before(summary);
      const headerButton = document.createElement("button");
      headerButton.type = "button";
      header.replaceChildren(headerButton);
      const group = {
        items,
        summary,
        button,
        header,
        headerButton,
        label,
        expanded: true,
        manual: null,
      };
      function toggle() {
        group.manual = !group.expanded;
        applyGroup(group, group.manual);
        updateColumnCount();
        updateTimelineSize();
        requestAnimationFrame(() => {
          if (!motion.reduced)
            board
              .querySelector(".timeline-track")
              .animate([{ opacity: 0.3 }, { opacity: 1 }], {
                duration: motion.duration("spatial"),
                easing: "ease-out",
              });
        });
      }
      button.addEventListener("click", toggle);
      headerButton.addEventListener("click", toggle);
      return group;
    });
  function applyGroup(group, expanded) {
    if (!expanded && group.items.some((item) => item.contains(activeStage)))
      closeAll(false);
    group.expanded = expanded;
    group.items.forEach((item) => (item.hidden = !expanded));
    group.summary.hidden = expanded;
    group.button.setAttribute("aria-expanded", String(expanded));
    group.headerButton.setAttribute("aria-expanded", String(expanded));
    group.headerButton.textContent = `${group.label} ${expanded ? "−" : "+"}`;
    group.header.style.setProperty(
      "--section-span",
      expanded ? group.items.length : 1,
    );
  }
  function updateColumnCount() {
    const count =
      stages.length -
      groups.reduce((sum, g) => sum + (g.expanded ? 0 : g.items.length - 1), 0);
    board.style.setProperty("--timeline-count", count);
    return count;
  }
  function fitTimelineSections() {
    groups.forEach((group) =>
      applyGroup(
        group,
        group.manual ?? !matchMedia("(max-width: 60rem)").matches,
      ),
    );
    updateColumnCount();
  }
  function centerActiveCard() {
    const target = activeDetailTrigger || activeStage;
    if (!target || detail.hidden || !matchMedia("(max-width: 60rem)").matches)
      return;
    const card = target.getBoundingClientRect();
    const viewport = board.getBoundingClientRect();
    board.scrollLeft +=
      (card.left + card.right - viewport.left - viewport.right) / 2;
    board.scrollTop +=
      (card.top + card.bottom - viewport.top - viewport.bottom) / 2;
  }
  new ResizeObserver(() => {
    fitTimelineSections();
    requestAnimationFrame(() => {
      updateTimelineSize();
      centerActiveCard();
    });
  }).observe(board);
  new ResizeObserver(() => {
    layout.style.setProperty(
      "--detail-space",
      detail.hidden ? "0px" : detail.getBoundingClientRect().height + "px",
    );
  }).observe(detail);
  fitTimelineSections();
  updateScrollProgress();
  updateTimelineSize();
};
