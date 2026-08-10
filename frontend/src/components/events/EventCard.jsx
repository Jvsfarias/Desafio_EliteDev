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
        <p className="event-card__date">{event.date}</p>
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__venue">
          {event.venue} · {event.city}
        </p>
      </div>
    </article>
  )
}
