import React from 'react';
import './DashboardHeader.css';

function DashboardHeader({ userName, onProfileClick, onLogout }) {
  return (
    <header className="dashboard-header">
      <h1>Welcome back, {userName}!</h1>
      <div className="header-actions">
        <button onClick={onProfileClick} className="btn btn-secondary">
          Profile
        </button>
        <button onClick={onLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;

