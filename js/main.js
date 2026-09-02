/* ===== FINAB La Solution — Main JS ===== */
(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    /* -------------------------------------------------
     * File d'attente : rien ne s'anime tant que le
     * préchargeur masque encore la page.
     * ------------------------------------------------- */
    var pageReady = false;
    var readyQueue = [];

    function onPageReady(fn) {
        if (pageReady) fn();
        else readyQueue.push(fn);
    }

    function markPageReady() {
        if (pageReady) return;
        pageReady = true;
        readyQueue.forEach(function (fn) { fn(); });
        readyQueue = [];
    }

    /* ===== Preloader ===== */
    (function initPreloader() {
        var preloader = document.getElementById('preloader');
        if (!preloader) {
            markPageReady();
            return;
        }

        var hidden = false;
        function hidePreloader() {
            if (hidden) return;
            hidden = true;
            preloader.classList.add('hidden');
            revealVisibleElements();
            markPageReady();
        }

        if (document.readyState === 'complete') {
            setTimeout(hidePreloader, 600);
        } else {
            window.addEventListener('load', function () {
                setTimeout(hidePreloader, 600);
            });
        }
        // Filet de sécurité : même si une image ou une police ne se charge
        // jamais, le site s'affiche au bout de 4 secondes.
        setTimeout(hidePreloader, 4000);
    })();

    /* ===== Animations au défilement ===== */
    function isInViewport(el) {
        var rect = el.getBoundingClientRect();
        return rect.top < (window.innerHeight || document.documentElement.clientHeight) - 40 &&
               rect.bottom > 0;
    }

    var animatedSelector = '.fade-up, .fade-left, .fade-right';

    function revealVisibleElements() {
        document.querySelectorAll(animatedSelector).forEach(function (el) {
            if (isInViewport(el)) el.classList.add('visible');
        });
    }

    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll(animatedSelector).forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        document.querySelectorAll(animatedSelector).forEach(function (el) {
            el.classList.add('visible');
        });
    }

    /* ===== Navbar / barre de progression du défilement ===== */
    var navbar = document.getElementById('navbar');
    var backToTop = document.getElementById('backToTop');
    var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
    // Seuls les liens d'ancre sont gérés ici : sinon le lien actif d'une
    // page interne (ex. Coordination Médicale) serait désactivé au défilement.
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link[href^="#"]'));
    var scrollTicking = false;

    function navbarHeight() {
        return navbar ? navbar.offsetHeight : 0;
    }

    function onScroll() {
        var y = window.scrollY || window.pageYOffset;

        if (navbar && !navbar.classList.contains('static-scrolled')) {
            navbar.classList.toggle('scrolled', y > 50);
        }
        if (backToTop) {
            backToTop.classList.toggle('visible', y > 400);
        }

        if (sections.length && navLinks.length) {
            var current = '';
            var offset = navbarHeight() + 40;
            sections.forEach(function (section) {
                if (y >= section.offsetTop - offset) current = section.id;
            });
            // Bas de page : on active la dernière section.
            if (window.innerHeight + y >= document.body.offsetHeight - 4) {
                current = sections[sections.length - 1].id;
            }
            navLinks.forEach(function (link) {
                var href = link.getAttribute('href') || '';
                link.classList.toggle('active', current !== '' && href === '#' + current);
            });
        }
    }

    window.addEventListener('scroll', function () {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(function () {
            onScroll();
            scrollTicking = false;
        });
    }, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    /* ===== Menu mobile ===== */
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');

    function setMenu(open) {
        if (!navToggle || !navMenu) return;
        navToggle.classList.toggle('open', open);
        navMenu.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    if (navToggle && navMenu) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-controls', 'navMenu');

        navToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            setMenu(!navMenu.classList.contains('open'));
        });

        navMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () { setMenu(false); });
        });

        // Fermeture au clic à l'extérieur et via Échap.
        document.addEventListener('click', function (e) {
            if (!navMenu.classList.contains('open')) return;
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setMenu(false);
        });
    }

    /* ===== Compteurs animés ===== */
    function formatNumber(value) {
        try {
            return value.toLocaleString('fr-FR');
        } catch (err) {
            return String(value);
        }
    }

    function animateCounter(el) {
        if (el.dataset.animated === 'true') return;
        var target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;

        el.dataset.animated = 'true';

        if (prefersReducedMotion) {
            el.textContent = formatNumber(target);
            return;
        }

        var duration = parseInt(el.dataset.duration, 10) || 2000;
        var start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = formatNumber(Math.round(target * eased));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                el.textContent = formatNumber(target); // valeur finale exacte
            }
        }

        window.requestAnimationFrame(step);
    }

    (function initCounters() {
        var counters = Array.prototype.slice.call(
            document.querySelectorAll('.stat-number[data-count]')
        );
        if (!counters.length) return;

        // Valeur de départ cohérente si JS met du temps à démarrer.
        counters.forEach(function (el) { el.textContent = '0'; });

        function runAll() {
            counters.forEach(function (el) {
                onPageReady(function () { animateCounter(el); });
            });
        }

        if (!('IntersectionObserver' in window)) {
            runAll();
            return;
        }

        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                counterObserver.unobserve(el);
                onPageReady(function () { animateCounter(el); });
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

        counters.forEach(function (el) { counterObserver.observe(el); });

        // Filet de sécurité : si l'observateur ne se déclenche jamais
        // (section plus haute que l'écran, navigateur capricieux…),
        // les compteurs s'animent quand même une fois la page prête.
        onPageReady(function () {
            setTimeout(function () {
                counters.forEach(function (el) {
                    if (el.dataset.animated !== 'true' && isInViewport(el)) animateCounter(el);
                });
            }, 300);
        });
    })();

    /* ===== Particules ===== */
    (function createParticles() {
        var container = document.getElementById('particles');
        if (!container || prefersReducedMotion) return;
        var fragment = document.createDocumentFragment();
        for (var i = 0; i < 30; i++) {
            var p = document.createElement('div');
            p.className = 'particle';
            p.style.left = (Math.random() * 100) + '%';
            p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
            p.style.animationDuration = (Math.random() * 15 + 10) + 's';
            p.style.animationDelay = (Math.random() * 10) + 's';
            fragment.appendChild(p);
        }
        container.appendChild(fragment);
    })();

    /* -------------------------------------------------
     * Carrousel générique (héros + témoignages)
     * ------------------------------------------------- */
    function createCarousel(options) {
        var slides = Array.prototype.slice.call(document.querySelectorAll(options.slideSelector));
        if (!slides.length) return null;

        var dotsContainer = document.querySelector(options.dotsSelector);
        var dots = [];
        var index = 0;
        var timer = null;

        // Les puces sont générées à partir du nombre réel de diapositives :
        // impossible d'avoir plus (ou moins) de puces que d'images.
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach(function (_, i) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.className = options.dotClass;
                dot.setAttribute('aria-label', options.dotLabel + ' ' + (i + 1));
                dot.addEventListener('click', function () {
                    show(i);
                    restart();
                });
                dotsContainer.appendChild(dot);
                dots.push(dot);
            });
        }

        function show(next) {
            index = ((next % slides.length) + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
                dot.setAttribute('aria-current', i === index ? 'true' : 'false');
            });
        }

        function next() { show(index + 1); }
        function prev() { show(index - 1); }

        function stop() {
            if (timer) { clearInterval(timer); timer = null; }
        }

        function restart() {
            stop();
            if (slides.length < 2 || prefersReducedMotion) return;
            timer = setInterval(next, options.interval);
        }

        show(0);
        restart();

        // On met en pause quand l'onglet n'est pas visible.
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stop();
            else restart();
        });

        return { show: show, next: next, prev: prev, restart: restart, stop: stop };
    }

    /* ===== Carrousel du héros ===== */
    createCarousel({
        slideSelector: '.hero-slide',
        dotsSelector: '.hero-slider-nav',
        dotClass: 'slider-dot',
        dotLabel: 'Image',
        interval: 5000
    });

    /* ===== Carrousel des témoignages ===== */
    var testimonials = createCarousel({
        slideSelector: '.testimonial-card',
        dotsSelector: '.test-dots',
        dotClass: 'dot',
        dotLabel: 'Témoignage',
        interval: 6000
    });

    if (testimonials) {
        var nextBtn = document.querySelector('.test-next');
        var prevBtn = document.querySelector('.test-prev');
        if (nextBtn) nextBtn.addEventListener('click', function () {
            testimonials.next();
            testimonials.restart();
        });
        if (prevBtn) prevBtn.addEventListener('click', function () {
            testimonials.prev();
            testimonials.restart();
        });
    }

    /* ===== Formulaire de contact ===== */
    (function initContactForm() {
        var form = document.getElementById('contactForm');
        if (!form) return;

        var status = document.getElementById('formStatus');
        var submitBtn = form.querySelector('button[type=submit]');
        var fallbackEmail = 'contact@finablasolution.com';

        function setStatus(message, type) {
            if (!status) return;
            status.innerHTML = message;
            status.className = 'form-status ' + (type || '');
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validation native (champs requis, format de l'email…)
            if (!form.checkValidity()) {
                form.reportValidity();
                setStatus('Merci de remplir correctement les champs obligatoires.', 'error');
                return;
            }

            var originalText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours…';
            }
            setStatus('', '');

            var data = new URLSearchParams(new FormData(form)).toString();
            var endpoint = form.getAttribute('action') || '/';

            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data
            }).then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                form.reset();
                setStatus(
                    '<i class="fas fa-check-circle"></i> Merci ! Votre message a bien été envoyé. ' +
                    'Nous vous répondons sous 24 h.',
                    'success'
                );
            }).catch(function () {
                // Le POST peut échouer hors hébergement (ouverture locale du
                // fichier). On ne prétend jamais que le message est parti :
                // on propose l'e-mail direct.
                setStatus(
                    '<i class="fas fa-triangle-exclamation"></i> L\'envoi automatique a échoué. ' +
                    'Écrivez-nous directement à <a href="mailto:' + fallbackEmail + '">' +
                    fallbackEmail + '</a>.',
                    'error'
                );
            }).then(function () {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        });
    })();

    /* ===== Défilement fluide des ancres ===== */
    document.addEventListener('click', function (e) {
        var anchor = e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!anchor) return;

        var href = anchor.getAttribute('href');
        // On ignore les liens vides (#, #!) utilisés comme espaces réservés :
        // les bloquer empêchait aussi le retour en haut de page.
        if (!href || href === '#' || href === '#!') return;

        var target = document.getElementById(href.slice(1));
        if (!target) return;

        e.preventDefault();
        setMenu(false);

        var top = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset)
            - navbarHeight() - 10;
        window.scrollTo({
            top: Math.max(top, 0),
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });

        if (history.replaceState) history.replaceState(null, '', href);
    });

    /* ===== Année du copyright ===== */
    document.querySelectorAll('[data-current-year]').forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });
})();
