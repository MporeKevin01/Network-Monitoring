import { Clock3, Database, Moon, Sun } from 'lucide-react'

export default function Settings({ settings, onUpdate, onClear, onRestore, hasDemo, canRestore }) {
  return <div className="settings-grid">
    <section className="panel settings-panel">
      <div className="panel-heading"><div><h2>Automatic checks</h2><p>Schedule checks while this tab is visible.</p></div><Clock3 size={20} className="accent" /></div>
      <label>Refresh interval<select value={settings.interval} onChange={event => onUpdate({ interval: Number(event.target.value) })}>
        <option value={0}>Manual only</option><option value={60}>Every minute</option><option value={300}>Every 5 minutes</option>
        <option value={900}>Every 15 minutes</option><option value={1800}>Every 30 minutes</option>
      </select></label>
      <p className="muted mt-3">A server can be reachable even when its CORS policy prevents the browser from reading its response. NetWatch records these attempts as Unknown.</p>
    </section>
    <section className="panel settings-panel">
      <div className="panel-heading"><div><h2>Appearance</h2><p>Choose the dashboard theme.</p></div><Sun size={20} className="accent" /></div>
      <div className="theme-options" role="group" aria-label="Dashboard theme">
        <button className="button" aria-pressed={settings.theme === 'dark'} onClick={() => onUpdate({ theme: 'dark' })}><Moon size={16} /> Dark</button>
        <button className="button" aria-pressed={settings.theme === 'light'} onClick={() => onUpdate({ theme: 'light' })}><Sun size={16} /> Light</button>
      </div>
    </section>
    <section className="panel settings-panel">
      <div className="panel-heading"><div><h2>Demonstration data</h2><p>Manage the sample targets and their example monitoring history.</p></div><Database size={20} className="accent" /></div>
      <div className="theme-options"><button className="button danger-outline" disabled={!hasDemo} onClick={onClear}>Clear demonstration data</button>
        <button className="button" disabled={!canRestore} onClick={onRestore}>Restore sample devices</button></div>
    </section>
  </div>
}
