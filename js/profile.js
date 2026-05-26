(function () {
  'use strict';

  if (!PortfolioStorage.requireAuth()) return;

  const user = PortfolioStorage.getCurrentUser();
  let profile = PortfolioStorage.getCurrentProfile();
  let dirty = false;

  const els = {
    greeting: document.getElementById('user-greeting'),
    emptyBanner: document.getElementById('empty-banner'),
    saveStatus: document.getElementById('save-status')
  };

  function markDirty() {
    dirty = true;
    if (els.saveStatus) {
      els.saveStatus.textContent = 'Unsaved changes';
      els.saveStatus.classList.remove('saved');
    }
  }

  function markSaved() {
    dirty = false;
    if (els.saveStatus) {
      els.saveStatus.textContent = 'Profile saved successfully';
      els.saveStatus.classList.add('saved');
    }
  }

  function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    const saved = PortfolioStorage.getTheme();

    function apply(theme) {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (icon) icon.className = 'fas fa-sun';
      } else {
        document.documentElement.removeAttribute('data-theme');
        if (icon) icon.className = 'fas fa-moon';
      }
      PortfolioStorage.setTheme(theme);
    }

    apply(saved);
    toggle?.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      apply(isLight ? 'dark' : 'light');
    });
  }

  function initNav() {
    document.querySelectorAll('.profile-nav__link').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.section;
        document.querySelectorAll('.profile-nav__link').forEach((b) => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.profile-section').forEach((s) => {
          s.classList.toggle('active', s.id === `section-${id}`);
        });
      });
    });
  }

  function skillsToRaw(skills) {
    const lines = [];
    Object.keys(skills || {}).forEach((cat) => {
      (skills[cat] || []).forEach((s) => {
        lines.push(`${s.name}|${s.percent}|${cat}`);
      });
    });
    return lines.join('\n');
  }

  function rawToSkills(raw) {
    const skills = { frontend: [], backend: [], android: [], database: [], uiux: [], tools: [] };
    raw.split('\n').forEach((line) => {
      const parts = line.trim().split('|');
      if (parts.length < 2) return;
      const [name, percent, category = 'frontend'] = parts;
      const cat = category.trim().toLowerCase();
      if (!skills[cat]) skills[cat] = [];
      skills[cat].push({ name: name.trim(), percent: parseInt(percent, 10) || 0 });
    });
    return skills;
  }

  function createProjectItem(p = {}, index = 0) {
    const div = document.createElement('div');
    div.className = 'dynamic-item glass';
    div.innerHTML = `
      <button type="button" class="dynamic-item__remove" aria-label="Remove"><i class="fas fa-times"></i></button>
      <div class="form-group"><input type="text" data-f="title" value="${esc(p.title)}" placeholder=" "><label>Project Title</label></div>
      <div class="form-group"><textarea data-f="description" rows="2" placeholder=" ">${esc(p.description)}</textarea><label>Description</label></div>
      <div class="form-row">
        <div class="form-group"><input type="url" data-f="image" value="${esc(p.image)}" placeholder=" "><label>Image URL</label></div>
        <div class="form-group">
          <select data-f="category">
            <option value="web" ${p.category === 'web' ? 'selected' : ''}>Web</option>
            <option value="android" ${p.category === 'android' ? 'selected' : ''}>Android</option>
            <option value="ai" ${p.category === 'ai' ? 'selected' : ''}>AI</option>
            <option value="ui" ${p.category === 'ui' ? 'selected' : ''}>UI Design</option>
          </select>
          <label>Category</label>
        </div>
      </div>
      <div class="form-group"><input type="text" data-f="tags" value="${esc((p.tags || []).join(', '))}" placeholder=" "><label>Tags (comma-separated)</label></div>
      <div class="form-row">
        <div class="form-group"><input type="url" data-f="demo" value="${esc(p.demo)}" placeholder=" "><label>Live Demo URL</label></div>
        <div class="form-group"><input type="url" data-f="github" value="${esc(p.github)}" placeholder=" "><label>GitHub URL</label></div>
      </div>
    `;
    div.querySelector('.dynamic-item__remove').addEventListener('click', () => {
      div.remove();
      markDirty();
    });
    div.querySelectorAll('input, textarea, select').forEach((el) => el.addEventListener('input', markDirty));
    return div;
  }

  function createServiceItem(s = {}) {
    const div = document.createElement('div');
    div.className = 'dynamic-item glass';
    div.innerHTML = `
      <button type="button" class="dynamic-item__remove"><i class="fas fa-times"></i></button>
      <div class="form-group"><input type="text" data-f="title" value="${esc(s.title)}" placeholder=" "><label>Service Title</label></div>
      <div class="form-group"><textarea data-f="description" rows="2" placeholder=" ">${esc(s.description)}</textarea><label>Description</label></div>
      <div class="form-group"><input type="text" data-f="icon" value="${esc(s.icon || 'fa-laptop-code')}" placeholder=" "><label>Font Awesome class (e.g. fa-laptop-code)</label></div>
    `;
    div.querySelector('.dynamic-item__remove').addEventListener('click', () => { div.remove(); markDirty(); });
    div.querySelectorAll('input, textarea').forEach((el) => el.addEventListener('input', markDirty));
    return div;
  }

  function createExperienceItem(e = {}) {
    const div = document.createElement('div');
    div.className = 'dynamic-item glass';
    div.innerHTML = `
      <button type="button" class="dynamic-item__remove"><i class="fas fa-times"></i></button>
      <div class="form-row">
        <div class="form-group"><input type="text" data-f="date" value="${esc(e.date)}" placeholder=" "><label>Date Range</label></div>
        <div class="form-group"><input type="text" data-f="company" value="${esc(e.company)}" placeholder=" "><label>Company / School</label></div>
      </div>
      <div class="form-group"><input type="text" data-f="title" value="${esc(e.title)}" placeholder=" "><label>Title / Degree</label></div>
      <div class="form-group"><textarea data-f="description" rows="2" placeholder=" ">${esc(e.description)}</textarea><label>Description</label></div>
    `;
    div.querySelector('.dynamic-item__remove').addEventListener('click', () => { div.remove(); markDirty(); });
    div.querySelectorAll('input, textarea').forEach((el) => el.addEventListener('input', markDirty));
    return div;
  }

  function createCertItem(c = {}) {
    const div = document.createElement('div');
    div.className = 'dynamic-item glass';
    div.innerHTML = `
      <button type="button" class="dynamic-item__remove"><i class="fas fa-times"></i></button>
      <div class="form-group"><input type="text" data-f="title" value="${esc(c.title)}" placeholder=" "><label>Certification Name</label></div>
      <div class="form-group"><input type="text" data-f="issuer" value="${esc(c.issuer)}" placeholder=" "><label>Issuer & Year</label></div>
    `;
    div.querySelector('.dynamic-item__remove').addEventListener('click', () => { div.remove(); markDirty(); });
    div.querySelectorAll('input').forEach((el) => el.addEventListener('input', markDirty));
    return div;
  }

  function createTestimonialItem(t = {}) {
    const div = document.createElement('div');
    div.className = 'dynamic-item glass';
    div.innerHTML = `
      <button type="button" class="dynamic-item__remove"><i class="fas fa-times"></i></button>
      <div class="form-group"><textarea data-f="text" rows="3" placeholder=" ">${esc(t.text)}</textarea><label>Feedback</label></div>
      <div class="form-row">
        <div class="form-group"><input type="text" data-f="name" value="${esc(t.name)}" placeholder=" "><label>Name</label></div>
        <div class="form-group"><input type="text" data-f="role" value="${esc(t.role)}" placeholder=" "><label>Role / Company</label></div>
      </div>
      <div class="form-row">
        <div class="form-group"><input type="url" data-f="image" value="${esc(t.image)}" placeholder=" "><label>Photo URL</label></div>
        <div class="form-group"><input type="number" data-f="rating" min="1" max="5" value="${t.rating || 5}" placeholder=" "><label>Rating (1-5)</label></div>
      </div>
    `;
    div.querySelector('.dynamic-item__remove').addEventListener('click', () => { div.remove(); markDirty(); });
    div.querySelectorAll('input, textarea').forEach((el) => el.addEventListener('input', markDirty));
    return div;
  }

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function collectDynamicList(containerId, fields) {
    const items = [];
    document.querySelectorAll(`#${containerId} .dynamic-item`).forEach((item) => {
      const obj = {};
      fields.forEach((f) => {
        const el = item.querySelector(`[data-f="${f}"]`);
        if (!el) return;
        if (f === 'tags') obj.tags = el.value.split(',').map((t) => t.trim()).filter(Boolean);
        else if (f === 'rating') obj.rating = parseInt(el.value, 10) || 5;
        else obj[f] = el.value.trim();
      });
      if (obj.title || obj.text) items.push(obj);
    });
    return items;
  }

  function populateForm() {
    if (els.greeting) els.greeting.textContent = user.name || 'User';

    document.getElementById('pf-name').value = profile.name || '';
    document.getElementById('pf-portfolio-title').value = profile.portfolioTitle || '';
    document.getElementById('pf-titles').value = (profile.titles || []).join(', ');
    document.getElementById('pf-tagline').value = profile.tagline || '';
    document.getElementById('pf-photo-url').value = profile.photo && !profile.photo.startsWith('data:') ? profile.photo : '';
    document.getElementById('pf-resume').value = profile.resumeUrl || '';
    document.getElementById('pf-bio').value = profile.bio || '';
    document.getElementById('pf-bio2').value = profile.bio2 || '';
    document.getElementById('pf-location').value = profile.location || '';
    document.getElementById('pf-education').value = profile.education || '';
    document.getElementById('pf-experience-label').value = profile.experienceLabel || '';
    document.getElementById('pf-technologies').value = (profile.technologies || []).join(', ');
    document.getElementById('pf-stat-projects').value = profile.stats?.projects ?? '';
    document.getElementById('pf-stat-clients').value = profile.stats?.clients ?? '';
    document.getElementById('pf-stat-years').value = profile.stats?.years ?? '';
    document.getElementById('pf-stat-tech').value = profile.stats?.technologies ?? '';
    document.getElementById('pf-skills-raw').value = skillsToRaw(profile.skills);
    document.getElementById('pf-email').value = profile.email || user.email || '';
    document.getElementById('pf-phone').value = profile.phone || '';
    document.getElementById('pf-github').value = profile.social?.github || '';
    document.getElementById('pf-linkedin').value = profile.social?.linkedin || '';
    document.getElementById('pf-twitter').value = profile.social?.twitter || '';
    document.getElementById('pf-dribbble').value = profile.social?.dribbble || '';
    document.getElementById('pf-instagram').value = profile.social?.instagram || '';
    document.getElementById('pf-map').value = profile.mapEmbed || '';

    const preview = document.getElementById('pf-photo-preview');
    if (profile.photo) {
      preview.src = profile.photo;
      preview.classList.add('visible');
    }

    const pl = document.getElementById('projects-list');
    pl.innerHTML = '';
    (profile.projects || []).forEach((p) => pl.appendChild(createProjectItem(p)));
    if (!profile.projects?.length) pl.appendChild(createProjectItem());

    const sl = document.getElementById('services-list');
    sl.innerHTML = '';
    (profile.services || []).forEach((s) => sl.appendChild(createServiceItem(s)));
    if (!profile.services?.length) sl.appendChild(createServiceItem());

    const el = document.getElementById('experience-list');
    el.innerHTML = '';
    (profile.experience || []).forEach((e) => el.appendChild(createExperienceItem(e)));

    const cl = document.getElementById('certs-list');
    cl.innerHTML = '';
    (profile.certifications || []).forEach((c) => cl.appendChild(createCertItem(c)));

    const tl = document.getElementById('testimonials-list');
    tl.innerHTML = '';
    (profile.testimonials || []).forEach((t) => tl.appendChild(createTestimonialItem(t)));

    updateEmptyBanner();
  }

  function collectProfile() {
    const photoUrl = document.getElementById('pf-photo-url').value.trim();
    const preview = document.getElementById('pf-photo-preview');
    let photo = photoUrl;
    if (preview.classList.contains('visible') && preview.src.startsWith('data:')) {
      photo = preview.src;
    }

    return {
      name: document.getElementById('pf-name').value.trim(),
      portfolioTitle: document.getElementById('pf-portfolio-title').value.trim() || 'My Portfolio',
      titles: document.getElementById('pf-titles').value.split(',').map((t) => t.trim()).filter(Boolean),
      tagline: document.getElementById('pf-tagline').value.trim(),
      bio: document.getElementById('pf-bio').value.trim(),
      bio2: document.getElementById('pf-bio2').value.trim(),
      photo,
      location: document.getElementById('pf-location').value.trim(),
      education: document.getElementById('pf-education').value.trim(),
      experienceLabel: document.getElementById('pf-experience-label').value.trim(),
      resumeUrl: document.getElementById('pf-resume').value.trim(),
      email: document.getElementById('pf-email').value.trim(),
      phone: document.getElementById('pf-phone').value.trim(),
      technologies: document.getElementById('pf-technologies').value.split(',').map((t) => t.trim()).filter(Boolean),
      stats: {
        projects: parseInt(document.getElementById('pf-stat-projects').value, 10) || 0,
        clients: parseInt(document.getElementById('pf-stat-clients').value, 10) || 0,
        years: parseInt(document.getElementById('pf-stat-years').value, 10) || 0,
        technologies: parseInt(document.getElementById('pf-stat-tech').value, 10) || 0
      },
      skills: rawToSkills(document.getElementById('pf-skills-raw').value),
      projects: collectDynamicList('projects-list', ['title', 'description', 'image', 'category', 'tags', 'demo', 'github']),
      services: collectDynamicList('services-list', ['title', 'description', 'icon']),
      experience: collectDynamicList('experience-list', ['date', 'title', 'company', 'description']),
      certifications: collectDynamicList('certs-list', ['title', 'issuer']),
      testimonials: collectDynamicList('testimonials-list', ['text', 'name', 'role', 'image', 'rating']),
      social: {
        github: document.getElementById('pf-github').value.trim(),
        linkedin: document.getElementById('pf-linkedin').value.trim(),
        twitter: document.getElementById('pf-twitter').value.trim(),
        dribbble: document.getElementById('pf-dribbble').value.trim(),
        instagram: document.getElementById('pf-instagram').value.trim()
      },
      mapEmbed: document.getElementById('pf-map').value.trim()
    };
  }

  function saveProfile() {
    profile = collectProfile();
    if (!profile.name) {
      alert('Please enter your name before saving.');
      return false;
    }
    PortfolioStorage.saveProfile(user.id, profile);
    markSaved();
    updateEmptyBanner();
    return true;
  }

  function updateEmptyBanner() {
    const p = collectProfile();
    const incomplete = !p.name || !p.bio;
    if (els.emptyBanner) els.emptyBanner.hidden = !incomplete;
  }

  function openTestPortfolio() {
    const currentName = document.getElementById('pf-name').value.trim();
    if (!currentName) {
      alert('Please add your name and save your profile first.');
      return;
    }
    if (dirty) {
      const saveFirst = confirm('Save your profile before previewing?');
      if (saveFirst) {
        if (!saveProfile()) return;
      }
    } else if (!profile.name) {
      saveProfile();
    }
    window.open('portfolio.html?preview=1', '_blank');
  }

  function bindEvents() {
    document.querySelectorAll('#section-basic input, #section-basic textarea, #section-about input, #section-about textarea, #section-skills textarea, #section-social input, #section-social textarea').forEach((el) => {
      el.addEventListener('input', () => { markDirty(); updateEmptyBanner(); });
    });

    document.getElementById('pf-photo-file')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 800000) {
        alert('Image is too large. Use a URL or a smaller image (under 800KB).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const preview = document.getElementById('pf-photo-preview');
        preview.src = reader.result;
        preview.classList.add('visible');
        markDirty();
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('add-project')?.addEventListener('click', () => {
      document.getElementById('projects-list').appendChild(createProjectItem());
      markDirty();
    });
    document.getElementById('add-service')?.addEventListener('click', () => {
      document.getElementById('services-list').appendChild(createServiceItem());
      markDirty();
    });
    document.getElementById('add-experience')?.addEventListener('click', () => {
      document.getElementById('experience-list').appendChild(createExperienceItem());
      markDirty();
    });
    document.getElementById('add-cert')?.addEventListener('click', () => {
      document.getElementById('certs-list').appendChild(createCertItem());
      markDirty();
    });
    document.getElementById('add-testimonial')?.addEventListener('click', () => {
      document.getElementById('testimonials-list').appendChild(createTestimonialItem());
      markDirty();
    });

    document.getElementById('btn-save-profile')?.addEventListener('click', saveProfile);
    document.getElementById('btn-test-portfolio')?.addEventListener('click', openTestPortfolio);
    document.getElementById('btn-test-portfolio-2')?.addEventListener('click', openTestPortfolio);

    document.getElementById('btn-logout')?.addEventListener('click', () => {
      if (dirty && !confirm('You have unsaved changes. Logout anyway?')) return;
      PortfolioStorage.logout();
      window.location.href = 'index.html';
    });

    window.addEventListener('beforeunload', (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  initTheme();
  initNav();
  populateForm();
  bindEvents();
  markSaved();
})();
