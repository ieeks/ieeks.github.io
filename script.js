const PROJECTS = [
  {
    title: "VAT Calculator",
    description: "EU VAT chain transaction tool",
    url: "https://ieeks.github.io/eu-vat-reihengeschaeftrechner/",
    icon: "€",
    status: "Live",
  },
  {
    title: "LEGO Tracker",
    description: "Track and manage my LEGO collection",
    url: "https://ieeks.github.io/lego-tracker/",
    icon: "🧱",
    status: "Live",
  },
  {
    title: "Ladefuchs ⚡",
    description: "EV charging cost & analytics",
    url: "https://ieeks.github.io/wallbox/",
    icon: "⚡",
    status: "Live",
  },
  {
    title: "Energy Dashboard",
    description: "Live smart meter insights",
    url: "",
    icon: "◌",
    status: "Coming Soon",
  },
];

const THEME_STORAGE_KEY = "manuel-pages-theme";

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const label = document.querySelector(".theme-toggle-label");
  if (label) label.textContent = theme === "dark" ? "Light" : "Dark";
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // Ignore storage failures.
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  setTheme(current === "dark" ? "light" : "dark");
}

function createProjectCard(project) {
  const isLive = Boolean(project.url);
  const tag = isLive ? "a" : "article";
  const card = document.createElement(tag);
  card.className = `project-card${isLive ? "" : " coming-soon"}`;

  if (isLive) {
    card.href = project.url;
    card.target = "_blank";
    card.rel = "noreferrer";
    card.setAttribute("aria-label", `${project.title} - open project`);
  }

  card.innerHTML = `
    <div class="project-card-head">
      <div class="project-icon" aria-hidden="true">${project.icon}</div>
      <div class="project-status">${project.status}</div>
    </div>
    <div class="project-card-body">
      <h3>${project.title}</h3>
      <p>${project.description}</p>
    </div>
    <div class="project-link">${isLive ? "Open Project" : "Coming Soon"}</div>
  `;

  return card;
}

function renderProjects() {
  const grid = document.getElementById("projectGrid");
  if (!grid) return;
  grid.innerHTML = "";
  PROJECTS.forEach((project) => {
    grid.appendChild(createProjectCard(project));
  });
}

function init() {
  renderProjects();
  setTheme(getPreferredTheme());

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

init();
