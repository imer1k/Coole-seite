const timelineData = [
  { id: "y2016", year: "2016", title: "Der erste Prototyp glüht" },
  { id: "y2017", year: "2017", title: "Glasflächen treffen auf Klang" },
  { id: "y2018", year: "2018", title: "Die Aurora wird zum System" },
  { id: "y2019", year: "2019", title: "Parallax in drei Ebenen" },
  { id: "y2020", year: "2020", title: "Remote, aber verbunden" },
  { id: "y2021", year: "2021", title: "Interaktive Kapitel" },
  { id: "y2022", year: "2022", title: "Neon trifft Nachhaltigkeit" },
  { id: "y2023", year: "2023", title: "Neue Kapitel, neue Stimmen" },
  { id: "y2024", year: "2024", title: "Die Chronik wird modular" },
  { id: "y2025", year: "2025", title: "Ein neues Kapitel beginnt" }
];

const sections = Array.from(document.querySelectorAll("[data-section]"));
const revealItems = document.querySelectorAll("[data-reveal]");
const minimapLinks = Array.from(document.querySelectorAll(".minimap a"));
const progressBar = document.querySelector(".scroll-progress__bar");
const progressContainer = document.querySelector(".scroll-progress");
const parallaxLayers = Array.from(document.querySelectorAll("[data-depth]"));
const motionToggle = document.querySelector("[data-motion-toggle]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeSectionId = sections[0]?.id ?? null;
let reduceMotion = false;
let parallaxRaf = null;
let parallaxEnabled = true;

const focusableInputs = ["INPUT", "TEXTAREA", "SELECT", "BUTTON"];

const getStoredMotionPreference = () => {
  const stored = localStorage.getItem("reduce-motion");
  if (stored === null) {
    return null;
  }
  return stored === "true";
};

const setReduceMotion = (value) => {
  reduceMotion = value;
  document.body.classList.toggle("reduce-motion", reduceMotion);
  motionToggle.setAttribute("aria-pressed", reduceMotion);
  localStorage.setItem("reduce-motion", String(reduceMotion));
  parallaxEnabled = !reduceMotion;
  if (!parallaxEnabled) {
    stopParallax();
    resetParallax();
  } else if (!document.hidden) {
    startParallax();
  }
};

const applyMotionPreference = () => {
  const stored = getStoredMotionPreference();
  if (stored === null) {
    setReduceMotion(prefersReducedMotion.matches);
  } else {
    setReduceMotion(stored);
  }
};

const updateProgressBar = () => {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
  progressBar.style.transform = `scaleX(${progress})`;
  progressContainer.setAttribute("aria-valuenow", Math.round(progress * 100));
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.35 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const setActiveLink = (id) => {
  minimapLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.link === id);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSectionId = entry.target.id;
        setActiveLink(activeSectionId);
      }
    });
  },
  { rootMargin: "-20% 0px -55% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

const scrollToSection = (id) => {
  const target = document.getElementById(id);
  if (!target) return;
  const behavior = reduceMotion ? "auto" : "smooth";
  target.scrollIntoView({ behavior, block: "start" });
  history.replaceState(null, "", `#${id}`);
};

minimapLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const id = link.getAttribute("href").replace("#", "");
    scrollToSection(id);
  });
});

document.querySelectorAll("a[href^='#']").forEach((link) => {
  if (link.closest(".minimap")) return;
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href").replace("#", "");
    if (!id) return;
    event.preventDefault();
    scrollToSection(id);
  });
});

const resetParallax = () => {
  parallaxLayers.forEach((layer) => {
    layer.style.transform = "translate3d(0, 0, 0)";
  });
};

const runParallax = () => {
  if (!parallaxEnabled || document.hidden) {
    parallaxRaf = null;
    return;
  }
  const scrollY = window.scrollY;
  parallaxLayers.forEach((layer) => {
    const depth = Number(layer.dataset.depth) || 0;
    const translateY = scrollY * depth;
    layer.style.transform = `translate3d(0, ${translateY}px, 0)`;
  });
  parallaxRaf = requestAnimationFrame(runParallax);
};

const startParallax = () => {
  if (parallaxRaf === null) {
    parallaxRaf = requestAnimationFrame(runParallax);
  }
};

const stopParallax = () => {
  if (parallaxRaf !== null) {
    cancelAnimationFrame(parallaxRaf);
    parallaxRaf = null;
  }
};

const handleKeyNavigation = (event) => {
  if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
  const activeElement = document.activeElement;
  if (activeElement && focusableInputs.includes(activeElement.tagName)) return;

  event.preventDefault();
  const currentIndex = sections.findIndex((section) => section.id === activeSectionId);
  const nextIndex = event.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;
  const target = sections[Math.max(0, Math.min(sections.length - 1, nextIndex))];
  if (target) {
    scrollToSection(target.id);
  }
};

document.addEventListener("keydown", handleKeyNavigation);

window.addEventListener("scroll", () => {
  updateProgressBar();
});

prefersReducedMotion.addEventListener("change", () => {
  const stored = getStoredMotionPreference();
  if (stored === null) {
    setReduceMotion(prefersReducedMotion.matches);
  }
});

motionToggle.addEventListener("click", () => {
  setReduceMotion(!reduceMotion);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopParallax();
  } else if (parallaxEnabled) {
    startParallax();
  }
});

applyMotionPreference();
updateProgressBar();
setActiveLink(activeSectionId);
startParallax();

window.addEventListener("load", () => {
  const hash = window.location.hash.replace("#", "");
  if (hash) {
    scrollToSection(hash);
  }
});

if (!reduceMotion) {
  document.documentElement.style.scrollBehavior = "smooth";
}

console.info("Timeline ready", timelineData);
