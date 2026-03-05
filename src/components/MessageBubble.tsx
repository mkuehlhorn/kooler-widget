import type { ChatMessage } from '../types';
import { UserIcon, AlertCircleIcon } from './Icons';

interface MessageBubbleProps {
  message: ChatMessage;
  agentAvatarPath: string;
}

export function MessageBubble({ message, agentAvatarPath }: MessageBubbleProps) {
  const isUser      = message.role === 'user';
  const isError     = message.status === 'error';
  const isStreaming  = message.status === 'streaming';

  return (
    <div className={`message-row${isUser ? ' message-row-user' : ''}`}>
      <div className={`message-avatar${isUser ? ' message-avatar-user' : ' message-avatar-assistant'}`}>
        {isUser
          ? <UserIcon size={11} />
          : <img src={agentAvatarPath} alt="Weggy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
        }
      </div>
      <div className={`message-bubble${isUser ? ' message-bubble-user' : ' message-bubble-assistant'}${isError ? ' message-bubble-error' : ''}`}>
        {isError ? (
          <div className="message-error">
            <AlertCircleIcon size={14} />
            <span>Failed to send. Please try again.</span>
          </div>
        ) : isStreaming && !message.content ? (
          <div className="mette-typing-wrap">
            <div className="mette-typing-dot" />
            <div className="mette-typing-dot" />
            <div className="mette-typing-dot" />
          </div>
        ) : (
          <p className="message-text">{message.content}</p>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator({ agentAvatarPath }: { agentAvatarPath: string }) {
  return (
    <div className="message-row">
      <div className="message-avatar message-avatar-assistant">
        <img src={agentAvatarPath} alt="Weggy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
      </div>
      <div className="message-bubble message-bubble-assistant">
        <div className="mette-typing-wrap">
          <div className="mette-typing-dot" />
          <div className="mette-typing-dot" />
          <div className="mette-typing-dot" />
        </div>
      </div>
    </div>
  );
}

// Self-injected styles — PRD spec exactly
const STYLES = `
@keyframes mette-dot-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-4px); opacity: 1; }
}
.mette-typing-wrap { display: flex; gap: 4px; padding: 3px 2px; align-items: center; }
.mette-typing-dot {
  width: 5px; height: 5px; border-radius: 50%; background: #D4622A;
  animation: mette-dot-bounce 1.1s ease-in-out infinite; flex-shrink: 0;
}
.mette-typing-dot:nth-child(2) { animation-delay: 0.18s; }
.mette-typing-dot:nth-child(3) { animation-delay: 0.36s; }

@keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.message-row { display: flex; gap: 0.5rem; animation: slideUp 0.2s ease-out; }
.message-row-user { flex-direction: row-reverse; }

.message-avatar {
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.25);
}
.message-avatar svg { width: 11px; height: 11px; }
.message-avatar img { width: 100%; height: 100%; object-fit: cover; }
.message-avatar-user { background: #e5e7eb; color: #6b7280; }
.message-avatar-assistant { background: #E8713A; }

.message-bubble {
  max-width: 80%; padding: 0.4rem 0.6rem; border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.2);
}
/* USER — white glass */
.message-bubble-user {
  background: rgba(255,255,255,0.5); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.6); color: #1F2937;
  border-bottom-right-radius: 4px;
}
/* AI — white glass */
.message-bubble-assistant {
  background: rgba(255,255,255,0.55); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.7); color: #1F2937;
  border-bottom-left-radius: 4px;
}
.message-bubble-error { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); }
.message-error { display: flex; align-items: center; gap: 0.375rem; color: #dc2626; }
.message-error svg { width: 14px; height: 14px; flex-shrink: 0; }
.message-error span { font-size: 0.75rem; }

.message-text { font-size: 0.8rem; font-weight: 500; color: #111; line-height: 1.4; white-space: pre-wrap; word-break: break-word; margin: 0; }

@media (max-width: 480px) {
  .message-avatar { width: 36px; height: 36px; }
  .message-bubble { max-width: 85%; padding: 0.75rem 1rem; border-radius: 16px; }
  .message-text { font-size: 1rem; line-height: 1.5; }
  .message-row { gap: 0.625rem; margin-bottom: 0.75rem; }
}
`
if (typeof document !== 'undefined') {
  const id = 'weggy-message-bubble-styles'
  if (!document.getElementById(id)) {
    const el = document.createElement('style'); el.id = id; el.textContent = STYLES; document.head.appendChild(el)
  }
}
