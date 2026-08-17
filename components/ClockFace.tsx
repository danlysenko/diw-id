type Props = {
  hour: number;
  minute: number;
  size?: number;
};

function handTip(angleDeg: number, length: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: 100 + Math.cos(rad) * length, y: 100 + Math.sin(rad) * length };
}

export default function ClockFace({ hour, minute, size = 240 }: Props) {
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;
  const hourTip = handTip(hourAngle, 48);
  const minuteTip = handTip(minuteAngle, 72);

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

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Dial showing ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`}
    >
      <circle cx="100" cy="100" r="97" fill="#0f0f11" stroke="#26262a" strokeWidth="2" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#1b1b1f" strokeWidth="1" />

      {markers.map((m) => (
        <line
          key={m.key}
          x1={m.x1}
          y1={m.y1}
          x2={m.x2}
          y2={m.y2}
          stroke={m.major ? '#c8a25a' : '#3a3a40'}
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
          fontFamily="Georgia, serif"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {n.value}
        </text>
      ))}

      <line
        x1="100"
        y1="100"
        x2={hourTip.x}
        y2={hourTip.y}
        stroke="#f2f2f4"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="100"
        x2={minuteTip.x}
        y2={minuteTip.y}
        stroke="#f2f2f4"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="100" r="5" fill="#c8a25a" />
    </svg>
  );
}
