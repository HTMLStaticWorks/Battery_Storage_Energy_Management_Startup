/* ==========================================================================
   HOME PAGE SPECIFIC LOGIC (js/home.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initStatCounters();
    init3DTiltCards();
    initHorizontalTimeline();
    initCoverflowTestimonials();
});

/* --- COUNT-UP STAT NUMBERS --- */
function initStatCounters() {
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'), 10);
                const suffix = entry.target.getAttribute('data-suffix') || '';
                animateValue(entry.target, 0, target, 1500, suffix);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

function animateValue(obj, start, end, duration, suffix) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Easing outQuad
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(easeProgress * (end - start) + start);
        obj.textContent = currentValue + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.textContent = end + suffix;
        }
    };
    window.requestAnimationFrame(step);
}

/* --- CURSOR-FOLLOWING 3D TILT ON CARDS --- */
function init3DTiltCards() {
    const cards = document.querySelectorAll('.card-3d-tilt');
    if (!cards.length) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Mouse position inside card
            const y = e.clientY - rect.top;
            
            // Normalize values from -0.5 to 0.5
            const xNorm = (x / rect.width) - 0.5;
            const yNorm = (y / rect.height) - 0.5;
            
            // Maximum tilt angle in degrees
            const maxTilt = 10;
            
            // Rotate card
            card.style.transform = `rotateX(${-yNorm * maxTilt}deg) rotateY(${xNorm * maxTilt}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

/* --- PROCESS TIMELINE SELF-DRAWING CONNECTORS --- */
function initHorizontalTimeline() {
    const container = document.querySelector('.timeline-horizontal-container');
    const fill = document.querySelector('.timeline-progress-fill');
    const steps = document.querySelectorAll('.timeline-step');
    
    if (!container || !fill || !steps.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate progress line width
                fill.style.width = '100%';
                
                // Stagger activation of node dots
                steps.forEach((step, idx) => {
                    setTimeout(() => {
                        step.classList.add('active');
                    }, idx * 300); // 300ms stagger between nodes
                });
                
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(container);
}

/* --- 3D COVERFLOW TESTIMONIAL CAROUSEL --- */
function initCoverflowTestimonials() {
    const cards = document.querySelectorAll('.coverflow-card');
    const prevBtn = document.getElementById('coverflow-prev');
    const nextBtn = document.getElementById('coverflow-next');
    
    if (!cards.length) return;
    
    let currentIndex = 0;
    
    function updateCoverflow() {
        cards.forEach((card, index) => {
            card.className = 'coverflow-card'; // Reset
            
            if (index === currentIndex) {
                card.classList.add('active');
            } else if (index === currentIndex - 1 || (currentIndex === 0 && index === cards.length - 1)) {
                card.classList.add('prev');
            } else if (index === currentIndex + 1 || (currentIndex === cards.length - 1 && index === 0)) {
                card.classList.add('next');
            }
        });
    }
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex === 0) ? cards.length - 1 : currentIndex - 1;
            updateCoverflow();
        });
        
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex === cards.length - 1) ? 0 : currentIndex + 1;
            updateCoverflow();
        });
    }
    
    // Auto play every 5 seconds
    let intervalId = setInterval(() => {
        if (nextBtn) nextBtn.click();
    }, 5000);
    
    const viewport = document.querySelector('.coverflow-viewport');
    if (viewport) {
        viewport.addEventListener('mouseenter', () => clearInterval(intervalId));
        viewport.addEventListener('mouseleave', () => {
            intervalId = setInterval(() => {
                if (nextBtn) nextBtn.click();
            }, 5000);
        });
    }
    
    updateCoverflow();
}
