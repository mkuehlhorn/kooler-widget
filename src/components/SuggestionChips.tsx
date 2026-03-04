interface SuggestionChipsProps {
  chips: string[];
  onChipClick: (chip: string) => void;
  primaryColor: string;
}

export function SuggestionChips({ chips, onChipClick }: SuggestionChipsProps) {
  if (!chips.length) return null;

  const displayChips = chips.slice(0, 4);

  return (
    <div className="weggy-suggestion-chips px-4 py-2 shrink-0">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: displayChips.length > 2 ? '1fr 1fr' : '1fr' }}
      >
        {displayChips.map((chip) => (
          <button
            key={chip}
            onClick={() => onChipClick(chip)}
            type="button"
            className="text-left rounded-full px-3 py-2 text-xs font-medium transition-all"
            style={{
              border: '1.5px solid #E8713A',
              color: '#E8713A',
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              cursor: 'pointer',
              lineHeight: 1.3,
              boxShadow: '0 1px 4px rgba(232,113,58,0.12)',
              transition: 'background 150ms ease, color 150ms ease, transform 100ms ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = '#E8713A';
              el.style.color = 'white';
              el.style.transform = 'translateY(-1px)';
              el.style.boxShadow = '0 4px 12px rgba(232,113,58,0.35)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'rgba(255, 255, 255, 0.65)';
              el.style.color = '#E8713A';
              el.style.transform = 'translateY(0)';
              el.style.boxShadow = '0 1px 4px rgba(232,113,58,0.12)';
            }}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
