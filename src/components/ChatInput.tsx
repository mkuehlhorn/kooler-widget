import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { KeyboardEvent, FormEvent, Ref } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export interface ChatInputHandle { focus: () => void }

export const ChatInput = forwardRef(function ChatInput(
  { onSend, disabled = false }: ChatInputProps,
  ref: Ref<ChatInputHandle>
) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({ focus: () => textareaRef.current?.focus() }));

  // Auto-focus on mount (desktop only)
  useEffect(() => {
    if (window.innerWidth > 480) {
      const t = setTimeout(() => textareaRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, []);

  // Re-focus after AI responds
  useEffect(() => {
    if (!disabled) setTimeout(() => textareaRef.current?.focus(), 100);
  }, [disabled]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = '0px'; ta.style.height = `${Math.min(ta.scrollHeight, 80)}px`; }
  }, [value]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !disabled) { onSend(trimmed); setValue(''); setTimeout(() => textareaRef.current?.focus(), 0); }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  }

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Waiting for response...' : 'Type your message here...'}
        rows={1}
        className="chat-input-textarea"
      />
      <button
        type="submit"
        disabled={!(!disabled && value.trim().length > 0)}
        className="chat-input-send"
        aria-label="Send message"
      >
        <SendIcon size={14} />
      </button>
    </form>
  );
});

// Self-injected styles — PRD spec exactly
const STYLES = `
/* Pill input — fixed height, flex centers textarea vertically */
.chat-input-form {
  display: flex; align-items: center;
  background: rgba(255,255,255,0.95); border-radius: 9999px;
  margin: 0 1rem 0.75rem; height: 36px; padding: 0 4px 0 1rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3); border: none;
}
.chat-input-textarea {
  flex: 1; resize: none; padding: 0; margin: 0;
  font-size: 0.8125rem; color: rgba(0,0,0,0.85); font-weight: 500;
  background: transparent; border: none; outline: none;
  max-height: 80px; line-height: 1.3; font-family: inherit;
  display: block; overflow-y: hidden; align-self: center;
}
.chat-input-textarea::placeholder { color: rgba(0,0,0,0.55); font-size: 0.8125rem; }
.chat-input-textarea:disabled { opacity: 0.5; cursor: not-allowed; }

/* Send button — 28px circle */
.chat-input-send {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  background: #E8713A; color: white; border: none; border-radius: 50%;
  cursor: pointer; transition: all 150ms ease; flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(0,0,0,0.35);
}
.chat-input-send:hover:not(:disabled) { background: #D4622A; }
.chat-input-send:disabled { background: #E8713A; opacity: 0.7; cursor: default; }
.chat-input-send svg { width: 14px; height: 14px; }

@media (max-width: 480px) {
  .chat-input-form { margin: 0 0.75rem 0.5rem; padding: 14px 6px 14px 16px; }
  .chat-input-textarea { font-size: 18px; }
  .chat-input-textarea::placeholder { font-size: 16px; }
  .chat-input-send { width: 40px; height: 40px; }
  .chat-input-send svg { width: 20px; height: 20px; }
}
`
if (typeof document !== 'undefined') {
  const id = 'weggy-chat-input-styles'
  if (!document.getElementById(id)) {
    const el = document.createElement('style'); el.id = id; el.textContent = STYLES; document.head.appendChild(el)
  }
}
