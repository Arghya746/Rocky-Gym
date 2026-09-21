import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

export default function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');

            const response = await fetch(
                `${API_URL}/api/admin/login`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Login failed.'
                );
            }

            // =====================================
            // ADMIN DATA FROM BACKEND
            // =====================================

            const admin = data.admin || {};

            // =====================================
            // ROLE
            // =====================================

            const role =
                admin.role ||
                data.role ||
                'receptionist';

            // =====================================
            // ALLOWED BRANCHES
            // =====================================

            const allowedBranches = [
                'Kalyanpur',
                'Gopalpur',
            ];

            // =====================================
            // DETERMINE BRANCH ACCESS
            // =====================================

            let gymBranch = null;
            let accessibleBranches = [];

            // =====================================
            // MAIN ADMIN
            // =====================================

            if (role === 'admin') {
                /*
                    Main Admin has access to
                    BOTH gym branches.
                */

                accessibleBranches = [
                    'Kalyanpur',
                    'Gopalpur',
                ];

                /*
                    Main admin is not restricted
                    to one branch.
                */

                gymBranch = null;
            }

            // =====================================
            // RECEPTIONIST
            // =====================================

            else {
                /*
                    Receptionist must have an
                    assigned gym branch.
                */

                gymBranch =
                    admin.gymBranch ||
                    data.gymBranch ||
                    null;

                if (
                    !gymBranch ||
                    !allowedBranches.includes(
                        gymBranch
                    )
                ) {
                    throw new Error(
                        'Invalid gym branch assigned to this receptionist account.'
                    );
                }

                /*
                    Receptionist can access
                    ONLY their assigned branch.
                */

                accessibleBranches = [
                    gymBranch,
                ];
            }

            // =====================================
            // PERMISSIONS
            // =====================================

            const permissions =
                admin.permissions || {};

            // =====================================
            // COMPLETE ADMIN DATA
            // =====================================

            const adminData = {
                ...admin,

                role,

                gymBranch,

                accessibleBranches,

                permissions,
            };

            // =====================================
            // SAVE JWT TOKEN
            // =====================================

            localStorage.setItem(
                'adminToken',
                data.token
            );

            // =====================================
            // SAVE COMPLETE ADMIN DATA
            // =====================================

            localStorage.setItem(
                'adminData',
                JSON.stringify(adminData)
            );

            // =====================================
            // SAVE ROLE
            // =====================================

            localStorage.setItem(
                'adminRole',
                role
            );

            // =====================================
            // SAVE CURRENT BRANCH
            // =====================================

            /*
                Main Admin:
                    gymBranch = ''

                Receptionist:
                    Kalyanpur
                    OR
                    Gopalpur
            */

            localStorage.setItem(
                'gymBranch',
                gymBranch || ''
            );

            // =====================================
            // SAVE ACCESSIBLE BRANCHES
            // =====================================

            localStorage.setItem(
                'accessibleBranches',
                JSON.stringify(
                    accessibleBranches
                )
            );

            // =====================================
            // SAVE PERMISSIONS
            // =====================================

            localStorage.setItem(
                'adminPermissions',
                JSON.stringify(
                    permissions
                )
            );

            // =====================================
            // SAVE LOGIN STATUS
            // =====================================

            localStorage.setItem(
                'adminLoggedIn',
                'true'
            );

            // =====================================
            // REDIRECT
            // =====================================

            navigate('/admin', {
                replace: true,
            });

        } catch (error) {
            console.error(
                'Admin Login Error:',
                error
            );

            // =====================================
            // CLEAR STALE LOGIN DATA
            // =====================================

            localStorage.removeItem(
                'adminToken'
            );

            localStorage.removeItem(
                'adminData'
            );

            localStorage.removeItem(
                'gymBranch'
            );

            localStorage.removeItem(
                'adminRole'
            );

            localStorage.removeItem(
                'accessibleBranches'
            );

            localStorage.removeItem(
                'adminPermissions'
            );

            localStorage.removeItem(
                'adminLoggedIn'
            );

            setError(
                error.message ||
                'Unable to login.'
            );

        } finally {
            setLoading(false);
        }
    };

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

                    {/* EMAIL */}

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
                        />

                    </div>


                    {/* PASSWORD */}

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
                        />

                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="admin-login-error">
                            {error}
                        </div>
                    )}


                    {/* LOGIN BUTTON */}

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


                {/* STATUS */}

                <div className="admin-login-status">

                    <span>●</span>

                    SECURE ADMIN ACCESS

                </div>

            </div>

        </div>
    );
}