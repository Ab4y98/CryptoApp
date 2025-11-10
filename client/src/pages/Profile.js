import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import './Profile.css';

const INVESTOR_TYPES = ['HODLer', 'Day Trader', 'NFT Collector', 'DeFi Enthusiast', 'Crypto Newbie'];
const CONTENT_TYPES = ['Market News', 'Charts', 'Social', 'Fun'];
const POPULAR_ASSETS = ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'polkadot', 'dogecoin', 'matic-network'];

function Profile() {
  const [assets, setAssets] = useState([]);
  const [investorType, setInvestorType] = useState('');
  const [contentTypes, setContentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      const prefs = response.data.preferences || {};
      setAssets(prefs.assets || []);
      setInvestorType(prefs.investorType || '');
      setContentTypes(prefs.contentTypes || []);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAsset = (asset) => {
    setAssets(prev =>
      prev.includes(asset)
        ? prev.filter(a => a !== asset)
        : [...prev, asset]
    );
  };

  const toggleContentType = (type) => {
    setContentTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateProfile(assets, investorType, contentTypes);
      setMessage('Preferences updated successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="container">
        <div className="profile-header">
          <h1>Profile & Preferences</h1>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-info">
            <h2>User Information</h2>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="section">
              <h2>What crypto assets are you interested in?</h2>
              <div className="asset-grid">
                {POPULAR_ASSETS.map(asset => (
                  <button
                    key={asset}
                    type="button"
                    className={`asset-btn ${assets.includes(asset) ? 'active' : ''}`}
                    onClick={() => toggleAsset(asset)}
                  >
                    {asset.charAt(0).toUpperCase() + asset.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="section">
              <h2>What type of investor are you?</h2>
              <div className="option-group">
                {INVESTOR_TYPES.map(type => (
                  <label key={type} className="radio-label">
                    <input
                      type="radio"
                      name="investorType"
                      value={type}
                      checked={investorType === type}
                      onChange={(e) => setInvestorType(e.target.value)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="section">
              <h2>What kind of content would you like to see?</h2>
              <div className="option-group">
                {CONTENT_TYPES.map(type => (
                  <label key={type} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={contentTypes.includes(type)}
                      onChange={() => toggleContentType(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {message && (
              <div className={message.includes('success') ? 'success' : 'error'}>
                {message}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;

