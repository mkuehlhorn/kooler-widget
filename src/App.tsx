import { useEffect, useMemo } from 'react';
import { BRAND } from './config/brand';
import { configureApi } from './services/api';
import type { WidgetConfig } from './types';
import { ChatWidget } from './components/ChatWidget';

function parseChips(raw: string | null): string[] {
  if (!raw) return BRAND.suggestionChips;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string');
  } catch {
    // Comma-separated fallback
    const chips = raw.split(',').map((s) => s.trim()).filter(Boolean);
    if (chips.length > 0) return chips;
  }
  return BRAND.suggestionChips;
}

export default function App() {
  // useMemo so configureApi() is called synchronously on first render only —
  // prevents race condition where mock token is generated before real API is configured.
  const config: WidgetConfig = useMemo(() => {
    const params = new URLSearchParams(window.location.search);

    const inboundHost =
      params.get('inboundHost') ?? 'https://kooler-inbound-server.onrender.com';
    const widgetHost =
      params.get('widgetHost') ?? window.location.origin;
    const useMock = params.get('mock') === 'true';

    // Configure synchronously here — before any child renders or hooks fire.
    configureApi({ baseUrl: inboundHost, useMock });

    return {
      mode: (params.get('mode') as WidgetConfig['mode']) ?? 'dock',
      position:
        (params.get('position') as WidgetConfig['position']) ?? 'bottom-right',
      inboundHost,
      widgetHost,
      market: params.get('market') ?? 'us',
      language: params.get('language') ?? 'en',
      primaryColor: params.get('primaryColor') ?? BRAND.primaryColor,
      accentColor: params.get('accentColor') ?? BRAND.accentColor,
      agentName: params.get('agentName') ?? BRAND.agentName,
      companyName: params.get('companyName') ?? BRAND.companyName,
      greeting: params.get('greeting') ?? BRAND.greeting,
      callbackSuccessTitle: BRAND.callbackSuccessTitle,
      callbackSuccessMessage: BRAND.callbackSuccessMessage,
      suggestionChips: parseChips(params.get('suggestionChips')),
      target: params.get('target') ?? undefined,
      avatarPath: BRAND.avatarPath,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps — URL params don't change after mount

  // Apply primary color as CSS variable so Tailwind arbitrary values work
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--widget-primary',
      config.primaryColor
    );
    document.documentElement.style.setProperty(
      '--widget-accent',
      config.accentColor
    );
  }, [config.primaryColor, config.accentColor]);

  // Notify parent loader that widget is ready
  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { source: 'weggy-widget', type: 'weggy:ready' },
        '*'
      );
    }
  }, []);

  return <ChatWidget config={config} />;
}
