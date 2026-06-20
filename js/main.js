/* ==========================================================================
   GLOBAL SCRIPTS (js/main.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
    initScrollEffects();
    initButtonRipples();
    setActiveNavLink();
});

/* --- THEME CONTROLLER (LIGHT/DARK MODE) --- */
function initTheme() {
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    const storedTheme = localStorage.getItem('theme') || 'dark'; // Default dark mode as premium
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', storedTheme);
    
    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Dispatch custom event for page-specific visual redraws (like canvas/charts)
            window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: newTheme } }));
        });
    });
}

/* --- MOBILE DRAWER NAVIGATION --- */
function initMobileNav() {
    const menuBtn = document.querySelector('.menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const backdrop = document.querySelector('.mobile-backdrop');
    
    if (!menuBtn || !mobileNav || !backdrop) return;
    
    function toggleMenu() {
        menuBtn.classList.toggle('open');
        mobileNav.classList.toggle('open');
        backdrop.classList.toggle('open');
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    }
    
    menuBtn.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', toggleMenu);
    
    // Close menu on click of links
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('open')) toggleMenu();
        });
    });
}

/* --- SCROLL-BASED EFFECTS & INTERSECTION OBSERVER --- */
function initScrollEffects() {
    const header = document.querySelector('.site-header');
    
    // Header shadow/shrink on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });
    
    // Reveal animations on scroll
    const revealElements = document.querySelectorAll('.reveal');
    const observerOptions = {
        root: null, // Viewport
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '0px 0px -50px 0px' // Offset bottom slightly
    };
    
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Unobserve if we only want it to fire once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    revealElements.forEach(element => {
        scrollObserver.observe(element);
    });
}

/* --- BUTTON CLICK RIPPLE COMPONENT --- */
function initButtonRipples() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Remove existing ripples
            const existingRipples = this.querySelectorAll('.ripple');
            existingRipples.forEach(r => r.remove());
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size/2}px`;
            ripple.style.top = `${e.clientY - rect.top - size/2}px`;
            
            this.appendChild(ripple);
            
            // Clean up
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/* --- HIGHLIGHT CURRENT ACTIVE LINK --- */
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Match path names
        const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
        if (pageName === href || (pageName === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
