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
// 10. Student Profile Modal HTML Injection & Controller
// ==============================================================
function injectStudentProfileModal() {
  if (document.getElementById('modal-student-profile')) return;

  const modalHtml = `
  <div id="modal-student-profile" class="student-profile-modal-overlay">
    <div class="student-profile-modal-container">
      
      <!-- Modal Header -->
      <div class="profile-modal-header">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
            👤
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 leading-none">Student Profile &amp; Biometrics</h3>
            <p class="text-[11px] text-slate-500 mt-0.5">AppTechno CampusOS &bull; Institutional Record &amp; 3D Face Biometric Ground Truth</p>
          </div>
        </div>
        <button type="button" onclick="closeStudentProfileModal()" class="profile-modal-close-btn" aria-label="Close Profile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Tab Switcher Navigation -->
      <div class="profile-modal-tabs">
        <button type="button" class="profile-tab-btn active" id="tab-btn-overview" onclick="switchProfileTab('overview')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Identity &amp; 3D Biometrics</span>
        </button>
        <button type="button" class="profile-tab-btn" id="tab-btn-edit" onclick="switchProfileTab('edit')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span>Edit Student Details</span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="profile-modal-body">
        
        <!-- TAB 1: OVERVIEW & 3D BIOMETRICS PANE -->
        <div id="profile-pane-overview" class="profile-tab-pane active">
          
          <!-- Candidate Hero Card -->
          <div class="profile-hero-card">
            <div class="profile-avatar-large-wrap">
              <img id="modal-profile-avatar" src="images/user-shashaank.png" alt="Candidate Avatar" class="profile-avatar-large" onerror="this.src='images/user-shashaank.png'">
              <span class="profile-avatar-badge" title="Active Student">●</span>
            </div>
            <div class="profile-hero-details">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="profile-name-large" id="modal-profile-name">Shashaank Sajjanar</h2>
                <span class="profile-pill-badge" id="modal-profile-batch">Batch B-948</span>
                <span class="profile-pill-verified">Verified Learner ✓</span>
              </div>
              <p class="profile-meta-line">
                <span>Roll No: <strong id="modal-profile-roll">#2026-STU</strong></span> &bull; 
                <span id="modal-profile-email">shashaank.s@campusos.edu</span>
              </p>
              <p class="profile-dept-line" id="modal-profile-dept-sem">School of Computer Science &amp; Engineering &bull; 6th Semester B.Tech</p>
            </div>
            <button type="button" onclick="switchProfileTab('edit')" class="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs self-start shrink-0 cursor-pointer">
              <span>✏️</span>
              <span>Edit</span>
            </button>
          </div>

          <!-- Quick Metrics Strip -->
          <div class="profile-metrics-grid">
            <div class="profile-metric-box">
              <span class="metric-label">Campus Radar Attendance</span>
              <span class="metric-value text-emerald-600">94.2% Prime</span>
              <span class="metric-sub">Geofenced 14m Radius</span>
            </div>
            <div class="profile-metric-box">
              <span class="metric-label">Assessment Clearance</span>
              <span class="metric-value text-indigo-600">Level 3 Cleared</span>
              <span class="metric-sub">AI 3D Proctoring Active</span>
            </div>
            <div class="profile-metric-box">
              <span class="metric-label">Cumulative GPA</span>
              <span class="metric-value text-blue-600">8.92 / 10.0</span>
              <span class="metric-sub">Academic Standing High</span>
            </div>
          </div>

          <!-- FEATURED: 3D FACE BIOMETRIC ENROLLMENT MODULE IN PROFILE -->
          <div class="profile-3d-face-card">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md shadow-purple-600/25 shrink-0">
                  🧬
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="text-sm font-bold text-slate-900">3D Face Biometric Ground Truth</h4>
                    <span id="profile-3d-badge" class="badge-3d-face text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      Setup 3D
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 mt-0.5">
                    Multi-angle facial scans stitched into a permanent 3D biometric mesh for continuous proctoring and assessment verification.
                  </p>
                </div>
              </div>
            </div>

            <!-- 4-Slot Multi-Angle Visual Gallery (Clickable to open scanner) -->
            <div class="profile-3d-gallery-grid">
              <!-- 1. Front (0°) -->
              <div class="profile-3d-angle-box" onclick="closeStudentProfileModal(); if(window.Face3DStudio) Face3DStudio.open();" title="Click to Open 3D Face Biometric Studio">
                <img id="thumb-angle-front" alt="Front Angle" class="profile-3d-angle-thumb" style="display: none;">
                <div id="ph-angle-front" class="profile-3d-angle-placeholder">FRONT 0°</div>
                <span class="profile-3d-angle-label">Front (0°)</span>
                <span id="badge-angle-front" class="profile-3d-angle-badge" style="display: none;">✓</span>
              </div>

              <!-- 2. Left (-60°) -->
              <div class="profile-3d-angle-box" onclick="closeStudentProfileModal(); if(window.Face3DStudio) Face3DStudio.open();" title="Click to Open 3D Face Biometric Studio">
                <img id="thumb-angle-left" alt="Left Profile" class="profile-3d-angle-thumb" style="display: none;">
                <div id="ph-angle-left" class="profile-3d-angle-placeholder">LEFT -60°</div>
                <span class="profile-3d-angle-label">Left (-60°)</span>
                <span id="badge-angle-left" class="profile-3d-angle-badge" style="display: none;">✓</span>
              </div>

              <!-- 3. Right (+60°) -->
              <div class="profile-3d-angle-box" onclick="closeStudentProfileModal(); if(window.Face3DStudio) Face3DStudio.open();" title="Click to Open 3D Face Biometric Studio">
                <img id="thumb-angle-right" alt="Right Profile" class="profile-3d-angle-thumb" style="display: none;">
                <div id="ph-angle-right" class="profile-3d-angle-placeholder">RIGHT +60°</div>
                <span class="profile-3d-angle-label">Right (+60°)</span>
                <span id="badge-angle-right" class="profile-3d-angle-badge" style="display: none;">✓</span>
              </div>

              <!-- 4. Stitched 3D Texture -->
              <div class="profile-3d-angle-box" onclick="closeStudentProfileModal(); if(window.Face3DStudio) Face3DStudio.open();" title="Click to Open 3D Face Biometric Studio">
                <img id="thumb-angle-stitched" alt="3D Stitched Texture" class="profile-3d-angle-thumb" style="display: none;">
                <div id="ph-angle-stitched" class="profile-3d-angle-placeholder">3D MESH</div>
                <span class="profile-3d-angle-label">Stitched Map</span>
                <span id="badge-angle-stitched" class="profile-3d-angle-badge" style="display: none;">3D ✓</span>
              </div>
            </div>

            <!-- Telemetry Status Bar -->
            <div class="mt-3.5 pt-3 border-t border-purple-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <div class="text-xs font-bold text-slate-800" id="profile-3d-status-text">No 3D Profile Enrolled</div>
                <div class="text-[11px] text-purple-700 font-mono" id="profile-3d-hash-text">Database Key: setu_permanent_3d_face_profile</div>
                <div class="text-[11px] text-slate-500" id="profile-3d-confidence-text">Multi-Angle spatial telemetry: Pending Enrollment</div>
              </div>

              <!-- 3D Actions -->
              <div class="flex items-center gap-2 flex-wrap">
                <button type="button" id="btn-set-avatar-3d" onclick="set3DFaceAsAvatar()" class="btn-3d-avatar-action" style="display: none;">
                  📸 Use as Avatar
                </button>
                <button type="button" onclick="closeStudentProfileModal(); if(window.Face3DStudio) Face3DStudio.open();" class="btn-3d-enroll-action">
                  <span>🧬</span>
                  <span id="profile-3d-btn-label">Enroll 3D Face (10s Continuous Scan)</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Comprehensive Student Info Details Grid -->
          <div class="profile-info-grid">
            <div class="profile-info-item">
              <span class="profile-info-item-label">Student ID / USN</span>
              <span class="profile-info-item-value" id="detail-roll">#2026-STU</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-item-label">Institutional Email</span>
              <span class="profile-info-item-value" id="detail-email">shashaank.s@campusos.edu</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-item-label">Mobile Phone</span>
              <span class="profile-info-item-value" id="detail-phone">+91 98765 43210</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-item-label">Date of Birth &amp; Blood Group</span>
              <span class="profile-info-item-value"><span id="detail-dob">2003-08-14</span> &bull; <span id="detail-blood">O+</span></span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-item-label">Emergency Contact</span>
              <span class="profile-info-item-value" id="detail-emergency">S. Sajjanar (+91 98765 00000)</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-item-label">Department &amp; School</span>
              <span class="profile-info-item-value" id="detail-dept">School of Computer Science &amp; Engineering</span>
            </div>
          </div>

          <!-- Academic Schedule & Standing Summary -->
          <div class="profile-section-block">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Enrolled Academic Subjects</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span class="font-semibold text-slate-800">DS302 &bull; Algorithms &amp; Complexity</span>
                <span class="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">Active Quiz</span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span class="font-semibold text-slate-800">CS201 &bull; Advanced Data Structures</span>
                <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">98% Grade</span>
              </div>
            </div>
          </div>

        </div>

        <!-- TAB 2: EDIT STUDENT DETAILS PANE -->
        <div id="profile-pane-edit" class="profile-tab-pane">
          
          <!-- Avatar Photo Update Row -->
          <div class="profile-avatar-edit-box">
            <img id="edit-avatar-preview" src="images/user-shashaank.png" alt="Avatar Preview" class="w-14 h-14 rounded-full object-cover border-2 border-indigo-400 shrink-0">
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-slate-900">Student Profile Photo</div>
              <div class="text-[11px] text-slate-500 mt-0.5">Upload a new photo or synchronize directly from your 3D Face scan.</div>
              <div class="flex items-center gap-2 mt-2">
                <input type="file" id="edit-avatar-file-input" accept="image/*" class="hidden" onchange="handleAvatarFileUpload(event)">
                <button type="button" onclick="document.getElementById('edit-avatar-file-input').click()" class="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold transition cursor-pointer">
                  📁 Upload Photo
                </button>
                <button type="button" onclick="copy3DFaceToEditAvatar()" class="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition cursor-pointer">
                  🧬 Copy from 3D Face
                </button>
              </div>
            </div>
          </div>

          <!-- 2-Column Form Fields -->
          <form class="profile-edit-form" id="student-profile-edit-form" onsubmit="saveStudentProfileForm(event)">
            <div class="profile-form-grid">
              
              <div class="profile-form-group">
                <label class="profile-form-label" for="edit-student-name">Full Legal Name *</label>
                <input type="text" id="edit-student-name" class="profile-form-input" required placeholder="e.g. Shashaank Sajjanar">
              </div>

              <div class="profile-form-group">
                <label class="profile-form-label" for="edit-student-id">Student ID / Roll No / USN *</label>
                <input type="text" id="edit-student-id" class="profile-form-input" required placeholder="e.g. 2026-STU">
              </div>

              <div class="profile-form-group">
                <label class="profile-form-label" for="edit-student-email">Institutional Email *</label>
                <input type="email" id="edit-student-email" class="profile-form-input" required placeholder="e.g. shashaank.s@campusos.edu">
              </div>

              <div class="profile-form-group">
                <label class="profile-form-label" for="edit-student-phone">Contact Mobile Number</label>
                <input type="tel" id="edit-student-phone" class="profile-form-input" placeholder="e.g. +91 98765 43210">
              </div>

              <div class="profile-form-group col-span-2">
                <label class="profile-form-label" for="edit-student-dept">Department &amp; School</label>
                <select id="edit-student-dept" class="profile-form-select">
                  <option value="School of Computer Science &amp; Engineering">School of Computer Science &amp; Engineering</option>
                  <option value="Department of Information Science &amp; Engineering">Department of Information Science &amp; Engineering</option>
                  <option value="Department of AI &amp; Machine Learning">Department of AI &amp; Machine Learning</option>
                  <option value="School of Electronics &amp; Communication">School of Electronics &amp; Communication</option>
                </select>
              </div>

              <div class="profile-form-group">
                <label class="profile-form-label" for="edit-student-sem">Current Semester</label>
                <select id="edit-student-sem" class="profile-form-select">
                  <option value="6th Semester B.Tech">6th Semester B.Tech</option>
                  <option value="1st Semester B.Tech">1st Semester B.Tech</option>
                  <option value="2nd Semester B.Tech">2nd Semester B.Tech</option>
                  <option value="3rd Semester B.Tech">3rd Semester B.Tech</option>
                  <option value="4th Semester B.Tech">4th Semester B.Tech</option>
                  <option value="5th Semester B.Tech">5th Semester B.Tech</option>
                  <option value="7th Semester B.Tech">7th Semester B.Tech</option>
                  <option value="8th Semester B.Tech">8th Semester B.Tech</option>
                </select>
              </div>

              <div class="profile-form-group">
                <label class="profile-form-label" for="edit-student-batch">Batch / Cohort</label>
                <input type="text" id="edit-student-batch" class="profile-form-input" placeholder="e.g. Batch B-948 (2022 - 2026)">
              </div>

              <div class="profile-form-group">
                <label class="profile-form-label" for="edit-student-dob">Date of Birth</label>
                <input type="date" id="edit-student-dob" class="profile-form-input">
              </div>

              <div class="profile-form-group">
                <label class="profile-form-label" for="edit-student-blood">Blood Group</label>
                <select id="edit-student-blood" class="profile-form-select">
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div class="profile-form-group col-span-2">
                <label class="profile-form-label" for="edit-student-emergency">Emergency Contact (Name &amp; Phone)</label>
                <input type="text" id="edit-student-emergency" class="profile-form-input" placeholder="e.g. S. Sajjanar (+91 98765 00000)">
              </div>

            </div>

            <!-- Bottom Form Actions -->
            <div class="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <button type="button" onclick="resetStudentProfileDefaults()" class="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer">
                Restore Demo Defaults
              </button>
              <div class="flex items-center gap-2">
                <button type="button" onclick="switchProfileTab('overview')" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" class="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition cursor-pointer flex items-center gap-1.5">
                  <span>💾</span>
                  <span>Save Student Info &amp; 3D Biometrics</span>
                </button>
              </div>
            </div>
          </form>

        </div>

      </div>

      <!-- Modal Footer -->
      <div class="profile-modal-footer">
        <button type="button" onclick="closeStudentProfileModal()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer">
          Close Profile
        </button>
        <a href="login.html" class="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </a>
      </div>

    </div>
  </div>
  `;

  if (document.body) {
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
}

function openStudentProfileModal() {
  injectStudentProfileModal();
  const modal = document.getElementById('modal-student-profile');
  if (!modal) return;

  // Close any open dropdown menu
  document.querySelectorAll('.user-profile-menu, .nav-dropdown, .dropdown-menu').forEach(el => {
    el.classList.remove('open');
  });

  // Switch to overview by default and populate DOM
  switchProfileTab('overview');
  StudentProfileDB.applyToDOM();
  modal.classList.add('open');
}

function closeStudentProfileModal() {
  const modal = document.getElementById('modal-student-profile');
  if (modal) {
    modal.classList.remove('open');
  }
}

function switchProfileTab(tabName) {
  const btnOverview = document.getElementById('tab-btn-overview');
  const btnEdit = document.getElementById('tab-btn-edit');
  const paneOverview = document.getElementById('profile-pane-overview');
  const paneEdit = document.getElementById('profile-pane-edit');

  if (!btnOverview || !btnEdit || !paneOverview || !paneEdit) return;

  if (tabName === 'edit') {
    btnOverview.classList.remove('active');
    btnEdit.classList.add('active');
    paneOverview.classList.remove('active');
    paneEdit.classList.add('active');

    // Populate edit fields from database
    const profile = StudentProfileDB.get();
    tempUploadedAvatarUrl = null;

    const editName = document.getElementById('edit-student-name');
    const editId = document.getElementById('edit-student-id');
    const editEmail = document.getElementById('edit-student-email');
    const editPhone = document.getElementById('edit-student-phone');
    const editDept = document.getElementById('edit-student-dept');
    const editSem = document.getElementById('edit-student-sem');
    const editBatch = document.getElementById('edit-student-batch');
    const editDob = document.getElementById('edit-student-dob');
    const editBlood = document.getElementById('edit-student-blood');
    const editEmergency = document.getElementById('edit-student-emergency');
    const editAvatarPreview = document.getElementById('edit-avatar-preview');

    if (editName) editName.value = profile.fullName || '';
    if (editId) editId.value = profile.studentId || '';
    if (editEmail) editEmail.value = profile.email || '';
    if (editPhone) editPhone.value = profile.phone || '';
    if (editDept) editDept.value = profile.department || 'School of Computer Science & Engineering';
    if (editSem) editSem.value = profile.semester || '6th Semester B.Tech';
    if (editBatch) editBatch.value = profile.batch || '';
    if (editDob) editDob.value = profile.dob || '';
    if (editBlood) editBlood.value = profile.bloodGroup || 'O+';
    if (editEmergency) editEmergency.value = profile.emergencyContact || '';
    if (editAvatarPreview && profile.avatarUrl) editAvatarPreview.src = profile.avatarUrl;

  } else {
    btnEdit.classList.remove('active');
    btnOverview.classList.add('active');
    paneEdit.classList.remove('active');
    paneOverview.classList.add('active');

    StudentProfileDB.applyToDOM();
  }
}

function handleAvatarFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    tempUploadedAvatarUrl = evt.target.result;
    const preview = document.getElementById('edit-avatar-preview');
    if (preview) preview.src = tempUploadedAvatarUrl;
    showToast('New profile photo selected. Click "Save Student Info" to confirm.');
  };
  reader.readAsDataURL(file);
}

