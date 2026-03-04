import { PhoneIcon } from './Icons';

interface CallbackCTAProps {
  onRequestCall: () => void;
  accentColor: string;
}

export function CallbackCTA({ onRequestCall, accentColor }: CallbackCTAProps) {
  return (
    <div className="px-4 pt-1 pb-2 shrink-0">
      {/* Divider */}
      <div
        className="flex items-center gap-2 mb-2"
        style={{ opacity: 0.5 }}
      >
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Need immediate help?
        </span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      <button
        onClick={onRequestCall}
        type="button"
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
        style={{
          background: accentColor,
          boxShadow: `0 2px 12px ${accentColor}55`,
          cursor: 'pointer',
          border: 'none',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.08)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.filter = 'none';
        }}
      >
        <PhoneIcon size={15} />
        Call Me Now
      </button>
    </div>
  );
}
