type Props = {
  size?: number;
  className?: string;
};

/** The DiW mark: a thin circle outline with "DiW" set in Arial, both in currentColor
 * so a parent's text color (and hover transition) drives the whole mark at once. */
export default function Logo({ size = 64, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label="DiW">
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text
        x="50"
        y="53"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="30"
        fontWeight="400"
      >
        DiW
      </text>
    </svg>
  );
}
