
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_URL from '../config/api';

export default function MemberDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [member, setMember] = useState(null);
    const [payments, setPayments] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [workouts, setWorkouts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const adminToken =
            localStorage.getItem('adminToken');

        if (!adminToken) {
            navigate('/admin/login', {
                replace: true,
            });
            return;
        }

        fetchMemberDetails();
    }, [id]);

    const fetchMemberDetails = async () => {
        try {
            setLoading(true);
            setError('');

            const adminToken =
                localStorage.getItem('adminToken');

            if (!adminToken) {
                navigate('/admin/login', {
                    replace: true,
                });
                return;
            }

            const headers = {
                Authorization: `Bearer ${adminToken}`,
            };

            const [
                memberResponse,
                paymentsResponse,
                attendanceResponse,
                workoutsResponse,
            ] = await Promise.all([
                fetch(
                    `${API_URL}/api/members/${id}`,
                    {
                        headers,
                    }
                ),

                fetch(
                    `${API_URL}/api/payments`,
                    {
                        headers,
                    }
                ),

                fetch(
                    `${API_URL}/api/attendance`,
                    {
                        headers,
                    }
                ),

                fetch(
                     `${API_URL}/api/workouts`,
                    {
                        headers,
                    }
                ),
            ]);

            const memberData =
                await memberResponse.json();

            const paymentsData =
                await paymentsResponse.json();

            const attendanceData =
                await attendanceResponse.json();

            const workoutsData =
                await workoutsResponse.json();

            if (!memberResponse.ok) {
                throw new Error(
                    memberData.message ||
                    'Unable to fetch member details.'
                );
            }

            if (!paymentsResponse.ok) {
                throw new Error(
                    paymentsData.message ||
                    'Unable to fetch payments.'
                );
            }

            if (!attendanceResponse.ok) {
                throw new Error(
                    attendanceData.message ||
                    'Unable to fetch attendance.'
                );
            }

            if (!workoutsResponse.ok) {
                throw new Error(
                    workoutsData.message ||
                    'Unable to fetch workouts.'
                );
            }

            setMember(memberData.member);

            const memberPayments =
                (paymentsData.payments || []).filter(
                    (payment) => {
                        const paymentMember =
                            payment.member?._id ||
                            payment.member;

                        return (
                            String(paymentMember) ===
                            String(id)
                        );
                    }
                );

            const memberAttendance =
                (attendanceData.attendance || []).filter(
                    (record) => {
                        const attendanceMember =
                            record.member?._id ||
                            record.member;

                        return (
                            String(attendanceMember) ===
                            String(id)
                        );
                    }
                );

            const memberWorkouts =
                (workoutsData.workouts || []).filter(
                    (workout) => {
                        const workoutMember =
                            workout.member?._id ||
                            workout.member;

                        return (
                            String(workoutMember) ===
                            String(id)
                        );
                    }
                );

            setPayments(memberPayments);
            setAttendance(memberAttendance);
            setWorkouts(memberWorkouts);

        } catch (error) {
            console.error(
                'Member Details Error:',
                error
            );

            setError(
                error.message ||
                'Unable to load member details.'
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';

        return new Date(date).toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }
        );
    };

    const formatDateTime = (date) => {
        if (!date) return '—';

        return new Date(date).toLocaleString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }
        );
    };

    const getStatusClass = (status) => {
        if (status === 'Active') {
            return 'member-details-status active';
        }

        if (status === 'Paid') {
            return 'member-details-status paid';
        }

        if (status === 'Present') {
            return 'member-details-status present';
        }

        if (status === 'Completed') {
            return 'member-details-status completed';
        }

        return 'member-details-status';
    };

    if (loading) {
        return (
            <div className="member-details-page">
                <div className="member-details-loading">
                    LOADING MEMBER DETAILS...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="member-details-page">
                <div className="member-details-error">
                    <h2>
                        UNABLE TO LOAD MEMBER
                    </h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin')
                        }
                    >
                        ← BACK TO DASHBOARD
                    </button>
                </div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="member-details-page">
                <div className="member-details-error">
                    <h2>
                        MEMBER NOT FOUND
                    </h2>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin')
                        }
                    >
                        ← BACK TO DASHBOARD
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="member-details-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="member-details-header">

                <div>
                    <span className="section-tag">
                        ALPHA GYM
                    </span>

                    <h1>
                        MEMBER <span>PROFILE.</span>
                    </h1>

                    <p>
                        Complete membership activity and history.
                    </p>
                </div>

                <button
                    type="button"
                    className="member-details-back-btn"
                    onClick={() =>
                        navigate('/admin')
                    }
                >
                    ← BACK TO DASHBOARD
                </button>

            </div>


            {/* =========================
                MEMBER OVERVIEW
            ========================= */}

            <section className="member-details-card member-overview">

                <div className="member-avatar">
                    {member.name
                        ?.charAt(0)
                        .toUpperCase()}
                </div>

                <div className="member-overview-main">

                    <h2>{member.name}</h2>

                    <p>
                        Member ID:{' '}
                        <strong>{member._id}</strong>
                    </p>

                </div>

                <div className="member-overview-status">

                    <span
                        className={getStatusClass(
                            member.status
                        )}
                    >
                        {member.status}
                    </span>

                </div>

            </section>


            {/* =========================
                PERSONAL INFORMATION
            ========================= */}

            <section className="member-details-card">

                <div className="member-details-section-title">
                    <span>01</span>
                    PERSONAL INFORMATION
                </div>

                <div className="member-info-grid">

                    <div className="member-info-item">
                        <span>FULL NAME</span>
                        <strong>
                            {member.name || '—'}
                        </strong>
                    </div>

                    <div className="member-info-item">
                        <span>PHONE</span>
                        <strong>
                            {member.phone || '—'}
                        </strong>
                    </div>

                    <div className="member-info-item">
                        <span>EMAIL</span>
                        <strong>
                            {member.email || '—'}
                        </strong>
                    </div>

                    <div className="member-info-item">
                        <span>AGE</span>
                        <strong>
                            {member.age || '—'}
                        </strong>
                    </div>

                    <div className="member-info-item">
                        <span>GENDER</span>
                        <strong>
                            {member.gender || '—'}
                        </strong>
                    </div>

                    <div className="member-info-item">
                        <span>JOINED</span>
                        <strong>
                            {formatDate(
                                member.createdAt
                            )}
                        </strong>
                    </div>

                </div>

            </section>


            {/* =========================
                MEMBERSHIP
            ========================= */}

            <section className="member-details-card">

                <div className="member-details-section-title">
                    <span>02</span>
                    MEMBERSHIP
                </div>

                <div className="member-info-grid">

                    <div className="member-info-item">
                        <span>PLAN</span>
                        <strong>
                            {member.membershipPlan}
                        </strong>
                    </div>

                    <div className="member-info-item">
                        <span>START DATE</span>
                        <strong>
                            {formatDate(
                                member.membershipStartDate
                            )}
                        </strong>
                    </div>

                    <div className="member-info-item">
                        <span>END DATE</span>
                        <strong>
                            {formatDate(
                                member.membershipEndDate
                            )}
                        </strong>
                    </div>

                    <div className="member-info-item">
                        <span>
                            MEMBERSHIP AMOUNT
                        </span>
                        <strong>
                            ₹{member.amount || 0}
                        </strong>
                    </div>

                    <div className="member-info-item">
                        <span>STATUS</span>
                        <strong>
                            {member.status}
                        </strong>
                    </div>

                </div>

            </section>


            {/* =========================
                PAYMENT HISTORY
            ========================= */}

            <section className="member-details-card">

                <div className="member-details-section-title">
                    <span>03</span>
                    PAYMENT HISTORY
                </div>

                {payments.length === 0 ? (
                    <div className="member-empty-state">
                        NO PAYMENT RECORDS FOUND.
                    </div>
                ) : (
                    <div className="member-details-table-wrapper">

                        <table className="member-details-table">

                            <thead>
                                <tr>
                                    <th>INVOICE</th>
                                    <th>AMOUNT</th>
                                    <th>METHOD</th>
                                    <th>DATE</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {payments.map(
                                    (payment) => (
                                        <tr
                                            key={
                                                payment._id
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    {
                                                        payment.invoiceNumber
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                ₹
                                                {
                                                    payment.amount
                                                }
                                            </td>

                                            <td>
                                                {
                                                    payment.paymentMethod
                                                }
                                            </td>

                                            <td>
                                                {formatDate(
                                                    payment.paymentDate
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        payment.status
                                                    )}
                                                >
                                                    {
                                                        payment.status
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>

                        </table>

                    </div>
                )}

            </section>


            {/* =========================
                ATTENDANCE HISTORY
            ========================= */}

            <section className="member-details-card">

                <div className="member-details-section-title">
                    <span>04</span>
                    ATTENDANCE HISTORY
                </div>

                {attendance.length === 0 ? (
                    <div className="member-empty-state">
                        NO ATTENDANCE RECORDS FOUND.
                    </div>
                ) : (
                    <div className="member-details-table-wrapper">

                        <table className="member-details-table">

                            <thead>
                                <tr>
                                    <th>DATE</th>
                                    <th>CHECK IN</th>
                                    <th>CHECK OUT</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {attendance.map(
                                    (record) => (
                                        <tr
                                            key={
                                                record._id
                                            }
                                        >
                                            <td>
                                                {formatDate(
                                                    record.date
                                                )}
                                            </td>

                                            <td>
                                                {formatDateTime(
                                                    record.checkInTime
                                                )}
                                            </td>

                                            <td>
                                                {formatDateTime(
                                                    record.checkOutTime
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        record.status
                                                    )}
                                                >
                                                    {
                                                        record.status
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>

                        </table>

                    </div>
                )}

            </section>


            {/* =========================
                WORKOUT HISTORY
            ========================= */}

            <section className="member-details-card">

                <div className="member-details-section-title">
                    <span>05</span>
                    WORKOUT HISTORY
                </div>

                {workouts.length === 0 ? (
                    <div className="member-empty-state">
                        NO WORKOUT RECORDS FOUND.
                    </div>
                ) : (
                    <div className="member-details-table-wrapper">

                        <table className="member-details-table">

                            <thead>
                                <tr>
                                    <th>WORKOUT</th>
                                    <th>TYPE</th>
                                    <th>START</th>
                                    <th>END</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {workouts.map(
                                    (workout) => (
                                        <tr
                                            key={
                                                workout._id
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    {
                                                        workout.workoutName
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    workout.workoutType
                                                }
                                            </td>

                                            <td>
                                                {formatDate(
                                                    workout.startDate
                                                )}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    workout.endDate
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        workout.status
                                                    )}
                                                >
                                                    {
                                                        workout.status
                                                    }
                                                </span>
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

