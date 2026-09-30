import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

/* =========================================================
   VALID GYM BRANCHES
   ========================================================= */

const ALLOWED_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

/* =========================================================
   MAIN ADMIN ROLES
   ========================================================= */

const MAIN_ADMIN_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
];

/* =========================================================
   STAFF / RECEPTION ROLES
   ========================================================= */

const STAFF_ROLES = [
    'receptionist',
    'staff',
];

/* =========================================================
   NORMALIZE ROLE
   ========================================================= */

const normalizeRole = (role) => {
    if (!role) {
        return '';
    }

    return String(role)
        .trim()
        .toLowerCase();
};

/* =========================================================
   NORMALIZE BRANCH
   ========================================================= */

const normalizeBranch = (branch) => {
    if (!branch) {
        return '';
    }

    const value = String(branch)
        .trim()
        .toLowerCase();

    if (value === 'kalyanpur') {
        return 'Kalyanpur';
    }

    if (value === 'gopalpur') {
        return 'Gopalpur';
    }

    return '';
};

/* =========================================================
   NORMALIZE MULTIPLE BRANCHES
   ========================================================= */

const normalizeBranches = (branches) => {
    if (!Array.isArray(branches)) {
        return [];
    }

    return [
        ...new Set(
            branches
                .map(normalizeBranch)
                .filter(Boolean)
        ),
    ];
};

/* =========================================================
   CLEAR AUTH STORAGE
   ========================================================= */

const clearLoginStorage = () => {
    const keys = [
        'adminToken',
        'adminData',
        'adminUser',
        'user',
        'gymBranch',
        'adminRole',
        'accessibleBranches',
        'adminPermissions',
        'adminLoggedIn',
    ];

    keys.forEach((key) => {
        localStorage.removeItem(key);
    });
};

/* =========================================================
   ADMIN LOGIN
   ========================================================= */

