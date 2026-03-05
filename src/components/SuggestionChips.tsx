interface SuggestionChipsProps {
  chips: string[];
  onSelect: (chip: string) => void;
}

export const DEFAULT_SUGGESTION_CHIPS = [
  "My garage door won't open",
  'I need a spring replaced',
  'Schedule a service call',
  'Get a free estimate',
];

export function SuggestionChips({ chips, onSelect }: SuggestionChipsProps) {
  if (!chips || chips.length === 0) return null;
  return (
    <div className="suggestion-chips-container">
      <p className="suggestion-chips-label">Suggestions on what to ask Weggy</p>
      <div className="suggestion-chips-grid">
        {chips.map((chip, index) => (
          <button
            key={index}
            className="suggestion-chip"
            onClick={() => onSelect(chip)}
            type="button"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

// Self-injected styles — PRD spec exactly
const STYLES = `
.suggestion-chips-container { padding: 0.5rem 0.75rem; background: transparent; }
.suggestion-chips-label {
  font-size: 0.8125rem; color: rgba(0,0,0,0.8);
  text-align: center; margin: 0 0 0.625rem; font-weight: 500;
}
.suggestion-chips-grid {
  display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center;
  max-width: 480px; margin: 0 auto;
}
.suggestion-chip {
  display: inline-flex; align-items: center; padding: 0.1875rem 0.75rem;
  font-size: 0.8125rem; color: rgba(0,0,0,0.85);
  background: rgba(255,255,255,0.55); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.7); border-radius: 9999px;
  cursor: pointer; white-space: nowrap;
  transition: all 150ms ease; font-weight: 500;
  box-shadow: 0 3px 12px rgba(0,0,0,0.2);
}
.suggestion-chip:hover {
  background: rgba(255,255,255,0.75); border-color: #E8713A; color: #E8713A;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.suggestion-chip:active { transform: scale(0.98); }
@media (max-width: 480px) { .suggestion-chips-container { display: none; } }
`
if (typeof document !== 'undefined') {
  const id = 'weggy-suggestion-chips-styles'
  if (!document.getElementById(id)) {
    const el = document.createElement('style'); el.id = id; el.textContent = STYLES; document.head.appendChild(el)
  }
}
