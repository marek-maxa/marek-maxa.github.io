window.addEventListener('DOMContentLoaded', () => {
    // Load navbar and footer components
    Promise.all([
        fetch('/components/Navbar.html').then(res => res.text()),
        fetch('/components/Footer.html').then(res => res.text())
    ]).then(([navbarHtml, footerHtml]) => {
        document.getElementById('navbar').innerHTML = navbarHtml;
        document.getElementById('footer').innerHTML = footerHtml;
        
        // Initialize features
        if (typeof window.initDarkmode === 'function') {
            window.initDarkmode();
        }
        initScrollToTop();
        initActivePageHighlighting();
        initSmoothScrolling();
        initPageTransitions();
        initMobileDarkModeButton();
        
        // Add entrance animation to main content
        const main = document.querySelector('main');
        if (main) {
            main.style.opacity = '0';
            main.style.transform = 'translateY(30px)';
            setTimeout(() => {
                main.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                main.style.opacity = '1';
                main.style.transform = 'translateY(0)';
            }, 100);
        }
    });
});

// Scroll to top functionality
function initScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.setAttribute('title', 'Scroll to top');
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Active page highlighting
function initActivePageHighlighting() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-links a');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
            link.classList.add('active');
        }
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.addEventListener('click', (e) => {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
}

// Page transitions
function initPageTransitions() {
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'page-transition';
    transitionOverlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(transitionOverlay);
    
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && 
            link.hostname === window.location.hostname && 
            !link.hasAttribute('target') &&
            !link.href.includes('#') &&
            link.href !== window.location.href) {
            
            e.preventDefault();
            transitionOverlay.classList.add('active');
            
            setTimeout(() => {
                window.location.href = link.href;
            }, 150);
        }
    });
    
    window.addEventListener('pageshow', () => {
        transitionOverlay.classList.remove('active');
    });
}

// Mobile dark mode button
function initMobileDarkModeButton() {
    const mobileDarkBtn = document.createElement('button');
    mobileDarkBtn.id = 'darkmode-toggle-mobile';
    mobileDarkBtn.innerHTML = '🌓';
    mobileDarkBtn.setAttribute('aria-label', 'Toggle dark/light mode');
    mobileDarkBtn.setAttribute('title', 'Toggle dark/light mode');
    document.body.appendChild(mobileDarkBtn);
    
    mobileDarkBtn.addEventListener('click', () => {
        document.body.classList.toggle('lightmode');
        document.documentElement.classList.toggle('lightmode');
        
        if (document.body.classList.contains('lightmode')) {
            localStorage.setItem('darkmode', 'light');
        } else {
            localStorage.setItem('darkmode', 'dark');
        }
    });
}