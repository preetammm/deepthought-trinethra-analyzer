import { useState, useRef, useEffect, useCallback } from 'react';
import HistorySidebar from './components/HistorySidebar';
import AnalysisResult from './components/AnalysisResult';
import LoadingState from './components/LoadingState';
import ExportButtons from './components/ExportButtons';
import './App.css';

const HISTORY_KEY = 'trinethra-history';
const API_URL = 'http://localhost:5000';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch { /* storage full */ }
}

function App() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(loadHistory);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  const scrollRef = useRef(null);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        setBackendStatus(data.ollama ? 'online' : 'degraded');
      } catch {
        setBackendStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom on new results
  useEffect(() => {
    if (scrollRef.current && (loading || result)) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 150);
    }
  }, [loading, result]);

  const handleAnalyze = useCallback(async () => {
    if (!transcript.trim() || loading) return;

    setLoading(true);
    setError('');
    setResult(null);
    setActiveHistoryId(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 130000);

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcript.trim() }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Analysis failed (${response.status})`);
      }

      const data = await response.json();
      setResult(data);

      // Save to history
      const entry = {
        id: Date.now().toString(),
        transcript: transcript.trim(),
        result: data,
        timestamp: new Date().toISOString(),
      };
      const updated = [entry, ...history].slice(0, 50);
      setHistory(updated);
      saveHistory(updated);
      setActiveHistoryId(entry.id);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Analysis timed out. The AI model took too long. Try a shorter transcript.');
      } else if (err.message === 'Failed to fetch') {
        setError('Backend is offline. Please start the server on http://localhost:5000.');
        setBackendStatus('offline');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [transcript, loading, history]);

  const handleClear = () => {
    setTranscript('');
    setResult(null);
    setError('');
    setActiveHistoryId(null);
  };

  const handleHistorySelect = (id) => {
    const item = history.find(h => h.id === id);
    if (item) {
      setTranscript(item.transcript);
      setResult(item.result);
      setError('');
      setActiveHistoryId(id);
      setSidebarOpen(false);
    }
  };

  const handleHistoryDelete = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
      setResult(null);
    }
  };

  const statusColor = backendStatus === 'online' ? '#34d399' : backendStatus === 'degraded' ? '#fbbf24' : '#f87171';
  const statusText = backendStatus === 'online' ? 'Online' : backendStatus === 'degraded' ? 'Ollama Down' : backendStatus === 'offline' ? 'Offline' : 'Checking...';

  return (
    <div className="app-root">
      {/* History Sidebar */}
      <HistorySidebar
        history={history}
        activeId={activeHistoryId}
        onSelect={handleHistorySelect}
        onDelete={handleHistoryDelete}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="app-main">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle history">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
            <div className="header-brand">
              <div className="header-badge">Trinethra AI</div>
              <h1 className="header-title">AI Transcript Analyzer</h1>
            </div>
          </div>
          <div className="header-right">
            <div className="status-indicator" title={`Backend: ${statusText}`}>
              <span className="status-dot" style={{ background: statusColor }} />
              <span className="status-text">{statusText}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area" ref={scrollRef}>
          {/* Error */}
          {error && (
            <div className="error-card">
              <div className="error-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </div>
              <div className="error-content">
                <p className="error-title">Analysis Error</p>
                <p className="error-message">{error}</p>
              </div>
              <button className="error-dismiss" onClick={() => setError('')}>✕</button>
            </div>
          )}

          {/* Empty State */}
          {!result && !loading && !error && (
            <div className="empty-state">
              <div className="empty-icon-wrapper">
                <div className="empty-icon-glow" />
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
                  <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h2 className="empty-title">Ready to Analyze</h2>
              <p className="empty-subtitle">Paste your transcript below and let AI extract insights, scores, and recommendations.</p>
              <div className="empty-features">
                <span>📊 AI Scores</span>
                <span>✅ Strengths</span>
                <span>💡 Recommendations</span>
                <span>❓ Follow-ups</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && <LoadingState />}

          {/* Analysis Result */}
          {result && !loading && (
            <div className="result-wrapper">
              <ExportButtons result={result} />
              <AnalysisResult result={result} />
            </div>
          )}
        </div>

        {/* Bottom Input Bar */}
        <div className="input-bar-container">
          <div className="input-bar-inner">
            <div className="input-meta">
              <span className="char-count">{transcript.length} characters</span>
              {transcript.length > 0 && (
                <button className="clear-btn" onClick={handleClear}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  Clear
                </button>
              )}
            </div>
            <div className="input-bar">
              <textarea
                id="transcript-input"
                className="input-textarea custom-scrollbar"
                placeholder="Paste your transcript here to analyze..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAnalyze();
                  }
                }}
                rows={1}
              />
              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={loading || !transcript.trim()}
                className={`send-btn ${loading || !transcript.trim() ? 'send-btn-disabled' : 'send-btn-active'}`}
              >
                {loading ? (
                  <svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle className="spin-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="spin-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
