import React from 'react';
import './DashboardFooter.css';

function DashboardFooter({ updatedAt, onRefresh }) {
  return (
    <div className="dashboard-footer">
      <p>Last updated: {new Date(updatedAt).toLocaleString()}</p>
      <button onClick={onRefresh} className="btn btn-primary">
        Refresh Dashboard
      </button>
    </div>
  );
}

export default DashboardFooter;

