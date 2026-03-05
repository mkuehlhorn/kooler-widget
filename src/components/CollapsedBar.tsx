import { useState, useEffect, useRef } from 'react'

interface CollapsedBarProps {
  onExpand: () => void
  greetingText?: string
  avatarUrl?: string
}

function randomInterval(): number { return 8000 + Math.random() * 7000 }

export function CollapsedBar({
  onExpand,
  greetingText = "Hi, I'm Weggy — how can I help you today?",
  avatarUrl,
}: CollapsedBarProps) {
  const [isPulsing, setIsPulsing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function triggerPulse() {
      setIsPulsing(true)
      timerRef.current = setTimeout(() => {
        setIsPulsing(false)
        timerRef.current = setTimeout(triggerPulse, randomInterval())
      }, 2000)
    }
    timerRef.current = setTimeout(triggerPulse, 5000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return (
    <div
      className={`collapsed-bar-wrapper${isPulsing ? ' collapsed-bar-wrapper--pulsing' : ''}`}
      onClick={onExpand}
      role="button"
      tabIndex={0}
      aria-label="Open chat with Weggy"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onExpand() }}
    >
      <div className="collapsed-bar-pill">
        <span className="collapsed-bar-text">{greetingText}</span>
        <span className="collapsed-bar-cta">START</span>
      </div>
      <div className="collapsed-bar-avatar">
        <img
          src={avatarUrl || '/weggy-avatar.jpg'}
          alt="Weggy"
          className="collapsed-bar-avatar-img"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      </div>
    </div>
  )
}

// Self-injected styles — matches PRD spec exactly
const STYLES = `
.collapsed-bar-wrapper {
  display: flex; align-items: center; justify-content: flex-end;
  width: 100%; max-width: 460px; padding: 4px 8px; overflow: hidden;
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,0.55);
  box-shadow: none; border-radius: 9999px; cursor: pointer;
  transition:
    max-width 0.5s cubic-bezier(0.4,0,0.2,1),
    padding-left 0.5s cubic-bezier(0.4,0,0.2,1),
    padding-right 0.5s cubic-bezier(0.4,0,0.2,1),
    transform 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
.collapsed-bar-wrapper:hover { transform: translateY(-1px); }
.collapsed-bar-wrapper:active { transform: translateY(0); }

.collapsed-bar-pill {
  display: flex; align-items: center; flex: 1; min-width: 0; max-width: 460px;
  overflow: hidden; padding: 6px 16px;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 9999px;
  margin-left: 2px; margin-right: 6px; white-space: nowrap; opacity: 1;
  transition:
    max-width 0.45s cubic-bezier(0.4,0,0.2,1),
    opacity 0.3s ease,
    margin-right 0.45s cubic-bezier(0.4,0,0.2,1),
    margin-left 0.45s cubic-bezier(0.4,0,0.2,1);
}

.collapsed-bar-text {
  flex: 1; font-size: 11px; color: rgba(0,0,0,0.75); font-weight: 400;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 8px;
}

.collapsed-bar-cta {
  display: flex; align-items: center; justify-content: center;
  padding: 5px 14px;
  background: #E8713A;
  color: white; font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
  border-radius: 9999px; white-space: nowrap; flex-shrink: 0;
  transition: all 0.15s ease; box-shadow: var(--w-shadow-orange);
}
.collapsed-bar-wrapper:hover .collapsed-bar-cta { background: #D4622A; }

.collapsed-bar-avatar {
  width: 44px; height: 44px; border-radius: 50%; overflow: hidden;
  flex-shrink: 0; background: #ffffff;
  border: 1px solid rgba(255,255,255,0.7); box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.collapsed-bar-avatar-img { width: 100%; height: 100%; object-fit: cover; }

/* Pulse — pill collapses, only avatar shows (avatar remains clickable) */
.collapsed-bar-wrapper--pulsing {
  max-width: 52px; padding-left: 4px; padding-right: 4px;
}
.collapsed-bar-wrapper--pulsing .collapsed-bar-pill {
  max-width: 0; opacity: 0; margin-right: 0; margin-left: 0; pointer-events: none;
}

@media (max-width: 480px) {
  .collapsed-bar-wrapper { padding: 4px; }
  .collapsed-bar-pill { padding: 6px 12px; margin-right: 4px; }
  .collapsed-bar-text { font-size: 12px; }
  .collapsed-bar-cta { padding: 6px 14px; font-size: 12px; }
  .collapsed-bar-avatar { width: 42px; height: 42px; }
}
@media (max-width: 360px) { .collapsed-bar-text { display: none; } }
`
if (typeof document !== 'undefined') {
  const id = 'weggy-collapsed-bar-styles'
  if (!document.getElementById(id)) {
    const el = document.createElement('style')
    el.id = id
    el.textContent = STYLES
    document.head.appendChild(el)
  }
}
