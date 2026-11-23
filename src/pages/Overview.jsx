import { Activity, ArrowUpRight, Cable, CheckCircle2, Clock3, Globe2, Info, Network, XCircle } from 'lucide-react'
import { useState } from 'react'
import MonitoringChart, { ChartLegend } from '../components/MonitoringChart.jsx'
import { Source } from '../components/ui.jsx'
import { formatDuration } from '../services/format.js'
import { availabilitySeries, averageDuration } from '../services/metrics.js'

export default function Overview({ devices, history, latest, checking, onSettings, children }) {
  const [range, setRange] = useState(24)
  const results = devices.map(device => latest.get(device.id)).filter(Boolean)
  const count = status => results.filter(result => result.status === status).length
  const online = count('Online')
  const offline = count('Offline')
  const groups = ['Measured', 'Simulated', 'Demo'].map(source => ({
    source, value: averageDuration(results.filter(item => item.source === source)),
  })).filter(group => group.value != null)
  const preferred = groups[0]
  const metrics = [
    { title: 'Monitored devices', value: devices.length, detail: `${devices.filter(device => device.demo).length} demo targets`, icon: Network, color: 'blue' },
    { title: 'Online devices', value: online, detail: 'Latest recorded results', icon: CheckCircle2, color: 'green' },
    { title: 'Offline devices', value: offline, detail: `${devices.length - online - offline} unverified or unchecked`, icon: XCircle, color: 'red' },
    { title: 'Avg. response time', value: formatDuration(preferred?.value), detail: preferred ? <><Source value={preferred.source} /> <span>online devices</span></> : 'Awaiting successful checks', icon: Clock3, color: 'purple' },
  ]
  const [openedAt] = useState(Date.now)
  const data = availabilitySeries(history, range, Math.max(openedAt, history[0]?.time ?? 0))
  return <>
    <section className="metrics" aria-label="Network summary">
      {metrics.map(({ title, value, detail, icon: Icon, color }) => <article className="panel metric" key={title}>
        <div className={`metric-icon ${color}`}><Icon size={18} /></div>
        <div className="metric-title">{title}</div><div className="metric-value">{value}</div>
        <div className="metric-detail">{detail}</div>
      </article>)}
    </section>
    <div className="overview-grid">
      <section className="panel chart-panel">
        <div className="panel-heading"><div><h2>Network availability</h2><p>Successful checks as a share of known results</p></div>
          <select className="compact" aria-label="Availability time range" value={range} onChange={event => setRange(Number(event.target.value))}>
            <option value={24}>Last 24 hours</option><option value={48}>Last 48 hours</option>
          </select>
        </div>
        <MonitoringChart data={data} id="availability" unit="%" />
        <ChartLegend data={data} />
      </section>
      <section className="panel modes-panel">
        <div className="panel-heading"><div><h2>Monitoring methods</h2><p>How NetWatch checks your devices</p></div><Activity size={18} className="accent" /></div>
        <div className="method-card"><span className="method-icon"><Globe2 size={18} /></span><div><h3>HTTP / HTTPS</h3><p>Browser requests measure response time and record readable status codes.</p></div></div>
        <div className="method-card"><span className="method-icon purple"><Cable size={18} /></span><div><h3>TCP simulation</h3><p>Simulated port results. Real TCP checks require a backend agent.</p></div></div>
        <p className="method-note"><Info size={15} /> Browser restrictions can leave HTTP results unknown. Demo targets include private IPs.</p>
        <button className="text-button" onClick={onSettings}>Monitoring settings <ArrowUpRight size={14} /></button>
      </section>
    </div>
    {children}
    <div className="sr-only" aria-live="polite">{checking.length ? `${checking.length} checks in progress` : ''}</div>
  </>
}
