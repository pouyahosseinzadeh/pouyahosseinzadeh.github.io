const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const menuLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section[id]");
const progressBar = document.querySelector("[data-scroll-progress]");
const revealItems = document.querySelectorAll("[data-reveal]");
const focusTabs = document.querySelectorAll("[data-focus-tab]");
const focusPanels = document.querySelectorAll("[data-focus-panel]");
const interactiveCards = document.querySelectorAll(".interactive-card");
const copyButton = document.querySelector("[data-copy-profile]");
const copyStatus = document.querySelector("[data-copy-status]");
const labInputs = document.querySelectorAll("[data-lab-input]");
const labValues = document.querySelectorAll("[data-lab-value]");
const labBars = document.querySelectorAll("[data-lab-bar]");
const scenarioButtons = document.querySelectorAll("[data-scenario]");
const riskRing = document.querySelector("[data-risk-ring]");
const riskScore = document.querySelector("[data-risk-score]");
const riskLabel = document.querySelector("[data-risk-label]");
const riskTitle = document.querySelector("[data-risk-title]");
const riskCopy = document.querySelector("[data-risk-copy]");

const scenarios = {
  quiet: {
    solar: 20,
    magnetic: 18,
    confidence: 88,
  },
  watch: {
    solar: 64,
    magnetic: 46,
    confidence: 78,
  },
  storm: {
    solar: 88,
    magnetic: 82,
    confidence: 61,
  },
};

const outlooks = [
  {
    max: 34,
    label: "Quiet",
    title: "Conditions look stable.",
    copy: "The modeled outlook favors normal monitoring with no strong disruption signal.",
    color: "#0f766e",
  },
  {
    max: 64,
    label: "Watch",
    title: "Signals deserve closer monitoring.",
    copy: "Current inputs suggest an elevated but manageable space-weather outlook.",
    color: "#b65f25",
  },
  {
    max: 100,
    label: "Storm",
    title: "Risk is high enough to plan around.",
    copy: "The combined signals point to a stronger disruption scenario for exposed technical systems.",
    color: "#b42318",
  },
];

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

const setScrollProgress = () => {
  if (!progressBar) {
    return;
  }

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
};

const closeMenu = () => {
  navLinks?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};

navToggle?.addEventListener("click", () => {
  const isOpen = navLinks?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  document.body.classList.toggle("menu-open", Boolean(isOpen));
});

menuLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

focusTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const selectedFocus = tab.dataset.focusTab;

    focusTabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-selected", String(isSelected));
    });

    focusPanels.forEach((panel) => {
      const isSelected = panel.dataset.focusPanel === selectedFocus;
      panel.classList.toggle("is-active", isSelected);
      panel.hidden = !isSelected;
    });
  });

  tab.addEventListener("keydown", (event) => {
    const currentIndex = Array.from(focusTabs).indexOf(tab);
    let nextIndex = currentIndex;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % focusTabs.length;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + focusTabs.length) % focusTabs.length;
    }

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      focusTabs[nextIndex].focus();
      focusTabs[nextIndex].click();
    }
  });
});

const labInputMap = Array.from(labInputs).reduce((map, input) => {
  map[input.dataset.labInput] = input;
  return map;
}, {});

const findOutlook = (risk) => outlooks.find((outlook) => risk <= outlook.max) || outlooks[outlooks.length - 1];

const setScenarioState = (activeScenario) => {
  scenarioButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.scenario === activeScenario);
  });
};

const updateLab = (activeScenario = "") => {
  if (!labInputs.length) {
    return;
  }

  const solar = Number(labInputMap.solar?.value || 0);
  const magnetic = Number(labInputMap.magnetic?.value || 0);
  const confidence = Number(labInputMap.confidence?.value || 0);
  const uncertainty = 100 - confidence;
  const risk = Math.round(solar * 0.42 + magnetic * 0.43 + uncertainty * 0.15);
  const outlook = findOutlook(risk);

  labValues.forEach((output) => {
    const key = output.dataset.labValue;
    output.value = labInputMap[key]?.value || "0";
    output.textContent = output.value;
  });

  labBars.forEach((bar) => {
    const key = bar.dataset.labBar;
    const value = Number(labInputMap[key]?.value || 0);
    bar.style.width = `${value}%`;
    bar.style.background = key === "confidence" ? "#0f766e" : outlook.color;
  });

  if (riskRing) {
    riskRing.style.setProperty("--risk-fill", `${risk}%`);
    riskRing.style.setProperty("--risk-color", outlook.color);
  }

  if (riskScore) {
    riskScore.textContent = String(risk);
  }

  if (riskLabel) {
    riskLabel.textContent = outlook.label;
    riskLabel.style.setProperty("--risk-color", outlook.color);
  }

  if (riskTitle) {
    riskTitle.textContent = outlook.title;
  }

  if (riskCopy) {
    riskCopy.textContent = outlook.copy;
  }

  setScenarioState(activeScenario);
};

labInputs.forEach((input) => {
  input.addEventListener("input", () => updateLab());
});

scenarioButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const scenario = scenarios[button.dataset.scenario];

    if (!scenario) {
      return;
    }

    Object.entries(scenario).forEach(([key, value]) => {
      if (labInputMap[key]) {
        labInputMap[key].value = String(value);
      }
    });

    updateLab(button.dataset.scenario);
  });
});

interactiveCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--y", `${event.clientY - rect.top}px`);
  });
});

copyButton?.addEventListener("click", async () => {
  const profileUrl = "https://pouyahosseinzadeh.github.io/";

  try {
    await navigator.clipboard.writeText(profileUrl);
    if (copyStatus) {
      copyStatus.textContent = "Profile link copied.";
    }
  } catch {
    if (copyStatus) {
      copyStatus.textContent = profileUrl;
    }
  }

  window.setTimeout(() => {
    if (copyStatus) {
      copyStatus.textContent = "";
    }
  }, 2600);
});

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        menuLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0,
    }
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -14% 0px",
      threshold: 0.14,
    }
  );

  sections.forEach((section) => navObserver.observe(section));
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

setHeaderState();
setScrollProgress();
updateLab("watch");
window.addEventListener(
  "scroll",
  () => {
    setHeaderState();
    setScrollProgress();
  },
  { passive: true }
);
window.addEventListener("resize", setScrollProgress);
