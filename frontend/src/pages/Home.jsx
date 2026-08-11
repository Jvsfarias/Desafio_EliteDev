import { useEffect, useState } from 'react'
import Navbar from '../components/common/Navbar'
import Logo from '../components/common/Logo'
import Footer from '../components/common/Footer'
import MovieCard from '../components/events/MovieCard'
import EventCard from '../components/events/EventCard'
import EditEventModal from '../components/events/EditEventModal'
import EditShowModal from '../components/events/EditShowModal'
import { useAuth } from '../contexts/AuthContext'
import { eventService } from '../services/eventService'

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Home() {
  const { isOrganizer } = useAuth()
  const [movies, setMovies] = useState([])
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [moviesError, setMoviesError] = useState('')
  const [shows, setShows] = useState([])
  const [loadingShows, setLoadingShows] = useState(true)
  const [showsError, setShowsError] = useState('')
  const [editingEvent, setEditingEvent] = useState(null)

  useEffect(() => {
    let active = true

    async function loadMovies() {
      try {
        const data = await eventService.listMovies()
        if (active) setMovies(data)
      } catch (error) {
        if (active) {
          setMoviesError(error.message || 'Não foi possível carregar os filmes.')
        }
      } finally {
        if (active) setLoadingMovies(false)
      }
    }

    async function loadShows() {
      try {
        const data = await eventService.listShows()
        if (active) setShows(data)
      } catch (error) {
        if (active) {
          setShowsError(error.message || 'Não foi possível carregar os shows.')
        }
      } finally {
        if (active) setLoadingShows(false)
      }
    }

    loadMovies()
    loadShows()

    return () => {
      active = false
    }
  }, [])

  function handleEventSaved(updated) {
    if (updated.type === 'show') {
      setShows((current) =>
        current.map((show) => (show.id === updated.id ? { ...show, ...updated } : show)),
      )
      return
    }

    setMovies((current) =>
      current.map((movie) => (movie.id === updated.id ? { ...movie, ...updated } : movie)),
    )
  }

  function handleEventDeleted(eventId) {
    setMovies((current) => current.filter((movie) => movie.id !== eventId))
    setShows((current) => current.filter((show) => show.id !== eventId))
    setEditingEvent(null)
  }

  return (
    <div className="home">
      <Navbar />

      <section className="hero" aria-label="Destaque">
        <div className="hero__bg" />
        <div className="hero__content">
          <p className="hero__brand">
            <Logo variant="hero" />
          </p>
          <h1 className="hero__title">Cinema e eventos no mesmo lugar</h1>
          <p className="hero__subtitle">
            Escolha o filme, o show ou a experiência e garanta seu ingresso.
          </p>
          <div className="hero__actions">
            <button
              type="button"
              className="hero__cta"
              onClick={() => scrollToSection('cinema')}
            >
              Ver em cartaz
            </button>
            <button
              type="button"
              className="hero__cta hero__cta--ghost"
              onClick={() => scrollToSection('eventos')}
            >
              Ver eventos
            </button>
          </div>
        </div>
      </section>

      <section id="cinema" className="listing">
        <div className="listing__header">
          <h2>Em cartaz</h2>
        </div>

        {loadingMovies ? (
          <p className="listing__status">Carregando filmes...</p>
        ) : null}

        {moviesError ? <p className="listing__status listing__status--error">{moviesError}</p> : null}

        {!loadingMovies && !moviesError && movies.length === 0 ? (
          <p className="listing__status">Nenhum filme em cartaz no momento.</p>
        ) : null}

        {!loadingMovies && movies.length > 0 ? (
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

      <section id="eventos" className="listing listing--events">
        <div className="listing__header">
          <h2>Eventos em destaque</h2>
        </div>

        {loadingShows ? (
          <p className="listing__status">Carregando shows...</p>
        ) : null}

        {showsError ? <p className="listing__status listing__status--error">{showsError}</p> : null}

        {!loadingShows && !showsError && shows.length === 0 ? (
          <p className="listing__status">Nenhum show cadastrado no momento.</p>
        ) : null}

        {!loadingShows && shows.length > 0 ? (
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

      {editingEvent?.type === 'filme' ? (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={handleEventSaved}
          onDeleted={handleEventDeleted}
        />
      ) : null}

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
