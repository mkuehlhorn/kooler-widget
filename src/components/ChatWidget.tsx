import { useState, useEffect, useCallback } from 'react';
import type { WidgetConfig, CallbackFormData } from '../types';
import { useChat } from '../hooks/useChat';
import { submitCallback } from '../services/api';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { CollapsedBar } from './CollapsedBar';
import { SuggestionChips } from './SuggestionChips';
import { CallbackCTA } from './CallbackCTA';
import { CallbackForm } from './CallbackForm';
import { LoaderIcon, AlertCircleIcon } from './Icons';

interface ChatWidgetProps {
  config: WidgetConfig;
}

type WidgetState = 'collapsed' | 'expanded' | 'callback-form' | 'callback-success';

export function ChatWidget({ config }: ChatWidgetProps) {
  const [widgetState, setWidgetState] = useState<WidgetState>(
    config.mode === 'inline' ? 'expanded' : 'collapsed'
  );
  const [showChips, setShowChips] = useState(true);
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);

  const { messages, isTyping, isInitializing, error, sendMessage, clearError } =
    useChat({ config });

  const userMessageCount = messages.filter((m) => m.role === 'user').length;
  const showCallbackCTA = userMessageCount >= 2 && widgetState === 'expanded';

  useEffect(() => {
    if (userMessageCount > 0) setShowChips(false);
  }, [userMessageCount]);

  // Notify parent loader on state change (triggers iframe resize)
  useEffect(() => {
    if (window.parent === window) return;
    const type = widgetState === 'collapsed' ? 'weggy:close' : 'weggy:open';
    window.parent.postMessage({ source: 'weggy-widget', type }, '*');
  }, [widgetState]);

  // Signal ready after initializing
  useEffect(() => {
    if (!isInitializing && window.parent !== window) {
      window.parent.postMessage({ source: 'weggy-widget', type: 'weggy:ready' }, '*');
    }
  }, [isInitializing]);

  // Listen for open/close commands from parent
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data as { source?: string; type?: string };
      if (data?.source !== 'weggy-loader') return;
      if (data.type === 'weggy:open' && widgetState === 'collapsed') setWidgetState('expanded');
      else if (data.type === 'weggy:close' && widgetState !== 'collapsed') setWidgetState('collapsed');
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [widgetState]);

  const handleExpand = useCallback(() => setWidgetState('expanded'), []);
  const handleClose  = useCallback(() => {
    if (config.mode === 'inline') return;
    setWidgetState('collapsed');
  }, [config.mode]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (widgetState !== 'expanded') setWidgetState('expanded');
    await sendMessage(content);
  }, [widgetState, sendMessage]);

  const handleRequestCallback = useCallback(() => setWidgetState('callback-form'), []);

  const handleCallbackSubmit = useCallback(async (data: CallbackFormData) => {
    setCallbackSubmitting(true);
    try {
      await submitCallback(data);
      setWidgetState('callback-success');
      setTimeout(() => setWidgetState('expanded'), 3000);
    } catch (err) {
      console.error('Callback submission error:', err);
    } finally {
      setCallbackSubmitting(false);
    }
  }, []);

  const handleCallbackCancel = useCallback(() => setWidgetState('expanded'), []);

  const avatarPath = config.avatarPath ?? '/weggy-avatar.svg';

  // ── Collapsed ───────────────────────────────────────────────────────────────
  if (widgetState === 'collapsed') {
    return (
      <div className="widget-collapsed-container">
        <CollapsedBar
          onExpand={handleExpand}
          greetingText={config.greeting}
          avatarUrl={avatarPath}
        />
      </div>
    );
  }

  // ── Callback form ───────────────────────────────────────────────────────────
  if (widgetState === 'callback-form') {
    return (
      <div className="widget-panel">
        <CallbackForm
          onSubmit={handleCallbackSubmit}
          onCancel={handleCallbackCancel}
          config={config}
          isSubmitting={callbackSubmitting}
        />
      </div>
    );
  }

  // ── Callback success ────────────────────────────────────────────────────────
  if (widgetState === 'callback-success') {
    return (
      <div className="widget-panel widget-panel--center">
        <div className="widget-success-content">
          <div className="widget-success-icon">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="28" fill="rgba(232,113,58,0.15)" />
              <path d="M18 28L25 35L38 20" stroke="#E8713A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>Request Received!</h3>
          <p>We'll have someone call you shortly.</p>
        </div>
      </div>
    );
  }

  // ── Initializing ────────────────────────────────────────────────────────────
  if (isInitializing) {
    return (
      <div className="widget-panel">
        <ChatHeader onClose={handleClose} avatarUrl={avatarPath} />
        <div className="widget-loading">
          <LoaderIcon size={24} className="widget-loading-spinner" />
          <p>Connecting...</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="widget-panel">
        <ChatHeader onClose={handleClose} avatarUrl={avatarPath} />
        <div className="widget-error-state">
          <AlertCircleIcon size={32} />
          <p>{error}</p>
          <button onClick={clearError} className="widget-error-retry">Try again</button>
        </div>
      </div>
    );
  }

  // ── Expanded chat ───────────────────────────────────────────────────────────
  return (
    <div className="widget-panel">
      <ChatHeader onClose={config.mode === 'inline' ? undefined : handleClose} avatarUrl={avatarPath} />
      {showChips && userMessageCount === 0 && (
        <SuggestionChips chips={config.suggestionChips} onSelect={handleSendMessage} />
      )}
      <MessageList messages={messages} isTyping={isTyping} agentAvatarPath={avatarPath} />
      {showCallbackCTA && <CallbackCTA onRequestCall={handleRequestCallback} />}
      <ChatInput onSend={handleSendMessage} disabled={isTyping || isInitializing} />
    </div>
  );
}

// Self-injected styles — PRD spec
const STYLES = `
.widget-collapsed-container {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: flex-end;
}
.widget-panel {
  display: flex; flex-direction: column; height: 100%;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: none; border-radius: 32px; overflow: hidden;
}
.widget-panel--center { align-items: center; justify-content: center; }
.widget-loading {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 0.5rem; color: rgba(0,0,0,0.45);
}
.widget-loading-spinner { color: #E8713A; }
.widget-loading p { font-size: 0.75rem; }
.widget-error-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 0.75rem;
  padding: 2rem; text-align: center; color: rgba(0,0,0,0.5);
}
.widget-error-state p { font-size: 0.75rem; max-width: 240px; }
.widget-error-retry {
  padding: 0.375rem 1.25rem; background: #E8713A; color: white;
  border: none; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; cursor: pointer;
}
.widget-success-content { text-align: center; padding: 1.5rem; }
.widget-success-icon { margin-bottom: 0.75rem; }
.widget-success-content h3 { font-size: 1rem; font-weight: 600; color: #000; margin: 0 0 0.375rem; }
.widget-success-content p { font-size: 0.75rem; color: rgba(0,0,0,0.55); margin: 0; }
@media (max-width: 480px) { .widget-panel { border-radius: 0; } }
`
if (typeof document !== 'undefined') {
  const id = 'weggy-chat-widget-styles'
  if (!document.getElementById(id)) {
    const el = document.createElement('style'); el.id = id; el.textContent = STYLES; document.head.appendChild(el)
  }
}
