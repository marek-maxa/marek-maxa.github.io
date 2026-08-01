const resolveComponentUrl = (fileName) => {
    const scriptElement = document.querySelector('script[src*="components.js"]');
    const scriptUrl = scriptElement
        ? new URL(scriptElement.src, window.location.href)
        : new URL("/scripts/components.js", window.location.href);

    return new URL(`../components/${fileName}`, scriptUrl).toString();
};

const loadComponent = async (targetId, fileName) => {
    const target = document.getElementById(targetId);
    if (!target || target.childElementCount > 0) {
        return;
    }

    try {
        const response = await fetch(resolveComponentUrl(fileName));
        if (!response.ok) {
            throw new Error(`Failed to load ${fileName}: ${response.status}`);
        }
        target.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
};

const normalizePath = (path) => {
    if (!path || path === "/index.html") {
        return "/";
    }
    return path.replace(/\/+$/, "");
};

const initActivePageHighlighting = () => {
    const currentPath = normalizePath(window.location.pathname);
    const navLinks = document.querySelectorAll(".navbar-links a");

    navLinks.forEach((link) => {
        const linkPath = normalizePath(new URL(link.href, window.location.href).pathname);
        const isProjectsGroup = linkPath === "/pages/projects.html" && currentPath.startsWith("/pages/projects/");
        const isHomePath = linkPath === "/" && (currentPath === "/" || currentPath === "/index.html");

        if (linkPath === currentPath || isProjectsGroup || isHomePath) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
};

const initScrollToTop = () => {
    if (document.querySelector(".scroll-to-top")) {
        return;
    }

    const scrollButton = document.createElement("button");
    scrollButton.className = "scroll-to-top";
    scrollButton.type = "button";
    scrollButton.textContent = "Top";
    scrollButton.setAttribute("aria-label", "Scroll to top");
    document.body.appendChild(scrollButton);

    const onScroll = () => {
        const isVisible = window.scrollY > 360;
        scrollButton.classList.toggle("visible", isVisible);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    scrollButton.addEventListener("click", () => {
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
        window.scrollTo({ top: 0, behavior });
    });
};

const updateFooterYear = () => {
    const yearNode = document.getElementById("copyright-year");
    if (yearNode) {
        yearNode.textContent = String(new Date().getFullYear());
    }
};

window.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([loadComponent("navbar", "Navbar.html"), loadComponent("footer", "Footer.html")]);

    if (typeof window.initDarkmode === "function") {
        window.initDarkmode();
    }

    const projectInitialization = typeof window.initProjects === "function" ? window.initProjects() : Promise.resolve();

    initActivePageHighlighting();
    initScrollToTop();
    updateFooterYear();

    await projectInitialization;
});
