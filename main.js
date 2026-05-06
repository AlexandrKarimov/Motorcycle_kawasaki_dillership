document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        document.querySelector('.wrapper')?.classList.add('page-loaded');
    }, 50);
    
    document.querySelectorAll('a:not([target="_blank"]):not([href^="http"])').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
                e.preventDefault();
                
                overlay.classList.add('active');
                
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            }
        });
    });
});