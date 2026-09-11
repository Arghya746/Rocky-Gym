import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        'http://localhost:5000/api/admin/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            email,
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

      // Save JWT token
      localStorage.setItem(
        'adminToken',
        data.token
      );

      // Save admin information
      localStorage.setItem(
        'adminData',
        JSON.stringify(data.admin)
      );

      // Redirect to dashboard
      navigate('/admin');

    } catch (error) {
      console.error('Admin Login Error:', error);

      setError(
        error.message || 'Unable to login.'
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
          Access your Alpha Gym management dashboard.
        </p>


        <form onSubmit={handleLogin}>

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
                setEmail(e.target.value)
              }
              required
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
                setPassword(e.target.value)
              }
              required
            />

          </div>


          {/* ERROR */}

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}


          {/* BUTTON */}

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
          <span>●</span>
          SECURE ADMIN ACCESS
        </div>

      </div>

    </div>
  );
}