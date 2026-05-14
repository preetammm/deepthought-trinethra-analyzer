import ScoreCard from './ScoreCard';

function SectionHeader({ icon, title, color }) {
  return (
    <div className="section-header">
      <span className="section-icon" style={{ color }}>{icon}</span>
      <h3 className="section-title">{title}</h3>
    </div>
  );
}

function ListSection({ items, color, emptyText = 'No items found.' }) {
  if (!items || items.length === 0) {
    return <p className="section-empty">{emptyText}</p>;
  }
  return (
    <ul className="section-list">
      {items.map((item, i) => (
        <li key={i} className="section-list-item" style={{ '--accent': color }}>
          <span className="section-bullet" style={{ background: color }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AnalysisResult({ result }) {
  if (!result) return null;

  return (
    <div className="analysis-result">
      {/* Summary */}
      <div className="result-section result-section-summary">
        <SectionHeader
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          }
          title="Summary"
          color="#a78bfa"
        />
        <p className="summary-text">{result.summary || 'No summary available.'}</p>
      </div>

      {/* Score Cards */}
      {result.scores && (
        <div className="result-section">
          <SectionHeader
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            }
            title="AI Scores"
            color="#f472b6"
          />
          <div className="score-cards-grid">
            {Object.entries(result.scores).map(([key, val], i) => (
              <ScoreCard
                key={key}
                name={key}
                score={val.score}
                reason={val.reason}
                delay={i * 150}
              />
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      <div className="result-section">
        <SectionHeader
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
          title="Strengths"
          color="#34d399"
        />
        <ListSection items={result.strengths} color="#34d399" emptyText="No strengths identified." />
      </div>

      {/* Weaknesses */}
      <div className="result-section">
        <SectionHeader
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
          title="Weaknesses"
          color="#fb923c"
        />
        <ListSection items={result.weaknesses} color="#fb923c" emptyText="No weaknesses identified." />
      </div>

      {/* Recommendations */}
      <div className="result-section">
        <SectionHeader
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          }
          title="Recommendations"
          color="#60a5fa"
        />
        <ListSection items={result.recommendations} color="#60a5fa" emptyText="No recommendations." />
      </div>

      {/* Follow-up Questions */}
      <div className="result-section">
        <SectionHeader
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
          title="Follow-up Questions"
          color="#c084fc"
        />
        <ListSection items={result.follow_up_questions} color="#c084fc" emptyText="No follow-up questions." />
      </div>

      {/* Extracted Evidence */}
      {result.extracted_evidence && result.extracted_evidence.length > 0 && (
        <div className="result-section">
          <SectionHeader
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            }
            title="Extracted Evidence"
            color="#94a3b8"
          />
          <div className="evidence-list">
            {result.extracted_evidence.map((item, i) => (
              <blockquote key={i} className="evidence-quote">
                "{item}"
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Gap Analysis */}
      {result.gap_analysis && result.gap_analysis.length > 0 && (
        <div className="result-section">
          <SectionHeader
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            }
            title="Gap Analysis"
            color="#f87171"
          />
          <ListSection items={result.gap_analysis} color="#f87171" emptyText="No gaps identified." />
        </div>
      )}

      {/* Timestamp */}
      {result.analyzed_at && (
        <div className="analysis-timestamp">
          Analyzed at {new Date(result.analyzed_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}
