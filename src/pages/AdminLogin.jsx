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
   HELPER FUNCTIONS
   ========================================================= */

/**
 * Normalize a branch name safely.
 */
const normalizeBranch = (branch) => {
    if (!branch) {
        return '';
    }

    return String(branch).trim();
};

/**
 * Normalize and validate multiple branches.
 */
const normalizeBranches = (branches) => {
    if (!Array.isArray(branches)) {
        return [];
    }

    return [
        ...new Set(
            branches
                .map(normalizeBranch)
                .filter((branch) =>
                    ALLOWED_BRANCHES.includes(branch)
                )
        ),
    ];
};

/**
 * Clear all authentication-related localStorage.
 *
 * This prevents stale branch/role information from a
 * previous login from affecting the next login.
 */
const clearLoginStorage = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('gymBranch');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('accessibleBranches');
    localStorage.removeItem('adminPermissions');
    localStorage.removeItem('adminLoggedIn');
};

/* =========================================================
   ADMIN LOGIN
   ========================================================= */

export default function AdminLogin() {
    const navigate = useNavigate();

    /* =======================================================
       FORM STATE
    ======================================================= */

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    /* =======================================================
       UI STATE
    ======================================================= */

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
               SAFE RESPONSE PARSING
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
               VALIDATE TOKEN
            ------------------------------------------------- */

            if (!data.token) {
                throw new Error(
                    'Login succeeded but no authentication token was returned.'
                );
            }

            /* =================================================
               ADMIN DATA FROM BACKEND
            ================================================= */

            const admin = data.admin || {};

            /* =================================================
               ROLE
            ================================================= */

            const role = normalizeBranch(
                admin.role ||
                data.role
            ).toLowerCase();

            if (!role) {
                throw new Error(
                    'No user role was returned by the server.'
                );
            }

            /* =================================================
               DETERMINE BRANCH ACCESS
            ================================================= */

            let gymBranch = null;
            let accessibleBranches = [];

            /* =================================================
               MAIN ADMIN
            ================================================= */

            if (
                MAIN_ADMIN_ROLES.includes(role)
            ) {
                /*
                    Main administrators have access to
                    both gym branches.

                    There is intentionally no active branch
                    yet. AdminDashboard can select:

                    Kalyanpur
                    Gopalpur
                    ALL BRANCHES
                */

                accessibleBranches = [
                    'Kalyanpur',
                    'Gopalpur',
                ];

                gymBranch = null;
            }

            /* =================================================
               RECEPTIONIST / STAFF
            ================================================= */

            else {
                /*
                    New multi-branch system:

                    gymBranches:
                    [
                        'Kalyanpur',
                        'Gopalpur'
                    ]

                    A receptionist can be assigned to
                    one or multiple branches.
                */

                const backendBranches =
                    admin.gymBranches ||
                    data.gymBranches ||
                    [];

                /*
                    Primary multi-branch source.
                */

                accessibleBranches =
                    normalizeBranches(
                        backendBranches
                    );

                /*
                    BACKWARD COMPATIBILITY

                    If an older account does not yet have
                    gymBranches but still has gymBranch,
                    allow that single branch.
                */

                if (
                    accessibleBranches.length === 0
                ) {
                    const legacyBranch =
                        normalizeBranch(
                            admin.gymBranch ||
                            data.gymBranch
                        );

                    if (
                        ALLOWED_BRANCHES.includes(
                            legacyBranch
                        )
                    ) {
                        accessibleBranches = [
                            legacyBranch,
                        ];
                    }
                }

                /* -------------------------------------------------
                   VALIDATE BRANCH ACCESS
                ------------------------------------------------- */

                if (
                    accessibleBranches.length === 0
                ) {
                    throw new Error(
                        'Your account is not assigned to a valid gym branch. Please contact the administrator.'
                    );
                }

                /*
                    First assigned branch becomes the initial
                    active branch.

                    AdminDashboard can allow the receptionist
                    to switch between all assigned branches.
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

                /*
                    Current active branch.

                    Main admin:
                    null

                    Receptionist:
                    first assigned branch
                */
                gymBranch,

                /*
                    Complete multi-branch access.
                */
                gymBranches:
                    accessibleBranches,

                /*
                    Used by AdminDashboard.
                */
                accessibleBranches,

                permissions,
            };

            /* =================================================
               CLEAR OLD LOGIN DATA
            ================================================= */

            clearLoginStorage();

            /* =================================================
               SAVE JWT TOKEN
            ================================================= */

            localStorage.setItem(
                'adminToken',
                data.token
            );

            /* =================================================
               SAVE COMPLETE ADMIN DATA
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
               REDIRECT TO DASHBOARD
            ================================================= */

            navigate('/admin', {
                replace: true,
            });

        } catch (error) {
            /* =================================================
               LOGIN ERROR
            ================================================= */

            console.error(
                'Admin Login Error:',
                error
            );

            /* -------------------------------------------------
               CLEAR STALE AUTH DATA
            ------------------------------------------------- */

            clearLoginStorage();

            /* -------------------------------------------------
               SHOW ERROR
            ------------------------------------------------- */

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

                {/* =================================================
                    BRAND
                ================================================= */}

                <span className="section-tag">
                    ALPHA GYM
                </span>

                {/* =================================================
                    TITLE
                ================================================= */}

                <h1>
                    ADMIN <span>LOGIN.</span>
                </h1>

                <p>
                    Access your Alpha Gym
                    management dashboard.
                </p>

                {/* =================================================
                    LOGIN FORM
                ================================================= */}

                <form
                    onSubmit={handleLogin}
                >

                    {/* =================================================
                        EMAIL
                    ================================================= */}

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

                    {/* =================================================
                        PASSWORD
                    ================================================= */}

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

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div
                            className="admin-login-error"
                            role="alert"
                            aria-live="polite"
                        >
                            {error}
                        </div>
                    )}

                    {/* =================================================
                        LOGIN BUTTON
                    ================================================= */}

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

                {/* =================================================
                    SECURITY STATUS
                ================================================= */}

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