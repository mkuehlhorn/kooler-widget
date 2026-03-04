import { useState, useEffect, useRef, useCallback } from 'react';

interface CollapsedBarProps {
  agentName: string;
  greeting: string;
  avatarPath: string;
  primaryColor: string;
  onOpen: () => void;
}

const MIN_PULSE_DELAY_MS   = 8000;
const MAX_PULSE_DELAY_MS   = 15000;
const PULSE_DURATION_MS    = 2200;
const FIRST_PULSE_DELAY_MS = 5000;

export function CollapsedBar({ agentName, avatarPath, onOpen }: CollapsedBarProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedulePulse = useCallback((delayMs: number) => {
    timerRef.current = setTimeout(() => {
      setIsPulsing(true);
      timerRef.current = setTimeout(() => {
        setIsPulsing(false);
        const next =
          MIN_PULSE_DELAY_MS +
          Math.random() * (MAX_PULSE_DELAY_MS - MIN_PULSE_DELAY_MS);
        schedulePulse(next);
      }, PULSE_DURATION_MS);
    }, delayMs);
  }, []);

  useEffect(() => {
    if (hasOpened) return;
    schedulePulse(FIRST_PULSE_DELAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hasOpened, schedulePulse]);

  const handleOpen = useCallback(() => {
    setHasOpened(true);
    setIsPulsing(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    onOpen();
  }, [onOpen]);

  return (
    <button
      onClick={handleOpen}
      type="button"
      aria-label={`Open chat with ${agentName}`}
      className="weggy-outer-pill"
    >
      {/* Inner pill — collapses + fades during pulse */}
      <div className={`weggy-inner-pill${isPulsing ? ' is-pulsing' : ''}`}>
        <div className="weggy-bar-text">
          <div className="weggy-bar-name">{agentName}</div>
          <div className="weggy-bar-sub">Chat with us — usually replies instantly</div>
        </div>
        <div className="weggy-bar-cta-btn">Chat now</div>
      </div>

      {/* Avatar — always visible, on the RIGHT side */}
      <div className="weggy-bar-avatar">
        <img
          src={avatarPath}
          alt={agentName}
          width={44}
          height={44}
          style={{ objectFit: 'cover', width: 44, height: 44 }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    </button>
  );
}
