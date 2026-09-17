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
    members: 'Members',
    payments: 'Payments',
    attendance: 'Attendance',
    workouts: 'Workouts',
    enquiries: 'Enquiries',
};

function StaffManagement() {
    const [staff, setStaff] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [permissions, setPermissions] =
        useState(defaultPermissions);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const normalizeStaff = (data) => {
        if (Array.isArray(data)) return data;

        if (Array.isArray(data?.staff)) {
            return data.staff;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return [];
    };

    const fetchStaff = async () => {
        try {
            setLoading(true);
            setError('');

            const token =
                localStorage.getItem('adminToken');

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
                    data.message ||
                    'Failed to fetch staff.'
                );
            }

            const staffData =
                normalizeStaff(data);

            setStaff(staffData);

            if (staffData.length > 0) {
                setSelectedStaff((current) => {
                    const existing =
                        staffData.find(
                            (item) =>
                                item._id === current?._id
                        );

                    return existing || staffData[0];
                });

                setPermissions((current) => {
                    const activeStaff =
                        staffData.find(
                            (item) =>
                                item._id ===
                                selectedStaff?._id
                        ) || staffData[0];

                    return {
                        ...defaultPermissions,
                        ...(activeStaff.permissions || {}),
                    };
                });
            } else {
                setSelectedStaff(null);
            }
        } catch (err) {
            console.error(
                'Fetch staff error:',
                err
            );

            setError(
                err.message ||
                'Failed to load staff.'
            );
        } finally {
            setLoading(false);
        }
    };

    const selectStaff = (member) => {
        setSelectedStaff(member);

        setPermissions({
            ...defaultPermissions,
            ...(member.permissions || {}),
        });

        setMessage('');
        setError('');
    };

    const handlePermissionChange = (
        category,
        permission
    ) => {
        setPermissions((previous) => ({
            ...previous,
            [category]: {
                ...previous[category],
                [permission]:
                    !previous[category][permission],
            },
        }));
    };

    const savePermissions = async () => {
        if (!selectedStaff) return;

        try {
            setSaving(true);
            setMessage('');
            setError('');

            const token =
                localStorage.getItem('adminToken');

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

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Failed to save permissions.'
                );
            }

            setMessage(
                'Changes are saved to this staff account.'
            );

            await fetchStaff();

        } catch (err) {
            console.error(
                'Save permissions error:',
                err
            );

            setError(
                err.message ||
                'Failed to save permissions.'
            );
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async () => {
        if (!selectedStaff) return;

        try {
            setMessage('');
            setError('');

            const token =
                localStorage.getItem('adminToken');

            const newStatus =
                selectedStaff.status === 'active'
                    ? 'inactive'
                    : 'active';

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

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Failed to update account status.'
                );
            }

            setMessage(
                `Account ${
                    newStatus === 'active'
                        ? 'activated'
                        : 'deactivated'
                } successfully.`
            );

            await fetchStaff();

        } catch (err) {
            console.error(
                'Toggle status error:',
                err
            );

            setError(
                err.message ||
                'Failed to update status.'
            );
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    if (loading) {
        return (
            <>
                <style>{staffStyles}</style>

                <section className="staff-modern-section">
                    <div className="staff-modern-loading">
                        Loading staff accounts...
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <style>{staffStyles}</style>

            <section className="staff-modern-section">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="staff-modern-header">

                    <div>
                        <div className="staff-modern-kicker">
                            STAFF MANAGEMENT.
                        </div>

                        <h2 className="staff-modern-title">
                            Staff Management
                        </h2>
                    </div>

                    <div className="staff-modern-count">
                        <span>
                            {staff.length}
                        </span>

                        STAFF
                    </div>

                </div>


                {/* =================================================
                    MESSAGES
                ================================================= */}

                {error && (
                    <div className="staff-modern-error">
                        {error}
                    </div>
                )}

                {staff.length === 0 ? (

                    <div className="staff-modern-empty">
                        No staff accounts found.
                    </div>

                ) : (

                    <div className="staff-modern-layout">

                        {/* =================================================
                            LEFT — STAFF ACCOUNTS
                        ================================================= */}

                        <div className="staff-modern-accounts">

                            <div className="staff-modern-section-label">
                                STAFF ACCOUNTS
                            </div>

                            <div className="staff-modern-section-subtitle">
                                RECEPTIONIST ACCESS.
                            </div>


                            <div className="staff-modern-account-count">
                                {staff.length}
                            </div>


                            <div className="staff-modern-staff-list">

                                {staff.map((member) => {

                                    const isSelected =
                                        selectedStaff?._id ===
                                        member._id;

                                    return (
                                        <button
                                            key={member._id}
                                            type="button"
                                            className={
                                                `staff-modern-staff-card ${
                                                    isSelected
                                                        ? 'selected'
                                                        : ''
                                                }`
                                            }
                                            onClick={() =>
                                                selectStaff(member)
                                            }
                                        >

                                            <div className="staff-modern-avatar">
                                                {member.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || 'G'}
                                            </div>


                                            <div className="staff-modern-person">

                                                <div className="staff-modern-name">
                                                    {member.name}
                                                </div>

                                                <div className="staff-modern-email">
                                                    {member.email}
                                                </div>

                                            </div>


                                            <div
                                                className={
                                                    `staff-modern-status ${
                                                        member.status ===
                                                        'active'
                                                            ? 'active'
                                                            : 'inactive'
                                                    }`
                                                }
                                            >
                                                {member.status}
                                            </div>

                                        </button>
                                    );
                                })}

                            </div>

                        </div>


                        {/* =================================================
                            RIGHT — ACCESS CONTROL
                        ================================================= */}

                        {selectedStaff && (

                            <div className="staff-modern-access">

                                <div className="staff-modern-section-label">
                                    ACCESS CONTROL
                                </div>

                                <div className="staff-modern-section-subtitle">
                                    {selectedStaff.name} PERMISSIONS.
                                </div>

                                <div className="staff-modern-access-description">
                                    Manage access levels and account permissions.
                                </div>


                                {/* ACCOUNT BAR */}

                                <div className="staff-modern-account-bar">

                                    <div className="staff-modern-account-info">

                                        <div className="staff-modern-avatar large">
                                            {selectedStaff.name
                                                ?.charAt(0)
                                                ?.toUpperCase() || 'G'}
                                        </div>

                                        <div>

                                            <div className="staff-modern-account-name">
                                                {selectedStaff.name}
                                            </div>

                                            <div className="staff-modern-account-email">
                                                {selectedStaff.email}
                                            </div>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        className="staff-modern-status-button"
                                        onClick={toggleStatus}
                                    >
                                        {selectedStaff.status ===
                                        'active'
                                            ? 'DEACTIVATE ACCOUNT'
                                            : 'ACTIVATE ACCOUNT'}
                                    </button>

                                </div>


                                {/* PERMISSION HEADER */}

                                <div className="staff-modern-permission-header">

                                    <div>

                                        <div className="staff-modern-permission-kicker">
                                            ACCESS LEVELS
                                        </div>

                                        <h3>
                                            PERMISSION CONTROL.
                                        </h3>

                                    </div>


                                    <div className="staff-modern-enabled">

                                        <span>
                                            {Object.values(
                                                permissions
                                            ).reduce(
                                                (
                                                    total,
                                                    category
                                                ) =>
                                                    total +
                                                    Object.values(
                                                        category
                                                    ).filter(Boolean)
                                                        .length,
                                                0
                                            )}
                                        </span>

                                        ENABLED

                                    </div>

                                </div>


                                {/* PERMISSIONS */}

                                <div className="staff-modern-permissions">

                                    {Object.entries(
                                        permissionLabels
                                    ).map(
                                        ([category, label]) => {

                                            const categoryPermissions =
                                                permissions[
                                                    category
                                                ] || {};

                                            const enabledCount =
                                                Object.values(
                                                    categoryPermissions
                                                ).filter(
                                                    Boolean
                                                ).length;

                                            const totalCount =
                                                Object.keys(
                                                    categoryPermissions
                                                ).length;

                                            return (

                                                <div
                                                    key={category}
                                                    className="staff-modern-permission-row"
                                                >

                                                    <div className="staff-modern-permission-name">

                                                        <span>
                                                            {label.toUpperCase()}
                                                        </span>

                                                        <small>
                                                            {
                                                                enabledCount
                                                            }
                                                            /
                                                            {
                                                                totalCount
                                                            }
                                                        </small>

                                                    </div>


                                                    <div className="staff-modern-options">

                                                        {Object.keys(
                                                            categoryPermissions
                                                        ).map(
                                                            (
                                                                permission
                                                            ) => {

                                                                const enabled =
                                                                    categoryPermissions[
                                                                        permission
                                                                    ] === true;

                                                                return (

                                                                    <label
                                                                        key={
                                                                            permission
                                                                        }
                                                                        className={
                                                                            `staff-modern-option ${
                                                                                enabled
                                                                                    ? 'enabled'
                                                                                    : ''
                                                                            }`
                                                                        }
                                                                    >

                                                                        <input
                                                                            type="checkbox"
                                                                            checked={
                                                                                enabled
                                                                            }
                                                                            onChange={() =>
                                                                                handlePermissionChange(
                                                                                    category,
                                                                                    permission
                                                                                )
                                                                            }
                                                                        />

                                                                        <span className="staff-modern-check">
                                                                            {enabled
                                                                                ? '✓'
                                                                                : ''}
                                                                        </span>

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

                                                                );
                                                            }
                                                        )}

                                                    </div>

                                                </div>

                                            );
                                        }
                                    )}

                                </div>


                                {/* BOTTOM */}

                                <div className="staff-modern-bottom">

                                    <div className="staff-modern-message">

                                        {message && (
                                            <>
                                                <span>✓</span>
                                                {message}
                                            </>
                                        )}

                                    </div>


                                    <button
                                        type="button"
                                        className="staff-modern-save"
                                        onClick={
                                            savePermissions
                                        }
                                        disabled={saving}
                                    >
                                        {saving
                                            ? 'SAVING...'
                                            : 'SAVE PERMISSIONS →'}
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>
                )}

            </section>
        </>
    );
}


/* =============================================================
   STAFF MANAGEMENT STYLES
============================================================= */

const staffStyles = `

.staff-modern-section {
    width: 100%;
    margin: 0;
    padding: 0;
    color: var(--text);
    box-sizing: border-box;
}

.staff-modern-section *,
.staff-modern-section *::before,
.staff-modern-section *::after {
    box-sizing: border-box;
}


/* =============================================================
   HEADER
============================================================= */

.staff-modern-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 30px;

    margin-bottom: 28px;
    padding-bottom: 20px;

    border-bottom: 1px solid var(--border);
}

.staff-modern-kicker {
    margin-bottom: 7px;

    color: var(--orange);

    font-family: var(--mono);
    font-size: 9px;
    font-weight: 800;

    letter-spacing: 2.5px;
}

.staff-modern-title {
    margin: 0;

    font-family: var(--heading);

    font-size: clamp(2.4rem, 5vw, 4.2rem);

    line-height: 0.95;
    letter-spacing: 0;
}

.staff-modern-count {
    display: flex;
    align-items: center;
    gap: 8px;

    color: var(--orange);

    font-family: var(--mono);
    font-size: 9px;
    font-weight: 800;

    letter-spacing: 1.5px;
}

.staff-modern-count span {
    font-size: 24px;
}


/* =============================================================
   ERROR
============================================================= */

.staff-modern-error {
    margin-bottom: 18px;

    padding: 12px 15px;

    border: 1px solid rgba(255, 77, 0, 0.25);

    background: rgba(255, 77, 0, 0.06);

    color: var(--text);

    font-size: 12px;
}


/* =============================================================
   MAIN TWO COLUMN LAYOUT
============================================================= */

.staff-modern-layout {
    display: grid;

    grid-template-columns:
        minmax(260px, 0.72fr)
        minmax(0, 1.65fr);

    gap: 22px;

    width: 100%;
}


/* =============================================================
   LEFT STAFF ACCOUNTS
============================================================= */

.staff-modern-accounts {
    min-width: 0;

    padding: 25px;

    border: 1px solid var(--border);

    background:
        linear-gradient(
            135deg,
            rgba(255,255,255,0.025),
            rgba(255,255,255,0.008)
        );
}

.staff-modern-section-label {
    margin-bottom: 8px;

    color: var(--text);

    font-family: var(--mono);

    font-size: 10px;
    font-weight: 800;

    letter-spacing: 2px;
}

.staff-modern-section-subtitle {
    color: var(--orange);

    font-family: var(--heading);

    font-size: 22px;

    line-height: 0.95;

    letter-spacing: 0;
}

.staff-modern-account-count {
    margin-top: 22px;
    margin-bottom: 15px;

    color: var(--text);

    font-family: var(--mono);

    font-size: 28px;
    font-weight: 700;
}


/* =============================================================
   STAFF LIST
============================================================= */

.staff-modern-staff-list {
    display: flex;

    flex-direction: column;

    gap: 8px;
}

.staff-modern-staff-card {
    position: relative;

    display: grid;

    grid-template-columns: 42px minmax(0, 1fr) auto;

    align-items: center;

    gap: 12px;

    width: 100%;

    padding: 14px;

    border: 1px solid transparent;

    background: transparent;

    color: inherit;

    text-align: left;

    cursor: pointer;

    transition:
        background 0.2s ease,
        border-color 0.2s ease;
}

.staff-modern-staff-card:hover {
    background: rgba(255,255,255,0.035);

    border-color: var(--border);
}

.staff-modern-staff-card.selected {
    background: rgba(255,77,0,0.055);

    border-color:
        rgba(255,77,0,0.3);
}


/* =============================================================
   AVATAR
============================================================= */

.staff-modern-avatar {
    display: flex;

    align-items: center;
    justify-content: center;

    width: 42px;
    height: 42px;

    border: 1px solid
        rgba(255,77,0,0.35);

    background:
        rgba(255,77,0,0.08);

    color: var(--orange);

    font-family: var(--heading);

    font-size: 21px;

    flex-shrink: 0;
}

.staff-modern-avatar.large {
    width: 48px;
    height: 48px;

    font-size: 24px;
}


/* =============================================================
   STAFF TEXT
============================================================= */

.staff-modern-person {
    min-width: 0;
}

.staff-modern-name {
    overflow: hidden;

    margin-bottom: 5px;

    font-size: 13px;
    font-weight: 700;

    white-space: nowrap;

    text-overflow: ellipsis;
}

.staff-modern-email {
    overflow: hidden;

    color: var(--muted);

    font-family: var(--mono);

    font-size: 8px;

    white-space: nowrap;

    text-overflow: ellipsis;
}

.staff-modern-status {
    align-self: end;

    font-family: var(--mono);

    font-size: 7px;
    font-weight: 800;

    letter-spacing: 1.5px;

    text-transform: uppercase;
}

.staff-modern-status.active {
    color: #6fdc91;
}

.staff-modern-status.inactive {
    color: var(--muted);
}


/* =============================================================
   RIGHT ACCESS CONTROL
============================================================= */

.staff-modern-access {
    min-width: 0;

    padding: 25px;

    border: 1px solid var(--border);

    background:
        linear-gradient(
            135deg,
            rgba(255,255,255,0.025),
            rgba(255,255,255,0.008)
        );
}

.staff-modern-access-description {
    margin-top: 9px;
    margin-bottom: 20px;

    color: var(--muted);

    font-size: 11px;

    line-height: 1.5;
}


/* =============================================================
   ACCOUNT BAR
============================================================= */

.staff-modern-account-bar {
    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 20px;

    padding: 15px 0;

    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
}

.staff-modern-account-info {
    display: flex;

    align-items: center;

    gap: 12px;

    min-width: 0;
}

.staff-modern-account-name {
    margin-bottom: 5px;

    font-size: 13px;
    font-weight: 700;
}

.staff-modern-account-email {
    color: var(--muted);

    font-family: var(--mono);

    font-size: 8px;
}


/* =============================================================
   STATUS BUTTON
============================================================= */

.staff-modern-status-button {
    flex-shrink: 0;

    padding: 9px 12px;

    border: 1px solid
        rgba(255,77,0,0.3);

    background:
        rgba(255,77,0,0.05);

    color: var(--orange);

    font-family: var(--mono);

    font-size: 7px;
    font-weight: 800;

    letter-spacing: 1px;

    cursor: pointer;

    transition: 0.2s ease;
}

.staff-modern-status-button:hover {
    background:
        rgba(255,77,0,0.12);
}


/* =============================================================
   PERMISSION HEADER
============================================================= */

.staff-modern-permission-header {
    display: flex;

    align-items: flex-end;

    justify-content: space-between;

    gap: 20px;

    margin-top: 25px;
    margin-bottom: 17px;
}

.staff-modern-permission-kicker {
    margin-bottom: 5px;

    color: var(--muted);

    font-family: var(--mono);

    font-size: 7px;
    font-weight: 800;

    letter-spacing: 1.7px;
}

.staff-modern-permission-header h3 {
    margin: 0;

    font-family: var(--heading);

    font-size: 25px;

    line-height: 0.95;

    letter-spacing: 0;
}

.staff-modern-enabled {
    display: flex;

    align-items: baseline;

    gap: 6px;

    color: var(--orange);

    font-family: var(--mono);

    font-size: 7px;
    font-weight: 800;

    letter-spacing: 1px;
}

.staff-modern-enabled span {
    font-size: 21px;
}


/* =============================================================
   PERMISSION ROWS
============================================================= */

.staff-modern-permissions {
    display: flex;

    flex-direction: column;

    border-top: 1px solid var(--border);
}

.staff-modern-permission-row {
    display: grid;

    grid-template-columns:
        125px minmax(0, 1fr);

    align-items: center;

    gap: 15px;

    min-height: 58px;

    padding: 12px 0;

    border-bottom: 1px solid var(--border);
}

.staff-modern-permission-name {
    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 8px;
}

.staff-modern-permission-name span {
    font-family: var(--mono);

    font-size: 8px;
    font-weight: 800;

    letter-spacing: 1px;
}

.staff-modern-permission-name small {
    color: var(--orange);

    font-family: var(--mono);

    font-size: 8px;
    font-weight: 800;
}


/* =============================================================
   PERMISSION OPTIONS
============================================================= */

.staff-modern-options {
    display: flex;

    flex-wrap: wrap;

    gap: 7px;
}

.staff-modern-option {
    display: inline-flex;

    align-items: center;

    gap: 6px;

    min-height: 28px;

    padding: 5px 8px;

    border: 1px solid var(--border);

    background:
        rgba(255,255,255,0.018);

    color: var(--muted);

    font-size: 9px;

    cursor: pointer;

    user-select: none;

    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease;
}

.staff-modern-option:hover {
    border-color:
        rgba(255,77,0,0.3);
}

.staff-modern-option.enabled {
    border-color:
        rgba(255,77,0,0.28);

    background:
        rgba(255,77,0,0.055);

    color: var(--text);
}

.staff-modern-option input {
    display: none;
}

.staff-modern-check {
    display: inline-flex;

    align-items: center;
    justify-content: center;

    width: 14px;
    height: 14px;

    border: 1px solid
        rgba(255,255,255,0.18);

    color: var(--orange);

    font-size: 9px;
    font-weight: 800;
}

.staff-modern-option.enabled
.staff-modern-check {
    border-color: var(--orange);
}


/* =============================================================
   BOTTOM
============================================================= */

.staff-modern-bottom {
    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 20px;

    margin-top: 18px;
}

.staff-modern-message {
    min-height: 18px;

    color: #6fdc91;

    font-size: 10px;

    line-height: 1.4;
}

.staff-modern-message span {
    margin-right: 6px;
}

.staff-modern-save {
    flex-shrink: 0;

    padding: 11px 17px;

    border: 0;

    background: var(--orange);

    color: #fff;

    font-family: var(--mono);

    font-size: 8px;
    font-weight: 800;

    letter-spacing: 1px;

    cursor: pointer;

    transition:
        transform 0.2s ease,
        opacity 0.2s ease;
}

.staff-modern-save:hover {
    transform: translateY(-1px);
}

.staff-modern-save:disabled {
    opacity: 0.5;

    cursor: not-allowed;

    transform: none;
}


/* =============================================================
   LOADING / EMPTY
============================================================= */

.staff-modern-loading,
.staff-modern-empty {
    padding: 35px 20px;

    border: 1px solid var(--border);

    color: var(--muted);

    font-family: var(--mono);

    font-size: 9px;

    letter-spacing: 1px;

    text-align: center;
}


/* =============================================================
   RESPONSIVE
============================================================= */

@media (max-width: 900px) {

    .staff-modern-layout {
        grid-template-columns: 1fr;
    }

    .staff-modern-permission-row {
        grid-template-columns: 1fr;

        gap: 9px;
    }

}


@media (max-width: 600px) {

    .staff-modern-header {
        align-items: flex-start;

        flex-direction: column;
    }

    .staff-modern-count {
        align-self: flex-start;
    }

    .staff-modern-accounts,
    .staff-modern-access {
        padding: 18px;
    }

    .staff-modern-account-bar {
        align-items: flex-start;

        flex-direction: column;
    }

    .staff-modern-status-button {
        width: 100%;
    }

    .staff-modern-permission-header {
        align-items: flex-start;

        flex-direction: column;
    }

    .staff-modern-bottom {
        align-items: stretch;

        flex-direction: column;
    }

    .staff-modern-save {
        width: 100%;
    }

}

`;

export default StaffManagement;