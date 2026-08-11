import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { useToast } from './Toast'
import { simulatePayment } from '../../utils/simulatePayment'

function formatPrice(value) {
  return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''
}

export default function PaymentModal({
  title,
  summaryLines = [],
  total,
  onConfirmPayment,
  onClose,
  onSuccess,
}) {
  const { showToast } = useToast()
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const busy = status === 'processing' || status === 'approved'

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', handleKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, busy])

  async function handlePay() {
    setError('')
    setStatus('processing')

    try {
      const { approved } = await simulatePayment()

      if (!approved) {
        setStatus('declined')
        showToast('Pagamento recusado. Tente novamente.', 'error')
        return
      }

      setStatus('approved')
      const result = await onConfirmPayment()
      showToast('Pagamento aprovado! Ingresso gerado.', 'success')
      onSuccess?.(result)
      onClose()
    } catch (err) {
      setStatus('idle')
      setError(err.message || 'Não foi possível concluir a compra.')
      showToast(err.message || 'Erro ao concluir a compra.', 'error')
    }
  }

  function handleRetry() {
    setError('')
    setStatus('idle')
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={busy ? undefined : onClose}
      role="presentation"
    >
      <div
        className="modal modal--confirm payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">Pagamento simulado</p>
            <h2 id="payment-modal-title">Finalizar compra</h2>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            disabled={busy}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className="modal__body payment-modal__body">
          <p className="payment-modal__event">{title}</p>

          <ul className="payment-modal__summary">
            {summaryLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li className="payment-modal__total">
              Total: <strong>{formatPrice(total)}</strong>
            </li>
          </ul>

          {status === 'processing' ? (
            <div className="payment-modal__status payment-modal__status--processing">
              <div className="spinner" />
              <p>Processando pagamento...</p>
            </div>
          ) : null}

          {status === 'declined' ? (
            <div className="payment-modal__status payment-modal__status--declined">
              <p>Pagamento recusado. Tente novamente.</p>
            </div>
          ) : null}

          {error ? <p className="auth-form__error">{error}</p> : null}

          {status === 'idle' ? (
            <p className="payment-modal__hint">
              Simulação: o pagamento pode ser aprovado ou recusado aleatoriamente.
            </p>
          ) : null}
        </div>

        <div className="modal__actions">
          {status === 'declined' ? (
            <>
              <button type="button" className="modal__cancel" onClick={onClose}>
                Fechar
              </button>
              <button type="button" className="btn btn--primary" onClick={handleRetry}>
                Tentar novamente
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="modal__cancel"
                onClick={onClose}
                disabled={busy}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handlePay}
                disabled={busy}
              >
                {status === 'processing'
                  ? 'Processando...'
                  : status === 'approved'
                    ? 'Confirmando...'
                    : 'Pagar agora'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
