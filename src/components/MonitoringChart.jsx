import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Empty } from './ui.jsx'

import { sources } from '../services/metrics.js'

export function ChartLegend({ data }) {
  return <div className="chart-legend">{sources.filter(({ label }) => data.some(row => row[label] != null)).map(({ label, color }) =>
    <span key={label}><i style={{ background: color }} />{label}</span>)}</div>
}

export default function MonitoringChart({ data, id, unit }) {
  const visible = sources.filter(({ label }) => data.some(row => row[label] != null))
  if (!visible.length) return <Empty title="No chart data">Results will appear after a qualifying check.</Empty>
  return <div className="chart" aria-label={unit === '%' ? 'Availability chart' : 'Response time chart'}>
    <ResponsiveContainer width="100%" height={220} minWidth={0}>
      <AreaChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
        <defs>{visible.map(({ label, color }) =>
          <linearGradient key={label} id={`${id}-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.24} /><stop offset="100%" stopColor={color} stopOpacity={0.01} />
          </linearGradient>)}</defs>
        <CartesianGrid stroke="var(--grid)" vertical={false} strokeDasharray="4 4" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={12} minTickGap={26} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
        <YAxis width={49} tickLine={false} axisLine={false} domain={unit === '%' ? [0, 100] : [0, 'auto']}
          tickFormatter={value => `${value}${unit}`} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
        <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8 }}
          labelStyle={{ color: 'var(--text)' }} formatter={value => `${value}${unit}`} />
        {visible.map(({ label, color }) => <Area key={label} dataKey={label} type="monotone" stroke={color} strokeWidth={2}
          fill={`url(#${id}-${label})`} dot={data.filter(row => row[label] != null).length < 12 ? { r: 3, fill: color, strokeWidth: 0 } : false} isAnimationActive={false} />)}
      </AreaChart>
    </ResponsiveContainer>
  </div>
}
