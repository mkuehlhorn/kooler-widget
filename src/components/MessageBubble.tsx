import { useEffect } from 'react';
import type { ChatMessage } from '../types';
import { AlertCircleIcon } from './Icons';

// Inject bubble animation styles once
const STYLE_ID = 'weggy-bubble-styles';
function injectBubbleStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes weggy-dot-bounce-b {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-4px); opacity: 1; }
    }
    .weggy-typing-dot {
      display: inline-block !important;
      width: 5px !important;
      height: 5px !important;
      border-radius: 50% !important;
      background: var(--widget-primary) !important;
      animation: weggy-dot-bounce-b 1.1s ease-in-out infinite !important;
      flex-shrink: 0 !important;
    }
    .weggy-typing-dot:nth-child(1) { animation-delay: 0s !important; }
    .weggy-typing-dot:nth-child(2) { animation-delay: 0.18s !important; }
    .weggy-typing-dot:nth-child(3) { animation-delay: 0.36s !important; }
    .weggy-user-bubble {
      background: var(--widget-primary);
      color: white;
      border-radius: 18px 18px 4px 18px;
      padding: 10px 14px;
      max-width: 78%;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
    }
    .weggy-assistant-bubble {
      background: var(--widget-glass-bg);
      border: 1px solid var(--widget-glass-border);
      backdrop-filter: blur(var(--widget-glass-blur));
      -webkit-backdrop-filter: blur(var(--widget-glass-blur));
      color: #1f2937;
      border-radius: 18px 18px 18px 4px;
      padding: 10px 14px;
      max-width: 86%;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
    }
    .weggy-error-bubble {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      border-radius: 12px;
      padding: 10px 14px;
      max-width: 86%;
      font-size: 13px;
      line-height: 1.5;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .weggy-timestamp {
      font-size: 10px;
      color: #9ca3af;
      margin-top: 2px;
    }
  `;
  document.head.appendChild(style);
}

interface MessageBubbleProps {
  message: ChatMessage;
  agentAvatarPath: string;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MessageBubble({ message, agentAvatarPath }: MessageBubbleProps) {
  useEffect(() => {
    injectBubbleStyles();
  }, []);

  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';
  const isError = message.status === 'error';
  const isEmpty = message.content === '';

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
      {/* Avatar */}
      <div
        className="shrink-0 rounded-full overflow-hidden bg-gray-100 self-end"
        style={{ width: 28, height: 28 }}
      >
        <img
          src={agentAvatarPath}
          alt="Agent"
          width={28}
          height={28}
          style={{ objectFit: 'cover', width: 28, height: 28 }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      <div className="flex flex-col items-start">
        <div className="weggy-assistant-bubble">
          {isStreaming && isEmpty ? (
            // Animated typing dots
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
            // Render content — preserve newlines
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
