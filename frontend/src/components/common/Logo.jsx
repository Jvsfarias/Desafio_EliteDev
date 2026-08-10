export default function Logo({ variant = 'nav' }) {
  const isHero = variant === 'hero'

  return (
    <span className={`logo logo--${variant}`}>
      <svg
        className="logo__mark"
        viewBox="0 0 64 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          className="logo__ticket"
          d="M4 7c0-2.2 1.8-4 4-4h36.4L60 16.2V37c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4V7Z"
        />
        <path className="logo__fold" d="M44.4 3 60 16.2H48.8c-2.2 0-4-1.8-4-4V3Z" />
        <circle className="logo__notch" cx="4" cy="13" r="2.4" />
        <circle className="logo__notch" cx="4" cy="22" r="1.8" />
        <circle className="logo__notch" cx="4" cy="31.5" r="2.4" />
        <rect className="logo__sprocket" x="11" y="9" width="2.4" height="3.4" rx="0.5" />
        <rect className="logo__sprocket" x="11" y="16.2" width="2.4" height="3.4" rx="0.5" />
        <rect className="logo__sprocket" x="11" y="23.4" width="2.4" height="3.4" rx="0.5" />
        <rect className="logo__sprocket" x="11" y="30.6" width="2.4" height="3.4" rx="0.5" />
        {/* E estilizado */}
        <path
          className="logo__glyph"
          d="M19 12.2h11.2v2.6H21.8v3.3h7.4v2.5h-7.4v3.5h8.6v2.6H19V12.2Z"
        />
        {/* D com corte diagonal */}
        <path
          className="logo__glyph"
          d="M33.2 12.2h6.2c4.1 0 6.8 2.5 6.8 6.7s-2.7 6.8-6.8 6.8h-6.2V12.2Zm2.8 2.6v8.3h3.2c2.4 0 3.9-1.4 3.9-4.2 0-2.7-1.5-4.1-3.9-4.1h-3.2Z"
        />
        <path
          className="logo__slash"
          d="M30.5 33.5 46 10"
          strokeWidth="2.2"
          strokeLinecap="square"
        />
      </svg>

      <span className="logo__wordmark">
        <span className="logo__name">
          Elite<span className="logo__dev">Dev</span>
        </span>
        <span className="logo__tag">{isHero ? 'eventos · cinema · shows' : 'Eventos'}</span>
      </span>
    </span>
  )
}
