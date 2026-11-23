import { Check, CircleHelp, LoaderCircle, Minus, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

const statusIcons = { Online: Check, Offline: X, Checking: LoaderCircle, Unknown: CircleHelp, Unchecked: Minus }

export function Status({ value = 'Unchecked' }) {
  const Icon = statusIcons[value]
  return <span className={`status ${value.toLowerCase()}`}><Icon size={12} className={value === 'Checking' ? 'animate-spin' : ''} />{value}</span>
}

export function Source({ value }) {
  return value && <span className={`source ${value.toLowerCase().replace(' ', '-')}`}>{value}</span>
}

export function Modal({ title, onClose, children }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    return () => element.close()
  }, [])
  return <dialog ref={dialog} className="modal" aria-labelledby="dialog-title" onCancel={event => {
    event.preventDefault()
    onClose()
  }}>
    <div className="modal-heading"><h2 id="dialog-title">{title}</h2>
      <button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
    </div>
    {children}
  </dialog>
}

export function Empty({ title, children }) {
  return <div className="empty"><strong>{title}</strong>{children && <p>{children}</p>}</div>
}
