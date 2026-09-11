import { useNavigate } from 'react-router-dom';

export default function AdminLogout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');

    navigate('/admin/login', {
      replace: true,
    });
  };

  return (
    <button
      type="button"
      className="admin-logout-btn"
      onClick={handleLogout}
    >
      LOGOUT ↗
    </button>
  );
}