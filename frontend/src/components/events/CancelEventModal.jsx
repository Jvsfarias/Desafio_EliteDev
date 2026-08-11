import { createPortal } from 'react-dom'
import { useEffect } from 'react'

export default function CancelEventModal({
  event,
  loading,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, loading])

  if (!event) return null

  const label = event.type === 'filme' ? 'filme' : 'evento'

  return createPortal(
    <div className="modal-overlay" onClick={loading ? undefined : onClose} role="presentation">
      <div
        className="modal modal--confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-event-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">Cancelamento</p>
            <h2 id="cancel-event-title">Cancelar {label}?</h2>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className="modal__body">
          <p className="modal__text">
            Ao cancelar <strong>{event.title}</strong>, o {label} será removido da plataforma
            e <strong>todos os valores dos ingressos ativos serão reembolsados</strong> aos
            clientes.
          </p>
          <p className="modal__text">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="modal__actions">
          <button
            type="button"
            className="modal__cancel"
            onClick={onClose}
            disabled={loading}
          >
            Manter {label}
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Cancelando...' : 'Confirmar cancelamento'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
