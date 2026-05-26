/**
 * Renders portfolio from user profile data
 */
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const isPreview = params.get('preview') === '1';

  if (!PortfolioStorage.getSession()) {
    window.location.href = 'index.html';
    return;
  }

  const profile = PortfolioStorage.getCurrentProfile();
  if (!profile || !profile.name) {
    document.getElementById('portfolio-main').innerHTML = `
      <section class="section" style="min-height:60vh;display:flex;align-items:center;justify-content:center;text-align:center">
        <div class="container">
          <h2 class="section__title">No profile data yet</h2>
          <p style="color:var(--text-muted);margin:1rem 0 2rem">Add your information in the profile editor first.</p>
          <a href="profile.html" class="btn btn--primary">Go to Profile</a>
        </div>
      </section>`;
    document.getElementById('loader')?.classList.add('hidden');
    return;
  }

  const name = profile.name;
  const firstName = name.split(' ')[0];
  const siteTitle = profile.portfolioTitle || `${name} Portfolio`;
  const titles = profile.titles?.length ? profile.titles : ['Developer'];
  const placeholderImg = 'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="480" viewBox="0 0 400 480"><rect fill="%231E293B" width="400" height="480"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394A3B8" font-family="sans-serif" font-size="24">No Photo</text></svg>`
  );

  document.title = siteTitle;
  const loaderText = document.getElementById('loader-text');
  if (loaderText) loaderText.textContent = siteTitle;

  if (isPreview) {
    const bar = document.getElementById('preview-bar');
    if (bar) {
      bar.hidden = false;
      document.body.classList.add('has-preview-bar');
    }
  }

  function esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function socialIcon(key, icon) {
    const url = profile.social?.[key];
    if (!url) return '';
    return `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${key}"><i class="fab ${icon}"></i></a>`;
  }

  function renderNav() {
    const logo = document.getElementById('nav-logo');
    const short = firstName;
    logo.innerHTML = `<span class="nav__logo-icon">&lt;/&gt;</span><span>${esc(short)}<span class="text-gradient">.</span></span>`;

    const links = [
      ['home', 'Home'],
      ['about', 'About'],
      ['skills', 'Skills'],
      ['projects', 'Projects'],
      ['services', 'Services'],
      ['resume', 'Resume'],
      ['experience', 'Experience'],
      ['testimonials', 'Reviews'],
      ['contact', 'Contact']
    ];
    document.getElementById('nav-menu').innerHTML = links
      .map(([id, label], i) => `<li><a href="#${id}" class="nav__link${i === 0 ? ' active' : ''}">${label}</a></li>`)
      .join('');
  }

  function renderHero() {
    const socials = [
      socialIcon('github', 'fa-github'),
      socialIcon('linkedin', 'fa-linkedin-in'),
      socialIcon('twitter', 'fa-x-twitter'),
      socialIcon('dribbble', 'fa-dribbble')
    ].filter(Boolean).join('');

    const resumeBtn = profile.resumeUrl
      ? `<a href="${esc(profile.resumeUrl)}" class="btn btn--outline" target="_blank" rel="noopener"><i class="fas fa-download"></i><span>Download Resume</span></a>`
      : '';

    const years = profile.stats?.years ? `${profile.stats.years}+ Years` : profile.experienceLabel || '';
    const projects = profile.stats?.projects ? `${profile.stats.projects}+ Projects` : '';

    return `
    <section class="hero section" id="home">
      <div class="hero__bg-gradient"></div>
      <div class="container hero__container">
        <div class="hero__content reveal">
          <p class="hero__greeting">Hi, I'm <span class="text-gradient">${esc(firstName)}</span></p>
          <h1 class="hero__title">
            <span class="hero__title-line">I build</span>
            <span class="hero__typing" id="typing-text"></span>
            <span class="hero__cursor">|</span>
          </h1>
          <p class="hero__description">${esc(profile.tagline || '')}</p>
          <div class="hero__cta">
            <a href="#projects" class="btn btn--primary"><span>View Projects</span><i class="fas fa-arrow-right"></i></a>
            ${resumeBtn}
          </div>
          ${socials ? `<div class="hero__social">${socials}</div>` : ''}
        </div>
        <div class="hero__image-wrapper reveal" data-parallax="0.05">
          <div class="hero__image-glow"></div>
          <div class="hero__image-card glass">
            <img src="${esc(profile.photo || placeholderImg)}" alt="${esc(name)}" class="hero__image" width="400" height="480">
            ${years ? `<div class="hero__badge hero__badge--top"><i class="fas fa-code"></i><span>${esc(years)}</span></div>` : ''}
            ${projects ? `<div class="hero__badge hero__badge--bottom"><i class="fas fa-rocket"></i><span>${esc(projects)}</span></div>` : ''}
          </div>
        </div>
      </div>
      <a href="#about" class="hero__scroll"><span>Scroll</span><i class="fas fa-chevron-down"></i></a>
    </section>`;
  }

  function renderAbout() {
    const stats = profile.stats || {};
    const techs = profile.technologies || [];
    const marquee = techs.length
      ? [...techs, ...techs].map((t) => `<span>${esc(t)}</span>`).join('')
      : '';

    return `
    <section class="about section" id="about">
      <div class="container">
        <div class="section__header reveal">
          <span class="section__tag">About Me</span>
          <h2 class="section__title">Turning Ideas Into <span class="text-gradient">Digital Reality</span></h2>
        </div>
        <div class="about__grid">
          <div class="about__content reveal">
            ${profile.bio ? `<p class="about__text">${esc(profile.bio)}</p>` : ''}
            ${profile.bio2 ? `<p class="about__text">${esc(profile.bio2)}</p>` : ''}
            <div class="about__info">
              ${profile.location ? `<div class="about__info-item"><i class="fas fa-map-marker-alt"></i><div><span>Location</span><strong>${esc(profile.location)}</strong></div></div>` : ''}
              ${profile.email ? `<div class="about__info-item"><i class="fas fa-envelope"></i><div><span>Email</span><strong>${esc(profile.email)}</strong></div></div>` : ''}
              ${profile.education ? `<div class="about__info-item"><i class="fas fa-graduation-cap"></i><div><span>Education</span><strong>${esc(profile.education)}</strong></div></div>` : ''}
              ${profile.experienceLabel ? `<div class="about__info-item"><i class="fas fa-briefcase"></i><div><span>Experience</span><strong>${esc(profile.experienceLabel)}</strong></div></div>` : ''}
            </div>
            <a href="#contact" class="btn btn--primary">Let's Work Together</a>
          </div>
          <div class="about__stats reveal">
            ${statCard('fa-folder-open', stats.projects, 'Projects Completed')}
            ${statCard('fa-users', stats.clients, 'Happy Clients')}
            ${statCard('fa-clock', stats.years, 'Years Experience')}
            ${statCard('fa-layer-group', stats.technologies, 'Technologies Mastered')}
          </div>
        </div>
        ${marquee ? `<div class="about__tech reveal"><h3>Technologies I Work With</h3><div class="tech-marquee"><div class="tech-marquee__track">${marquee}</div></div></div>` : ''}
      </div>
    </section>`;
  }

  function statCard(icon, num, label) {
    if (!num && num !== 0) return '';
    return `<div class="stat-card glass"><div class="stat-card__icon"><i class="fas ${icon}"></i></div><span class="stat-card__number" data-count="${num}">0</span><span class="stat-card__label">${label}</span></div>`;
  }

  function renderSkills() {
    const skills = profile.skills || {};
    const cats = Object.keys(skills).filter((k) => skills[k]?.length);
    if (!cats.length) return '';

    const tabs = cats.map((c, i) => `<button class="skills__tab${i === 0 ? ' active' : ''}" data-tab="${c}">${capitalize(c)}</button>`).join('');
    const panels = cats.map((cat, i) => {
      const items = skills[cat];
      const bars = items.map((s) => `
        <div class="skill-bar reveal">
          <div class="skill-bar__header"><span>${esc(s.name)}</span><span>${s.percent}%</span></div>
          <div class="skill-bar__track"><div class="skill-bar__fill" data-width="${s.percent}"></div></div>
        </div>`).join('');
      return `<div class="skills__panel${i === 0 ? ' active' : ''}" id="panel-${cat}"><div class="skills__grid">${bars}</div></div>`;
    }).join('');

    return `
    <section class="skills section" id="skills">
      <div class="container">
        <div class="section__header reveal"><span class="section__tag">My Skills</span><h2 class="section__title">Technical <span class="text-gradient">Expertise</span></h2></div>
        <div class="skills__tabs reveal">${tabs}</div>
        <div class="skills__panels">${panels}</div>
      </div>
    </section>`;
  }

  function capitalize(s) {
    if (s === 'uiux') return 'UI/UX';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function renderProjects() {
    const projects = profile.projects || [];
    if (!projects.length) return '';

    const filters = ['all', 'web', 'android', 'ai', 'ui'];
    const filterLabels = { all: 'All', web: 'Web Apps', android: 'Android', ai: 'AI Projects', ui: 'UI Designs' };
    const filterBtns = filters.map((f, i) => `<button class="projects__filter${i === 0 ? ' active' : ''}" data-filter="${f}">${filterLabels[f]}</button>`).join('');

    const cards = projects.map((p) => {
      const tags = (p.tags || []).map((t) => `<span>${esc(t)}</span>`).join('');
      const img = p.image || placeholderImg;
      const demo = p.demo ? `<a href="${esc(p.demo)}" class="project-card__link" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i></a>` : '';
      const gh = p.github ? `<a href="${esc(p.github)}" class="project-card__link" target="_blank" rel="noopener"><i class="fab fa-github"></i></a>` : '';
      return `
      <article class="project-card glass reveal" data-category="${esc(p.category || 'web')}">
        <div class="project-card__image">
          <img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy" width="600" height="400">
          <div class="project-card__overlay">${demo}${gh}</div>
        </div>
        <div class="project-card__content">
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          <div class="project-card__tags">${tags}</div>
        </div>
      </article>`;
    }).join('');

    return `
    <section class="projects section" id="projects">
      <div class="container">
        <div class="section__header reveal"><span class="section__tag">Portfolio</span><h2 class="section__title">Featured <span class="text-gradient">Projects</span></h2></div>
        <div class="projects__filters reveal">${filterBtns}</div>
        <div class="projects__grid">${cards}</div>
      </div>
    </section>`;
  }

  function renderServices() {
    const services = profile.services || [];
    if (!services.length) return '';

    const cards = services.map((s) => `
      <div class="service-card reveal">
        <div class="service-card__icon"><i class="fas ${esc(s.icon || 'fa-laptop-code')}"></i></div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
        <span class="service-card__glow"></span>
      </div>`).join('');

    return `
    <section class="services section" id="services">
      <div class="container">
        <div class="section__header reveal"><span class="section__tag">Services</span><h2 class="section__title">What I <span class="text-gradient">Offer</span></h2></div>
        <div class="services__grid">${cards}</div>
      </div>
    </section>`;
  }

  function renderResume() {
    const certs = profile.certifications || [];
    const skills = [];
    Object.values(profile.skills || {}).forEach((arr) => arr.forEach((s) => skills.push(s.name)));
    const uniqueSkills = [...new Set(skills)].slice(0, 8);

    const certHtml = certs.map((c) => `
      <div class="cert-card glass">
        <i class="fas fa-certificate"></i>
        <div><h4>${esc(c.title)}</h4><span>${esc(c.issuer)}</span></div>
      </div>`).join('');

    const resumeBtn = profile.resumeUrl
      ? `<a href="${esc(profile.resumeUrl)}" class="btn btn--primary btn--block" target="_blank" rel="noopener"><i class="fas fa-download"></i> Download CV</a>`
      : '';

    return `
    <section class="resume section" id="resume">
      <div class="container">
        <div class="section__header reveal"><span class="section__tag">Resume</span><h2 class="section__title">My <span class="text-gradient">Credentials</span></h2></div>
        <div class="resume__grid">
          <div class="resume__preview glass reveal">
            <div class="resume__preview-header">
              <div class="resume__avatar"><img src="${esc(profile.photo || placeholderImg)}" alt="${esc(name)}" width="80" height="80"></div>
              <div><h3>${esc(name)}</h3><p>${esc(titles[0] || '')}</p></div>
            </div>
            <div class="resume__preview-body">
              ${profile.bio ? `<h4>Summary</h4><p>${esc(profile.bio.slice(0, 200))}${profile.bio.length > 200 ? '…' : ''}</p>` : ''}
              ${uniqueSkills.length ? `<h4>Core Skills</h4><div class="resume__skills-list">${uniqueSkills.map((s) => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
            </div>
            ${resumeBtn}
          </div>
          ${certs.length ? `<div class="resume__certs reveal"><h3>Certifications</h3>${certHtml}</div>` : '<div></div>'}
        </div>
      </div>
    </section>`;
  }

  function renderExperience() {
    const exp = profile.experience || [];
    if (!exp.length) return '';

    const items = exp.map((e) => `
      <div class="timeline__item reveal">
        <div class="timeline__node"></div>
        <div class="timeline__content glass">
          <span class="timeline__date">${esc(e.date)}</span>
          <h3>${esc(e.title)}</h3>
          <p class="timeline__company">${esc(e.company)}</p>
          <p>${esc(e.description)}</p>
        </div>
      </div>`).join('');

    return `
    <section class="experience section" id="experience">
      <div class="container">
        <div class="section__header reveal"><span class="section__tag">Journey</span><h2 class="section__title">Experience <span class="text-gradient">Timeline</span></h2></div>
        <div class="timeline">${items}</div>
      </div>
    </section>`;
  }

  function renderTestimonials() {
    const items = profile.testimonials || [];
    if (!items.length) return '';

    const cards = items.map((t) => {
      const rating = Math.min(5, Math.max(1, t.rating || 5));
      const stars = Array.from({ length: 5 }, (_, i) =>
        `<i class="${i < rating ? 'fas' : 'far'} fa-star"></i>`
      ).join('');
      const img = t.image || placeholderImg;
      return `
      <div class="testimonial-card glass">
        <div class="testimonial-card__stars">${stars}</div>
        <p>"${esc(t.text)}"</p>
        <div class="testimonial-card__author">
          <img src="${esc(img)}" alt="${esc(t.name)}" width="56" height="56" loading="lazy">
          <div><strong>${esc(t.name)}</strong><span>${esc(t.role)}</span></div>
        </div>
      </div>`;
    }).join('');

    return `
    <section class="testimonials section" id="testimonials">
      <div class="container">
        <div class="section__header reveal"><span class="section__tag">Testimonials</span><h2 class="section__title">Client <span class="text-gradient">Reviews</span></h2></div>
        <div class="testimonials__slider reveal">
          <div class="testimonials__track" id="testimonials-track">${cards}</div>
          <div class="testimonials__dots" id="testimonials-dots"></div>
        </div>
      </div>
    </section>`;
  }

  function renderContact() {
    const socials = [
      socialIcon('github', 'fa-github'),
      socialIcon('linkedin', 'fa-linkedin-in'),
      socialIcon('twitter', 'fa-x-twitter'),
      socialIcon('instagram', 'fa-instagram')
    ].filter(Boolean).join('');

    const map = profile.mapEmbed
      ? `<div class="contact__map reveal"><iframe src="${esc(profile.mapEmbed)}" width="100%" height="350" style="border:0" allowfullscreen loading="lazy" title="Location map"></iframe></div>`
      : '';

    return `
    <section class="contact section" id="contact">
      <div class="container">
        <div class="section__header reveal"><span class="section__tag">Contact</span><h2 class="section__title">Let's Build <span class="text-gradient">Together</span></h2></div>
        <div class="contact__grid">
          <div class="contact__info reveal">
            ${profile.email ? `<div class="contact-card glass"><i class="fas fa-envelope"></i><div><span>Email</span><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></div></div>` : ''}
            ${profile.phone ? `<div class="contact-card glass"><i class="fas fa-phone"></i><div><span>Phone</span><a href="tel:${esc(profile.phone)}">${esc(profile.phone)}</a></div></div>` : ''}
            ${profile.location ? `<div class="contact-card glass"><i class="fas fa-map-marker-alt"></i><div><span>Location</span><strong>${esc(profile.location)}</strong></div></div>` : ''}
            ${socials ? `<div class="contact__social">${socials}</div>` : ''}
          </div>
          <form class="contact__form glass reveal" id="contact-form" novalidate>
            <div class="form-group"><input type="text" id="name" required placeholder=" "><label for="name">Your Name</label><span class="form-error" id="name-error"></span></div>
            <div class="form-group"><input type="email" id="email" required placeholder=" "><label for="email">Your Email</label><span class="form-error" id="email-error"></span></div>
            <div class="form-group"><input type="text" id="subject" required placeholder=" "><label for="subject">Subject</label><span class="form-error" id="subject-error"></span></div>
            <div class="form-group"><textarea id="message" rows="5" required placeholder=" "></textarea><label for="message">Your Message</label><span class="form-error" id="message-error"></span></div>
            <button type="submit" class="btn btn--primary btn--block"><span>Send Message</span><i class="fas fa-paper-plane"></i></button>
          </form>
        </div>
        ${map}
      </div>
    </section>`;
  }

  function renderFooter() {
    const socials = [
      socialIcon('github', 'fa-github'),
      socialIcon('linkedin', 'fa-linkedin-in'),
      socialIcon('twitter', 'fa-x-twitter'),
      socialIcon('dribbble', 'fa-dribbble')
    ].filter(Boolean).join('');

    document.getElementById('portfolio-footer').innerHTML = `
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <a href="#home" class="nav__logo"><span class="nav__logo-icon">&lt;/&gt;</span><span>${esc(firstName)}<span class="text-gradient">.</span></span></a>
            <p>${esc(profile.tagline || 'Personal developer portfolio.')}</p>
          </div>
          <div class="footer__links"><h4>Quick Links</h4><ul>
            <li><a href="#home">Home</a></li><li><a href="#about">About</a></li><li><a href="#projects">Projects</a></li><li><a href="#contact">Contact</a></li>
          </ul></div>
          <div class="footer__links"><h4>Sections</h4><ul>
            <li><a href="#skills">Skills</a></li><li><a href="#services">Services</a></li><li><a href="#experience">Experience</a></li>
          </ul></div>
          ${socials ? `<div class="footer__social"><h4>Follow</h4><div class="footer__social-icons">${socials}</div></div>` : ''}
        </div>
        <div class="footer__bottom">
          <p>&copy; ${new Date().getFullYear()} ${esc(siteTitle)}. All rights reserved.</p>
          <button class="back-to-top" id="back-to-top" aria-label="Back to top"><i class="fas fa-arrow-up"></i></button>
        </div>
      </div>`;
  }

  renderNav();
  document.getElementById('portfolio-main').innerHTML = [
    renderHero(),
    renderAbout(),
    renderSkills(),
    renderProjects(),
    renderServices(),
    renderResume(),
    renderExperience(),
    renderTestimonials(),
    renderContact()
  ].join('');

  renderFooter();

  window.__PORTFOLIO_TYPING_PHRASES__ = titles;
})();
