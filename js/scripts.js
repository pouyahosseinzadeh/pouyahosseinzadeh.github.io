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
window.addEventListener(
  "scroll",
  () => {
    setHeaderState();
    setScrollProgress();
  },
  { passive: true }
);
window.addEventListener("resize", setScrollProgress);
