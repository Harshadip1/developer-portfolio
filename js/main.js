/**
 * Nikhil Portfolio — Main JavaScript
 */

(function () {
  'use strict';

  const THEME_KEY = 'portfolio-theme';

  /* ---- Theme toggle ---- */
  function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    const saved = localStorage.getItem(THEME_KEY) || (typeof PortfolioStorage !== 'undefined' ? PortfolioStorage.getTheme() : null);

    function applyTheme(theme) {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (icon) icon.className = 'fas fa-sun';
      } else {
        document.documentElement.removeAttribute('data-theme');
        if (icon) icon.className = 'fas fa-moon';
      }
      localStorage.setItem(THEME_KEY, theme);
      if (typeof PortfolioStorage !== 'undefined') PortfolioStorage.setTheme(theme);
    }

    applyTheme(saved || 'dark');

    toggle?.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      applyTheme(isLight ? 'dark' : 'light');
    });
  }

  /* ---- Header scroll ---- */
  function initHeader() {
    const header = document.getElementById('header');
    const backToTop = document.getElementById('back-to-top');

    function onScroll() {
      const y = window.scrollY;
      header?.classList.toggle('scrolled', y > 50);
      backToTop?.classList.toggle('visible', y > 400);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Mobile navigation ---- */
  function initNavigation() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    const links = document.querySelectorAll('.nav__link');

    let overlay = document.querySelector('.nav__overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'nav__overlay';
      document.body.appendChild(overlay);
    }

    function closeMenu() {
      toggle?.classList.remove('active');
      menu?.classList.remove('open');
      overlay?.classList.remove('active');
      toggle?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }

    function openMenu() {
      toggle?.classList.add('active');
      menu?.classList.add('open');
      overlay?.classList.add('active');
      toggle?.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    }

    toggle?.addEventListener('click', () => {
      if (menu?.classList.contains('open')) closeMenu();
      else openMenu();
    });

    overlay.addEventListener('click', closeMenu);
    links.forEach((link) => link.addEventListener('click', closeMenu));
  }

  /* ---- Active nav link on scroll ---- */
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---- Smooth scroll for anchor links ---- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ---- Skills tabs ---- */
  function initSkillsTabs() {
    const tabs = document.querySelectorAll('.skills__tab');
    const panels = document.querySelectorAll('.skills__panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach((t) => t.classList.remove('active'));
        panels.forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`panel-${target}`)?.classList.add('active');
      });
    });
  }

  /* ---- Project filtering ---- */
  function initProjectFilter() {
    const filters = document.querySelectorAll('.projects__filter');
    const cards = document.querySelectorAll('.project-card');

    filters.forEach((filter) => {
      filter.addEventListener('click', () => {
        const category = filter.dataset.filter;
        filters.forEach((f) => f.classList.remove('active'));
        filter.classList.add('active');

        cards.forEach((card) => {
          const match = category === 'all' || card.dataset.category === category;
          card.classList.toggle('hidden', !match);
          if (match) {
            card.style.animation = 'fadeIn 0.5s ease forwards';
          }
        });
      });
    });
  }

  /* ---- Testimonial slider ---- */
  function initTestimonialSlider() {
    const track = document.getElementById('testimonials-track');
    const dotsContainer = document.getElementById('testimonials-dots');
    if (!track || !dotsContainer) return;

    const slides = track.querySelectorAll('.testimonial-card');
    let current = 0;
    let intervalId;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = `testimonials__dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.testimonials__dot');

    function goTo(index) {
      current = index;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() {
      goTo((current + 1) % slides.length);
    }

    function startAutoplay() {
      intervalId = setInterval(next, 5000);
    }

    function stopAutoplay() {
      clearInterval(intervalId);
    }

    track.parentElement?.addEventListener('mouseenter', stopAutoplay);
    track.parentElement?.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  }

  /* ---- Contact form validation ---- */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const popup = document.getElementById('success-popup');
    const popupClose = document.getElementById('popup-close');

    if (!form) return;

    const fields = {
      name: {
        el: document.getElementById('name'),
        error: document.getElementById('name-error'),
        validate: (v) => (v.trim().length >= 2 ? '' : 'Name must be at least 2 characters')
      },
      email: {
        el: document.getElementById('email'),
        error: document.getElementById('email-error'),
        validate: (v) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email'
      },
      subject: {
        el: document.getElementById('subject'),
        error: document.getElementById('subject-error'),
        validate: (v) => (v.trim().length >= 3 ? '' : 'Subject is required')
      },
      message: {
        el: document.getElementById('message'),
        error: document.getElementById('message-error'),
        validate: (v) => (v.trim().length >= 10 ? '' : 'Message must be at least 10 characters')
      }
    };

    function showError(key, message) {
      const field = fields[key];
      field.el?.closest('.form-group')?.classList.toggle('error', !!message);
      if (field.error) field.error.textContent = message;
    }

    function validateField(key) {
      const field = fields[key];
      const message = field.validate(field.el?.value || '');
      showError(key, message);
      return !message;
    }

    Object.keys(fields).forEach((key) => {
      fields[key].el?.addEventListener('blur', () => validateField(key));
      fields[key].el?.addEventListener('input', () => {
        if (fields[key].el.closest('.form-group')?.classList.contains('error')) {
          validateField(key);
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      Object.keys(fields).forEach((key) => {
        if (!validateField(key)) valid = false;
      });
      if (!valid) return;

      popup?.classList.add('active');
      form.reset();
      Object.keys(fields).forEach((key) => showError(key, ''));
    });

    popupClose?.addEventListener('click', () => popup?.classList.remove('active'));
    popup?.addEventListener('click', (e) => {
      if (e.target === popup) popup.classList.remove('active');
    });
  }

  /* ---- Lazy load images ---- */
  function initLazyLoad() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });

    images.forEach((img) => observer.observe(img));
  }

  /* ---- Init ---- */
  function init() {
    initTheme();
    initHeader();
    initNavigation();
    initActiveNav();
    initSmoothScroll();
    initSkillsTabs();
    initProjectFilter();
    initTestimonialSlider();
    initContactForm();
    initLazyLoad();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
