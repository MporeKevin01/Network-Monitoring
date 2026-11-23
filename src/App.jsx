import { Activity, ArrowLeft, CircleHelp, History as HistoryIcon, LayoutDashboard, Menu, Plus, Radio, RefreshCw, Search, Server, Settings as SettingsIcon, X } from 'lucide-react'
import { useState } from 'react'
import DeviceForm from './components/DeviceForm.jsx'
import DeviceTable from './components/DeviceTable.jsx'
import { Modal } from './components/ui.jsx'
import { formatDate } from './services/format.js'
import { sampleDevices } from './data/sampleDevices.js'
import { useMonitoring } from './hooks/useMonitoring.js'
import DeviceDetails from './pages/DeviceDetails.jsx'
import History from './pages/History.jsx'
import Overview from './pages/Overview.jsx'
import Settings from './pages/Settings.jsx'
import { latestResults } from './services/metrics.js'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard, description: 'Track device health, availability, and response times.' },
  { label: 'Monitored Devices', icon: Server, description: 'Manage monitoring targets and run individual checks.' },
  { label: 'Monitoring History', icon: HistoryIcon, description: 'Review and filter recorded device checks.' },
  { label: 'Settings', icon: SettingsIcon, description: 'Manage monitoring intervals, appearance, and sample data.' },
]

