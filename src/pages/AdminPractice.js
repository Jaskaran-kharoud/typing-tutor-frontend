import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { practiceAPI } from '../services/api';

const AdminPractice = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await practiceAPI.getAll();
      setSessions(response.data);
    } catch (err) {
      console.error('Error fetching practice sessions:', err);
      setError('Failed to load practice sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSession = (session) => {
    setEditingSession({ ...session });
  };

  const handleSaveSession = async () => {
    try {
      await practiceAPI.update(editingSession._id, editingSession);
      await fetchSessions();
      setEditingSession(null);
      alert('Practice session updated successfully!');
    } catch (err) {
      console.error('Error updating session:', err);
      alert('Failed to update session: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this practice session? This cannot be undone.')) {
      return;
    }

    try {
      await practiceAPI.delete(sessionId);
      await fetchSessions();
      alert('Practice session deleted successfully!');
    } catch (err) {
      console.error('Error deleting session:', err);
      alert('Failed to delete session: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading practice sessions...</div>;
  }

  // Editing session modal
  if (editingSession) {
    return (
      <div className="container">
        <div className="card">
          <h2>Edit Practice Session {editingSession.sessionNumber}</h2>
          
          <div className="form-group">
            <label>Session Title</label>
            <input
              type="text"
              value={editingSession.title}
              onChange={(e) => setEditingSession({ ...editingSession, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={editingSession.description}
              onChange={(e) => setEditingSession({ ...editingSession, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Content (what user will type)</label>
            <textarea
              value={editingSession.content}
              onChange={(e) => setEditingSession({ ...editingSession, content: e.target.value })}
              rows="15"
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                fontSize: '1rem', 
                fontFamily: 'monospace',
                border: '2px solid #ddd',
                borderRadius: '5px'
              }}
            />
            <small style={{ color: '#666' }}>
              Character count: {editingSession.content.length} | 
              Word count: ~{Math.round(editingSession.content.split(/\s+/).length)} |
              {editingSession.content.split(/\s+/).length >= 800 ? ' ✓ Meets minimum' : ' ⚠️ Below 800 words'}
            </small>
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={editingSession.duration}
              onChange={(e) => setEditingSession({ ...editingSession, duration: parseInt(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>Minimum Words</label>
            <input
              type="number"
              value={editingSession.minWords}
              onChange={(e) => setEditingSession({ ...editingSession, minWords: parseInt(e.target.value) })}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-success" onClick={handleSaveSession}>
              Save Session
            </button>
            <button className="btn btn-secondary" onClick={() => setEditingSession(null)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main sessions list
  return (
    <div className="container">
      <div className="card">
        <h2>Manage Practice Sessions</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Click on a session to edit its content and details
        </p>

        {error && <div className="error">{error}</div>}

        <div className="practice-grid">
          {sessions.map((session) => (
            <div key={session._id} className="practice-card">
              <h3>Session {session.sessionNumber}</h3>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>{session.title}</h4>
              <p>{session.description}</p>
              <div className="duration" style={{ marginBottom: '1rem' }}>
                ⏱️ {session.duration} minutes | 📝 {session.minWords}+ words
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => handleEditSession(session)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, background: '#dc3545' }}
                  onClick={() => handleDeleteSession(session._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/admin')}
          style={{ marginTop: '2rem' }}
        >
          Back to Admin Panel
        </button>
      </div>
    </div>
  );
};

export default AdminPractice;
