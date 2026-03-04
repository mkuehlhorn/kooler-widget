import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  agentAvatarPath: string;
}

export function MessageList({ messages, agentAvatarPath }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3" />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 flex flex-col gap-3">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          agentAvatarPath={agentAvatarPath}
        />
      ))}
      {/* Scroll anchor */}
      <div ref={bottomRef} style={{ height: 1 }} />
    </div>
  );
}
