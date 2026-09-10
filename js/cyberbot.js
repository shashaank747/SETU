/**
 * AppTechno CampusOS - ZUNO AI Assistant & 3D Interactive Mascot
 * Features:
 * - 3D Mouse & Physics tracking for miniature mascot in the navbar
 * - Complete knowledge base of all CampusOS modules & features
 * - Smart natural language query processing & direct app navigation
 * - Direct execution of campus actions (Punch In, Punch Out, QR Scanner, etc.)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const BOT_AVATAR_SVG = `
    <svg class="bot-avatar-svg" width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="24" y1="4" x2="24" y2="12" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="24" cy="5" r="4" fill="#00D2FF"/>
      <rect x="5" y="18" width="4" height="12" rx="2" fill="#334155" stroke="#38BDF8" stroke-width="1"/>
      <rect x="39" y="18" width="4" height="12" rx="2" fill="#334155" stroke="#38BDF8" stroke-width="1"/>
      <rect x="8" y="11" width="32" height="27" rx="10" fill="#1E293B" stroke="#00D2FF" stroke-width="2"/>
      <rect x="13" y="18" width="22" height="13" rx="5" fill="#030712" stroke="#0284C7" stroke-width="1"/>
      <ellipse cx="19" cy="24.5" rx="3.5" ry="3.5" fill="#00D2FF"/>
      <ellipse cx="29" cy="24.5" rx="3.5" ry="3.5" fill="#00D2FF"/>
    </svg>
  `;

  const navRobotTrigger = document.getElementById('nav-robot-trigger');
  const cyberbotBackdrop = document.getElementById('cyberbot-backdrop');
  const cyberbotDrawer = document.getElementById('cyberbot-drawer');
  const cyberbotCloseBtn = document.getElementById('cyberbot-close-btn');
  const cyberbotClearBtn = document.getElementById('cyberbot-clear-btn');
  const cyberbotMessages = document.getElementById('cyberbot-messages');
  const cyberbotInput = document.getElementById('cyberbot-input');
  const cyberbotSendBtn = document.getElementById('cyberbot-send-btn');
  const cyberbotQuickChips = document.querySelectorAll('.chip-btn');

  // ------------------------------------------------------------------------
  // 1. Dynamic 3D Robot Face Mouse Tracking (Dock Mascot & Header Avatar)
  // ------------------------------------------------------------------------
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  const robotHeads = document.querySelectorAll('.robot-head');
  if (robotHeads.length > 0) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      updateRobotTracking(mouseX, mouseY);
    });

    function updateRobotTracking(targetX, targetY) {
      robotHeads.forEach((head) => {
        const rect = head.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = targetX - centerX;
        const dy = targetY - centerY;

        const normX = Math.max(-1, Math.min(1, dx / (window.innerWidth / 2)));
        const normY = Math.max(-1, Math.min(1, dy / (window.innerHeight / 2)));

        const rotY = normX * 18;
        const rotX = -normY * 16;
        head.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;
      });

      const visorFrames = document.querySelectorAll('.robot-visor-frame');
      visorFrames.forEach((vf) => {
        const rect = vf.getBoundingClientRect();
        const normX = Math.max(-1, Math.min(1, (targetX - (rect.left + rect.width / 2)) / (window.innerWidth / 2)));
        const normY = Math.max(-1, Math.min(1, (targetY - (rect.top + rect.height / 2)) / (window.innerHeight / 2)));
        vf.style.transform = `translateZ(14px) translate(${normX * 4}px, ${normY * 3}px)`;
      });

      const earsLeft = document.querySelectorAll('.robot-ear.left');
      earsLeft.forEach((el) => {
        const normX = Math.max(-1, Math.min(1, (targetX - window.innerWidth / 2) / (window.innerWidth / 2)));
        el.style.transform = `rotateY(${-15 + normX * 9}deg) translateZ(${-5 - normX * 3}px)`;
      });

      const earsRight = document.querySelectorAll('.robot-ear.right');
      earsRight.forEach((er) => {
        const normX = Math.max(-1, Math.min(1, (targetX - window.innerWidth / 2) / (window.innerWidth / 2)));
        er.style.transform = `rotateY(${15 + normX * 9}deg) translateZ(${-5 + normX * 3}px)`;
      });

      const allPupils = document.querySelectorAll('.robot-pupil');
      allPupils.forEach((p) => {
        const rect = p.getBoundingClientRect();
        const normX = Math.max(-1, Math.min(1, (targetX - (rect.left + rect.width / 2)) / (window.innerWidth / 2)));
        const normY = Math.max(-1, Math.min(1, (targetY - (rect.top + rect.height / 2)) / (window.innerHeight / 2)));
        p.style.transform = `translate(${normX * 6}px, ${normY * 6}px)`;
      });
    }

    // Natural Periodic Blinking across all robot instances
    setInterval(() => {
      const allEyelids = document.querySelectorAll('.robot-eyelid');
      allEyelids.forEach((el) => (el.style.height = '100%'));
      setTimeout(() => {
        allEyelids.forEach((el) => (el.style.height = '0%'));
      }, 140);
    }, 4000);
  }

  // ------------------------------------------------------------------------
  // 2. Chatbot Floating Card Open / Close / Toggle
  // ------------------------------------------------------------------------
  function openCyberBot() {
    if (cyberbotDrawer) {
      if (cyberbotBackdrop) cyberbotBackdrop.classList.add('open');
      cyberbotDrawer.classList.add('open');
      if (cyberbotInput) {
        setTimeout(() => cyberbotInput.focus(), 200);
      }
    }
  }

  function closeCyberBot() {
    if (cyberbotDrawer) {
      if (cyberbotBackdrop) cyberbotBackdrop.classList.remove('open');
      cyberbotDrawer.classList.remove('open');
    }
  }

  function toggleCyberBot() {
    if (cyberbotDrawer && cyberbotDrawer.classList.contains('open')) {
      closeCyberBot();
    } else {
      openCyberBot();
    }
  }

  if (navRobotTrigger) {
    navRobotTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCyberBot();
    });
  }

  if (cyberbotCloseBtn) {
    cyberbotCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCyberBot();
    });
  }

  if (cyberbotDrawer) {
    cyberbotDrawer.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (cyberbotBackdrop) {
    cyberbotBackdrop.addEventListener('click', closeCyberBot);
  }

  // Click outside hovering card closes CyberBot
  document.addEventListener('click', (e) => {
    if (cyberbotDrawer && cyberbotDrawer.classList.contains('open')) {
      if (!cyberbotDrawer.contains(e.target) && (!navRobotTrigger || !navRobotTrigger.contains(e.target))) {
        closeCyberBot();
      }
    }
  });

  // Global Keyboard Shortcut Ctrl+K to toggle CyberBot
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggleCyberBot();
    }
    if (e.key === 'Escape' && cyberbotDrawer && cyberbotDrawer.classList.contains('open')) {
      closeCyberBot();
    }
  });

  // ------------------------------------------------------------------------
  // 3. Chat Messages & App Knowledge Engine
  // ------------------------------------------------------------------------
  function appendMessage(sender, htmlContent, actionButtons = []) {
    if (!cyberbotMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    if (sender === 'bot') {
      avatar.innerHTML = BOT_AVATAR_SVG;
    } else {
      avatar.textContent = 'SS';
    }

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = htmlContent;

    if (actionButtons && actionButtons.length > 0) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'chat-actions-container';
      actionButtons.forEach((btn) => {
        const actionEl = document.createElement('button');
        actionEl.className = 'chat-action-btn';
        actionEl.type = 'button';
        actionEl.innerHTML = btn.label;
        actionEl.addEventListener('click', () => {
          if (typeof btn.action === 'function') {
            btn.action();
          } else if (typeof btn.action === 'string') {
            window.location.href = btn.action;
          }
        });
        actionsDiv.appendChild(actionEl);
      });
      bubble.appendChild(actionsDiv);
    }

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    cyberbotMessages.appendChild(msgDiv);
    cyberbotMessages.scrollTop = cyberbotMessages.scrollHeight;
  }

  function handleUserQuery(queryText) {
    const raw = queryText.trim();
    if (!raw) return;

    // Show user message
    appendMessage('user', `<p>${escapeHtml(raw)}</p>`);
    if (cyberbotInput) cyberbotInput.value = '';

    // Scroll to bottom
    cyberbotMessages.scrollTop = cyberbotMessages.scrollHeight;

    // Generate bot response
    setTimeout(() => {
      processBotResponse(raw.toLowerCase());
    }, 350);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ------------------------------------------------------------------------
  // 4. Natural Language Knowledge & Navigation Router
  // ------------------------------------------------------------------------
  function processBotResponse(q) {
    // 1. Navigation: Class Recordings
    if (q.includes('recording') || q.includes('class record') || q.includes('lecture') || q.includes('video') || q.includes('classes')) {
      appendMessage(
        'bot',
        `<p>🎬 <strong>Class Recordings Portal</strong>:</p>
         <p>You can access all archived and live recorded lectures with video playback, semester filters, and subject chapters.</p>
         <p>Would you like to go to <strong>Class Recordings</strong> now?</p>`,
        [
          {
            label: '🎬 Open Class Recordings ➔',
            action: 'Class_recordings.html'
          }
        ]
      );
      return;
    }

    // 2. Navigation: Punch Out
    if (q.includes('punch out') || q.includes('stop timer') || q.includes('pause timer') || q.includes('clock out')) {
      const punchBtn = document.getElementById('btn-punch-toggle');
      if (punchBtn) {
        const isCurrentlyPunchedIn = !punchBtn.classList.contains('punched-in');
        if (isCurrentlyPunchedIn) {
          punchBtn.click();
          appendMessage(
            'bot',
            `<p>⏱️ <strong>Campus Radar Punched Out!</strong></p>
             <p>I have stopped your live session elapsed timer and recorded your punch-out timestamp. Your radar session is currently frozen.</p>
             <p>Remember: The elapsed timer will auto-reset at <strong>11:59 PM (23:59)</strong> tonight!</p>`
          );
        } else {
          appendMessage(
            'bot',
            `<p>ℹ️ You are <strong>already punched OUT</strong>! The session timer is currently paused.</p>
             <p>Click below if you want to punch in:</p>`,
            [
              {
                label: '🟢 Punch In Now',
                action: () => { punchBtn.click(); closeCyberBot(); }
              }
            ]
          );
        }
      } else {
        appendMessage('bot', '<p>Punch button was not found on this page.</p>');
      }
      return;
    }

    // 3. Navigation: Punch In
    if (q.includes('punch in') || q.includes('start timer') || q.includes('resume timer') || q.includes('clock in')) {
      const punchBtn = document.getElementById('btn-punch-toggle');
      if (punchBtn) {
        const isCurrentlyPunchedOut = punchBtn.classList.contains('punched-in');
        if (isCurrentlyPunchedOut) {
          punchBtn.click();
          appendMessage(
            'bot',
            `<p>⏱️ <strong>Punched IN to Campus Radar!</strong></p>
             <p>Geofence perimeter verified at BLR-GATE-04B. Your session stopwatch has started ticking!</p>`
          );
        } else {
          appendMessage(
            'bot',
            `<p>✅ You are <strong>already punched IN</strong>! Your session stopwatch is actively running.</p>`
          );
        }
      }
      return;
    }

    // 4. Navigation: Reset Timer / 11:59 PM
    if (q.includes('11:59') || q.includes('reset timer') || q.includes('auto close') || q.includes('midnight reset') || q.includes('reset')) {
      if (typeof window.simulateMidnightReset === 'function') {
        window.simulateMidnightReset();
        appendMessage(
          'bot',
          `<p>🌙 <strong>11:59 PM Daily Reset Triggered!</strong></p>
           <p>The elapsed timer has been reset to <strong>00 : 00 : 00</strong> and the session auto-closed. When you punch in again, it will count freshly from 00:00:00!</p>`
        );
      } else {
        appendMessage('bot', '<p>Daily reset is configured for 23:59:00 every evening.</p>');
      }
      return;
    }

    // 5. Navigation: Scan Terminal QR
    if (q.includes('scan') || q.includes('qr') || q.includes('terminal') || q.includes('barcode')) {
      const btnScan = document.getElementById('btn-scan-terminal');
      if (btnScan) {
        closeCyberBot();
        btnScan.click();
      } else {
        appendMessage('bot', '<p>Terminal QR Scanner opened.</p>');
      }
      return;
    }

    // 6. Navigation: Contributors Page
    if (q.includes('contributor') || q.includes('team') || q.includes('developer') || q.includes('author') || q.includes('who made') || q.includes('credit')) {
      appendMessage(
        'bot',
        `<p>👥 <strong>Project Contributors</strong>:</p>
         <p>Discover the talented developers, designers, and engineers behind AppTechno CampusOS!</p>`,
        [
          {
            label: '👥 View Contributors Page ➔',
            action: 'contributors.html'
          }
        ]
      );
      return;
    }

    // 7. Navigation: Login Portal / Logout
    if (q.includes('login') || q.includes('logout') || q.includes('sign out') || q.includes('signout') || q.includes('switch role') || q.includes('portal')) {
      appendMessage(
        'bot',
        `<p>🔐 <strong>CampusOS Authentication Portal</strong>:</p>
         <p>You can sign out, switch roles (Student, Faculty, Admin, Recruiter), or log in with another account.</p>`,
        [
          {
            label: '🔐 Go to Login Page ➔',
            action: 'login.html'
          },
          {
            label: '👋 Sign Out Now',
            action: () => {
              localStorage.removeItem('campusos_user_role');
              window.location.href = 'login.html';
            }
          }
        ]
      );
      return;
    }

    // 8. Navigation: Landing Page / Home
    if (q.includes('home') || q.includes('landing') || q.includes('front page') || q.includes('main site') || q.includes('welcome')) {
      appendMessage(
        'bot',
        `<p>🌐 <strong>Main CampusOS Landing Page</strong>:</p>
         <p>Features overview, institute statistics, curriculum roadmap, and admissions portal.</p>`,
        [
          {
            label: '🌐 Go to Landing Page ➔',
            action: 'index.html'
          }
        ]
      );
      return;
    }

    // 9. Navigation: Academics & Courses
    if (q.includes('academic') || q.includes('course') || q.includes('subject') || q.includes('syllabus') || q.includes('curriculum')) {
      appendMessage(
        'bot',
        `<p>📚 <strong>Academics & Enrolled Courses</strong>:</p>
         <p>Here are your active enrolled modules:</p>
         <ul>
           <li><strong>CS401:</strong> Full Stack Web Architecture</li>
           <li><strong>AI502:</strong> Deep Learning & Neural Networks</li>
           <li><strong>DS302:</strong> Data Structures & Algorithm Design</li>
           <li><strong>CL601:</strong> Cloud Native DevOps & Containers</li>
         </ul>
         <p>Use the <strong>Academics</strong> menu in the navbar for syllabi, assignments, and examination dates!</p>`,
        [
          {
            label: '📚 Open Academics Menu',
            action: () => {
              const acadBtn = document.getElementById('academics-btn');
              if (acadBtn) {
                closeCyberBot();
                acadBtn.click();
              }
            }
          },
          {
            label: '🎬 View Class Recordings ➔',
            action: 'Class_recordings.html'
          }
        ]
      );
      return;
    }

    // 10. Knowledge: Campus Radar & Geofence
    if (q.includes('radar') || q.includes('geofence') || q.includes('attendance') || q.includes('range') || q.includes('radius')) {
      appendMessage(
        'bot',
        `<p>📡 <strong>Campus Radar Geofence System</strong>:</p>
         <p>• <strong>Status:</strong> Active & In-Range (Distance: 14.2m from BLR-GATE-04B)</p>
         <p>• <strong>Attendance Index:</strong> 94.2% (Semester Spring 2026)</p>
         <p>• <strong>Daily Auto-Close:</strong> Automatically punches out and resets timer at 23:59 (11:59 PM).</p>
         <p>• <strong>Actions:</strong> Punch In to start the stopwatch, Punch Out to pause it.</p>`
      );
      return;
    }

    // 11. Knowledge: Timetable & Schedule
    if (q.includes('time') || q.includes('timetable') || q.includes('schedule') || q.includes('period') || q.includes('routine')) {
      appendMessage(
        'bot',
        `<p>🗓️ <strong>Today's Schedule (Monday)</strong>:</p>
         <p>• <strong>09:30 AM - 11:30 AM:</strong> Web Development Lecture (Hall B-02)</p>
         <p>• <strong>11:45 AM - 01:00 PM:</strong> AI & Python Lab (BLR-LAB-3)</p>
         <p>• <strong>01:00 PM - 02:00 PM:</strong> Cafeteria Lunch Break</p>
         <p>• <strong>02:00 PM - 04:30 PM:</strong> Data Structures Hands-on Coding</p>`
      );
      return;
    }

    // 12. Knowledge: Notifications
    if (q.includes('notification') || q.includes('bell') || q.includes('alert') || q.includes('news')) {
      const bellBtn = document.getElementById('nav-bell-btn');
      if (bellBtn) {
        closeCyberBot();
        bellBtn.click();
      }
      return;
    }

    // 13. General Greetings / Personality / Name
    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('who are you') || q.includes('help') || q.includes('zuno') || q.includes('name')) {
      appendMessage(
        'bot',
        `<p>👋 <strong>Hello, Shashaank!</strong> I'm <strong>ZUNO</strong>, your 3D AI companion for setu!</p>
         <p>I know everything about this app. Tell me what you need, for example:</p>
         <ul>
           <li><em>"Go to Class Recordings"</em></li>
           <li><em>"Punch out of campus"</em> or <em>"Punch in"</em></li>
           <li><em>"Reset timer for 11:59 PM"</em></li>
           <li><em>"Show me the contributors"</em></li>
           <li><em>"What are my classes today?"</em></li>
         </ul>`,
        [
          {
            label: '🎬 Go to Recordings',
            action: 'Class_recordings.html'
          },
          {
            label: '👥 View Contributors',
            action: 'contributors.html'
          },
          {
            label: '🔐 Login Portal',
            action: 'login.html'
          }
        ]
      );
      return;
    }

    // Default Fallback with Helpful Shortcuts
    appendMessage(
      'bot',
      `<p>🤖 <em>"I'm on it!"</em> Regarding <strong>"${escapeHtml(q)}"</strong>:</p>
       <p>I can help you navigate directly to any page or manage your campus radar session. Where would you like to go?</p>`,
      [
        {
          label: '🎬 Class Recordings',
          action: 'Class_recordings.html'
        },
        {
          label: '👥 Contributors',
          action: 'contributors.html'
        },
        {
          label: '🌐 Landing Page',
          action: 'index.html'
        },
        {
          label: '🔐 Login Page',
          action: 'login.html'
        }
      ]
    );
  }

  // ------------------------------------------------------------------------
  // 5. Input Event Listeners
  // ------------------------------------------------------------------------
  if (cyberbotSendBtn && cyberbotInput) {
    cyberbotSendBtn.addEventListener('click', () => {
      handleUserQuery(cyberbotInput.value);
    });

    cyberbotInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUserQuery(cyberbotInput.value);
      }
    });
  }

  // Quick Chips Click Listeners
  cyberbotQuickChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt') || chip.textContent.trim();
      handleUserQuery(prompt);
    });
  });

  // Clear Chat Button
  if (cyberbotClearBtn && cyberbotMessages) {
    cyberbotClearBtn.addEventListener('click', () => {
      cyberbotMessages.innerHTML = `
        <div class="chat-msg bot">
          <div class="chat-msg-avatar">
            ${BOT_AVATAR_SVG}
          </div>
          <div class="chat-bubble">
            <p>👋 Chat cleared! I'm <strong>ZUNO</strong>, your setu guide. How can I help you navigate?</p>
          </div>
        </div>
      `;
    });
  }
});
