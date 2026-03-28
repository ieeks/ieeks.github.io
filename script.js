const PROJECTS = [
  {
    title: "VAT Calculator",
    description: "EU VAT chain transaction tool",
    url: "https://ieeks.github.io/eu-vat-reihengeschaeftrechner/",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="5" y="3.5" width="14" height="17" rx="2.5"/>
  <line x1="8" y1="8" x2="16" y2="8"/>
  <line x1="8" y1="12" x2="11" y2="12"/>
  <line x1="13.5" y1="11" x2="16.5" y2="14"/>
  <line x1="16.5" y1="11" x2="13.5" y2="14"/>
  <line x1="8" y1="16" x2="11" y2="16"/>
</svg>`,
    status: "Live",
  },
  {
    title: "LEGO Tracker",
    description: "Track and manage my LEGO collection",
    url: "https://ieeks.github.io/lego-tracker/",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="5" y="9" width="14" height="9" rx="2"/>
  <rect x="7" y="6" width="3" height="3" rx="1"/>
  <rect x="14" y="6" width="3" height="3" rx="1"/>
  <line x1="9" y1="13" x2="9" y2="13"/>
  <line x1="12" y1="13" x2="12" y2="13"/>
  <line x1="15" y1="13" x2="15" y2="13"/>
</svg>`,
    status: "Live",
  },
  {
    title: "Wallbox",
    description: "EV charging cost & analytics",
    url: "https://ieeks.github.io/wallbox/",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="6" y="3.5" width="12" height="14" rx="3"/>
  <circle cx="12" cy="7.5" r="0.8"/>
  <path d="M11 9.5L9.5 12H12L11 14.5L14.5 11.5H12.5L13.5 9.5Z"/>
  <path d="M12 17.5V20"/>
  <path d="M12 20C12 21.5 14 21.5 14 20V18"/>
</svg>`,
    status: "Live",
  },
  {
    title: "Energy Dashboard",
    description: "Live smart meter insights",
    url: "",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="3 12 7 12 10 7 14 18 17 12 21 12"/>
</svg>`,
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
  return "light";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.checked = theme === "dark";
    toggle.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
  }
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
    themeToggle.addEventListener("change", toggleTheme);
  }
}

init();
