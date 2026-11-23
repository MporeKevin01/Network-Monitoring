import { useState } from 'react'
import { Empty, Source, Status } from '../components/ui.jsx'
import { formatDate, formatDuration } from '../services/format.js'

export function ResultsTable({ results }) {
  if (!results.length) return <Empty title="No matching checks">Run a check or change the filters.</Empty>
  return <div className="table-scroll"><table className="history-table">
    <thead><tr>{['Device', 'Check time', 'Result', 'Response time', 'HTTP status', 'Error details'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
    <tbody>{results.map(result => <tr key={result.id}>
      <td className="strong">{result.name}</td>
      <td className="mono">{formatDate(result.time)}</td>
      <td><Status value={result.status} /><div className="device-meta"><Source value={result.source} /></div></td>
      <td className="mono">{formatDuration(result.duration)}</td>
      <td className="mono">{result.httpStatus ?? '—'}</td>
      <td className="error-details">{result.error || '—'}</td>
    </tr>)}</tbody>
  </table></div>
}

export default function History({ devices, history, initialDevice = '' }) {
  const [deviceId, setDeviceId] = useState(initialDevice)
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const start = date ? new Date(`${date}T00:00:00`) : null
  const end = start ? new Date(start) : null
  if (end) end.setDate(end.getDate() + 1)
  const filtered = history.filter(result => (!deviceId || result.deviceId === deviceId) &&
    (!status || result.status === status) && (!start || (result.time >= start.getTime() && result.time < end.getTime())))
  return <section className="panel">
    <div className="panel-heading"><div><h2>Check results</h2><p>{filtered.length} recorded {filtered.length === 1 ? 'check' : 'checks'}</p></div></div>
    <div className="filters">
      <label>Device<select value={deviceId} onChange={event => setDeviceId(event.target.value)}><option value="">All devices</option>
        {devices.map(device => <option key={device.id} value={device.id}>{device.name}</option>)}</select></label>
      <label>Result<select value={status} onChange={event => setStatus(event.target.value)}><option value="">All results</option>
        {['Online', 'Offline', 'Unknown'].map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Date<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
      <button className="button" disabled={!deviceId && !status && !date} onClick={() => {
        setDeviceId('')
        setStatus('')
        setDate('')
      }}>Reset filters</button>
    </div>
    <ResultsTable results={filtered} />
  </section>
}
