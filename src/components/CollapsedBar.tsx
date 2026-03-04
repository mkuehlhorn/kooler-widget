import { useState, useEffect, useRef, useCallback } from 'react';

interface CollapsedBarProps {
  agentName: string;
  greeting: string;
  avatarPath: string;
  primaryColor: string;
  onOpen: () => void;
}

const MIN_PULSE_DELAY_MS = 8000;
const MAX_PULSE_DELAY_MS = 15000;
const PULSE_DURATION_MS = 2200;
const FIRST_PULSE_DELAY_MS = 5000;

export function CollapsedBar({
  agentName,
  greeting,
  avatarPath,
  primaryColor,
  onOpen,
}: CollapsedBarProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedulePulse = useCallback((delayMs: number) => {
    timerRef.current = setTimeout(() => {
      setIsPulsing(true);
      timerRef.current = setTimeout(() => {
        setIsPulsing(false);
        // Schedule next pulse
        const nextDelay =
          MIN_PULSE_DELAY_MS +
          Math.random() * (MAX_PULSE_DELAY_MS - MIN_PULSE_DELAY_MS);
        schedulePulse(nextDelay);
      }, PULSE_DURATION_MS);
    }, delayMs);
  }, []);

  useEffect(() => {
    if (hasOpened) return;
    schedulePulse(FIRST_PULSE_DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hasOpened, schedulePulse]);

  const handleOpen = useCallback(() => {
    setHasOpened(true);
    setIsPulsing(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    onOpen();
  }, [onOpen]);

  // Truncate greeting to fit pill
  const shortGreeting =
    greeting.length > 58 ? greeting.slice(0, 55) + '…' : greeting;

  return (
    <button
      onClick={handleOpen}
      type="button"
      aria-label={`Open chat with ${agentName}`}
      className={`weggy-collapsed-bar flex items-center gap-0 cursor-pointer border-0 p-0 text-left${
        isPulsing ? ' is-pulsing' : ''
      }`}
      style={{
        background: primaryColor,
        borderRadius: 9999,
        boxShadow: '0 4px 24px rgba(0,0,0,0.18), 0 1px 6px rgba(0,0,0,0.1)',
        outline: 'none',
        padding: '6px 6px',
      }}
    >
      {/* Avatar circle — always visible */}
      <div
        className="shrink-0 rounded-full overflow-hidden bg-white/20 flex items-center justify-center"
        style={{ width: 44, height: 44 }}
      >
        <img
          src={avatarPath}
          alt={agentName}
          width={44}
          height={44}
          style={{ objectFit: 'cover', width: 44, height: 44 }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
            const fallback = (e.currentTarget as HTMLImageElement)
              .nextSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className="hidden items-center justify-center w-full h-full text-white font-bold"
          aria-hidden="true"
        >
          {agentName.charAt(0)}
        </div>
      </div>

      {/* Text content — collapses on pulse */}
      <div className="bar-inner flex flex-col justify-center px-3">
        <div
          className="text-white font-semibold text-xs leading-tight"
          style={{ whiteSpace: 'nowrap' }}
        >
          {agentName} · {shortGreeting.split('.')[0].split('?')[0]}
        </div>
        <div
          className="text-white/75 text-xs leading-tight mt-0.5"
          style={{ whiteSpace: 'nowrap' }}
        >
          Chat with us — usually replies instantly
        </div>
      </div>

      {/* CTA button */}
      <div
        className="bar-inner flex items-center mr-1"
        style={{ paddingRight: 4 }}
      >
        <div
          className="rounded-full px-4 py-1.5 text-xs font-semibold"
          style={{
            background: 'rgba(255,255,255,0.18)',
            color: 'white',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          Chat now
        </div>
      </div>
    </button>
  );
}
