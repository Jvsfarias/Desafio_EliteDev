import { ROW_LABELS } from '../../data/seatMap'

const STATUS = {
  available: 'available',
  taken: 'taken',
  selected: 'selected',
}

function seatId(row, col) {
  return `${ROW_LABELS[row]}${col + 1}`
}

export default function SeatSelector({
  rows,
  cols,
  taken = [],
  selected = [],
  onToggle,
  readOnly = false,
}) {
  function getStatus(row, col) {
    const id = seatId(row, col)
    if (taken.includes(id)) return STATUS.taken
    if (selected.includes(id)) return STATUS.selected
    return STATUS.available
  }

  return (
    <div className={`seat-selector ${readOnly ? 'seat-selector--readonly' : ''}`}>
      <div className="seat-selector__screen">TELA</div>

      <div className="seat-selector__grid">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="seat-selector__row">
            <span className="seat-selector__row-label">{ROW_LABELS[row]}</span>

            {Array.from({ length: cols }, (_, col) => {
              const id = seatId(row, col)
              const status = getStatus(row, col)
              const isTaken = status === STATUS.taken

              return (
                <button
                  key={id}
                  type="button"
                  disabled={readOnly || isTaken}
                  onClick={() => !readOnly && onToggle?.(id)}
                  className={`seat-selector__seat seat-selector__seat--${status}`}
                  aria-label={`Assento ${id} - ${status}`}
                  title={id}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="seat-selector__legend">
        <span className="seat-selector__legend-item">
          <span className="seat-selector__dot seat-selector__dot--available" />
          Disponível
        </span>
        {!readOnly ? (
          <span className="seat-selector__legend-item">
            <span className="seat-selector__dot seat-selector__dot--selected" />
            Selecionado
          </span>
        ) : null}
        <span className="seat-selector__legend-item">
          <span className="seat-selector__dot seat-selector__dot--taken" />
          Ocupado
        </span>
      </div>
    </div>
  )
}
