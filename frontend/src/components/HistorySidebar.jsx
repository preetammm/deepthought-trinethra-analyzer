export default function HistorySidebar({ history, activeId, onSelect, onDelete, isOpen, onToggle }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
      <aside className={`history-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            History
          </h2>
          <button className="sidebar-close-btn" onClick={onToggle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="sidebar-list custom-scrollbar">
          {history.length === 0 ? (
            <div className="sidebar-empty">
              <p>No analyses yet</p>
              <span>Your history will appear here</span>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className={`sidebar-item ${activeId === item.id ? 'sidebar-item-active' : ''}`} onClick={() => onSelect(item.id)}>
                <div className="sidebar-item-content">
                  <p className="sidebar-item-preview">{item.transcript.slice(0, 55)}{item.transcript.length > 55 ? '...' : ''}</p>
                  <span className="sidebar-item-date">{new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <button className="sidebar-item-delete" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
