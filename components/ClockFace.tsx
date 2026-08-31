'use client';

import { useId } from 'react';

type Props = {
  hour: number;
  minute: number;
  size?: number;
};

const METAL = '#4a4a52';
const METAL_DARK = '#232328';
const METAL_EDGE = '#1c1c20';

/** A dauphine-style hand: pointed at the tip, a small pointed counter-tail behind the pivot. */
function handPath(angleDeg: number, length: number, tail: number, width: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const px = -dy;
  const py = dx;
  const half = width / 2;
  const baseL = { x: 100 + px * half, y: 100 + py * half };
  const baseR = { x: 100 - px * half, y: 100 - py * half };
  const front = { x: 100 + dx * length, y: 100 + dy * length };
  const back = { x: 100 - dx * tail, y: 100 - dy * tail };
  return `M ${back.x} ${back.y} L ${baseL.x} ${baseL.y} L ${front.x} ${front.y} L ${baseR.x} ${baseR.y} Z`;
}

export default function ClockFace({ hour, minute, size = 240 }: Props) {
  const uid = useId();
  const bezelGradientId = `bezel-${uid}`;
  const crownGradientId = `crown-${uid}`;

  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;

  const markers = Array.from({ length: 60 }, (_, i) => {
    const angle = ((i * 6 - 90) * Math.PI) / 180;
    const major = i % 5 === 0;
    const outer = 92;
    const inner = major ? 80 : 87;
    return {
      key: i,
      x1: 100 + Math.cos(angle) * inner,
      y1: 100 + Math.sin(angle) * inner,
      x2: 100 + Math.cos(angle) * outer,
      y2: 100 + Math.sin(angle) * outer,
      major,
    };
  });

  const numerals = Array.from({ length: 12 }, (_, i) => {
    const value = i + 1;
    const angle = ((value * 30 - 90) * Math.PI) / 180;
    return {
      value,
      x: 100 + Math.cos(angle) * 66,
      y: 100 + Math.sin(angle) * 66,
    };
  });

  // Modern screw-down-style crown at 3 o'clock, drawn in side profile the way it
  // actually reads in a frontal watch photo: a short neck, then a knurled drum
  // sticking out sideways, seen from the side rather than face-on.
  const crownNeckX = 100 + 103;
  const crownDrumX = 100 + 111;
  const crownDrumWidth = 20;
  const crownDrumHeight = 17;
  const fluteCount = 6;
  const fluteXs = Array.from({ length: fluteCount }, (_, i) =>
    crownDrumX + 3 + i * ((crownDrumWidth - 6) / (fluteCount - 1))
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="-9 -20 242 242"
      role="img"
      aria-label={`Dial showing ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`}
    >
      <defs>
        <radialGradient id={bezelGradientId} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#75757e" />
          <stop offset="45%" stopColor="#45454c" />
          <stop offset="100%" stopColor="#1c1c20" />
        </radialGradient>
        <linearGradient id={crownGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7d7d87" />
          <stop offset="50%" stopColor="#48484f" />
          <stop offset="100%" stopColor="#1f1f23" />
        </linearGradient>
      </defs>

      <rect x={crownNeckX} y={100 - 3} width={crownDrumX - crownNeckX} height={6} fill={METAL} />
      <rect
        x={crownDrumX}
        y={100 - crownDrumHeight / 2}
        width={crownDrumWidth}
        height={crownDrumHeight}
        rx={crownDrumHeight / 2}
        fill={`url(#${crownGradientId})`}
        stroke={METAL_EDGE}
        strokeWidth={1}
      />
      {fluteXs.map((x, i) => (
        <line
          key={i}
          x1={x}
          y1={100 - crownDrumHeight / 2 + 3}
          x2={x}
          y2={100 + crownDrumHeight / 2 - 3}
          stroke={METAL_DARK}
          strokeWidth={1}
        />
      ))}

      <circle cx="100" cy="100" r="103" fill={`url(#${bezelGradientId})`} stroke={METAL_EDGE} strokeWidth="1" />
      <circle cx="100" cy="100" r="97" fill="#0f0f11" stroke="#26262a" strokeWidth="2" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#1b1b1f" strokeWidth="1" />

      {markers.map((m) => (
        <line
          key={m.key}
          x1={m.x1}
          y1={m.y1}
          x2={m.x2}
          y2={m.y2}
          stroke={m.major ? '#a28f6f' : '#3a3a40'}
          strokeWidth={m.major ? 2.2 : 1}
          strokeLinecap="round"
        />
      ))}

      {numerals.map((n) => (
        <text
          key={n.value}
          x={n.x}
          y={n.y}
          fill="#8b8b93"
          fontSize="11"
          fontFamily="-apple-system, Helvetica Neue, Arial, sans-serif"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {n.value}
        </text>
      ))}

      <path d={handPath(hourAngle, 46, 10, 7.5)} fill="#f2f2f4" stroke="#1b1b1f" strokeWidth="0.75" strokeLinejoin="round" />
      <path d={handPath(minuteAngle, 72, 14, 5.5)} fill="#f2f2f4" stroke="#1b1b1f" strokeWidth="0.75" strokeLinejoin="round" />

      <circle cx="100" cy="100" r="6.5" fill="#1b1b1f" />
      <circle cx="100" cy="100" r="3.5" fill="#a28f6f" />
    </svg>
  );
}
