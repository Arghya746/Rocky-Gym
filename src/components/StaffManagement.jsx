
import React, { useEffect, useState } from 'react';
import API_URL from '../config/api';

// =====================================================
// DEFAULT PERMISSIONS
// =====================================================

const defaultPermissions = {
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

// =====================================================
// LABELS
// =====================================================

const permissionLabels = {
    members: 'MEMBERS',
    payments: 'PAYMENTS',
    attendance: 'ATTENDANCE',
    workouts: 'WORKOUTS',
    enquiries: 'ENQUIRIES',
};

// =====================================================
// COMPONENT
// =====================================================

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const [permissions, setPermissions] =
        useState(defaultPermissions);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // =================================================
    // NORMALIZE STAFF
    // =================================================

    const normalizeStaff = (staffMember) => {
        if (!staffMember) {
            return null;
        }

        return {
            ...staffMember,

            _id:
                staffMember._id ||
                staffMember.id,
        };
    };

    // =================================================
    // FETCH STAFF
    // =================================================

    const fetchStaff = async () => {
        try {
            setLoading(true);
            setError('');
            setMessage('');

            const token =
                localStorage.getItem('adminToken');

            if (!token) {
                throw new Error(
                    'Admin token not found.'
                );
            }

            const response = await fetch(
                `${API_URL}/api/admin/staff`,
                {
                    method: 'GET',

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
                    'Failed to fetch staff.'
                );
            }

            const staffList =
                (data.staff || [])
                    .map(normalizeStaff)
                    .filter(
                        (member) => member?._id
                    );

            setStaff(staffList);

            if (staffList.length > 0) {
                selectStaff(staffList[0]);
            }

        } catch (error) {
            console.error(
                'Fetch staff error:',
                error
            );

            setError(
                error.message ||
                'Unable to load staff.'
            );

        } finally {
            setLoading(false);
        }
    };

    // =================================================
    // SELECT STAFF
    // =================================================

    const selectStaff = (staffMember) => {
        const normalizedStaff =
            normalizeStaff(staffMember);

        if (!normalizedStaff?._id) {
            console.error(
                'Invalid staff member:',
                staffMember
            );

            setError(
                'Staff account ID could not be found.'
            );

            return;
        }

        setSelectedStaff(
            normalizedStaff
        );

        const staffPermissions =
            normalizedStaff.permissions || {};

        setPermissions({
            ...defaultPermissions,

            members: {
                ...defaultPermissions.members,
                ...(staffPermissions.members || {}),
            },

            payments: {
                ...defaultPermissions.payments,
                ...(staffPermissions.payments || {}),
            },

            attendance: {
                ...defaultPermissions.attendance,
                ...(staffPermissions.attendance || {}),
            },

            workouts: {
                ...defaultPermissions.workouts,
                ...(staffPermissions.workouts || {}),
            },

            enquiries: {
                ...defaultPermissions.enquiries,
                ...(staffPermissions.enquiries || {}),
            },
        });

        setMessage('');
        setError('');
    };

    // =================================================
    // CHANGE PERMISSION
    // =================================================

    const handlePermissionChange = (
        section,
        permission
    ) => {
        setPermissions((current) => ({
            ...current,

            [section]: {
                ...current[section],

                [permission]:
                    !current[section][permission],
            },
        }));

        setMessage('');
        setError('');
    };

    // =================================================
    // SAVE PERMISSIONS
    // =================================================

    const savePermissions = async () => {
        if (!selectedStaff?._id) {
            setError(
                'Staff account ID not found.'
            );

            return;
        }

        try {
            setSaving(true);
            setMessage('');
            setError('');

            const token =
                localStorage.getItem('adminToken');

            if (!token) {
                throw new Error(
                    'Admin token not found.'
                );
            }

            const staffId =
                selectedStaff._id;

            const response = await fetch(
                `${API_URL}/api/admin/staff/${staffId}/permissions`,
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
                    'Failed to update permissions.'
                );
            }

            const updatedStaff =
                normalizeStaff(data.staff);

            setSelectedStaff(
                updatedStaff
            );

            setStaff((currentStaff) =>
                currentStaff.map((member) =>
                    member._id === staffId
                        ? updatedStaff
                        : member
                )
            );

            setPermissions({
                ...defaultPermissions,

                ...(updatedStaff.permissions || {}),

                members: {
                    ...defaultPermissions.members,
                    ...(updatedStaff.permissions?.members || {}),
                },

                payments: {
                    ...defaultPermissions.payments,
                    ...(updatedStaff.permissions?.payments || {}),
                },

                attendance: {
                    ...defaultPermissions.attendance,
                    ...(updatedStaff.permissions?.attendance || {}),
                },

                workouts: {
                    ...defaultPermissions.workouts,
                    ...(updatedStaff.permissions?.workouts || {}),
                },

                enquiries: {
                    ...defaultPermissions.enquiries,
                    ...(updatedStaff.permissions?.enquiries || {}),
                },
            });

            setMessage(
                'Permissions updated successfully.'
            );

        } catch (error) {
            console.error(
                'Save permissions error:',
                error
            );

            setError(
                error.message ||
                'Unable to save permissions.'
            );

        } finally {
            setSaving(false);
        }
    };

    // =================================================
    // TOGGLE STATUS
    // =================================================

    const toggleStatus = async () => {
        if (!selectedStaff?._id) {
            setError(
                'Staff account ID not found.'
            );

            return;
        }

        const newStatus =
            selectedStaff.status === 'active'
                ? 'inactive'
                : 'active';

        try {
            setSaving(true);
            setMessage('');
            setError('');

            const token =
                localStorage.getItem('adminToken');

            if (!token) {
                throw new Error(
                    'Admin token not found.'
                );
            }

            const staffId =
                selectedStaff._id;

            const response = await fetch(
                `${API_URL}/api/admin/staff/${staffId}/status`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json',

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        status: newStatus,
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
                normalizeStaff(data.staff);

            setSelectedStaff(
                updatedStaff
            );

            setStaff((currentStaff) =>
                currentStaff.map((member) =>
                    member._id === staffId
                        ? updatedStaff
                        : member
                )
            );

            setMessage(
                `Receptionist ${
                    newStatus === 'active'
                        ? 'activated'
                        : 'deactivated'
                } successfully.`
            );

        } catch (error) {
            console.error(
                'Update staff status error:',
                error
            );

            setError(
                error.message ||
                'Unable to update staff status.'
            );

        } finally {
            setSaving(false);
        }
    };

    // =================================================
    // LOAD STAFF
    // =================================================

    useEffect(() => {
        fetchStaff();
    }, []);

    // =================================================
    // LOADING
    // =================================================

    if (loading) {
        return (
            <section className="admin-enquiries">

                <div className="admin-section-heading">

                    <div>
                        <span className="section-tag">
                            ADMINISTRATION
                        </span>

                        <h2>
                            STAFF <span>MANAGEMENT.</span>
                        </h2>
                    </div>

                </div>

                <div className="staff-loading-card">
                    <div className="staff-loading-dot"></div>

                    <div>
                        <strong>
                            LOADING STAFF MANAGEMENT
                        </strong>

                        <span>
                            Please wait...
                        </span>
                    </div>
                </div>

            </section>
        );
    }

    // =================================================
    // UI
    // =================================================

    return (
        <section className="admin-enquiries staff-management-section">

            {/* HEADER */}
            <div className="admin-section-heading">

                <div>
                    <span className="section-tag">
                        ADMINISTRATION
                    </span>

                    <h2>
                        STAFF <span>MANAGEMENT.</span>
                    </h2>
                </div>

                <div className="admin-section-actions">

                    <span className="admin-count">
                        {staff.length} STAFF
                    </span>

                </div>

            </div>

            {/* MESSAGES */}

            {error && (
                <div className="admin-error staff-message">
                    {error}
                </div>
            )}

            {message && (
                <div className="admin-success staff-message">
                    {message}
                </div>
            )}

            {/* EMPTY */}

            {staff.length === 0 ? (

                <div className="staff-empty-card">

                    <span className="section-tag">
                        STAFF ACCOUNTS
                    </span>

                    <h3>
                        NO RECEPTIONIST <span>FOUND.</span>
                    </h3>

                    <p>
                        No receptionist accounts are currently available.
                    </p>

                </div>

            ) : (

                <div className="staff-management-wrapper">

                    {/* =================================
                        LEFT — STAFF ACCOUNTS
                    ================================= */}

                    <aside className="staff-list">

                        <div className="staff-list-header">

                            <div>
                                <span className="section-tag">
                                    STAFF ACCOUNTS
                                </span>

                                <h3>
                                    RECEPTIONIST <span>ACCESS.</span>
                                </h3>
                            </div>

                            <span className="staff-list-count">
                                {staff.length}
                            </span>

                        </div>

                        <div className="staff-account-list">

                            {staff.map((member) => (

                                <button
                                    key={member._id}
                                    type="button"
                                    className={
                                        `staff-card ${
                                            selectedStaff?._id === member._id
                                                ? 'active'
                                                : ''
                                        }`
                                    }
                                    onClick={() =>
                                        selectStaff(member)
                                    }
                                >

                                    <div className="staff-card-main">

                                        <div className="staff-avatar">
                                            {(member.name || 'R')
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="staff-card-info">

                                            <strong>
                                                {member.name}
                                            </strong>

                                            <small>
                                                {member.email}
                                            </small>

                                        </div>

                                    </div>

                                    <span
                                        className={
                                            member.status === 'active'
                                                ? 'staff-status active'
                                                : 'staff-status inactive'
                                        }
                                    >
                                        <i></i>
                                        {member.status}
                                    </span>

                                </button>

                            ))}

                        </div>

                    </aside>

                    {/* =================================
                        RIGHT — ACCESS CONTROL
                    ================================= */}

                    {selectedStaff && (

                        <div className="staff-permission-panel">

                            {/* PANEL HEADER */}

                            <div className="staff-panel-header">

                                <div className="staff-panel-title">

                                    <span className="section-tag">
                                        ACCESS CONTROL
                                    </span>

                                    <h3>
                                        {selectedStaff.name}{' '}
                                        <span>PERMISSIONS.</span>
                                    </h3>

                                    <p>
                                        Manage access levels and account permissions.
                                    </p>

                                </div>

                                <div className="staff-panel-status">

                                    <span
                                        className={
                                            selectedStaff.status === 'active'
                                                ? 'staff-status active'
                                                : 'staff-status inactive'
                                        }
                                    >
                                        <i></i>
                                        {selectedStaff.status}
                                    </span>

                                </div>

                            </div>

                            {/* ACCOUNT BAR */}

                            <div className="staff-account-bar">

                                <div className="staff-account-identity">

                                    <div className="staff-avatar large">
                                        {(selectedStaff.name || 'R')
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>
                                        <strong>
                                            {selectedStaff.name}
                                        </strong>

                                        <span>
                                            {selectedStaff.email}
                                        </span>
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className={
                                        `staff-status-button ${
                                            selectedStaff.status === 'active'
                                                ? 'danger'
                                                : 'success'
                                        }`
                                    }
                                    onClick={toggleStatus}
                                    disabled={saving}
                                >
                                    {selectedStaff.status === 'active'
                                        ? 'DEACTIVATE ACCOUNT'
                                        : 'ACTIVATE ACCOUNT'}
                                </button>

                            </div>

                            {/* PERMISSIONS */}

                            <div className="staff-permissions-heading">

                                <div>
                                    <span className="section-tag">
                                        ACCESS LEVELS
                                    </span>

                                    <h4>
                                        PERMISSION <span>CONTROL.</span>
                                    </h4>
                                </div>

                                <span>
                                    {Object.values(permissions)
                                        .flatMap(Object.values)
                                        .filter(Boolean)
                                        .length}{' '}
                                    ENABLED
                                </span>

                            </div>

                            <div className="permission-grid">

                                {Object.entries(
                                    permissions
                                ).map(
                                    ([section, sectionPermissions]) => (

                                        <div
                                            className="permission-section"
                                            key={`permission-${section}`}
                                        >

                                            <div className="permission-section-header">

                                                <h4>
                                                    {permissionLabels[section]}
                                                </h4>

                                                <span>
                                                    {Object.values(sectionPermissions)
                                                        .filter(Boolean)
                                                        .length}
                                                    /
                                                    {Object.keys(sectionPermissions).length}
                                                </span>

                                            </div>

                                            <div className="permission-options">

                                                {Object.entries(
                                                    sectionPermissions
                                                ).map(
                                                    ([permission, value]) => (

                                                        <label
                                                            className={
                                                                `permission-option ${
                                                                    value
                                                                        ? 'enabled'
                                                                        : ''
                                                                }`
                                                            }
                                                            key={`${section}-${permission}`}
                                                        >

                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    Boolean(value)
                                                                }
                                                                onChange={() =>
                                                                    handlePermissionChange(
                                                                        section,
                                                                        permission
                                                                    )
                                                                }
                                                            />

                                                            <span className="permission-check">
                                                                {value ? '✓' : ''}
                                                            </span>

                                                            <span className="permission-label">
                                                                {permission
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    permission.slice(1)}
                                                            </span>

                                                        </label>

                                                    )
                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                            {/* SAVE */}

                            <div className="staff-save-row">

                                <div className="staff-save-info">

                                    <span className="staff-save-indicator"></span>

                                    <span>
                                        Changes are saved to this staff account.
                                    </span>

                                </div>

                                <button
                                    type="button"
                                    className="staff-save-button"
                                    onClick={savePermissions}
                                    disabled={saving}
                                >
                                    {saving
                                        ? 'SAVING...'
                                        : 'SAVE PERMISSIONS'}
                                </button>

                            </div>

                        </div>

                    )}

                </div>

            )}

        </section>
    );
};

export default StaffManagement;