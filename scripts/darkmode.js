// Apply theme immediately to prevent flash - this runs before DOM is ready
(function() {
    const userPref = localStorage.getItem('darkmode');
    
    if (userPref === 'light') {
        // Apply lightmode immediately to html element
        document.documentElement.classList.add('lightmode');
        
        // Also set a style attribute as backup to prevent any flash
        document.documentElement.style.setProperty('background', 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)');
        document.documentElement.style.setProperty('color', '#232526');
        
        // When DOM is ready, apply to body as well
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                document.body.classList.add('lightmode');
                // Remove inline styles as CSS will take over
                document.documentElement.style.removeProperty('background');
                document.documentElement.style.removeProperty('color');
            });
        } else {
            document.body.classList.add('lightmode');
            document.documentElement.style.removeProperty('background');
            document.documentElement.style.removeProperty('color');
        }
    } else {
        // Ensure dark mode
        document.documentElement.classList.remove('lightmode');
        if (document.body) {
            document.body.classList.remove('lightmode');
        }
    }
})();

window.initDarkmode = function() {
    const toggle = document.getElementById('darkmode-toggle');
    if (!toggle) {
        console.log('darkmode toggle not found');
        return;
    }

    // Apply current preference without changing it
    const userPref = localStorage.getItem('darkmode');
    console.log('userPref:', userPref);
    
    if (userPref === 'light') {
        document.body.classList.add('lightmode');
        document.documentElement.classList.add('lightmode');
    } else {
        document.body.classList.remove('lightmode');
        document.documentElement.classList.remove('lightmode');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('lightmode');
        document.documentElement.classList.toggle('lightmode');
        
        if (document.body.classList.contains('lightmode')) {
            localStorage.setItem('darkmode', 'light');
            console.log('Lightmode activated');
        } else {
            localStorage.setItem('darkmode', 'dark');
            console.log('Darkmode activated');
        }
    });
};