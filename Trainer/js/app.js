/**
 * AppTechno CampusOS - Landing Page Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTestimonialsCarousel();
  initStatsCounter();
  initModals();
  initRoleCards();
  initHeroTilt();
});

// Toast Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
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
  }, 4000);
}

// Navbar scroll & smooth links
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });

  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// Testimonials Carousel
function initTestimonialsCarousel() {
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const grid = document.getElementById('testimonials-grid');
  
  if (!grid || dots.length === 0) return;

  let currentIndex = 0;
  const cards = grid.children;
  const total = cards.length;

  function updateCarousel(index) {
    currentIndex = (index + total) % total;
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    // In responsive mobile, highlight card
    if (window.innerWidth <= 1024) {
      Array.from(cards).forEach((c, idx) => {
        c.style.display = idx === currentIndex ? 'flex' : 'none';
      });
    } else {
      Array.from(cards).forEach(c => c.style.display = 'flex');
      Array.from(cards).forEach((c, idx) => {
        c.style.borderColor = idx === currentIndex ? 'rgba(37, 99, 235, 0.4)' : '#e2e8f0';
        c.style.transform = idx === currentIndex ? 'translateY(-6px)' : 'none';
      });
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => updateCarousel(currentIndex - 1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => updateCarousel(currentIndex + 1));
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => updateCarousel(idx));
  });

  // Auto rotate every 6s
  let autoTimer = setInterval(() => updateCarousel(currentIndex + 1), 6000);
  grid.addEventListener('mouseenter', () => clearInterval(autoTimer));
  grid.addEventListener('mouseleave', () => {
    autoTimer = setInterval(() => updateCarousel(currentIndex + 1), 6000);
  });

  updateCarousel(0);
}

// Animated stats counter
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let animated = false;

  function runCounter() {
    const section = document.querySelector('.stats-strip-section');
    if (!section) return;

    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && !animated) {
      animated = true;
      statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'), 10);
        let count = 0;
        const speed = target / 40;
        const timer = setInterval(() => {
          count += speed;
          if (count >= target) {
            stat.textContent = target + (stat.textContent.includes('+') ? '+' : '');
            clearInterval(timer);
          } else {
            stat.textContent = Math.floor(count) + '+';
          }
        }, 30);
      });
    }
  }

  window.addEventListener('scroll', runCounter);
  runCounter();
}

// Modals: Search, Video Demo, Request Demo
function initModals() {
  const searchBtn = document.getElementById('btn-search');
  const searchModal = document.getElementById('search-modal');
  const closeSearch = document.getElementById('close-search');
  const searchInput = document.getElementById('site-search-input');
  const searchResults = document.getElementById('search-results');

  if (searchBtn && searchModal) {
    searchBtn.addEventListener('click', () => {
      searchModal.style.display = 'flex';
      searchInput?.focus();
    });

    closeSearch?.addEventListener('click', () => {
      searchModal.style.display = 'none';
    });

    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) searchModal.style.display = 'none';
    });

    // Real-time search filter
    if (searchInput && searchResults) {
      const allItems = Array.from(searchResults.children);
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        allItems.forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(term) ? 'flex' : 'none';
        });
      });
    }
  }

  // Watch Demo Modal
  const watchDemoBtn = document.getElementById('btn-watch-demo');
  const demoModal = document.getElementById('demo-modal');
  const closeDemo = document.getElementById('close-demo');

  if (watchDemoBtn && demoModal) {
    watchDemoBtn.addEventListener('click', () => {
      demoModal.style.display = 'flex';
    });

    closeDemo?.addEventListener('click', () => {
      demoModal.style.display = 'none';
    });

    demoModal.addEventListener('click', (e) => {
      if (e.target === demoModal) demoModal.style.display = 'none';
    });
  }

  // Request Demo Modal
  const reqDemoBtn = document.getElementById('btn-cta-demo');
  const linkReqDemo = document.getElementById('link-req-demo');
  const reqModal = document.getElementById('request-demo-modal');
  const closeReqDemo = document.getElementById('close-req-demo');
  const reqForm = document.getElementById('demo-request-form');

  const openReqModal = (e) => {
    e.preventDefault();
    if (reqModal) reqModal.style.display = 'flex';
  };

  reqDemoBtn?.addEventListener('click', openReqModal);
  linkReqDemo?.addEventListener('click', openReqModal);

  closeReqDemo?.addEventListener('click', () => {
    if (reqModal) reqModal.style.display = 'none';
  });

  reqModal?.addEventListener('click', (e) => {
    if (e.target === reqModal) reqModal.style.display = 'none';
  });

  if (reqForm) {
    reqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('demo-name')?.value || 'Guest';
      reqModal.style.display = 'none';
      reqForm.reset();
      showToast(`Thank you, ${name}! Your CampusOS demo has been scheduled. Check your email for details.`, 'success');
    });
  }
}

// Role Cards Interaction
function initRoleCards() {
  const roleCards = document.querySelectorAll('.role-card');
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      const role = card.getAttribute('data-role');
      if (role) {
        showToast(`Redirecting to ${role} Login Portal...`, 'info');
        setTimeout(() => {
          window.location.href = `login.html?role=${encodeURIComponent(role)}`;
        }, 600);
      }
    });
  });
}

// Interactive 3D Tablet Tilt on Mouse Move
function initHeroTilt() {
  const mockup = document.getElementById('hero-mockup');
  if (!mockup) return;

  const wrapper = mockup.parentElement;
  if (!wrapper) return;

  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const rotX = - (y / rect.height) * 14;
    const rotY = (x / rect.width) * 14;

    mockup.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
  });

  wrapper.addEventListener('mouseleave', () => {
    mockup.style.transform = 'rotateY(-8deg) rotateX(4deg)';
  });
}
