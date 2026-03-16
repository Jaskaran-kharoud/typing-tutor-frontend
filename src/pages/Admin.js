import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is admin
  if (!user || !user.isAdmin) {
    return (
      <div className="container">
        <div className="card">
          <h2>Access Denied</h2>
          <p>You must be an administrator to access this page.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Admin Panel</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Manage lessons, chapters, and practice sessions
        </p>

        <div className="mode-selection">
          <div className="mode-card" onClick={() => navigate('/admin/chapters')}>
            <h3>📚 Manage Chapters</h3>
            <p>
              Create, edit, and delete chapters and lessons. Add new content,
              update existing lessons, or reorganize the learning path.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
              Manage Chapters
            </button>
          </div>

          <div className="mode-card" onClick={() => navigate('/admin/practice')}>
            <h3>💪 Manage Practice Sessions</h3>
            <p>
              Create and edit practice sessions. Add new typing content,
              update existing sessions, or change difficulty levels.
            </p>
            <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }}>
              Manage Practice
            </button>
          </div>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/dashboard')}
          style={{ marginTop: '2rem' }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Admin;
