import { useEffect, useState } from 'react';
import API_URL from '../config/api';


// =========================================================
// DEFAULT PERMISSIONS
// =========================================================

const DEFAULT_PERMISSIONS = {
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
};


// =========================================================
// BRANCH OPTIONS
// =========================================================

const BRANCH_OPTIONS = [
    {
        id: 'all',
        name: 'ALL BRANCHES',
    },
    {
        id: 'Kalyanpur',
        name: 'KALYANPUR',
    },
    {
        id: 'Gopalpur',
        name: 'GOPALPUR',
    },
];


// =========================================================
// BRANCH / AUTH NORMALIZATION
// =========================================================

const normalizeBranch = (value) => {
    if (!value) return '';

    const normalized = String(value).trim().toLowerCase();

    if (normalized === 'kalyanpur') return 'Kalyanpur';
    if (normalized === 'gopalpur') return 'Gopalpur';

    return String(value).trim();
};

const getTokenPayload = (jwtToken) => {
    if (!jwtToken) return null;

    try {
        const parts = jwtToken.split('.');
        if (parts.length !== 3) return null;

        const base64 = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            '='
        );

        return JSON.parse(atob(padded));
    } catch (error) {
        console.warn('Unable to decode admin token:', error);
        return null;
    }
};

const getBranchLabel = (value) => {
    const branch = normalizeBranch(value);
    return branch || 'NOT ASSIGNED';
};

// =========================================================
// COMPONENT
// =========================================================

