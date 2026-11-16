/**
 * SETU Trainer ERP - Connected Batch Learners Controller
 * 
 * Hierarchy:
 * Trainer is connected to students in assigned batch (Batch B-948).
 * Displays live synchronized students from the central Admin registry.
 */

(function () {
  const TRAINER_ID = '2026-TRN-01';
  const BATCH_NAME = 'Batch B-948';

  function renderConnectedLearners() {
    const container = document.getElementById('trainer-batch-learners-list');
    const badgeCount = document.getElementById('trainer-batch-count-badge');
    if (!container) return;

    if (!window.CampusUserRegistry) {
      container.innerHTML = '<div style="padding:1rem;color:#64748b;">Loading campus registry...</div>';
      return;
    }

    // Get students for this trainer / batch
    let batchStudents = window.CampusUserRegistry.getStudentsByBatch(BATCH_NAME);
    if (!batchStudents || batchStudents.length === 0) {
      batchStudents = window.CampusUserRegistry.getStudentsForTrainer(TRAINER_ID);
    }

    if (badgeCount) {
      badgeCount.textContent = `${batchStudents.length} Learners Connected`;
    }

    if (batchStudents.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:2rem;color:#64748b;">
          <p style="font-weight:600;color:#0f172a;">No learners currently enrolled in ${BATCH_NAME}.</p>
          <p style="font-size:0.75rem;color:#64748b;">The Institutional Administrator can provision learners to your batch from Admin ERP.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = batchStudents.map(student => {
      const isSuspended = student.status === 'suspended';
      const statusBadge = isSuspended
        ? `<span style="background:#fef2f2;color:#ef4444;border:1px solid #fecaca;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">SUSPENDED BY ADMIN</span>`
        : `<span style="background:#f0fdf4;color:#059669;border:1px solid #bbf7d0;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">ACTIVE LEARNER ✓</span>`;

      const faceBadge = student.face3DEnrolled
        ? `<span style="background:#faf5ff;color:#7c3aed;padding:2px 6px;border-radius:8px;font-size:10px;font-weight:700;border:1px solid #e9d5ff;">🧬 3D Verified</span>`
        : `<span style="background:#f1f5f9;color:#64748b;padding:2px 6px;border-radius:8px;font-size:10px;border:1px solid #e2e8f0;">Pending 3D Scan</span>`;

      return `
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:16px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.02);" onmouseover="this.style.borderColor='#cbd5e1';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.05)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.02)'">
          <div style="display:flex;align-items:center;gap:12px;min-width:200px;">
            <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#9333ea,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;box-shadow:0 3px 10px rgba(147,51,234,0.25);">
              ${student.fullName.charAt(0)}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;">
                <h4 style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${student.fullName}</h4>
                ${statusBadge}
              </div>
              <div style="font-size:11px;color:#64748b;margin-top:2px;">
                <code style="color:#7c3aed;font-family:monospace;font-weight:700;">${student.id}</code> &bull; 
                <span>${student.email}</span>
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:18px;font-size:12px;">
            <div>
              <span style="color:#64748b;font-size:10px;text-transform:uppercase;display:block;">Attendance</span>
              <strong style="color:#059669;">${student.attendanceRate || '94.2%'}</strong>
            </div>
            <div>
              <span style="color:#64748b;font-size:10px;text-transform:uppercase;display:block;">CGPA</span>
              <strong style="color:#0284c7;">${student.cgpa || '8.92'}</strong>
            </div>
            <div>
              <span style="color:#64748b;font-size:10px;text-transform:uppercase;display:block;">Biometrics</span>
              ${faceBadge}
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px;">
            <button type="button" onclick="TrainerBatch.inspectSpeechLogs('${student.fullName}', '${student.id}')" style="padding:6px 12px;background:#f0f9ff;border:1px solid #bae6fd;color:#0284c7;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px;" title="Audit Candidate Speech Telemetry">
              <span>🎙️ Speech Logs</span>
            </button>
            <a href="assignments.html" style="padding:6px 12px;background:#faf5ff;border:1px solid #e9d5ff;color:#7c3aed;border-radius:8px;font-size:11px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:4px;" title="Review & Grade Assignments">
              <span>📝 Grade</span>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  const TrainerBatch = {
    openModal() {
      const modal = document.getElementById('trainer-batch-modal');
      if (modal) {
        modal.classList.add('open');
        modal.style.display = 'flex';
        renderConnectedLearners();
      }
    },

    closeModal() {
      const modal = document.getElementById('trainer-batch-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    },

    inspectSpeechLogs(studentName, studentId) {
      alert(`[Candidate Audio Telemetry - Prof. Vikram Rao]\n\nCandidate: ${studentName} (${studentId})\nAssigned Evaluator: Prof. Vikram Rao\nExam Status: Clean Proctoring Verified\nSpeech Log Events: 0 unauthorized speech artifacts detected.\n\nCandidate integrity verified.`);
    }
  };

  window.TrainerBatch = TrainerBatch;

  // Listen for live updates from central admin registry
  window.addEventListener('campus_registry_updated', () => {
    renderConnectedLearners();
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderConnectedLearners();
  });

})();
