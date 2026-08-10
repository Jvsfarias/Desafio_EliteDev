import { useEffect, useReducer } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import ShowVenueMap from '../components/events/ShowVenueMap'
import { useAuth } from '../contexts/AuthContext'
import { SHOW_AREAS } from '../data/showAreas'
import { bookingService } from '../services/bookingService'

const AREA_COLORS = Object.fromEntries(SHOW_AREAS.map((area) => [area.key, area.color]))

const initialState = {
  event: null,
  areas: [],
  loading: true,
  error: null,
  selectedArea: null,
  quantity: 1,
  purchasing: false,
  purchaseError: null,
  purchaseSuccess: false,
  ticketCode: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_OK':
      return {
        ...state,
        loading: false,
        event: action.event,
        areas: action.areas,
      }
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.error }
    case 'SET_AREA':
      return {
        ...state,
        selectedArea: action.areaKey,
        quantity: 1,
        purchaseError: null,
        purchaseSuccess: false,
      }
    case 'SET_QUANTITY':
      return { ...state, quantity: action.quantity, purchaseError: null }
    case 'PURCHASING':
      return { ...state, purchasing: true, purchaseError: null }
    case 'PURCHASE_OK':
      return {
        ...state,
        purchasing: false,
        purchaseSuccess: true,
        ticketCode: action.ticketCode,
        quantity: 1,
        areas: state.areas.map((area) =>
          area.key === action.areaKey
            ? { ...area, remaining: action.remaining, sold: area.capacity - action.remaining }
            : area,
        ),
      }
    case 'PURCHASE_ERROR':
      return { ...state, purchasing: false, purchaseError: action.error }
    default:
      return state
  }
}

function formatShowDate(dateStr, timeStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const date = new Date(+year, +month - 1, +day).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  if (!timeStr) return date
  return `${date} · ${timeStr.slice(0, 5)}`
}

function formatPrice(value) {
  return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''
}

export default function ShowDetail() {
  const { id } = useParams()
  const { isAuthenticated, token, isOrganizer } = useAuth()
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(reducer, initialState)

  const {
    event,
    areas,
    loading,
    error,
    selectedArea,
    quantity,
    purchasing,
    purchaseError,
    purchaseSuccess,
    ticketCode,
  } = state

  useEffect(() => {
    async function load() {
      try {
        const [ev, areaList] = await Promise.all([
          bookingService.getEvent(id),
          bookingService.getAreas(id),
        ])

        if (ev.type !== 'show') {
          dispatch({ type: 'LOAD_ERROR', error: 'Show não encontrado.' })
          return
        }

        dispatch({ type: 'LOAD_OK', event: ev, areas: areaList })
      } catch (err) {
        dispatch({ type: 'LOAD_ERROR', error: err.message })
      }
    }

    load()
  }, [id])

  const selected = areas.find((area) => area.key === selectedArea)
  const maxQty = selected?.remaining ?? 0
  const totalPrice = selected ? selected.price * quantity : 0
  const canPurchase = selected && quantity >= 1 && quantity <= maxQty && maxQty > 0

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

    if (!canPurchase) {
      dispatch({ type: 'PURCHASE_ERROR', error: 'Selecione uma área e quantidade válidas.' })
      return
    }

    dispatch({ type: 'PURCHASING' })

    try {
      const result = await bookingService.bookShow({
        eventId: id,
        areaKey: selectedArea,
        quantity,
        token,
      })
      dispatch({
        type: 'PURCHASE_OK',
        areaKey: selectedArea,
        remaining: result.remaining,
        ticketCode: result.ticketCode,
      })
    } catch (err) {
      dispatch({ type: 'PURCHASE_ERROR', error: err.message })
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="detail-loading">
          <div className="spinner" />
          <p>Carregando show...</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="detail-error">
          <p>{error}</p>
          <Link to="/" className="btn btn--primary">
            Voltar
          </Link>
        </div>
      </>
    )
  }

  const sellableAreas = areas.filter((area) => area.capacity > 0)

  return (
    <>
      <Navbar />

      <main className="detail">
        <div className="detail__hero">
          <div className="detail__hero-bg" style={{ backgroundImage: `url(${event.image})` }} />
          <div className="detail__hero-content container">
            <img
              src={event.image}
              alt={event.title}
              className="detail__poster detail__poster--show"
            />
            <div className="detail__meta">
              <Link to="/#eventos" className="detail__back">
                ← Voltar
              </Link>
              <h1 className="detail__title">{event.title}</h1>

              <div className="detail__chips">
                {event.venue ? (
                  <span className="chip">
                    <span>📍</span> {event.venue}
                  </span>
                ) : null}
                {(event.showDate || event.showTime) ? (
                  <span className="chip">
                    <span>📅</span> {formatShowDate(event.showDate, event.showTime)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {event.description ? (
          <section className="detail__section container">
            <h2 className="detail__section-title">Sobre</h2>
            <p className="detail__overview detail__overview--full">{event.description}</p>
          </section>
        ) : null}

        <section className="detail__section container">
          <h2 className="detail__section-title">Escolha a área</h2>

          <div className="show-detail__layout">
            <ShowVenueMap activeKey={selectedArea} />

            <div className="show-detail__areas">
              {sellableAreas.length === 0 ? (
                <p className="detail__empty">Nenhuma área disponível para venda.</p>
              ) : (
                sellableAreas.map((area) => {
                  const soldOut = area.remaining <= 0
                  const isActive = selectedArea === area.key

                  return (
                    <button
                      key={area.key}
                      type="button"
                      disabled={soldOut || isOrganizer}
                      onClick={() => dispatch({ type: 'SET_AREA', areaKey: area.key })}
                      className={`show-detail__area ${isActive ? 'is-active' : ''} ${soldOut ? 'is-soldout' : ''}`}
                    >
                      <span
                        className="show-detail__area-dot"
                        style={{ background: AREA_COLORS[area.key] || '#999' }}
                      />
                      <span className="show-detail__area-info">
                        <strong>{area.label}</strong>
                        <small>
                          {soldOut
                            ? 'Esgotado'
                            : `${area.remaining} de ${area.capacity} disponíveis`}
                        </small>
                      </span>
                      <span className="show-detail__area-price">{formatPrice(area.price)}</span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </section>

        {isOrganizer ? (
          <section className="detail__section container">
            <p className="detail__organizer-note">
              Conta de organizador: você pode visualizar as áreas e a ocupação, mas não
              pode comprar ingressos.
            </p>
          </section>
        ) : null}

        {selectedArea && !isOrganizer ? (
          <section className="detail__section container">
            <div className="detail__checkout">
              <div className="detail__checkout-info">
                <p className="detail__checkout-seats">
                  Área: <strong>{selected?.label}</strong>
                </p>
                <label className="show-detail__qty">
                  <span>Quantidade</span>
                  <input
                    type="number"
                    min="1"
                    max={maxQty}
                    value={quantity}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      const next = Number.isFinite(value)
                        ? Math.min(Math.max(value, 1), maxQty || 1)
                        : 1
                      dispatch({ type: 'SET_QUANTITY', quantity: next })
                    }}
                  />
                </label>
                <p className="detail__checkout-total">{formatPrice(totalPrice)}</p>
              </div>

              <div className="detail__checkout-actions">
                {purchaseSuccess && ticketCode ? (
                  <div className="detail__ticket-link">
                    <p className="detail__success">Compra realizada! Bom show.</p>
                    <Link to={`/ingresso/${ticketCode}`} className="btn btn--secondary">
                      🎟️ Ver meu ingresso
                    </Link>
                  </div>
                ) : null}
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
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </>
  )
}
