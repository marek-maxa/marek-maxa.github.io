window.initDarkmode = function() {
    const toggle = document.getElementById('darkmode-toggle');
    if (!toggle) {
        console.log('darkmode toggle not found');
        return;
    }

    const userPref = localStorage.getItem('darkmode');
    console.log('userPref:', userPref);
    if (userPref === 'light') {
        document.body.classList.add('lightmode');
    } else {
        document.body.classList.remove('lightmode');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('lightmode');
        if (document.body.classList.contains('lightmode')) {
            localStorage.setItem('darkmode', 'light');
            console.log('Lightmode activated');
        } else {
            localStorage.setItem('darkmode', 'dark');
            console.log('Darkmode activated');
        }
    });
};