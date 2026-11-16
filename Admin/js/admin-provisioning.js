/**
 * SETU Admin ERP - Student & Trainer Account Provisioning Console
 * 
 * Provides Institutional Administrators with master authority to:
 * - Provision new student accounts (mandatory requirement before student can log in)
 * - Assign students to batches and faculty trainers
 * - Activate, suspend, or revoke student profiles
 * - Provision and configure faculty trainers
 */

(function () {
  // Ensure CampusUserRegistry is available
  if (!window.CampusUserRegistry) {
    console.error('CampusUserRegistry not loaded.');
    return;
  }

  function renderStudentTable(filterText = '', batchFilter = 'all', statusFilter = 'all') {
    const tableBody = document.getElementById('admin-student-table-body');
    const countBadge = document.getElementById('admin-student-total-count');
    if (!tableBody) return;

    let students = window.CampusUserRegistry.getStudents();
    if (countBadge) countBadge.textContent = `${students.length} Accounts`;
    const navBadge = document.getElementById('nav-students-count');
    if (navBadge) navBadge.textContent = students.length;

    // Apply filters
    if (filterText) {
      const q = filterText.toLowerCase().trim();
      students = students.filter(s => 
        s.fullName.toLowerCase().includes(q) || 
        s.email.toLowerCase().includes(q) || 
        s.id.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q)
      );
    }

    if (batchFilter !== 'all') {
      students = students.filter(s => s.batch.toLowerCase().includes(batchFilter.toLowerCase()));
    }

    if (statusFilter !== 'all') {
      students = students.filter(s => s.status === statusFilter);
    }

    if (students.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:2.5rem;color:#64748b;">
            <div style="font-size:2rem;margin-bottom:0.5rem;">🔍</div>
            <p style="font-size:0.9rem;font-weight:600;color:#0f172a;">No provisioned students match your search.</p>
            <p style="font-size:0.75rem;color:#64748b;">Click "➕ Provision New Student" to authorize a learner profile.</p>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = students.map(s => {
      const isSuspended = s.status === 'suspended';
      const isPending = s.status === 'pending';
      const statusBadge = isSuspended 
        ? `<span class="badge-status-suspended" style="background:#fef2f2;color:#ef4444;border:1px solid #fecaca;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">SUSPENDED</span>`
        : isPending 
        ? `<span class="badge-status-pending" style="background:#fffbeb;color:#d97706;border:1px solid #fde68a;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">PENDING APPROVAL</span>`
        : `<span class="badge-status-active" style="background:#f0fdf4;color:#059669;border:1px solid #bbf7d0;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">ACTIVE ✓</span>`;

      const faceBadge = s.face3DEnrolled
        ? `<span style="background:#faf5ff;color:#7c3aed;padding:2px 6px;border-radius:8px;font-size:10px;font-weight:700;border:1px solid #e9d5ff;">🧬 3D Enrolled</span>`
        : `<span style="background:#f1f5f9;color:#64748b;padding:2px 6px;border-radius:8px;font-size:10px;font-weight:600;border:1px solid #e2e8f0;">Not Enrolled</span>`;

      return `
        <tr style="border-bottom:1px solid #f1f5f9;transition:background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
          <td style="padding:12px 14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;box-shadow:0 2px 6px rgba(2,132,199,0.25);">
                ${s.fullName.charAt(0)}
              </div>
              <div>
                <div style="font-weight:700;color:#0f172a;font-size:13px;">${s.fullName}</div>
                <div style="font-size:10px;color:#0284c7;font-family:monospace;font-weight:700;">ID: ${s.id}</div>
              </div>
            </div>
          </td>
          <td style="padding:12px 14px;">
            <div style="font-size:12px;color:#334155;font-weight:500;">${s.email}</div>
            <div style="font-size:10px;color:#64748b;">${s.department}</div>
          </td>
          <td style="padding:12px 14px;">
            <div style="font-size:11px;font-weight:600;color:#0f172a;">${s.batch}</div>
            <div style="font-size:10px;color:#64748b;">${s.program}</div>
          </td>
          <td style="padding:12px 14px;">
            <div style="font-size:11px;font-weight:700;color:#7c3aed;">${s.assignedTrainerName || 'Prof. Vikram Rao'}</div>
            <div style="font-size:10px;color:#64748b;">Faculty Evaluator</div>
          </td>
          <td style="padding:12px 14px;text-align:center;">
            ${statusBadge}
          </td>
          <td style="padding:12px 14px;text-align:center;">
            ${faceBadge}
          </td>
          <td style="padding:12px 14px;text-align:right;">
            <div style="display:inline-flex;align-items:center;gap:6px;">
              <button type="button" onclick="AdminProvisioning.toggleStatus('${s.id}')" style="padding:4px 8px;border-radius:8px;font-size:10px;font-weight:700;background:#f0f9ff;color:#0284c7;border:1px solid #bae6fd;cursor:pointer;transition:all 0.2s;" title="Toggle Student Active/Suspended State">
                ${isSuspended ? 'Reactivate' : 'Suspend'}
              </button>
              <button type="button" onclick="AdminProvisioning.deleteStudent('${s.id}')" style="padding:4px 8px;border-radius:8px;font-size:10px;font-weight:700;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;cursor:pointer;transition:all 0.2s;" title="Delete Provisioned Account">
                Revoke
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderTrainerTable() {
    const tableBody = document.getElementById('admin-trainer-table-body');
    const countBadge = document.getElementById('admin-trainer-total-count');
    if (!tableBody) return;

    const trainers = window.CampusUserRegistry.getTrainers();
    if (countBadge) countBadge.textContent = `${trainers.length} Faculty`;

    tableBody.innerHTML = trainers.map(t => {
      const batchesList = (t.assignedBatches || []).map(b => 
        `<span style="background:#faf5ff;color:#7c3aed;padding:2px 6px;border-radius:6px;font-size:10px;margin-right:4px;display:inline-block;margin-top:2px;border:1px solid #e9d5ff;">${b}</span>`
      ).join('');

      return `
        <tr style="border-bottom:1px solid #f1f5f9;transition:background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
          <td style="padding:12px 14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#9333ea,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;">
                ${t.fullName.charAt(0)}
              </div>
              <div>
                <div style="font-weight:700;color:#0f172a;font-size:13px;">${t.fullName}</div>
                <div style="font-size:10px;color:#7c3aed;font-family:monospace;font-weight:700;">ID: ${t.id}</div>
              </div>
            </div>
          </td>
          <td style="padding:12px 14px;">
            <div style="font-size:12px;color:#334155;">${t.email}</div>
            <div style="font-size:10px;color:#64748b;">${t.phone || '+91 98765 00000'}</div>
          </td>
          <td style="padding:12px 14px;">
            <div style="font-size:11px;font-weight:600;color:#0f172a;">${t.department}</div>
            <div style="font-size:10px;color:#7c3aed;">${t.specialization}</div>
          </td>
          <td style="padding:12px 14px;">
            ${batchesList}
          </td>
          <td style="padding:12px 14px;text-align:center;">
            <span style="background:#f0fdf4;color:#059669;border:1px solid #bbf7d0;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">ACTIVE ✓</span>
          </td>
        </tr>
      `;
    }).join('');
  }

  const AdminProvisioning = {
    openModal() {
      const modal = document.getElementById('user-registry-modal');
      if (modal) {
        modal.classList.add('open');
        modal.style.display = 'flex';
        this.switchTab('students');
        renderStudentTable();
        renderTrainerTable();
      }
    },

    closeModal() {
      const modal = document.getElementById('user-registry-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    },

    switchTab(tabId) {
      document.querySelectorAll('.registry-tab-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.registry-tab-btn').forEach(b => {
        b.classList.remove('active');
        b.style.color = '#64748b';
        b.style.borderBottom = '2px solid transparent';
      });

      const activeSection = document.getElementById(`tab-content-${tabId}`);
      const activeBtn = document.getElementById(`tab-btn-${tabId}`);

      if (activeSection) activeSection.style.display = 'block';
      if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.color = '#0284c7';
        activeBtn.style.borderBottom = '2px solid #0284c7';
      }
    },

    toggleNewStudentForm() {
      const formBox = document.getElementById('new-student-form-card');
      if (formBox) {
        const isHidden = formBox.style.display === 'none' || !formBox.style.display;
        formBox.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
          // Pre-populate auto-generated next ID
          const students = window.CampusUserRegistry.getStudents();
          const nextIdInput = document.getElementById('prov-student-id');
          if (nextIdInput && !nextIdInput.value) {
            nextIdInput.value = `2026-STU-${String(students.length + 1).padStart(2, '0')}`;
          }
        }
      }
    },

    handleProvisionSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('prov-student-name').value.trim();
      const id = document.getElementById('prov-student-id').value.trim();
      const email = document.getElementById('prov-student-email').value.trim();
      const batch = document.getElementById('prov-student-batch').value;
      const dept = document.getElementById('prov-student-dept').value;
      const trainerSelect = document.getElementById('prov-student-trainer');
      const trainerId = trainerSelect ? trainerSelect.value : '2026-TRN-01';
      const trainerName = trainerSelect ? trainerSelect.options[trainerSelect.selectedIndex].text : 'Prof. Vikram Rao';
      const status = document.getElementById('prov-student-status').value;

      if (!name || !email) {
        alert('Please provide student full name and email address.');
        return;
      }

      const res = window.CampusUserRegistry.provisionStudent({
        id: id,
        fullName: name,
        email: email,
        batch: batch,
        department: dept,
        assignedTrainerId: trainerId,
        assignedTrainerName: trainerName,
        status: status
      });

      if (!res.success) {
        alert(`Provisioning Failed: ${res.message}`);
        return;
      }

      // Reset form
      document.getElementById('provision-student-form').reset();
      this.toggleNewStudentForm();
      renderStudentTable();

      // Show toast
      if (window.showToast) {
        window.showToast(res.message, 'success');
      } else {
        alert(res.message);
      }
    },

    toggleStatus(studentId) {
      const res = window.CampusUserRegistry.toggleStudentStatus(studentId);
      if (res.success) {
        renderStudentTable();
      }
    },

    deleteStudent(studentId) {
      if (confirm(`Are you sure you want to revoke and delete student account ${studentId}? They will no longer be able to log in.`)) {
        const res = window.CampusUserRegistry.deleteStudent(studentId);
        if (res.success) {
          renderStudentTable();
        }
      }
    },

    handleSearch() {
      const q = document.getElementById('admin-student-search')?.value || '';
      const b = document.getElementById('admin-student-batch-filter')?.value || 'all';
      const s = document.getElementById('admin-student-status-filter')?.value || 'all';
      renderStudentTable(q, b, s);
    }
  };

  window.AdminProvisioning = AdminProvisioning;

  // Listen for registry updates from other tabs
  window.addEventListener('campus_registry_updated', () => {
    renderStudentTable();
    renderTrainerTable();
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderStudentTable();
    renderTrainerTable();
  });

})();
