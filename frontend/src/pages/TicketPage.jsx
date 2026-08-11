import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { useToast } from '../components/common/Toast'
import { ticketService } from '../services/ticketService'

function formatPrice(value) {
  return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return new Date(+year, +month - 1, +day).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const STATUS_LABEL = {
  active: { text: 'Válido', cls: 'ticket__status--active' },
  used: { text: 'Utilizado', cls: 'ticket__status--used' },
  cancelled: { text: 'Cancelado', cls: 'ticket__status--cancelled' },
}

export default function TicketPage() {
  const { code } = useParams()
  const { showToast } = useToast()
  const [ticket, setTicket] = useState(null)
  const [qrSrc, setQrSrc] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ticketService
      .getTicket(code)
      .then(async (t) => {
        setTicket(t)
        const ticketUrl = `${window.location.origin}/ingresso/${t.code}`
        const src = await QRCode.toDataURL(ticketUrl, { width: 260, margin: 2 })
        setQrSrc(src)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [code])

  function handleCopy() {
    const url = `${window.location.origin}/ingresso/${ticket.code}`
    navigator.clipboard.writeText(url).then(() => {
      showToast('Link do ingresso copiado.', 'success')
    })
  }

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="detail-loading">
          <div className="spinner" />
          <p>Carregando ingresso...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="page">
        <Navbar />
        <div className="detail-error">
          <p>{error || 'Ingresso não encontrado.'}</p>
          <Link to="/" className="btn btn--primary">
            Voltar
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const statusInfo = STATUS_LABEL[ticket.status] ?? STATUS_LABEL.active
  const isCinema = ticket.seats?.length > 0

  return (
    <div className="page">
      <Navbar />

      <main className="ticket-page container">
        <div className="ticket">
          <div className="ticket__header">
            <span className={`ticket__status ${statusInfo.cls}`}>{statusInfo.text}</span>
            <h1 className="ticket__title">{ticket.eventTitle}</h1>
            {ticket.eventVenue ? (
              <p className="ticket__venue">📍 {ticket.eventVenue}</p>
            ) : null}
          </div>

          <div className="ticket__body">
            <div className="ticket__qr">
              {qrSrc ? (
                <img src={qrSrc} alt={`QR Code do ingresso ${ticket.code}`} />
              ) : (
                <div className="ticket__qr-placeholder">
                  <div className="spinner" />
                </div>
              )}
              <p className="ticket__code">{ticket.code}</p>
            </div>

            <div className="ticket__details">
              {isCinema ? (
                <>
                  <div className="ticket__detail-row">
                    <span>Data</span>
                    <strong>{formatDate(ticket.sessionDate)}</strong>
                  </div>
                  <div className="ticket__detail-row">
                    <span>Horário</span>
                    <strong>{ticket.sessionTime}</strong>
                  </div>
                  <div className="ticket__detail-row">
                    <span>Assentos</span>
                    <strong>{ticket.seats.join(', ')}</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="ticket__detail-row">
                    <span>Data</span>
                    <strong>{formatDate(ticket.eventDate)}</strong>
                  </div>
                  <div className="ticket__detail-row">
                    <span>Horário</span>
                    <strong>{ticket.eventTime}</strong>
                  </div>
                  <div className="ticket__detail-row">
                    <span>Área</span>
                    <strong>{ticket.areaLabel}</strong>
                  </div>
                  <div className="ticket__detail-row">
                    <span>Quantidade</span>
                    <strong>{ticket.quantity}</strong>
                  </div>
                </>
              )}

              <div className="ticket__detail-row ticket__detail-row--total">
                <span>Total pago</span>
                <strong>{formatPrice(ticket.totalPrice)}</strong>
              </div>

              {ticket.status === 'used' && ticket.usedAt ? (
                <p className="ticket__used-at">
                  Utilizado em{' '}
                  {new Date(ticket.usedAt).toLocaleString('pt-BR')}
                </p>
              ) : null}
            </div>
          </div>

          <div className="ticket__footer">
            <button type="button" className="btn btn--primary btn--block" onClick={handleCopy}>
              Compartilhar ingresso
            </button>
            <Link to="/" className="btn btn--ghost btn--block">
              Voltar ao início
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
