window.addEventListener('DOMContentLoaded', () => {
    fetch('../components/Navbar.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('navbar').innerHTML = html;
            if (typeof window.initDarkmode === 'function') {
                window.initDarkmode();
            }
        });

    fetch('../components/Footer.html')
        .then(res => res.text())
        .then(html => document.getElementById('footer').innerHTML = html);
});