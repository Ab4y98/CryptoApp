import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { savePreferences } from '../services/api';
import './Onboarding.css';

const INVESTOR_TYPES = ['HODLer', 'Day Trader', 'NFT Collector', 'DeFi Enthusiast', 'Crypto Newbie'];
const CONTENT_TYPES = ['Market News', 'Charts', 'Social', 'Fun'];
const POPULAR_ASSETS = ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'polkadot', 'dogecoin', 'matic-network'];

function Onboarding() {
  const [assets, setAssets] = useState([]);
  const [investorType, setInvestorType] = useState('');
  const [contentTypes, setContentTypes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

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
    setError('');

    if (!investorType) {
      setError('Please select your investor type');
      return;
    }

    if (contentTypes.length === 0) {
      setError('Please select at least one content type');
      return;
    }

    setLoading(true);

    try {
      await savePreferences(assets, investorType, contentTypes);
      updateUser({ hasPreferences: true });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="container">
        <div className="onboarding-card">
          <h1>Welcome! Let's personalize your dashboard</h1>
          <p className="subtitle">Answer a few questions to get started</p>

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

            {error && <div className="error">{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Continue to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;

