(() => {
    const STORAGE_KEY = "theme";
    const THEMES = {
        dark: "dark",
        light: "light"
    };

    const isTheme = (value) => value === THEMES.dark || value === THEMES.light;

    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        if (isTheme(savedTheme)) {
            return savedTheme;
        }

        const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        return prefersLight ? THEMES.light : THEMES.dark;
    };

    const applyTheme = (theme) => {
        const selectedTheme = isTheme(theme) ? theme : THEMES.dark;
        document.documentElement.setAttribute("data-theme", selectedTheme);
        document.documentElement.style.colorScheme = selectedTheme;
        localStorage.setItem(STORAGE_KEY, selectedTheme);
        return selectedTheme;
    };

    const updateToggleText = (toggleElement, theme) => {
        if (!toggleElement) {
            return;
        }

        const nextTheme = theme === THEMES.dark ? THEMES.light : THEMES.dark;
        toggleElement.textContent = theme === THEMES.dark ? "Dark" : "Light";
        toggleElement.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
        toggleElement.setAttribute("aria-pressed", String(theme === THEMES.light));
        toggleElement.dataset.theme = theme;
    };

    const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const applyThemeFromToggle = (toggleElement) => {
        const nextTheme = window.getTheme() === THEMES.dark ? THEMES.light : THEMES.dark;
        const updateTheme = () => {
            const theme = applyTheme(nextTheme);
            updateToggleText(toggleElement, theme);
        };

        if (typeof document.startViewTransition === "function" && !prefersReducedMotion()) {
            document.startViewTransition(updateTheme);
            return;
        }

        updateTheme();
    };

    const initialTheme = applyTheme(getInitialTheme());

    window.setTheme = (theme) => applyTheme(theme);
    window.getTheme = () => document.documentElement.getAttribute("data-theme") || initialTheme;
    window.toggleTheme = () => applyTheme(window.getTheme() === THEMES.dark ? THEMES.light : THEMES.dark);

    window.initDarkmode = () => {
        const toggle = document.getElementById("theme-toggle");
        if (!toggle) {
            return;
        }

        updateToggleText(toggle, window.getTheme());

        toggle.addEventListener("click", () => applyThemeFromToggle(toggle));
    };
})();
