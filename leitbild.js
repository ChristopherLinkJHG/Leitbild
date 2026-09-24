const leitbild = [
  {
    id: "vielfalt",
    title: "Vielfalt leben & Gemeinschaft wertschätzen",
    items: [
      "Gemeinsames Lernen verschiedener Herkunftsgruppen",
      "Partnerklassen des Wilhelm-Löhe-Zentrums"
    ],
    position: "orbit-top",
    expandDirection: "up",
    prototype: true
  },
  {
    id: "chancen",
    title: "Chancen schaffen & Zukunft gestalten",
    items: ["Individuelle Unterstützungsprogramme", "Heidenhain-Stipendium"],
    position: "orbit-upper-left",
    expandDirection: "up-left",
    prototype: true
  },
  {
    id: "leistung",
    title: "Leistung fordern & Talente fördern",
    items: [
      "Wettbewerbe, Kreativ-, Forscher- & Sportpaket",
      "Wahlunterricht",
      "Begabtenprogramme"
    ],
    position: "orbit-left",
    expandDirection: "left-down",
    prototype: true
  },
  {
    id: "verantwortung",
    title: "Verantwortung übernehmen & selbstgesteuert lernen",
    items: [
      "Qualitätsvolles Lernen und Lehren",
      "SMV, Umwelt- und Fair Trade Schule",
      "Sanitätsdienst",
      "Lerncoaching"
    ],
    position: "orbit-lower-left",
    expandDirection: "down-left",
    prototype: true
  },
  {
    id: "digitalisierung",
    title: "Digitalisierung & Innovationen nutzen",
    items: ["Moderne Fachräume und Sportstätten", "Hervorragende Ausstattung"],
    position: "orbit-bottom",
    expandDirection: "down",
    prototype: true
  },
  {
    id: "kontakte",
    title: "Kontakte im In- & Ausland pflegen",
    items: [
      "Zusammenarbeit mit außerschulischen Partnern",
      "Schüleraustausch mit Frankreich und Italien",
      "Erasmus+"
    ],
    position: "orbit-lower-right",
    expandDirection: "down-right",
    prototype: true
  }
];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let activeId = null;
let hoveredId = null;
let hoverExitTimer = null;
const closingTimers = new Map();

function createCard(topic, className = "topic-card") {
  const card = document.createElement("article");
  card.className = className;
  card.dataset.cardFor = topic.id;
  card.setAttribute("aria-hidden", "true");

  const title = document.createElement("h2");
  title.textContent = topic.title;
  card.append(title);

  const list = document.createElement("ul");
  topic.items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    list.append(listItem);
  });
  card.append(list);
  return card;
}

function createTopic(topic) {
  const wrapper = document.createElement("div");
  wrapper.className = `topic topic--${topic.position} topic--${topic.expandDirection}${topic.prototype ? " topic--prototype" : ""}`;
  wrapper.dataset.topic = topic.id;

  const trigger = document.createElement("div");
  trigger.className = "topic-trigger";
  trigger.dataset.topic = topic.id;
  trigger.setAttribute("role", "button");
  trigger.setAttribute("tabindex", "0");
  trigger.setAttribute("aria-label", topic.title);
  trigger.setAttribute("aria-expanded", "false");
  trigger.innerHTML = '<span aria-hidden="true"></span>';
  trigger.append(createCard(topic));
  wrapper.append(trigger);
  return wrapper;
}

function setActive(id) {
  const scrollTop = window.scrollY;
  activeId = activeId === id ? null : id;
  hoveredId = null;
  updateState();
  window.scrollTo(0, scrollTop);
  window.requestAnimationFrame(() => window.scrollTo(0, scrollTop));
}

function updateState() {
  document.querySelectorAll(".topic").forEach((topicElement) => {
    const id = topicElement.dataset.topic;
    const isActive = activeId === id;
    const isVisible = isActive || hoveredId === id;
    const wasVisible = topicElement.classList.contains("is-visible");
    topicElement.classList.toggle("is-active", isActive);
    topicElement.classList.toggle("is-visible", isVisible);
    if (isVisible) {
      topicElement.classList.remove("is-closing");
      window.clearTimeout(closingTimers.get(id));
      closingTimers.delete(id);
    } else if (wasVisible) {
      topicElement.classList.add("is-closing");
      window.clearTimeout(closingTimers.get(id));
      closingTimers.set(id, window.setTimeout(() => {
        topicElement.classList.remove("is-closing");
        closingTimers.delete(id);
      }, 560));
    }
    const trigger = topicElement.querySelector(".topic-trigger");
    trigger.setAttribute("aria-expanded", String(isActive));
    const card = topicElement.querySelector(".topic-card");
    card.setAttribute("aria-hidden", String(!isVisible));
  });

  const mobilePanel = document.querySelector(".mobile-panel");
  if (!mobilePanel) return;
  mobilePanel.replaceChildren();
  if (activeId) {
    const topic = leitbild.find((entry) => entry.id === activeId);
    mobilePanel.append(createCard(topic, "topic-card topic-card--mobile"));
    mobilePanel.querySelector(".topic-card").setAttribute("aria-hidden", "false");
  }
  mobilePanel.classList.toggle("has-content", Boolean(activeId));
}

