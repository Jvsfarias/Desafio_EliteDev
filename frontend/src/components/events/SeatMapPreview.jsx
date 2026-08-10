import { CINEMA_SEAT_MAP, ROW_LABELS } from '../../data/seatMap'

export default function SeatMapPreview({
  rows = CINEMA_SEAT_MAP.rows,
  cols = CINEMA_SEAT_MAP.cols,
}) {
  const rowLabels = ROW_LABELS.slice(0, rows).split('')

  return (
    <div className="seat-map">
      <p className="seat-map__screen">Tela</p>

      <div
        className="seat-map__grid"
        style={{ '--seat-cols': cols }}
        role="img"
        aria-label={`Mapa de assentos com ${rows} fileiras e ${cols} assentos`}
      >
        {rowLabels.map((row) => (
          <div key={row} className="seat-map__row">
            <span className="seat-map__row-label">{row}</span>
            {Array.from({ length: cols }, (_, index) => (
              <span
                key={`${row}-${index + 1}`}
                className="seat-map__seat"
                title={`${row}${index + 1}`}
              />
            ))}
          </div>
        ))}
      </div>

      <p className="seat-map__hint">
        Grade fixa de {rows} × {cols} ({rows * cols} assentos)
      </p>
    </div>
  )
}
