import { useState, useEffect } from 'react';

const loadingMessages = [
  'Parsing transcript structure...',
  'Identifying key themes...',
  'Analyzing communication patterns...',
  'Evaluating professionalism...',
  'Scoring engagement levels...',
  'Extracting evidence...',
  'Generating recommendations...',
  'Compiling final report...',
];

export default function LoadingState() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(msgTimer);
  }, []);

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(dotTimer);
  }, []);

  return (
    <div className="loading-state">
      <div className="loading-orb-container">
        <div className="loading-orb">
          <div className="loading-orb-ring loading-orb-ring-1" />
          <div className="loading-orb-ring loading-orb-ring-2" />
          <div className="loading-orb-ring loading-orb-ring-3" />
          <div className="loading-orb-core">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
              <circle cx="12" cy="15" r="2" />
            </svg>
          </div>
        </div>
      </div>
      <div className="loading-text-container">
        <p className="loading-title">AI is analyzing your transcript{dots}</p>
        <p className="loading-subtitle" key={msgIndex}>{loadingMessages[msgIndex]}</p>
      </div>
      <div className="loading-progress-track">
        <div className="loading-progress-bar" />
      </div>
    </div>
  );
}