function shouldUseCompactFallback() {
  const smallScreen = window.matchMedia("(max-width: 760px)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const noHover = window.matchMedia("(hover: none)").matches || !window.matchMedia("(hover: hover)").matches;
  const veryShortViewport = window.innerHeight < 500;
  return smallScreen || coarsePointer || noHover || veryShortViewport;
}

function redirectToCompactFallback(reason) {
  const targetUrl = new URL("leitbild-kompakt.html", window.location.href);
  targetUrl.searchParams.set("fallback", "interactive");
  targetUrl.searchParams.set("reason", reason);
  window.location.replace(targetUrl.toString());
}

function initialiseInteractivePage() {
  const stage = document.querySelector(".logo-stage");
  if (!stage) return;
  if (shouldUseCompactFallback()) {
    const reason = window.matchMedia("(pointer: coarse)").matches
      ? "coarse-pointer"
      : window.matchMedia("(hover: none)").matches || !window.matchMedia("(hover: hover)").matches
        ? "no-hover"
        : window.innerHeight < 500
          ? "short-height"
          : "small-screen";
    redirectToCompactFallback(reason);
    return;
  }
  initialiseMobileChoice();
  leitbild.forEach((topic) => stage.append(createTopic(topic)));

  document.querySelectorAll(".topic").forEach((topicElement) => {
    const id = topicElement.dataset.topic;
    const trigger = topicElement.querySelector(".topic-trigger");
    trigger.addEventListener("click", () => setActive(id));
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActive(id);
      }
    });
    topicElement.addEventListener("pointerenter", () => {
      window.clearTimeout(hoverExitTimer);
      hoveredId = id;
      updateState();
    });
    topicElement.addEventListener("pointerleave", () => {
      window.clearTimeout(hoverExitTimer);
      hoverExitTimer = window.setTimeout(() => {
        if (!activeId) {
          hoveredId = null;
          updateState();
        }
      }, 260);
    });
    topicElement.addEventListener("focusin", () => {
      hoveredId = id;
      updateState();
    });
    topicElement.addEventListener("focusout", (event) => {
      if (!topicElement.contains(event.relatedTarget)) {
        hoveredId = null;
        updateState();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeId) {
      activeId = null;
      updateState();
    }
  });
  reducedMotion.addEventListener?.("change", updateState);
  updateState();
}

function initialiseMobileChoice() {
  const dialog = document.querySelector(".mobile-choice");
  if (!dialog || !window.matchMedia("(max-width: 700px)").matches) return;
  let hasChosen = false;
  try {
    hasChosen = sessionStorage.getItem("leitbild-mobile-choice") === "done";
  } catch {
    hasChosen = false;
  }
  if (hasChosen) return;
  dialog.addEventListener("close", () => {
    try {
      sessionStorage.setItem("leitbild-mobile-choice", "done");
    } catch {
      // Session storage may be unavailable for local files.
    }
  }, { once: true });
  dialog.showModal();
}

function initialiseCompactPage() {
  const list = document.querySelector(".compact-list");
  const disclaimer = document.querySelector(".compact-disclaimer");
  const params = new URLSearchParams(window.location.search);
  const fallbackReason = params.get("fallback");

  if (disclaimer && fallbackReason === "interactive") {
    disclaimer.hidden = false;
    const reasonText = {
      "small-screen": "Die interaktive Leitbildansicht funktioniert auf diesem Bildschirm nicht zuverlässig genug, weil die Fläche zu klein ist.",
      "coarse-pointer": "Die interaktive Leitbildansicht funktioniert auf diesem Gerät nicht zuverlässig genug, weil die Bedienung ohne präzise Hover-Interaktion kaum möglich ist.",
      "no-hover": "Die interaktive Leitbildansicht funktioniert auf diesem Gerät nicht zuverlässig genug, weil keine Hover-Bedienung zur Verfügung steht.",
      "short-height": "Die interaktive Leitbildansicht funktioniert auf diesem Bildschirm nicht zuverlässig genug, weil die vertikale Fläche zu klein ist."
    }[params.get("reason") || "small-screen"] || "Die interaktive Leitbildansicht funktioniert auf diesem Bildschirm nicht zuverlässig genug.";
    disclaimer.innerHTML = `<strong>Hinweis:</strong> ${reasonText} Deshalb wird hier die kompakte Darstellung angezeigt.`;
  }

  if (!list) return;
  leitbild.forEach((topic) => {
    const section = document.createElement("section");
    section.className = "compact-topic";
    const title = document.createElement("h2");
    title.textContent = topic.title;
    section.append(title);
    const items = document.createElement("ul");
    topic.items.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      items.append(listItem);
    });
    section.append(items);
    list.append(section);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initialiseInteractivePage();
  initialiseCompactPage();
});