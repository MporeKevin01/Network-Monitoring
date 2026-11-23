import { ArrowUpRight } from 'lucide-react'
import MonitoringChart, { ChartLegend } from '../components/MonitoringChart.jsx'
import { Source, Status } from '../components/ui.jsx'
import { formatDate, formatDuration } from '../services/format.js'
import { availability, averageDuration, sources } from '../services/metrics.js'
import { ResultsTable } from './History.jsx'

export default function DeviceDetails({ device, results, busy, onHistory }) {
  const latest = results[0]
  const recent = results.slice(0, 30).reverse().map(result => ({
    label: formatDate(result.time), [result.source]: result.duration,
  }))
  return <>
    <section className="panel detail-panel">
      <div className="panel-heading"><div><h2>Device information</h2><p className="mono">{device.address}</p></div><Status value={busy ? 'Checking' : latest?.status} /></div>
      <dl className="detail-fields">
        <div><dt>Device type</dt><dd>{device.type}</dd></div>
        <div><dt>Monitoring method</dt><dd>{device.method === 'TCP' ? `TCP · Port ${device.port} · Simulated` : 'HTTP / HTTPS'}</dd></div>
        <div><dt>Latest check</dt><dd>{formatDate(latest?.time)} <Source value={latest?.source} /></dd></div>
        <div><dt>Target</dt><dd>{device.demo ? 'Demo target' : 'Registered device'}</dd></div>
      </dl>
      {latest?.error && <p className="detail-note">{latest.error}</p>}
      <div className="detail-metrics">{sources.map(({ label }) => {
        const group = results.filter(result => result.source === label)
        if (!group.length) return null
        const uptime = availability(group)
        return <div className="method-card" key={label}><div><Source value={label} />
          <p>{uptime == null ? '—' : `${uptime}%`} availability · {formatDuration(averageDuration(group))} average response</p></div></div>
      })}</div>
    </section>
    <section className="panel chart-panel">
      <div className="panel-heading"><div><h2>Response time</h2><p>Latest 30 checks, grouped by result source</p></div></div>
      <MonitoringChart data={recent} id="response" unit=" ms" /><ChartLegend data={recent} />
    </section>
    <section className="panel">
      <div className="panel-heading"><div><h2>Recent results</h2><p>Latest ten checks for this device</p></div>
        <button className="text-button" onClick={onHistory}>View history <ArrowUpRight size={14} /></button>
      </div>
      <ResultsTable results={results.slice(0, 10)} />
    </section>
  </>
}