function copy3DFaceToEditAvatar() {
  const profile = StudentProfileDB.get();
  if (profile.face3D && profile.face3D.frontPhotoUrl) {
    tempUploadedAvatarUrl = profile.face3D.frontPhotoUrl;
    const preview = document.getElementById('edit-avatar-preview');
    if (preview) preview.src = tempUploadedAvatarUrl;
    showToast('3D Front Face photo copied to avatar preview.');
  } else {
    showToast('No 3D Face enrolled yet. Please complete a 3D scan first.');
  }
}

function saveStudentProfileForm(e) {
  if (e && e.preventDefault) e.preventDefault();

  const nameInput = document.getElementById('edit-student-name');
  const idInput = document.getElementById('edit-student-id');
  const emailInput = document.getElementById('edit-student-email');
  const phoneInput = document.getElementById('edit-student-phone');
  const deptInput = document.getElementById('edit-student-dept');
  const semInput = document.getElementById('edit-student-sem');
  const batchInput = document.getElementById('edit-student-batch');
  const dobInput = document.getElementById('edit-student-dob');
  const bloodInput = document.getElementById('edit-student-blood');
  const emergencyInput = document.getElementById('edit-student-emergency');

  const fullName = nameInput ? nameInput.value.trim() : '';
  const studentId = idInput ? idInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';

  if (!fullName || !studentId || !email) {
    alert('Please fill in required fields: Full Name, Student ID, and Email.');
    return;
  }

  const updatedData = {
    fullName: fullName,
    studentId: studentId,
    email: email,
    phone: phoneInput ? phoneInput.value.trim() : '',
    department: deptInput ? deptInput.value : 'School of Computer Science & Engineering',
    semester: semInput ? semInput.value : '6th Semester B.Tech',
    batch: batchInput ? batchInput.value.trim() : 'Batch B-948',
    dob: dobInput ? dobInput.value : '',
    bloodGroup: bloodInput ? bloodInput.value : 'O+',
    emergencyContact: emergencyInput ? emergencyInput.value.trim() : ''
  };

  if (tempUploadedAvatarUrl) {
    updatedData.avatarUrl = tempUploadedAvatarUrl;
  }

  const saved = StudentProfileDB.save(updatedData);
  if (saved) {
    showToast('✓ Student details & 3D biometric profile permanently saved to database!');
    switchProfileTab('overview');
  } else {
    showToast('Failed to save student profile. Please try again.');
  }
}

