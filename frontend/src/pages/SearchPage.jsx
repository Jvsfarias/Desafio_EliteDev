import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import MovieCard from '../components/events/MovieCard'
import EventCard from '../components/events/EventCard'
import { eventService } from '../services/eventService'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') || '').trim()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      if (query.length < 2) {
        setResults([])
        setError('')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const items = await eventService.search(query, { limit: 50 })
        if (active) setResults(items)
      } catch (err) {
        if (active) {
          setResults([])
          setError(err.message || 'Não foi possível buscar.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [query])

  const movies = results.filter((item) => item.type === 'filme')
  const shows = results.filter((item) => item.type === 'show')

  return (
    <div className="page">
      <Navbar />

      <main className="search-page container">
        <header className="search-page__header">
          <h1>Busca</h1>
          {query ? (
            <p>
              Resultados para <strong>“{query}”</strong>
            </p>
          ) : (
            <p>Digite ao menos 2 caracteres na busca da navbar.</p>
          )}
        </header>

        {loading ? (
          <div className="detail-loading">
            <div className="spinner" />
            <p>Buscando...</p>
          </div>
        ) : null}

        {error ? <p className="detail__error">{error}</p> : null}

        {!loading && !error && query.length >= 2 && results.length === 0 ? (
          <div className="search-page__empty">
            <p>Nenhum filme ou evento encontrado para “{query}”.</p>
            <Link to="/" className="btn btn--primary">
              Voltar ao início
            </Link>
          </div>
        ) : null}

        {!loading && movies.length > 0 ? (
          <section className="search-page__section" aria-label="Filmes">
            <h2>Filmes</h2>
            <div className="listing__grid listing__grid--movies">
              {movies.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} />
              ))}
            </div>
          </section>
        ) : null}

        {!loading && shows.length > 0 ? (
          <section className="search-page__section" aria-label="Eventos">
            <h2>Eventos</h2>
            <div className="listing__grid listing__grid--events">
              {shows.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}
