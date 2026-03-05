import type { ApiConfig, CallbackFormData, PageContext } from '../types';

// ─── Module-level state ────────────────────────────────────────────────────────

let _config: ApiConfig = {
  baseUrl: '',
  useMock: false,
};

let _sessionCredentials: { sessionId: string; token: string } | null = null;

// ─── Configuration ────────────────────────────────────────────────────────────

export function configureApi(config: ApiConfig): void {
  _config = { ...config };
}

export function isMockMode(): boolean {
  return _config.useMock;
}

// ─── Session credentials ──────────────────────────────────────────────────────

export function setSessionCredentials(sessionId: string, token: string): void {
  _sessionCredentials = { sessionId, token };
}

export function clearSessionCredentials(): void {
  _sessionCredentials = null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
  if (!_sessionCredentials) return {};
  return {
    Authorization: `Bearer ${_sessionCredentials.token}`,
  };
}

function apiUrl(path: string): string {
  const base = _config.baseUrl.replace(/\/$/, '');
  return `${base}${path}`;
}

// ─── Mock helpers ─────────────────────────────────────────────────────────────

const MOCK_RESPONSES = [
  "I'd be happy to help with your garage door! Could you tell me more about what's happening — is it not opening, making a noise, or something else?",
  'Got it! We can definitely schedule a technician for that. What day works best for you — would morning or afternoon be more convenient?',
  "Great, I've noted your details. Our team typically responds within 30 minutes during business hours. Is there anything else I can help you with?",
  "That sounds like it could be a spring issue — very common! Our technicians are experienced with all spring types. Would you like to book a service call?",
  "I understand urgency is important. Let me connect you with a Kooler technician right away. Can I get your name and best phone number?",
];

let _mockResponseIndex = 0;

async function simulateStream(
  onToken: (token: string) => void,
  onDone: () => void
): Promise<void> {
  const response = MOCK_RESPONSES[_mockResponseIndex % MOCK_RESPONSES.length];
  _mockResponseIndex++;

  await new Promise((resolve) => setTimeout(resolve, 500));

  const words = response.split(' ');
  for (const word of words) {
    await new Promise((resolve) => setTimeout(resolve, 60));
    onToken(word + ' ');
  }

  onDone();
}

// ─── API methods ──────────────────────────────────────────────────────────────

export async function createSession(params: {
  market: string;
  language: string;
  pageContext: PageContext;
}): Promise<{ sessionId: string; token: string; expiresAt: string; greeting?: string }> {
  if (_config.useMock) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const mockSessionId = `mock-session-${Date.now()}`;
    const mockToken = `mock-token-${Math.random().toString(36).slice(2)}`;
    setSessionCredentials(mockSessionId, mockToken);
    return {
      sessionId: mockSessionId,
      token: mockToken,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }

  const response = await fetch(apiUrl('/api/chat/session'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create session: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    sessionId: string;
    token: string;
    expiresAt: string;
    greeting?: string;
  };

  setSessionCredentials(data.sessionId, data.token);
  return data;
}

export async function streamMessage(params: {
  sessionId: string;
  token: string;
  message: string;
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}): Promise<void> {
  const { sessionId, token, message, onToken, onDone, onError } = params;

  if (_config.useMock) {
    await simulateStream(onToken, onDone);
    return;
  }

  let response: Response;
  try {
    response = await fetch(apiUrl('/api/chat/message'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId, message }),
    });
  } catch (_err) {
    onError('Network error — please check your connection.');
    return;
  }

  if (response.status === 401) {
    onError('SESSION_EXPIRED');
    return;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    onError(`Server error: ${response.status}${text ? ' — ' + text : ''}`);
    return;
  }

  if (!response.body) {
    onError('No response body received from server.');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      // Keep the last (potentially incomplete) line in buffer
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();

        // Blank line resets event type (SSE spec)
        if (!trimmed) {
          currentEvent = '';
          continue;
        }

        if (trimmed.startsWith('event: ')) {
          currentEvent = trimmed.slice(7).trim();
          // Handle event-only done signal
          if (currentEvent === 'done') {
            onDone();
            return;
          }
          continue;
        }

        if (trimmed.startsWith('data: ')) {
          const rawData = trimmed.slice(6);

          // Only process data for token events (or untyped events)
          // Skip tool_start, tool_done, and other non-content events
          if (currentEvent && currentEvent !== 'token') {
            // Check for error event data
            if (currentEvent === 'error') {
              try {
                const parsed = JSON.parse(rawData) as { error?: string };
                if (parsed.error) { onError(parsed.error); return; }
              } catch { /* ignore */ }
            }
            continue;
          }

          try {
            const parsed = JSON.parse(rawData) as { error?: string; token?: string; type?: string };
            if (parsed.error) {
              onError(parsed.error);
              return;
            }
            if (parsed.type === 'done') {
              onDone();
              return;
            }
            if (parsed.token !== undefined) {
              onToken(parsed.token);
              continue;
            }
          } catch {
            // Not JSON — treat as raw token text
          }

          // Plain text token (non-JSON SSE)
          if (rawData !== '[DONE]') {
            onToken(rawData);
          } else {
            onDone();
            return;
          }
        }
      }
    }
  } catch (_err) {
    onError('Stream interrupted.');
  } finally {
    reader.cancel().catch(() => {});
  }

  // If we exited the loop without an explicit done event, fire it now
  onDone();
}

export async function submitCallback(
  data: CallbackFormData
): Promise<{ requestId: string; status: string }> {
  if (_config.useMock) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { requestId: `mock-req-${Date.now()}`, status: 'queued' };
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  // Include sessionId so backend can link callback to chat session + ST customer
  const body = {
    ...data,
    ...(_sessionCredentials ? { sessionId: _sessionCredentials.sessionId } : {}),
  };

  const response = await fetch(apiUrl('/api/callback'), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Callback submission failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<{ requestId: string; status: string }>;
}

export async function closeSession(sessionId: string): Promise<void> {
  if (!_sessionCredentials) return;
  if (_config.useMock) {
    clearSessionCredentials();
    return;
  }

  try {
    await fetch(apiUrl(`/api/chat/session/${sessionId}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch {
    // Best-effort — ignore errors on close
  } finally {
    clearSessionCredentials();
  }
}
