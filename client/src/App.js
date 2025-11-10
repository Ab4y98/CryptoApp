import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginSignup from './pages/LoginSignup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';


function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
}

function AppRoutes() {
  const { user, token, loading } = useAuth();

  // Show nothing while loading auth state
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          token 
            ? (user?.hasPreferences ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />)
            : <LoginSignup />
        } 
      />
      <Route 
        path="/onboarding" 
        element={
          <PrivateRoute>
            {user?.hasPreferences ? <Navigate to="/dashboard" /> : <Onboarding />}
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            {!user?.hasPreferences ? <Navigate to="/onboarding" /> : <Dashboard />}
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

