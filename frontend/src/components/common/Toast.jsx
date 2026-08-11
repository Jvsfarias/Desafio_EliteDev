import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

const ToastContext = createContext(null)

const TOAST_DURATION_MS = 2500
const TOAST_EXIT_MS = 320

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const removeToast = useCallback((id) => {
    const existing = timersRef.current.get(id)
    if (existing) {
      existing.forEach(clearTimeout)
      timersRef.current.delete(id)
    }

    setToasts((current) => {
      const toast = current.find((item) => item.id === id)
      if (!toast || toast.exiting) return current
      return current.map((item) => (item.id === id ? { ...item, exiting: true } : item))
    })

    const exitTimer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
      timersRef.current.delete(id)
    }, TOAST_EXIT_MS)

    timersRef.current.set(id, [exitTimer])
  }, [])

  const showToast = useCallback(
    (message, type = 'success') => {
      if (!message) return

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      setToasts((current) => [...current, { id, message, type, exiting: false }])

      const hideTimer = window.setTimeout(() => removeToast(id), TOAST_DURATION_MS)
      timersRef.current.set(id, [hideTimer])
    },
    [removeToast],
  )

  useEffect(() => {
    const timersMap = timersRef.current
    return () => {
      timersMap.forEach((timers) => timers.forEach(clearTimeout))
      timersMap.clear()
    }
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.type} ${toast.exiting ? 'is-exiting' : ''}`}
            role="status"
          >
            <span className="toast__message">{toast.message}</span>
            <button
              type="button"
              className="toast__close"
              aria-label="Fechar notificação"
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider')
  }
  return context
}
