import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogout from '../components/AdminLogout';
import API_URL from '../config/api';

const GYM_BRANCHES = [
  { _id: 'Kalyanpur', name: 'Kalyanpur' },
  { _id: 'Gopalpur', name: 'Gopalpur' },
];

const DEFAULT_PERMISSIONS = {
  members: { view: true, add: true, edit: true, delete: false },
  payments: { view: true, add: true, edit: true, delete: false },
  attendance: { view: true, add: true, edit: true, delete: false },
  workouts: { view: true, add: true, edit: true, delete: false },
  enquiries: { view: true, delete: false },
  offers: { view: true, add: true, edit: true, delete: false },
  accessPasses: { view: true, add: true, edit: true, delete: false },
  trainers: { view: true, add: true, edit: true, delete: false },
  staff: { view: true, add: true, edit: true, delete: false },
};

const normalizeBranch = (value) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  let rawValue = value;

  if (typeof value === 'object') {
    rawValue =
      value.name ||
      value.branchName ||
      value.gymBranch ||
      value._id ||
      '';
  }

  const normalized = String(rawValue).trim().toLowerCase();

  if (normalized === 'kalyanpur') return 'Kalyanpur';
  if (normalized === 'gopalpur') return 'Gopalpur';

  return String(rawValue).trim();
};

const getBranchLabel = (value) => {
  const branch = normalizeBranch(value);
  return branch || 'NOT ASSIGNED';
};

const getDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  // =========================================================
  // AUTH / BRANCH CONTEXT
  // =========================================================

  const token = localStorage.getItem('adminToken');

  const decodeJwtPayload = (jwtToken) => {
    try {
      if (!jwtToken) {
        return {};
      }

      const parts = jwtToken.split('.');

      if (parts.length !== 3) {
        return {};
      }

      const base64 = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const padded =
        base64 + '='.repeat((4 - (base64.length % 4)) % 4);

      return JSON.parse(atob(padded));
    } catch (error) {
      console.error(
        'Unable to decode admin token:',
        error
      );
      return {};
    }
  };

  const tokenPayload = decodeJwtPayload(token);

  let loggedInUser = null;

  try {
    const storedUser = JSON.parse(
      localStorage.getItem('adminUser') ||
      localStorage.getItem('user') ||
      '{}'
    );

    loggedInUser =
      storedUser?.admin ||
      storedUser?.user ||
      storedUser;
  } catch (error) {
    console.error(
      'Unable to read logged-in user:',
      error
    );
  }

  // =========================================================
  // AUTH / MULTI-BRANCH ACCESS
  // =========================================================

  const userRole = String(
    loggedInUser?.role ||
    loggedInUser?.userRole ||
    tokenPayload?.role ||
    ''
  ).trim().toLowerCase();

  // New multi-branch field for receptionists.
  // Backward-compatible fallback to the old single gymBranch field.
  const storedGymBranches = Array.isArray(loggedInUser?.gymBranches)
    ? loggedInUser.gymBranches
    : [];

  const tokenGymBranches = Array.isArray(tokenPayload?.gymBranches)
    ? tokenPayload.gymBranches
    : [];

  const normalizedStoredBranches = storedGymBranches
    .map(normalizeBranch)
    .filter((branch) => GYM_BRANCHES.some((item) => item._id === branch));

  const normalizedTokenBranches = tokenGymBranches
    .map(normalizeBranch)
    .filter((branch) => GYM_BRANCHES.some((item) => item._id === branch));

  const legacyUserBranch = normalizeBranch(
    loggedInUser?.gymBranch ||
    loggedInUser?.branchName ||
    loggedInUser?.branch ||
    tokenPayload?.gymBranch ||
    null
  );

  const accessibleBranches = Array.from(
    new Set(
      (normalizedStoredBranches.length > 0
        ? normalizedStoredBranches
        : normalizedTokenBranches.length > 0
          ? normalizedTokenBranches
          : legacyUserBranch
            ? [legacyUserBranch]
            : []
      ).filter((branch) =>
        GYM_BRANCHES.some((item) => item._id === branch)
      )
    )
  );

  // Kept for compatibility with existing code that expects a single branch.
  // For a multi-branch receptionist this is simply the first accessible branch.
  const userBranchId = accessibleBranches[0] || '';

  const userBranchName =
    accessibleBranches.length > 0
      ? accessibleBranches.join(' / ')
      : 'BRANCH NOT ASSIGNED';

  const isMainAdmin =
    userRole === 'admin' ||
    userRole === 'main_admin' ||
    userRole === 'super_admin';

    const branches = GYM_BRANCHES;

  // Main admin can see ALL branches or select one.
  // Receptionists/staff can select only from their assigned branches.
  const initialBranchId = isMainAdmin
    ? 'all'
    : accessibleBranches[0] || '';

  const [selectedBranchId, setSelectedBranchId] =
    useState(initialBranchId);

  const [selectedBranchName, setSelectedBranchName] =
    useState(() => {
      if (isMainAdmin) return 'ALL BRANCHES';
      return accessibleBranches[0] || 'BRANCH NOT ASSIGNED';
    });

  const [branchError, setBranchError] =
    useState('');

  // Branch filtering is also enforced by the backend.
  // This frontend filter keeps the visible dashboard consistent with the
  // currently selected branch.

  const filterBySelectedBranch = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }

    // Main admin + ALL BRANCHES.
    if (isMainAdmin && selectedBranchId === 'all') {
      return items;
    }

    // Both main admin and receptionist views are filtered by the active branch.
    if (!selectedBranchId) {
      return [];
    }

    if (
      !isMainAdmin &&
      !accessibleBranches.includes(normalizeBranch(selectedBranchId))
    ) {
      return [];
    }

    return items.filter((item) => {
      const branch =
        item?.gymBranch ||
        item?.branchName ||
        item?.branch;

      return normalizeBranch(branch) ===
        normalizeBranch(selectedBranchId);
    });
  };

  const getWriteBranchId = () => {
    if (isMainAdmin) {
      if (!selectedBranchId || selectedBranchId === 'all') {
        throw new Error(
          'Select Kalyanpur or Gopalpur before creating a record.'
        );
      }

      return normalizeBranch(selectedBranchId);
    }

    if (!selectedBranchId) {
      throw new Error(
        'Your account is not assigned to a gym branch.'
      );
    }

    if (!accessibleBranches.includes(normalizeBranch(selectedBranchId))) {
      throw new Error(
        'You do not have access to the selected gym branch.'
      );
    }

    return normalizeBranch(selectedBranchId);
  };

  const [contacts, setContacts] = useState([]);
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState('');

  // =========================================================
  // DAILY / WEEKLY ACCESS PASSES
  // =========================================================
  const [accessPasses, setAccessPasses] = useState([]);
  const [accessPassesLoading, setAccessPassesLoading] = useState(true);
  const [accessPassesError, setAccessPassesError] = useState('');
  const [showAccessPassForm, setShowAccessPassForm] = useState(false);
  const [editingAccessPass, setEditingAccessPass] = useState(null);
  const [savingAccessPass, setSavingAccessPass] = useState(false);
  const [accessPassFormError, setAccessPassFormError] = useState('');
  const [accessPassForm, setAccessPassForm] = useState({ passType: 'Daily Access', price: '', description: '', gymBranch: selectedBranchId && selectedBranchId !== 'all' ? selectedBranchId : userBranchId || 'Kalyanpur', isActive: true });

  // =========================
  // DASHBOARD STATS
  // =========================

  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    totalPayments: 0,
    totalRevenue: 0,
    todayAttendance: 0,
  });

  // =========================================================
  // BRANCH-AWARE FRONTEND STATS
  // =========================================================

  useEffect(() => {
    const paidPayments = payments.filter(
      (payment) => String(payment.status || '').toLowerCase() === 'paid'
    );

    const todayKey = getDateKey();

    const todayAttendance = attendance.filter((record) => {
      if (String(record.status || '').toLowerCase() !== 'present') {
        return false;
      }

      return getDateKey(record.date) === todayKey;
    }).length;

    setStats({
      totalMembers: members.length,
      activeMembers: members.filter(
        (member) => String(member.status || '').toLowerCase() === 'active'
      ).length,
      expiredMembers: members.filter(
        (member) => String(member.status || '').toLowerCase() === 'expired'
      ).length,
      totalPayments: payments.length,
      totalRevenue: paidPayments.reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      ),
      todayAttendance,
    });
  }, [members, payments, attendance]);

  // =========================
  // LOADING STATES
  // =========================

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  // =========================
  // ERROR STATES
  // =========================

  const [error, setError] = useState('');
  const [membersError, setMembersError] = useState('');
  const [paymentsError, setPaymentsError] = useState('');
  const [attendanceError, setAttendanceError] = useState('');

  // =========================================================
  // MEMBER STATES
  // =========================================================

  const [showAddMember, setShowAddMember] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [updatingMember, setUpdatingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('All');

  const [memberSuccess, setMemberSuccess] = useState('');
  const [memberFormError, setMemberFormError] = useState('');
  const [editMemberError, setEditMemberError] = useState('');

  const [memberForm, setMemberForm] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    membershipOffer: '',
    membershipStartDate: '',
    membershipEndDate: '',
    amount: '',
  });

  // =========================================================
  // PAYMENT STATES
  // =========================================================

  const [showAddPayment, setShowAddPayment] = useState(false);

  const [addingPayment, setAddingPayment] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const [editingPayment, setEditingPayment] = useState(null);

  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [paymentFormError, setPaymentFormError] = useState('');
  const [editPaymentError, setEditPaymentError] = useState('');

  const [paymentForm, setPaymentForm] = useState({
    member: '',
    invoiceNumber: '',
    amount: '',
    paymentMethod: 'Cash',
    paymentDate: '',
    status: 'Paid',
    notes: '',
  });

  // =========================================================
  // ATTENDANCE STATES
  // =========================================================

  const [showAddAttendance, setShowAddAttendance] =
    useState(false);

  const [addingAttendance, setAddingAttendance] =
    useState(false);

  const [updatingAttendance, setUpdatingAttendance] =
    useState(false);

  const [editingAttendance, setEditingAttendance] =
    useState(null);

  const [attendanceSuccess, setAttendanceSuccess] =
    useState('');

  const [attendanceFormError, setAttendanceFormError] =
    useState('');

  const [editAttendanceError, setEditAttendanceError] =
    useState('');

  const [attendanceForm, setAttendanceForm] = useState({
    member: '',
    date: '',
    checkInTime: '',
    checkOutTime: '',
    status: 'Present',
  });
       // =========================================================




  // =========================================================
  // STAFF MANAGEMENT STATES
  // =========================================================

  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);

  const [staffSuccess, setStaffSuccess] = useState('');
  const [staffError, setStaffError] = useState('');
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Main-admin-only receptionist multi-branch assignment
  const [staffBranches, setStaffBranches] = useState([]);
  const [savingStaffBranches, setSavingStaffBranches] = useState(false);


  // =========================================================
  // WORKOUT STATES
  // =========================================================

  const [workouts, setWorkouts] = useState([]);

  const [showAddWorkout, setShowAddWorkout] =
    useState(false);

  const [addingWorkout, setAddingWorkout] =
    useState(false);

  const [updatingWorkout, setUpdatingWorkout] =
    useState(false);

  const [editingWorkout, setEditingWorkout] =
    useState(null);

  const [workoutSuccess, setWorkoutSuccess] =
    useState('');

  const [workoutFormError, setWorkoutFormError] =
    useState('');

  const [editWorkoutError, setEditWorkoutError] =
    useState('');

  const createEmptyExercise = () => ({
    name: '',
    sets: '',
    reps: '',
    duration: '',
    notes: '',
  });

  const [workoutForm, setWorkoutForm] = useState({
    member: '',
    workoutName: '',
    workoutType: 'Strength',
    exercises: [createEmptyExercise()],
    startDate: '',
    endDate: '',
    status: 'Active',
    notes: '',
  });

  // =========================================================
  // STAFF MANAGEMENT

  // =========================================================

  const normalizeStaffPermissions = (staffMember) => ({
    members: {
      view: staffMember?.permissions?.members?.view ?? true,
      add: staffMember?.permissions?.members?.add ?? true,
      edit: staffMember?.permissions?.members?.edit ?? true,
      delete: staffMember?.permissions?.members?.delete ?? false,
    },
    payments: {
      view: staffMember?.permissions?.payments?.view ?? true,
      add: staffMember?.permissions?.payments?.add ?? true,
      edit: staffMember?.permissions?.payments?.edit ?? true,
      delete: staffMember?.permissions?.payments?.delete ?? false,
    },
    attendance: {
      view: staffMember?.permissions?.attendance?.view ?? true,
      add: staffMember?.permissions?.attendance?.add ?? true,
      edit: staffMember?.permissions?.attendance?.edit ?? true,
      delete: staffMember?.permissions?.attendance?.delete ?? false,
    },
    workouts: {
      view: staffMember?.permissions?.workouts?.view ?? true,
      add: staffMember?.permissions?.workouts?.add ?? true,
      edit: staffMember?.permissions?.workouts?.edit ?? true,
      delete: staffMember?.permissions?.workouts?.delete ?? false,
    },
    enquiries: {
      view: staffMember?.permissions?.enquiries?.view ?? true,
      delete: staffMember?.permissions?.enquiries?.delete ?? false,
    },
    offers: {
      view: staffMember?.permissions?.offers?.view ?? true,
      add: staffMember?.permissions?.offers?.add ?? true,
      edit: staffMember?.permissions?.offers?.edit ?? true,
      delete: staffMember?.permissions?.offers?.delete ?? false,
    },
    accessPasses: {
      view: staffMember?.permissions?.accessPasses?.view ?? true,
      add: staffMember?.permissions?.accessPasses?.add ?? true,
      edit: staffMember?.permissions?.accessPasses?.edit ?? true,
      delete: staffMember?.permissions?.accessPasses?.delete ?? false,
    },
    trainers: {
      view: staffMember?.permissions?.trainers?.view ?? true,
      add: staffMember?.permissions?.trainers?.add ?? true,
      edit: staffMember?.permissions?.trainers?.edit ?? true,
      delete: staffMember?.permissions?.trainers?.delete ?? false,
    },
    staff: {
      view: staffMember?.permissions?.staff?.view ?? true,
      add: staffMember?.permissions?.staff?.add ?? true,
      edit: staffMember?.permissions?.staff?.edit ?? true,
      delete: staffMember?.permissions?.staff?.delete ?? false,
    },
  });

  const fetchStaff = async () => {
    try {
      setStaffError('');

      const token = localStorage.getItem('adminToken');

      if (!token) {
        throw new Error('Admin session expired. Please login again.');
      }

      const response = await fetch(
        `${API_URL}/api/admin/staff`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch staff accounts.'
        );
      }

      const rawStaffList = Array.isArray(data)
        ? data
        : data.staff || data.admins || [];

      const staffList = filterBySelectedBranch(rawStaffList);

      setStaff(staffList);

      if (staffList.length > 0) {
        setSelectedStaff((current) => {
          const currentStaff = current
            ? staffList.find(
                (member) => member._id === current._id
              )
            : null;

          const nextStaff = currentStaff || staffList[0];

          setPermissions(
            normalizeStaffPermissions(nextStaff)
          );

          setStaffBranches(
            Array.isArray(nextStaff?.gymBranches)
              ? nextStaff.gymBranches.map(normalizeBranch).filter(Boolean)
              : normalizeBranch(nextStaff?.gymBranch)
                ? [normalizeBranch(nextStaff.gymBranch)]
                : []
          );

          return nextStaff;
        });
      } else {
        setSelectedStaff(null);
        setStaffBranches([]);
      }

    } catch (error) {
      console.error('Fetch staff error:', error);
      setStaffError(
        error.message || 'Unable to load staff accounts.'
      );
    }
  };

  const handleAssignStaffBranches = async () => {
    if (!selectedStaff) {
      setStaffError('Please select a receptionist first.');
      setStaffSuccess('');
      return;
    }

    if (!isMainAdmin) {
      setStaffError(
        'Only the main admin can assign or change receptionist branches.'
      );
      setStaffSuccess('');
      return;
    }

    const targetRole = String(selectedStaff.role || '').toLowerCase();

    if (targetRole !== 'receptionist' && targetRole !== 'staff') {
      setStaffError(
        'Only receptionist accounts can be assigned gym branches.'
      );
      setStaffSuccess('');
      return;
    }

    const nextBranches = Array.from(
      new Set(
        staffBranches
          .map(normalizeBranch)
          .filter((branch) =>
            GYM_BRANCHES.some((item) => item._id === branch)
          )
      )
    );

    if (nextBranches.length === 0) {
      setStaffError('Select at least one gym branch.');
      setStaffSuccess('');
      return;
    }

    try {
      setSavingStaffBranches(true);
      setStaffError('');
      setStaffSuccess('');

      const token = localStorage.getItem('adminToken');

      if (!token) {
        throw new Error('Admin session expired. Please login again.');
      }

      const response = await fetch(
        `${API_URL}/api/admin/staff/${selectedStaff._id}/branches`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gymBranches: nextBranches,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update receptionist branches.'
        );
      }

      const updatedStaff = data.staff || {
        ...selectedStaff,
        gymBranches: nextBranches,
        gymBranch: null,
      };

      setStaffBranches(nextBranches);

      setStaff((currentStaff) =>
        currentStaff.map((member) =>
          member._id === updatedStaff._id
            ? updatedStaff
            : member
        )
      );

      setSelectedStaff(updatedStaff);

      setStaffSuccess(
        `${updatedStaff.name || 'Receptionist'} can now work at ${nextBranches.join(' and ')}.`
      );
      setStaffError('');
    } catch (error) {
      console.error('Assign staff branches error:', error);
      setStaffError(
        error.message || 'Unable to update receptionist branches.'
      );
      setStaffSuccess('');
    } finally {
      setSavingStaffBranches(false);
    }
  };

  const handlePermissionChange = (section, permission) => {
    if (!isMainAdmin) {
      return;
    }

    setPermissions((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [permission]: !current[section]?.[permission],
      },
    }));

    setStaffSuccess('');
    setStaffError('');
  };

  const handleToggleStaffStatus = async (staffMember) => {
    if (!isMainAdmin) {
      setStaffError(
        'Only the main admin can activate or deactivate staff accounts.'
      );
      setStaffSuccess('');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        throw new Error('Admin session expired. Please login again.');
      }

      const nextStatus =
        staffMember.status === 'active'
          ? 'inactive'
          : 'active';

      const response = await fetch(
        `${API_URL}/api/admin/staff/${staffMember._id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update staff status.'
        );
      }

      const updatedStaff = data.staff || {
        ...staffMember,
        status: nextStatus,
      };

      setStaff((currentStaff) =>
        currentStaff.map((member) =>
          member._id === staffMember._id
            ? updatedStaff
            : member
        )
      );

      setSelectedStaff((current) =>
        current?._id === staffMember._id
          ? updatedStaff
          : current
      );

      setStaffSuccess(
        nextStatus === 'active'
          ? 'Staff account activated successfully.'
          : 'Staff account deactivated successfully.'
      );
      setStaffError('');

    } catch (error) {
      console.error('Toggle staff status error:', error);
      setStaffError(
        error.message || 'Unable to update staff status.'
      );
      setStaffSuccess('');
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) {
      return;
    }

    if (!isMainAdmin) {
      setStaffError(
        'Only the main admin can manage staff permissions.'
      );
      setStaffSuccess('');
      return;
    }

    try {
      setSavingPermissions(true);
      setStaffError('');
      setStaffSuccess('');

      const token = localStorage.getItem('adminToken');

      if (!token) {
        throw new Error('Admin session expired. Please login again.');
      }

      const response = await fetch(
        `${API_URL}/api/admin/staff/${selectedStaff._id}/permissions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            permissions,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to save staff permissions.'
        );
      }

      const updatedStaff = data.staff || {
        ...selectedStaff,
        permissions,
      };

      setStaff((currentStaff) =>
        currentStaff.map((member) =>
          member._id === selectedStaff._id
            ? updatedStaff
            : member
        )
      );

      setSelectedStaff(updatedStaff);
      setPermissions(normalizeStaffPermissions(updatedStaff));

      setStaffSuccess(
        'Staff permissions saved successfully.'
      );

    } catch (error) {
      console.error('Save staff permissions error:', error);
      setStaffError(
        error.message || 'Unable to save staff permissions.'
      );
      setStaffSuccess('');
    } finally {
      setSavingPermissions(false);
    }
  };
  const permissionCount = Object.values(permissions).reduce(
    (total, section) =>
      Number(total) +
      Object.values(section || {}).filter(Boolean).length,
    0
  );


  // =========================================================
  // CONTACTS
  // =========================================================

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin token not found.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/contacts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to fetch enquiries.'
        );
      }

      setContacts(filterBySelectedBranch(data.contacts || []));

    } catch (error) {
      console.error(
        'Fetch contacts error:',
        error
      );

      setError(
        'Unable to load enquiries.'
      );

    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // DASHBOARD STATS
  // =========================================================

  const fetchDashboardStats = async () => {
    try {
      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin token not found.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to fetch dashboard stats.'
        );
      }

      // The backend stats endpoint returns both branches for the main admin.
      // When a specific branch is selected, the branch-filtered member/payment/
      // attendance arrays below calculate the visible stats instead.
      if (
        !isMainAdmin ||
        selectedBranchId === 'all'
      ) {
        setStats(data.stats);
      }

    } catch (error) {
      console.error(
        'Fetch dashboard stats error:',
        error
      );

    }
  };


  // =========================================================
  // MEMBERS
  // =========================================================

  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      setMembersError('');

      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin token not found.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to fetch members.'
        );
      }

      setMembers(filterBySelectedBranch(data.members || []));

    } catch (error) {
      console.error(
        'Fetch members error:',
        error
      );

      setMembersError(
        'Unable to load members.'
      );

    } finally {
      setMembersLoading(false);
    }
  };

  const handleMemberChange = (e) => {
    const { name, value } = e.target;

    setMemberForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleOfferChange = (e) => {
    const offerId = e.target.value;
    const selectedOffer = offers.find(
      (offer) => String(offer._id) === String(offerId)
    );

    setMemberForm((current) => ({
      ...current,
      membershipOffer: offerId,
      amount: selectedOffer
        ? String(Number(selectedOffer.offerPrice || 0))
        : current.amount,
    }));
  };

 // =========================================================
// ADD MEMBER
// =========================================================

const handleAddMember = async (e) => {
  e.preventDefault();

  try {
    setAddingMember(true);
    setMemberFormError('');
    setMemberSuccess('');

    const token =
      localStorage.getItem('adminToken');

    if (!token) {
      throw new Error(
        'Admin session expired. Please login again.'
      );
    }

    const response = await fetch(
      `${API_URL}/api/members`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gymBranch: getWriteBranchId(),
          name: memberForm.name,
          phone: memberForm.phone,
          email: memberForm.email,
          age: memberForm.age
            ? Number(memberForm.age)
            : undefined,
          gender: memberForm.gender,
          membershipOffer:
            memberForm.membershipOffer || undefined,
          membershipStartDate:
            memberForm.membershipStartDate,
          membershipEndDate:
            memberForm.membershipEndDate,
          amount:
            Number(memberForm.amount),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to add member.'
      );
    }

    setMemberSuccess(
      'Member added successfully!'
    );

    setMemberForm({
      name: '',
      phone: '',
      email: '',
      age: '',
      gender: 'Male',
      membershipOffer: '',
      membershipStartDate: '',
      membershipEndDate: '',
      amount: '',
    });

    await fetchMembers();
    await fetchDashboardStats();

    setTimeout(() => {
      setShowAddMember(false);
      setMemberSuccess('');
    }, 1200);

  } catch (error) {
    console.error(
      'Add member error:',
      error
    );

    setMemberFormError(
      error.message ||
        'Unable to add member.'
    );

  } finally {
    setAddingMember(false);
  }
};

