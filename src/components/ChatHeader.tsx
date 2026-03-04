import { XIcon } from './Icons';

interface ChatHeaderProps {
  agentName: string;
  companyName: string;
  avatarPath: string;
  onClose?: () => void;
}

export function ChatHeader({ agentName, companyName, avatarPath, onClose }: ChatHeaderProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 shrink-0"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.20)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Avatar */}
      <div
        className="shrink-0 rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
          background: '#1a1a1a',
        }}
      >
        <img
          src={avatarPath}
          alt={agentName}
          width={36}
          height={36}
          style={{ objectFit: 'cover', width: 36, height: 36 }}
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className="hidden items-center justify-center w-full h-full font-bold text-sm"
          style={{ color: '#E8713A' }}
          aria-hidden="true"
        >
          {agentName.charAt(0)}
        </div>
      </div>

      {/* Agent info */}
      <div className="flex-1 min-w-0">
        <div
          className="font-semibold leading-tight truncate"
          style={{ fontSize: '0.9375rem', color: '#1a1a1a', textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}
        >
          {agentName}
        </div>
        <div
          className="leading-tight truncate"
          style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.55)' }}
        >
          {companyName}
        </div>
      </div>

      {/* Online indicator */}
      <div className="flex items-center gap-1.5 shrink-0 mr-1">
        <span
          className="inline-block rounded-full"
          style={{ width: 8, height: 8, background: '#22c55e' }}
          aria-hidden="true"
        />
        <span style={{ color: 'rgba(0,0,0,0.50)', fontSize: '0.75rem' }}>Online</span>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
          style={{ color: 'rgba(0,0,0,0.45)', background: 'transparent' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.08)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          aria-label="Close chat"
          type="button"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  );
}
