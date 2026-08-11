import { useCallback, useEffect, useReducer, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import SeatSelector from '../components/events/SeatSelector'
import { useAuth } from '../contexts/AuthContext'
import { bookingService } from '../services/bookingService'

const ratingLabel = { L: 'Livre', 10: '+10', 12: '+12', 14: '+14', 16: '+16', 18: '+18' }

const initialState = {
  event: null,
  loading: true,
  error: null,
  selectedDate: null,
  selectedTime: null,
  takenSeats: [],
  seatsLoading: false,
  selectedSeats: [],
  purchasing: false,
  purchaseError: null,
  purchaseSuccess: false,
  ticketCode: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_OK':
      return { ...state, loading: false, event: action.event }
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.error }
    case 'SET_DATE':
      return {
        ...state,
        selectedDate: action.date,
        selectedTime: null,
        takenSeats: [],
        selectedSeats: [],
      }
    case 'SET_TIME':
      return { ...state, selectedTime: action.time, selectedSeats: [], purchaseError: null }
    case 'SEATS_LOADING':
      return { ...state, seatsLoading: true }
    case 'SEATS_OK':
      return { ...state, seatsLoading: false, takenSeats: action.taken }
    case 'SEATS_ERROR':
      return { ...state, seatsLoading: false }
    case 'TOGGLE_SEAT': {
      const id = action.seatId
      const already = state.selectedSeats.includes(id)
      return {
        ...state,
        selectedSeats: already
          ? state.selectedSeats.filter((s) => s !== id)
          : [...state.selectedSeats, id],
        purchaseError: null,
      }
    }
    case 'PURCHASING':
      return { ...state, purchasing: true, purchaseError: null }
    case 'PURCHASE_OK':
      return {
        ...state,
        purchasing: false,
        purchaseSuccess: true,
        ticketCode: action.ticketCode,
        selectedSeats: [],
        takenSeats: [...state.takenSeats, ...action.seats],
      }
    case 'PURCHASE_ERROR':
      return { ...state, purchasing: false, purchaseError: action.error }
    default:
      return state
  }
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-')
  return new Date(+year, +month - 1, +day).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

function formatPrice(value) {
  return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''
}

