/* ===== FINAB La Solution — Main JS ===== */

// Preloader
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
        document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach(el => {
            if (isInViewport(el)) el.classList.add('visible');
        });
    }, 1800);
});

// Navbar scroll
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    backToTop.classList.toggle('visible', window.scrollY > 400);
    
    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
});

// Back to top
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Mobile menu
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
});
document.querySelectorAll('.nav-link, .nav-btn').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
    });
});

// Scroll animations (Intersection Observer)
function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight - 80;
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach(el => observer.observe(el));

// Counter animation
function animateCounters() {
    document.querySelectorAll('.stat-number[data-count]').forEach(counter => {
        if (counter.dataset.animated) return;
        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
        counter.dataset.animated = 'true';
    });
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// Particles
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        p.style.left = Math.random() * 100 + '%';
        p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
        p.style.animationDuration = (Math.random() * 15 + 10) + 's';
        p.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(p);
    }
}
createParticles();

// Hero Slider
const heroSlides = document.querySelectorAll('.hero-slide');
const sliderDots = document.querySelectorAll('.slider-dot');
let currentHeroSlide = 0;

function showHeroSlide(index) {
    heroSlides.forEach(s => s.classList.remove('active'));
    sliderDots.forEach(d => d.classList.remove('active'));
    currentHeroSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides[currentHeroSlide].classList.add('active');
    sliderDots[currentHeroSlide].classList.add('active');
}

sliderDots.forEach((dot, i) => dot.addEventListener('click', () => showHeroSlide(i)));
setInterval(() => showHeroSlide(currentHeroSlide + 1), 5000);

// Testimonials slider
const testimonials = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;

function showSlide(index) {
    testimonials.forEach(t => t.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    currentSlide = (index + testimonials.length) % testimonials.length;
    testimonials[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

document.querySelector('.test-next')?.addEventListener('click', () => showSlide(currentSlide + 1));
document.querySelector('.test-prev')?.addEventListener('click', () => showSlide(currentSlide - 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));

// Auto-slide
setInterval(() => showSlide(currentSlide + 1), 6000);

// Réussites slider
const reussitesTrack = document.getElementById('reussitesTrack');
const reussPrev = document.getElementById('reussPrev');
const reussNext = document.getElementById('reussNext');
if (reussitesTrack) {
    let reussPos = 0;
    const reussSlides = reussitesTrack.querySelectorAll('.reussite-slide');
    function getReussVisible() {
        if (window.innerWidth <= 640) return 1;
        if (window.innerWidth <= 992) return 2;
        return 3;
    }
    function moveReuss(dir) {
        const visible = getReussVisible();
        const maxPos = reussSlides.length - visible;
        reussPos = Math.max(0, Math.min(reussPos + dir, maxPos));
        const slideWidth = reussitesTrack.parentElement.offsetWidth / visible;
        reussitesTrack.style.transform = `translateX(-${reussPos * (slideWidth + 24)}px)`;
    }
    reussNext.addEventListener('click', () => moveReuss(1));
    reussPrev.addEventListener('click', () => moveReuss(-1));
    setInterval(() => {
        const visible = getReussVisible();
        const maxPos = reussSlides.length - visible;
        if (reussPos >= maxPos) reussPos = -1;
        moveReuss(1);
    }, 4000);
}

// Contact form
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Message Envoyé !';
    btn.style.background = 'var(--green)';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        e.target.reset();
    }, 3000);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});
