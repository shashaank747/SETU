// Helper to close all open dropdowns
function closeAllDropdowns() {
  document.querySelectorAll('.nav-dropdown.open, .user-profile-menu.open, .nav-bell-menu.open').forEach(el => {
    el.classList.remove('open');
  });
}
window.closeAllDropdowns = closeAllDropdowns;

// Global helper to toggle User Profile Menu
function toggleUserProfileMenu(e) {
  if (e) {
    if (e.stopPropagation) e.stopPropagation();
  }
  const profileMenu = document.getElementById('user-profile-menu');
  if (!profileMenu) return;

  const now = Date.now();
  if (profileMenu._lastToggleTime && (now - profileMenu._lastToggleTime < 250)) {
    return;
  }
  profileMenu._lastToggleTime = now;

  const wasOpen = profileMenu.classList.contains('open');
  closeAllDropdowns();
  if (!wasOpen) {
    profileMenu.classList.add('open');
  }
}
window.toggleUserProfileMenu = toggleUserProfileMenu;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Role Handling from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get('role');
  
  if (role) {
    localStorage.setItem('campusos_user_role', role);
  }
  
  const activeRole = role || localStorage.getItem('campusos_user_role') || 'Student';
  const userDisplayRole = document.getElementById('user-display-role');
  if (userDisplayRole) userDisplayRole.textContent = activeRole.toUpperCase();
  if (window.StudentProfileDB) {
    window.StudentProfileDB.applyToDOM();
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
      e.preventDefault();
      e.stopPropagation();
      const parent = toggle.closest('.nav-dropdown');
      const wasOpen = parent ? parent.classList.contains('open') : false;
      closeAllDropdowns();
      if (parent && !wasOpen) {
        parent.classList.add('open');
      }
    });
  });

  // Keep dropdown content interactive without dismissing on inner clicks
  const navDropdownMenus = document.querySelectorAll('.academics-mega-menu, .dropdown-menu');
  navDropdownMenus.forEach(menu => {
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
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
  if (profileTrigger) {
    profileTrigger.onclick = (e) => {
      toggleUserProfileMenu(e);
    };
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

  
  // ==============================================================
  // 6.1 Real-Time Live System Date & Clock (HH:MM:SS) + Dynamic Greeting
  // ==============================================================
  const liveDateEl = document.getElementById('live-current-date');
  const liveTimeEl = document.getElementById('live-current-time');
  const radarGreetingText = document.getElementById('radar-greeting-text');

  function updateLiveSystemClock() {
    const now = new Date();

    if (liveDateEl) {
      const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
      liveDateEl.textContent = '📅 ' + now.toLocaleDateString('en-US', options);
    }

    if (liveTimeEl) {
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      liveTimeEl.textContent = '🕒 ' + timeStr;
    }

    if (radarGreetingText) {
      const hr = now.getHours();
      let greeting = 'Good Morning,';
      if (hr >= 12 && hr < 17) greeting = 'Good Afternoon,';
      else if (hr >= 17 && hr < 21) greeting = 'Good Evening,';
      else if (hr >= 21 || hr < 5) greeting = 'Good Night,';
      radarGreetingText.textContent = greeting;
    }
  }

  // Run live clock immediately & every second
  updateLiveSystemClock();
  setInterval(updateLiveSystemClock, 1000);

  // ==============================================================
  // 6.2 Academy Presence Verification Dialog Flow (5h, 7h, 9h Milestones)
  // ==============================================================
  const presenceModal = document.getElementById('modal-presence-check');
  const presenceElapsedEl = document.getElementById('presence-elapsed-time');
  const presenceBadgeEl = document.getElementById('presence-alert-badge');
  const presenceSubtextEl = document.getElementById('presence-subtext');

  const PRESENCE_MILESTONES = [
    { hours: 5, seconds: 5 * 3600 },
    { hours: 7, seconds: 7 * 3600 },
    { hours: 9, seconds: 9 * 3600 }
  ];

  function showAcademyPresenceCheck(elapsedSec, milestoneHours = 5) {
    if (!presenceModal) return;
    if (presenceElapsedEl) {
      const s = Math.max(0, Math.floor(elapsedSec || (milestoneHours * 3600)));
      const hrs = String(Math.floor(s / 3600)).padStart(2, '0');
      const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const secs = String(s % 60).padStart(2, '0');
      presenceElapsedEl.textContent = `${hrs} : ${mins} : ${secs}`;
    }
    if (presenceBadgeEl) {
      presenceBadgeEl.textContent = `${milestoneHours}-Hour Continuous Session Alert`;
    }
    if (presenceSubtextEl) {
      presenceSubtextEl.textContent = `Your campus session has reached ${milestoneHours} continuous hours. Please confirm your ongoing presence to maintain active academic clearance.`;
    }
    presenceModal.style.display = 'flex';
  }

  function handlePresenceResponse(isStillPresent) {
    if (presenceModal) {
      presenceModal.style.display = 'none';
    }

    if (isStillPresent) {
      // User is still in Academy -> record confirmation, don't interrupt session
      showToast('✓ Presence verified: Academy session active.');
    } else {
      // User is NOT in Academy -> Punch Out student immediately and open dashboard
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Freeze elapsed timer
      let currentTotal = 0;
      if (typeof getCurrentElapsedSeconds === 'function') {
        currentTotal = getCurrentElapsedSeconds();
      } else {
        const base = parseInt(localStorage.getItem('campus_accumulated_seconds'), 10) || 0;
        const start = parseInt(localStorage.getItem('campus_punch_in_timestamp'), 10) || Date.now();
        currentTotal = base + Math.max(0, Math.floor((Date.now() - start) / 1000));
      }

      localStorage.setItem('campus_accumulated_seconds', currentTotal.toString());
      localStorage.setItem('campus_is_punched_in', 'false');
      localStorage.setItem('campus_punch_time', timeStr);
      localStorage.setItem('campus_timer_date', typeof getTodayKey === 'function' ? getTodayKey() : '');

      // Reset milestone triggers
      PRESENCE_MILESTONES.forEach(m => {
        localStorage.removeItem(`campus_presence_prompted_${m.hours}h`);
      });

      if (typeof stopTimer === 'function') stopTimer();
      if (typeof updatePunchUI === 'function') updatePunchUI(false, timeStr);

      showToast('Punched OUT recorded. Academy session closed.');

      // Refresh to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    }
  }

  window.handlePresenceResponse = handlePresenceResponse;
  window.showAcademyPresenceCheck = showAcademyPresenceCheck;
  window.simulate5HourPresenceCheck = () => showAcademyPresenceCheck(18000 + 45, 5);
  window.simulate7HourPresenceCheck = () => showAcademyPresenceCheck(25200 + 30, 7);
  window.simulate9HourPresenceCheck = () => showAcademyPresenceCheck(32400 + 15, 9);
  window.simulatePresenceCheck = (hours) => showAcademyPresenceCheck((hours || 5) * 3600 + 10, hours || 5);

  if (sessionClockDisplay) {
    let timerInterval = null;

    // Helper: format total seconds to HH : MM : SS
    function formatTime(totalSeconds) {
      const s = Math.max(0, Math.floor(totalSeconds));
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

    const todayKey = getTodayKey();
    const savedDate = localStorage.getItem('campus_timer_date');
    const lastResetDay = localStorage.getItem('campus_last_reset_day');

    let isPunchedIn = true;
    let punchTimeDisplay = '09:47 AM';
    let punchInTimestamp = Date.now();
    let accumulatedSeconds = 0;

    const hasResetToday = (lastResetDay === todayKey);
    const isNewDay = savedDate && (savedDate !== todayKey);
    const isPast1159Today = isAtOrPast1159PM() && !hasResetToday;

    if (isNewDay || isPast1159Today) {
      // 11:59 PM daily reset condition
      isPunchedIn = false;
      punchTimeDisplay = '11:59 PM';
      accumulatedSeconds = 0;
      punchInTimestamp = Date.now();
      localStorage.setItem('campus_last_reset_day', todayKey);
      localStorage.setItem('campus_accumulated_seconds', '0');
      localStorage.setItem('campus_is_punched_in', 'false');
      localStorage.setItem('campus_punch_time', punchTimeDisplay);
      localStorage.setItem('campus_timer_date', todayKey);
    } else {
      // Check if previously initialized
      if (localStorage.getItem('campus_is_punched_in') === null) {
        // Initial first-time setup: defaulted to active session with ~02:18:16 template offset
        const initialOffset = (2 * 3600) + (18 * 60) + 16;
        isPunchedIn = true;
        punchTimeDisplay = '09:47 AM';
        accumulatedSeconds = initialOffset;
        punchInTimestamp = Date.now();

        localStorage.setItem('campus_is_punched_in', 'true');
        localStorage.setItem('campus_punch_time', punchTimeDisplay);
        localStorage.setItem('campus_punch_in_timestamp', punchInTimestamp.toString());
        localStorage.setItem('campus_accumulated_seconds', accumulatedSeconds.toString());
        localStorage.setItem('campus_timer_date', todayKey);
      } else {
        isPunchedIn = localStorage.getItem('campus_is_punched_in') === 'true';
        punchTimeDisplay = localStorage.getItem('campus_punch_time') || '09:47 AM';
        punchInTimestamp = parseInt(localStorage.getItem('campus_punch_in_timestamp'), 10) || Date.now();
        accumulatedSeconds = parseInt(localStorage.getItem('campus_accumulated_seconds'), 10) || 0;
      }
    }

    function getCurrentElapsedSeconds() {
      if (isPunchedIn) {
        const now = Date.now();
        const start = parseInt(localStorage.getItem('campus_punch_in_timestamp'), 10) || now;
        const diffSecs = Math.max(0, Math.floor((now - start) / 1000));
        const base = parseInt(localStorage.getItem('campus_accumulated_seconds'), 10) || 0;
        return base + diffSecs;
      } else {
        return parseInt(localStorage.getItem('campus_accumulated_seconds'), 10) || 0;
      }
    }

    function checkPresenceMilestones(elapsed) {
      if (!isPunchedIn) return;
      for (let i = 0; i < PRESENCE_MILESTONES.length; i++) {
        const milestone = PRESENCE_MILESTONES[i];
        if (elapsed >= milestone.seconds) {
          const key = `campus_presence_prompted_${milestone.hours}h`;
          const alreadyPrompted = localStorage.getItem(key);
          if (!alreadyPrompted) {
            localStorage.setItem(key, Date.now().toString());
            showAcademyPresenceCheck(elapsed, milestone.hours);
            break;
          }
        }
      }
    }

    function updateClockDisplay() {
      const elapsed = getCurrentElapsedSeconds();
      sessionClockDisplay.textContent = formatTime(elapsed);
      checkPresenceMilestones(elapsed);
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
          const elapsed = getCurrentElapsedSeconds();
          if (elapsed === 0) {
            sessionPunchStatus.innerHTML = `Session Reset at <span class="punched-time" id="session-punched-time">11:59 PM</span> (00:00:00)`;
          } else {
            sessionPunchStatus.innerHTML = `Punched OUT at <span class="punched-time" id="session-punched-time">${timeToShow}</span> <span class="punch-paused-tag">(Stopped)</span>`;
          }
        }
      }
    }

    // Start Live Clock Interval
    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      updateClockDisplay();
      timerInterval = setInterval(() => {
        updateClockDisplay();
      }, 1000);
    }

    // Stop Clock Interval
    function stopTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      updateClockDisplay();
    }

    // 11:59 PM Reset Procedure
    function resetTimerAt1159PM(isManualSimulation = false) {
      const today = getTodayKey();
      localStorage.setItem('campus_last_reset_day', today);
      localStorage.setItem('campus_timer_date', today);
      localStorage.setItem('campus_accumulated_seconds', '0');
      localStorage.setItem('campus_punch_in_timestamp', Date.now().toString());
      localStorage.setItem('campus_is_punched_in', 'false');
      localStorage.setItem('campus_punch_time', '11:59 PM');

      // Clear presence notification triggers
      PRESENCE_MILESTONES.forEach(m => {
        localStorage.removeItem(`campus_presence_prompted_${m.hours}h`);
      });

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

    // Recalculate accurately on tab visibility change or window focus
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && isPunchedIn) {
        updateClockDisplay();
      }
    });
    window.addEventListener('focus', () => {
      if (isPunchedIn) {
        updateClockDisplay();
      }
    });

    // Cross-tab sync
    window.addEventListener('storage', (e) => {
      if (e.key === 'campus_is_punched_in' || e.key === 'campus_punch_in_timestamp' || e.key === 'campus_accumulated_seconds') {
        isPunchedIn = localStorage.getItem('campus_is_punched_in') === 'true';
        punchTimeDisplay = localStorage.getItem('campus_punch_time') || '09:47 AM';
        updateClockDisplay();
        updatePunchUI(isPunchedIn, punchTimeDisplay);
        if (isPunchedIn) startTimer();
        else stopTimer();
      }
    });

    // Punch Toggle Button Interaction
    if (btnPunchToggle) {
      btnPunchToggle.addEventListener('click', () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isPunchedIn) {
          // PUNCH OUT: Calculate and freeze elapsed time
          const currentTotal = getCurrentElapsedSeconds();
          isPunchedIn = false;
          punchTimeDisplay = timeStr;
          localStorage.setItem('campus_accumulated_seconds', currentTotal.toString());
          localStorage.setItem('campus_is_punched_in', 'false');
          localStorage.setItem('campus_punch_time', timeStr);
          localStorage.setItem('campus_timer_date', getTodayKey());

          stopTimer();
          updatePunchUI(false, timeStr);
          showToast(`Punched OUT recorded at ${timeStr}. Elapsed timer stopped.`);
        } else {
          // PUNCH IN: Resume elapsed timer from current timestamp
          isPunchedIn = true;
          punchTimeDisplay = timeStr;
          localStorage.setItem('campus_is_punched_in', 'true');
          localStorage.setItem('campus_punch_in_timestamp', Date.now().toString());
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

// ==============================================================
// 9. CampusOS Student Profile & 3D Biometric Persistent Database Engine
// ==============================================================
const StudentProfileDB = {
  dbKey: 'setu_student_profile_record',
  face3dKey: 'setu_permanent_3d_face_profile',

  defaults: {
    fullName: 'Shashaank Sajjanar',
    studentId: '2026-STU',
    email: 'shashaank.s@campusos.edu',
    phone: '+91 98765 43210',
    dob: '2003-08-14',
    gender: 'Male',
    bloodGroup: 'O+',
    emergencyContact: 'S. Sajjanar (+91 98765 00000)',
    department: 'School of Computer Science & Engineering',
    program: 'B.Tech in Computer Science',
    semester: '6th Semester B.Tech',
    batch: 'Batch B-948 (2022 - 2026)',
    avatarUrl: 'images/user-shashaank.png',
    attendanceRate: '94.2% Prime',
    cgpa: '8.92 / 10.0',
    academicStatus: 'Verified Learner ✓',
    face3D: {
      enrolled: false,
      enrolledAt: null,
      biometricHash: null,
      frontPhotoUrl: null,
      leftPhotoUrl: null,
      rightPhotoUrl: null,
      stitchedTextureUrl: null,
      multiAngleFeatures: null,
      confidence: '99.4%'
    },
    updatedAt: new Date().toISOString()
  },

  get() {
    let profile = null;
    try {
      const raw = localStorage.getItem(this.dbKey);
      if (raw) profile = JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading student profile record:', e);
    }

    if (!profile) {
      profile = JSON.parse(JSON.stringify(this.defaults));
    } else {
      profile = Object.assign({}, this.defaults, profile);
      if (!profile.face3D) {
        profile.face3D = JSON.parse(JSON.stringify(this.defaults.face3D));
      }
    }

    // Auto-sync 3D Face from setu_permanent_3d_face_profile if present
    try {
      const rawFace = localStorage.getItem(this.face3dKey);
      if (rawFace) {
        const faceData = JSON.parse(rawFace);
        if (faceData && faceData.frontPhotoUrl) {
          profile.face3D = {
            enrolled: true,
            enrolledAt: faceData.enrolledAt || profile.face3D.enrolledAt || new Date().toISOString(),
            biometricHash: faceData.biometricHash || profile.face3D.biometricHash || '3D_BIO_VERIFIED',
            frontPhotoUrl: faceData.frontPhotoUrl,
            leftPhotoUrl: faceData.leftPhotoUrl,
            rightPhotoUrl: faceData.rightPhotoUrl,
            stitchedTextureUrl: faceData.stitchedTextureUrl,
            multiAngleFeatures: faceData.multiAngleFeatures,
            confidence: profile.face3D.confidence || '99.4%'
          };
        }
      }
    } catch (e) {}

    return profile;
  },

  save(data) {
    try {
      const current = this.get();
      const updated = Object.assign({}, current, data, {
        updatedAt: new Date().toISOString()
      });

      localStorage.setItem(this.dbKey, JSON.stringify(updated));

      // Keep compatibility with setu_permanent_3d_face_profile
      if (updated.face3D && updated.face3D.enrolled && updated.face3D.frontPhotoUrl) {
        const faceObj = {
          candidateName: updated.fullName,
          candidateId: updated.studentId,
          enrolledAt: updated.face3D.enrolledAt,
          frontPhotoUrl: updated.face3D.frontPhotoUrl,
          leftPhotoUrl: updated.face3D.leftPhotoUrl,
          rightPhotoUrl: updated.face3D.rightPhotoUrl,
          stitchedTextureUrl: updated.face3D.stitchedTextureUrl,
          multiAngleFeatures: updated.face3D.multiAngleFeatures,
          biometricHash: updated.face3D.biometricHash
        };
        localStorage.setItem(this.face3dKey, JSON.stringify(faceObj));
      }

      this.applyToDOM(updated);

      // Trigger custom events
      window.dispatchEvent(new CustomEvent('setu-student-profile-updated', { detail: updated }));
      if (updated.face3D && updated.face3D.enrolled) {
        window.dispatchEvent(new CustomEvent('setu-3d-face-updated', { detail: updated.face3D }));
      }
      return true;
    } catch (e) {
      console.error('Failed to save student profile:', e);
      return false;
    }
  },

  syncFrom3DStudio(faceRecord) {
    if (!faceRecord) return;
    const current = this.get();
    current.face3D = {
      enrolled: true,
      enrolledAt: faceRecord.enrolledAt || new Date().toISOString(),
      biometricHash: faceRecord.biometricHash || '3D_BIO_' + Date.now().toString(36).toUpperCase(),
      frontPhotoUrl: faceRecord.frontPhotoUrl,
      leftPhotoUrl: faceRecord.leftPhotoUrl,
      rightPhotoUrl: faceRecord.rightPhotoUrl,
      stitchedTextureUrl: faceRecord.stitchedTextureUrl,
      multiAngleFeatures: faceRecord.multiAngleFeatures,
      confidence: '99.4%'
    };
    current.updatedAt = new Date().toISOString();
    localStorage.setItem(this.dbKey, JSON.stringify(current));
    this.applyToDOM(current);
    window.dispatchEvent(new CustomEvent('setu-student-profile-updated', { detail: current }));
  },

  applyToDOM(profile) {
    const p = profile || this.get();
    const firstName = (p.fullName || 'Student').split(' ')[0];

    const welcomeTitle = document.getElementById('welcome-title');
    if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${firstName}!`;

    const userDisplayName = document.getElementById('user-display-name');
    if (userDisplayName) userDisplayName.textContent = p.fullName;

    const dropdownUserName = document.getElementById('dropdown-user-name');
    if (dropdownUserName) dropdownUserName.textContent = p.fullName;

    const dropdownUserRole = document.getElementById('dropdown-user-role');
    const activeRole = localStorage.getItem('campusos_user_role') || 'Student';
    if (dropdownUserRole) dropdownUserRole.textContent = `${activeRole} Portal • ID #${p.studentId}`;

    const radarUserName = document.getElementById('radar-user-name');
    if (radarUserName) radarUserName.textContent = p.fullName;

    const userAvatarImg = document.getElementById('user-avatar-img');
    if (userAvatarImg && p.avatarUrl) {
      userAvatarImg.src = p.avatarUrl;
    }

    // Modal elements if injected
    const modalAvatar = document.getElementById('modal-profile-avatar');
    if (modalAvatar && p.avatarUrl) modalAvatar.src = p.avatarUrl;

    const modalName = document.getElementById('modal-profile-name');
    if (modalName) modalName.textContent = p.fullName;

    const modalBatch = document.getElementById('modal-profile-batch');
    if (modalBatch) modalBatch.textContent = p.batch;

    const modalRoll = document.getElementById('modal-profile-roll');
    if (modalRoll) modalRoll.textContent = `#${p.studentId}`;

    const modalEmail = document.getElementById('modal-profile-email');
    if (modalEmail) modalEmail.textContent = p.email;

    const modalDeptSem = document.getElementById('modal-profile-dept-sem');
    if (modalDeptSem) modalDeptSem.textContent = `${p.department} • ${p.semester}`;

    // Overview details
    const detailRoll = document.getElementById('detail-roll');
    if (detailRoll) detailRoll.textContent = `#${p.studentId}`;

    const detailEmail = document.getElementById('detail-email');
    if (detailEmail) detailEmail.textContent = p.email;

    const detailPhone = document.getElementById('detail-phone');
    if (detailPhone) detailPhone.textContent = p.phone;

    const detailDob = document.getElementById('detail-dob');
    if (detailDob) detailDob.textContent = p.dob;

    const detailBlood = document.getElementById('detail-blood');
    if (detailBlood) detailBlood.textContent = p.bloodGroup;

    const detailEmergency = document.getElementById('detail-emergency');
    if (detailEmergency) detailEmergency.textContent = p.emergencyContact;

    const detailDept = document.getElementById('detail-dept');
    if (detailDept) detailDept.textContent = p.department;

    const detailSem = document.getElementById('detail-sem');
    if (detailSem) detailSem.textContent = p.semester;

    const detailBatch = document.getElementById('detail-batch');
    if (detailBatch) detailBatch.textContent = p.batch;

    refreshStudentProfile3DData();
  },

  resetDefaults() {
    localStorage.removeItem(this.dbKey);
    localStorage.removeItem(this.face3dKey);
    const def = this.get();
    this.applyToDOM(def);
    return def;
  }
};
window.StudentProfileDB = StudentProfileDB;

// Variable to hold uploaded avatar base64 during edit
let tempUploadedAvatarUrl = null;


// ==============================================================
// 10. Student Profile Navigation & Global Controllers
// ==============================================================

function openStudentProfileModal() {
  // Navigate directly to the Student Registration & Profile Portal
  window.location.href = 'student_registration_portal.html';
}

function closeStudentProfileModal() {
  // Modal removed; safe no-op for any legacy onclick references
  const modal = document.getElementById('modal-student-profile');
  if (modal) modal.remove();
}

function switchProfileTab(tabName) {
  // Modal removed; safe no-op
}

function refreshStudentProfile3DData() {
  const profile = (window.StudentProfileDB && typeof StudentProfileDB.get === 'function') ? StudentProfileDB.get() : null;
  const face = (profile && profile.face3D && profile.face3D.enrolled) ? profile.face3D : (window.Face3DStudio && typeof Face3DStudio.getProfile === 'function' ? Face3DStudio.getProfile() : null);

  const nav3dBadge = document.getElementById('nav-3d-badge');
  if (nav3dBadge) {
    if (face && (face.frontPhotoUrl || face.enrolled)) {
      nav3dBadge.textContent = '3D Enrolled ✓';
      nav3dBadge.style.background = '#059669';
    } else {
      nav3dBadge.textContent = '10s Auto';
      nav3dBadge.style.background = '#7c3aed';
    }
  }
}

// Global exposure
window.StudentProfileDB = StudentProfileDB;
window.openStudentProfileModal = openStudentProfileModal;
window.closeStudentProfileModal = closeStudentProfileModal;
window.switchProfileTab = switchProfileTab;
window.refreshStudentProfile3DData = refreshStudentProfile3DData;

window.addEventListener('setu-3d-face-updated', () => {
  refreshStudentProfile3DData();
});

window.addEventListener('setu-student-profile-updated', (e) => {
  if (window.StudentProfileDB && typeof StudentProfileDB.applyToDOM === 'function') {
    StudentProfileDB.applyToDOM(e.detail);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeStudentProfileModal();
  }
});
