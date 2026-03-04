/**
 * kooler-widget loader — vanilla TypeScript, zero imports, zero dependencies.
 *
 * Drop one <script> tag on any page and the widget appears.
 * All config comes from data-* attributes on the script tag.
 *
 * Example:
 * <script
 *   src="https://widget.koolergaragedoors.com/loader.js"
 *   data-widget-host="https://widget.koolergaragedoors.com"
 *   data-inbound-host="https://kooler-inbound-server.onrender.com"
 *   data-position="bottom-right"
 *   data-market="us"
 *   data-language="en"
 *   data-primary-color="#1B2F5B"
 *   data-accent-color="#F97316"
 *   async
 * ></script>
 */

(function () {
  'use strict';

  // ─── Find the script tag that loaded this file ───────────────────────────────

  function getCurrentScript(): HTMLScriptElement | null {
    if (document.currentScript) {
      return document.currentScript as HTMLScriptElement;
    }
    // Fallback for async scripts in older browsers
    const scripts = document.querySelectorAll<HTMLScriptElement>(
      'script[src*="loader.js"]'
    );
    return scripts[scripts.length - 1] ?? null;
  }

  const scriptTag = getCurrentScript();

  function attr(name: string, fallback: string): string {
    return scriptTag?.getAttribute(`data-${name}`) ?? fallback;
  }

  // ─── Read config from data attributes ────────────────────────────────────────

  const widgetHost = attr('widget-host', 'https://widget.koolergaragedoors.com');
  const inboundHost = attr(
    'inbound-host',
    'https://kooler-inbound-server.onrender.com'
  );
  const position = attr('position', 'bottom-right') as 'bottom-right' | 'bottom-left';
  const mode = attr('mode', 'dock') as 'dock' | 'inline';
  const market = attr('market', 'us');
  const language = attr('language', 'en');
  const primaryColor = attr('primary-color', '#1B2F5B');
  const accentColor = attr('accent-color', '#F97316');
  const agentName = attr('agent-name', 'Weggy');
  const companyName = attr('company-name', 'Kooler Garage Doors');
  const greeting = attr(
    'greeting',
    "Hi! I'm Weggy, your Kooler Garage Doors assistant. Are you dealing with an emergency, or would you like to schedule a service?"
  );
  const suggestionChips = attr(
    'suggestion-chips',
    'I need a repair,Schedule an installation,Get a free quote,Emergency service'
  );
  const target = attr('target', '');
  const useMock = attr('mock', 'false') === 'true';

  // ─── Build iframe src URL ─────────────────────────────────────────────────────

  function buildIframeSrc(): string {
    const params = new URLSearchParams({
      inboundHost,
      widgetHost,
      mode,
      position,
      market,
      language,
      primaryColor,
      accentColor,
      agentName,
      companyName,
      greeting,
      suggestionChips,
    });
    if (target) params.set('target', target);
    if (useMock) params.set('mock', 'true');
    return `${widgetHost}/index.html?${params.toString()}`;
  }

  // ─── State ────────────────────────────────────────────────────────────────────

  let isOpen = false;
  let isReady = false;
  let iframe: HTMLIFrameElement | null = null;

  // ─── Create the iframe ────────────────────────────────────────────────────────

  function createIframe(): HTMLIFrameElement {
    const el = document.createElement('iframe');
    el.id = 'weggy-widget-iframe';
    el.src = buildIframeSrc();
    el.title = `${agentName} — ${companyName}`;
    el.allow = 'microphone; camera';

    const isRight = position === 'bottom-right';
    const isInline = mode === 'inline';

    Object.assign(el.style, {
      position: isInline ? 'relative' : 'fixed',
      bottom: isInline ? 'auto' : '0',
      right: isInline ? 'auto' : isRight ? '0' : 'auto',
      left: isInline ? 'auto' : isRight ? 'auto' : '0',
      width: isInline ? '100%' : '420px',
      height: isInline ? '600px' : '700px',
      maxHeight: isInline ? '600px' : '100dvh',
      border: 'none',
      background: 'transparent',
      zIndex: '999999',
      display: 'block',
    });

    return el;
  }

  // ─── Send message to iframe ───────────────────────────────────────────────────

  function postToWidget(type: string, payload?: Record<string, unknown>): void {
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage({ source: 'weggy-loader', type, ...(payload ?? {}) }, '*');
  }

  // ─── Public API ───────────────────────────────────────────────────────────────

  function open(): void {
    if (!isReady) return;
    isOpen = true;
    postToWidget('weggy:open');
  }

  function close(): void {
    isOpen = false;
    postToWidget('weggy:close');
  }

  function toggle(): void {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  function getIsOpen(): boolean {
    return isOpen;
  }

  // ─── Listen for messages from the iframe ─────────────────────────────────────

  window.addEventListener('message', (event: MessageEvent) => {
    if (!iframe) return;
    // Only accept messages from our widget origin
    if (!event.origin.startsWith(widgetHost.replace(/\/$/, ''))) {
      // In mock/dev mode, also accept same-origin
      if (event.origin !== window.location.origin) return;
    }

    const data = event.data as { source?: string; type?: string };
    if (data?.source !== 'weggy-widget') return;

    switch (data.type) {
      case 'weggy:ready':
        isReady = true;
        break;

      case 'weggy:open':
        isOpen = true;
        break;

      case 'weggy:close':
        isOpen = false;
        break;

      case 'weggy:resize': {
        const resizeData = data as { height?: number };
        if (resizeData.height && iframe) {
          iframe.style.height = `${resizeData.height}px`;
        }
        break;
      }

      default:
        break;
    }
  });

  // ─── Mount ────────────────────────────────────────────────────────────────────

  function mount(): void {
    if (document.getElementById('weggy-widget-iframe')) return; // Already mounted

    iframe = createIframe();

    if (mode === 'inline' && target) {
      const container = document.getElementById(target);
      if (container) {
        container.appendChild(iframe);
        return;
      }
    }

    document.body.appendChild(iframe);
  }

  // Mount when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  // ─── Destroy ──────────────────────────────────────────────────────────────────

  function destroy(): void {
    if (iframe) {
      iframe.remove();
      iframe = null;
    }
    isOpen = false;
    isReady = false;
    delete (window as Window & { WeggyWidget?: WeggyWidgetAPI }).WeggyWidget;
  }

  // ─── Expose global API ────────────────────────────────────────────────────────

  interface WeggyWidgetAPI {
    open: () => void;
    close: () => void;
    toggle: () => void;
    isOpen: () => boolean;
    destroy: () => void;
    getMode: () => 'dock' | 'inline';
  }

  (window as Window & { WeggyWidget?: WeggyWidgetAPI }).WeggyWidget = {
    open,
    close,
    toggle,
    isOpen: getIsOpen,
    destroy,
    getMode: () => mode,
  };
})();
