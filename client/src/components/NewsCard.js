import React from 'react';
import VoteButtons from './VoteButtons';
import './Card.css';

function NewsCard({ news, onVote }) {
  // Debug logging
  console.log('NewsCard received news:', news);
  
  if (!news || news.length === 0) {
    console.log('NewsCard: No news data, returning null');
    return (
      <div className="card">
        <h2>📰 Market News</h2>
        <p>No news available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>📰 Market News</h2>
      {news.map((item) => (
        <div key={item.id} className="news-item">
          <h3>{item.title}</h3>
          <p className="news-meta">
            {item.source} • {new Date(item.published_at).toLocaleDateString()}
          </p>
          {item.url && item.url !== '#' && item.url.startsWith('http') ? (
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="news-link"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Read more →
            </a>
          ) : (
            <span className="news-link" style={{ color: '#999', cursor: 'not-allowed', textDecoration: 'none' }}>
              Read more (URL not available)
            </span>
          )}
          <VoteButtons
            targetType="news"
            targetId={item.id}
            onVote={onVote}
          />
        </div>
      ))}
    </div>
  );
}

export default NewsCard;