export default function StaffManagement() {

    // =====================================================
    // AUTH / USER CONTEXT
    // =====================================================

    const token =
        localStorage.getItem('adminToken');

    const tokenPayload =
        getTokenPayload(token);

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


    // JWT is the primary source of truth.
    // localStorage is only a fallback for older sessions.
    const userRole =
        tokenPayload?.role ||
        loggedInUser?.role ||
        loggedInUser?.userRole ||
        null;

    const userBranch = normalizeBranch(
        tokenPayload?.gymBranch ||
        loggedInUser?.gymBranch ||
        loggedInUser?.branchName ||
        loggedInUser?.branch ||
        ''
    );

    const hasAssignedBranch =
        userBranch === 'Kalyanpur' ||
        userBranch === 'Gopalpur';


    const isMainAdmin =
        userRole === 'admin' ||
        userRole === 'main_admin' ||
        userRole === 'super_admin';


    // =====================================================
    // STAFF STATES
    // =====================================================

    const [staff, setStaff] =
        useState([]);

    const [selectedStaff, setSelectedStaff] =
        useState(null);

    const [permissions, setPermissions] =
        useState(DEFAULT_PERMISSIONS);


    // =====================================================
    // BRANCH STATES
    // =====================================================

    const [selectedBranch, setSelectedBranch] =
        useState(
            isMainAdmin
                ? 'all'
                : hasAssignedBranch
                    ? userBranch
                    : ''
        );


    // =====================================================
    // CREATE STAFF STATES
    // =====================================================

    const [showCreateStaff, setShowCreateStaff] =
        useState(false);

    const [creatingStaff, setCreatingStaff] =
        useState(false);

    const [createStaffForm, setCreateStaffForm] =
        useState({
            name: '',
            email: '',
            password: '',
            gymBranch:
                isMainAdmin
                    ? 'Kalyanpur'
                    : hasAssignedBranch
                        ? userBranch
                        : 'Kalyanpur',
        });


    // =====================================================
    // UI STATES
    // =====================================================

    const [staffSuccess, setStaffSuccess] =
        useState('');

    const [staffError, setStaffError] =
        useState('');

    const [savingPermissions, setSavingPermissions] =
        useState(false);

    const [loadingStaff, setLoadingStaff] =
        useState(true);


    // =====================================================
    // NORMALIZE PERMISSIONS
    // =====================================================

    const normalizeStaffPermissions =
        (staffMember) => {

            return {
                members: {
                    view:
                        staffMember?.permissions?.members?.view
                        ?? true,

                    add:
                        staffMember?.permissions?.members?.add
                        ?? true,

                    edit:
                        staffMember?.permissions?.members?.edit
                        ?? true,

                    delete:
                        staffMember?.permissions?.members?.delete
                        ?? false,
                },

                payments: {
                    view:
                        staffMember?.permissions?.payments?.view
                        ?? true,

                    add:
                        staffMember?.permissions?.payments?.add
                        ?? true,

                    edit:
                        staffMember?.permissions?.payments?.edit
                        ?? true,

                    delete:
                        staffMember?.permissions?.payments?.delete
                        ?? false,
                },

                attendance: {
                    view:
                        staffMember?.permissions?.attendance?.view
                        ?? true,

                    add:
                        staffMember?.permissions?.attendance?.add
                        ?? true,

                    edit:
                        staffMember?.permissions?.attendance?.edit
                        ?? true,

                    delete:
                        staffMember?.permissions?.attendance?.delete
                        ?? false,
                },

                workouts: {
                    view:
                        staffMember?.permissions?.workouts?.view
                        ?? true,

                    add:
                        staffMember?.permissions?.workouts?.add
                        ?? true,

                    edit:
                        staffMember?.permissions?.workouts?.edit
                        ?? true,

                    delete:
                        staffMember?.permissions?.workouts?.delete
                        ?? false,
                },

                enquiries: {
                    view:
                        staffMember?.permissions?.enquiries?.view
                        ?? true,

                    delete:
                        staffMember?.permissions?.enquiries?.delete
                        ?? false,
                },
            };
        };


    // =====================================================
    // FETCH STAFF
    // =====================================================

    const fetchStaff = async () => {

        // Staff account management is intentionally restricted to
        // the main admin. Branch receptionists can use their assigned
        // branch but cannot create/edit other staff accounts.
        if (!isMainAdmin) {
            setStaff([]);
            setSelectedStaff(null);
            setPermissions(DEFAULT_PERMISSIONS);
            setLoadingStaff(false);
            return;
        }

        try {

            setLoadingStaff(true);
            setStaffError('');

            if (!token) {
                throw new Error(
                    'Admin session expired. Please login again.'
                );
            }


            const response =
                await fetch(
                    `${API_URL}/api/admin/staff`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Failed to fetch staff accounts.'
                );
            }


            const rawStaffList =
                Array.isArray(data)
                    ? data
                    : data.staff ||
                      data.admins ||
                      [];


            let filteredStaff =
                rawStaffList;


            // =============================================
            // BRANCH FILTER
            // =============================================

            if (
                selectedBranch !== 'all'
            ) {

                filteredStaff =
                    rawStaffList.filter(
                        (member) =>
                            normalizeBranch(member?.gymBranch) ===
                            normalizeBranch(selectedBranch)
                    );
            }


            setStaff(
                filteredStaff
            );


            // =============================================
            // KEEP SELECTED STAFF VALID
            // =============================================

            if (
                filteredStaff.length > 0
            ) {

                setSelectedStaff(
                    (current) => {

                        const currentStaff =
                            current
                                ? filteredStaff.find(
                                    (member) =>
                                        member._id ===
                                        current._id
                                )
                                : null;


                        const nextStaff =
                            currentStaff ||
                            filteredStaff[0];


                        setPermissions(
                            normalizeStaffPermissions(
                                nextStaff
                            )
                        );


                        return nextStaff;
                    }
                );

            } else {

                setSelectedStaff(null);

                setPermissions(
                    DEFAULT_PERMISSIONS
                );
            }

        } catch (error) {

            console.error(
                'Fetch staff error:',
                error
            );

            setStaffError(
                error.message ||
                'Unable to load staff accounts.'
            );

            setStaff([]);

            setSelectedStaff(null);

        } finally {

            setLoadingStaff(false);
        }
    };


    // =====================================================
    // FETCH WHEN BRANCH CHANGES
    // =====================================================

    useEffect(() => {
        if (!isMainAdmin && hasAssignedBranch) {
            setSelectedBranch(userBranch);
        }

        fetchStaff();
    }, [selectedBranch]);


    // =====================================================
    // SELECT STAFF
    // =====================================================

    const handleSelectStaff =
        (staffMember) => {

            setSelectedStaff(
                staffMember
            );

            setPermissions(
                normalizeStaffPermissions(
                    staffMember
                )
            );

            setStaffSuccess('');
            setStaffError('');
        };


    // =====================================================
    // PERMISSION CHANGE
    // =====================================================

    const handlePermissionChange =
        (section, permission) => {

            setPermissions(
                (current) => ({
                    ...current,

                    [section]: {
                        ...current[section],

                        [permission]:
                            !current[
                                section
                            ]?.[permission],
                    },
                })
            );

            setStaffSuccess('');
            setStaffError('');
        };


    // =====================================================
    // CREATE RECEPTIONIST
    // =====================================================

    const handleCreateStaff =
        async (event) => {

            event.preventDefault();

            try {

                setCreatingStaff(true);
                setStaffError('');
                setStaffSuccess('');


                if (!token) {
                    throw new Error(
                        'Admin session expired. Please login again.'
                    );
                }


                if (!isMainAdmin) {
                    throw new Error(
                        'Only the main admin can create staff accounts.'
                    );
                }


                const name =
                    createStaffForm.name.trim();

                const email =
                    createStaffForm.email
                        .trim()
                        .toLowerCase();

                const password =
                    createStaffForm.password;

                const gymBranch =
                    createStaffForm.gymBranch;


                if (!name) {
                    throw new Error(
                        'Staff name is required.'
                    );
                }


                if (!email) {
                    throw new Error(
                        'Staff email is required.'
                    );
                }


                if (!password) {
                    throw new Error(
                        'Staff password is required.'
                    );
                }


                if (password.length < 6) {
                    throw new Error(
                        'Password must contain at least 6 characters.'
                    );
                }


                if (
                    gymBranch !== 'Kalyanpur' &&
                    gymBranch !== 'Gopalpur'
                ) {
                    throw new Error(
                        'Please select a valid gym branch.'
                    );
                }


                const response =
                    await fetch(
                        `${API_URL}/api/admin/register`,
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json',

                                Authorization:
                                    `Bearer ${token}`,
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                password,

                                role:
                                    'receptionist',

                                gymBranch,
                            }),
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        'Failed to create receptionist account.'
                    );
                }


                // Close form
                setShowCreateStaff(false);


                // Reset form
                setCreateStaffForm({
                    name: '',
                    email: '',
                    password: '',
                    gymBranch: 'Kalyanpur',
                });


                // Switch to newly-created branch
                setSelectedBranch(
                    gymBranch
                );


                setStaffSuccess(
                    `Receptionist account created successfully for ${gymBranch}.`
                );


                // Refresh staff list
                await fetchStaff();

            } catch (error) {

                console.error(
                    'Create staff error:',
                    error
                );

                setStaffError(
                    error.message ||
                    'Unable to create receptionist account.'
                );

                setStaffSuccess('');

            } finally {

                setCreatingStaff(false);
            }
        };


    // =====================================================
    // TOGGLE STAFF STATUS
    // =====================================================

    const handleToggleStaffStatus =
        async (staffMember) => {

            try {

                setStaffError('');
                setStaffSuccess('');


                if (!token) {
                    throw new Error(
                        'Admin session expired. Please login again.'
                    );
                }


                const nextStatus =
                    staffMember.status === 'active'
                        ? 'inactive'
                        : 'active';


                const response =
                    await fetch(
                        `${API_URL}/api/admin/staff/${staffMember._id}/status`,
                        {
                            method: 'PUT',

                            headers: {
                                'Content-Type':
                                    'application/json',

                                Authorization:
                                    `Bearer ${token}`,
                            },

                            body: JSON.stringify({
                                status:
                                    nextStatus,
                            }),
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        'Failed to update staff status.'
                    );
                }


                const updatedStaff =
                    data.staff ||
                    {
                        ...staffMember,
                        status:
                            nextStatus,
                    };


                setStaff(
                    (currentStaff) =>
                        currentStaff.map(
                            (member) =>
                                member._id ===
                                staffMember._id
                                    ? updatedStaff
                                    : member
                        )
                );


                setSelectedStaff(
                    (current) =>
                        current?._id ===
                        staffMember._id
                            ? updatedStaff
                            : current
                );


                setStaffSuccess(
                    nextStatus === 'active'
                        ? 'Staff account activated successfully.'
                        : 'Staff account deactivated successfully.'
                );

            } catch (error) {

                console.error(
                    'Toggle staff status error:',
                    error
                );

                setStaffError(
                    error.message ||
                    'Unable to update staff status.'
                );

                setStaffSuccess('');
            }
        };


    // =====================================================
    // SAVE PERMISSIONS
    // =====================================================

    const handleSavePermissions =
        async () => {

            if (!selectedStaff) {
                return;
            }


            try {

                setSavingPermissions(true);

                setStaffError('');
                setStaffSuccess('');


                if (!token) {
                    throw new Error(
                        'Admin session expired. Please login again.'
                    );
                }


                const response =
                    await fetch(
                        `${API_URL}/api/admin/staff/${selectedStaff._id}/permissions`,
                        {
                            method: 'PUT',

                            headers: {
                                'Content-Type':
                                    'application/json',

                                Authorization:
                                    `Bearer ${token}`,
                            },

                            body: JSON.stringify({
                                permissions,
                            }),
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        'Failed to save staff permissions.'
                    );
                }


                const updatedStaff =
                    data.staff ||
                    {
                        ...selectedStaff,
                        permissions,
                    };


                setStaff(
                    (currentStaff) =>
                        currentStaff.map(
                            (member) =>
                                member._id ===
                                selectedStaff._id
                                    ? updatedStaff
                                    : member
                        )
                );


                setSelectedStaff(
                    updatedStaff
                );


                setPermissions(
                    normalizeStaffPermissions(
                        updatedStaff
                    )
                );


                setStaffSuccess(
                    'Staff permissions saved successfully.'
                );

            } catch (error) {

                console.error(
                    'Save permissions error:',
                    error
                );

                setStaffError(
                    error.message ||
                    'Unable to save staff permissions.'
                );

                setStaffSuccess('');

            } finally {

                setSavingPermissions(false);
            }
        };


    // =====================================================
    // CREATE FORM CHANGE
    // =====================================================

    const handleCreateFormChange =
        (event) => {

            const {
                name,
                value,
            } = event.target;

            setCreateStaffForm(
                (current) => ({
                    ...current,
                    [name]: value,
                })
            );

            setStaffError('');
        };


    // =====================================================
    // PERMISSION COUNT
    // =====================================================

    const permissionCount =
        Object.values(
            permissions
        ).reduce(
            (total, section) =>
                total +
                Object.values(
                    section || {}
                ).filter(Boolean).length,
            0
        );


    // =====================================================
    // STAFF PERMISSION SECTIONS
    // =====================================================

    const permissionSections = [

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
    ];


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <section className="admin-staff-management">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="staff-header">

                <div>

                    <span className="staff-eyebrow">
                        TEAM & ACCESS
                    </span>

                    <h2>
                        STAFF <span>MANAGEMENT.</span>
                    </h2>

                    <p>
                        Manage receptionist accounts,
                        branch assignment and dashboard
                        access.
                    </p>

                </div>


                <div className="staff-header-stats">

                    <div className="staff-stat-card">

                        <span className="staff-stat-number">
                            {staff.length}
                        </span>

                        <span className="staff-stat-label">
                            STAFF
                        </span>

                    </div>


                    <div className="staff-stat-card">

                        <span className="staff-stat-number staff-green">
                            {
                                staff.filter(
                                    (member) =>
                                        member.status ===
                                        'active'
                                ).length
                            }
                        </span>

                        <span className="staff-stat-label">
                            ACTIVE
                        </span>

                    </div>

                </div>

            </div>


            {/* ==========================================
                BRANCH FILTER + CREATE BUTTON
            ========================================== */}

            <div className="staff-branch-bar">

                <div>

                    <span className="staff-panel-label">
                        GYM BRANCH
                    </span>

                    <strong>
                        {isMainAdmin
                            ? 'FILTER STAFF BY BRANCH'
                            : 'ASSIGNED BRANCH'}
                    </strong>

                </div>


                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                    }}
                >

                    {isMainAdmin ? (

                        <select
                            value={
                                selectedBranch
                            }
                            onChange={(event) =>
                                setSelectedBranch(
                                    event.target.value
                                )
                            }
                            className="staff-branch-select"
                        >

                            {BRANCH_OPTIONS.map(
                                (branch) => (
                                    <option
                                        key={
                                            branch.id
                                        }
                                        value={
                                            branch.id
                                        }
                                    >
                                        {branch.name}
                                    </option>
                                )
                            )}

                        </select>

                    ) : (

                        <span className="staff-branch-badge">
                            {getBranchLabel(userBranch)}
                        </span>

                    )}


                    <span
                        className="staff-branch-badge"
                        title="Current staff management branch"
                    >
                        {isMainAdmin
                            ? selectedBranch === 'all'
                                ? 'ALL BRANCHES'
                                : getBranchLabel(selectedBranch)
                            : getBranchLabel(userBranch)}
                    </span>

                    {isMainAdmin && (

                        <button
                            type="button"
                            className="admin-add-submit-btn"
                            onClick={() => {
                                setCreateStaffForm({
                                    name: '',
                                    email: '',
                                    password: '',
                                    gymBranch:
                                        selectedBranch !==
                                        'all'
                                            ? selectedBranch
                                            : 'Kalyanpur',
                                });

                                setStaffError('');
                                setStaffSuccess('');

                                setShowCreateStaff(
                                    true
                                );
                            }}
                        >
                            + CREATE RECEPTIONIST
                        </button>

                    )}

                </div>

            </div>


            {/* ==========================================
                CREATE RECEPTIONIST FORM
            ========================================== */}

            {showCreateStaff && isMainAdmin && (

                <div
                    style={{
                        margin: '20px 0',
                        padding: '24px',
                        border:
                            '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        background:
                            'rgba(255, 255, 255, 0.025)',
                    }}
                >

                    <div
                        style={{
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            alignItems: 'center',
                            gap: '15px',
                            marginBottom: '20px',
                        }}
                    >

                        <div>

                            <span className="staff-panel-label">
                                NEW ACCOUNT
                            </span>

                            <h3
                                style={{
                                    margin:
                                        '5px 0 0',
                                }}
                            >
                                CREATE RECEPTIONIST
                            </h3>

                        </div>


                        <button
                            type="button"
                            className="admin-cancel-btn"
                            onClick={() => {
                                setShowCreateStaff(
                                    false
                                );
                                setStaffError('');
                            }}
                        >
                            CLOSE
                        </button>

                    </div>


                    <form
                        onSubmit={
                            handleCreateStaff
                        }
                    >

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(2, minmax(0, 1fr))',
                                gap: '16px',
                            }}
                        >

                            <div>

                                <label>
                                    FULL NAME
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        createStaffForm.name
                                    }
                                    onChange={
                                        handleCreateFormChange
                                    }
                                    placeholder="Receptionist name"
                                    required
                                />

                            </div>


                            <div>

                                <label>
                                    EMAIL
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        createStaffForm.email
                                    }
                                    onChange={
                                        handleCreateFormChange
                                    }
                                    placeholder="receptionist@alphagym.com"
                                    required
                                />

                            </div>


                            <div>

                                <label>
                                    PASSWORD
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={
                                        createStaffForm.password
                                    }
                                    onChange={
                                        handleCreateFormChange
                                    }
                                    placeholder="Minimum 6 characters"
                                    minLength={6}
                                    required
                                />

                            </div>


                            <div>

                                <label>
                                    GYM BRANCH
                                </label>

                                <select
                                    name="gymBranch"
                                    value={
                                        createStaffForm.gymBranch
                                    }
                                    onChange={
                                        handleCreateFormChange
                                    }
                                    required
                                >

                                    <option value="Kalyanpur">
                                        KALYANPUR
                                    </option>

                                    <option value="Gopalpur">
                                        GOPALPUR
                                    </option>

                                </select>

                            </div>

                        </div>


                        <div
                            style={{
                                marginTop: '20px',
                                display: 'flex',
                                justifyContent:
                                    'flex-end',
                                gap: '12px',
                            }}
                        >

                            <button
                                type="button"
                                className="admin-cancel-btn"
                                onClick={() =>
                                    setShowCreateStaff(
                                        false
                                    )
                                }
                            >
                                CANCEL
                            </button>


                            <button
                                type="submit"
                                className="admin-add-submit-btn"
                                disabled={
                                    creatingStaff
                                }
                            >
                                {creatingStaff
                                    ? 'CREATING ACCOUNT...'
                                    : 'CREATE ACCOUNT →'}
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ==========================================
                MESSAGES
            ========================================== */}

            {staffError && (

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


            {/* ==========================================
                MAIN STAFF AREA
            ========================================== */}

            <div className="staff-layout">


                {/* ======================================
                    STAFF ACCOUNT LIST
                ====================================== */}

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


                    {loadingStaff ? (

                        <div className="staff-empty">

                            <div className="staff-empty-icon">
                                ...
                            </div>

                            <strong>
                                Loading staff
                            </strong>

                            <span>
                                Fetching receptionist
                                accounts.
                            </span>

                        </div>

                    ) : staff.length === 0 ? (

                        <div className="staff-empty">

                            <div className="staff-empty-icon">
                                👤
                            </div>

                            <strong>
                                No staff accounts
                            </strong>

                            <span>
                                No receptionists found
                                for this branch.
                            </span>

                        </div>

                    ) : (

                        <div className="staff-account-list">

                            {staff.map(
                                (member) => {

                                    const initials =
                                        member.name
                                            ? member.name
                                                .split(
                                                    /\s+/
                                                )
                                                .map(
                                                    (part) =>
                                                        part.charAt(
                                                            0
                                                        )
                                                )
                                                .join('')
                                                .slice(
                                                    0,
                                                    2
                                                )
                                                .toUpperCase()
                                            : 'ST';


                                    const isSelected =
                                        selectedStaff?._id ===
                                        member._id;


                                    const isActive =
                                        member.status ===
                                        'active';


                                    const branch =
                                        getBranchLabel(
                                            member.gymBranch
                                        );


                                    return (

                                        <button
                                            type="button"
                                            key={
                                                member._id
                                            }
                                            className={`staff-account ${
                                                isSelected
                                                    ? 'staff-account-selected'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                handleSelectStaff(
                                                    member
                                                )
                                            }
                                        >

                                            <div className="staff-avatar">
                                                {initials}
                                            </div>


                                            <div className="staff-account-info">

                                                <strong>
                                                    {member.name ||
                                                        'Staff Member'}
                                                </strong>

                                                <span className="staff-account-meta">
                                                    {member.email}
                                                </span>


                                                <div
                                                    style={{
                                                        display:
                                                            'flex',
                                                        gap:
                                                            '8px',
                                                        alignItems:
                                                            'center',
                                                        flexWrap:
                                                            'wrap',
                                                        marginTop:
                                                            '5px',
                                                    }}
                                                >

                                                    <span
                                                        className={
                                                            `staff-status ${
                                                                isActive
                                                                    ? 'staff-status-active'
                                                                    : 'staff-status-inactive'
                                                            }`
                                                        }
                                                    >
                                                        {isActive
                                                            ? 'ACTIVE'
                                                            : 'INACTIVE'}
                                                    </span>


                                                    <span className="staff-branch-badge">
                                                        {branch}
                                                    </span>

                                                </div>

                                            </div>


                                            <span className="staff-account-arrow">
                                                →
                                            </span>

                                        </button>

                                    );
                                }
                            )}

                        </div>

                    )}

                </div>


                {/* ======================================
                    ACCESS CONTROL
                ====================================== */}

                <div className="staff-permission-panel">

                    {!selectedStaff ? (

                        <div className="staff-empty">

                            <div className="staff-empty-icon">
                                ⚙
                            </div>

                            <strong>
                                Select a receptionist
                            </strong>

                            <span>
                                Select a staff account
                                to manage permissions.
                            </span>

                        </div>

                    ) : (

                        <>

                            {/* ==========================
                                STAFF PROFILE
                            ========================== */}

                            <div className="staff-profile">

                                <div className="staff-avatar">

                                    {selectedStaff.name
                                        ? selectedStaff.name
                                            .charAt(0)
                                            .toUpperCase()
                                        : 'ST'}

                                </div>


                                <div className="staff-profile-info">

                                    <strong>
                                        {selectedStaff.name ||
                                            'Staff Member'}
                                    </strong>

                                    <span>
                                        {selectedStaff.email}
                                    </span>


                                    <div
                                        style={{
                                            display:
                                                'flex',
                                            gap:
                                                '8px',
                                            flexWrap:
                                                'wrap',
                                            marginTop:
                                                '8px',
                                        }}
                                    >

                                        <span className="staff-branch-badge">
                                            {getBranchLabel(
                                                selectedStaff.gymBranch
                                            )}
                                        </span>


                                        <span
                                            className={
                                                selectedStaff.status ===
                                                'active'
                                                    ? 'staff-status staff-status-active'
                                                    : 'staff-status staff-status-inactive'
                                            }
                                        >
                                            {selectedStaff.status ===
                                            'active'
                                                ? 'ACTIVE'
                                                : 'INACTIVE'}
                                        </span>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        selectedStaff.status ===
                                        'active'
                                            ? 'admin-delete-btn'
                                            : 'admin-add-submit-btn'
                                    }
                                    onClick={() =>
                                        handleToggleStaffStatus(
                                            selectedStaff
                                        )
                                    }
                                >

                                    {selectedStaff.status ===
                                    'active'
                                        ? 'DEACTIVATE ACCOUNT'
                                        : 'ACTIVATE ACCOUNT'}

                                </button>

                            </div>


                            {/* ==========================
                                BRANCH INFORMATION
                            ========================== */}

                            <div
                                style={{
                                    margin:
                                        '20px 0',
                                    padding:
                                        '16px 18px',
                                    border:
                                        '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius:
                                        '12px',
                                    background:
                                        'rgba(255, 255, 255, 0.025)',
                                    display:
                                        'flex',
                                    justifyContent:
                                        'space-between',
                                    alignItems:
                                        'center',
                                    gap:
                                        '15px',
                                    flexWrap:
                                        'wrap',
                                }}
                            >

                                <div>

                                    <span className="staff-panel-label">
                                        BRANCH ASSIGNMENT
                                    </span>

                                    <strong
                                        style={{
                                            display:
                                                'block',
                                            marginTop:
                                                '5px',
                                        }}
                                    >
                                        RECEPTIONIST BRANCH
                                    </strong>

                                </div>


                                <span className="staff-branch-badge">

                                    {getBranchLabel(
                                        selectedStaff.gymBranch
                                    )}

                                </span>

                            </div>


                            {/* ==========================
                                PERMISSION HEADING
                            ========================== */}

                            <div className="staff-permission-heading">

                                <div>

                                    <span className="staff-panel-label">
                                        ACCESS CONTROL
                                    </span>

                                    <h3>
                                        PERMISSION <span>CONTROL.</span>
                                    </h3>

                                    <p>
                                        Choose exactly what
                                        this staff member can
                                        view, add, edit or
                                        delete.
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


                            {/* ==========================
                                PERMISSION CARDS
                            ========================== */}

                            <div className="staff-permission-grid">

                                {permissionSections.map(
                                    (section) => {

                                        const enabledCount =
                                            Object.values(
                                                permissions[
                                                    section.key
                                                ] || {}
                                            ).filter(Boolean)
                                                .length;


                                        return (

                                            <div
                                                className="staff-permission-card"
                                                key={
                                                    section.key
                                                }
                                            >

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
                                                                {
                                                                    section.description
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>


                                                    <div className="staff-permission-counter">

                                                        {enabledCount}/
                                                        {
                                                            section
                                                                .permissions
                                                                .length
                                                        }

                                                    </div>

                                                </div>


                                                <div className="staff-permission-options">

                                                    {section.permissions.map(
                                                        (permission) => (

                                                            <label
                                                                key={
                                                                    permission
                                                                }
                                                                className="staff-permission-option"
                                                            >

                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        permissions[
                                                                            section.key
                                                                        ]?.[
                                                                            permission
                                                                        ] ||
                                                                        false
                                                                    }
                                                                    onChange={() =>
                                                                        handlePermissionChange(
                                                                            section.key,
                                                                            permission
                                                                        )
                                                                    }
                                                                />

                                                                <span>
                                                                    {permission
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase() +
                                                                        permission.slice(
                                                                            1
                                                                        )}
                                                                </span>

                                                            </label>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>


                            {/* ==========================
                                SAVE
                            ========================== */}

                            <div className="staff-save-area">

                                <button
                                    type="button"
                                    className="admin-add-submit-btn"
                                    onClick={
                                        handleSavePermissions
                                    }
                                    disabled={
                                        savingPermissions
                                    }
                                >

                                    {savingPermissions
                                        ? 'SAVING...'
                                        : 'SAVE PERMISSIONS   →'}

                                </button>

                            </div>

                        </>

                    )}

                </div>

            </div>

        </section>
    );
}