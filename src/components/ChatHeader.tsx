import { XIcon } from './Icons';

interface ChatHeaderProps {
  agentName: string;
  companyName: string;
  avatarPath: string;
  onClose?: () => void;
}

export function ChatHeader({
  agentName,
  companyName,
  avatarPath,
  onClose,
}: ChatHeaderProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 shrink-0"
      style={{
        background: 'var(--widget-primary)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Avatar */}
      <div
        className="shrink-0 rounded-full overflow-hidden bg-white/20 flex items-center justify-center"
        style={{ width: 40, height: 40 }}
      >
        <img
          src={avatarPath}
          alt={agentName}
          width={40}
          height={40}
          style={{ objectFit: 'cover', width: 40, height: 40 }}
          onError={(e) => {
            // Fallback to initials if avatar fails to load
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className="hidden items-center justify-center w-full h-full text-white font-bold text-sm"
          aria-hidden="true"
        >
          {agentName.charAt(0)}
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="text-white font-semibold text-sm leading-tight truncate">
          {agentName}
        </div>
        <div className="text-white/70 text-xs leading-tight truncate">
          {companyName}
        </div>
      </div>

      {/* Online indicator */}
      <div className="flex items-center gap-1.5 mr-2 shrink-0">
        <span
          className="inline-block w-2 h-2 rounded-full bg-emerald-400"
          aria-hidden="true"
        />
        <span className="text-white/70 text-xs">Online</span>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close chat"
          type="button"
        >
          <XIcon size={16} />
        </button>
      )}
    </div>
  );
}
