/**
 * AppTechno CampusOS - Dynamic Robot Mascot Physics & Interactivity
 * Features:
 * - 3D Mouse Tracking for Head, Visor, and Pupils
 * - Interactive Hover: Friendly 3D wiggle shake, hand wave, and "Hi! 👋" speech bubble
 * - Form Interactivity: Watches email input, covers eyes on password, peeks on toggle, celebrates on login
 */

window.RobotMascot = (function () {
  const robotStage = document.getElementById('robot-stage');
  const robotHead = document.getElementById('robot-head');
  const visorFrame = document.querySelector('.robot-visor-frame');
  const groundShadow = document.querySelector('.robot-ground-shadow');
  const earLeft = document.querySelector('.robot-ear.left');
  const earRight = document.querySelector('.robot-ear.right');
  const pupils = document.querySelectorAll('.robot-pupil');
  const eyelids = document.querySelectorAll('.robot-eyelid');
  const speechText = document.getElementById('speech-text');

  if (!robotStage || !robotHead) return null;

  let currentState = 'IDLE'; // 'IDLE', 'WATCH_EMAIL', 'COVER_PASSWORD', 'PEEK_PASSWORD', 'HAPPY_LOGIN', 'SAYING_HI'
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let hiTimeout = null;
  let isSayingHi = false;

  const greetings = ['Hi! 👋', 'Hello! ✨', 'Hi there! 🤖', 'Welcome! 🚀', 'Hey! 👋'];

  // Trigger the Hi! Shake and Wave reaction (on hover)
  function triggerSayHi() {
    if (currentState === 'COVER_PASSWORD' || currentState === 'HAPPY_LOGIN') return;

    isSayingHi = true;

    if (speechText) {
      const pick = greetings[Math.floor(Math.random() * greetings.length)];
      speechText.textContent = pick;
    }

    robotStage.classList.add('saying-hi');
    robotHead.classList.remove('watching-email');

    // Reset inline head transform so keyframe shake executes smoothly
    robotHead.style.transform = '';

    clearTimeout(hiTimeout);
    hiTimeout = setTimeout(() => {
      isSayingHi = false;
      robotStage.classList.remove('saying-hi');
      if (currentState === 'IDLE') {
        updateIdleTracking();
      }
    }, 1800);
  }

  // Mousemove listener across the window for 3D tracking
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Only update idle tracking when not actively waving
    if (currentState === 'IDLE' && !isSayingHi) {
      updateIdleTracking();
    }
  });

  // Calculate angle & position for 3D Head, Visor, and Pupils
  function lookAt(targetX, targetY, maxPupilOffset = 7, maxHeadRot = 16) {
    if (isSayingHi) return;

    const rect = robotHead.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = targetX - centerX;
    const dy = targetY - centerY;

    // Normalize
    const normX = Math.max(-1, Math.min(1, dx / (window.innerWidth / 2)));
    const normY = Math.max(-1, Math.min(1, dy / (window.innerHeight / 2)));

    // 3D Head rotation
    const rotY = normX * maxHeadRot;
    const rotX = -normY * maxHeadRot;
    robotHead.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;

    // 3D Parallax shift for Visor Frame
    if (visorFrame) {
      visorFrame.style.transform = `translateZ(14px) translate(${normX * 5}px, ${normY * 4}px)`;
    }

    // 3D Counter-shift for Ears
    if (earLeft) {
      earLeft.style.transform = `rotateY(${-15 + rotY * 0.5}deg) translateZ(${-5 - normX * 4}px)`;
    }
    if (earRight) {
      earRight.style.transform = `rotateY(${15 + rotY * 0.5}deg) translateZ(${-5 + normX * 4}px)`;
    }

    // 3D Ground Shadow Offset
    if (groundShadow) {
      groundShadow.style.transform = `translateX(${-normX * 14}px) translateZ(-20px) scale(${1 - Math.abs(normY) * 0.08})`;
    }

    // Pupil offset inside spherical eye
    const pupilX = normX * maxPupilOffset;
    const pupilY = normY * maxPupilOffset;

    pupils.forEach((p) => {
      p.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
    });
  }

  function updateIdleTracking() {
    lookAt(mouseX, mouseY, 8, 16);
  }

  // Periodic Natural Blinking
  function triggerBlink() {
    if (currentState === 'COVER_PASSWORD' || currentState === 'HAPPY_LOGIN' || isSayingHi) return;

    eyelids.forEach((el) => (el.style.height = '100%'));
    setTimeout(() => {
      if (currentState !== 'COVER_PASSWORD') {
        eyelids.forEach((el) => (el.style.height = '0%'));
      }
    }, 140);
  }

  setInterval(() => {
    if (Math.random() > 0.4) {
      triggerBlink();
    }
  }, 3500);

  // Attach hover & move listeners on robot head/face for "Hi! 👋" reaction
  robotHead.addEventListener('mouseenter', () => {
    triggerSayHi();
  });

  robotHead.addEventListener('mousemove', (e) => {
    e.stopPropagation();
    if (!isSayingHi && (currentState === 'IDLE' || currentState === 'WATCH_EMAIL')) {
      triggerSayHi();
    }
  });

  // Also trigger when entering upper ears & antenna area
  robotStage.addEventListener('mouseenter', (e) => {
    const rect = robotStage.getBoundingClientRect();
    if (e.clientY < rect.top + rect.height * 0.6) {
      if (!isSayingHi && currentState === 'IDLE') {
        triggerSayHi();
      }
    }
  });

  // Public API methods
  return {
    // 1. Idle mode: follow mouse
    setIdle() {
      currentState = 'IDLE';
      isSayingHi = false;
      robotStage.className = 'robot-stage';
      robotHead.classList.remove('watching-email');
      eyelids.forEach((el) => (el.style.height = '0%'));
      updateIdleTracking();
    },

    // 2. Watch email typing
    watchEmail(inputElement) {
      currentState = 'WATCH_EMAIL';
      isSayingHi = false;
      robotStage.className = 'robot-stage';
      robotHead.classList.add('watching-email');
      eyelids.forEach((el) => (el.style.height = '0%'));

      if (!inputElement) return;
      const rect = inputElement.getBoundingClientRect();
      const textLen = inputElement.value.length;
      const scanX = rect.left + Math.min(rect.width * 0.8, 40 + textLen * 9);
      lookAt(scanX, rect.top + 20, 7, 10);
    },

    // 3. Password focused: cover eyes / close visor
    coverEyes() {
      currentState = 'COVER_PASSWORD';
      isSayingHi = false;
      robotStage.className = 'robot-stage covering-eyes';
      robotHead.classList.remove('watching-email');
      eyelids.forEach((el) => (el.style.height = '100%'));
      robotHead.style.transform = 'rotateX(-6deg) rotateY(0deg)';
      pupils.forEach((p) => (p.style.transform = 'translate(0, 0)'));
    },

    // 4. Show password toggle: peek with one eye
    peek() {
      currentState = 'PEEK_PASSWORD';
      isSayingHi = false;
      robotStage.className = 'robot-stage peeking-eyes';
      robotHead.classList.remove('watching-email');
      robotHead.style.transform = 'rotateX(-2deg) rotateY(12deg)';
    },

    // 5. Say Hi directly
    sayHi() {
      triggerSayHi();
    },

    // 6. Successful login celebration
    celebrate() {
      currentState = 'HAPPY_LOGIN';
      isSayingHi = false;
      robotStage.className = 'robot-stage happy-login';
      robotHead.classList.remove('watching-email');
      eyelids.forEach((el) => (el.style.height = '0%'));
    }
  };
})();
