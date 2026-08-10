import { SHOW_AREAS } from '../../data/showAreas'

const AREA_COLORS = Object.fromEntries(SHOW_AREAS.map((a) => [a.key, a.color]))

export default function ShowVenueMap({ activeKey }) {
  function opacity(key) {
    if (!activeKey) return 1
    return key === activeKey ? 1 : 0.25
  }

  return (
    <div className="venue-map">
      <svg
        viewBox="0 0 400 300"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Mapa do venue"
        className="venue-map__svg"
      >
        {/* --- Cadeira Superior (arco externo) --- */}
        <ellipse
          cx="200" cy="155" rx="188" ry="133"
          fill={AREA_COLORS.cadeiraSuperior}
          opacity={opacity('cadeiraSuperior')}
        />

        {/* --- Cadeira Inferior --- */}
        <ellipse
          cx="200" cy="155" rx="155" ry="105"
          fill={AREA_COLORS.cadeiraInferior}
          opacity={opacity('cadeiraInferior')}
        />

        {/* --- Lounge Premium (topo) --- */}
        <ellipse
          cx="200" cy="48" rx="72" ry="22"
          fill={AREA_COLORS.lounge}
          opacity={opacity('lounge')}
        />

        {/* --- Pista Premium --- */}
        <ellipse
          cx="200" cy="155" rx="118" ry="76"
          fill={AREA_COLORS.pistaPremium}
          opacity={opacity('pistaPremium')}
        />

        {/* --- Pista (campo central) --- */}
        <ellipse
          cx="200" cy="158" rx="82" ry="52"
          fill={AREA_COLORS.pista}
          opacity={opacity('pista')}
        />

        {/* Palco */}
        <rect x="168" y="96" width="64" height="28" rx="4" fill="#1e1e2e" opacity="0.85" />
        <text x="200" y="114" textAnchor="middle" fontSize="9" fill="#f4f7fb" fontWeight="600">PALCO</text>

        {/* --- VIP A (lado esquerdo) --- */}
        <rect x="8" y="128" width="34" height="52" rx="6"
          fill={AREA_COLORS.vipA}
          opacity={opacity('vipA')}
        />
        <text x="25" y="154" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700" transform="rotate(-90,25,154)">VIP A</text>

        {/* --- VIP B (lado direito) --- */}
        <rect x="358" y="128" width="34" height="52" rx="6"
          fill={AREA_COLORS.vipB}
          opacity={opacity('vipB')}
        />
        <text x="375" y="154" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700" transform="rotate(90,375,154)">VIP B</text>
      </svg>

      {/* Legenda */}
      <div className="venue-map__legend">
        {SHOW_AREAS.map((area) => (
          <span
            key={area.key}
            className={`venue-map__legend-item ${activeKey === area.key ? 'is-active' : ''}`}
          >
            <span className="venue-map__dot" style={{ background: area.color }} />
            {area.label}
          </span>
        ))}
      </div>
    </div>
  )
}
