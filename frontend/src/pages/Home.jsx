import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Logo from '../components/common/Logo'
import MovieCard from '../components/events/MovieCard'
import EventCard from '../components/events/EventCard'
import EditEventModal from '../components/events/EditEventModal'
import { useAuth } from '../contexts/AuthContext'
import { events } from '../data/mockData'
import { eventService } from '../services/eventService'

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Home() {
  const location = useLocation()
  const { isOrganizer } = useAuth()
  const [activeSection, setActiveSection] = useState('cinema')
  const [movies, setMovies] = useState([])
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [moviesError, setMoviesError] = useState('')
  const [editingEvent, setEditingEvent] = useState(null)

  function handleNavigate(section) {
    setActiveSection(section)
    scrollToSection(section)
  }

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash === 'cinema' || hash === 'eventos') {
      setActiveSection(hash)
      scrollToSection(hash)
    }
  }, [location.hash])

  useEffect(() => {
    let active = true

    async function loadMovies() {
      try {
        const data = await eventService.listMovies()
        if (active) {
          setMovies(data)
        }
      } catch (error) {
        if (active) {
          setMoviesError(error.message || 'Não foi possível carregar os filmes.')
        }
      } finally {
        if (active) {
          setLoadingMovies(false)
        }
      }
    }

    loadMovies()

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
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

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
              onClick={() => handleNavigate('cinema')}
            >
              Ver em cartaz
            </button>
            <button
              type="button"
              className="hero__cta hero__cta--ghost"
              onClick={() => handleNavigate('eventos')}
            >
              Ver eventos
            </button>
          </div>
        </div>
      </section>

      <section id="cinema" className="listing">
        <div className="listing__header">
          <h2>Em cartaz</h2>
          <p>Filmes em cartaz cadastrados pelo organizador.</p>
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
          <p>Shows, teatro e cultura — programação ilustrativa.</p>
        </div>

        <div className="listing__grid listing__grid--events">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </section>

      {editingEvent ? (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={handleEventSaved}
        />
      ) : null}
    </div>
  )
}
