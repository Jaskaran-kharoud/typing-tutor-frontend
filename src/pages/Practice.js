import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { practiceAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const Practice = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    fetchPracticeSessions();
  }, [language]);

  const fetchPracticeSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await practiceAPI.getAll(language);
      setSessions(response.data);
    } catch (err) {
      console.error('Error fetching practice sessions:', err);
      setError('Failed to load practice sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (sessionNumber) => {
    navigate(`/practice-session/${sessionNumber}`);
  };

  if (loading) return <div className="loading">Loading practice sessions...</div>;

  if (error) return (
    <div className="container">
      <div className="error">{error}</div>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );

  return (
    <div className="container">
      <div className="card">
        <h2>Practice Mode</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Choose from 10 timed practice sessions to improve your typing speed and accuracy
        </p>
        <div className="practice-grid">
          {sessions.map((session) => (
            <div key={session._id} className="practice-card" onClick={() => handleSessionClick(session.sessionNumber)}>
              <h3>Session {session.sessionNumber}</h3>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>{session.title}</h4>
              <p>{session.description}</p>
              <div className="duration">⏱️ {session.duration} minutes | 📝 {session.minWords}+ words</div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={(e) => { e.stopPropagation(); handleSessionClick(session.sessionNumber); }}
              >
                Start Session
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ marginTop: '2rem' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Practice;