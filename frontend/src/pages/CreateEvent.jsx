import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import SeatMapPreview from '../components/events/SeatMapPreview'
import { useAuth } from '../contexts/AuthContext'
import { AGE_RATINGS, DEFAULT_AGE_RATING } from '../data/ageRatings'
import { CINEMA_SEAT_MAP } from '../data/seatMap'
import { catalogService } from '../services/catalogService'
import { eventService } from '../services/eventService'

function createEmptySession() {
  return { date: '', times: [''] }
}

export default function CreateEvent() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [mode, setMode] = useState('cinema')
  const [catalog, setCatalog] = useState([])
  const [shows, setShows] = useState([])
  const [catalogItemId, setCatalogItemId] = useState('')
  const [showItemId, setShowItemId] = useState('')
  const [rating, setRating] = useState(DEFAULT_AGE_RATING)
  const [venue, setVenue] = useState('')
  const [price, setPrice] = useState('')
  const [sessions, setSessions] = useState([createEmptySession()])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [loadingShows, setLoadingShows] = useState(false)

  const movies = catalog.filter((item) => item.type === 'filme')

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      if (!token) {
        if (active) {
          setLoadingCatalog(false)
          setError('Faça login como organizador para carregar o catálogo.')
        }
        return
      }

      try {
        const items = await catalogService.listMovies(token)
        if (active) {
          setCatalog(items)
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar o catálogo.')
        }
      } finally {
        if (active) {
          setLoadingCatalog(false)
        }
      }
    }

    loadCatalog()

    return () => {
      active = false
    }
  }, [token])

  useEffect(() => {
    let active = true

    async function loadShows() {
      if (mode !== 'show' || !token || shows.length > 0) return

      setLoadingShows(true)
      setError('')

      try {
        const items = await catalogService.listShows(token)
        if (active) {
          setShows(items)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Não foi possível carregar os shows.')
        }
      } finally {
        if (active) {
          setLoadingShows(false)
        }
      }
    }

    loadShows()

    return () => {
      active = false
    }
  }, [mode, token, shows.length])

  function updateSession(index, patch) {
    setSessions((current) =>
      current.map((session, i) => (i === index ? { ...session, ...patch } : session)),
    )
  }

  function addSession() {
    setSessions((current) => [...current, createEmptySession()])
  }

  function removeSession(index) {
    setSessions((current) =>
      current.length === 1 ? current : current.filter((_, i) => i !== index),
    )
  }

  function updateTime(sessionIndex, timeIndex, value) {
    setSessions((current) =>
      current.map((session, i) => {
        if (i !== sessionIndex) return session
        const times = session.times.map((time, j) => (j === timeIndex ? value : time))
        return { ...session, times }
      }),
    )
  }

  function addTime(sessionIndex) {
    setSessions((current) =>
      current.map((session, i) =>
        i === sessionIndex ? { ...session, times: [...session.times, ''] } : session,
      ),
    )
  }

  function removeTime(sessionIndex, timeIndex) {
    setSessions((current) =>
      current.map((session, i) => {
        if (i !== sessionIndex) return session
        if (session.times.length === 1) return session
        return {
          ...session,
          times: session.times.filter((_, j) => j !== timeIndex),
        }
      }),
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (mode !== 'cinema') {
      setError('Cadastro de shows ainda não está disponível.')
      return
    }

    const selected = movies.find((item) => item.id === catalogItemId)

    if (!selected) {
      setError('Selecione um filme do catálogo.')
      return
    }

    if (!venue || price === '') {
      setError('Preencha local e preço.')
      return
    }

    const normalizedSessions = sessions
      .map((session) => ({
        date: session.date,
        times: session.times.map((time) => time.trim()).filter(Boolean),
      }))
      .filter((session) => session.date && session.times.length > 0)

    if (normalizedSessions.length === 0) {
      setError('Adicione ao menos uma sessão com data e horário.')
      return
    }

    setLoading(true)

    try {
      await eventService.create(
        {
          catalogItemId: selected.id,
          title: selected.title,
          type: 'filme',
          image: selected.image,
          rating,
          originalTitle: selected.originalTitle,
          overview: selected.overview,
          backdrop: selected.backdrop,
          releaseDate: selected.releaseDate,
          voteAverage: selected.voteAverage,
          voteCount: selected.voteCount,
          popularity: selected.popularity,
          originalLanguage: selected.originalLanguage,
          genreIds: selected.genreIds,
          genres: selected.genres,
          adult: selected.adult,
          venue,
          price: Number(price),
          seatMap: CINEMA_SEAT_MAP,
          sessions: normalizedSessions,
        },
        token,
      )

      setSuccess('Sessões de cinema criadas com sucesso.')
      setCatalogItemId('')
      setRating(DEFAULT_AGE_RATING)
      setVenue('')
      setPrice('')
      setSessions([createEmptySession()])

      setTimeout(() => navigate('/'), 900)
    } catch (err) {
      setError(err.message || 'Não foi possível criar o evento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-event">
      <Navbar />

      <main className="create-event__main">
        <header className="create-event__header">
          <h1>Criar evento</h1>
          <p>Monte a programação de cinema com várias datas, horários e mapa de assentos.</p>
        </header>

        <div className="create-event__toggle" role="tablist" aria-label="Tipo de evento">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'cinema'}
            className={`create-event__toggle-btn ${mode === 'cinema' ? 'is-active' : ''}`}
            onClick={() => setMode('cinema')}
          >
            Cinema
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'show'}
            className={`create-event__toggle-btn ${mode === 'show' ? 'is-active' : ''}`}
            onClick={() => setMode('show')}
          >
            Show
          </button>
        </div>

        {mode === 'show' ? (
          <div className="auth-form create-event__form">
            {error ? <p className="auth-form__error">{error}</p> : null}

            <label className="auth-form__field">
              <span>Show</span>
              <select
                value={showItemId}
                onChange={(e) => setShowItemId(e.target.value)}
                disabled={loadingShows}
              >
                <option value="">
                  {loadingShows ? 'Carregando...' : 'Selecione um show'}
                </option>
                {shows.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>

            <p className="create-event__hint">
              Por enquanto só o select do catálogo Ticketmaster está ativo. O cadastro
              completo vem no próximo passo.
            </p>
          </div>
        ) : (
          <form className="auth-form create-event__form" onSubmit={handleSubmit}>
            {error ? <p className="auth-form__error">{error}</p> : null}
            {success ? <p className="create-event__success">{success}</p> : null}

            <label className="auth-form__field">
              <span>Filme</span>
              <select
                value={catalogItemId}
                onChange={(e) => setCatalogItemId(e.target.value)}
                required
                disabled={loadingCatalog}
              >
                <option value="">
                  {loadingCatalog ? 'Carregando...' : 'Selecione um filme'}
                </option>
                {movies.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="auth-form__field">
              <span>Classificação indicativa</span>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              >
                {AGE_RATINGS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="auth-form__field">
              <span>Local / sala</span>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Ex.: Sala 3 — Cinemark"
                required
              />
            </label>

            <label className="auth-form__field">
              <span>Preço do ingresso (R$)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </label>

            <section className="create-event__sessions" aria-label="Sessões">
              <div className="create-event__section-head">
                <h2>Sessões</h2>
                <button type="button" className="create-event__ghost-btn" onClick={addSession}>
                  Adicionar dia
                </button>
              </div>

              {sessions.map((session, sessionIndex) => (
                <div key={sessionIndex} className="create-event__session">
                  <div className="create-event__session-head">
                    <label className="auth-form__field">
                      <span>Data</span>
                      <input
                        type="date"
                        value={session.date}
                        onChange={(e) => updateSession(sessionIndex, { date: e.target.value })}
                        required
                      />
                    </label>
                    <button
                      type="button"
                      className="create-event__ghost-btn"
                      onClick={() => removeSession(sessionIndex)}
                      disabled={sessions.length === 1}
                    >
                      Remover dia
                    </button>
                  </div>

                  <div className="create-event__times">
                    {session.times.map((time, timeIndex) => (
                      <div key={timeIndex} className="create-event__time-row">
                        <label className="auth-form__field">
                          <span>Horário {timeIndex + 1}</span>
                          <input
                            type="time"
                            value={time}
                            onChange={(e) =>
                              updateTime(sessionIndex, timeIndex, e.target.value)
                            }
                            required
                          />
                        </label>
                        <button
                          type="button"
                          className="create-event__ghost-btn"
                          onClick={() => removeTime(sessionIndex, timeIndex)}
                          disabled={session.times.length === 1}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="create-event__ghost-btn"
                      onClick={() => addTime(sessionIndex)}
                    >
                      Adicionar horário
                    </button>
                  </div>
                </div>
              ))}
            </section>

            <section className="create-event__map" aria-label="Mapa de assentos">
              <div className="create-event__section-head">
                <h2>Mapa de assentos</h2>
              </div>
              <SeatMapPreview />
            </section>

            <button type="submit" className="auth-form__submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Criar programação'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
