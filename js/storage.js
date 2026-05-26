/**
 * Portfolio Platform — Data & Auth (localStorage)
 */
const PortfolioStorage = (function () {
  'use strict';

  const KEYS = {
    USERS: 'portfolio_users',
    PROFILES: 'portfolio_profiles',
    SESSION: 'portfolio_session',
    THEME: 'portfolio-theme'
  };

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  function getProfiles() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.PROFILES) || '{}');
    } catch {
      return {};
    }
  }

  function saveProfiles(profiles) {
    localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
  }

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    } catch {
      return null;
    }
  }

  function writeSession(session) {
    if (session) localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
    else localStorage.removeItem(KEYS.SESSION);
  }

  function generateId() {
    return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }

  function defaultProfile(user) {
    return {
      name: user.name || '',
      portfolioTitle: 'My Portfolio',
      titles: ['Full Stack Developer', 'UI/UX Designer'],
      tagline: 'Crafting premium digital experiences with clean code and great design.',
      bio: '',
      bio2: '',
      photo: '',
      location: '',
      email: user.email || '',
      phone: '',
      education: '',
      experienceLabel: '',
      resumeUrl: '',
      stats: { projects: 0, clients: 0, years: 0, technologies: 0 },
      technologies: [],
      skills: {
        frontend: [{ name: 'HTML5', percent: 90 }],
        backend: [{ name: 'Node.js', percent: 80 }],
        android: [{ name: 'Android', percent: 75 }],
        database: [{ name: 'MongoDB', percent: 80 }],
        uiux: [{ name: 'Figma', percent: 85 }],
        tools: [{ name: 'Git', percent: 90 }]
      },
      projects: [],
      services: [
        { title: 'Web Development', description: 'Modern responsive websites and web applications.', icon: 'fa-laptop-code' },
        { title: 'App Development', description: 'Mobile apps with great user experience.', icon: 'fa-mobile-alt' }
      ],
      experience: [],
      testimonials: [],
      certifications: [],
      social: { github: '', linkedin: '', twitter: '', dribbble: '', instagram: '' },
      mapEmbed: ''
    };
  }

  return {
    KEYS,

    register({ name, email, password }) {
      const users = getUsers();
      const normalizedEmail = email.trim().toLowerCase();
      if (users.some((u) => u.email === normalizedEmail)) {
        return { ok: false, error: 'An account with this email already exists.' };
      }
      if (password.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters.' };
      }
      const user = {
        id: generateId(),
        name: name.trim(),
        email: normalizedEmail,
        password: btoa(password)
      };
      users.push(user);
      saveUsers(users);
      const profiles = getProfiles();
      profiles[user.id] = defaultProfile(user);
      saveProfiles(profiles);
      writeSession({ userId: user.id, email: user.email, name: user.name });
      return { ok: true, user };
    },

    login({ email, password }) {
      const users = getUsers();
      const normalizedEmail = email.trim().toLowerCase();
      const user = users.find((u) => u.email === normalizedEmail);
      if (!user || user.password !== btoa(password)) {
        return { ok: false, error: 'Invalid email or password.' };
      }
      writeSession({ userId: user.id, email: user.email, name: user.name });
      return { ok: true, user };
    },

    logout() {
      writeSession(null);
    },

    getSession: readSession,

    getCurrentUser() {
      const session = readSession();
      if (!session) return null;
      const users = getUsers();
      const user = users.find((u) => u.id === session.userId);
      return user || null;
    },

    requireAuth(redirectUrl = 'index.html') {
      if (!readSession()) {
        window.location.href = redirectUrl;
        return false;
      }
      return true;
    },

    getProfile(userId) {
      const profiles = getProfiles();
      return profiles[userId] || null;
    },

    saveProfile(userId, profile) {
      const profiles = getProfiles();
      profiles[userId] = profile;
      saveProfiles(profiles);
      return profile;
    },

    getCurrentProfile() {
      const session = readSession();
      if (!session) return null;
      return getProfile(session.userId) || defaultProfile({ email: session.email, name: session.name });
    },

    getTheme() {
      return localStorage.getItem(KEYS.THEME) || 'dark';
    },

    setTheme(theme) {
      localStorage.setItem(KEYS.THEME, theme);
    }
  };
})();
