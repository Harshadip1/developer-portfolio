/**
 * Nikhil Portfolio — Animations Module
 */

(function () {
  'use strict';

  function getTypingPhrases() {
    return window.__PORTFOLIO_TYPING_PHRASES__?.length
      ? window.__PORTFOLIO_TYPING_PHRASES__
      : ['Full Stack Developer', 'UI/UX Designer', 'Android Developer'];
  }

  /* ---- Loader ---- */
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('no-scroll');
      }, 800);
    });

    document.body.classList.add('no-scroll');
  }

  /* ---- Typing effect ---- */
  function initTyping() {
    const el = document.getElementById('typing-text');
    if (!el) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const phrases = getTypingPhrases();

    function type() {
      const current = phrases[phraseIndex];

      if (isDeleting) {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      let delay = isDeleting ? 40 : 80;

      if (!isDeleting && charIndex === current.length) {
        delay = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 400;
      }

      setTimeout(type, delay);
    }

    type();
  }

  /* ---- Floating particles ---- */
  function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let mouse = { x: null, y: null };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      const count = Math.min(80, Math.floor(window.innerWidth / 15));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#7C3AED';
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#06B6D4';

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        if (mouse.x !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            p.x -= dx * 0.02;
            p.y -= dy * 0.02;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? primary : accent;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = primary;
            ctx.globalAlpha = 0.08 * (1 - dist / 100);
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });

      animationId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
  }

  /* ---- Scroll reveal ---- */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  /* ---- Skill bars & circles ---- */
  function initSkillAnimations() {
    const skillSection = document.getElementById('skills');
    if (!skillSection) return;

    injectSkillGradient();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.querySelectorAll('.skill-bar__fill').forEach((bar) => {
            const width = bar.dataset.width || 0;
            bar.style.width = `${width}%`;
          });

          entry.target.querySelectorAll('.skill-circle').forEach((circle) => {
            const percent = parseInt(circle.dataset.percent, 10) || 0;
            const progress = circle.querySelector('.skill-circle__progress');
            if (progress) {
              const circumference = 2 * Math.PI * 54;
              const offset = circumference - (percent / 100) * circumference;
              progress.style.stroke = 'url(#skillGradient)';
              progress.style.strokeDashoffset = offset;
            }
          });
        });
      },
      { threshold: 0.2 }
    );

    const animatePanel = (panel) => {
      panel.querySelectorAll('.skill-bar__fill').forEach((bar) => {
        bar.style.width = `${bar.dataset.width || 0}%`;
      });
      panel.querySelectorAll('.skill-circle').forEach((circle) => {
        const percent = parseInt(circle.dataset.percent, 10) || 0;
        const progress = circle.querySelector('.skill-circle__progress');
        if (progress) {
          const circumference = 2 * Math.PI * 54;
          progress.style.stroke = 'url(#skillGradient)';
          progress.style.strokeDashoffset = circumference - (percent / 100) * circumference;
        }
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const active = skillSection.querySelector('.skills__panel.active');
            if (active) animatePanel(active);
          }
        });
      },
      { threshold: 0.15 }
    );
    sectionObserver.observe(skillSection);

    skillSection.querySelectorAll('.skills__panel').forEach((panel) => {
      observer.observe(panel);
    });

    document.querySelectorAll('.skills__tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        setTimeout(() => {
          const activePanel = document.querySelector('.skills__panel.active');
          if (activePanel) {
            activePanel.querySelectorAll('.skill-bar__fill').forEach((bar) => {
              bar.style.width = '0';
              requestAnimationFrame(() => {
                bar.style.width = `${bar.dataset.width}%`;
              });
            });
          }
        }, 50);
      });
    });
  }

  function injectSkillGradient() {
    if (document.getElementById('skill-svg-defs')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'skill-svg-defs');
    svg.style.cssText = 'position:absolute;width:0;height:0;';
    svg.innerHTML = `
      <defs>
        <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#7C3AED"/>
          <stop offset="100%" style="stop-color:#06B6D4"/>
        </linearGradient>
      </defs>
    `;
    document.body.appendChild(svg);
  }

  /* ---- Counter animation ---- */
  function initCounters() {
    const counters = document.querySelectorAll('.stat-card__number[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const duration = 2000;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target) + (target >= 10 ? '+' : '');
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target + '+';
          }

          requestAnimationFrame(update);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  /* ---- Mouse parallax ---- */
  function initParallax() {
    const elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      elements.forEach((el) => {
        const strength = parseFloat(el.dataset.parallax) || 0.03;
        el.style.transform = `translate(${x * strength * 50}px, ${y * strength * 50}px)`;
      });
    });
  }

  /* ---- Timeline scroll glow ---- */
  function initTimelineObserver() {
    const items = document.querySelectorAll('.timeline__item');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelector('.timeline__node')?.classList.add('active');
          }
        });
      },
      { threshold: 0.4 }
    );

    items.forEach((item) => observer.observe(item));
  }

  /* ---- Init ---- */
  function init() {
    initLoader();
    initTyping();
    initParticles();
    initScrollReveal();
    initSkillAnimations();
    initCounters();
    initParallax();
    initTimelineObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
