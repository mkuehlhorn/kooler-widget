// ─── Widget display modes ────────────────────────────────────────────────────

/** dock = floating button bottom-right/left; inline = embedded in page */
export type WidgetMode = 'dock' | 'inline';

export type WidgetPosition = 'bottom-right' | 'bottom-left';

/** The four visual states the widget cycles through */
export type WidgetState =
  | 'collapsed'
  | 'expanded'
  | 'callback-form'
  | 'callback-success';

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type MessageStatus = 'sending' | 'sent' | 'streaming' | 'error';
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  timestamp: number;
}

export interface ChatSession {
  sessionId: string;
  token: string;
  expiresAt: string;
}

// ─── Callback form ────────────────────────────────────────────────────────────

export type ServiceType =
  | 'repair'
  | 'installation'
  | 'tune-up'
  | 'spring'
  | 'opener'
  | 'emergency'
  | 'other';

export type Urgency = 'asap' | 'today' | 'this-week' | 'flexible';

export interface CallbackFormData {
  name: string;
  phone: string;
  serviceType?: ServiceType;
  urgency?: Urgency;
  consent: boolean;
}

export type CallbackFormErrors = Partial<Record<keyof CallbackFormData, string>>;

// ─── Context & config ─────────────────────────────────────────────────────────

export interface PageContext {
  pageUrl: string;
  pageTitle: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface WidgetConfig {
  mode: WidgetMode;
  position: WidgetPosition;
  inboundHost: string;
  widgetHost: string;
  market: string;
  language: string;
  primaryColor: string;
  accentColor: string;
  agentName: string;
  companyName: string;
  greeting: string;
  callbackSuccessTitle: string;
  callbackSuccessMessage: string;
  suggestionChips: string[];
  target?: string;
  avatarPath?: string;
}

export interface ApiConfig {
  baseUrl: string;
  useMock: boolean;
}