export default function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /* =======================================================
       LOGIN HANDLER
    ======================================================= */

    const handleLogin = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            /* -------------------------------------------------
               BASIC VALIDATION
            ------------------------------------------------- */

            const normalizedEmail =
                email.trim().toLowerCase();

            if (!normalizedEmail) {
                throw new Error(
                    'Please enter your email address.'
                );
            }

            if (!password) {
                throw new Error(
                    'Please enter your password.'
                );
            }

            /* -------------------------------------------------
               LOGIN REQUEST
            ------------------------------------------------- */

            const response = await fetch(
                `${API_URL}/api/admin/login`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                    },

                    body: JSON.stringify({
                        email: normalizedEmail,
                        password,
                    }),
                }
            );

            /* -------------------------------------------------
               SAFE JSON RESPONSE
            ------------------------------------------------- */

            let data = {};

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    'The server returned an invalid response. Please try again.'
                );
            }

            /* -------------------------------------------------
               BACKEND ERROR
            ------------------------------------------------- */

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    `Login failed (${response.status}).`
                );
            }

            /* -------------------------------------------------
               TOKEN VALIDATION
            ------------------------------------------------- */

            if (!data.token) {
                throw new Error(
                    'Login succeeded but no authentication token was returned.'
                );
            }

            /* -------------------------------------------------
               ADMIN DATA
            ------------------------------------------------- */

            const admin =
                data.admin || {};

            /* -------------------------------------------------
               ROLE

               IMPORTANT:
               Do NOT use normalizeBranch() here.
            ------------------------------------------------- */

            const role = normalizeRole(
                admin.role ||
                data.role
            );

            if (!role) {
                throw new Error(
                    'No user role was returned by the server.'
                );
            }

            /* -------------------------------------------------
               VALIDATE ROLE
            ------------------------------------------------- */

            const isMainAdmin =
                MAIN_ADMIN_ROLES.includes(role);

            const isStaff =
                STAFF_ROLES.includes(role);

            if (!isMainAdmin && !isStaff) {
                throw new Error(
                    'Invalid account role returned by the server.'
                );
            }

            /* =================================================
               BRANCH ACCESS
            ================================================= */

            let gymBranch = null;
            let accessibleBranches = [];

            /* =================================================
               MAIN ADMIN
            ================================================= */

            if (isMainAdmin) {
                /*
                 * Main admin has access to ALL branches.
                 */

                accessibleBranches = [
                    ...ALLOWED_BRANCHES,
                ];

                /*
                 * Do not force the main admin to one branch.
                 *
                 * AdminDashboard can select:
                 * - ALL BRANCHES
                 * - Kalyanpur
                 * - Gopalpur
                 */

                gymBranch = null;
            }

            /* =================================================
               RECEPTIONIST / STAFF
            ================================================= */

            if (isStaff) {
                const backendBranches =
                    admin.gymBranches ||
                    data.gymBranches ||
                    [];

                accessibleBranches =
                    normalizeBranches(
                        backendBranches
                    );

                /* -------------------------------------------------
                   LEGACY SINGLE-BRANCH SUPPORT
                ------------------------------------------------- */

                if (
                    accessibleBranches.length === 0
                ) {
                    const legacyBranch =
                        normalizeBranch(
                            admin.gymBranch ||
                            data.gymBranch
                        );

                    if (legacyBranch) {
                        accessibleBranches = [
                            legacyBranch,
                        ];
                    }
                }

                /* -------------------------------------------------
                   REQUIRE BRANCH
                ------------------------------------------------- */

                if (
                    accessibleBranches.length === 0
                ) {
                    throw new Error(
                        'Your account is not assigned to a valid gym branch. Please contact the administrator.'
                    );
                }

                /*
                 * First assigned branch becomes
                 * the initial active branch.
                 */

                gymBranch =
                    accessibleBranches[0];
            }

            /* =================================================
               PERMISSIONS
            ================================================= */

            const permissions =
                admin.permissions &&
                typeof admin.permissions === 'object'
                    ? admin.permissions
                    : {};

            /* =================================================
               COMPLETE ADMIN DATA
            ================================================= */

            const adminData = {
                ...admin,

                role,

                gymBranch,

                gymBranches:
                    accessibleBranches,

                accessibleBranches,

                permissions,
            };

            /* =================================================
               CLEAR OLD AUTH DATA
            ================================================= */

            clearLoginStorage();

            /* =================================================
               SAVE TOKEN
            ================================================= */

            localStorage.setItem(
                'adminToken',
                data.token
            );

            /* =================================================
               SAVE ADMIN DATA
            ================================================= */

            localStorage.setItem(
                'adminData',
                JSON.stringify(adminData)
            );

            /* =================================================
               SAVE ROLE
            ================================================= */

            localStorage.setItem(
                'adminRole',
                role
            );

            /* =================================================
               SAVE ACTIVE BRANCH
            ================================================= */

            localStorage.setItem(
                'gymBranch',
                gymBranch || ''
            );

            /* =================================================
               SAVE ACCESSIBLE BRANCHES
            ================================================= */

            localStorage.setItem(
                'accessibleBranches',
                JSON.stringify(
                    accessibleBranches
                )
            );

            /* =================================================
               SAVE PERMISSIONS
            ================================================= */

            localStorage.setItem(
                'adminPermissions',
                JSON.stringify(
                    permissions
                )
            );

            /* =================================================
               SAVE LOGIN STATUS
            ================================================= */

            localStorage.setItem(
                'adminLoggedIn',
                'true'
            );

            /* =================================================
               REDIRECT
            ================================================= */

            navigate('/admin', {
                replace: true,
            });

        } catch (error) {
            console.error(
                'Admin Login Error:',
                error
            );

            clearLoginStorage();

            setError(
                error?.message ||
                'Unable to login. Please check your credentials and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================
       UI
    ========================================================= */

    return (
        <div className="admin-login">

            <div className="admin-login-card">

                <span className="section-tag">
                    ALPHA GYM
                </span>

                <h1>
                    ADMIN <span>LOGIN.</span>
                </h1>

                <p>
                    Access your Alpha Gym
                    management dashboard.
                </p>

                <form
                    onSubmit={handleLogin}
                >

                    <div className="admin-login-field">

                        <label htmlFor="email">
                            EMAIL
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            required
                            autoComplete="email"
                            disabled={loading}
                        />

                    </div>

                    <div className="admin-login-field">

                        <label htmlFor="password">
                            PASSWORD
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            required
                            autoComplete="current-password"
                            disabled={loading}
                        />

                    </div>

                    {error && (
                        <div
                            className="admin-login-error"
                            role="alert"
                            aria-live="polite"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={loading}
                    >
                        {loading
                            ? 'AUTHENTICATING...'
                            : 'LOGIN →'}
                    </button>

                </form>

                <div className="admin-login-status">

                    <span>
                        ●
                    </span>

                    SECURE ADMIN ACCESS

                </div>

            </div>

        </div>
    );
}