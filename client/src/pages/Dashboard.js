import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboard, submitFeedback } from '../services/api';
import NewsCard from '../components/NewsCard';
import PricesCard from '../components/PricesCard';
import InsightCard from '../components/InsightCard';
import MemeCard from '../components/MemeCard';
import DashboardHeader from '../components/DashboardHeader';
import DashboardFooter from '../components/DashboardFooter';
import { shouldShowContent } from '../utils/contentTypeMapping';
import './Dashboard.css';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    fetchDashboard();
  }, [location.key]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      console.log('Dashboard data received:', response.data); // Debug log
      console.log('News data:', response.data?.news); // Debug log
      setDashboardData(response.data);
      setError('');
    } catch (err) {
      console.error('Dashboard fetch error:', err); // Debug log
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (targetType, targetId, vote) => {
    try {
      await submitFeedback(targetType, targetId, vote);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const renderDashboardContent = () => {
    if (!dashboardData) return null;

    const preferences = dashboardData.preferences || {};
    const contentTypes = preferences.contentTypes || [];

    // Debug logging
    console.log('Content types:', contentTypes);
    console.log('Should show Market News:', shouldShowContent('Market News', { contentTypes }));
    console.log('News data:', dashboardData.news);

    return (
      <div className="dashboard-grid">
        {shouldShowContent('Market News', { contentTypes }) && (
          <NewsCard news={dashboardData.news} onVote={handleVote} />
        )}
        
        {shouldShowContent('Charts', { contentTypes }) && (
          <PricesCard prices={dashboardData.prices} onVote={handleVote} />
        )}
        
        {shouldShowContent('Social', { contentTypes }) && (
          <InsightCard insight={dashboardData.insight} onVote={handleVote} />
        )}
        
        {shouldShowContent('Fun', { contentTypes }) && (
          <MemeCard meme={dashboardData.meme} onVote={handleVote} />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="container">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="container">
          <div className="error">{error}</div>
          <button onClick={fetchDashboard} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        <DashboardHeader
          userName={user?.name}
          onProfileClick={() => navigate('/profile')}
          onLogout={handleLogout}
        />

        {renderDashboardContent()}

        {dashboardData && (
          <DashboardFooter
            updatedAt={dashboardData.updatedAt}
            onRefresh={fetchDashboard}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