const handleToggleOfferStatus = async (offer) => {
  try {
    const token =
      localStorage.getItem('adminToken');

    if (!token) {
      throw new Error(
        'Admin session expired. Please login again.'
      );
    }

    const response = await fetch(
      `${API_URL}/api/offers/${offer._id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !offer.isActive,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to update offer status.'
      );
    }

    await fetchOffers();

    alert(
      offer.isActive
        ? 'Offer deactivated successfully.'
        : 'Offer activated successfully.'
    );
  } catch (error) {
    console.error(
      'Toggle offer status error:',
      error
    );

    alert(
      error.message ||
        'Failed to update offer status.'
    );
  }
};
// =========================================================
  // EDIT MEMBER
  // =========================================================

  const handleEditMember = (member) => {
    setEditingMember(member);

    setMemberForm({
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      age: member.age || '',
      gender: member.gender || 'Male',
      membershipOffer:
        member.membershipOffer?._id ||
        member.membershipOffer ||
        '',
      membershipStartDate:
        member.membershipStartDate
          ? member.membershipStartDate.split('T')[0]
          : '',
      membershipEndDate:
        member.membershipEndDate
          ? member.membershipEndDate.split('T')[0]
          : '',
      amount: member.amount || '',
    });

    setShowAddMember(true);
    setMemberFormError('');
    setEditMemberError('');
    setMemberSuccess('');
  };

  // =========================================================
  // UPDATE MEMBER
  // =========================================================

  const handleUpdateMember = async (e) => {
    e.preventDefault();

    try {
      setUpdatingMember(true);
      setEditMemberError('');
      setMemberSuccess('');

      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin session expired. Please login again.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/members/${editingMember._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gymBranch: getWriteBranchId(),
            name: memberForm.name,
            phone: memberForm.phone,
            email: memberForm.email,
            age: memberForm.age
              ? Number(memberForm.age)
              : undefined,
            gender: memberForm.gender,
            membershipOffer:
              memberForm.membershipOffer || undefined,
            membershipStartDate:
              memberForm.membershipStartDate,
            membershipEndDate:
              memberForm.membershipEndDate,
            amount: Number(memberForm.amount),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to update member.'
        );
      }

      setMemberSuccess(
        'Member updated successfully!'
      );

      setEditingMember(null);

      await fetchMembers();
      await fetchDashboardStats();

      setTimeout(() => {
        setShowAddMember(false);
        setMemberSuccess('');
      }, 1200);

    } catch (error) {
      console.error(
        'Update member error:',
        error
      );

      setEditMemberError(
        error.message ||
          'Unable to update member.'
      );

    } finally {
      setUpdatingMember(false);
    }
  };

  // =========================================================
  // DELETE MEMBER
  // =========================================================

  const handleDeleteMember = async (
    memberId
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this member?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin session expired. Please login again.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/members/${memberId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to delete member.'
        );
      }

      setMembers((currentMembers) =>
        currentMembers.filter(
          (member) =>
            member._id !== memberId
        )
      );

      await fetchDashboardStats();

    } catch (error) {
      console.error(
        'Delete member error:',
        error
      );

      alert(
        error.message ||
          'Unable to delete member.'
      );
    }
  };

  // =========================================================
  // =========================================================
  // MEMBER SEARCH & FILTER
  // =========================================================

  const filteredMembers = members.filter((member) => {
    const search = memberSearch.toLowerCase().trim();

    const matchesSearch =
      member.name?.toLowerCase().includes(search) ||
      member.phone?.toLowerCase().includes(search);

    const matchesStatus =
      memberStatusFilter === 'All' ||
      member.status === memberStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const fetchOffers = async () => {
  try {
    setOffersLoading(true);
    setOffersError('');

    const token = localStorage.getItem('adminToken');

    if (!token) {
      throw new Error('Admin session expired. Please login again.');
    }

    // Get the currently selected/active branch
    const activeBranch =
      selectedBranchId && selectedBranchId !== 'all'
        ? normalizeBranch(selectedBranchId)
        : '';

    // Main admin with "All Branches" can request all offers.
    // Branch users / selected branch users send the active branch.
    const offersUrl = activeBranch
      ? `${API_URL}/api/offers?branch=${encodeURIComponent(activeBranch)}`
      : `${API_URL}/api/offers`;

    const response = await fetch(offersUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(activeBranch
          ? {
              'X-Gym-Branch': activeBranch,
            }
          : {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to fetch Puja offers.'
      );
    }

    const rawOffers = filterBySelectedBranch(
      Array.isArray(data.offers) ? data.offers : []
    );

    const pujaOffers = rawOffers.filter((offer) =>
      /puja/i.test(String(offer?.name || ''))
    );

    const uniqueOffers = Array.from(
      new Map(
        pujaOffers.map((offer) => [
          `${normalizeBranch(offer.gymBranch)}-${String(
            offer.name || ''
          )
            .trim()
            .toLowerCase()}`,
          offer,
        ])
      ).values()
    );

    setOffers(uniqueOffers);
  } catch (error) {
    console.error('Fetch Puja offers error:', error);
    setOffersError(
      error.message || 'Unable to load Puja offers.'
    );
    setOffers([]);
  } finally {
    setOffersLoading(false);
  }
};
  const [showPujaOfferForm, setShowPujaOfferForm] = useState(false);
  const [savingPujaOffer, setSavingPujaOffer] = useState(false);
  const [pujaOfferError, setPujaOfferError] = useState('');
  const [pujaOfferSuccess, setPujaOfferSuccess] = useState('');
  const [pujaOfferForm, setPujaOfferForm] = useState({
    name: '🪔 PUJA TRANSFORMATION', durationMonths: 3, offerPrice: '',
    startDate: getDateKey(), endDate: '',
    description: 'Special Puja season transformation offer at Alpha Gym.',
    benefits: 'Gym Access\nWorkout Guidance\nProgress Tracking', image: '', isActive: true,
  });

  const handlePujaOfferChange = (event) => {
    const { name, value, type, checked } = event.target;
    setPujaOfferForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const openPujaOfferForm = () => {
    setPujaOfferError(''); setPujaOfferSuccess(''); setShowPujaOfferForm(true);
  };

  const handleCreatePujaOffer = async (event) => {
    event.preventDefault();
    try {
      setSavingPujaOffer(true); setPujaOfferError(''); setPujaOfferSuccess('');
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Admin session expired. Please login again.');
      const branch = getWriteBranchId();
      const offerPrice = Number(pujaOfferForm.offerPrice);
      const durationMonths = Number(pujaOfferForm.durationMonths);
      if (!Number.isFinite(offerPrice) || offerPrice < 0) throw new Error('Enter a valid Puja offer price.');
      if (!Number.isInteger(durationMonths) || durationMonths < 1) throw new Error('Duration must be at least 1 month.');
      if (!pujaOfferForm.startDate || !pujaOfferForm.endDate) throw new Error('Start date and end date are required.');
      const offerName = String(pujaOfferForm.name || '').trim();
      if (!offerName) throw new Error('Offer name is required.');

      const response = await fetch(`${API_URL}/api/offers`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          gymBranch: branch, name: offerName,
          durationMonths, offerPrice, startDate: pujaOfferForm.startDate, endDate: pujaOfferForm.endDate,
          description: String(pujaOfferForm.description || '').trim(),
          benefits: String(pujaOfferForm.benefits || '').split('\n').map((x) => x.trim()).filter(Boolean),
          image: String(pujaOfferForm.image || '').trim(), isActive: Boolean(pujaOfferForm.isActive),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create Puja offer.');
      setPujaOfferSuccess('Puja offer created successfully.');
      setShowPujaOfferForm(false);
      setPujaOfferForm((current) => ({ ...current, offerPrice: '', image: '' }));
      await fetchOffers();
    } catch (error) {
      console.error('Create Puja offer error:', error);
      setPujaOfferError(error.message || 'Unable to create Puja offer.');
    } finally { setSavingPujaOffer(false); }
  };


  const fetchAccessPasses = async () => {
    try {
      setAccessPassesLoading(true); setAccessPassesError('');
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Admin session expired. Please login again.');
      const accessPassEndpoint = isMainAdmin
        ? `${API_URL}/api/access-passes/all`
        : `${API_URL}/api/access-passes`;
      const response = await fetch(accessPassEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch access passes.');
      setAccessPasses(filterBySelectedBranch(Array.isArray(data.accessPasses) ? data.accessPasses : []));
    } catch (error) {
      console.error('Fetch access passes error:', error); setAccessPassesError(error.message || 'Unable to load access passes.'); setAccessPasses([]);
    } finally { setAccessPassesLoading(false); }
  };

  const resetAccessPassForm = () => {
    setAccessPassForm({ passType: 'Daily Access', price: '', description: '', gymBranch: selectedBranchId !== 'all' ? selectedBranchId : userBranchId || 'Kalyanpur', isActive: true });
  };

  const openCreateAccessPass = () => { setEditingAccessPass(null); setAccessPassFormError(''); resetAccessPassForm(); setShowAccessPassForm(true); };

  const openEditAccessPass = (pass) => {
    setEditingAccessPass(pass); setAccessPassFormError('');
    setAccessPassForm({ passType: pass?.passType || (Number(pass?.durationDays) === 7 ? 'Weekly Access' : 'Daily Access'), price: pass?.price ?? '', description: pass?.description || '', gymBranch: normalizeBranch(pass?.gymBranch) || userBranchId || 'Kalyanpur', isActive: pass?.isActive !== false });
    setShowAccessPassForm(true);
  };

  const handleAccessPassChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAccessPassForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveAccessPass = async (event) => {
    event.preventDefault();
    try {
      setSavingAccessPass(true); setAccessPassFormError('');
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Admin session expired. Please login again.');
      const branch = isMainAdmin ? normalizeBranch(accessPassForm.gymBranch) : getWriteBranchId();
      if (!['Kalyanpur', 'Gopalpur'].includes(branch)) throw new Error('Select a valid gym branch.');
      const passType = accessPassForm.passType === 'Weekly Access' ? 'Weekly Access' : 'Daily Access';
      const price = Number(accessPassForm.price);
      if (!Number.isFinite(price) || price < 0) throw new Error('Enter a valid access price.');
      const endpoint = editingAccessPass ? `${API_URL}/api/access-passes/${editingAccessPass._id}` : `${API_URL}/api/access-passes`;
      const response = await fetch(endpoint, {
        method: editingAccessPass ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gymBranch: branch, passType, price, description: String(accessPassForm.description || '').trim(), isActive: Boolean(accessPassForm.isActive) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save access pass.');
      setShowAccessPassForm(false); setEditingAccessPass(null); await fetchAccessPasses();
    } catch (error) {
      console.error('Save access pass error:', error); setAccessPassFormError(error.message || 'Unable to save access pass.');
    } finally { setSavingAccessPass(false); }
  };

  const handleToggleAccessPass = async (pass) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Admin session expired. Please login again.');
      const response = await fetch(`${API_URL}/api/access-passes/${pass._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !pass.isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update access pass.');
      await fetchAccessPasses();
    } catch (error) {
      console.error('Toggle access pass error:', error); setAccessPassesError(error.message || 'Unable to update access pass.');
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      setPaymentsError('');

      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin token not found.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/payments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to fetch payments.'
        );
      }

      setPayments(filterBySelectedBranch(data.payments || []));

    } catch (error) {
      console.error(
        'Fetch payments error:',
        error
      );

      setPaymentsError(
        'Unable to load payments.'
      );

    } finally {
      setPaymentsLoading(false);
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;

    setPaymentForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================================================
  // ADD PAYMENT
  // =========================================================

  const handleAddPayment = async (e) => {
    e.preventDefault();

    try {
      setAddingPayment(true);
      setPaymentFormError('');
      setPaymentSuccess('');

      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin session expired. Please login again.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/payments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gymBranch: getWriteBranchId(),
            member: paymentForm.member,
            invoiceNumber:
              paymentForm.invoiceNumber,
            amount: Number(paymentForm.amount),
            paymentMethod:
              paymentForm.paymentMethod,
            paymentDate:
              paymentForm.paymentDate || undefined,
            status: paymentForm.status,
            notes: paymentForm.notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to add payment.'
        );
      }

      setPaymentSuccess(
        'Payment added successfully!'
      );

      setPaymentForm({
        member: '',
        invoiceNumber: '',
        amount: '',
        paymentMethod: 'Cash',
        paymentDate: '',
        status: 'Paid',
        notes: '',
      });

      await fetchPayments();
      await fetchDashboardStats();

      setTimeout(() => {
        setShowAddPayment(false);
        setPaymentSuccess('');
      }, 1200);

    } catch (error) {
      console.error(
        'Add payment error:',
        error
      );

      setPaymentFormError(
        error.message ||
          'Unable to add payment.'
      );

    } finally {
      setAddingPayment(false);
    }
  };

  // =========================================================
  // EDIT PAYMENT
  // =========================================================

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);

    setPaymentForm({
      member:
        payment.member?._id ||
        payment.member ||
        '',
      invoiceNumber:
        payment.invoiceNumber || '',
      amount:
        payment.amount || '',
      paymentMethod:
        payment.paymentMethod || 'Cash',
      paymentDate:
        payment.paymentDate
          ? payment.paymentDate.split('T')[0]
          : '',
      status:
        payment.status || 'Paid',
      notes:
        payment.notes || '',
    });

    setShowAddPayment(true);

    setPaymentFormError('');
    setEditPaymentError('');
    setPaymentSuccess('');
  };


  // =========================================================
  // UPDATE PAYMENT
  // =========================================================

  const handleUpdatePayment = async (e) => {
    e.preventDefault();

    try {
      setUpdatingPayment(true);
      setEditPaymentError('');
      setPaymentSuccess('');

      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin session expired. Please login again.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/payments/${editingPayment._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gymBranch: getWriteBranchId(),
            member: paymentForm.member,
            invoiceNumber:
              paymentForm.invoiceNumber,
            amount: Number(paymentForm.amount),
            paymentMethod:
              paymentForm.paymentMethod,
            paymentDate:
              paymentForm.paymentDate || undefined,
            status:
              paymentForm.status,
            notes:
              paymentForm.notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to update payment.'
        );
      }

      setPaymentSuccess(
        'Payment updated successfully!'
      );

      setEditingPayment(null);

      await fetchPayments();
      await fetchDashboardStats();

      setTimeout(() => {
        setShowAddPayment(false);
        setPaymentSuccess('');
      }, 1200);

    } catch (error) {
      console.error(
        'Update payment error:',
        error
      );

      setEditPaymentError(
        error.message ||
          'Unable to update payment.'
      );

    } finally {
      setUpdatingPayment(false);
    }
  };

  // =========================================================
  // DELETE PAYMENT
  // =========================================================

  const handleDeletePayment = async (
    paymentId
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this payment?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin session expired. Please login again.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/payments/${paymentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to delete payment.'
        );
      }

      setPayments((currentPayments) =>
        currentPayments.filter(
          (payment) =>
            payment._id !== paymentId
        )
      );

      await fetchDashboardStats();

    } catch (error) {
      console.error(
        'Delete payment error:',
        error
      );

      alert(
        error.message ||
          'Unable to delete payment.'
      );
    }
  };


  // =========================
