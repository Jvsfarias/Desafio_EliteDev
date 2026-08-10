import { useEffect, useState } from 'react'
import { AGE_RATINGS, DEFAULT_AGE_RATING } from '../../data/ageRatings'
import { useAuth } from '../../contexts/AuthContext'
import { eventService } from '../../services/eventService'

function createEmptySession() {
  return { date: '', times: [''] }
}

function normalizeInitialSessions(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return [createEmptySession()]
  }

  return sessions.map((session) => ({
    date: session.date || '',
    times: Array.isArray(session.times) && session.times.length > 0 ? [...session.times] : [''],
  }))
}

export default function EditEventModal({ event, onClose, onSaved }) {
  const { token } = useAuth()
  const [rating, setRating] = useState(DEFAULT_AGE_RATING)
  const [venue, setVenue] = useState('')
  const [price, setPrice] = useState('')
  const [sessions, setSessions] = useState([createEmptySession()])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!event) return
    setRating(event.rating || DEFAULT_AGE_RATING)
    setVenue(event.venue || '')
    setPrice(event.price != null ? String(event.price) : '')
    setSessions(normalizeInitialSessions(event.sessions))
    setError('')
  }, [event])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

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

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

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
      const updated = await eventService.update(
        event.id,
        {
          rating,
          venue,
          price: Number(price),
          sessions: normalizedSessions,
        },
        token,
      )
      onSaved?.(updated)
      onClose()
    } catch (err) {
      setError(err.message || 'Não foi possível salvar as alterações.')
    } finally {
      setLoading(false)
    }
  }

  if (!event) return null

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-event-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">Editar evento</p>
            <h2 id="edit-event-title">{event.title}</h2>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>

        <form className="auth-form modal__form" onSubmit={handleSubmit}>
          {error ? <p className="auth-form__error">{error}</p> : null}

          <label className="auth-form__field">
            <span>Classificação indicativa</span>
            <select value={rating} onChange={(e) => setRating(e.target.value)} required>
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
              <h3>Sessões</h3>
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
                          onChange={(e) => updateTime(sessionIndex, timeIndex, e.target.value)}
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

          <div className="modal__actions">
            <button type="button" className="modal__cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="auth-form__submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