function set3DFaceAsAvatar() {
  const profile = StudentProfileDB.get();
  if (profile.face3D && profile.face3D.frontPhotoUrl) {
    StudentProfileDB.save({ avatarUrl: profile.face3D.frontPhotoUrl });
    showToast('3D front face photo set as your student avatar & saved to database ✓');
  } else {
    showToast('Please enroll your 3D Face first in the 3D Face Studio.');
  }
}

function resetStudentProfileDefaults() {
  if (confirm('Reset student profile to demo defaults (Shashaank Sajjanar, #2026-STU)?')) {
    StudentProfileDB.resetDefaults();
    showToast('Student profile restored to default demo state.');
    switchProfileTab('overview');
  }
}

function refreshStudentProfile3DData() {
  const profile = StudentProfileDB.get();
  const face = (profile && profile.face3D && profile.face3D.enrolled) ? profile.face3D : (window.Face3DStudio ? Face3DStudio.getProfile() : null);

  const badge = document.getElementById('profile-3d-badge');
  const status = document.getElementById('profile-3d-status-text');
  const hash = document.getElementById('profile-3d-hash-text');
  const confidence = document.getElementById('profile-3d-confidence-text');
  const btnLabel = document.getElementById('profile-3d-btn-label');
  const btnSetAvatar = document.getElementById('btn-set-avatar-3d');

  // Angle thumbnails
  const tFront = document.getElementById('thumb-angle-front');
  const pFront = document.getElementById('ph-angle-front');
  const bFront = document.getElementById('badge-angle-front');

  const tLeft = document.getElementById('thumb-angle-left');
  const pLeft = document.getElementById('ph-angle-left');
  const bLeft = document.getElementById('badge-angle-left');

  const tRight = document.getElementById('thumb-angle-right');
  const pRight = document.getElementById('ph-angle-right');
  const bRight = document.getElementById('badge-angle-right');

  const tStitched = document.getElementById('thumb-angle-stitched');
  const pStitched = document.getElementById('ph-angle-stitched');
  const bStitched = document.getElementById('badge-angle-stitched');

  if (face && face.frontPhotoUrl) {
    if (badge) {
      badge.className = 'badge-3d-face text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300';
      badge.textContent = '3D Enrolled ✓';
    }
    if (status) status.textContent = '3D Biometrics Enrolled & Verified ✓';
    if (hash) hash.textContent = `Hash: ${face.biometricHash || '3D_BIO_VERIFIED'} • Enrolled: ${new Date(face.enrolledAt || Date.now()).toLocaleDateString()}`;
    if (confidence) confidence.textContent = 'Continuous Multi-Angle Telemetry: Active (99.4% Match Ground Truth)';
    if (btnLabel) btnLabel.textContent = 'Re-scan 3D Face (10s Continuous Scan)';
    if (btnSetAvatar) {
      btnSetAvatar.classList.remove('hidden');
      btnSetAvatar.style.display = 'inline-flex';
    }

    // Populate thumbnails
    if (tFront) { tFront.src = face.frontPhotoUrl; tFront.style.display = 'block'; tFront.classList.remove('hidden'); }
    if (pFront) { pFront.style.display = 'none'; pFront.classList.add('hidden'); }
    if (bFront) { bFront.style.display = 'block'; bFront.classList.remove('hidden'); }

    if (tLeft) { tLeft.src = face.leftPhotoUrl || face.frontPhotoUrl; tLeft.style.display = 'block'; tLeft.classList.remove('hidden'); }
    if (pLeft) { pLeft.style.display = 'none'; pLeft.classList.add('hidden'); }
    if (bLeft) { bLeft.style.display = 'block'; bLeft.classList.remove('hidden'); }

    if (tRight) { tRight.src = face.rightPhotoUrl || face.frontPhotoUrl; tRight.style.display = 'block'; tRight.classList.remove('hidden'); }
    if (pRight) { pRight.style.display = 'none'; pRight.classList.add('hidden'); }
    if (bRight) { bRight.style.display = 'block'; bRight.classList.remove('hidden'); }

    if (tStitched) { tStitched.src = face.stitchedTextureUrl || face.frontPhotoUrl; tStitched.style.display = 'block'; tStitched.classList.remove('hidden'); }
    if (pStitched) { pStitched.style.display = 'none'; pStitched.classList.add('hidden'); }
    if (bStitched) { bStitched.style.display = 'block'; bStitched.classList.remove('hidden'); }

  } else {
    if (badge) {
      badge.className = 'badge-3d-face text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300';
      badge.textContent = 'Setup 3D';
    }
    if (status) status.textContent = 'No 3D Profile Enrolled';
    if (hash) hash.textContent = 'Key: setu_permanent_3d_face_profile (Pending Capture)';
    if (confidence) confidence.textContent = 'Multi-Angle spatial telemetry: Pending Enrollment';
    if (btnLabel) btnLabel.textContent = 'Enroll 3D Face (10s Continuous Scan)';
    if (btnSetAvatar) {
      btnSetAvatar.classList.add('hidden');
      btnSetAvatar.style.display = 'none';
    }

    if (tFront) { tFront.removeAttribute('src'); tFront.style.display = 'none'; tFront.classList.add('hidden'); }
    if (pFront) { pFront.style.display = 'flex'; pFront.classList.remove('hidden'); }
    if (bFront) { bFront.style.display = 'none'; bFront.classList.add('hidden'); }

    if (tLeft) { tLeft.removeAttribute('src'); tLeft.style.display = 'none'; tLeft.classList.add('hidden'); }
    if (pLeft) { pLeft.style.display = 'flex'; pLeft.classList.remove('hidden'); }
    if (bLeft) { bLeft.style.display = 'none'; bLeft.classList.add('hidden'); }

    if (tRight) { tRight.removeAttribute('src'); tRight.style.display = 'none'; tRight.classList.add('hidden'); }
    if (pRight) { pRight.style.display = 'flex'; pRight.classList.remove('hidden'); }
    if (bRight) { bRight.style.display = 'none'; bRight.classList.add('hidden'); }

    if (tStitched) { tStitched.removeAttribute('src'); tStitched.style.display = 'none'; tStitched.classList.add('hidden'); }
    if (pStitched) { pStitched.style.display = 'flex'; pStitched.classList.remove('hidden'); }
    if (bStitched) { bStitched.style.display = 'none'; bStitched.classList.add('hidden'); }
  }
}

// Global modal event listeners and exposure
window.StudentProfileDB = StudentProfileDB;
window.openStudentProfileModal = openStudentProfileModal;
window.closeStudentProfileModal = closeStudentProfileModal;
window.switchProfileTab = switchProfileTab;
window.saveStudentProfileForm = saveStudentProfileForm;
window.set3DFaceAsAvatar = set3DFaceAsAvatar;
window.copy3DFaceToEditAvatar = copy3DFaceToEditAvatar;
window.handleAvatarFileUpload = handleAvatarFileUpload;
window.resetStudentProfileDefaults = resetStudentProfileDefaults;
window.refreshStudentProfile3DData = refreshStudentProfile3DData;

window.addEventListener('setu-3d-face-updated', () => {
  refreshStudentProfile3DData();
});

window.addEventListener('setu-student-profile-updated', (e) => {
  StudentProfileDB.applyToDOM(e.detail);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeStudentProfileModal();
  }
});



