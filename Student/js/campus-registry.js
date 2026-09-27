/**
 * SETU AppTechno CampusOS - Central Identity & User Provisioning Registry
 * 
 * Hierarchy:
 * 1. Admin: Master authority. Has access to everything. ONLY Admin can provision/create basic student & trainer accounts.
 * 2. Trainer: Connected to students in their assigned batches. Oversees evaluation, proctoring & attendance.
 * 3. Student: Learner account. CAN ONLY log in if provisioned and approved by Institutional Admin.
 */

(function (window) {
  const REGISTRY_STORAGE_KEY = 'setu_provisioned_accounts_registry';

  // Seed data representing initial institutional state
  const INITIAL_SEED_REGISTRY = {
    version: '2.0',
    institution: 'AppTechno Institute of Technology & Sciences',
    updatedAt: new Date().toISOString(),
    
    // 1. Institutional Administrator (Master Authority)
    admin: {
      id: '2026-ADM',
      fullName: 'System Administrator',
      email: 'admin@campusos.edu',
      role: 'Super Administrator',
      department: 'Institutional Governance & Operations',
      permissions: [
        'all',
        'provision_student_accounts',
        'provision_trainer_accounts',
        'audit_3d_biometrics',
        'configure_geofence_radar',
        'manage_academic_policies'
      ]
    },

    // 2. Faculty Trainers (Connected to Assigned Student Batches)
    trainers: [
      {
        id: '2026-TRN-01',
        fullName: 'Prof. Vikram Rao',
        email: 'vikram.rao@campusos.edu',
        phone: '+91 98765 11223',
        department: 'School of Computer Science & Engineering',
        specialization: 'System Architecture & Algorithms',
        assignedBatches: ['Batch B-948 (2022 - 2026)', 'Batch B-952 (2023 - 2027)'],
        status: 'active',
        joinedDate: '2023-07-15',
        createdBy: 'Institutional Admin'
      },
      {
        id: '2026-TRN-02',
        fullName: 'Dr. Ananya Sen',
        email: 'ananya.s@campusos.edu',
        phone: '+91 98765 22334',
        department: 'Department of Artificial Intelligence & Data Science',
        specialization: 'Neural Networks & Deep Learning',
        assignedBatches: ['Batch B-950 (AI & ML)'],
        status: 'active',
        joinedDate: '2024-01-10',
        createdBy: 'Institutional Admin'
      }
    ],

    // 3. Students (Must be provisioned by Admin to access account)
    students: [
      {
        id: '2026-STU',
        fullName: 'Shashaank Sajjanar',
        email: 'shashaank.s@campusos.edu',
        phone: '+91 98765 43210',
        dob: '2003-08-14',
        gender: 'Male',
        department: 'School of Computer Science & Engineering',
        program: 'B.Tech in Computer Science',
        semester: '6th Semester B.Tech',
        batch: 'Batch B-948 (2022 - 2026)',
        assignedTrainerId: '2026-TRN-01',
        assignedTrainerName: 'Prof. Vikram Rao',
        status: 'active', // 'active' | 'suspended' | 'pending'
        attendanceRate: '94.2%',
        cgpa: '8.92',
        face3DEnrolled: true,
        enrolledCourses: [
          'DS302: Data Structures & Algorithms',
          'CS401: System Architecture & Distributed Systems',
          'OS201: Operating Systems & Kernel Design',
          'CL303: Cloud Computing & Kubernetes'
        ],
        adminNotes: 'Primary enrolled learner. Biometric face mesh verified.',
        createdAt: '2026-01-10T10:00:00Z',
        createdBy: 'Institutional Admin (Master Governance)'
      },
      {
        id: '2026-STU-02',
        fullName: 'Aditi Sharma',
        email: 'aditi.s@campusos.edu',
        phone: '+91 98765 54321',
        dob: '2003-11-22',
        gender: 'Female',
        department: 'School of Computer Science & Engineering',
        program: 'B.Tech in Computer Science',
        semester: '6th Semester B.Tech',
        batch: 'Batch B-948 (2022 - 2026)',
        assignedTrainerId: '2026-TRN-01',
        assignedTrainerName: 'Prof. Vikram Rao',
        status: 'active',
        attendanceRate: '91.8%',
        cgpa: '9.15',
        face3DEnrolled: true,
        enrolledCourses: [
          'DS302: Data Structures & Algorithms',
          'CS401: System Architecture & Distributed Systems',
          'AI305: Machine Learning Foundations'
        ],
        adminNotes: 'Top 5% batch standing. Authorized by Academic Dean.',
        createdAt: '2026-01-12T11:30:00Z',
        createdBy: 'Institutional Admin (Master Governance)'
      },
      {
        id: '2026-STU-03',
        fullName: 'Rohan Verma',
        email: 'rohan.v@campusos.edu',
        phone: '+91 98765 67890',
        dob: '2004-02-05',
        gender: 'Male',
        department: 'School of Computer Science & Engineering',
        program: 'B.Tech in Computer Science',
        semester: '6th Semester B.Tech',
        batch: 'Batch B-948 (2022 - 2026)',
        assignedTrainerId: '2026-TRN-01',
        assignedTrainerName: 'Prof. Vikram Rao',
        status: 'active',
        attendanceRate: '88.5%',
        cgpa: '8.40',
        face3DEnrolled: false,
        enrolledCourses: [
          'DS302: Data Structures & Algorithms',
          'OS201: Operating Systems & Kernel Design'
        ],
        adminNotes: 'Standard enrollment. 3D Face enroll pending.',
        createdAt: '2026-02-01T09:15:00Z',
        createdBy: 'Institutional Admin (Master Governance)'
      }
    ]
  };

  const CampusUserRegistry = {
    // 1. Load or Initialize Registry from localStorage
    getRegistry() {
      try {
        const raw = localStorage.getItem(REGISTRY_STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (e) {
        console.error('CampusUserRegistry load error:', e);
      }
      // Initialize with seed
      this.saveRegistry(INITIAL_SEED_REGISTRY);
      return INITIAL_SEED_REGISTRY;
    },

    saveRegistry(data) {
      try {
        data.updatedAt = new Date().toISOString();
        localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(data));
        // Dispatch custom storage event for live reactive syncing across open tabs
        window.dispatchEvent(new CustomEvent('campus_registry_updated', { detail: data }));
        return true;
      } catch (e) {
        console.error('CampusUserRegistry save error:', e);
        return false;
      }
    },

    // 2. Student Query APIs
    getStudents() {
      const reg = this.getRegistry();
      return reg.students || [];
    },

    getStudentById(id) {
      const students = this.getStudents();
      return students.find(s => s.id.toLowerCase() === id.toLowerCase().trim());
    },

    getStudentByEmail(email) {
      const students = this.getStudents();
      return students.find(s => s.email.toLowerCase() === email.toLowerCase().trim());
    },

    findStudent(identifier) {
      if (!identifier) return null;
      const clean = identifier.toLowerCase().trim();
      const students = this.getStudents();
      return students.find(s => s.email.toLowerCase() === clean || s.id.toLowerCase() === clean);
    },

    getStudentsByTrainer(trainerId) {
      const students = this.getStudents();
      return students.filter(s => s.assignedTrainerId === trainerId);
    },

    getStudentsByBatch(batchName) {
      const students = this.getStudents();
      return students.filter(s => s.batch.toLowerCase().includes(batchName.toLowerCase()));
    },

    // 3. Trainer Query APIs
    getTrainers() {
      const reg = this.getRegistry();
      return reg.trainers || [];
    },

    getTrainerById(id) {
      const trainers = this.getTrainers();
      return trainers.find(t => t.id.toLowerCase() === id.toLowerCase().trim());
    },

    getTrainerByEmail(email) {
      const trainers = this.getTrainers();
      return trainers.find(t => t.email.toLowerCase() === email.toLowerCase().trim());
    },

    findTrainer(identifier) {
      if (!identifier) return null;
      const clean = identifier.toLowerCase().trim();
      const trainers = this.getTrainers();
      return trainers.find(t => t.email.toLowerCase() === clean || t.id.toLowerCase() === clean);
    },

    // 4. Admin Management: ONLY Admin Can Provision Student Accounts
    provisionStudent(studentData) {
      const reg = this.getRegistry();
      const email = (studentData.email || '').trim().toLowerCase();
      const id = (studentData.id || '').trim();

      if (!email || !studentData.fullName) {
        return { success: false, message: 'Full name and email are strictly required to provision a student.' };
      }

      // Check for duplicate email or ID
      if (reg.students.some(s => s.email.toLowerCase() === email)) {
        return { success: false, message: `An account with email "${email}" is already provisioned in the registry.` };
      }
      if (id && reg.students.some(s => s.id.toLowerCase() === id.toLowerCase())) {
        return { success: false, message: `Student ID "${id}" is already registered. IDs must be unique.` };
      }

      // Generate ID if missing
      const newId = id || `2026-STU-${String(reg.students.length + 1).padStart(2, '0')}`;

      // Associate with trainer
      let assignedTrainerName = studentData.assignedTrainerName || 'Prof. Vikram Rao';
      let assignedTrainerId = studentData.assignedTrainerId || '2026-TRN-01';

      if (studentData.assignedTrainerId) {
        const foundTrainer = this.getTrainerById(studentData.assignedTrainerId);
        if (foundTrainer) {
          assignedTrainerName = foundTrainer.fullName;
          assignedTrainerId = foundTrainer.id;
        }
      }

      const newStudent = {
        id: newId,
        fullName: studentData.fullName.trim(),
        email: email,
        phone: studentData.phone || '+91 98765 00000',
        dob: studentData.dob || '2003-01-01',
        gender: studentData.gender || 'Not Specified',
        department: studentData.department || 'School of Computer Science & Engineering',
        program: studentData.program || 'B.Tech in Computer Science',
        semester: studentData.semester || '6th Semester B.Tech',
        batch: studentData.batch || 'Batch B-948 (2022 - 2026)',
        assignedTrainerId: assignedTrainerId,
        assignedTrainerName: assignedTrainerName,
        status: studentData.status || 'active', // active, pending, suspended
        attendanceRate: studentData.attendanceRate || '100.0% (New)',
        cgpa: studentData.cgpa || '8.50',
        face3DEnrolled: Boolean(studentData.face3DEnrolled),
        enrolledCourses: studentData.enrolledCourses || [
          'DS302: Data Structures & Algorithms',
          'CS401: System Architecture & Distributed Systems'
        ],
        adminNotes: studentData.adminNotes || 'Provisioned directly by Institutional Administrator.',
        createdAt: new Date().toISOString(),
        createdBy: 'Institutional Administrator (Admin ERP)'
      };

      reg.students.push(newStudent);
      this.saveRegistry(reg);

      return { success: true, student: newStudent, message: `Student ${newStudent.fullName} (${newStudent.id}) successfully provisioned and authorized!` };
    },

    updateStudent(studentId, updateFields) {
      const reg = this.getRegistry();
      const idx = reg.students.findIndex(s => s.id.toLowerCase() === studentId.toLowerCase().trim());
      if (idx === -1) {
        return { success: false, message: `Student ID "${studentId}" not found.` };
      }

      reg.students[idx] = {
        ...reg.students[idx],
        ...updateFields,
        updatedAt: new Date().toISOString(),
        lastModifiedBy: 'Institutional Administrator'
      };

      this.saveRegistry(reg);
      return { success: true, student: reg.students[idx] };
    },

    toggleStudentStatus(studentId, targetStatus) {
      const student = this.getStudentById(studentId);
      if (!student) return { success: false, message: 'Student not found.' };

      let nextStatus = targetStatus;
      if (!nextStatus) {
        nextStatus = student.status === 'active' ? 'suspended' : 'active';
      }

      return this.updateStudent(studentId, { status: nextStatus });
    },

    deleteStudent(studentId) {
      const reg = this.getRegistry();
      const initLen = reg.students.length;
      reg.students = reg.students.filter(s => s.id.toLowerCase() !== studentId.toLowerCase().trim());

      if (reg.students.length === initLen) {
        return { success: false, message: `Student ID "${studentId}" not found.` };
      }

      this.saveRegistry(reg);
      return { success: true, message: `Student account ${studentId} removed from institutional registry.` };
    },

    // 5. Admin Management: Provision Trainer Accounts
    provisionTrainer(trainerData) {
      const reg = this.getRegistry();
      const email = (trainerData.email || '').trim().toLowerCase();
      const id = (trainerData.id || '').trim();

      if (!email || !trainerData.fullName) {
        return { success: false, message: 'Trainer name and email are required.' };
      }

      if (reg.trainers.some(t => t.email.toLowerCase() === email)) {
        return { success: false, message: `Trainer email "${email}" already registered.` };
      }

      const newId = id || `2026-TRN-${String(reg.trainers.length + 1).padStart(2, '0')}`;
      const newTrainer = {
        id: newId,
        fullName: trainerData.fullName.trim(),
        email: email,
        phone: trainerData.phone || '+91 98765 00000',
        department: trainerData.department || 'Department of Computer Science & Engineering',
        specialization: trainerData.specialization || 'Instructional Faculty',
        assignedBatches: trainerData.assignedBatches || ['Batch B-948 (2022 - 2026)'],
        status: trainerData.status || 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        createdBy: 'Institutional Administrator (Admin ERP)'
      };

      reg.trainers.push(newTrainer);
      this.saveRegistry(reg);

      return { success: true, trainer: newTrainer, message: `Trainer ${newTrainer.fullName} (${newTrainer.id}) provisioned successfully!` };
    },

    // 6. Strict Student Authentication Guard
    // "the basic profile creating access also needs to be done from admin only ..... then only student can access the account."
    authenticateStudent(identifier) {
      if (!identifier) {
        return {
          allowed: false,
          reason: 'empty_credentials',
          message: 'Please enter your institution email or student ID.'
        };
      }

      const student = this.findStudent(identifier);

      // Rule: Account must exist in admin registry
      if (!student) {
        return {
          allowed: false,
          reason: 'not_provisioned',
          message: `Access Denied: Account "${identifier}" is NOT provisioned by the Institutional Administrator. Students cannot self-register. Please contact the Admin Office to create your profile.`
        };
      }

      // Rule: Account status check
      if (student.status === 'suspended') {
        return {
          allowed: false,
          reason: 'suspended',
          message: `Access Restricted: Student account for ${student.fullName} (${student.id}) has been temporarily suspended by Institutional Governance. Contact admin@campusos.edu.`
        };
      }

      if (student.status === 'pending') {
        return {
          allowed: false,
          reason: 'pending_approval',
          message: `Account Pending: Your student profile has been created but is awaiting final Administrator activation. Please check back shortly.`
        };
      }

      // Valid and active!
      return {
        allowed: true,
        student: student,
        message: `Welcome, ${student.fullName}! Admin authorization verified.`
      };
    },

    // 7. Reset Registry to Defaults
    resetRegistryToDefaults() {
      this.saveRegistry(INITIAL_SEED_REGISTRY);
      return INITIAL_SEED_REGISTRY;
    }
  };

  // Auto-initialize on script load
  CampusUserRegistry.getRegistry();

  // Export to window
  window.CampusUserRegistry = CampusUserRegistry;

})(window);
