const root = document.documentElement;
const toggleBtn = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  root.setAttribute("data-theme", savedTheme);
}

/**
 * Returns the next theme to set based on the current theme.
 * @param {string | null} current - The current theme.
 * @returns {"dark" | "light"} The next theme to set.
 */
function getNextTheme(current) {
  if (current === "dark") {
    return "light";
  } else if (current === "light") {
    return "dark";
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return prefersDark ? "light" : "dark";
  }
}

function toggleTheme() {
  const current = root.getAttribute("data-theme");
  const next = getNextTheme(current);
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

toggleBtn.addEventListener("click", toggleTheme);
