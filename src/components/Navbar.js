import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1 onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          ⌨️ Typing Tutor
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>Welcome, {user.username}!</span>
          {user.isAdmin && (
            <button onClick={() => navigate('/admin')} style={{ background: '#764ba2' }}>
              Admin Panel
            </button>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
