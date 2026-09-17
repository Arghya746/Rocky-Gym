/* updated from user-supplied AdminDashboard code */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogout from '../components/AdminLogout';
import API_URL from '../config/api';
export default function AdminDashboard() { 
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [plans, setPlans] = useState([]);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState('');
  const [creatingOffers, setCreatingOffers] = useState(false);

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
    membershipPlan: 'Monthly',
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
  const [permissions, setPermissions] = useState({
    members: {
      view: true,
      add: true,
      edit: true,
      delete: false,
    },
    payments: {
      view: true,
      add: true,
      edit: true,
      delete: false,
    },
    attendance: {
      view: true,
      add: true,
      edit: true,
      delete: false,
    },
    workouts: {
      view: true,
      add: true,
      edit: true,
      delete: false,
    },
    enquiries: {
      view: true,
      delete: false,
    },
  });

  const [staffSuccess, setStaffSuccess] = useState('');
  const [staffError, setStaffError] = useState('');
  const [savingPermissions, setSavingPermissions] = useState(false);


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

      const staffList = Array.isArray(data)
        ? data
        : data.staff || data.admins || [];

      setStaff(staffList);

      if (staffList.length > 0) {
        setSelectedStaff((current) => {
          const currentStaff = current
            ? staffList.find(
                (member) => member._id === current._id
              )
            : null;

          return currentStaff || staffList[0];
        });
      } else {
        setSelectedStaff(null);
      }

    } catch (error) {
      console.error('Fetch staff error:', error);
      setStaffError(
        error.message || 'Unable to load staff accounts.'
      );
    }
  };

  const handlePermissionChange = (section, permission) => {
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
      total + Object.values(section || {}).filter(Boolean).length,
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

      setContacts(data.contacts || []);

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

      setStats(data.stats);

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

      setMembers(data.members || []);

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
          name: memberForm.name,
          phone: memberForm.phone,
          email: memberForm.email,
          age: memberForm.age
            ? Number(memberForm.age)
            : undefined,
          gender: memberForm.gender,
          membershipPlan:
            memberForm.membershipPlan,
          membershipStartDate:
            memberForm.membershipStartDate,
          membershipEndDate:
            memberForm.membershipEndDate,
          membershipOffer:
            memberForm.membershipOffer,
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
      membershipPlan: 'Monthly',
      membershipStartDate: '',
      membershipEndDate: '',
      membershipOffer: '',
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


// =========================================================
// MEMBERSHIP OFFER CHANGE
// =========================================================

const handleOfferChange = (e) => {
  const offerId = e.target.value;

  const selectedOffer = offers.find(
    (offer) => offer._id === offerId
  );

  if (!selectedOffer) {
    setMemberForm((current) => ({
      ...current,
      membershipOffer: '',
    }));
    return;
  }

  setMemberForm((current) => ({
    ...current,
    membershipOffer:
      selectedOffer._id,
    membershipPlan:
      selectedOffer.plan?.name ||
      current.membershipPlan,
    amount:
      Number(current.amount || 0) -
      Number(
        selectedOffer.offerPrice || 0
      ),
  }));
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
      membershipPlan:
        member.membershipPlan || 'Monthly',
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
            name: memberForm.name,
            phone: memberForm.phone,
            email: memberForm.email,
            age: memberForm.age
              ? Number(memberForm.age)
              : undefined,
            gender: memberForm.gender,
            membershipPlan:
              memberForm.membershipPlan,
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

  // =========================================================
  // MEMBERSHIP PLANS & PROMOTIONAL OFFERS
  // =========================================================

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        throw new Error('Admin token not found.');
      }

      const response = await fetch(`${API_URL}/api/plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch plans.'
        );
      }

      setPlans(data.plans || []);
    } catch (error) {
      console.error('Fetch plans error:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      setOffersLoading(true);
      setOffersError('');

      const token = localStorage.getItem('adminToken');

      if (!token) {
        throw new Error('Admin token not found.');
      }

      const response = await fetch(`${API_URL}/api/offers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch offers.'
        );
      }

      const rawOffers = Array.isArray(data.offers)
        ? data.offers
        : [];

      // Keep one visible copy of each promotional offer.
      // The database currently contains duplicate offer records,
      // so the admin dashboard displays only the four unique offers.
      const preferredOfferOrder = [
        '🌧 MONSOON MUSCLE',
        '🪔 PUJA TRANSFORMATION',
        '☀ SUMMER SHRED',
        '❄ WINTER POWER',
      ];

      const uniqueOffers = Array.from(
        new Map(
          rawOffers.map((offer) => [
            String(offer.name || '')
              .trim()
              .toUpperCase(),
            offer,
          ])
        ).values()
      ).sort((a, b) => {
        const aIndex = preferredOfferOrder.indexOf(a.name);
        const bIndex = preferredOfferOrder.indexOf(b.name);

        if (aIndex === -1 && bIndex === -1) {
          return 0;
        }

        if (aIndex === -1) {
          return 1;
        }

        if (bIndex === -1) {
          return -1;
        }

        return aIndex - bIndex;
      });

      setOffers(uniqueOffers);
    } catch (error) {
      console.error('Fetch offers error:', error);
      setOffersError(
        error.message || 'Unable to load offers.'
      );
    } finally {
      setOffersLoading(false);
    }
  };

  const createDefaultOffers = async () => {
    try {
      setCreatingOffers(true);

      const token = localStorage.getItem('adminToken');

      if (!token) {
        throw new Error(
          'Admin session expired. Please login again.'
        );
      }

      const monthlyPlan = plans.find(
        (plan) => plan.name === 'Monthly'
      );

      const quarterlyPlan = plans.find(
        (plan) => plan.name === 'Quarterly'
      );

      if (!monthlyPlan || !quarterlyPlan) {
        throw new Error(
          'Please create Monthly and Quarterly plans first.'
        );
      }

      const defaultOffers = [
        {
          name: '🌧 MONSOON MUSCLE',
          plan: monthlyPlan._id,
          offerPrice: 999,
          description:
            "Don't let the rain stop your progress. Join Alpha Gym and stay consistent this season.",
          benefits: [
            'Full Gym Access',
            'Workout Guidance',
            'Digital Attendance',
          ],
        },
        {
          name: '🪔 PUJA TRANSFORMATION',
          plan: quarterlyPlan._id,
          offerPrice: 2499,
          description:
            'Get festival ready with a dedicated transformation program at Alpha Gym.',
          benefits: [
            '3 Month Gym Access',
            'Personalized Workout Plan',
            'Progress Tracking',
          ],
        },
        {
          name: '☀ SUMMER SHRED',
          plan: monthlyPlan._id,
          offerPrice: 899,
          description:
            'Build confidence, burn fat and get ready for your strongest summer.',
          benefits: [
            'Cardio + Strength Training',
            'Fat Loss Guidance',
            'Progress Tracking',
          ],
        },
        {
          name: '❄ WINTER POWER',
          plan: monthlyPlan._id,
          offerPrice: 1099,
          description:
            'Use the winter season to build strength, muscle and serious discipline.',
          benefits: [
            'Strength Training',
            'Muscle Building Plan',
            'Trainer Guidance',
          ],
        },
      ];

      const today = new Date();
      const expiryDate = new Date(today);
      expiryDate.setFullYear(
        expiryDate.getFullYear() + 1
      );

      const startDate = today
        .toISOString()
        .split('T')[0];

      const endDate = expiryDate
        .toISOString()
        .split('T')[0];

      let createdCount = 0;

      for (const offer of defaultOffers) {
        const alreadyExists = offers.some(
          (existingOffer) => {
            const existingPlanId =
              existingOffer.plan?._id ||
              existingOffer.plan;

            return (
              existingOffer.name === offer.name &&
              String(existingPlanId) ===
                String(offer.plan)
            );
          }
        );

        if (alreadyExists) {
          continue;
        }

        const response = await fetch(
          `${API_URL}/api/offers`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...offer,
              startDate,
              endDate,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              `Failed to create ${offer.name}`
          );
        }

        createdCount += 1;
      }

      await fetchOffers();

      alert(
        createdCount === 0
          ? 'All default offers already exist.'
          : `${createdCount} default offer${
              createdCount === 1 ? '' : 's'
            } created successfully.`
      );
    } catch (error) {
      console.error(
        'Create offers error:',
        error
      );

      alert(
        error.message ||
          'Failed to create offers.'
      );
    } finally {
      setCreatingOffers(false);
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

      setPayments(data.payments || []);

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

    const response = await 
    fetch(`${API_URL}/api/attendance`, 
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
      data.attendance || []
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
      'http://localhost:5000/api/attendance',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

       body: JSON.stringify({
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
        `http://localhost:5000/api/attendance/${editingAttendance._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
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
        `http://localhost:5000/api/attendance/${attendanceId}`,
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

      setWorkouts(data.workouts || []);

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
        'http://localhost:5000/api/workouts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
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
        `http://localhost:5000/api/workouts/${editingWorkout._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
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
        `http://localhost:5000/api/workouts/${workoutId}`,
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
        `http://localhost:5000/api/contacts/${contactId}`,
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
    fetchContacts();
    fetchDashboardStats();
    fetchMembers();
    fetchPayments();
    fetchAttendance();
    fetchWorkouts();
    fetchStaff();
    fetchPlans();
    fetchOffers();
  }, []);

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
    fetchPlans();
    fetchOffers();
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
            Manage gym members, payments,
            attendance, workouts and enquiries.
          </p>

        </div>

        <div className="admin-header-actions">

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={handleRefresh}
          >
            ↻ REFRESH
          </button>

          <AdminLogout />

        </div>

      </header>

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

              <div className="admin-login-field">

                <label htmlFor="membership-plan">
                  MEMBERSHIP PLAN
                </label>

                <select
                  id="membership-plan"
                  name="membershipPlan"
                  value={
                    memberForm.membershipPlan
                  }
                  onChange={handleMemberChange}
                >

                  <option value="Monthly">
                    Monthly
                  </option>

                  <option value="Quarterly">
                    Quarterly
                  </option>

                  <option value="Half-Yearly">
                    Half-Yearly
                  </option>

                  <option value="Yearly">
                    Yearly
                  </option>

                </select>

              </div>
             <div className="admin-login-field">

  <label htmlFor="membership-offer">
    MEMBERSHIP OFFER
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
          {offer.name} - ₹
          {Number(
            offer.offerPrice
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
                <option value="All">All Members</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
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
              No members found.
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
                    <th>PLAN</th>
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
                            {
                              member.membershipPlan
                            }
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
                              navigate(`/admin/members/${member._id}`)
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
          PROMOTIONAL OFFERS
      ===================================================== */}

      <section className="admin-enquiries">

        <div className="admin-section-heading">

          <div>
            <span className="section-tag">
              PROMOTIONAL OFFERS
            </span>

            <h2>
              OFFER <span>MANAGEMENT.</span>
            </h2>

            <p>
              Manage the promotional offers used by Alpha Gym.
            </p>
          </div>

          <div className="admin-section-actions">
  <span className="admin-count">
    {offers.length} OFFERS
  </span>

  <button
    type="button"
    className="admin-add-btn"
    onClick={createDefaultOffers}
    disabled={creatingOffers}
  >
    {creatingOffers
      ? 'CREATING...'
      : '+ CREATE DEFAULT OFFERS'}
  </button>
</div>

</div>

{offersLoading && (
  <div className="admin-message">
    Loading offers...
  </div>
)}

{!offersLoading && offersError && (
  <div className="admin-message admin-error">
    {offersError}
  </div>
)}

{!offersLoading &&
  !offersError &&
  offers.length === 0 && (
    <div className="admin-message">
      No promotional offers found. Click
      <strong> + CREATE DEFAULT OFFERS</strong>
      {' '}to add the four Alpha Gym offers.
    </div>
  )}

{!offersLoading &&
  !offersError &&
  offers.length > 0 && (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '18px',
      }}
    >
      {offers.map((offer, index) => (
        <div
          key={offer._id || index}
          style={{
            background:
              'linear-gradient(145deg, #15151c, #0d0d12)',
            border:
              '1px solid rgba(255,255,255,0.10)',
            borderRadius: '18px',
            padding: '24px',
            minHeight: '330px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '18px',
            }}
          >
            <span className="section-tag">
              {offer.plan?.name || 'GYM OFFER'}
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="goal-badge">
                {offer.isActive
                  ? 'ACTIVE'
                  : 'INACTIVE'}
              </span>

              <button
                type="button"
                className="admin-add-btn"
                onClick={() =>
                  handleToggleOfferStatus(offer)
                }
              >
                {offer.isActive
                  ? 'DEACTIVATE'
                  : 'ACTIVATE'}
              </button>
            </div>
          </div>

          <h3
            style={{
              margin: '0 0 12px',
              fontSize: '27px',
              lineHeight: '1.05',
            }}
          >
            {offer.name}
          </h3>

          <p
            style={{
              margin: '0 0 18px',
              color: '#aaa',
              lineHeight: '1.55',
            }}
          >
            {offer.description ||
              'Alpha Gym promotional offer.'}
          </p>

          <div style={{ marginBottom: '18px' }}>
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                letterSpacing: '1.5px',
                opacity: 0.65,
                marginBottom: '5px',
              }}
            >
              SPECIAL PRICE
            </span>

            <strong style={{ fontSize: '34px' }}>
              ₹{Number(
                offer.offerPrice
              ).toLocaleString('en-IN')}
            </strong>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '8px',
              marginTop: 'auto',
            }}
          >
            {(offer.benefits || []).map(
              (benefit, benefitIndex) => (
                <span
                  key={benefitIndex}
                  style={{
                    color: '#bbb',
                    fontSize: '14px',
                  }}
                >
                  ✓ {benefit}
                </span>
              )
            )}
          </div>

        </div>
      ))}
    </div>
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
        Manage receptionist accounts and control dashboard access.
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
            🔐
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
                Choose exactly what this staff member
                can view, add, edit or delete.
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
        Track membership payments, invoices and transaction status.
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


  {/* PAYMENT FORM */}

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
            value={
              paymentForm.amount
            }
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
            value={
              paymentForm.status
            }
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
            value={
              paymentForm.notes
            }
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


  {/* PAYMENT STATES */}

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


  {/* PAYMENT TABLE */}

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
        Monitor member attendance, check-in and check-out activity.
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


  {/* ATTENDANCE FORM */}

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


  {/* ATTENDANCE STATES */}

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


  {/* ATTENDANCE TABLE */}

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
        Create and manage personalised training programmes for members.
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


  {/* WORKOUT FORM */}

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


  {/* WORKOUT STATES */}

  {workouts.length === 0 && (

    <div className="admin-message">
      No workouts found.
    </div>

  )}


  {/* WORKOUT TABLE */}

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
                    {workout.exercises?.length || 0}
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
        Review and manage enquiries submitted through the gym website.
      </p>

    </div>


    <div className="admin-section-actions">

      <span className="admin-count">
        {contacts.length} RECORDS
      </span>

    </div>

  </div>


  {/* ENQUIRY STATES */}

  {loading && (

    <div className="admin-message">
      Loading enquiries...
    </div>

  )}


  {!loading && error && (

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


  {/* ENQUIRY TABLE */}

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

    