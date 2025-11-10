import React from 'react';
import './VoteButtons.css';

function VoteButtons({ targetType, targetId, onVote }) {
  const handleVote = (vote) => {
    if (onVote) {
      onVote(targetType, targetId, vote);
    }
  };

  return (
    <div className="vote-buttons">
      <button
        onClick={() => handleVote(1)}
        className="vote-btn up"
        title="Thumbs up"
      >
        👍
      </button>
      <button
        onClick={() => handleVote(-1)}
        className="vote-btn down"
        title="Thumbs down"
      >
        👎
      </button>
    </div>
  );
}

export default VoteButtons;

