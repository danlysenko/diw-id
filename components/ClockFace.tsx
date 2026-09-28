'use client';

import { useEffect, useState } from 'react';

type Props = {
  hour: number;
  minute: number;
  size?: number;
  /** Lets a page size the dial responsively with CSS; `size` stays the fallback. */
  className?: string;
  /** The animated seconds hand; off where the dial is just a static record (admin). */
  showSeconds?: boolean;
};

const INK = '#1a1a1a';

/**
 * Point on the dial at `angleDeg` (0 = 12 o'clock, clockwise) and `radius` from the centre.
 * Rounded because Node and browsers disagree on the last digits of Math.cos/sin, which would
 * otherwise make the server-rendered SVG fail hydration.
 */
function polar(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const round = (n: number) => Math.round(n * 100) / 100;
  return { x: round(100 + Math.cos(rad) * radius), y: round(100 + Math.sin(rad) * radius) };
}

export default function ClockFace({ hour, minute, size = 240, className, showSeconds = true }: Props) {
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;

  // The seconds hand is decorative (only hour and minute are checked). It starts at 0 on the
  // server render, then picks up the real seconds on mount via a negative animation delay.
  const [secondsOffset, setSecondsOffset] = useState(0);
  useEffect(() => {
    const now = new Date();
    setSecondsOffset(now.getSeconds() + now.getMilliseconds() / 1000);
  }, []);

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const major = i % 5 === 0;
    const outer = polar(i * 6, 93);
    const inner = polar(i * 6, major ? 84 : 88.5);
    return { key: i, major, outer, inner };
  });

  const numerals = Array.from({ length: 12 }, (_, i) => {
    const value = i + 1;
    return { value, ...polar(value * 30, 71) };
  });

  const hourTip = polar(hourAngle, 44);
  const hourTail = polar(hourAngle + 180, 10);
  const minuteTip = polar(minuteAngle, 68);
  const minuteTail = polar(minuteAngle + 180, 12);

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Dial showing ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`}
    >
      <circle cx="100" cy="100" r="98" fill="#ffffff" stroke="#dcdcdc" strokeWidth="1.5" />

      {ticks.map((t) => (
        <line
          key={t.key}
          x1={t.inner.x}
          y1={t.inner.y}
          x2={t.outer.x}
          y2={t.outer.y}
          stroke={INK}
          strokeWidth={t.major ? 3 : 1.2}
        />
      ))}

      {numerals.map((n) => (
        <text
          key={n.value}
          x={n.x}
          y={n.y}
          fill={INK}
          fontSize="19"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {n.value}
        </text>
      ))}

      <line
        x1={hourTail.x}
        y1={hourTail.y}
        x2={hourTip.x}
        y2={hourTip.y}
        stroke={INK}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1={minuteTail.x}
        y1={minuteTail.y}
        x2={minuteTip.x}
        y2={minuteTip.y}
        stroke={INK}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {showSeconds && (
        <g className="clock-seconds" style={{ animationDelay: `-${secondsOffset}s` }}>
          <line x1="100" y1="118" x2="100" y2="16" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}

      <circle cx="100" cy="100" r="5.5" fill={INK} />
      <circle cx="100" cy="100" r="2.2" fill="#ffffff" />
    </svg>
  );
}
