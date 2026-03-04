import { useRef, useEffect, useCallback } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && window.innerWidth > 480) {
      textareaRef.current.focus();
    }
  }, []);

  const handleAutoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 36), 100)}px`;
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

  return (
    <div
      className="px-3 py-3 shrink-0"
      style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }}
    >
      <div
        className="flex items-end gap-2"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 5px 20px rgba(0,0,0,0.18)',
          borderRadius: 9999,
          padding: '4px 4px 4px 16px',
        }}
      >
        <textarea
          ref={textareaRef}
          className="weggy-input flex-1"
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onInput={handleAutoResize}
          aria-label="Type your message"
          style={{ height: 36 }}
        />
        <button
          onClick={handleSend}
          disabled={disabled}
          type="button"
          aria-label="Send message"
          className="shrink-0 flex items-center justify-center text-white transition-all"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: disabled ? '#d1d5db' : '#E8713A',
            boxShadow: disabled ? 'none' : '0 4px 14px rgba(232,113,58,0.40)',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background 150ms ease, box-shadow 150ms ease, transform 100ms ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = '#D4622A';
          }}
          onMouseLeave={(e) => {
            if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = '#E8713A';
          }}
        >
          <SendIcon size={14} />
        </button>
      </div>
    </div>
  );
}
