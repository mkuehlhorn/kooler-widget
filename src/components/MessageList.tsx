import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { MessageBubble, TypingIndicator } from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  agentAvatarPath: string;
}

export function MessageList({ messages, isTyping, agentAvatarPath }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const hasStreamingMessage = messages.some((m) => m.status === 'streaming');
  const showTypingIndicator = isTyping && !hasStreamingMessage;

  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} agentAvatarPath={agentAvatarPath} />
      ))}
      {showTypingIndicator && <TypingIndicator agentAvatarPath={agentAvatarPath} />}
      <div ref={bottomRef} />
    </div>
  );
}

const STYLES = `
.message-list {
  flex: 1; overflow-y: auto; padding: 1rem;
  display: flex; flex-direction: column; gap: 1rem; background: transparent;
}
@media (max-width: 480px) { .message-list { padding: 1rem; gap: 1rem; } }
`
if (typeof document !== 'undefined') {
  const id = 'weggy-message-list-styles'
  if (!document.getElementById(id)) {
    const el = document.createElement('style'); el.id = id; el.textContent = STYLES; document.head.appendChild(el)
  }
}
