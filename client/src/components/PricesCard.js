import React from 'react';
import VoteButtons from './VoteButtons';
import './Card.css';

function PricesCard({ prices, onVote }) {
  if (!prices || prices.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h2>💰 Coin Prices</h2>
      {prices.map((coin) => (
        <div key={coin.id} className="price-item">
          <div className="price-header">
            <h3>{coin.name}</h3>
            <span className={`price-change ${coin.change24h >= 0 ? 'positive' : 'negative'}`}>
              {coin.change24h >= 0 ? '+' : ''}{coin.change24h?.toFixed(2)}%
            </span>
          </div>
          <p className="price-value">${coin.price?.toLocaleString()}</p>
          <VoteButtons
            targetType="price"
            targetId={coin.id}
            onVote={onVote}
          />
        </div>
      ))}
    </div>
  );
}

export default PricesCard;

