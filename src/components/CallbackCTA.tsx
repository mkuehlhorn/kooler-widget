interface CallbackCTAProps {
  onRequestCall: () => void;
}

export function CallbackCTA({ onRequestCall }: CallbackCTAProps) {
  return (
    <div className="callback-cta">
      <div className="callback-cta-row">
        <span className="callback-cta-text">I'm available for a quick call now</span>
        <button className="callback-cta-btn" onClick={onRequestCall} type="button">
          Yes Please!
        </button>
      </div>
    </div>
  );
}

// Self-injected styles — PRD spec exactly
const STYLES = `
.callback-cta { display: flex; flex-direction: column; padding: 0 0 0.5rem; background: transparent; }
.callback-cta::before {
  content: ''; height: 1px; background: var(--w-dark); margin: 0 1rem 0.375rem;
}
.callback-cta-row {
  display: flex; align-items: center; justify-content: space-between; margin: 0 1rem; padding: 0;
}
.callback-cta-text {
  font-size: 0.6875rem; color: #2d2926; font-weight: 600;
}
.callback-cta-btn {
  padding: 0.25rem 1.25rem; background: #E8713A;
  color: white; font-size: 0.625rem; font-weight: 600;
  border: none; border-radius: 9999px; cursor: pointer;
  transition: all 150ms ease; white-space: nowrap; flex-shrink: 0;
  box-shadow: var(--w-shadow-orange);
}
.callback-cta-btn:hover { background: #D4622A; box-shadow: 2px 2px 6px rgba(180,80,20,0.35), -1px -1px 4px rgba(255,200,150,0.3); }
.callback-cta-btn:active { transform: scale(0.98); }

@media (max-width: 480px) {
  .callback-cta-row { margin: 0 1rem; padding: 0.5rem 0; }
  .callback-cta-text { font-size: 1rem; }
  .callback-cta-btn { padding: 0.625rem 1.25rem; font-size: 0.875rem; }
}
`
if (typeof document !== 'undefined') {
  const id = 'weggy-callback-cta-styles'
  if (!document.getElementById(id)) {
    const el = document.createElement('style'); el.id = id; el.textContent = STYLES; document.head.appendChild(el)
  }
}
