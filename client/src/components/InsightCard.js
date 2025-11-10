import React from 'react';
import VoteButtons from './VoteButtons';
import './Card.css';

function InsightCard({ insight, onVote }) {
  if (!insight) {
    return null;
  }

  return (
    <div className="card">
      <h2>🤖 AI Insight of the Day</h2>
      <div className="insight-content">
        <p>{insight.text}</p>
        <p className="insight-meta">
          Generated: {new Date(insight.generatedAt).toLocaleString()}
        </p>
      </div>
      <VoteButtons
        targetType="insight"
        targetId={insight.id}
        onVote={onVote}
      />
    </div>
  );
}

export default InsightCard;

