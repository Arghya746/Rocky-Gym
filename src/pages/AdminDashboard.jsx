import API_URL from '../config/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogout from '../components/AdminLogout';

export default function AdminDashboard() { 
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);

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
  // CONTACTS
  // =========================================================

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_URL}/api/contacts`
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
            amount: Number(memberForm.amount),
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

  // PAYMENTS
  // =========================================================

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
      `${API_URL}/api/attendance`,
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
        `${API_URL}/api/attendance/${editingAttendance._id}`,
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

      const response = await fetch(
        `${API_URL}/api/workouts`,
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
        `${API_URL}/api/workouts`,
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
        `${API_URL}/api/workouts/${editingWorkout._id}`,
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
    fetchContacts();
    fetchDashboardStats();
    fetchMembers();
    fetchPayments();
    fetchAttendance();
    fetchWorkouts();
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

        {/* =========================
            PAYMENT FORM
        ========================= */}

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

                  {members.map(
                    (member) => (

                      <option
                        key={member._id}
                        value={member._id}
                      >
                        {member.name} — {member.phone}
                      </option>

                    )
                  )}

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
                          ₹
                          {Number(
                            payment.amount
                          ).toLocaleString(
                            'en-IN'
                          )}
                        </td>

                        <td>

                          <span className="goal-badge">
                            {
                              payment.paymentMethod
                            }
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
                              handleEditPayment(payment)
                            }
                          >
                            EDIT
                          </button>

                          <button
                            type="button"
                            className="admin-delete-btn"
                            onClick={() =>
                              handleDeletePayment(payment._id)
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

        {/* =========================
            ATTENDANCE FORM
        ========================= */}

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

              {/* MEMBER */}

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

                  {members.map(
                    (member) => (

                      <option
                        key={member._id}
                        value={member._id}
                      >
                        {member.name} — {member.phone}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* DATE */}

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

              {/* CHECK IN */}

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

              {/* CHECK OUT */}

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

              {/* STATUS */}

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

              {/* ERRORS */}

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

              {/* SUCCESS */}

              {attendanceSuccess && (

                <div className="admin-member-success">
                  {attendanceSuccess}
                </div>

              )}

              {/* ACTIONS */}

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
      



        {/* =========================
            ATTENDANCE LOADING
        ========================= */}

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

        {/* =========================
            ATTENDANCE TABLE
        ========================= */}

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

        {/* =========================
            WORKOUT FORM
        ========================= */}

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
                  value={workoutForm.member}
                  onChange={handleWorkoutChange}
                  required
                >

                  <option value="">
                    Select member
                  </option>

                  {members.map(
                    (member) => (

                      <option
                        key={member._id}
                        value={member._id}
                      >
                        {member.name} — {member.phone}
                      </option>

                    )
                  )}

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
                  onChange={handleWorkoutChange}
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
                  onChange={handleWorkoutChange}
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

              <div className="admin-login-field">

                <label>
                  EXERCISES
                </label>

                <div
                  style={{
                    display: 'grid',
                    gap: '12px',
                  }}
                >

                  {workoutForm.exercises.map(
                    (exercise, index) => (

                      <div
                        key={index}
                        style={{
                          display: 'grid',
                          gap: '10px',
                          padding: '16px',
                          border:
                            '1px solid rgba(255,255,255,0.12)',
                        }}
                      >

                        <strong>
                          EXERCISE {String(
                            index + 1
                          ).padStart(2, '0')}
                        </strong>

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

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              'repeat(3, minmax(0, 1fr))',
                            gap: '10px',
                          }}
                        >

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

                        {workoutForm.exercises.length >
                          1 && (

                          <button
                            type="button"
                            className="admin-delete-btn"
                            onClick={() =>
                              handleRemoveExercise(
                                index
                              )
                            }
                          >
                            REMOVE EXERCISE
                          </button>

                        )}

                      </div>

                    )
                  )}

                  <button
                    type="button"
                    className="admin-edit-btn"
                    onClick={handleAddExercise}
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
                  onChange={handleWorkoutChange}
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
                  onChange={handleWorkoutChange}
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
                  onChange={handleWorkoutChange}
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
                  onChange={handleWorkoutChange}
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
                        {workout.exercises?.length ||
                          0}
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

          </div>

          <span className="admin-count">
            {contacts.length} RECORDS
          </span>

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
  );
}