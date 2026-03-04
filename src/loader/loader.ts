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
  const primaryColor = attr('primary-color', '#E8713A');
  const accentColor = attr('accent-color', '#E8713A');
  const agentName = attr('agent-name', 'Weggy');
  const companyName = attr('company-name', 'Kooler Garage Doors');
  const greeting = attr(
    'greeting',
    "Hi, I'm Weggy — how can I help you today?"
  );
  const suggestionChips = attr(
    'suggestion-chips',
    "My garage door won't open,I need a spring replaced,Schedule a service call,Get a free estimate"
  );
  const target = attr('target', '');
  const useMock = attr('mock', 'false') === 'true';

  // ─── Dimensions (PRD spec) ────────────────────────────────────────────────────
  // Collapsed: 460×64  Expanded: 720×490  Margin: 20px

  const COLLAPSED_W = 460;
  const COLLAPSED_H = 64;
  const EXPANDED_W  = 720;
  const EXPANDED_H  = 490;
  const MARGIN      = 20;

  function isMobile(): boolean {
    return window.innerWidth <= 480;
  }

  function collapsedDimensions(): { w: string; h: string } {
    if (isMobile()) return { w: 'calc(100vw - 40px)', h: '56px' };
    return { w: `${COLLAPSED_W}px`, h: `${COLLAPSED_H}px` };
  }

  function expandedDimensions(): { w: string; h: string } {
    if (isMobile()) return { w: '100vw', h: '100dvh' };
    return { w: `${EXPANDED_W}px`, h: `${EXPANDED_H}px` };
  }

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

  // ─── Apply dimensions to iframe ───────────────────────────────────────────────

  function applyCollapsedSize(): void {
    if (!iframe) return;
    const { w, h } = collapsedDimensions();
    const isRight = position === 'bottom-right';
    Object.assign(iframe.style, {
      width: w,
      height: h,
      right: isRight ? `${MARGIN}px` : 'auto',
      left: isRight ? 'auto' : `${MARGIN}px`,
      bottom: isMobile() ? '0' : `${MARGIN}px`,
    });
  }

  function applyExpandedSize(): void {
    if (!iframe) return;
    const { w, h } = expandedDimensions();
    const isRight = position === 'bottom-right';
    Object.assign(iframe.style, {
      width: w,
      height: h,
      right: isMobile() ? '0' : isRight ? `${MARGIN}px` : 'auto',
      left: isMobile() ? '0' : isRight ? 'auto' : `${MARGIN}px`,
      bottom: isMobile() ? '0' : `${MARGIN}px`,
    });
  }

  // ─── Create the iframe ────────────────────────────────────────────────────────

  function createIframe(): HTMLIFrameElement {
    const el = document.createElement('iframe');
    el.id = 'weggy-widget-iframe';
    el.src = buildIframeSrc();
    el.title = `${agentName} — ${companyName}`;
    el.allow = 'microphone; camera';
    el.setAttribute('allowtransparency', 'true');

    const isInline = mode === 'inline';
    const isRight  = position === 'bottom-right';
    const { w, h } = collapsedDimensions();

    Object.assign(el.style, {
      position: isInline ? 'relative' : 'fixed',
      bottom: isInline ? 'auto' : `${MARGIN}px`,
      right:  isInline ? 'auto' : isRight ? `${MARGIN}px` : 'auto',
      left:   isInline ? 'auto' : isRight ? 'auto' : `${MARGIN}px`,
      width:  isInline ? '100%' : w,
      height: isInline ? '600px' : h,
      maxHeight: isInline ? '600px' : 'none',
      border: 'none',
      background: 'transparent',
      backgroundColor: 'transparent',
      zIndex: '999999',
      display: 'block',
      transition: 'width 0.3s ease, height 0.3s ease',
      overflow: 'hidden',
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
    applyExpandedSize();
    postToWidget('weggy:open');
  }

  function close(): void {
    isOpen = false;
    applyCollapsedSize();
    postToWidget('weggy:close');
  }

  function toggle(): void {
    if (isOpen) { close(); } else { open(); }
  }

  function getIsOpen(): boolean { return isOpen; }

  // ─── Listen for messages from the iframe ─────────────────────────────────────

  window.addEventListener('message', (event: MessageEvent) => {
    if (!iframe) return;
    const widgetOrigin = widgetHost.replace(/\/$/, '');
    if (!event.origin.startsWith(widgetOrigin) && event.origin !== window.location.origin) return;

    const data = event.data as { source?: string; type?: string };
    if (data?.source !== 'weggy-widget') return;

    switch (data.type) {
      case 'weggy:ready':
        isReady = true;
        break;
      case 'weggy:open':
        isOpen = true;
        applyExpandedSize();
        break;
      case 'weggy:close':
        isOpen = false;
        applyCollapsedSize();
        break;
      default:
        break;
    }
  });

  // ─── Mount ────────────────────────────────────────────────────────────────────

  function mount(): void {
    if (document.getElementById('weggy-widget-iframe')) return;

    iframe = createIframe();

    if (mode === 'inline' && target) {
      const container = document.getElementById(target);
      if (container) { container.appendChild(iframe); return; }
    }

    document.body.appendChild(iframe);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  // ─── Destroy ──────────────────────────────────────────────────────────────────

  function destroy(): void {
    if (iframe) { iframe.remove(); iframe = null; }
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
