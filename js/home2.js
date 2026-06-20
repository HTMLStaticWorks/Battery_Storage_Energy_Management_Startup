/* ==========================================================================
   HOME 2 PAGE SPECIFIC LOGIC (js/home2.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initSplitParallax();
    initProgressBars();
    initIsometricDrift();
    initFlipCardAccessibility();
});

/* --- HERO SPLIT PARALLAX --- */
function initSplitParallax() {
    const hero = document.querySelector('.hero-split');
    const bg = document.querySelector('.parallax-bg');
    
    if (!hero || !bg) return;
    
    hero.addEventListener('mousemove', (e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Compute movement factors (-0.5 to 0.5)
        const xFactor = (e.clientX / width) - 0.5;
        const yFactor = (e.clientY / height) - 0.5;
        
        // Move background image at 0.3x mouse speed (subtle offset)
        const xOffset = xFactor * 30;
        const yOffset = yFactor * 30;
        
        bg.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(1.1)`;
    });
}

/* --- STATS PROGRESS BARS --- */
function initProgressBars() {
    const fills = document.querySelectorAll('.stat-bar-fill');
    if (!fills.length) return;
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const percent = entry.target.getAttribute('data-percentage');
                entry.target.style.width = `${percent}%`;
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    fills.forEach(fill => observer.observe(fill));
}

/* --- ISOMETRIC DEPTH ILLUSTRATION MOUSE-DRIFT --- */
function initIsometricDrift() {
    const container = document.querySelector('.isometric-container');
    const layers = document.querySelectorAll('.iso-layer');
    
    if (!container || !layers.length) return;
    
    container.addEventListener('mousemove', (e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - (rect.width / 2);
        const mouseY = e.clientY - rect.top - (rect.height / 2);
        
        layers.forEach(layer => {
            // Read relative depth factor
            const depth = parseFloat(layer.getAttribute('data-depth')) || 0.1;
            
            // Apply distinct transform based on depth and isometric angle
            const xShift = mouseX * depth * 0.15;
            const yShift = mouseY * depth * 0.15;
            
            layer.style.transform = `translate(${xShift}px, ${yShift}px) rotateX(60deg) rotateZ(-45deg)`;
        });
    });
    
    container.addEventListener('mouseleave', () => {
        layers.forEach(layer => {
            layer.style.transform = 'translate(0px, 0px) rotateX(60deg) rotateZ(-45deg)';
        });
    });
}

/* --- KEYBOARD ACCESSIBILITY FOR FLIP CARDS --- */
function initFlipCardAccessibility() {
    const flipContainers = document.querySelectorAll('.flip-card-container');
    
    flipContainers.forEach(container => {
        container.setAttribute('tabindex', '0');
        
        // Setup focus indicator overrides
        container.addEventListener('focus', () => {
            container.style.outline = '2px solid var(--accent-primary)';
            container.style.outlineOffset = '4px';
        });
        
        container.addEventListener('blur', () => {
            container.style.outline = 'none';
        });
        
        container.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                const inner = container.querySelector('.flip-card-inner');
                const isFlipped = inner.style.transform === 'rotateY(180deg)';
                
                // Toggle rotation style
                inner.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
            }
        });
    });
}
