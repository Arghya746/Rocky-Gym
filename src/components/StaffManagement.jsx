import React, { useEffect, useState } from 'react';
import API_URL from '../config/api';

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

const permissionLabels = {
    members: 'MEMBERS',
    payments: 'PAYMENTS',
    attendance: 'ATTENDANCE',
    workouts: 'WORKOUTS',
    enquiries: 'ENQUIRIES',
};

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const [permissions, setPermissions] =
        useState(defaultPermissions);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // =====================================
    // FETCH STAFF
    // =====================================

    const fetchStaff = async () => {
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
                `${API_URL}/api/admin/staff`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Failed to fetch staff.'
                );
            }

            setStaff(data.staff || []);

            if (data.staff?.length > 0) {
                selectStaff(data.staff[0]);
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

    // =====================================
    // SELECT STAFF
    // =====================================

    const selectStaff = (staffMember) => {
        setSelectedStaff(staffMember);

        setPermissions({
            ...defaultPermissions,
            ...(staffMember.permissions || {}),

            members: {
                ...defaultPermissions.members,
                ...(staffMember.permissions?.members || {}),
            },

            payments: {
                ...defaultPermissions.payments,
                ...(staffMember.permissions?.payments || {}),
            },

            attendance: {
                ...defaultPermissions.attendance,
                ...(staffMember.permissions?.attendance || {}),
            },

            workouts: {
                ...defaultPermissions.workouts,
                ...(staffMember.permissions?.workouts || {}),
            },

            enquiries: {
                ...defaultPermissions.enquiries,
                ...(staffMember.permissions?.enquiries || {}),
            },
        });

        setMessage('');
        setError('');
    };

    // =====================================
    // HANDLE PERMISSION CHANGE
    // =====================================

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
    };

    // =====================================
    // SAVE PERMISSIONS
    // =====================================

    const savePermissions = async () => {
        if (!selectedStaff) {
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

            const response = await fetch(
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Failed to update permissions.'
                );
            }

            setSelectedStaff(data.staff);

            setStaff((currentStaff) =>
                currentStaff.map((member) =>
                    member._id === selectedStaff._id
                        ? data.staff
                        : member
                )
            );

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

    // =====================================
    // TOGGLE STAFF STATUS
    // =====================================

    const toggleStatus = async () => {
        if (!selectedStaff) {
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

            const response = await fetch(
                `${API_URL}/api/admin/staff/${selectedStaff._id}/status`,
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Failed to update staff status.'
                );
            }

            setSelectedStaff(data.staff);

            setStaff((currentStaff) =>
                currentStaff.map((member) =>
                    member._id === selectedStaff._id
                        ? data.staff
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

    // =====================================
    // INITIAL LOAD
    // =====================================

    useEffect(() => {
        fetchStaff();
    }, []);

    // =====================================
    // LOADING
    // =====================================

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

                <div className="admin-add-member-card">
                    Loading staff management...
                </div>
            </section>
        );
    }

    // =====================================
    // UI
    // =====================================

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

                <div className="admin-section-actions">

                    <span className="admin-count">
                        {staff.length} STAFF
                    </span>

                </div>

            </div>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            {message && (
                <div className="admin-success">
                    {message}
                </div>
            )}

            {staff.length === 0 ? (

                <div className="admin-add-member-card">
                    No receptionist accounts found.
                </div>

            ) : (

                <div className="staff-management-wrapper">

                    {/* =========================
                        STAFF LIST
                    ========================= */}

                    <div className="staff-list">

                        <div className="admin-form-heading">

                            <span className="section-tag">
                                STAFF ACCOUNTS
                            </span>

                            <h3>
                                RECEPTIONIST <span>ACCESS.</span>
                            </h3>

                        </div>

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

                                <div>

                                    <strong>
                                        {member.name}
                                    </strong>

                                    <small>
                                        {member.email}
                                    </small>

                                </div>

                                <span
                                    className={
                                        member.status === 'active'
                                            ? 'staff-status active'
                                            : 'staff-status inactive'
                                    }
                                >
                                    {member.status}
                                </span>

                            </button>

                        ))}

                    </div>

                    {/* =========================
                        PERMISSION PANEL
                    ========================= */}

                    {selectedStaff && (

                        <div className="staff-permission-panel">

                            <div className="admin-form-heading">

                                <span className="section-tag">
                                    ACCESS CONTROL
                                </span>

                                <h3>
                                    {selectedStaff.name}{' '}
                                    <span>PERMISSIONS.</span>
                                </h3>

                            </div>

                            <div className="staff-status-row">

                                <div>

                                    <strong>
                                        ACCOUNT STATUS
                                    </strong>

                                    <span
                                        className={
                                            selectedStaff.status === 'active'
                                                ? 'staff-status active'
                                                : 'staff-status inactive'
                                        }
                                    >
                                        {selectedStaff.status}
                                    </span>

                                </div>

                                <button
                                    type="button"
                                    className="admin-edit-btn"
                                    onClick={toggleStatus}
                                    disabled={saving}
                                >
                                    {selectedStaff.status === 'active'
                                        ? 'DEACTIVATE'
                                        : 'ACTIVATE'}
                                </button>

                            </div>

                            <div className="permission-grid">

                                {Object.entries(
                                    permissions
                                ).map(
                                    ([section, sectionPermissions]) => (

                                        <div
                                            className="permission-section"
                                            key={section}
                                        >

                                            <h4>
                                                {
                                                    permissionLabels[
                                                        section
                                                    ]
                                                }
                                            </h4>

                                            <div className="permission-options">

                                                {Object.entries(
                                                    sectionPermissions
                                                ).map(
                                                    ([permission, value]) => (

                                                        <label
                                                            className="permission-option"
                                                            key={permission}
                                                        >

                                                            <input
                                                                type="checkbox"
                                                                checked={value}
                                                                onChange={() =>
                                                                    handlePermissionChange(
                                                                        section,
                                                                        permission
                                                                    )
                                                                }
                                                            />

                                                            <span>
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

                            <div className="staff-save-row">

                                <button
                                    type="button"
                                    className="admin-add-btn"
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

