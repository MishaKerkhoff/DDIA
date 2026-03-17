import { useState, useRef, useCallback, useEffect } from 'react';

const PANEL_OPEN_KEY = 'ddia-notes-panel-open';
const PANEL_WIDTH_KEY = 'ddia-notes-panel-width';

export default function NotesPanel({ text, setText, isSaving, isSynced, user, signIn, signOut, isOpen, onToggle }) {
  const [width, setWidth] = useState(() =>
    parseInt(localStorage.getItem(PANEL_WIDTH_KEY)) || 350
  );
  const isDragging = useRef(false);
  const panelRef = useRef(null);

  // Resize handler
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const delta = startX - e.clientX;
      const newWidth = Math.min(600, Math.max(250, startWidth + delta));
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      // Persist width
      localStorage.setItem(PANEL_WIDTH_KEY, String(width));
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [width]);

  // Persist width when it changes
  useEffect(() => {
    localStorage.setItem(PANEL_WIDTH_KEY, String(width));
  }, [width]);

  if (!isOpen) return null;

  const syncStatus = !user
    ? { text: 'Local only', color: '#8b949e' }
    : isSaving
    ? { text: 'Saving...', color: '#e2b714' }
    : isSynced
    ? { text: 'Synced ✓', color: '#3fb950' }
    : { text: 'Unsaved', color: '#f85149' };

  return (
    <div
      ref={panelRef}
      style={{
        width: width,
        minWidth: width,
        maxWidth: width,
        height: '100vh',
        background: '#0d1117',
        borderLeft: '1px solid #1c2333',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: isDragging.current ? 'none' : 'width 0.2s ease',
      }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          left: -3,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: 'col-resize',
          zIndex: 10,
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(226, 183, 20, 0.3)'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      />

      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: '1px solid #1c2333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.7em',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#e2b714',
          }}>
            📝 Notes
          </span>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: '#8b949e',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '2px 6px',
            borderRadius: 4,
          }}
          onMouseEnter={(e) => e.target.style.color = '#c9d1d9'}
          onMouseLeave={(e) => e.target.style.color = '#8b949e'}
          title="Close notes"
        >
          ✕
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your notes here...&#10;&#10;Notes are saved automatically."
        style={{
          flex: 1,
          width: '100%',
          background: '#161b22',
          color: '#c9d1d9',
          border: 'none',
          outline: 'none',
          resize: 'none',
          padding: '16px',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '13px',
          lineHeight: '1.6',
          boxSizing: 'border-box',
        }}
      />

      {/* Footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid #1c2333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        fontSize: '12px',
      }}>
        {/* Sync status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: syncStatus.color,
          }} />
          <span style={{ color: syncStatus.color, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75em' }}>
            {syncStatus.text}
          </span>
        </div>

        {/* Auth button */}
        {user ? (
          <button
            onClick={signOut}
            style={{
              background: 'none',
              border: '1px solid #30363d',
              borderRadius: 6,
              color: '#8b949e',
              cursor: 'pointer',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = '#e2b714'; e.target.style.color = '#e2b714'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = '#30363d'; e.target.style.color = '#8b949e'; }}
            title={`Signed in as ${user.displayName || user.email}`}
          >
            {user.displayName?.split(' ')[0] || 'Sign out'}
          </button>
        ) : (
          <button
            onClick={signIn}
            style={{
              background: 'none',
              border: '1px solid #30363d',
              borderRadius: 6,
              color: '#8b949e',
              cursor: 'pointer',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = '#e2b714'; e.target.style.color = '#e2b714'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = '#30363d'; e.target.style.color = '#8b949e'; }}
          >
            Sign in to sync
          </button>
        )}
      </div>
    </div>
  );
}
