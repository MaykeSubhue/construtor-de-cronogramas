import { useEffect } from 'react'

export function Badge({ children, cls = 'cinza', dot = false }) {
  return (
    <span className={`badge ${cls}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  )
}

export function StatusBadge({ status, map }) {
  const s = map[status]
  if (!s) return <Badge>{status}</Badge>
  return <Badge cls={s.cls} dot>{s.txt}</Badge>
}

export function OrigemTag({ origem }) {
  const labels = { rdc: 'RDC', matriz: 'Matriz v4', regra: 'Regra', preset: 'Preset', manual: 'Manual', seed: 'Base' }
  return <span className={`origem-tag ${origem}`}>{labels[origem] || origem}</span>
}

export function Kpi({ valor, label, hint }) {
  return (
    <div className="card kpi">
      <span className="v">{valor}</span>
      <span className="l">{label}</span>
      {hint && <span className="t up">{hint}</span>}
    </div>
  )
}

export function Progress({ value, warn }) {
  return (
    <div className={`progress ${warn ? 'warn' : ''}`}>
      <span style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

export function Modal({ title, icon, onClose, children, footer, lg }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${lg ? 'lg' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
          <h3>{title}</h3>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function Empty({ icon = '📄', children }) {
  return (
    <div className="empty">
      <div className="e-ico">{icon}</div>
      {children}
    </div>
  )
}

export function Note({ children, icon = 'ℹ️' }) {
  return <div className="note"><span>{icon}</span><div>{children}</div></div>
}
