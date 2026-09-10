/**
 * AppTechno CampusOS - Login Page Form & Role Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const loginForm = document.getElementById('login-form');
  const submitBtn = document.getElementById('btn-submit-login');
  let isPasswordVisible = false;

  // 1. Email Field Interactions -> Robot watches
  if (emailInput) {
    emailInput.addEventListener('focus', () => {
      window.RobotMascot?.watchEmail(emailInput);
    });

    emailInput.addEventListener('input', () => {
      window.RobotMascot?.watchEmail(emailInput);
    });

    emailInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.activeElement !== passwordInput && document.activeElement !== emailInput) {
          window.RobotMascot?.setIdle();
        }
      }, 50);
    });
  }

  // 2. Password Field Interactions -> Robot covers eyes / peeks
  if (passwordInput) {
    passwordInput.addEventListener('focus', () => {
      if (isPasswordVisible) {
        window.RobotMascot?.peek();
      } else {
        window.RobotMascot?.coverEyes();
      }
    });

    passwordInput.addEventListener('input', () => {
      if (isPasswordVisible) {
        window.RobotMascot?.peek();
      } else {
        window.RobotMascot?.coverEyes();
      }
    });

    passwordInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.activeElement !== passwordInput && document.activeElement !== emailInput) {
          window.RobotMascot?.setIdle();
        }
      }, 50);
    });
  }

  // 3. Show/Hide Password Toggle
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isPasswordVisible = !isPasswordVisible;

      if (isPasswordVisible) {
        passwordInput.type = 'text';
        togglePasswordBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        `;
        // Robot peeks through hands when password is revealed!
        if (document.activeElement === passwordInput || passwordInput.value.length > 0) {
          window.RobotMascot?.peek();
        }
      } else {
        passwordInput.type = 'password';
        togglePasswordBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `;
        // Robot returns to covering eyes
        if (document.activeElement === passwordInput || passwordInput.value.length > 0) {
          window.RobotMascot?.coverEyes();
        }
      }
    });
  }

  // 4. Form Submit & Celebration
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        showLoginToast('Please enter your email and password.', 'error');
        return;
      }

      // Show Loading State
      submitBtn.classList.add('loading');
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        <span>Authenticating...</span>
      `;

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Access Granted!</span>
        `;
        submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

        // Robot celebrates!
        window.RobotMascot?.celebrate();
        showLoginToast('Welcome back! Redirecting to Dashboard...', 'success');

        // Check if role was passed in query params
        const urlParams = new URLSearchParams(window.location.search);
        const role = urlParams.get('role');
        const targetUrl = role ? `dashboard.html?role=${encodeURIComponent(role)}` : 'dashboard.html';

        // Smooth quick redirect to dashboard
        setTimeout(() => {
          window.location.replace(targetUrl);
        }, 700);
      }, 600);
    });
  }

  // Toast Helper for Login
  function showLoginToast(message, type = 'info') {
    const container = document.getElementById('login-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' 
          ? '<polyline points="20 6 9 17 4 12"></polyline>' 
          : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});
