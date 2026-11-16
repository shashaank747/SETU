# 🎓 SETU — AppTechno CampusOS
### *Smarter Campuses, Brighter Futures &bull; 100% Student-Built Institute ERP & LMS*

[![Status](https://img.shields.io/badge/Status-Active%20Production-00d2ff?style=for-the-badge)](https://github.com/shashaank747)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA%20Ready-6366f1?style=for-the-badge)](https://github.com/shashaank747)
[![Tech](https://img.shields.io/badge/Stack-HTML5%20%7C%20Vanilla%20CSS3%20%7C%20ES6%2B%20JS-10b981?style=for-the-badge)](https://github.com/shashaank747)
[![Styling](https://img.shields.io/badge/UI-Custom%20Glassmorphism%20%2B%20Tailwind%20CSS-f59e0b?style=for-the-badge)](https://github.com/shashaank747)

---

## 📌 Table of Contents
- [About the Project](#-about-the-project)
- [Key Highlights & Visual Wow Factors](#-key-highlights--visual-wow-factors)
- [Application Pages & Modules](#-application-pages--modules)
  - [1. Landing Portal (`index.html`)](#1-landing-portal-indexhtml)
  - [2. Interactive Cyber Mascot Login (`login.html`)](#2-interactive-cyber-mascot-login-loginhtml)
  - [3. Modern Campus ERP Dashboard (`dashboard.html`)](#3-modern-campus-erp-dashboard-dashboardhtml)
  - [4. Classroom & Class Recordings Hub (`Class_recordings.html`)](#4-classroom--class-recordings-hub-class_recordingshtml)
  - [5. Contributors & Alumni Wall (`contributors.html`)](#5-contributors--alumni-wall-contributorshtml)
  - [6. ZUNO AI Campus Assistant (`cyberbot.js`)](#6-zuno-ai-campus-assistant-cyberbotjs)
- [Project Architecture & File Tree](#-project-architecture--file-tree)
- [Technology Stack](#-technology-stack)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Keyboard Shortcuts & Interactivity](#-keyboard-shortcuts--interactivity)
- [Comprehensive Technical Report](#-comprehensive-technical-report)
- [Author & Acknowledgements](#-author--acknowledgements)

---

## 🌟 About the Project

**SETU (AppTechno CampusOS)** is an AI-powered, student-built next-generation Campus Enterprise Resource Planning (ERP) and Learning Management System (LMS). Built to empower 700+ learners and educational institutions across India, SETU replaces clunky, obsolete administrative portals with a sleek, ultra-responsive, cyber-themed interface.

From geofenced biometric punch-in attendance tracking and high-definition classroom recordings to an interactive 3D robot mascot and intelligent AI campus assistant, SETU bridges the gap between academic administration and modern digital student life.

---

## ⚡ Key Highlights & Visual Wow Factors

- 🤖 **Interactive 3D Mascot ("ZUNO")**:
  - Live cursor & mouse tracking utilizing trigonometry and dynamic inverse CSS transforms.
  - Interactive form reaction: ZUNO watches intently as you type your email, blinks naturally, and physically raises metallic robotic gauntlets to **cover its eyes** when entering confidential passwords (peeking when you toggle visibility!).
- 🌐 **Cyber Matrix Rain Visual FX**:
  - Pure HTML5 Canvas-based matrix rain with cascading alpha-channel phosphor glow on authentication screens.
- 📍 **Campus Radar Geofence**:
  - Real-time perimeter check simulator (verifying range within 14m perimeter).
  - Live elapsed session stopwatch, timestamped check-in logging, and QR terminal scanner dialog.
- 📊 **Precision Attendance Radial Gauge**:
  - SVG-based circular progress dial with glowing gradients, calculating prime attendance milestones (94% Prime Status).
- 🧠 **Omnipresent ZUNO AI CyberBot**:
  - Triggered globally via floating mascot dock or universal hotkey (`Ctrl + K`).
  - Capable of answering campus queries, filtering subjects, triggering punch check-ins, and direct page routing.

---

## 📱 Application Pages & Modules

### 1. Landing Portal (`index.html`)
The public-facing gateway to SETU:
- **Live Announcement Header**: Displays real-time learner counters, direct helpline, and social links.
- **Glassmorphic Navigation Bar**: Quick anchors to features, live curriculum, contributors, and authentication.
- **Hero Showcase**: Dynamic gradient typography, interactive CTA buttons, and feature highlight badges.
- **Interactive Metric Counters**: Animated student enrollment numbers, course completions, and partner colleges.
- **Role-Based Solution Deck**: Tailored views for Students, Faculty, Mentors, and Administrators.
- **Transparent Pricing & Plans**: Tiered academic packages with interactive feature checklists.
- **Testimonials Carousel**: Feedback from verified students and institutional directors.

### 2. Interactive Cyber Mascot Login (`login.html`)
A secure, playful authentication gateway:
- **3D Robot Mascot Assembly**: Features antenna plasma core, illuminated ears, dual glowing eyes, and knuckle gauntlets.
- **Eye-Tracking & Password Masking**:
  - Focus email: Robot tracks input field coordinates.
  - Focus password: Robot hands smoothly animate upward to conceal eyes.
  - Toggle reveal password: Hands shift slightly to "peek" through fingers.
- **Session Persistence**: Remembers active session and user preferences in browser `localStorage`.
- **Role Switching**: Allows instant switching between *Student*, *Trainer*, and *Admin* profiles.

### 3. Modern Campus ERP Dashboard (`dashboard.html`)
The daily command center for students and faculties:
- **Campus Radar Panel**:
  - **Action Button**: Toggle Punch-In / Punch-Out with instant status badge updates.
  - **Session Elapsed Timer**: Live digital clock ticking every second since user check-in.
  - **Attendance Index Gauge**: Visual radial meter showing 94% prime status with 47 present / 3 absent days breakdown.
- **Mega-Menu Dropdowns**:
  - **Academics Mega Card**: 8 comprehensive modules (*My Courses, Timetable, Subjects, Assignments, Class Recordings, Study Materials, Trainer Notes, Classroom*).
  - **Practice**: AI Monaco Code Lab, Mock Interview Rooms, Daily Coding Challenges.
  - **Career**: Campus Placement Drives, AI Resume Builder, DigiLocker Credentials.
  - **Community**: Contributors & Alumni Wall, Discussion Forums, Hackathons.
  - **Support**: 24/7 Help Desk, Docs, WhatsApp Support link.
- **Terminal QR Scanner Modal**: Simulated laser-scanning optical viewfinder with campus gate detection (`BLR-GATE-04B`).
- **Notification Dropdown**: Real-time campus alerts with unread counter badges and "Mark all as read" capability.

### 4. Classroom & Class Recordings Hub (`Class_recordings.html`)
A centralized academic video archive built with Tailwind CSS & custom styling:
- **Watch Progress Overview**: Donut progress ring tracking completed vs in-progress lectures.
- **Multi-Factor Filter Bar**: Instant filtering by Batches, Subjects, Trainers, and custom Date Ranges (`From` / `To`).
- **All Recordings Matrix**:
  - Timestamped video cards with instructor badges, date, duration, and subject tags (Excel, Python, System Architecture, etc.).
  - Quick-action buttons: Bookmarks, Watch Status, and "Watch Now" action.
- **Video Player Modal**: High-performance playback window with resolution and speed controls.

### 5. Contributors & Alumni Wall (`contributors.html`)
Honoring the talent behind the platform:
- **Hall of Fame**: Student developers, UI/UX designers, trainers, and project mentors.
- **Social Connect**: Clickable GitHub, LinkedIn, and portfolio links for every contributor.
- **Contribution Badges**: Code committers, architecture leads, and core maintainers.

### 6. ZUNO AI Campus Assistant (`cyberbot.js`)
An intelligent campus assistant docked at the bottom right:
- Instant sliding drawer UI with conversation history.
- Pre-built smart prompt chips: *"Check my attendance"*, *"Next lecture?"*, *"Open Class Recordings"*, *"Punch Out"*.
- Natural language intent parsing with direct actions on the dashboard.

---

## 🏗 Project Architecture & File Tree

```text
SETU/
├── 📄 index.html                     # Main landing page & public portal
├── 📄 login.html                     # Cyber-themed login with interactive 3D robot mascot
├── 📄 dashboard.html                 # Comprehensive student/faculty ERP command center
├── 📄 Class_recordings.html          # Academic lecture hub & video archive
├── 📄 contributors.html              # Student-built contributors & alumni wall
├── 📄 README.md                      # Project documentation & GitHub overview (this file)
├── 📄 APP_REPORT.md                  # Complete deep-dive technical & architectural report
├── 📄 .gitignore                     # Git ignore rules for OS & temp files
│
├── 📁 css/
│   ├── 🎨 style.css                  # Global variables, typography, reset & base tokens
│   ├── 🎨 landing.css                # Hero, testimonials, stats, and landing animations
│   ├── 🎨 login.css                  # Glassmorphism, matrix overlay & login styling
│   ├── 🎨 dashboard.css              # Dashboard layout, campus radar, mega-menu & gauges
│   ├── 🎨 robot.css                  # 3D robot mascot geometry, keyframes & animations
│   └── 🎨 contributors.css           # Grid layouts & contributor cards styling
│
├── 📁 js/
│   ├── 📜 app.js                     # Landing interactions, carousels, toasts & counters
│   ├── 📜 login.js                   # Form validation, credentials check & robot integration
│   ├── 📜 robot.js                   # 3D Inverse Kinematics, cursor tracking & eye covers
│   ├── 📜 matrix.js                  # HTML5 Canvas digital rain phosphor rendering
│   ├── 📜 dashboard-nav.js           # Mega-menus, shortcuts, notifications & timer logic
│   ├── 📜 cyberbot.js                # ZUNO AI assistant chatbot engine & campus commands
│   └── 📜 contributors.js           # Filtering & interactive cards for contributors
│
└── 📁 images/ / root assets
    ├── 🖼 setu.png                   # Official SETU brand emblem
    ├── 🖼 setu_app_logo.png          # App icon variation
    ├── 🖼 apptechno-campusos-footer.png # Official brand footer seal
    ├── 🖼 contri.png                 # Contributors page hero graphic
    └── 🖼 images/user-shashaank.png  # User profile avatar
```

---

## 💻 Technology Stack

| Layer | Technologies Used |
|---|---|
| **Structure** | Semantic HTML5, SVG Vectors |
| **Styling** | Vanilla CSS3 (Custom Properties, Flexbox, CSS Grid, 3D Transforms), Tailwind CSS CDN |
| **Interactivity** | Vanilla JavaScript (ES6+), HTML5 Canvas API |
| **Storage & State** | Browser `localStorage`, URLSearchParams |
| **Fonts & Icons** | Plus Jakarta Sans, Inter, Custom SVG Vector Icons |

---

## 🚀 Getting Started & Local Setup

No heavy bundlers or package installs required! SETU runs directly in any modern web browser.

### Option 1: Using VS Code Live Server (Recommended)
1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/shashaank747/SETU.git
   ```
2. Open the folder in **Visual Studio Code**:
   ```bash
   code .
   ```
3. Install the **Live Server** extension (by Ritwick Dey).
4. Right-click on `index.html` and select **"Open with Live Server"**.
5. Your browser will launch the app at `http://127.0.0.1:5500/index.html`.

### Option 2: Direct File Launch
Simply double-click `index.html` or `login.html` in your file explorer to run locally in Chrome, Edge, Brave, Firefox, or Safari.

---

## ⌨️ Keyboard Shortcuts & Interactivity

| Shortcut | Action | Scope |
|---|---|---|
| <kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>Cmd</kbd> + <kbd>K</kbd> | Open ZUNO AI Assistant Drawer | Dashboard & Class Recordings |
| <kbd>Esc</kbd> | Close any open Mega-Menu, QR Scanner, or ZUNO AI Drawer | All Pages |
| **Click Avatar** | Open profile actions & role sign-out | Dashboard |
| **Click Bell** | Toggle Campus Alerts & Notifications | Dashboard |

---

## 📖 Comprehensive Technical Report

For a complete breakdown of every algorithm, state flow, mathematics behind the 3D mascot, attendance gauge calculations, and security considerations, read the companion document:
👉 **[Read the Full App Architecture Report (APP_REPORT.md)](./APP_REPORT.md)**

---

## 👨‍💻 Author & Acknowledgements

- **Lead Architect & Developer**: **Shashaank Sajjanar** ([@shashaank747](https://github.com/shashaank747))
- **Platform**: AppTechno CampusOS / SETU
- **Mission**: Designed and developed 100% by students to redefine educational management systems across campuses.

---
*Crafted with passion, modern web standards, and cyber aesthetics for higher education.*
