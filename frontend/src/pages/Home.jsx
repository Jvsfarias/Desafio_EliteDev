import { useState } from 'react'
import Navbar from '../components/common/Navbar'
import Logo from '../components/common/Logo'
import MovieCard from '../components/events/MovieCard'
import EventCard from '../components/events/EventCard'
import { movies, events } from '../data/mockData'

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Home() {
  const [activeSection, setActiveSection] = useState('cinema')

  function handleNavigate(section) {
    setActiveSection(section)
    scrollToSection(section)
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
          <p>Filmes com horários e classificação — dados provisórios.</p>
        </div>

        <div className="listing__grid listing__grid--movies">
          {movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}
        </div>
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
    </div>
  )
}
