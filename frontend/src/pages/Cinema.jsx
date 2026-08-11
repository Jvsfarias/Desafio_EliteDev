import { useEffect, useState } from 'react'
import Navbar from '../components/common/Navbar'
import MovieCard from '../components/events/MovieCard'
import EditEventModal from '../components/events/EditEventModal'
import { useAuth } from '../contexts/AuthContext'
import { eventService } from '../services/eventService'

export default function Cinema() {
  const { isOrganizer } = useAuth()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingEvent, setEditingEvent] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await eventService.listMovies()
        if (active) setMovies(data)
      } catch (err) {
        if (active) setError(err.message || 'Não foi possível carregar os filmes.')
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
    setMovies((current) =>
      current.map((movie) => (movie.id === updated.id ? { ...movie, ...updated } : movie)),
    )
  }

  return (
    <div className="home">
      <Navbar />

      <section className="listing listing--page">
        <div className="listing__header">
          <h2>Em cartaz</h2>
          <p>Filmes em cartaz cadastrados pelo organizador.</p>
        </div>

        {loading ? <p className="listing__status">Carregando filmes...</p> : null}
        {error ? <p className="listing__status listing__status--error">{error}</p> : null}

        {!loading && !error && movies.length === 0 ? (
          <p className="listing__status">Nenhum filme em cartaz no momento.</p>
        ) : null}

        {!loading && movies.length > 0 ? (
          <div className="listing__grid listing__grid--movies">
            {movies.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                index={index}
                canEdit={isOrganizer}
                onEdit={setEditingEvent}
              />
            ))}
          </div>
        ) : null}
      </section>

      {editingEvent?.type === 'filme' ? (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={handleEventSaved}
        />
      ) : null}
    </div>
  )
}
