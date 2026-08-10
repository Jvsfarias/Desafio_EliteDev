function formatShowDate(dateStr, timeStr) {
  if (!dateStr) return ''

  const [year, month, day] = dateStr.split('-')
  const date = new Date(+year, +month - 1, +day)
  const formatted = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })

  if (!timeStr) return formatted
  return `${formatted} · ${timeStr.slice(0, 5)}`
}

export default function EventCard({ event, index, canEdit = false, onEdit }) {
  function handleEditClick(e) {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(event)
  }

  return (
    <div className="event-card-wrap" style={{ animationDelay: `${index * 60}ms` }}>
      {canEdit ? (
        <button
          type="button"
          className="movie-card__edit"
          onClick={handleEditClick}
          aria-label={`Editar ${event.title}`}
          title="Editar evento"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            />
          </svg>
        </button>
      ) : null}

      <article className="event-card">
        <div className="event-card__media">
          <img src={event.image} alt={event.title} loading="lazy" />
        </div>

        <div className="event-card__body">
          <p className="event-card__date">
            {formatShowDate(event.showDate, event.showTime)}
          </p>
          <h3 className="event-card__title">{event.title}</h3>
          <p className="event-card__venue">{event.venue}</p>
        </div>
      </article>
    </div>
  )
}
