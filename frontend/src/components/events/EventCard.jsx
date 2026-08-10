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

export default function EventCard({ event, index }) {
  return (
    <article
      className="event-card"
      style={{ animationDelay: `${index * 60}ms` }}
    >
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
  )
}
