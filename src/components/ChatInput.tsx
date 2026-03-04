import { useRef, useEffect, useCallback } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus on mount (desktop)
    if (textareaRef.current && window.innerWidth > 480) {
      textareaRef.current.focus();
    }
  }, []);

  const handleAutoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, 100);
    el.style.height = `${Math.max(newHeight, 36)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const value = el.value.trim();
    if (!value || disabled) return;
    onSend(value);
    el.value = '';
    el.style.height = '36px';
    el.focus();
  }, [onSend, disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(() => {
    handleAutoResize();
  }, [handleAutoResize]);

  return (
    <div
      className="px-3 py-3 shrink-0"
      style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
    >
      <div
        className="flex items-end gap-2 rounded-full px-4 py-2"
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <textarea
          ref={textareaRef}
          className="weggy-input flex-1"
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          aria-label="Type your message"
          style={{ height: 36 }}
        />
        <button
          onClick={handleSend}
          disabled={disabled}
          type="button"
          aria-label="Send message"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all"
          style={{
            background: disabled ? '#d1d5db' : 'var(--widget-primary)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background 150ms ease',
          }}
        >
          <SendIcon size={15} />
        </button>
      </div>
    </div>
  );
}
