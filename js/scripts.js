const HELIOGUARD_BASE_URL = "https://helioguard.onrender.com";

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
const refreshButton = document.querySelector("[data-hg-refresh]");

const helioguardFields = {
  connection: document.querySelector("[data-hg-connection]"),
  probability: document.querySelector("[data-hg-probability]"),
  prediction: document.querySelector("[data-hg-prediction]"),
  flare: document.querySelector("[data-hg-flare]"),
  flareTime: document.querySelector("[data-hg-flare-time]"),
  horizon: document.querySelector("[data-hg-horizon]"),
  threshold: document.querySelector("[data-hg-threshold]"),
  worker: document.querySelector("[data-hg-worker]"),
  modelState: document.querySelector("[data-hg-model-state]"),
  ring: document.querySelector("[data-hg-ring]"),
  ringValue: document.querySelector("[data-hg-ring-value]"),
  label: document.querySelector("[data-hg-label]"),
  title: document.querySelector("[data-hg-title]"),
  summary: document.querySelector("[data-hg-summary]"),
  allClear: document.querySelector("[data-hg-all-clear]"),
  generated: document.querySelector("[data-hg-generated]"),
  trainingSource: document.querySelector("[data-hg-training-source]"),
  rocAuc: document.querySelector("[data-hg-roc-auc]"),
  flux: document.querySelector("[data-hg-flux]"),
  lastRefresh: document.querySelector("[data-hg-last-refresh]"),
};

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

const setText = (element, value) => {
  if (element) {
    element.textContent = value;
  }
};

const formatPercent = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return `${Math.round(value * 100)}%`;
};

const formatNumber = (value, digits = 3) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return value.toFixed(digits);
};

const formatTime = (value) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLabel = (value) => {
  if (!value) {
    return "--";
  }

  return String(value).replace(/[-_]/g, " ");
};

const forecastColor = (forecast) => {
  const label = forecast?.prediction_label || "";

  if (forecast?.all_clear === true || label.includes("unlikely")) {
    return "#0f766e";
  }

  if (label.includes("likely")) {
    return "#b42318";
  }

  return "#b65f25";
};

const setConnectionState = (state, text) => {
  const connection = helioguardFields.connection;

  if (!connection) {
    return;
  }

  connection.textContent = text;
  connection.classList.toggle("is-loading", state === "loading");
  connection.classList.toggle("is-error", state === "error");
};

const summarizeForecast = (forecast) => {
  const label = formatLabel(forecast.prediction_label);
  const flare = forecast.trigger_flare_class || "--";
  const probability = formatPercent(forecast.probability_sep_event_in_horizon);

  if (!forecast.prediction_label) {
    return {
      title: "HelioGuard has not published a current forecast.",
      summary: "The live API responded, but no latest forecast was included.",
    };
  }

  return {
    title: `HelioGuard prediction: ${label}.`,
    summary: `Latest trigger: ${flare}. SEP probability in the forecast horizon: ${probability}.`,
  };
};

const renderHelioguard = (forecast, status) => {
  if (!forecast) {
    setConnectionState("error", "No forecast available");
    return;
  }

  const color = forecastColor(forecast);
  const probability = typeof forecast.probability_sep_event_in_horizon === "number"
    ? forecast.probability_sep_event_in_horizon
    : 0;
  const percent = formatPercent(forecast.probability_sep_event_in_horizon);
  const worker = status?.worker || {};
  const model = status?.model || {};
  const forecastSummary = summarizeForecast(forecast);

  setConnectionState("ready", "Live data loaded");
  setText(helioguardFields.probability, percent);
  setText(helioguardFields.prediction, formatLabel(forecast.prediction_label));
  setText(helioguardFields.flare, forecast.trigger_flare_class || "--");
  setText(helioguardFields.flareTime, formatTime(forecast.trigger_flare_time_utc));
  setText(helioguardFields.horizon, `${forecast.forecast_horizon_hours ?? "--"} h`);
  setText(helioguardFields.threshold, `${forecast.event_threshold_pfu ?? "--"} pfu threshold`);
  setText(
    helioguardFields.worker,
    worker.refresh_in_progress ? "refreshing" : worker.alive ? "online" : "--"
  );
  setText(helioguardFields.modelState, model.status ? `model ${model.status}` : "--");
  setText(helioguardFields.ringValue, percent);
  setText(helioguardFields.label, formatLabel(forecast.prediction_label));
  setText(helioguardFields.title, forecastSummary.title);
  setText(helioguardFields.summary, forecastSummary.summary);
  setText(helioguardFields.allClear, forecast.all_clear === true ? "yes" : "no");
  setText(helioguardFields.generated, formatTime(forecast.generated_utc));
  setText(helioguardFields.trainingSource, forecast.training_source || model.training_source || "--");
  setText(helioguardFields.rocAuc, formatNumber(forecast.training?.metrics?.roc_auc, 3));
  setText(helioguardFields.flux, `${formatNumber(forecast.proton_flux_at_trigger_pfu, 3)} pfu`);
  setText(helioguardFields.lastRefresh, formatTime(worker.last_refresh_finished_utc));

  if (helioguardFields.ring) {
    helioguardFields.ring.style.setProperty("--risk-fill", `${Math.round(probability * 100)}%`);
    helioguardFields.ring.style.setProperty("--risk-color", color);
  }

  if (helioguardFields.label) {
    helioguardFields.label.style.setProperty("--risk-color", color);
  }
};

const fetchJson = async (path) => {
  const response = await fetch(`${HELIOGUARD_BASE_URL}${path}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`HelioGuard returned ${response.status}`);
  }

  return response.json();
};

const loadHelioguard = async () => {
  if (!helioguardFields.connection) {
    return;
  }

  setConnectionState("loading", "Loading live data");
  refreshButton?.setAttribute("disabled", "true");

  try {
    const [statusResult, forecastResult] = await Promise.allSettled([
      fetchJson("/api/v1/status"),
      fetchJson("/api/v1/forecast/latest"),
    ]);
    const status = statusResult.status === "fulfilled" ? statusResult.value : null;
    const forecast = forecastResult.status === "fulfilled"
      ? forecastResult.value
      : status?.latest_forecast;

    renderHelioguard(forecast, status);
  } catch {
    setConnectionState("error", "Live data unavailable");
    setText(helioguardFields.title, "HelioGuard data could not be loaded.");
    setText(
      helioguardFields.summary,
      "The embedded dashboard link is still available while the API is unreachable."
    );
  } finally {
    refreshButton?.removeAttribute("disabled");
  }
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

refreshButton?.addEventListener("click", loadHelioguard);

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
loadHelioguard();
window.setInterval(loadHelioguard, 60000);
window.addEventListener(
  "scroll",
  () => {
    setHeaderState();
    setScrollProgress();
  },
  { passive: true }
);
window.addEventListener("resize", setScrollProgress);
