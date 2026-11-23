import { Cable, Globe2, Pencil, RefreshCw, Router, Server, Trash2, Workflow } from 'lucide-react'
import { Empty, Source, Status } from './ui.jsx'
import { formatDuration, formatTime } from '../services/format.js'

const typeIcons = { Router, Switch: Workflow, Server, Website: Globe2, Other: Cable }

export default function DeviceTable({ devices, latest, checking, onSelect, onCheck, onEdit, onDelete }) {
  if (!devices.length) return <Empty title="No devices to show">Add a device or adjust your search.</Empty>
  return <div className="table-scroll"><table className="device-table">
    <thead><tr>{['Device name', 'Address', 'Type', 'Status', 'Response time', 'Last checked', 'Actions'].map(label =>
      <th key={label} scope="col">{label}</th>)}</tr></thead>
    <tbody>{devices.map(device => {
      const Icon = typeIcons[device.type] || Cable
      const last = latest.get(device.id)
      const busy = checking.includes(device.id)
      return <tr key={device.id}>
        <td><div className="device-cell"><span className="device-icon"><Icon size={17} /></span><div>
          <button className="device-name" onClick={() => onSelect(device.id)}>{device.name}</button>
          <div className="device-meta">{device.method}{device.method === 'TCP' && ` · Port ${device.port}`}{device.demo && <Source value="Demo" />}</div>
        </div></div></td>
        <td className="mono address-cell" title={device.address}>{device.address}</td>
        <td>{device.type}</td>
        <td><Status value={busy ? 'Checking' : last?.status} /></td>
        <td className="mono">{formatDuration(last?.duration)}{last && <div className="device-meta"><Source value={last.source} /></div>}</td>
        <td className="mono">{formatTime(last?.time)}{last?.httpStatus && <div className="device-meta">HTTP {last.httpStatus}</div>}</td>
        <td><div className="row-actions">
          <button className="icon-button" title="Check device" aria-label={`Check ${device.name}`} disabled={busy} onClick={() => onCheck(device)}><RefreshCw size={15} className={busy ? 'animate-spin' : ''} /></button>
          <button className="icon-button" title="Edit device" aria-label={`Edit ${device.name}`} onClick={() => onEdit(device)}><Pencil size={15} /></button>
          <button className="icon-button delete" title="Delete device" aria-label={`Delete ${device.name}`} onClick={() => onDelete(device)}><Trash2 size={15} /></button>
        </div></td>
      </tr>
    })}</tbody>
  </table></div>
}