// FETCH ATTENDANCE
// =========================

const fetchAttendance = async () => {
  try {
    setAttendanceLoading(true);
    setAttendanceError('');

    const token =
      localStorage.getItem('adminToken');

    if (!token) {
      throw new Error(
        'Admin token not found.'
      );
    }

    const response = await fetch(
      `${API_URL}/api/attendance`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to fetch attendance.'
      );
    }

    setAttendance(
      filterBySelectedBranch(data.attendance || [])
    );

  } catch (error) {
    console.error(
      'Fetch attendance error:',
      error
    );

    setAttendanceError(
      'Unable to load attendance.'
    );

  } finally {
    setAttendanceLoading(false);
  }
};


// =========================
// MARK ATTENDANCE
// =========================

const handleMarkAttendance = async (e) => {
  e.preventDefault();

  try {
    setAttendanceError('');

    if (
      !attendanceForm.member ||
      !attendanceForm.date
    ) {
      setAttendanceError(
        'Please select a member and attendance date.'
      );
      return;
    }

    const token =
      localStorage.getItem('adminToken');

    if (!token) {
      throw new Error(
        'Admin token not found.'
      );
    }

    const response = await fetch(
      `${API_URL}/api/attendance`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

       body: JSON.stringify({
          gymBranch: getWriteBranchId(),
          member: attendanceForm.member,
          date: attendanceForm.date,
          status:
            attendanceForm.status || 'Present',
          checkInTime:
            attendanceForm.checkInTime
              ? `${attendanceForm.date}T${attendanceForm.checkInTime}:00`
              : null,
          checkOutTime:
            attendanceForm.checkOutTime
              ? `${attendanceForm.date}T${attendanceForm.checkOutTime}:00`
              : null,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to mark attendance.'
      );
    }

    await fetchAttendance();

    setAttendanceForm({
      member: '',
      date: '',
      status: 'Present',
      checkInTime: '',
      checkOutTime: '',
    });

  } catch (error) {
    console.error(
      'Mark Attendance Error:',
      error
    );

    setAttendanceError(
      error.message ||
        'Failed to mark attendance.'
    );
  }
};

// =========================
// ATTENDANCE FORM CHANGE

// =========================

const handleAttendanceChange = (e) => {
  const {
    name,
    value,
  } = e.target;

  setAttendanceForm((current) => ({
    ...current,
    [name]: value,
  }));
};

  const handleEditAttendance = (record) => {
    setEditingAttendance(record);

    const memberId =
      record?.member?._id ||
      record?.member ||
      '';

    const dateValue = record?.date
      ? new Date(record.date)
      : null;

    const formatTime = (value) => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return `${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes()
      ).padStart(2, '0')}`;
    };

    setAttendanceForm({
      member: memberId,
      date: dateValue && !Number.isNaN(dateValue.getTime())
        ? getDateKey(dateValue)
        : '',
      checkInTime: formatTime(record?.checkInTime),
      checkOutTime: formatTime(record?.checkOutTime),
      status: record?.status || 'Present',
    });

    setShowAddAttendance(true);
    setAttendanceFormError('');
    setEditAttendanceError('');
    setAttendanceSuccess('');
  };

  const handleUpdateAttendance = async (
    e
  ) => {
    e.preventDefault();

    try {
      setUpdatingAttendance(true);
      setEditAttendanceError('');
      setAttendanceSuccess('');

      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin session expired. Please login again.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/attendance/${editingAttendance._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gymBranch: getWriteBranchId(),
            member: attendanceForm.member,
            date: attendanceForm.date,
            checkInTime:
              attendanceForm.checkInTime
                ? `${attendanceForm.date}T${attendanceForm.checkInTime}:00`
                : null,
            checkOutTime:
              attendanceForm.checkOutTime
                ? `${attendanceForm.date}T${attendanceForm.checkOutTime}:00`
                : null,
            status:
              attendanceForm.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to update attendance.'
        );
      }

      setAttendanceSuccess(
        'Attendance updated successfully!'
      );

      setEditingAttendance(null);

      await fetchAttendance();
      await fetchDashboardStats();

      setTimeout(() => {
        setShowAddAttendance(false);
        setAttendanceSuccess('');
      }, 1200);

    } catch (error) {
      console.error(
        'Update attendance error:',
        error
      );

      setEditAttendanceError(
        error.message ||
          'Unable to update attendance.'
      );

    } finally {
      setUpdatingAttendance(false);
    }
  };

  // =========================
  // DELETE ATTENDANCE
  // =========================

  const handleDeleteAttendance = async (
    attendanceId
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this attendance record?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin session expired. Please login again.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/attendance/${attendanceId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to delete attendance.'
        );
      }

      setAttendance(
        (currentAttendance) =>
          currentAttendance.filter(
            (record) =>
              record._id !== attendanceId
          )
      );

      await fetchDashboardStats();

    } catch (error) {
      console.error(
        'Delete attendance error:',
        error
      );

      alert(
        error.message ||
          'Unable to delete attendance.'
      );
    }
  };


  // =========================================================
  // WORKOUT MANAGEMENT
  // =========================================================

  const fetchWorkouts = async () => {
    try {
      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin token not found.'
        );
      }

      const response = await
       fetch(`${API_URL}/api/workouts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to fetch workouts.'
        );
      }

      setWorkouts(filterBySelectedBranch(data.workouts || []));

    } catch (error) {
      console.error(
        'Fetch workouts error:',
        error
      );
    }
  };

  const handleWorkoutChange = (e) => {
    const { name, value } = e.target;

    setWorkoutForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleExerciseChange = (
    index,
    field,
    value
  ) => {
    setWorkoutForm((current) => ({
      ...current,
      exercises: current.exercises.map(
        (exercise, exerciseIndex) =>
          exerciseIndex === index
            ? {
                ...exercise,
                [field]: value,
              }
            : exercise
      ),
    }));
  };

  const handleAddExercise = () => {
    setWorkoutForm((current) => ({
      ...current,
      exercises: [
        ...current.exercises,
        createEmptyExercise(),
      ],
    }));
  };

  const handleRemoveExercise = (index) => {
    setWorkoutForm((current) => {
      if (current.exercises.length === 1) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.filter(
          (_, exerciseIndex) =>
            exerciseIndex !== index
        ),
      };
    });
  };

  const resetWorkoutForm = () => {
    setWorkoutForm({
      member: '',
      workoutName: '',
      workoutType: 'Strength',
      exercises: [createEmptyExercise()],
      startDate: '',
      endDate: '',
      status: 'Active',
      notes: '',
    });
  };

  const handleAddWorkout = async (e) => {
    e.preventDefault();

    try {
      setAddingWorkout(true);
      setWorkoutFormError('');
      setWorkoutSuccess('');

      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin session expired. Please login again.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/workouts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gymBranch: getWriteBranchId(),
            member: workoutForm.member,
            workoutName:
              workoutForm.workoutName,
            workoutType:
              workoutForm.workoutType,
            exercises:
              workoutForm.exercises.map(
                (exercise) => ({
                  name: exercise.name,
                  sets: exercise.sets
                    ? Number(exercise.sets)
                    : 0,
                  reps: exercise.reps
                    ? Number(exercise.reps)
                    : 0,
                  duration:
                    exercise.duration
                      ? Number(
                          exercise.duration
                        )
                      : 0,
                  notes: exercise.notes,
                })
              ),
            startDate:
              workoutForm.startDate,
            endDate:
              workoutForm.endDate,
            status:
              workoutForm.status,
            notes:
              workoutForm.notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to add workout.'
        );
      }

      setWorkoutSuccess(
        'Workout added successfully!'
      );

      resetWorkoutForm();

      await fetchWorkouts();

      setTimeout(() => {
        setShowAddWorkout(false);
        setWorkoutSuccess('');
      }, 1200);

    } catch (error) {
      console.error(
        'Add workout error:',
        error
      );

      setWorkoutFormError(
        error.message ||
          'Unable to add workout.'
      );

    } finally {
      setAddingWorkout(false);
    }
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);

    setWorkoutForm({
      member:
        workout.member?._id ||
        workout.member ||
        '',
      workoutName:
        workout.workoutName || '',
      workoutType:
        workout.workoutType || 'Strength',
      exercises:
        workout.exercises?.length
          ? workout.exercises.map(
              (exercise) => ({
                name: exercise.name || '',
                sets:
                  exercise.sets ?? '',
                reps:
                  exercise.reps ?? '',
                duration:
                  exercise.duration ?? '',
                notes:
                  exercise.notes || '',
              })
            )
          : [createEmptyExercise()],
      startDate:
        workout.startDate
          ? workout.startDate.split('T')[0]
          : '',
      endDate:
        workout.endDate
          ? workout.endDate.split('T')[0]
          : '',
      status:
        workout.status || 'Active',
      notes:
        workout.notes || '',
    });

    setShowAddWorkout(true);
    setWorkoutFormError('');
    setEditWorkoutError('');
    setWorkoutSuccess('');
  };

  const handleUpdateWorkout = async (e) => {
    e.preventDefault();

    try {
      setUpdatingWorkout(true);
      setEditWorkoutError('');
      setWorkoutSuccess('');

      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin session expired. Please login again.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/workouts/${editingWorkout._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gymBranch: getWriteBranchId(),
            member: workoutForm.member,
            workoutName:
              workoutForm.workoutName,
            workoutType:
              workoutForm.workoutType,
            exercises:
              workoutForm.exercises.map(
                (exercise) => ({
                  name: exercise.name,
                  sets: exercise.sets
                    ? Number(exercise.sets)
                    : 0,
                  reps: exercise.reps
                    ? Number(exercise.reps)
                    : 0,
                  duration:
                    exercise.duration
                      ? Number(
                          exercise.duration
                        )
                      : 0,
                  notes: exercise.notes,
                })
              ),
            startDate:
              workoutForm.startDate,
            endDate:
              workoutForm.endDate,
            status:
              workoutForm.status,
            notes:
              workoutForm.notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to update workout.'
        );
      }

      setWorkoutSuccess(
        'Workout updated successfully!'
      );

      setEditingWorkout(null);

      await fetchWorkouts();

      setTimeout(() => {
        setShowAddWorkout(false);
        setWorkoutSuccess('');
      }, 1200);

    } catch (error) {
      console.error(
        'Update workout error:',
        error
      );

      setEditWorkoutError(
        error.message ||
          'Unable to update workout.'
      );

    } finally {
      setUpdatingWorkout(false);
    }
  };

  const handleDeleteWorkout = async (
    workoutId
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this workout?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin session expired. Please login again.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/workouts/${workoutId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to delete workout.'
        );
      }

      setWorkouts((currentWorkouts) =>
        currentWorkouts.filter(
          (workout) =>
            workout._id !== workoutId
        )
      );

    } catch (error) {
      console.error(
        'Delete workout error:',
        error
      );

      alert(
        error.message ||
          'Unable to delete workout.'
      );
    }
  };

  // =========================================================
  // DELETE ENQUIRY
  // =========================================================

  const handleDeleteContact = async (
    contactId
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this enquiry?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin session expired. Please login again.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/contacts/${contactId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to delete enquiry.'
        );
      }

      setContacts((currentContacts) =>
        currentContacts.filter(
          (contact) =>
            contact._id !== contactId
        )
      );

    } catch (error) {
      console.error(
        'Delete enquiry error:',
        error
      );

      alert(
        error.message ||
          'Unable to delete enquiry.'
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }

    fetchContacts();
    fetchDashboardStats();
    fetchMembers();
    fetchPayments();
    fetchAttendance();
    fetchWorkouts();
    fetchStaff();
    fetchOffers();
    fetchAccessPasses();
  }, [selectedBranchId, isMainAdmin, token, navigate]);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    fetchContacts();
    fetchDashboardStats();
    fetchMembers();
    fetchPayments();
    fetchAttendance();
    fetchWorkouts();
    fetchStaff();
    fetchOffers();
    fetchAccessPasses();
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="admin-dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-header">

        <div>

          <span className="section-tag">
            ALPHA GYM
          </span>

          <h1>
            ADMIN <span>DASHBOARD</span>
          </h1>

          <p>
            Manage members, payments, attendance, workouts, access products and Puja offers.
          </p>

          <div className="admin-current-branch">
            {`BRANCH: ${selectedBranchName}`}
          </div>

        </div>

        <div className="admin-header-actions">

          <div
            className="admin-branch-control"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              border: '1px solid rgba(255, 102, 0, 0.35)',
              borderRadius: '8px',
              background: 'rgba(255, 102, 0, 0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  opacity: 0.65,
                }}
              >
                ACTIVE GYM BRANCH
              </span>

              <strong
                className="admin-current-branch"
                style={{
                  fontSize: '13px',
                }}
              >
                {selectedBranchName}
              </strong>
            </div>

            {isMainAdmin || accessibleBranches.length > 1 ? (
              <select
                className="admin-branch-select"
                value={selectedBranchId || (isMainAdmin ? 'all' : '')}
                onChange={(e) => {
                  const value = e.target.value;

                  if (!isMainAdmin && !accessibleBranches.includes(value)) {
                    setBranchError('You do not have access to that gym branch.');
                    return;
                  }

                  setBranchError('');
                  setSelectedBranchId(value);

                  if (value === 'all') {
                    setSelectedBranchName('ALL BRANCHES');
                  } else {
                    const selected = branches.find(
                      (branch) => branch._id === value
                    );

                    setSelectedBranchName(
                      selected?.name || 'SELECTED BRANCH'
                    );
                  }
                }}
                aria-label="Select active gym branch"
              >
                {isMainAdmin && (
                  <option value="all">
                    ALL BRANCHES
                  </option>
                )}

                {branches
                  .filter((branch) =>
                    isMainAdmin
                      ? true
                      : accessibleBranches.includes(branch._id)
                  )
                  .map((branch) => (
                    <option
                      key={branch._id}
                      value={branch._id}
                    >
                      {branch.name}
                    </option>
                  ))}
              </select>
            ) : (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  opacity: 0.65,
                  whiteSpace: 'nowrap',
                }}
              >
                ASSIGNED BRANCH
              </span>
            )}
          </div>

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={handleRefresh}
            aria-label="Refresh dashboard data"
          >
            ↻ REFRESH
          </button>

          <AdminLogout />

        </div>

      </header>

      {branchError && (
        <div className="admin-login-error" role="alert">
          {branchError}
        </div>
      )}

      {/* =====================================================
          STATS ROW 1
      ===================================================== */}

      <section className="admin-stats">

        <div className="admin-stat-card">

          <span>
            TOTAL MEMBERS
          </span>

          <strong>
            {stats.totalMembers}
          </strong>

        </div>

        <div className="admin-stat-card">

          <span>
            ACTIVE MEMBERS
          </span>

          <strong>
            {stats.activeMembers}
          </strong>

        </div>

        <div className="admin-stat-card">

          <span>
            TOTAL REVENUE
          </span>

          <strong>
            ₹
            {Number(
              stats.totalRevenue
            ).toLocaleString('en-IN')}
          </strong>

        </div>

        <div className="admin-stat-card">

          <span>
            TODAY ATTENDANCE
          </span>

          <strong>
            {stats.todayAttendance}
          </strong>

        </div>

      </section>

            {/* =====================================================
          STATS ROW 2
      ===================================================== */}

      <section className="admin-stats">

        <div className="admin-stat-card">
          <span>
            EXPIRED MEMBERS
          </span>

          <strong>
            {stats.expiredMembers}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            TOTAL PAYMENTS
          </span>

          <strong>
            {stats.totalPayments}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            TOTAL ENQUIRIES
          </span>

          <strong>
            {contacts.length}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            ACCESS PASSES
          </span>

          <strong>
            {accessPasses.length}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            SYSTEM STATUS
          </span>

          <strong>
            ONLINE
          </strong>
        </div>

      </section>


      {/* =====================================================
          MEMBER MANAGEMENT
      ===================================================== */}

      <section className="admin-enquiries">

        <div className="admin-section-heading">

          <div>

            <span className="section-tag">
              GYM MEMBERS
            </span>

            <h2>
              MEMBER <span>MANAGEMENT.</span>
            </h2>

          </div>

          <div className="admin-section-actions">

            <span className="admin-count">
              {filteredMembers.length} / {members.length} MEMBERS
            </span>

            <button
              type="button"
              className="admin-add-btn"
              onClick={() => {

                setShowAddMember(
                  (current) => !current
                );

                setEditingMember(null);

                setMemberFormError('');
                setEditMemberError('');
                setMemberSuccess('');

              }}
            >
              {showAddMember
                ? '✕ CLOSE'
                : '+ ADD MEMBER'}
            </button>

          </div>

        </div>


        {/* =========================
            MEMBER FORM
        ========================= */}

        {showAddMember && (

          <div className="admin-add-member-card">

            <div className="admin-form-heading">

              <span className="section-tag">
                {editingMember
                  ? 'EDIT MEMBER'
                  : 'NEW MEMBER'}
              </span>

              <h3>
                {editingMember
                  ? 'EDIT '
                  : 'ADD '}

                <span>
                  MEMBER.
                </span>
              </h3>

            </div>


            <form
              className="admin-member-form"
              onSubmit={
                editingMember
                  ? handleUpdateMember
                  : handleAddMember
              }
            >

              <div className="admin-login-field">

                <label htmlFor="member-name">
                  FULL NAME
                </label>

                <input
                  id="member-name"
                  name="name"
                  type="text"
                  placeholder="Enter member name"
                  value={memberForm.name}
                  onChange={handleMemberChange}
                  required
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="member-phone">
                  PHONE
                </label>

                <input
                  id="member-phone"
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={memberForm.phone}
                  onChange={handleMemberChange}
                  required
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="member-email">
                  EMAIL
                </label>

                <input
                  id="member-email"
                  name="email"
                  type="email"
                  placeholder="member@example.com"
                  value={memberForm.email}
                  onChange={handleMemberChange}
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="member-age">
                  AGE
                </label>

                <input
                  id="member-age"
                  name="age"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="25"
                  value={memberForm.age}
                  onChange={handleMemberChange}
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="member-gender">
                  GENDER
                </label>

                <select
                  id="member-gender"
                  name="gender"
                  value={memberForm.gender}
                  onChange={handleMemberChange}
                >

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* =========================
                  PUJA OFFER
              ========================= */}

              <div className="admin-login-field">

                <label htmlFor="membership-offer">
                  PUJA OFFER
                </label>

                <select
                  id="membership-offer"
                  name="membershipOffer"
                  value={memberForm.membershipOffer}
                  onChange={handleOfferChange}
                >

                  <option value="">
                    No Offer
                  </option>

                  {offers
                    .filter(
                      (offer) => offer.isActive
                    )
                    .map((offer) => (

                      <option
                        key={offer._id}
                        value={offer._id}
                      >
                        {offer.name} — ₹
                        {Number(
                          offer.offerPrice || 0
                        ).toLocaleString('en-IN')}
                      </option>

                    ))}

                </select>

              </div>


              <div className="admin-login-field">

                <label htmlFor="start-date">
                  MEMBERSHIP START DATE
                </label>

                <input
                  id="start-date"
                  name="membershipStartDate"
                  type="date"
                  value={
                    memberForm.membershipStartDate
                  }
                  onChange={handleMemberChange}
                  required
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="end-date">
                  MEMBERSHIP END DATE
                </label>

                <input
                  id="end-date"
                  name="membershipEndDate"
                  type="date"
                  value={
                    memberForm.membershipEndDate
                  }
                  onChange={handleMemberChange}
                  required
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="member-amount">
                  MEMBERSHIP AMOUNT
                </label>

                <input
                  id="member-amount"
                  name="amount"
                  type="number"
                  min="0"
                  placeholder="1500"
                  value={memberForm.amount}
                  onChange={handleMemberChange}
                  required
                />

              </div>


              {memberFormError && (
                <div className="admin-login-error">
                  {memberFormError}
                </div>
              )}


              {editMemberError && (
                <div className="admin-login-error">
                  {editMemberError}
                </div>
              )}


              {memberSuccess && (
                <div className="admin-member-success">
                  {memberSuccess}
                </div>
              )}


              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => {

                    setShowAddMember(false);
                    setEditingMember(null);

                    setMemberFormError('');
                    setEditMemberError('');
                    setMemberSuccess('');

                  }}
                >
                  CANCEL
                </button>


                <button
                  type="submit"
                  className="admin-add-submit-btn"
                  disabled={
                    addingMember ||
                    updatingMember
                  }
                >
                  {addingMember ||
                  updatingMember

                    ? editingMember
                      ? 'UPDATING MEMBER...'
                      : 'ADDING MEMBER...'

                    : editingMember
                      ? 'UPDATE MEMBER →'
                      : 'ADD MEMBER →'}
                </button>

              </div>

            </form>

          </div>

        )}


        {/* =========================
            MEMBER SEARCH & FILTER
        ========================= */}

        {!membersLoading &&
          !membersError &&
          members.length > 0 && (

            <div className="admin-member-filters">

              <input
                type="text"
                placeholder="Search by name or phone..."
                value={memberSearch}
                onChange={(e) =>
                  setMemberSearch(e.target.value)
                }
              />

              <select
                value={memberStatusFilter}
                onChange={(e) =>
                  setMemberStatusFilter(e.target.value)
                }
              >

                <option value="All">
                  All Members
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Expired">
                  Expired
                </option>

              </select>

            </div>

          )}


        {membersLoading && (
          <div className="admin-message">
            Loading members...
          </div>
        )}


        {!membersLoading &&
          membersError && (

            <div className="admin-message admin-error">
              {membersError}
            </div>

          )}


        {!membersLoading &&
          !membersError &&
          members.length === 0 && (

            <div className="admin-message">
              No members found for the selected branch.
            </div>

          )}


        {!membersLoading &&
          !membersError &&
          filteredMembers.length > 0 && (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>
                    <th>#</th>
                    <th>NAME</th>
                    <th>PHONE</th>
                    <th>PUJA OFFER</th>
                    <th>AMOUNT</th>
                    <th>START</th>
                    <th>END</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>

                </thead>


                <tbody>

                  {filteredMembers.map(
                    (member, index) => (

                      <tr
                        key={
                          member._id ||
                          index
                        }
                      >

                        <td>
                          {String(
                            index + 1
                          ).padStart(2, '0')}
                        </td>

                        <td>
                          <strong>
                            {member.name}
                          </strong>
                        </td>

                        <td>
                          {member.phone}
                        </td>

                        <td>
                          <span className="goal-badge">
                            {member.membershipOffer?.name ||
                              'NO OFFER'}
                          </span>
                        </td>

                        <td>
                          ₹
                          {Number(
                            member.amount
                          ).toLocaleString(
                            'en-IN'
                          )}
                        </td>

                        <td>
                          {member.membershipStartDate
                            ? new Date(
                                member.membershipStartDate
                              ).toLocaleDateString(
                                'en-IN'
                              )
                            : '-'}
                        </td>

                        <td>
                          {member.membershipEndDate
                            ? new Date(
                                member.membershipEndDate
                              ).toLocaleDateString(
                                'en-IN'
                              )
                            : '-'}
                        </td>

                        <td>
                          <span className="goal-badge">
                            {member.status}
                          </span>
                        </td>

                        <td>

                          <button
                            type="button"
                            className="admin-view-btn"
                            onClick={() =>
                              navigate(
                                `/admin/members/${member._id}`
                              )
                            }
                          >
                            VIEW
                          </button>

                          <button
                            type="button"
                            className="admin-edit-btn"
                            onClick={() =>
                              handleEditMember(
                                member
                              )
                            }
                          >
                            EDIT
                          </button>

                          <button
                            type="button"
                            className="admin-delete-btn"
                            onClick={() =>
                              handleDeleteMember(
                                member._id
                              )
                            }
                          >
                            DELETE
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </section>


      {!membersLoading &&
        !membersError &&
        members.length > 0 &&
        filteredMembers.length === 0 && (

          <div className="admin-message">
            No members match your search or filter.
          </div>

        )}


      {/* =====================================================
    DAILY / WEEKLY ACCESS
===================================================== */}

<section
  className="admin-enquiries"
  style={{ marginBottom: '28px' }}
>

  {/* =================================================
      SECTION HEADER
  ================================================= */}

  <div className="admin-section-heading">

    <div>

      <span className="section-tag">
        ACCESS PRODUCTS
      </span>

      <h2>
        DAILY / WEEKLY <span>ACCESS.</span>
      </h2>

      <p>
        Manage one-day and seven-day access products
        branch by branch.
      </p>

    </div>


    <div className="admin-section-actions">

      <span className="admin-count">
        {accessPasses.length} ACCESS PASSES
      </span>

      <button
        type="button"
        className="admin-add-btn"
        onClick={openCreateAccessPass}
      >
        + ADD ACCESS
      </button>

    </div>

  </div>


  {/* =================================================
      ERROR
  ================================================= */}

  {accessPassesError && (
    <div className="admin-message admin-error">
      {accessPassesError}
    </div>
  )}


  {/* =================================================
      LOADING
  ================================================= */}

  {accessPassesLoading && (
    <div className="admin-message">
      Loading access products...
    </div>
  )}


  {/* =================================================
      EMPTY STATE
  ================================================= */}

  {!accessPassesLoading &&
    accessPasses.length === 0 && (

      <div className="admin-message">

        No Daily or Weekly access products found
        for this branch.

      </div>

    )}


  {/* =================================================
      ACCESS PRODUCT CARDS
  ================================================= */}

  {!accessPassesLoading &&
    accessPasses.length > 0 && (

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(280px,1fr))',
          gap: '20px',
        }}
      >

        {accessPasses.map((pass) => {

          const isWeekly =
            pass.passType === 'Weekly Access' ||
            Number(pass.durationDays) === 7;

          const passName = isWeekly
            ? 'Weekly Access'
            : 'Daily Access';

          const duration =
            Number(pass.durationDays) ||
            (isWeekly ? 7 : 1);

          const defaultDescription = isWeekly
            ? 'Stay consistent with 7 days of full access to all gym facilities'
            : 'Perfect for those who want to stay active with flexible short term access';

          const description =
            String(pass.description || '').trim() ||
            defaultDescription;

          return (

            <article
              key={pass._id}
              style={{
                padding: '24px',
                borderRadius: '18px',
                border:
                  '1px solid rgba(255,255,255,.10)',
                background:
                  'linear-gradient(145deg,#17171e,#0d0d12)',
                opacity:
                  pass.isActive ? 1 : 0.62,
                position: 'relative',
                overflow: 'hidden',
              }}
            >

              {/* =====================================
                  CARD HEADER
              ===================================== */}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >

                <div>

                  <span className="section-tag">
                    {getBranchLabel(
                      pass.gymBranch
                    )}
                  </span>

                  <h3
                    style={{
                      margin:
                        '10px 0 5px',
                      fontSize: '26px',
                      lineHeight: '1.1',
                    }}
                  >
                    {passName}
                  </h3>

                </div>


                <span className="goal-badge">
                  {pass.isActive
                    ? 'ACTIVE'
                    : 'INACTIVE'}
                </span>

              </div>


              {/* =====================================
                  PRICE
              ===================================== */}

              <div
                style={{
                  marginTop: '20px',
                  marginBottom: '16px',
                }}
              >

                <small
                  style={{
                    opacity: 0.6,
                    display: 'block',
                    marginBottom: '5px',
                  }}
                >
                  ACCESS PRICE
                </small>

                <strong
                  style={{
                    display: 'block',
                    fontSize: '34px',
                    lineHeight: '1',
                  }}
                >
                  ₹
                  {Number(
                    pass.price || 0
                  ).toLocaleString('en-IN')}
                </strong>

              </div>


              {/* =====================================
                  DURATION + TYPE
              ===================================== */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: '12px',
                  marginBottom: '18px',
                }}
              >

                <div
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background:
                      'rgba(255,255,255,.035)',
                  }}
                >

                  <small
                    style={{
                      opacity: 0.6,
                      display: 'block',
                    }}
                  >
                    DURATION
                  </small>

                  <strong
                    style={{
                      display: 'block',
                      fontSize: '19px',
                      marginTop: '4px',
                    }}
                  >
                    {duration}{' '}
                    {duration === 1
                      ? 'DAY'
                      : 'DAYS'}
                  </strong>

                </div>


                <div
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background:
                      'rgba(255,255,255,.035)',
                  }}
                >

                  <small
                    style={{
                      opacity: 0.6,
                      display: 'block',
                    }}
                  >
                    ACCESS TYPE
                  </small>

                  <strong
                    style={{
                      display: 'block',
                      fontSize: '16px',
                      marginTop: '6px',
                    }}
                  >
                    {isWeekly
                      ? '7 DAYS'
                      : '1 DAY'}
                  </strong>

                </div>

              </div>


              {/* =====================================
                  DESCRIPTION
              ===================================== */}

              <p
                style={{
                  minHeight: '66px',
                  color: '#aaa',
                  lineHeight: '1.55',
                  margin:
                    '0 0 20px',
                }}
              >
                {description}
              </p>


              {/* =====================================
                  ACTIONS
              ===================================== */}

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >

                <button
                  type="button"
                  className="admin-edit-btn"
                  onClick={() =>
                    openEditAccessPass(
                      pass
                    )
                  }
                >
                  EDIT
                </button>

                <button
                  type="button"
                  className="admin-add-btn"
                  onClick={() =>
                    handleToggleAccessPass(
                      pass
                    )
                  }
                >
                  {pass.isActive
                    ? 'DEACTIVATE'
                    : 'ACTIVATE'}
                </button>

              </div>

            </article>

          );

        })}

      </div>

    )}


  {/* =================================================
      ADD / EDIT ACCESS FORM
  ================================================= */}

  {showAccessPassForm && (

    <form
      onSubmit={handleSaveAccessPass}
      style={{
        marginTop: '22px',
        padding: '22px',
        borderRadius: '18px',
        border:
          '1px solid rgba(255,102,0,.25)',
        background:
          'linear-gradient(145deg,rgba(255,102,0,.07),rgba(255,255,255,.015))',
      }}
    >

      <div className="admin-form-heading">

        <span className="section-tag">

          {editingAccessPass
            ? 'EDIT ACCESS'
            : 'NEW ACCESS'}

        </span>

        <h3>

          {editingAccessPass
            ? 'EDIT '
            : 'ADD '}

          <span>
            ACCESS.
          </span>

        </h3>

      </div>


      {/* FORM ERROR */}

      {accessPassFormError && (
        <div className="admin-message admin-error">
          {accessPassFormError}
        </div>
      )}


      {/* FORM FIELDS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(210px,1fr))',
          gap: '14px',
        }}
      >

        {/* ACCESS TYPE */}

        <div className="admin-login-field">

          <label>
            ACCESS TYPE
          </label>

          <select
            name="passType"
            value={
              accessPassForm.passType
            }
            onChange={
              handleAccessPassChange
            }
          >

            <option value="Daily Access">
              Daily Access
            </option>

            <option value="Weekly Access">
              Weekly Access
            </option>

          </select>

        </div>


        {/* PRICE */}

        <div className="admin-login-field">

          <label>
            PRICE (₹)
          </label>

          <input
            name="price"
            type="number"
            min="0"
            value={
              accessPassForm.price
            }
            onChange={
              handleAccessPassChange
            }
            placeholder="200"
            required
          />

        </div>


        {/* BRANCH */}

        {isMainAdmin && (

          <div className="admin-login-field">

            <label>
              BRANCH
            </label>

            <select
              name="gymBranch"
              value={
                accessPassForm.gymBranch
              }
              onChange={
                handleAccessPassChange
              }
            >

              <option value="Kalyanpur">
                Kalyanpur
              </option>

              <option value="Gopalpur">
                Gopalpur
              </option>

            </select>

          </div>

        )}


        {/* DESCRIPTION */}

        <div
          className="admin-login-field"
          style={{
            gridColumn:
              '1 / -1',
          }}
        >

          <label>
            DESCRIPTION
          </label>

          <textarea
            name="description"
            rows="3"
            value={
              accessPassForm.description
            }
            onChange={
              handleAccessPassChange
            }
            placeholder={
              accessPassForm.passType ===
              'Weekly Access'
                ? 'Stay consistent with 7 days of full access to all gym facilities'
                : 'Perfect for those who want to stay active with flexible short term access'
            }
          />

        </div>

      </div>


      {/* ACTIVE */}

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          marginTop: '14px',
        }}
      >

        <input
          type="checkbox"
          name="isActive"
          checked={
            accessPassForm.isActive
          }
          onChange={
            handleAccessPassChange
          }
        />

        ACTIVE

      </label>


      {/* FORM ACTIONS */}

      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginTop: '18px',
        }}
      >

        <button
          type="submit"
          className="admin-add-btn"
          disabled={
            savingAccessPass
          }
        >

          {savingAccessPass
            ? 'SAVING...'
            : editingAccessPass
              ? 'UPDATE ACCESS'
              : 'CREATE ACCESS'}

        </button>


        <button
          type="button"
          className="admin-edit-btn"
          onClick={() => {

            setShowAccessPassForm(
              false
            );

            setEditingAccessPass(
              null
            );

            setAccessPassFormError(
              ''
            );

          }}
        >
          CANCEL
        </button>

      </div>

    </form>

  )}

</section>


      {/* =====================================================
          PUJA OFFERS ONLY
      ===================================================== */}

      <section
        className="admin-enquiries"
        style={{ marginBottom: '28px' }}
      >

        <div className="admin-section-heading">

          <div>

            <span className="section-tag">
              PUJA OFFERS
            </span>

            <h2>
              PUJA <span>OFFERS.</span>
            </h2>

            <p>
              Only real Puja offers are managed here.
              Seasonal sample offers are not created
              by this dashboard.
            </p>

          </div>


          <div className="admin-section-actions">

            <span className="admin-count">
              {offers.length} PUJA OFFERS
            </span>

            <button
              type="button"
              className="admin-add-btn"
              onClick={openPujaOfferForm}
              disabled={
                isMainAdmin &&
                selectedBranchId === 'all'
              }
            >
              + ADD PUJA OFFER
            </button>

          </div>

        </div>


        {offersLoading && (
          <div className="admin-message">
            Loading Puja offers...
          </div>
        )}


        {!offersLoading &&
          offersError && (

            <div className="admin-message admin-error">
              {offersError}
            </div>

          )}


        {!offersLoading &&
          !offersError &&
          offers.length === 0 && (

            <div className="admin-message">
              No Puja offers found for the current branch.
            </div>

          )}


        {!offersLoading &&
          !offersError &&
          offers.length > 0 && (

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit,minmax(250px,1fr))',
                gap: '18px',
              }}
            >

              {offers.map((offer) => (

                <article
                  key={offer._id}
                  style={{
                    padding: '24px',
                    borderRadius: '18px',
                    border:
                      '1px solid rgba(255,255,255,.10)',
                    background:
                      'linear-gradient(145deg,#15151c,#0d0d12)',
                    opacity:
                      offer.isActive ? 1 : 0.62,
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '15px',
                    }}
                  >

                    <span className="section-tag">
                      {getBranchLabel(
                        offer.gymBranch
                      )}
                    </span>

                    <span className="goal-badge">
                      {offer.isActive
                        ? 'ACTIVE'
                        : 'INACTIVE'}
                    </span>

                  </div>


                  <h3
                    style={{
                      margin: '0 0 12px',
                      fontSize: '26px',
                    }}
                  >
                    {offer.name}
                  </h3>


                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '1fr 1fr',
                      gap: '12px',
                      margin: '15px 0',
                    }}
                  >

                    <div>

                      <small style={{ opacity: 0.6 }}>
                        DURATION
                      </small>

                      <strong
                        style={{
                          display: 'block',
                          fontSize: 20,
                        }}
                      >
                        {offer.durationMonths}{' '}
                        MONTH
                        {Number(
                          offer.durationMonths
                        ) === 1
                          ? ''
                          : 'S'}
                      </strong>

                    </div>


                    <div>

                      <small style={{ opacity: 0.6 }}>
                        OFFER PRICE
                      </small>

                      <strong
                        style={{
                          display: 'block',
                          fontSize: 20,
                        }}
                      >
                        ₹
                        {Number(
                          offer.offerPrice || 0
                        ).toLocaleString('en-IN')}
                      </strong>

                    </div>

                  </div>


                  <p
                    style={{
                      minHeight: 55,
                      color: '#aaa',
                      lineHeight: 1.5,
                    }}
                  >
                    {offer.description ||
                      'No description added.'}
                  </p>


                  {Array.isArray(
                    offer.benefits
                  ) &&
                    offer.benefits.length > 0 && (

                      <ul
                        style={{
                          margin: '0 0 18px',
                          paddingLeft: '18px',
                          color: '#bbb',
                          lineHeight: 1.7,
                        }}
                      >

                        {offer.benefits
                          .slice(0, 5)
                          .map(
                            (
                              benefit,
                              index
                            ) => (

                              <li
                                key={`${offer._id}-${index}`}
                              >
                                {benefit}
                              </li>

                            )
                          )}

                      </ul>

                    )}


                  <button
                    type="button"
                    className="admin-add-btn"
                    onClick={() =>
                      handleToggleOfferStatus(
                        offer
                      )
                    }
                  >
                    {offer.isActive
                      ? 'DEACTIVATE'
                      : 'ACTIVATE'}
                  </button>

                </article>

              ))}

            </div>

          )}


        {showPujaOfferForm && (

          <form
            onSubmit={handleCreatePujaOffer}
            style={{
              marginTop: '22px',
              padding: '22px',
              borderRadius: '18px',
              border:
                '1px solid rgba(255,102,0,.25)',
              background:
                'linear-gradient(145deg,rgba(255,102,0,.07),rgba(255,255,255,.015))',
            }}
          >

            <div className="admin-form-heading">

              <span className="section-tag">
                NEW PUJA OFFER
              </span>

              <h3>
                CREATE <span>PUJA OFFER.</span>
              </h3>

            </div>


            {pujaOfferError && (
              <div className="admin-message admin-error">
                {pujaOfferError}
              </div>
            )}


            {pujaOfferSuccess && (
              <div className="admin-message">
                {pujaOfferSuccess}
              </div>
            )}


            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit,minmax(210px,1fr))',
                gap: '14px',
              }}
            >

              <div className="admin-login-field">

                <label>
                  OFFER NAME
                </label>

                <input
                  name="name"
                  value={pujaOfferForm.name}
                  onChange={handlePujaOfferChange}
                  required
                />

              </div>


              <div className="admin-login-field">

                <label>
                  DURATION (MONTHS)
                </label>

                <input
                  name="durationMonths"
                  type="number"
                  min="1"
                  value={
                    pujaOfferForm.durationMonths
                  }
                  onChange={handlePujaOfferChange}
                  required
                />

              </div>


              <div className="admin-login-field">

                <label>
                  OFFER PRICE (₹)
                </label>

                <input
                  name="offerPrice"
                  type="number"
                  min="0"
                  value={
                    pujaOfferForm.offerPrice
                  }
                  onChange={handlePujaOfferChange}
                  required
                />

              </div>


              <div className="admin-login-field">

                <label>
                  START DATE
                </label>

                <input
                  name="startDate"
                  type="date"
                  value={
                    pujaOfferForm.startDate
                  }
                  onChange={handlePujaOfferChange}
                  required
                />

              </div>


              <div className="admin-login-field">

                <label>
                  END DATE
                </label>

                <input
                  name="endDate"
                  type="date"
                  value={
                    pujaOfferForm.endDate
                  }
                  onChange={handlePujaOfferChange}
                  required
                />

              </div>


              <div className="admin-login-field">

                <label>
                  IMAGE URL (OPTIONAL)
                </label>

                <input
                  name="image"
                  value={pujaOfferForm.image}
                  onChange={handlePujaOfferChange}
                  placeholder="https://..."
                />

              </div>


              <div
                className="admin-login-field"
                style={{
                  gridColumn: '1 / -1',
                }}
              >

                <label>
                  DESCRIPTION
                </label>

                <textarea
                  name="description"
                  rows="3"
                  value={
                    pujaOfferForm.description
                  }
                  onChange={handlePujaOfferChange}
                />

              </div>


              <div
                className="admin-login-field"
                style={{
                  gridColumn: '1 / -1',
                }}
              >

                <label>
                  BENEFITS — ONE PER LINE
                </label>

                <textarea
                  name="benefits"
                  rows="4"
                  value={
                    pujaOfferForm.benefits
                  }
                  onChange={handlePujaOfferChange}
                />

              </div>

            </div>


            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                marginTop: '14px',
              }}
            >

              <input
                type="checkbox"
                name="isActive"
                checked={
                  pujaOfferForm.isActive
                }
                onChange={
                  handlePujaOfferChange
                }
              />

              ACTIVE

            </label>


            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '18px',
              }}
            >

              <button
                type="submit"
                className="admin-add-btn"
                disabled={savingPujaOffer}
              >
                {savingPujaOffer
                  ? 'CREATING...'
                  : 'CREATE PUJA OFFER'}
              </button>

              <button
                type="button"
                className="admin-edit-btn"
                onClick={() => {

                  setShowPujaOfferForm(false);
                  setPujaOfferError('');

                }}
              >
                CANCEL
              </button>

            </div>

          </form>

        )}

      </section>

     {/* =====================================================
    STAFF MANAGEMENT
===================================================== */}

<section className="admin-staff-management">

  {/* STAFF HEADER */}
  <div className="staff-header">

    <div>
      <span className="staff-eyebrow">
        TEAM & ACCESS
      </span>

      <h2>
        STAFF <span>MANAGEMENT.</span>
      </h2>

      <p>
        {isMainAdmin
          ? 'Manage receptionist accounts, branch assignments and dashboard access.'
          : `View staff accounts available to ${selectedBranchName}.`}
        {selectedBranchId !== 'all'
          ? ` — ${selectedBranchName}`
          : ''}
      </p>
    </div>

    <div className="staff-header-stats">

      <div className="staff-stat-card">
        <span className="staff-stat-number">
          {staff.length}
        </span>

        <span className="staff-stat-label">
          TOTAL STAFF
        </span>
      </div>

      <div className="staff-stat-card">
        <span className="staff-stat-number staff-green">
          {
            staff.filter(
              (member) => member.status === 'active'
            ).length
          }
        </span>

        <span className="staff-stat-label">
          ACTIVE
        </span>
      </div>

    </div>

  </div>

  {/* MESSAGES */}

  {staffError && !selectedStaff && (
    <div className="staff-message staff-message-error">
      <span>!</span>
      {staffError}
    </div>
  )}

  {staffSuccess && (
    <div className="staff-message staff-message-success">
      <span>✓</span>
      {staffSuccess}
    </div>
  )}

  {/* MAIN STAFF AREA */}

  <div className="staff-layout">

    {/* ==========================================
        STAFF ACCOUNTS
    ========================================== */}

    <div className="staff-list-panel">

      <div className="staff-panel-heading">

        <div>
          <span className="staff-panel-label">
            TEAM
          </span>

          <h3>
            STAFF ACCOUNTS
          </h3>
        </div>

        <span className="staff-panel-count">
          {staff.length}
        </span>

      </div>

      {staff.length === 0 ? (

        <div className="staff-empty">
          <div className="staff-empty-icon">
            👤
          </div>

          <strong>
            No staff accounts
          </strong>

          <span>
            Staff accounts will appear here.
          </span>
        </div>

      ) : (

        <div className="staff-account-list">

          {staff.map((member) => {

            const initials = member.name
              ? member.name
                  .split(/\s+/)
                  .map((part) => part.charAt(0))
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'ST';

            const isSelected =
              selectedStaff?._id === member._id;

            const isActive =
              member.status === 'active';

            return (
              <button
                type="button"
                key={member._id}
                className={`staff-account ${
                  isSelected
                    ? 'staff-account-selected'
                    : ''
                }`}
                onClick={() => {
                  setSelectedStaff(member);

                  setPermissions(
                    normalizeStaffPermissions(member)
                  );

                  setStaffSuccess('');
                  setStaffError('');
                }}
              >

                {/* AVATAR */}

                <div className="staff-avatar">
                  {initials}
                </div>

                {/* INFO */}

                <div className="staff-account-info">

                  <strong>
                    {member.name || 'Staff Member'}
                  </strong>

                  <span className="staff-account-meta">
                    {member.email}
                  </span>

                  <span className="staff-account-meta">
                    BRANCH: {Array.isArray(member.gymBranches) && member.gymBranches.length > 0
                      ? member.gymBranches.join(' / ')
                      : member.gymBranch || 'NOT ASSIGNED'}
                  </span>

                  <span
                    className={`staff-status ${
                      isActive
                        ? 'staff-status-active'
                        : 'staff-status-inactive'
                    }`}
                  >
                    {isActive
                      ? 'ACTIVE'
                      : 'INACTIVE'}
                  </span>

                </div>

                {/* ARROW */}

                <span className="staff-account-arrow">
                  →
                </span>

              </button>
            );
          })}

        </div>

      )}

    </div>


    {/* ==========================================
        ACCESS CONTROL
    ========================================== */}

    <div className="staff-permission-panel">

      {!selectedStaff ? (

        <div className="staff-no-selection">

          <div className="staff-no-selection-icon">
            👤
          </div>

          <h3>
            SELECT A STAFF ACCOUNT
          </h3>

          <p>
            Select a staff member from the left
            to manage their permissions.
          </p>

        </div>

      ) : (

        <>

          {/* PROFILE HEADER */}

          <div className="staff-profile">

            <div className="staff-profile-main">

              <div className="staff-profile-identity">

                <div className="staff-profile-avatar">

                  {selectedStaff.name
                    ? selectedStaff.name
                        .split(/\s+/)
                        .map((part) =>
                          part.charAt(0)
                        )
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'ST'}

                </div>

                <div>

                  <span className="staff-panel-label">
                    STAFF PROFILE
                  </span>

                  <h3>
                    {selectedStaff.name}
                  </h3>

                  <p>
                    {selectedStaff.email}
                  </p>

                  <p className="staff-branch-label">
                    BRANCH: {Array.isArray(selectedStaff.gymBranches) && selectedStaff.gymBranches.length > 0
                      ? selectedStaff.gymBranches.join(' / ')
                      : selectedStaff.gymBranch || 'NOT ASSIGNED'}
                  </p>

                </div>

              </div>


              {/* ACCOUNT STATUS */}

              <div className="staff-profile-status">

                <span
                  className={`staff-profile-status-badge ${
                    selectedStaff.status === 'active'
                      ? 'staff-badge-active'
                      : 'staff-badge-inactive'
                  }`}
                >
                  <span className="staff-status-dot" />
                  {selectedStaff.status === 'active'
                    ? 'ACTIVE'
                    : 'INACTIVE'}
                </span>

                {isMainAdmin && (
                  <button
                    type="button"
                    className={`staff-status-button ${
                      selectedStaff.status === 'active'
                        ? 'staff-deactivate'
                        : 'staff-activate'
                    }`}
                    onClick={() =>
                      handleToggleStaffStatus(
                        selectedStaff
                      )
                    }
                  >
                    {selectedStaff.status === 'active'
                      ? 'DEACTIVATE'
                      : 'ACTIVATE'}
                  </button>
                )}

              </div>

            </div>


            {/* PERMISSION SUMMARY */}

            <div className="staff-permission-summary">

              <div>
                <span>
                  ACCESS LEVEL
                </span>

                <strong>
                  RECEPTIONIST
                </strong>
              </div>

              <div>
                <span>
                  PERMISSIONS
                </span>

                <strong>
                  {permissionCount}
                  <small>/18</small>
                </strong>
              </div>

              <div>
                <span>
                  ACCOUNT
                </span>

                <strong>
                  {selectedStaff.status === 'active'
                    ? 'ENABLED'
                    : 'DISABLED'}
                </strong>
              </div>

            </div>

          </div>


          {/* MAIN ADMIN BRANCH ASSIGNMENT */}

          {isMainAdmin && (
            <div
              style={{
                marginBottom: '22px',
                padding: '18px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,.10)',
                background: 'rgba(255,255,255,.025)',
              }}
            >
              <div className="staff-permission-heading" style={{ marginBottom: '14px' }}>
                <div>
                  <span className="staff-panel-label">
                    BRANCH ACCESS
                  </span>
                  <h3>
                    ASSIGN <span>BRANCHES.</span>
                  </h3>
                  <p>
                    Main admin only. Select every branch this staff account can access.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginBottom: '14px',
                }}
              >
                {GYM_BRANCHES.map((branch) => {
                  const checked = staffBranches.includes(branch._id);

                  return (
                    <label
                      key={branch._id}
                      className={`staff-permission-option ${
                        checked ? 'staff-permission-enabled' : ''
                      }`}
                      style={{ minWidth: '180px' }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setStaffBranches((current) =>
                            checked
                              ? current.filter((item) => item !== branch._id)
                              : [...current, branch._id]
                          );
                          setStaffError('');
                          setStaffSuccess('');
                        }}
                      />
                      <span className="staff-custom-check">
                        {checked ? '✓' : ''}
                      </span>
                      <span className="staff-permission-name">
                        {branch.name}
                      </span>
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                className="staff-save-button"
                onClick={handleAssignStaffBranches}
                disabled={savingStaffBranches}
              >
                {savingStaffBranches
                  ? 'SAVING...'
                  : 'SAVE BRANCH ASSIGNMENTS  →'}
              </button>
            </div>
          )}

          {/* PERMISSION HEADING */}

          <div className="staff-permission-heading">

            <div>

              <span className="staff-panel-label">
                ACCESS CONTROL
              </span>

              <h3>
                PERMISSION <span>CONTROL.</span>
              </h3>

              <p>
                {isMainAdmin
                  ? 'Choose exactly what this staff member can view, add, edit or delete.'
                  : 'Permissions are read-only for branch staff. The main admin controls access.'}
              </p>

            </div>

            <div className="staff-permission-total">

              <strong>
                {permissionCount}
              </strong>

              <span>
                ENABLED
              </span>

            </div>

          </div>


          {/* PERMISSION CARDS */}

          <div className="staff-permission-grid">

            {[
              {
                key: 'members',
                label: 'MEMBERS',
                icon: '👥',
                description:
                  'Member records and profiles',
                permissions: [
                  'view',
                  'add',
                  'edit',
                  'delete',
                ],
              },

              {
                key: 'payments',
                label: 'PAYMENTS',
                icon: '₹',
                description:
                  'Membership payments',
                permissions: [
                  'view',
                  'add',
                  'edit',
                  'delete',
                ],
              },

              {
                key: 'attendance',
                label: 'ATTENDANCE',
                icon: '✓',
                description:
                  'Member attendance',
                permissions: [
                  'view',
                  'add',
                  'edit',
                  'delete',
                ],
              },

              {
                key: 'workouts',
                label: 'WORKOUTS',
                icon: '⚡',
                description:
                  'Workout programmes',
                permissions: [
                  'view',
                  'add',
                  'edit',
                  'delete',
                ],
              },

              {
                key: 'enquiries',
                label: 'ENQUIRIES',
                icon: '✉',
                description:
                  'Member enquiries',
                permissions: [
                  'view',
                  'delete',
                ],
              },
            ].map((section) => {

              const enabledCount =
                Object.values(
                  permissions[section.key] || {}
                ).filter(Boolean).length;

              return (
                <div
                  className="staff-permission-card"
                  key={section.key}
                >

                  {/* CARD HEADER */}

                  <div className="staff-permission-card-header">

                    <div className="staff-permission-title">

                      <div className="staff-permission-icon">
                        {section.icon}
                      </div>

                      <div>
                        <strong>
                          {section.label}
                        </strong>

                        <span>
                          {section.description}
                        </span>
                      </div>

                    </div>

                    <div className="staff-permission-counter">
                      {enabledCount}/
                      {section.permissions.length}
                    </div>

                  </div>


                  {/* PERMISSION OPTIONS */}

                  <div className="staff-permission-options">

                    {section.permissions.map(
                      (permission) => {

                        const checked =
                          permissions[
                            section.key
                          ]?.[permission] || false;

                        return (
                          <label
                            key={permission}
                            className={`staff-permission-option ${
                              checked
                                ? 'staff-permission-enabled'
                                : ''
                            }`}
                          >

                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={!isMainAdmin}
                              onChange={() =>
                                handlePermissionChange(
                                  section.key,
                                  permission
                                )
                              }
                            />

                            <span className="staff-custom-check">
                              {checked ? '✓' : ''}
                            </span>

                            <span className="staff-permission-name">
                              {permission
                                .charAt(0)
                                .toUpperCase() +
                                permission.slice(1)}
                            </span>

                          </label>
                        );
                      }
                    )}

                  </div>

                </div>
              );
            })}

          </div>


          {/* SAVE */}

          {isMainAdmin ? (
            <div className="staff-save-area">
              <div className="staff-save-note">
                <span>●</span>
                Changes are saved to this account.
              </div>

              <button
                type="button"
                className="staff-save-button"
                onClick={handleSavePermissions}
                disabled={savingPermissions}
              >
                {savingPermissions
                  ? 'SAVING...'
                  : 'SAVE PERMISSIONS  →'}
              </button>
            </div>
          ) : (
            <div className="staff-save-area">
              <div className="staff-save-note">
                <span>●</span>
                Read-only view. Main admin manages permissions and branch assignments.
              </div>
            </div>
          )}

        </>

      )}

    </div>

  </div>

</section>

      {/* =====================================================
          PAYMENT MANAGEMENT
      ===================================================== */}

      <section className="admin-enquiries">

        <div className="admin-section-heading">

          <div>

            <span className="section-tag">
              FINANCE
            </span>

            <h2>
              PAYMENT <span>MANAGEMENT.</span>
            </h2>

            <p>
              Track membership payments, invoices and
              transaction status.
            </p>

          </div>


          <div className="admin-section-actions">

            <span className="admin-count">
              {payments.length} PAYMENTS
            </span>

            <button
              type="button"
              className="admin-add-btn"
              onClick={() => {

                setShowAddPayment(
                  (current) => !current
                );

                setEditingPayment(null);

                setPaymentFormError('');
                setEditPaymentError('');
                setPaymentSuccess('');

              }}
            >
              {showAddPayment
                ? '✕ CLOSE'
                : '+ ADD PAYMENT'}
            </button>

          </div>

        </div>


        {showAddPayment && (

          <div className="admin-add-member-card">

            <div className="admin-form-heading">

              <span className="section-tag">
                {editingPayment
                  ? 'EDIT PAYMENT'
                  : 'NEW PAYMENT'}
              </span>

              <h3>
                {editingPayment
                  ? 'EDIT '
                  : 'ADD '}

                <span>
                  PAYMENT.
                </span>
              </h3>

            </div>


            <form
              className="admin-member-form"
              onSubmit={
                editingPayment
                  ? handleUpdatePayment
                  : handleAddPayment
              }
            >

              <div className="admin-login-field">

                <label htmlFor="payment-member">
                  MEMBER
                </label>

                <select
                  id="payment-member"
                  name="member"
                  value={paymentForm.member}
                  onChange={handlePaymentChange}
                  required
                >

                  <option value="">
                    Select member
                  </option>

                  {members.map((member) => (

                    <option
                      key={member._id}
                      value={member._id}
                    >
                      {member.name} — {member.phone}
                    </option>

                  ))}

                </select>

              </div>


              <div className="admin-login-field">

                <label htmlFor="invoice-number">
                  INVOICE NUMBER
                </label>

                <input
                  id="invoice-number"
                  name="invoiceNumber"
                  type="text"
                  placeholder="INV-001"
                  value={
                    paymentForm.invoiceNumber
                  }
                  onChange={handlePaymentChange}
                  required
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="payment-amount">
                  AMOUNT
                </label>

                <input
                  id="payment-amount"
                  name="amount"
                  type="number"
                  min="0"
                  placeholder="1500"
                  value={paymentForm.amount}
                  onChange={handlePaymentChange}
                  required
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="payment-method">
                  PAYMENT METHOD
                </label>

                <select
                  id="payment-method"
                  name="paymentMethod"
                  value={
                    paymentForm.paymentMethod
                  }
                  onChange={handlePaymentChange}
                >

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Card">
                    Card
                  </option>

                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>

                </select>

              </div>


              <div className="admin-login-field">

                <label htmlFor="payment-date">
                  PAYMENT DATE
                </label>

                <input
                  id="payment-date"
                  name="paymentDate"
                  type="date"
                  value={
                    paymentForm.paymentDate
                  }
                  onChange={handlePaymentChange}
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="payment-status">
                  STATUS
                </label>

                <select
                  id="payment-status"
                  name="status"
                  value={paymentForm.status}
                  onChange={handlePaymentChange}
                >

                  <option value="Paid">
                    Paid
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Failed">
                    Failed
                  </option>

                </select>

              </div>


              <div className="admin-login-field">

                <label htmlFor="payment-notes">
                  NOTES
                </label>

                <input
                  id="payment-notes"
                  name="notes"
                  type="text"
                  placeholder="Optional payment notes"
                  value={paymentForm.notes}
                  onChange={handlePaymentChange}
                />

              </div>


              {paymentFormError && (
                <div className="admin-login-error">
                  {paymentFormError}
                </div>
              )}


              {editPaymentError && (
                <div className="admin-login-error">
                  {editPaymentError}
                </div>
              )}


              {paymentSuccess && (
                <div className="admin-member-success">
                  {paymentSuccess}
                </div>
              )}


              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => {

                    setShowAddPayment(false);
                    setEditingPayment(null);

                    setPaymentFormError('');
                    setEditPaymentError('');
                    setPaymentSuccess('');

                  }}
                >
                  CANCEL
                </button>


                <button
                  type="submit"
                  className="admin-add-submit-btn"
                  disabled={
                    addingPayment ||
                    updatingPayment
                  }
                >
                  {addingPayment ||
                  updatingPayment

                    ? editingPayment
                      ? 'UPDATING PAYMENT...'
                      : 'ADDING PAYMENT...'

                    : editingPayment
                      ? 'UPDATE PAYMENT →'
                      : 'ADD PAYMENT →'}
                </button>

              </div>

            </form>

          </div>

        )}


        {paymentsLoading && (
          <div className="admin-message">
            Loading payments...
          </div>
        )}


        {!paymentsLoading &&
          paymentsError && (

            <div className="admin-message admin-error">
              {paymentsError}
            </div>

          )}


        {!paymentsLoading &&
          !paymentsError &&
          payments.length === 0 && (

            <div className="admin-message">
              No payments found.
            </div>

          )}


        {!paymentsLoading &&
          !paymentsError &&
          payments.length > 0 && (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>
                    <th>#</th>
                    <th>MEMBER</th>
                    <th>INVOICE</th>
                    <th>AMOUNT</th>
                    <th>METHOD</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>

                </thead>


                <tbody>

                  {payments.map(
                    (payment, index) => (

                      <tr
                        key={
                          payment._id ||
                          index
                        }
                      >

                        <td>
                          {String(
                            index + 1
                          ).padStart(2, '0')}
                        </td>


                        <td>
                          <strong>
                            {payment.member?.name ||
                              'Unknown Member'}
                          </strong>
                        </td>


                        <td>
                          {payment.invoiceNumber}
                        </td>


                        <td>
                          <strong>
                            ₹
                            {Number(
                              payment.amount
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </strong>
                        </td>


                        <td>
                          <span className="goal-badge">
                            {payment.paymentMethod}
                          </span>
                        </td>


                        <td>
                          {payment.paymentDate
                            ? new Date(
                                payment.paymentDate
                              ).toLocaleDateString(
                                'en-IN'
                              )
                            : '-'}
                        </td>


                        <td>
                          <span className="goal-badge">
                            {payment.status}
                          </span>
                        </td>


                        <td>

                          <div className="admin-table-actions">

                            <button
                              type="button"
                              className="admin-view-btn"
                              onClick={() =>
                                navigate(
                                  `/admin/payments/${payment._id}/receipt`
                                )
                              }
                            >
                              RECEIPT
                            </button>


                            <button
                              type="button"
                              className="admin-edit-btn"
                              onClick={() =>
                                handleEditPayment(
                                  payment
                                )
                              }
                            >
                              EDIT
                            </button>


                            <button
                              type="button"
                              className="admin-delete-btn"
                              onClick={() =>
                                handleDeletePayment(
                                  payment._id
                                )
                              }
                            >
                              DELETE
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </section>


      {/* =====================================================
          ATTENDANCE MANAGEMENT
      ===================================================== */}

      <section className="admin-enquiries">

        <div className="admin-section-heading">

          <div>

            <span className="section-tag">
              GYM ACTIVITY
            </span>

            <h2>
              ATTENDANCE <span>MANAGEMENT.</span>
            </h2>

            <p>
              Monitor member attendance, check-in and
              check-out activity.
            </p>

          </div>


          <div className="admin-section-actions">

            <span className="admin-count">
              {attendance.length} RECORDS
            </span>


            <button
              type="button"
              className="admin-add-btn"
              onClick={() => {

                setShowAddAttendance(
                  (current) => !current
                );

                setEditingAttendance(null);

                setAttendanceFormError('');
                setEditAttendanceError('');
                setAttendanceSuccess('');

              }}
            >
              {showAddAttendance
                ? '✕ CLOSE'
                : '+ MARK ATTENDANCE'}
            </button>

          </div>

        </div>


        {showAddAttendance && (

          <div className="admin-add-member-card">

            <div className="admin-form-heading">

              <span className="section-tag">
                {editingAttendance
                  ? 'EDIT ATTENDANCE'
                  : 'NEW ATTENDANCE'}
              </span>

              <h3>
                {editingAttendance
                  ? 'EDIT '
                  : 'MARK '}

                <span>
                  ATTENDANCE.
                </span>
              </h3>

            </div>


            <form
              className="admin-member-form"
              onSubmit={
                editingAttendance
                  ? handleUpdateAttendance
                  : handleMarkAttendance
              }
            >

              <div className="admin-login-field">

                <label htmlFor="attendance-member">
                  MEMBER
                </label>

                <select
                  id="attendance-member"
                  name="member"
                  value={
                    attendanceForm.member
                  }
                  onChange={
                    handleAttendanceChange
                  }
                  required
                >

                  <option value="">
                    Select member
                  </option>

                  {members.map((member) => (

                    <option
                      key={member._id}
                      value={member._id}
                    >
                      {member.name} — {member.phone}
                    </option>

                  ))}

                </select>

              </div>


              <div className="admin-login-field">

                <label htmlFor="attendance-date">
                  DATE
                </label>

                <input
                  id="attendance-date"
                  name="date"
                  type="date"
                  value={
                    attendanceForm.date
                  }
                  onChange={
                    handleAttendanceChange
                  }
                  required
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="check-in-time">
                  CHECK-IN TIME
                </label>

                <input
                  id="check-in-time"
                  name="checkInTime"
                  type="time"
                  value={
                    attendanceForm.checkInTime
                  }
                  onChange={
                    handleAttendanceChange
                  }
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="check-out-time">
                  CHECK-OUT TIME
                </label>

                <input
                  id="check-out-time"
                  name="checkOutTime"
                  type="time"
                  value={
                    attendanceForm.checkOutTime
                  }
                  onChange={
                    handleAttendanceChange
                  }
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="attendance-status">
                  STATUS
                </label>

                <select
                  id="attendance-status"
                  name="status"
                  value={
                    attendanceForm.status
                  }
                  onChange={
                    handleAttendanceChange
                  }
                >

                  <option value="Present">
                    Present
                  </option>

                  <option value="Absent">
                    Absent
                  </option>

                </select>

              </div>


              {attendanceFormError && (
                <div className="admin-login-error">
                  {attendanceFormError}
                </div>
              )}


              {editAttendanceError && (
                <div className="admin-login-error">
                  {editAttendanceError}
                </div>
              )}


              {attendanceSuccess && (
                <div className="admin-member-success">
                  {attendanceSuccess}
                </div>
              )}


              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => {

                    setShowAddAttendance(false);
                    setEditingAttendance(null);

                    setAttendanceFormError('');
                    setEditAttendanceError('');
                    setAttendanceSuccess('');

                  }}
                >
                  CANCEL
                </button>


                <button
                  type="submit"
                  className="admin-add-submit-btn"
                  disabled={
                    addingAttendance ||
                    updatingAttendance
                  }
                >
                  {addingAttendance ||
                  updatingAttendance

                    ? editingAttendance
                      ? 'UPDATING ATTENDANCE...'
                      : 'MARKING ATTENDANCE...'

                    : editingAttendance
                      ? 'UPDATE ATTENDANCE →'
                      : 'MARK ATTENDANCE →'}
                </button>

              </div>

            </form>

          </div>

        )}


        {attendanceLoading && (
          <div className="admin-message">
            Loading attendance...
          </div>
        )}


        {!attendanceLoading &&
          attendanceError && (

            <div className="admin-message admin-error">
              {attendanceError}
            </div>

          )}


        {!attendanceLoading &&
          !attendanceError &&
          attendance.length === 0 && (

            <div className="admin-message">
              No attendance records found.
            </div>

          )}


        {!attendanceLoading &&
          !attendanceError &&
          attendance.length > 0 && (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>
                    <th>#</th>
                    <th>MEMBER</th>
                    <th>DATE</th>
                    <th>CHECK-IN</th>
                    <th>CHECK-OUT</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>

                </thead>


                <tbody>

                  {attendance.map(
                    (record, index) => (

                      <tr
                        key={
                          record._id ||
                          index
                        }
                      >

                        <td>
                          {String(
                            index + 1
                          ).padStart(2, '0')}
                        </td>


                        <td>
                          <strong>
                            {record.member?.name ||
                              'Unknown Member'}
                          </strong>
                        </td>


                        <td>
                          {record.date
                            ? new Date(
                                record.date
                              ).toLocaleDateString(
                                'en-IN'
                              )
                            : '-'}
                        </td>


                        <td>
                          {record.checkInTime
                            ? new Date(
                                record.checkInTime
                              ).toLocaleTimeString(
                                'en-IN',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )
                            : '-'}
                        </td>


                        <td>
                          {record.checkOutTime
                            ? new Date(
                                record.checkOutTime
                              ).toLocaleTimeString(
                                'en-IN',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )
                            : '-'}
                        </td>


                        <td>
                          <span className="goal-badge">
                            {record.status}
                          </span>
                        </td>


                        <td>

                          <div className="admin-table-actions">

                            <button
                              type="button"
                              className="admin-edit-btn"
                              onClick={() =>
                                handleEditAttendance(
                                  record
                                )
                              }
                            >
                              EDIT
                            </button>


                            <button
                              type="button"
                              className="admin-delete-btn"
                              onClick={() =>
                                handleDeleteAttendance(
                                  record._id
                                )
                              }
                            >
                              DELETE
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </section>


      {/* =====================================================
          WORKOUT MANAGEMENT
      ===================================================== */}

      <section className="admin-enquiries">

        <div className="admin-section-heading">

          <div>

            <span className="section-tag">
              TRAINING
            </span>

            <h2>
              WORKOUT <span>MANAGEMENT.</span>
            </h2>

            <p>
              Create and manage personalised training
              programmes for members.
            </p>

          </div>


          <div className="admin-section-actions">

            <span className="admin-count">
              {workouts.length} WORKOUTS
            </span>


            <button
              type="button"
              className="admin-add-btn"
              onClick={() => {

                setShowAddWorkout(
                  (current) => !current
                );

                setEditingWorkout(null);

                resetWorkoutForm();

                setWorkoutFormError('');
                setEditWorkoutError('');
                setWorkoutSuccess('');

              }}
            >
              {showAddWorkout
                ? '✕ CLOSE'
                : '+ ADD WORKOUT'}
            </button>

          </div>

        </div>


        {showAddWorkout && (

          <div className="admin-add-member-card">

            <div className="admin-form-heading">

              <span className="section-tag">
                {editingWorkout
                  ? 'EDIT WORKOUT'
                  : 'NEW WORKOUT'}
              </span>

              <h3>
                {editingWorkout
                  ? 'EDIT '
                  : 'ADD '}

                <span>
                  WORKOUT.
                </span>
              </h3>

            </div>


            <form
              className="admin-member-form"
              onSubmit={
                editingWorkout
                  ? handleUpdateWorkout
                  : handleAddWorkout
              }
            >

              <div className="admin-login-field">

                <label htmlFor="workout-member">
                  MEMBER
                </label>

                <select
                  id="workout-member"
                  name="member"
                  value={
                    workoutForm.member
                  }
                  onChange={
                    handleWorkoutChange
                  }
                  required
                >

                  <option value="">
                    Select member
                  </option>

                  {members.map((member) => (

                    <option
                      key={member._id}
                      value={member._id}
                    >
                      {member.name} — {member.phone}
                    </option>

                  ))}

                </select>

              </div>


              <div className="admin-login-field">

                <label htmlFor="workout-name">
                  WORKOUT NAME
                </label>

                <input
                  id="workout-name"
                  name="workoutName"
                  type="text"
                  placeholder="Beginner Strength Program"
                  value={
                    workoutForm.workoutName
                  }
                  onChange={
                    handleWorkoutChange
                  }
                  required
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="workout-type">
                  WORKOUT TYPE
                </label>

                <select
                  id="workout-type"
                  name="workoutType"
                  value={
                    workoutForm.workoutType
                  }
                  onChange={
                    handleWorkoutChange
                  }
                >

                  <option value="Strength">
                    Strength
                  </option>

                  <option value="Cardio">
                    Cardio
                  </option>

                  <option value="Flexibility">
                    Flexibility
                  </option>

                  <option value="HIIT">
                    HIIT
                  </option>

                  <option value="General">
                    General
                  </option>

                </select>

              </div>


              {/* EXERCISES */}

              <div className="admin-login-field">

                <label>
                  EXERCISES
                </label>


                <div className="admin-exercise-builder">

                  {workoutForm.exercises.map(
                    (exercise, index) => (

                      <div
                        key={index}
                        className="admin-exercise-card"
                      >

                        <div className="admin-exercise-header">

                          <strong>
                            EXERCISE{' '}
                            {String(
                              index + 1
                            ).padStart(2, '0')}
                          </strong>


                          {workoutForm.exercises.length > 1 && (

                            <button
                              type="button"
                              className="admin-delete-btn"
                              onClick={() =>
                                handleRemoveExercise(
                                  index
                                )
                              }
                            >
                              REMOVE
                            </button>

                          )}

                        </div>


                        <input
                          type="text"
                          placeholder="Exercise name"
                          value={
                            exercise.name
                          }
                          onChange={(e) =>
                            handleExerciseChange(
                              index,
                              'name',
                              e.target.value
                            )
                          }
                          required
                        />


                        <div className="admin-exercise-stats">

                          <input
                            type="number"
                            min="0"
                            placeholder="Sets"
                            value={
                              exercise.sets
                            }
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                'sets',
                                e.target.value
                              )
                            }
                          />


                          <input
                            type="number"
                            min="0"
                            placeholder="Reps"
                            value={
                              exercise.reps
                            }
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                'reps',
                                e.target.value
                              )
                            }
                          />


                          <input
                            type="number"
                            min="0"
                            placeholder="Duration (min)"
                            value={
                              exercise.duration
                            }
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                'duration',
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <input
                          type="text"
                          placeholder="Exercise notes (optional)"
                          value={
                            exercise.notes
                          }
                          onChange={(e) =>
                            handleExerciseChange(
                              index,
                              'notes',
                              e.target.value
                            )
                          }
                        />

                      </div>

                    )
                  )}


                  <button
                    type="button"
                    className="admin-edit-btn"
                    onClick={
                      handleAddExercise
                    }
                  >
                    + ADD EXERCISE
                  </button>

                </div>

              </div>


              <div className="admin-login-field">

                <label htmlFor="workout-start-date">
                  START DATE
                </label>

                <input
                  id="workout-start-date"
                  name="startDate"
                  type="date"
                  value={
                    workoutForm.startDate
                  }
                  onChange={
                    handleWorkoutChange
                  }
                  required
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="workout-end-date">
                  END DATE
                </label>

                <input
                  id="workout-end-date"
                  name="endDate"
                  type="date"
                  value={
                    workoutForm.endDate
                  }
                  onChange={
                    handleWorkoutChange
                  }
                  required
                />

              </div>


              <div className="admin-login-field">

                <label htmlFor="workout-status">
                  STATUS
                </label>

                <select
                  id="workout-status"
                  name="status"
                  value={
                    workoutForm.status
                  }
                  onChange={
                    handleWorkoutChange
                  }
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                </select>

              </div>


              <div className="admin-login-field">

                <label htmlFor="workout-notes">
                  NOTES
                </label>

                <input
                  id="workout-notes"
                  name="notes"
                  type="text"
                  placeholder="Workout notes"
                  value={
                    workoutForm.notes
                  }
                  onChange={
                    handleWorkoutChange
                  }
                />

              </div>


              {workoutFormError && (
                <div className="admin-login-error">
                  {workoutFormError}
                </div>
              )}


              {editWorkoutError && (
                <div className="admin-login-error">
                  {editWorkoutError}
                </div>
              )}


              {workoutSuccess && (
                <div className="admin-member-success">
                  {workoutSuccess}
                </div>
              )}


              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => {

                    setShowAddWorkout(false);
                    setEditingWorkout(null);

                    resetWorkoutForm();

                    setWorkoutFormError('');
                    setEditWorkoutError('');
                    setWorkoutSuccess('');

                  }}
                >
                  CANCEL
                </button>


                <button
                  type="submit"
                  className="admin-add-submit-btn"
                  disabled={
                    addingWorkout ||
                    updatingWorkout
                  }
                >
                  {addingWorkout ||
                  updatingWorkout

                    ? editingWorkout
                      ? 'UPDATING WORKOUT...'
                      : 'ADDING WORKOUT...'

                    : editingWorkout
                      ? 'UPDATE WORKOUT →'
                      : 'ADD WORKOUT →'}
                </button>

              </div>

            </form>

          </div>

        )}


        {workouts.length === 0 && (

          <div className="admin-message">
            No workouts found.
          </div>

        )}


        {workouts.length > 0 && (

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>
                  <th>#</th>
                  <th>MEMBER</th>
                  <th>WORKOUT</th>
                  <th>TYPE</th>
                  <th>EXERCISES</th>
                  <th>START</th>
                  <th>END</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>

              </thead>


              <tbody>

                {workouts.map(
                  (workout, index) => (

                    <tr
                      key={
                        workout._id ||
                        index
                      }
                    >

                      <td>
                        {String(
                          index + 1
                        ).padStart(2, '0')}
                      </td>


                      <td>
                        <strong>
                          {workout.member?.name ||
                            'Unknown Member'}
                        </strong>
                      </td>


                      <td>
                        {workout.workoutName}
                      </td>


                      <td>
                        <span className="goal-badge">
                          {workout.workoutType}
                        </span>
                      </td>


                      <td>
                        <span className="admin-count">
                          {workout.exercises?.length ||
                            0}
                        </span>
                      </td>


                      <td>
                        {workout.startDate
                          ? new Date(
                              workout.startDate
                            ).toLocaleDateString(
                              'en-IN'
                            )
                          : '-'}
                      </td>


                      <td>
                        {workout.endDate
                          ? new Date(
                              workout.endDate
                            ).toLocaleDateString(
                              'en-IN'
                            )
                          : '-'}
                      </td>


                      <td>
                        <span className="goal-badge">
                          {workout.status}
                        </span>
                      </td>


                      <td>

                        <div className="admin-table-actions">

                          <button
                            type="button"
                            className="admin-edit-btn"
                            onClick={() =>
                              handleEditWorkout(
                                workout
                              )
                            }
                          >
                            EDIT
                          </button>


                          <button
                            type="button"
                            className="admin-delete-btn"
                            onClick={() =>
                              handleDeleteWorkout(
                                workout._id
                              )
                            }
                          >
                            DELETE
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          MEMBER ENQUIRIES
      ===================================================== */}

      <section className="admin-enquiries">

        <div className="admin-section-heading">

          <div>

            <span className="section-tag">
              CONTACT REQUESTS
            </span>

            <h2>
              MEMBER <span>ENQUIRIES.</span>
            </h2>

            <p>
              Review and manage enquiries submitted
              through the gym website.
            </p>

          </div>


          <div className="admin-section-actions">

            <span className="admin-count">
              {contacts.length} RECORDS
            </span>

          </div>

        </div>


        {loading && (
          <div className="admin-message">
            Loading enquiries...
          </div>
        )}


        {!loading &&
          error && (

            <div className="admin-message admin-error">
              {error}
            </div>

          )}


        {!loading &&
          !error &&
          contacts.length === 0 && (

            <div className="admin-message">
              No enquiries found.
            </div>

          )}


        {!loading &&
          !error &&
          contacts.length > 0 && (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>
                    <th>#</th>
                    <th>NAME</th>
                    <th>PHONE</th>
                    <th>GOAL</th>
                    <th>MESSAGE</th>
                    <th>DATE</th>
                    <th>ACTION</th>
                  </tr>

                </thead>


                <tbody>

                  {contacts.map(
                    (contact, index) => (

                      <tr
                        key={
                          contact._id ||
                          index
                        }
                      >

                        <td>
                          {String(
                            index + 1
                          ).padStart(2, '0')}
                        </td>


                        <td>
                          <strong>
                            {contact.name}
                          </strong>
                        </td>


                        <td>
                          {contact.phone}
                        </td>


                        <td>
                          <span className="goal-badge">
                            {contact.goal}
                          </span>
                        </td>


                        <td className="message-cell">
                          {contact.message ||
                            'No message'}
                        </td>


                        <td>
                          {contact.createdAt
                            ? new Date(
                                contact.createdAt
                              ).toLocaleDateString(
                                'en-IN'
                              )
                            : '-'}
                        </td>


                        <td>

                          <button
                            type="button"
                            className="admin-delete-btn"
                            onClick={() =>
                              handleDeleteContact(
                                contact._id
                              )
                            }
                          >
                            DELETE
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </section>
      </div>
  )}