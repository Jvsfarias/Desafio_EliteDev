import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { eventService } from '../../services/eventService'

const DEBOUNCE_MS = 300
const SUGGESTION_LIMIT = 6

function eventPath(event) {
  return event.type === 'filme' ? `/filmes/${event.id}` : `/eventos/${event.id}`
}

function typeLabel(type) {
  return type === 'filme' ? 'Filme' : 'Show'
}

export default function NavbarSearch() {
  const navigate = useNavigate()
  const listId = useId()
  const rootRef = useRef(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const term = query.trim()

    if (term.length < 2) {
      setResults([])
      setLoading(false)
      setError('')
      return undefined
    }

    let active = true
    setLoading(true)
    setError('')

    const timer = window.setTimeout(async () => {
      try {
        const items = await eventService.search(term, { limit: SUGGESTION_LIMIT })
        if (!active) return
        setResults(items)
        setOpen(true)
      } catch (err) {
        if (!active) return
        setResults([])
        setError(err.message || 'Erro ao buscar.')
        setOpen(true)
      } finally {
        if (active) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    function handlePointerDown(e) {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function goToResults(term = query) {
    const value = term.trim()
    if (value.length < 2) return
    setOpen(false)
    navigate(`/busca?q=${encodeURIComponent(value)}`)
  }

  function handleSubmit(e) {
    e.preventDefault()
    goToResults()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false)
      e.currentTarget.blur()
    }
  }

  const showPanel = open && query.trim().length >= 2

  return (
    <div className="navbar-search" ref={rootRef}>
      <form className="navbar-search__form" onSubmit={handleSubmit} role="search">
        <label className="navbar-search__label" htmlFor="navbar-search-input">
          Buscar
        </label>
        <input
          id="navbar-search-input"
          className="navbar-search__input"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar filme ou evento..."
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showPanel}
        />
        <button type="submit" className="navbar-search__submit" aria-label="Buscar">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            />
          </svg>
        </button>
      </form>

      {showPanel ? (
        <div className="navbar-search__dropdown" id={listId} role="listbox">
          {loading ? <p className="navbar-search__status">Buscando...</p> : null}

          {!loading && error ? <p className="navbar-search__status">{error}</p> : null}

          {!loading && !error && results.length === 0 ? (
            <p className="navbar-search__status">Nenhum resultado encontrado.</p>
          ) : null}

          {!loading && !error && results.length > 0 ? (
            <ul className="navbar-search__list">
              {results.map((event) => (
                <li key={event.id} role="option">
                  <Link
                    to={eventPath(event)}
                    className="navbar-search__item"
                    onClick={() => setOpen(false)}
                  >
                    <img
                      src={event.image}
                      alt=""
                      className="navbar-search__thumb"
                    />
                    <span className="navbar-search__meta">
                      <span className="navbar-search__title">{event.title}</span>
                      <span className="navbar-search__sub">
                        <span className="navbar-search__badge">{typeLabel(event.type)}</span>
                        {event.venue ? ` · ${event.venue}` : ''}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {!loading && !error && query.trim().length >= 2 ? (
            <button
              type="button"
              className="navbar-search__all"
              onClick={() => goToResults()}
            >
              Ver todos os resultados
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
