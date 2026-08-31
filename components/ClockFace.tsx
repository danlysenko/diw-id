type Props = {
  hour: number;
  minute: number;
  size?: number;
};

const CASE_COLOR = '#45454c';

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 100 + Math.cos(rad) * radius, y: 100 + Math.sin(rad) * radius };
}

function handTip(angleDeg: number, length: number) {
  return polar(angleDeg - 90, length);
}

/** A strap lug: a rounded stub radiating outward from the case at the given angle. */
function Lug({ angle }: { angle: number }) {
  const base = polar(angle, 96);
  const tip = polar(angle, 119);
  return (
    <line
      x1={base.x}
      y1={base.y}
      x2={tip.x}
      y2={tip.y}
      stroke={CASE_COLOR}
      strokeWidth={5}
      strokeLinecap="round"
    />
  );
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

  // Lugs sit just off the 12 and 6 o'clock markers — the arms a strap would attach to.
  const lugAngles = [-90 - 18, -90 + 18, 90 - 18, 90 + 18];

  // Crown at 3 o'clock, flanked by two chronograph-style pushers.
  const crownBase = polar(0, 96);
  const crownTip = polar(0, 112);
  const pusherTopBase = polar(-20, 96);
  const pusherTopTip = polar(-20, 106);
  const pusherBottomBase = polar(20, 96);
  const pusherBottomTip = polar(20, 106);

  return (
    <svg
      width={size}
      height={size}
      viewBox="-25 -25 250 250"
      role="img"
      aria-label={`Dial showing ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`}
    >
      {lugAngles.map((angle) => (
        <Lug key={angle} angle={angle} />
      ))}

      <line
        x1={pusherTopBase.x}
        y1={pusherTopBase.y}
        x2={pusherTopTip.x}
        y2={pusherTopTip.y}
        stroke={CASE_COLOR}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <line
        x1={pusherBottomBase.x}
        y1={pusherBottomBase.y}
        x2={pusherBottomTip.x}
        y2={pusherBottomTip.y}
        stroke={CASE_COLOR}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <line
        x1={crownBase.x}
        y1={crownBase.y}
        x2={crownTip.x}
        y2={crownTip.y}
        stroke={CASE_COLOR}
        strokeWidth={7}
        strokeLinecap="round"
      />

      <circle cx="100" cy="100" r="101" fill="none" stroke={CASE_COLOR} strokeWidth="1.5" />
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
      <circle cx="100" cy="100" r="5" fill="#a28f6f" />
    </svg>
  );
}