export default function MovieDetail() {
  const { id } = useParams()
  const { isAuthenticated, token, isOrganizer } = useAuth()
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(reducer, initialState)
  const seatsRef = useRef(null)

  const {
    event,
    loading,
    error,
    selectedDate,
    selectedTime,
    takenSeats,
    seatsLoading,
    selectedSeats,
    purchasing,
    purchaseError,
    purchaseSuccess,
    ticketCode,
  } = state

  useEffect(() => {
    bookingService
      .getEvent(id)
      .then((ev) => dispatch({ type: 'LOAD_OK', event: ev }))
      .catch((err) => dispatch({ type: 'LOAD_ERROR', error: err.message }))
  }, [id])

  const fetchSeats = useCallback(
    async (date, time) => {
      dispatch({ type: 'SEATS_LOADING' })
      try {
        const taken = await bookingService.getTakenSeats(id, date, time)
        dispatch({ type: 'SEATS_OK', taken })
      } catch {
        dispatch({ type: 'SEATS_ERROR' })
      }
    },
    [id],
  )

  function handleDateClick(date) {
    dispatch({ type: 'SET_DATE', date })
  }

  function handleTimeClick(time) {
    dispatch({ type: 'SET_TIME', time })
    fetchSeats(selectedDate, time)
    seatsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleToggleSeat(seatId) {
    if (isOrganizer) return
    dispatch({ type: 'TOGGLE_SEAT', seatId })
  }

  async function handlePurchase() {
    if (isOrganizer) {
      dispatch({
        type: 'PURCHASE_ERROR',
        error: 'Organizadores não podem comprar ingressos.',
      })
      return
    }

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (selectedSeats.length === 0) {
      dispatch({ type: 'PURCHASE_ERROR', error: 'Selecione ao menos um assento.' })
      return
    }

    dispatch({ type: 'PURCHASING' })

    try {
      const result = await bookingService.book({
        eventId: id,
        sessionDate: selectedDate,
        sessionTime: selectedTime,
        seats: selectedSeats,
        token,
      })
      dispatch({ type: 'PURCHASE_OK', seats: selectedSeats, ticketCode: result.ticketCode })
    } catch (err) {
      dispatch({ type: 'PURCHASE_ERROR', error: err.message })
    }
  }

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="detail-loading">
          <div className="spinner" />
          <p>Carregando filme...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <Navbar />
        <div className="detail-error">
          <p>{error}</p>
          <Link to="/" className="btn btn--primary">
            Voltar
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const currentSession = event.sessions?.find((s) => s.date === selectedDate)
  const seatMap = event.seatMap ?? { rows: 8, cols: 12 }
  const totalPrice = event.price * selectedSeats.length
  const canPurchase = selectedDate && selectedTime && selectedSeats.length > 0

  return (
    <div className="page">
      <Navbar />

      <main className="detail">
        {/* Hero */}
        <div className="detail__hero">
          <div className="detail__hero-bg" style={{ backgroundImage: `url(${event.image})` }} />
          <div className="detail__hero-content container">
            <img
              src={event.image}
              alt={`Poster de ${event.title}`}
              className="detail__poster"
            />
            <div className="detail__meta">
              <Link to="/cinema" className="detail__back">
                ← Voltar
              </Link>
              {event.rating && (
                <span className="detail__rating">
                  {ratingLabel[event.rating] ?? event.rating}
                </span>
              )}
              <h1 className="detail__title">{event.title}</h1>

              {event.movieDetails?.genres?.length > 0 && (
                <p className="detail__genres">{event.movieDetails.genres.join(' · ')}</p>
              )}

              <div className="detail__chips">
                {event.venue && (
                  <span className="chip">
                    <span>📍</span> {event.venue}
                  </span>
                )}
                {event.price != null && (
                  <span className="chip">
                    <span>🎟️</span> {formatPrice(event.price)}
                  </span>
                )}
                {event.movieDetails?.releaseDate && (
                  <span className="chip">
                    <span>📅</span> {event.movieDetails.releaseDate.slice(0, 4)}
                  </span>
                )}
              </div>

              {event.movieDetails?.overview && (
                <p className="detail__overview">{event.movieDetails.overview}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sessões */}
        <section className="detail__section container">
          <h2 className="detail__section-title">Sessões</h2>

          {!event.sessions?.length ? (
            <p className="detail__empty">Sem sessões disponíveis.</p>
          ) : (
            <div className="detail__dates">
              {event.sessions.map((session) => (
                <button
                  key={session.date}
                  type="button"
                  onClick={() => handleDateClick(session.date)}
                  className={`detail__date-btn ${selectedDate === session.date ? 'detail__date-btn--active' : ''}`}
                >
                  {formatDate(session.date)}
                </button>
              ))}
            </div>
          )}

          {selectedDate && currentSession && (
            <div className="detail__times">
              <p className="detail__times-label">Horários</p>
              <div className="detail__times-row">
                {currentSession.times.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeClick(time)}
                    className={`detail__time-btn ${selectedTime === time ? 'detail__time-btn--active' : ''}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Mapa de assentos */}
        {selectedTime && (
          <section ref={seatsRef} className="detail__section container">
            <h2 className="detail__section-title">
              {isOrganizer ? 'Mapa de assentos' : 'Escolha seus assentos'}
            </h2>

            {isOrganizer ? (
              <p className="detail__organizer-note">
                Conta de organizador: você pode visualizar a ocupação, mas não pode
                comprar ingressos.
              </p>
            ) : null}

            {seatsLoading ? (
              <div className="detail-loading detail-loading--inline">
                <div className="spinner" />
              </div>
            ) : (
              <SeatSelector
                rows={seatMap.rows}
                cols={seatMap.cols}
                taken={takenSeats}
                selected={isOrganizer ? [] : selectedSeats}
                onToggle={isOrganizer ? undefined : handleToggleSeat}
                readOnly={isOrganizer}
              />
            )}
          </section>
        )}

        {/* Resumo e compra */}
        {selectedTime && !seatsLoading && !isOrganizer && (
          <section className="detail__section container">
            <div className="detail__checkout">
              <div className="detail__checkout-info">
                {selectedSeats.length > 0 ? (
                  <>
                    <p className="detail__checkout-seats">
                      Assentos: <strong>{selectedSeats.join(', ')}</strong>
                    </p>
                    <p className="detail__checkout-total">{formatPrice(totalPrice)}</p>
                  </>
                ) : (
                  <p className="detail__checkout-hint">Selecione os assentos acima.</p>
                )}
              </div>

              <div className="detail__checkout-actions">
                {purchaseSuccess && ticketCode ? (
                  <div className="detail__ticket-link">
                    <p className="detail__success">Compra realizada! Bons filmes.</p>
                    <Link to={`/ingresso/${ticketCode}`} className="btn btn--primary">
                      Ver meu ingresso
                    </Link>
                  </div>
                ) : (
                  <>
                    {purchaseError ? <p className="detail__error">{purchaseError}</p> : null}
                    <button
                      type="button"
                      onClick={handlePurchase}
                      disabled={purchasing || (!isAuthenticated ? false : !canPurchase)}
                      className="btn btn--primary detail__buy-btn"
                    >
                      {purchasing
                        ? 'Processando...'
                        : isAuthenticated
                          ? 'Comprar ingressos'
                          : 'Entrar para comprar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
