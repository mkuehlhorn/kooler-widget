import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, ChatSession, WidgetConfig } from '../types';
import {
  createSession,
  streamMessage,
  clearSessionCredentials,
  isMockMode,
  setSessionCredentials,
} from '../services/api';

// sessionStorage keys — only used in mock/dev mode to survive hot-reloads
const SESSION_STORAGE_KEY = 'weggy-widget-session';
const TOKEN_EXPIRY_KEY    = 'weggy-widget-token';

function loadStoredSession(): ChatSession | null {
  if (!isMockMode()) return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const expiryRaw = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!raw || !expiryRaw) return null;
    const expiry = parseInt(expiryRaw, 10);
    if (Date.now() > expiry) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
      return null;
    }
    return JSON.parse(raw) as ChatSession;
  } catch {
    return null;
  }
}

function saveStoredSession(session: ChatSession): void {
  if (!isMockMode()) return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    // Store expiry as epoch ms
    const expiryMs = session.expiresAt
      ? new Date(session.expiresAt).getTime()
      : Date.now() + 30 * 60 * 1000; // 30-min fallback
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryMs));
  } catch {
    // sessionStorage blocked (iframe sandbox) — fail silently
  }
}

function clearStoredSession(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch { /* ignore */ }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildPageContext() {
  return {
    pageUrl: window.location.href,
    pageTitle: document.title,
    referrer: document.referrer || undefined,
    utmSource: new URLSearchParams(window.location.search).get('utm_source') ?? undefined,
    utmMedium: new URLSearchParams(window.location.search).get('utm_medium') ?? undefined,
    utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') ?? undefined,
  };
}

interface UseChatResult {
  messages: ChatMessage[];
  isTyping: boolean;
  isInitializing: boolean;
  error: string | null;
  session: ChatSession | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
}

export function useChat({ config }: { config: WidgetConfig }): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);

  // Keep session ref in sync for use inside callbacks without stale closure
  const sessionRef = useRef<ChatSession | null>(null);
  sessionRef.current = session;

  const initSession = useCallback(async (): Promise<ChatSession | null> => {
    if (sessionRef.current) return sessionRef.current;

    // Restore from sessionStorage in mock/dev mode (survives hot-reloads)
    const stored = loadStoredSession();
    if (stored) {
      setSessionCredentials(stored.sessionId, stored.token);
      setSession(stored);
      sessionRef.current = stored;
      return stored;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const pageContext = buildPageContext();
      const data = await createSession({
        market: config.market,
        language: config.language,
        pageContext,
      });

      const newSession: ChatSession = {
        sessionId: data.sessionId,
        token: data.token,
        expiresAt: data.expiresAt,
      };

      saveStoredSession(newSession);
      setSession(newSession);
      sessionRef.current = newSession;

      // Add greeting message
      const greetingText = data.greeting ?? config.greeting;
      const greetingMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: greetingText,
        status: 'sent',
        timestamp: Date.now(),
      };
      setMessages([greetingMessage]);

      return newSession;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to start chat session.';
      setError(message);
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [config.market, config.language, config.greeting]);

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim()) return;

      // Ensure session exists
      let activeSession = sessionRef.current;
      if (!activeSession) {
        activeSession = await initSession();
        if (!activeSession) return; // init failed — error already set
      }

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        status: 'sending',
        timestamp: Date.now(),
      };

      const assistantPlaceholderId = generateId();
      const assistantPlaceholder: ChatMessage = {
        id: assistantPlaceholderId,
        role: 'assistant',
        content: '',
        status: 'streaming',
        timestamp: Date.now(),
      };

      setMessages((prev) => [
        ...prev,
        { ...userMessage, status: 'sent' },
        assistantPlaceholder,
      ]);
      setIsTyping(true);
      setError(null);

      let accumulatedContent = '';

      await streamMessage({
        sessionId: activeSession.sessionId,
        token: activeSession.token,
        message: content.trim(),
        onToken: (token) => {
          accumulatedContent += token;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantPlaceholderId
                ? { ...msg, content: accumulatedContent, status: 'streaming' }
                : msg
            )
          );
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantPlaceholderId
                ? { ...msg, status: 'sent' }
                : msg
            )
          );
          setIsTyping(false);
        },
        onError: (err) => {
          if (err === 'SESSION_EXPIRED') {
            // Clear session (memory + sessionStorage) and show expiry message
            clearSessionCredentials();
            clearStoredSession();
            setSession(null);
            sessionRef.current = null;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantPlaceholderId
                  ? {
                      ...msg,
                      content:
                        'Your session has expired. Please refresh the page to start a new chat.',
                      status: 'error',
                    }
                  : msg
              )
            );
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantPlaceholderId
                  ? {
                      ...msg,
                      content:
                        'Sorry, something went wrong. Please try again.',
                      status: 'error',
                    }
                  : msg
              )
            );
          }
          setIsTyping(false);
        },
      });
    },
    [initSession]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isTyping,
    isInitializing,
    error,
    session,
    sendMessage,
    clearError,
  };
}
