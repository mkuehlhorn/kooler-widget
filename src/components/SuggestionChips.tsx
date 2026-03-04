interface SuggestionChipsProps {
  chips: string[];
  onChipClick: (chip: string) => void;
  primaryColor: string;
}

export function SuggestionChips({
  chips,
  onChipClick,
  primaryColor,
}: SuggestionChipsProps) {
  if (!chips.length) return null;

  // Show up to 4 chips in a 2x2 grid
  const displayChips = chips.slice(0, 4);

  return (
    <div className="weggy-suggestion-chips px-4 py-2 shrink-0">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: displayChips.length > 2 ? '1fr 1fr' : '1fr',
        }}
      >
        {displayChips.map((chip) => (
          <button
            key={chip}
            onClick={() => onChipClick(chip)}
            type="button"
            className="text-left rounded-full px-3 py-2 text-xs font-medium transition-all"
            style={{
              border: `1.5px solid ${primaryColor}`,
              color: primaryColor,
              background: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              lineHeight: 1.3,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                primaryColor;
              (e.currentTarget as HTMLButtonElement).style.color = 'white';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'rgba(255,255,255,0.7)';
              (e.currentTarget as HTMLButtonElement).style.color = primaryColor;
            }}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
