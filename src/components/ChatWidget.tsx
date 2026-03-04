import { useState, useEffect, useCallback } from 'react';
import type { WidgetConfig, WidgetState, CallbackFormData } from '../types';
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

export function ChatWidget({ config }: ChatWidgetProps) {
  const [widgetState, setWidgetState] = useState<WidgetState>(
    config.mode === 'inline' ? 'expanded' : 'collapsed'
  );
  const [showChips, setShowChips] = useState(true);
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);

  const { messages, isTyping, isInitializing, error, sendMessage, clearError } =
    useChat({ config });

  // Hide chips after first user message
  const userMessageCount = messages.filter((m) => m.role === 'user').length;
  const showCallbackCTA = userMessageCount >= 2 && widgetState === 'expanded';

  useEffect(() => {
    if (userMessageCount > 0) {
      setShowChips(false);
    }
  }, [userMessageCount]);

  // ── Notify parent iframe on state changes ─────────────────────────────────
  useEffect(() => {
    if (window.parent === window) return;
    const type = widgetState === 'collapsed' ? 'weggy:close' : 'weggy:open';
    window.parent.postMessage({ source: 'weggy-widget', type }, '*');
  }, [widgetState]);

  // ── Listen for open/close commands from parent loader ─────────────────────
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data as { source?: string; type?: string };
      if (data?.source !== 'weggy-loader') return;
      if (data.type === 'weggy:open' && widgetState === 'collapsed') {
        setWidgetState('expanded');
      } else if (
        data.type === 'weggy:close' &&
        widgetState !== 'collapsed'
      ) {
        setWidgetState('collapsed');
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [widgetState]);

  const handleOpen = useCallback(() => {
    setWidgetState('expanded');
  }, []);

  const handleClose = useCallback(() => {
    if (config.mode === 'inline') return; // inline stays open
    setWidgetState('collapsed');
  }, [config.mode]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (widgetState !== 'expanded') setWidgetState('expanded');
      await sendMessage(content);
    },
    [widgetState, sendMessage]
  );

  const handleRequestCallback = useCallback(() => {
    setWidgetState('callback-form');
  }, []);

  const handleCallbackSubmit = useCallback(
    async (data: CallbackFormData) => {
      setCallbackSubmitting(true);
      try {
        await submitCallback(data);
        setWidgetState('callback-success');
        // Auto-return to chat after 3s
        setTimeout(() => {
          setWidgetState('expanded');
        }, 3000);
      } catch (err) {
        // Surface error — keep form open
        console.error('Callback submission error:', err);
      } finally {
        setCallbackSubmitting(false);
      }
    },
    []
  );

  const handleCallbackCancel = useCallback(() => {
    setWidgetState('expanded');
  }, []);

  const avatarPath = config.avatarPath ?? '/weggy-avatar.jpg';

  // ── Inline mode — always expanded ─────────────────────────────────────────
  if (config.mode === 'inline') {
    return (
      <div
        className="weggy-chat-panel flex flex-col"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '0',
          overflow: 'hidden',
          background: 'var(--widget-glass-bg)',
        }}
      >
        <ChatHeader
          agentName={config.agentName}
          companyName={config.companyName}
          avatarPath={avatarPath}
          onClose={undefined}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderChatBody()}
        </div>
      </div>
    );
  }

  // ── Dock mode ─────────────────────────────────────────────────────────────

  function renderChatBody() {
    if (isInitializing) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <LoaderIcon
            size={28}
            className="text-[var(--widget-primary)]"
          />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertCircleIcon size={32} className="text-red-400" />
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={clearError}
            className="px-4 py-2 rounded-full text-sm text-white"
            style={{ background: 'var(--widget-primary)' }}
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <>
        <MessageList
          messages={messages}
          agentAvatarPath={avatarPath}
        />
        {showChips && userMessageCount === 0 && (
          <SuggestionChips
            chips={config.suggestionChips}
            onChipClick={handleSendMessage}
            primaryColor={config.primaryColor}
          />
        )}
        {showCallbackCTA && (
          <CallbackCTA
            onRequestCall={handleRequestCallback}
            accentColor={config.accentColor}
          />
        )}
        <div className="weggy-safe-bottom">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isTyping || isInitializing}
          />
        </div>
      </>
    );
  }

  return (
    <div
      className="flex flex-col items-end justify-end"
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {/* Expanded chat panel */}
      {(widgetState === 'expanded' ||
        widgetState === 'callback-form' ||
        widgetState === 'callback-success') && (
        <div
          className="weggy-chat-panel weggy-panel-enter widget-glass flex flex-col"
          style={{
            width: '100%',
            maxWidth: '420px',
            height: '640px',
            maxHeight: 'calc(100dvh - 16px)',
            borderRadius: `${config.position === 'bottom-right' ? '24px 24px 6px 24px' : '24px 24px 24px 6px'}`,
            boxShadow: 'var(--widget-shadow)',
            overflow: 'hidden',
            pointerEvents: 'all',
            marginBottom: '8px',
          }}
        >
          {widgetState === 'callback-form' && (
            <CallbackForm
              onSubmit={handleCallbackSubmit}
              onCancel={handleCallbackCancel}
              config={config}
              isSubmitting={callbackSubmitting}
            />
          )}

          {widgetState === 'callback-success' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl text-white"
                style={{ background: 'var(--widget-accent)' }}
              >
                ✓
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {config.callbackSuccessTitle}
              </h3>
              <p className="text-sm text-gray-600 max-w-xs">
                {config.callbackSuccessMessage}
              </p>
            </div>
          )}

          {widgetState === 'expanded' && (
            <>
              <ChatHeader
                agentName={config.agentName}
                companyName={config.companyName}
                avatarPath={avatarPath}
                onClose={handleClose}
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                {renderChatBody()}
              </div>
            </>
          )}
        </div>
      )}

      {/* Collapsed bar */}
      {widgetState === 'collapsed' && (
        <div style={{ pointerEvents: 'all', marginBottom: '16px' }}>
          <CollapsedBar
            agentName={config.agentName}
            greeting={config.greeting}
            avatarPath={avatarPath}
            primaryColor={config.primaryColor}
            onOpen={handleOpen}
          />
        </div>
      )}
    </div>
  );
}
