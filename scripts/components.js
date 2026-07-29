const resolveComponentUrl = (fileName) => {
    const scriptElement = document.querySelector('script[src*="components.js"]');
    const scriptUrl = scriptElement
        ? new URL(scriptElement.src, window.location.href)
        : new URL("/scripts/components.js", window.location.href);

    return new URL(`../components/${fileName}`, scriptUrl).toString();
};

const loadComponent = async (targetId, fileName) => {
    const target = document.getElementById(targetId);
    if (!target) {
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

const initSmoothScrolling = () => {
    document.addEventListener("click", (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) {
            return;
        }

        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") {
            return;
        }

        const targetElement = document.querySelector(targetId);
        if (!targetElement) {
            return;
        }

        event.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
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
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
};

const initRevealAnimation = () => {
    const revealElements = document.querySelectorAll("[data-reveal]");
    if (revealElements.length === 0) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, instance) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.add("is-visible");
                instance.unobserve(entry.target);
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealElements.forEach((element) => observer.observe(element));
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
    if (typeof window.initProjects === "function") {
        await window.initProjects();
    }

    initActivePageHighlighting();
    initSmoothScrolling();
    initScrollToTop();
    initRevealAnimation();
    updateFooterYear();
});
