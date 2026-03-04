import { useEffect } from 'react';
import type { ChatMessage } from '../types';
import { AlertCircleIcon } from './Icons';

const STYLE_ID = 'weggy-bubble-styles';

function injectBubbleStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes weggy-bubble-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0);   }
    }
    @keyframes weggy-dot-bounce-b {
      0%, 60%, 100% { transform: translateY(0);    opacity: 0.5; }
      30%           { transform: translateY(-4px); opacity: 1;   }
    }
    .weggy-typing-dot {
      display: inline-block !important;
      width: 5px !important; height: 5px !important;
      border-radius: 50% !important;
      background: #E8713A !important;
      animation: weggy-dot-bounce-b 1.1s ease-in-out infinite !important;
      flex-shrink: 0 !important;
    }
    .weggy-typing-dot:nth-child(1) { animation-delay: 0s !important; }
    .weggy-typing-dot:nth-child(2) { animation-delay: 0.18s !important; }
    .weggy-typing-dot:nth-child(3) { animation-delay: 0.36s !important; }

    /* User bubble — orange-tinted glass, tail bottom-right */
    .weggy-user-bubble {
      background: rgba(232, 113, 58, 0.15);
      border: 1px solid rgba(232, 113, 58, 0.28);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #1a1a1a;
      border-radius: 10px;
      border-bottom-right-radius: 3px;
      padding: 8px 12px;
      max-width: 78%;
      font-size: 0.8125rem;
      line-height: 1.5;
      word-break: break-word;
      box-shadow: 0 2px 10px rgba(232,113,58,0.12);
      animation: weggy-bubble-in 0.2s ease-out both;
    }

    /* AI bubble — pure glass, tail bottom-left */
    .weggy-assistant-bubble {
      background: rgba(255, 255, 255, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.70);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #1a1a1a;
      border-radius: 10px;
      border-bottom-left-radius: 3px;
      padding: 8px 12px;
      max-width: 86%;
      font-size: 0.8125rem;
      line-height: 1.5;
      word-break: break-word;
      box-shadow: 0 3px 12px rgba(0,0,0,0.10);
      animation: weggy-bubble-in 0.2s ease-out both;
    }

    .weggy-error-bubble {
      background: rgba(254, 242, 242, 0.85);
      border: 1px solid #fecaca;
      color: #dc2626;
      border-radius: 10px;
      padding: 8px 12px;
      max-width: 86%;
      font-size: 0.8125rem;
      line-height: 1.5;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .weggy-timestamp {
      font-size: 10px;
      color: rgba(0,0,0,0.35);
      margin-top: 3px;
    }
  `;
  document.head.appendChild(style);
}

interface MessageBubbleProps {
  message: ChatMessage;
  agentAvatarPath: string;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, agentAvatarPath }: MessageBubbleProps) {
  useEffect(() => { injectBubbleStyles(); }, []);

  const isUser      = message.role === 'user';
  const isStreaming = message.status === 'streaming';
  const isError     = message.status === 'error';
  const isEmpty     = message.content === '';

  if (isUser) {
    return (
      <div className="flex flex-col items-end">
        <div className="weggy-user-bubble">{message.content}</div>
        <div className="weggy-timestamp pr-1">{formatTime(message.timestamp)}</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start">
        <div className="weggy-error-bubble">
          <AlertCircleIcon size={14} className="shrink-0 mt-0.5" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      {/* Agent avatar */}
      <div
        className="shrink-0 rounded-full overflow-hidden self-end"
        style={{
          width: 22,
          height: 22,
          background: '#E8713A',
          boxShadow: '0 2px 8px rgba(232,113,58,0.30)',
          flexShrink: 0,
        }}
      >
        <img
          src={agentAvatarPath}
          alt="Agent"
          width={22}
          height={22}
          style={{ objectFit: 'cover', width: 22, height: 22 }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      <div className="flex flex-col items-start">
        <div className="weggy-assistant-bubble">
          {isStreaming && isEmpty ? (
            <div
              className="flex items-center gap-1"
              style={{ minWidth: 32, minHeight: 20 }}
              aria-label="Typing..."
            >
              <span className="weggy-typing-dot" />
              <span className="weggy-typing-dot" />
              <span className="weggy-typing-dot" />
            </div>
          ) : (
            <span style={{ whiteSpace: 'pre-wrap' }}>{message.content}</span>
          )}
        </div>
        {!isEmpty && (
          <div className="weggy-timestamp pl-1">{formatTime(message.timestamp)}</div>
        )}
      </div>
    </div>
  );
}
