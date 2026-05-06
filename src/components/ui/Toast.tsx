import { CheckCircle, XCircle, Info } from 'lucide-react'
import { useToastStore } from '../../stores'

export default function ToastContainer() {
  const toasts = useToastStore(s => s.toasts)
  const remove  = useToastStore(s => s.remove)

  if (!toasts.length) return null

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className="toast"
          onClick={() => remove(t.id)}
          style={{ cursor: 'pointer' }}
        >
          {t.type === 'success' && <CheckCircle size={14} style={{ color: '#6ee7b7', flexShrink: 0 }} />}
          {t.type === 'error'   && <XCircle     size={14} style={{ color: '#fca5a5', flexShrink: 0 }} />}
          {t.type === 'default' && <Info        size={14} style={{ color: '#93c5fd', flexShrink: 0 }} />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
