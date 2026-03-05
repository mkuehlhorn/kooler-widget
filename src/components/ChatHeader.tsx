import { XIcon } from './Icons';

interface ChatHeaderProps {
  onClose?: () => void;
  avatarUrl?: string;
}

export function ChatHeader({ onClose, avatarUrl }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="chat-header-avatar">
        <img
          src={avatarUrl || '/weggy-avatar.jpg'}
          alt="Weggy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      </div>
      <div className="chat-header-title">
        <h1>Ask Weggy</h1>
        <p>Your Kooler Garage Doors Assistant</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="chat-header-close"
          aria-label="Close chat"
          type="button"
        >
          <XIcon size={16} />
        </button>
      )}
    </header>
  );
}

// Self-injected styles — PRD spec exactly
const STYLES = `
.chat-header {
  display: flex; flex-direction: column; align-items: center;
  padding: 1rem 1rem 0.5rem; position: relative; background: transparent;
}
.chat-header-avatar {
  width: 34px; height: 34px; border-radius: 50%; overflow: hidden;
  margin-top: 0.5rem; margin-bottom: 0.5rem;
  box-shadow: var(--w-shadow-sm-raised);
}
.chat-header-avatar img { width: 100%; height: 100%; object-fit: cover; }
.chat-header-title { text-align: center; }
.chat-header-title h1 {
  font-size: 0.9375rem; font-weight: 600; color: #2d2926;
  margin: 0 0 0.125rem; line-height: 1.2;
}
.chat-header-title p {
  font-size: 0.9375rem; font-weight: 400; color: #7a6e67;
  margin: 0; line-height: 1.3;
}
.chat-header-close {
  position: absolute; top: 0.75rem; right: 0.75rem;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  background: var(--w-bg); box-shadow: var(--w-shadow-sm-flat);
  border: none; border-radius: 50%;
  cursor: pointer; color: rgba(0,0,0,0.5);
  transition: all 150ms ease;
}
.chat-header-close:hover { box-shadow: var(--w-shadow-pressed); color: rgba(0,0,0,0.8); }
.chat-header-close svg { width: 16px; height: 16px; }

@media (max-width: 480px) {
  .chat-header { padding: 1.25rem 1.25rem 0.75rem; }
  .chat-header-avatar { width: 72px; height: 72px; margin-bottom: 0.75rem; }
  .chat-header-title h1 { font-size: 1.5rem; }
  .chat-header-title p { font-size: 1.125rem; }
  .chat-header-close { width: 36px; height: 36px; top: 1rem; right: 1rem; }
  .chat-header-close svg { width: 24px; height: 24px; }
}
`
if (typeof document !== 'undefined') {
  const id = 'weggy-chat-header-styles'
  if (!document.getElementById(id)) {
    const el = document.createElement('style'); el.id = id; el.textContent = STYLES; document.head.appendChild(el)
  }
}
