(function () {
  'use strict';

  if (PortfolioStorage.getCurrentUser()) {
    window.location.href = 'profile.html';
    return;
  }

  const alertEl = document.getElementById('auth-alert');
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const tabs = document.querySelectorAll('.auth-tab');

  function showAlert(message, type = 'error') {
    if (!alertEl) return;
    alertEl.textContent = message;
    alertEl.className = `auth-alert auth-alert--${type}`;
    alertEl.hidden = false;
  }

  function hideAlert() {
    if (alertEl) alertEl.hidden = true;
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      loginForm.classList.toggle('active', target === 'login');
      loginForm.hidden = target !== 'login';
      registerForm.classList.toggle('active', target === 'register');
      registerForm.hidden = target !== 'register';
      hideAlert();
    });
  });

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert();
    const result = PortfolioStorage.login({
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value
    });
    if (!result.ok) {
      showAlert(result.error);
      return;
    }
    window.location.href = 'profile.html';
  });

  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert();
    const result = PortfolioStorage.register({
      name: document.getElementById('register-name').value,
      email: document.getElementById('register-email').value,
      password: document.getElementById('register-password').value
    });
    if (!result.ok) {
      showAlert(result.error);
      return;
    }
    window.location.href = 'profile.html';
  });
})();
