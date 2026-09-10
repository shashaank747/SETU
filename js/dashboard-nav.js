// ==========================================================================
// AppTechno CampusOS - Post-Login Shared Navigation Logic
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Role Handling from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get('role');
  
  if (role) {
    localStorage.setItem('campusos_user_role', role);
  }
  
  const activeRole = role || localStorage.getItem('campusos_user_role') || 'Student';
  const welcomeTitle = document.getElementById('welcome-title');
  const userDisplayRole = document.getElementById('user-display-role');
  const userDisplayName = document.getElementById('user-display-name');
  const dropdownUserName = document.getElementById('dropdown-user-name');
  const dropdownUserRole = document.getElementById('dropdown-user-role');

  if (welcomeTitle) welcomeTitle.textContent = `Welcome back, Shashaank!`;
  if (userDisplayRole) userDisplayRole.textContent = activeRole.toUpperCase();
  if (userDisplayName) userDisplayName.textContent = 'Shashaank Sajjanar';
  if (dropdownUserName) dropdownUserName.textContent = 'Shashaank Sajjanar';
  if (dropdownUserRole) dropdownUserRole.textContent = `${activeRole} Portal`;

  // Helper to close all open dropdowns
  function closeAllDropdowns() {
    document.querySelectorAll('.nav-dropdown.open, .user-profile-menu.open, .nav-bell-menu.open').forEach(el => {
      el.classList.remove('open');
    });
  }

  // 2. Keyboard Shortcut Ctrl+K to trigger CyberBot / search, Escape to close dropdowns
  const searchInput = document.getElementById('dash-search-input');
  const navRobotTrigger = document.getElementById('nav-robot-trigger');
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (navRobotTrigger) {
        navRobotTrigger.click();
      } else if (searchInput) {
        searchInput.focus();
      }
    }
    if (e.key === 'Escape') {
      closeAllDropdowns();
      if (typeof closeTerminalModal === 'function') closeTerminalModal();
      const cyberbotBackdrop = document.getElementById('cyberbot-backdrop');
      const cyberbotDrawer = document.getElementById('cyberbot-drawer');
      if (cyberbotBackdrop) cyberbotBackdrop.classList.remove('open');
      if (cyberbotDrawer) cyberbotDrawer.classList.remove('open');
    }
  });

  // 3. Academics & Navigation Dropdown Toggling
  const navDropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
  navDropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = toggle.closest('.nav-dropdown');
      const wasOpen = parent ? parent.classList.contains('open') : false;
      closeAllDropdowns();
      if (parent && !wasOpen) {
        parent.classList.add('open');
      }
    });
  });

  // 4. Notification Bell Dropdown Toggle
  const bellBtn = document.getElementById('nav-bell-btn');
  const bellMenu = document.getElementById('nav-bell-menu');
  if (bellBtn && bellMenu) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = bellMenu.classList.contains('open');
      closeAllDropdowns();
      if (!wasOpen) {
        bellMenu.classList.add('open');
      }
    });
  }

  // 5. User Profile Dropdown Toggle
  const profileTrigger = document.getElementById('user-profile-trigger');
  const profileMenu = document.getElementById('user-profile-menu');
  if (profileTrigger && profileMenu) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = profileMenu.classList.contains('open');
      closeAllDropdowns();
      if (!wasOpen) {
        profileMenu.classList.add('open');
      }
    });
  }

  // 6. Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown, .user-profile-menu, .nav-bell-menu')) {
      closeAllDropdowns();
    }
  });

  // 7. Notification actions (Mark Read & Clear)
  const markReadBtn = document.getElementById('btn-mark-read');
  const clearNotifBtn = document.getElementById('btn-clear-notifications');
  const bellBadge = document.getElementById('bell-badge');
  const notifCountBadge = document.getElementById('notif-count-badge');

  if (markReadBtn) {
    markReadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (bellBadge) bellBadge.style.display = 'none';
      if (notifCountBadge) notifCountBadge.textContent = '0 New';
      document.querySelectorAll('.notif-item.unread').forEach(item => {
        item.classList.remove('unread');
      });
      showToast('All notifications marked as read.');
    });
  }

  if (clearNotifBtn) {
    clearNotifBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const list = document.getElementById('notifications-list');
      if (list) {
        list.innerHTML = '<div style="padding:28px 16px;text-align:center;color:#94a3b8;font-size:0.82rem;">No new notifications</div>';
      }
      if (bellBadge) bellBadge.style.display = 'none';
      if (notifCountBadge) notifCountBadge.textContent = '0 New';
      showToast('Notifications cleared.');
    });
  }

  // 8. Sign out button handling
  const signoutBtn = document.getElementById('btn-signout');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('campusos_user_role');
      showToast('Signing out... Redirecting to login.');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 700);
    });
  }

  // 5. Toast Notification Helper
  const toastEl = document.getElementById('dash-toast');
  const toastMsg = document.getElementById('toast-message');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl || !toastMsg) return;
    toastMsg.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3500);
  }

  // 6. Campus Radar Live Stopwatch Timer & Punch System
  const sessionClockDisplay = document.getElementById('session-clock-display');
  const btnPunchToggle = document.getElementById('btn-punch-toggle');
  const punchBtnLabel = document.getElementById('punch-btn-label');
  const punchBtnIcon = document.getElementById('punch-btn-icon');
  const sessionPunchStatus = document.getElementById('session-punch-status');
  const sessionAutocloseBadge = document.getElementById('session-autoclose-badge');

  // SVG Icon Templates for Punch Out (Logout icon) & Punch In (Login icon)
  const iconPunchOutSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>`;

  const iconPunchInSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
    <polyline points="10 17 15 12 10 7"></polyline>
    <line x1="15" y1="12" x2="3" y2="12"></line>
  </svg>`;

  if (sessionClockDisplay) {
    let timerInterval = null;

    // Helper: format total seconds to HH : MM : SS
    function formatTime(totalSeconds) {
      const s = Math.max(0, totalSeconds);
      const hrs = String(Math.floor(s / 3600)).padStart(2, '0');
      const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const secs = String(s % 60).padStart(2, '0');
      return `${hrs} : ${mins} : ${secs}`;
    }

    // Date key (YYYY-MM-DD) for tracking daily 11:59 PM reset
    function getTodayKey() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    // Check if current time is at or past 11:59 PM (23:59)
    function isAtOrPast1159PM() {
      const now = new Date();
      return now.getHours() === 23 && now.getMinutes() >= 59;
    }

    // Restore state or initialize defaults
    const todayKey = getTodayKey();
    const savedDate = localStorage.getItem('campus_timer_date');
    const lastResetDay = localStorage.getItem('campus_last_reset_day');

    let elapsedSeconds = (2 * 3600) + (18 * 60) + 16; // default 02:18:16 template initial
    let isPunchedIn = true;
    let punchTimeDisplay = '09:47 AM';

    const hasResetToday = (lastResetDay === todayKey);
    const isNewDay = savedDate && (savedDate !== todayKey);
    const isPast1159Today = isAtOrPast1159PM() && !hasResetToday;

    if (isNewDay || isPast1159Today) {
      // 11:59 PM daily reset condition
      elapsedSeconds = 0;
      isPunchedIn = false;
      punchTimeDisplay = '11:59 PM';
      localStorage.setItem('campus_last_reset_day', todayKey);
      localStorage.setItem('campus_elapsed_seconds', '0');
      localStorage.setItem('campus_is_punched_in', 'false');
      localStorage.setItem('campus_punch_time', punchTimeDisplay);
      localStorage.setItem('campus_timer_date', todayKey);
    } else if (localStorage.getItem('campus_elapsed_seconds') !== null) {
      elapsedSeconds = parseInt(localStorage.getItem('campus_elapsed_seconds'), 10) || 0;
      isPunchedIn = localStorage.getItem('campus_is_punched_in') === 'true';
      punchTimeDisplay = localStorage.getItem('campus_punch_time') || '09:47 AM';
    }

    function updateClockDisplay() {
      sessionClockDisplay.textContent = formatTime(elapsedSeconds);
    }

    function updatePunchUI(active, timeString) {
      const timeToShow = timeString || punchTimeDisplay;
      if (active) {
        if (btnPunchToggle) {
          btnPunchToggle.classList.remove('punched-in');
          btnPunchToggle.setAttribute('title', 'Punch Out of Campus');
        }
        if (punchBtnLabel) punchBtnLabel.textContent = 'PUNCH OUT NOW';
        if (punchBtnIcon) punchBtnIcon.innerHTML = iconPunchOutSvg;
        sessionClockDisplay.classList.remove('timer-paused');
        if (sessionPunchStatus) {
          sessionPunchStatus.innerHTML = `Punched IN at <span class="punched-time" id="session-punched-time">${timeToShow}</span>`;
        }
      } else {
        if (btnPunchToggle) {
          btnPunchToggle.classList.add('punched-in');
          btnPunchToggle.setAttribute('title', 'Punch In to Campus');
        }
        if (punchBtnLabel) punchBtnLabel.textContent = 'PUNCH IN NOW';
        if (punchBtnIcon) punchBtnIcon.innerHTML = iconPunchInSvg;
        sessionClockDisplay.classList.add('timer-paused');
        if (sessionPunchStatus) {
          if (elapsedSeconds === 0) {
            sessionPunchStatus.innerHTML = `Session Reset at <span class="punched-time" id="session-punched-time">11:59 PM</span> (00:00:00)`;
          } else {
            sessionPunchStatus.innerHTML = `Punched OUT at <span class="punched-time" id="session-punched-time">${timeToShow}</span> <span class="punch-paused-tag">(Stopped)</span>`;
          }
        }
      }
    }

    // Start Timer (Clock increments every second)
    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        elapsedSeconds++;
        updateClockDisplay();
        localStorage.setItem('campus_elapsed_seconds', elapsedSeconds.toString());
      }, 1000);
    }

    // Stop Timer (Freezes the clock display)
    function stopTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      localStorage.setItem('campus_elapsed_seconds', elapsedSeconds.toString());
    }

    // 11:59 PM Reset Procedure
    function resetTimerAt1159PM(isManualSimulation = false) {
      const today = getTodayKey();
      localStorage.setItem('campus_last_reset_day', today);
      localStorage.setItem('campus_timer_date', today);
      localStorage.setItem('campus_elapsed_seconds', '0');
      localStorage.setItem('campus_is_punched_in', 'false');
      localStorage.setItem('campus_punch_time', '11:59 PM');

      elapsedSeconds = 0;
      isPunchedIn = false;
      stopTimer();
      updateClockDisplay();
      updatePunchUI(false, '11:59 PM');

      const message = isManualSimulation 
        ? 'Simulated 11:59 PM Reset: Timer stopped and reset to 00:00:00.'
        : 'Campus session auto-closed & timer reset to 00:00:00 at 11:59 PM.';
      showToast(message);
    }

    // Continuous 1-second check for 11:59 PM auto-reset
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 23 && now.getMinutes() >= 59) {
        const today = getTodayKey();
        if (localStorage.getItem('campus_last_reset_day') !== today) {
          resetTimerAt1159PM(false);
        }
      }
    }, 1000);

    // Initial setup
    updateClockDisplay();
    updatePunchUI(isPunchedIn, punchTimeDisplay);

    if (isPunchedIn) {
      startTimer();
    }

    // Punch Toggle Button Interaction
    if (btnPunchToggle) {
      btnPunchToggle.addEventListener('click', () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isPunchedIn) {
          // PUNCH OUT: Stop elapsed timer immediately
          isPunchedIn = false;
          stopTimer();
          punchTimeDisplay = timeStr;
          localStorage.setItem('campus_is_punched_in', 'false');
          localStorage.setItem('campus_punch_time', timeStr);
          localStorage.setItem('campus_timer_date', getTodayKey());
          updatePunchUI(false, timeStr);
          showToast(`Punched OUT recorded at ${timeStr}. Elapsed timer stopped.`);
        } else {
          // PUNCH IN: Start elapsed timer immediately
          isPunchedIn = true;
          punchTimeDisplay = timeStr;
          localStorage.setItem('campus_is_punched_in', 'true');
          localStorage.setItem('campus_punch_time', timeStr);
          localStorage.setItem('campus_timer_date', getTodayKey());
          startTimer();
          updatePunchUI(true, timeStr);
          showToast(`Punched IN recorded at ${timeStr}. Elapsed timer started.`);
        }
      });
    }

    // Expose simulation helper on window and via clicking the "Auto-close: 23:59" badge
    window.simulateMidnightReset = () => resetTimerAt1159PM(true);
    if (sessionAutocloseBadge) {
      sessionAutocloseBadge.addEventListener('click', () => resetTimerAt1159PM(true));
    }
  }

  // 8. Terminal QR Scanner Modal
  const btnScanTerminal = document.getElementById('btn-scan-terminal');
  const terminalModal = document.getElementById('terminal-modal');
  const terminalCloseBtn = document.getElementById('terminal-modal-close');
  const terminalBackdrop = document.getElementById('terminal-modal-backdrop');
  const btnTerminalConfirm = document.getElementById('btn-terminal-confirm');

  function openTerminalModal() {
    if (terminalModal) terminalModal.classList.add('open');
  }

  function closeTerminalModal() {
    if (terminalModal) terminalModal.classList.remove('open');
  }

  if (btnScanTerminal) btnScanTerminal.addEventListener('click', openTerminalModal);
  if (terminalCloseBtn) terminalCloseBtn.addEventListener('click', closeTerminalModal);
  if (terminalBackdrop) terminalBackdrop.addEventListener('click', closeTerminalModal);

  if (btnTerminalConfirm) {
    btnTerminalConfirm.addEventListener('click', () => {
      closeTerminalModal();
      showToast('Terminal BLR-GATE-04B scanned successfully! Attendance recorded.');
    });
  }
});

