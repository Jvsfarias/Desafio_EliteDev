import { useEffect, useState } from 'react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import EventCard from '../components/events/EventCard'
import EditShowModal from '../components/events/EditShowModal'
import { useAuth } from '../contexts/AuthContext'
import { eventService } from '../services/eventService'

export default function Eventos() {
  const { isOrganizer } = useAuth()
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingEvent, setEditingEvent] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await eventService.listShows()
        if (active) setShows(data)
      } catch (err) {
        if (active) setError(err.message || 'Não foi possível carregar os shows.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  function handleEventSaved(updated) {
    setShows((current) =>
      current.map((show) => (show.id === updated.id ? { ...show, ...updated } : show)),
    )
  }

  function handleEventDeleted(eventId) {
    setShows((current) => current.filter((show) => show.id !== eventId))
    setEditingEvent(null)
  }

  return (
    <div className="home">
      <Navbar />

      <section className="listing listing--page listing--events">
        <div className="listing__header">
          <h2>Eventos em destaque</h2>
        </div>

        {loading ? <p className="listing__status">Carregando shows...</p> : null}
        {error ? <p className="listing__status listing__status--error">{error}</p> : null}

        {!loading && !error && shows.length === 0 ? (
          <p className="listing__status">Nenhum show cadastrado no momento.</p>
        ) : null}

        {!loading && shows.length > 0 ? (
          <div className="listing__grid listing__grid--events">
            {shows.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                canEdit={isOrganizer}
                onEdit={setEditingEvent}
              />
            ))}
          </div>
        ) : null}
      </section>

      {editingEvent?.type === 'show' ? (
        <EditShowModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={handleEventSaved}
          onDeleted={handleEventDeleted}
        />
      ) : null}

      <Footer />
    </div>
  )
}
