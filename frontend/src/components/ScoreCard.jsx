import { useState, useEffect } from 'react';

const scoreGradients = {
  communication: { from: '#6366f1', to: '#a855f7', bg: 'rgba(99, 102, 241, 0.08)' },
  professionalism: { from: '#06b6d4', to: '#3b82f6', bg: 'rgba(6, 182, 212, 0.08)' },
  engagement: { from: '#f59e0b', to: '#ef4444', bg: 'rgba(245, 158, 11, 0.08)' },
};

const scoreIcons = {
  communication: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  professionalism: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  engagement: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

function getScoreLabel(score) {
  if (score >= 9) return 'Excellent';
  if (score >= 7) return 'Good';
  if (score >= 5) return 'Average';
  if (score >= 3) return 'Below Avg';
  return 'Poor';
}

export default function ScoreCard({ name, score, reason, delay = 0 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [visible, setVisible] = useState(false);
  const gradient = scoreGradients[name] || scoreGradients.communication;
  const icon = scoreIcons[name];
  const percentage = (score / 10) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    let current = 0;
    const step = score / 30;
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(interval);
      } else {
        setAnimatedScore(Math.round(current * 10) / 10);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [visible, score]);

  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <div
      className="score-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        background: gradient.bg,
        borderColor: `${gradient.from}30`,
      }}
    >
      <div className="score-card-header">
        <div className="score-card-icon" style={{ color: gradient.from }}>
          {icon}
        </div>
        <div className="score-card-title">
          <span className="score-card-name">{displayName}</span>
          <span className="score-card-label" style={{ color: gradient.from }}>
            {getScoreLabel(score)}
          </span>
        </div>
        <div className="score-card-value" style={{
          background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {Math.round(animatedScore)}<span className="score-card-max">/10</span>
        </div>
      </div>

      <div className="score-card-bar-track">
        <div
          className="score-card-bar-fill"
          style={{
            width: visible ? `${percentage}%` : '0%',
            background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})`,
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: `${delay + 200}ms`,
          }}
        />
      </div>

      <p className="score-card-reason">{reason}</p>
    </div>
  );
}
