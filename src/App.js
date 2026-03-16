import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Practice from './pages/Practice';
import Lesson from './pages/Lesson';
import PracticeSession from './pages/PracticeSession';
import Admin from './pages/Admin';
import AdminChapters from './pages/AdminChapters';
import AdminPractice from './pages/AdminPractice';
import LanguageSelection from './pages/LanguageSelection';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has selected a language
  const selectedLanguage = localStorage.getItem('selectedLanguage');
  if (!selectedLanguage && window.location.pathname !== '/language-selection') {
    return <Navigate to="/language-selection" replace />;
  }

  return children;
};

// Public Route Component (redirect to language selection or dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (user) {
    // Check if user has selected a language
    const selectedLanguage = localStorage.getItem('selectedLanguage');
    if (!selectedLanguage) {
      return <Navigate to="/language-selection" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/language-selection"
            element={
              <ProtectedRoute>
                <LanguageSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <Learn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson/:chapterId/:lessonId"
            element={
              <ProtectedRoute>
                <Lesson />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice-session/:sessionNumber"
            element={
              <ProtectedRoute>
                <PracticeSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chapters"
            element={
              <ProtectedRoute>
                <AdminChapters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/practice"
            element={
              <ProtectedRoute>
                <AdminPractice />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
 