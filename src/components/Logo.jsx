import { useId } from "react";

// Golden Hour logo: glowing disc behind the letters "GH" and a blinking dot.
// size: "sm" | "md" | "lg"   tagline: show the "GOLDEN HOUR" line under the letters
export default function Logo({ size = "md", tagline = true }) {
  const id = useId().replace(/:/g, "");
  const height = tagline ? 150 : 124;

  return (
    <span className={`logo logo-${size}`} role="img" aria-label="Golden Hour">
      <svg viewBox={`0 0 250 ${height}`} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}d`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7C3AED" />
            <stop offset=".55" stopColor="#C026D3" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
          <radialGradient id={`${id}f`} cx=".3" cy=".3" r=".6">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
            <stop offset=".35" stopColor="#FBCFE8" stopOpacity=".5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}b`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        {/* glow + disc (the "shield" behind the letters) */}
        <circle cx="82" cy="62" r="58" fill={`url(#${id}d)`} filter={`url(#${id}b)`} opacity=".75" />
        <circle cx="82" cy="62" r="56" fill={`url(#${id}d)`} />
        <circle cx="82" cy="62" r="56" fill={`url(#${id}f)`} />
        {/* G */}
        <path d="M121.2 40.8 A30 30 0 1 0 121.2 83.2 V62 H98" fill="none" stroke="#ffffff" strokeWidth="15" />
        {/* H */}
        <g fill="#F5F0FF">
          <rect x="148" y="28" width="15" height="68" />
          <rect x="198" y="28" width="15" height="68" />
          <rect x="148" y="54" width="65" height="15" />
        </g>
        {/* blinking dot */}
        <circle className="logo-dot" cx="236" cy="89" r="9" fill="#F472B6" />
        {tagline && (
          <text x="132" y="136" textLength="118" lengthAdjust="spacingAndGlyphs" fontSize="15" fontWeight="800" fill="#F5F0FF" fontFamily="Unbounded, Outfit, sans-serif">
            GOLDEN HOUR
          </text>
        )}
      </svg>
    </span>
  );
}
