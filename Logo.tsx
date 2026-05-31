import Link from 'next/link'

interface LogoProps {
  /** Use light text color for dark backgrounds */
  light?: boolean
  /** Height in px — everything scales from this */
  height?: number
}

export function Logo({ light = false, height = 40 }: LogoProps) {
  const iconColor = '#C4793A'
  const textColor = light ? '#F5EFE0' : '#2A2418'
  const iconH     = Math.round(height * 0.95)
  const textSize  = Math.round(height * 0.44)
  const gap       = Math.round(height * 0.28)

  return (
    <Link
      href="/"
      style={{ display: 'flex', alignItems: 'center', gap, textDecoration: 'none' }}
    >
      {/* ── HL Monogram ── */}
      <svg
        viewBox="0 0 42 38"
        fill="none"
        style={{ height: iconH, width: 'auto', flexShrink: 0 }}
        aria-hidden="true"
      >
        {/* H — left vertical */}
        <path d="M4,3 C3.5,12 4.5,20 4,36" stroke={iconColor} strokeWidth="3.5" strokeLinecap="round"/>
        {/* H — right vertical */}
        <path d="M17,3 C16.5,12 17.5,20 17,36" stroke={iconColor} strokeWidth="3.5" strokeLinecap="round"/>
        {/* H — crossbar arc */}
        <path d="M4,20 C8,17 13,17 17,20" stroke={iconColor} strokeWidth="3" strokeLinecap="round"/>
        {/* L — vertical */}
        <path d="M23,3 C22.5,14 23,25 23,35" stroke={iconColor} strokeWidth="3.5" strokeLinecap="round"/>
        {/* L — foot */}
        <path d="M23,35 C27,34.5 31,35 34,35" stroke={iconColor} strokeWidth="3.5" strokeLinecap="round"/>
        {/* Accent sweep across top */}
        <path d="M2,5 C12,2 26,5 36,3" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.45"/>
      </svg>

      {/* ── Wordmark ── */}
      <span style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: textSize,
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: textColor,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}>
        HASSANLY
      </span>
    </Link>
  )
}
