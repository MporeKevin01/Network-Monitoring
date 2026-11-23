import { useState } from 'react'
import { deviceTypes } from '../data/sampleDevices.js'
import { validateDevice } from '../services/monitoring.js'
import { Modal } from './ui.jsx'

const defaults = { name: '', address: '', type: 'Server', method: 'HTTP', port: '' }

export default function DeviceForm({ device, onClose, onSave }) {
  const [values, setValues] = useState({ ...defaults, ...device, port: device?.port ?? '' })
  const [errors, setErrors] = useState({})
  function field(name) {
    return {
      value: values[name], 'aria-invalid': Boolean(errors[name]),
      'aria-describedby': errors[name] ? `error-${name}` : undefined,
      onChange: event => {
        setValues({ ...values, [name]: event.target.value })
        setErrors(current => ({ ...current, [name]: undefined }))
      },
    }
  }
  function error(name) {
    return errors[name] && <span className="field-error" id={`error-${name}`} role="alert">{errors[name]}</span>
  }
  function submit(event) {
    event.preventDefault()
    const result = validateDevice(values)
    setErrors(result.errors)
    const first = Object.keys(result.errors)[0]
    if (first) event.currentTarget.elements.namedItem(first)?.focus()
    else onSave(result.device, device?.id)
  }
  return <Modal title={device ? 'Edit device' : 'Add monitored device'} onClose={onClose}>
    <form onSubmit={submit} noValidate className="device-form">
      <label>Device name<input autoFocus name="name" required placeholder="e.g. Office Router" {...field('name')} />{error('name')}</label>
      <label>Hostname or IP address<input name="address" required placeholder={values.method === 'HTTP' ? 'e.g. https://example.com' : 'e.g. 192.168.1.1'} {...field('address')} />{error('address')}</label>
      <div className="form-grid">
        <label>Device type<select name="type" {...field('type')}>{deviceTypes.map(type => <option key={type}>{type}</option>)}</select>{error('type')}</label>
        <label>Monitoring method<select name="method" {...field('method')}><option>HTTP</option><option>TCP</option></select>{error('method')}</label>
      </div>
      {values.method === 'TCP'
        ? <label>TCP port<input name="port" required inputMode="numeric" placeholder="1–65535" {...field('port')} />{error('port')}</label>
        : <p className="muted">Checks use HTTPS by default. Include http:// to use HTTP.</p>}
      {values.method === 'TCP' && <p className="muted">TCP checks are simulated. Real port checks require a backend agent.</p>}
      {device && <p className="muted">Changing the address, method, or port clears this device’s previous results.</p>}
      <div className="modal-actions"><button type="button" className="button" onClick={onClose}>Cancel</button>
        <button className="button primary" type="submit">{device ? 'Save changes' : 'Add device'}</button></div>
    </form>
  </Modal>
}
