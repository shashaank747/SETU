/**
 * AppTechno CampusOS - Contributors Page Script
 * Interactive filtering, real-time search, and testimonial slider
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const filterBtns = document.querySelectorAll('.contri-filter-btn');
  const cards = document.querySelectorAll('.contributor-card');
  const searchInput = document.getElementById('contri-search-input');
  const emptyState = document.getElementById('contri-empty-state');
  const allCountSpan = document.getElementById('all-alumni-count');

  let activeCategory = 'all';
  let searchQuery = '';

  // Update counter
  if (allCountSpan) {
    allCountSpan.textContent = `(${cards.length})`;
  }

  // Filter & Search Logic
  function applyFilters() {
    let visibleCount = 0;
    const query = searchQuery.toLowerCase().trim();

    cards.forEach(card => {
      const categories = (card.getAttribute('data-categories') || '').split(' ');
      const name = (card.querySelector('.contributor-name')?.textContent || '').toLowerCase();
      const role = (card.querySelector('.contributor-role')?.textContent || '').toLowerCase();
      const company = (card.querySelector('.contributor-company')?.textContent || '').toLowerCase();
      const quote = (card.querySelector('.card-quote-text')?.textContent || '').toLowerCase();
      const tags = Array.from(card.querySelectorAll('.skill-tag, .batch-tag'))
        .map(t => t.textContent.toLowerCase())
        .join(' ');

      const matchesCategory = (activeCategory === 'all') || categories.includes(activeCategory);
      const matchesSearch = !query || 
        name.includes(query) || 
        role.includes(query) || 
        company.includes(query) || 
        tags.includes(query) || 
        quote.includes(query);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        card.style.animation = 'fadeInCard 0.35s ease forwards';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.style.display = 'block';
      } else {
        emptyState.style.display = 'none';
      }
    }
  }

  // Filter Button Clicks
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      applyFilters();
    });
  }

  // Testimonials Carousel Dots
  const dots = document.querySelectorAll('.testimonial-dot');
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  // Modal Handlers
  const searchBtn = document.getElementById('btn-search');
  const searchModal = document.getElementById('search-modal');
  const closeSearchBtn = document.getElementById('close-search');
  const siteSearchInput = document.getElementById('site-search-input');

  if (searchBtn && searchModal) {
    searchBtn.addEventListener('click', () => {
      searchModal.style.display = 'flex';
      if (siteSearchInput) setTimeout(() => siteSearchInput.focus(), 100);
    });
  }

  if (closeSearchBtn && searchModal) {
    closeSearchBtn.addEventListener('click', () => {
      searchModal.style.display = 'none';
    });
  }

  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) searchModal.style.display = 'none';
    });
  }

  // Request Demo Modal
  const linkReqDemo = document.getElementById('link-req-demo');
  const reqDemoModal = document.getElementById('request-demo-modal');
  const closeReqDemo = document.getElementById('close-req-demo');

  if (linkReqDemo && reqDemoModal) {
    linkReqDemo.addEventListener('click', (e) => {
      e.preventDefault();
      reqDemoModal.style.display = 'flex';
    });
  }

  if (closeReqDemo && reqDemoModal) {
    closeReqDemo.addEventListener('click', () => {
      reqDemoModal.style.display = 'none';
    });
  }

  if (reqDemoModal) {
    reqDemoModal.addEventListener('click', (e) => {
      if (e.target === reqDemoModal) reqDemoModal.style.display = 'none';
    });
  }

  // Escape key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (searchModal) searchModal.style.display = 'none';
      if (reqDemoModal) reqDemoModal.style.display = 'none';
    }
  });

  // Toast Functionality
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  }

  // Newsletter Submit
  const newsletterForms = document.querySelectorAll('.newsletter-box');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim()) {
        showToast(`🎉 Thank you for subscribing, ${emailInput.value.trim()}!`, 'success');
        emailInput.value = '';
      }
    });
  });
});