export default function App() {
  const monitor = useMonitoring()
  const { devices, history, settings, checking, running } = monitor
  const latest = latestResults(history)
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [historyDevice, setHistoryDevice] = useState('')
  const [form, setForm] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [query, setQuery] = useState('')
  const [menu, setMenu] = useState(false)
  const [notice, setNotice] = useState('')
  const selected = devices.find(device => device.id === selectedId)
  const visible = devices.filter(device => [device.name, device.address, device.type].some(value => value.toLowerCase().includes(query.trim().toLowerCase())))

  function navigate(index) {
    setPage(index)
    setSelectedId(null)
    setHistoryDevice('')
    setQuery('')
    setMenu(false)
    setNotice('')
  }

  function askDelete(device) {
    setConfirm({
      title: `Delete ${device.name}?`, description: 'This removes the device and its recorded checks.',
      action: 'Delete device', run: () => {
        monitor.remove(device.id)
        if (selectedId === device.id) navigate(1)
        setNotice('Device deleted.')
      },
    })
  }

  const deviceList = <section className="panel device-panel">
    <div className="panel-heading">
      <div><h2>Monitored devices <span className="count">{devices.length}</span></h2><p>Latest check for each target</p></div>
      <label className="search"><Search size={16} /><input type="search" aria-label="Search devices" placeholder="Search devices..." value={query} onChange={event => setQuery(event.target.value)} /></label>
    </div>
    <DeviceTable devices={visible} latest={latest} checking={checking}
      onSelect={id => { setSelectedId(id); setNotice('') }} onCheck={monitor.run}
      onEdit={device => setForm({ device })} onDelete={askDelete} />
  </section>

  const isDevicePage = page < 2
  const checkBusy = running || checking.length > 0
  return <div className="app" data-theme={settings.theme}>
    <a href="#main" className="skip-link">Skip to content</a>
    {menu && <button className="scrim" aria-label="Close navigation" onClick={() => setMenu(false)} />}
    <aside className={`sidebar ${menu ? 'open' : ''}`} aria-label="Sidebar">
      <button className="brand" onClick={() => navigate(0)}><span className="brand-mark"><Activity size={23} /></span>
        <span><strong>NetWatch</strong><small>Network Monitor</small></span></button>
      <nav aria-label="Main navigation">
        <p className="nav-label">Workspace</p>
        {navigation.map(({ label, icon: Icon }, index) =>
          <button key={label} className={page === index ? 'active' : ''} aria-current={page === index ? 'page' : undefined} onClick={() => navigate(index)}>
            <Icon size={18} />{label}</button>)}
      </nav>
      <div className="sidebar-footer"><CircleHelp size={17} /><div><strong>Browser-based monitoring</strong><small>Checks run from this session</small></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-button menu-button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label={menu ? 'Close navigation' : 'Open navigation'}>{menu ? <X size={22} /> : <Menu size={22} />}</button>
          <span className="topbar-path">NetWatch <span>/</span> <strong>{navigation[page].label}</strong></span>
        </div>
        <div className="topbar-right">
          <span className={`monitor-state ${checkBusy ? 'busy' : ''}`} role="status"><Radio size={15} />{checkBusy ? 'Checking' : settings.interval ? 'Auto monitoring' : 'Manual monitoring'}</span>
          <span className="last-updated">Updated <span>{formatDate(history[0]?.time)}</span></span>
          <span className="avatar" aria-label="Local user profile" title="Local user profile">NW</span>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {selected && <button className="text-button back-button" onClick={() => setSelectedId(null)}><ArrowLeft size={15} /> {navigation[page].label}</button>}
        <div className="page-heading">
          <div><h1>{selected?.name || navigation[page].label}</h1>
            <p>{selected ? 'Device health and recorded monitoring results.' : navigation[page].description}</p></div>
          {isDevicePage && <div className="page-actions">
            <button className="button" disabled={selected ? checking.includes(selected.id) : checkBusy || !devices.length}
              onClick={() => selected ? monitor.run(selected) : monitor.runAll(devices)}>
              <RefreshCw size={16} className={checkBusy ? 'animate-spin' : ''} />{selected ? 'Run check' : 'Run checks'}
            </button>
            {selected
              ? <button className="button primary" onClick={() => setForm({ device: selected })}>Edit device</button>
              : <button className="button primary" onClick={() => setForm({})}><Plus size={18} /> Add device</button>}
          </div>}
        </div>
        {monitor.storageError && <p className="alert" role="alert">Browser storage is unavailable. Changes may be lost when this page closes.</p>}
        {notice && <p className="notice" role="status">{notice}<button className="icon-button" onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={16} /></button></p>}
        {selected ? <DeviceDetails device={selected} results={history.filter(result => result.deviceId === selected.id)} busy={checking.includes(selected.id)}
          onHistory={() => { navigate(2); setHistoryDevice(selected.id) }} /> : <>
          {page === 0 && <Overview devices={devices} latest={latest} checking={checking} history={history} onSettings={() => navigate(3)}>{deviceList}</Overview>}
          {page === 1 && deviceList}
          {page === 2 && <History devices={devices} history={history} initialDevice={historyDevice} />}
          {page === 3 && <Settings settings={settings} onUpdate={monitor.updateSettings}
            hasDemo={devices.some(device => device.demo)} canRestore={sampleDevices.some(sample => !devices.some(device => device.id === sample.id))}
            onRestore={() => { monitor.restoreDemo(); setNotice('Sample devices restored.') }}
            onClear={() => setConfirm({
              title: 'Clear demonstration data?', description: 'This removes all sample devices and their recorded checks.',
              action: 'Clear demo data', run: () => { monitor.clearDemo(); setNotice('Demonstration data cleared.') },
            })} />}
        </>}
      </main>
    </div>
    {form && <DeviceForm device={form.device} onClose={() => setForm(null)} onSave={(device, id) => {
      monitor.save(device, id)
      setNotice(id ? 'Device updated.' : 'Device added.')
      setForm(null)
    }} />}
    {confirm && <Modal title={confirm.title} onClose={() => setConfirm(null)}>
      <p className="muted">{confirm.description}</p>
      <div className="modal-actions"><button className="button" autoFocus onClick={() => setConfirm(null)}>Cancel</button>
        <button className="button danger" onClick={() => { confirm.run(); setConfirm(null) }}>{confirm.action}</button></div>
    </Modal>}
  </div>
}
