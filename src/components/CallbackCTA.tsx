import { PhoneIcon } from './Icons';

interface CallbackCTAProps {
  onRequestCall: () => void;
  accentColor: string;
}

export function CallbackCTA({ onRequestCall }: CallbackCTAProps) {
  return (
    <div className="px-4 pt-1 pb-2 shrink-0">
      <div
        className="flex items-center gap-2 mb-2"
        style={{ opacity: 0.45 }}
      >
        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.15)' }} />
        <span style={{ fontSize: 10.5, color: 'rgba(0,0,0,0.50)', whiteSpace: 'nowrap' }}>
          Need immediate help?
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.15)' }} />
      </div>

      <button
        onClick={onRequestCall}
        type="button"
        className="w-full flex items-center justify-center gap-2 rounded-full text-white font-semibold transition-all"
        style={{
          background: '#E8713A',
          padding: '10px 0',
          fontSize: '0.8125rem',
          boxShadow: '0 4px 16px rgba(232,113,58,0.35)',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#D4622A';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#E8713A';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        }}
      >
        <PhoneIcon size={14} />
        Call Me Now
      </button>
    </div>
  );
}
