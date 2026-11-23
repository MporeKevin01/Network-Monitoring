import { formatTime } from './format.js'

export function latestResults(history) {
  const latest = new Map()
  for (const result of history) {
    if (!latest.has(result.deviceId)) latest.set(result.deviceId, result)
  }
  return latest
}

export function averageDuration(results) {
  const durations = results.filter(result => result.status === 'Online' && result.duration != null)
  return durations.length ? Math.round(durations.reduce((sum, result) => sum + result.duration, 0) / durations.length) : null
}

export function availability(results) {
  const known = results.filter(result => ['Online', 'Offline'].includes(result.status))
  return known.length ? Math.round(1000 * known.filter(result => result.status === 'Online').length / known.length) / 10 : null
}

export function availabilitySeries(history, range, now) {
  const size = (range === 24 ? 1 : 2) * 3600000
  return Array.from({ length: 24 }, (_, index) => {
    const start = now - (23 - index) * size
    const entries = history.filter(result => result.time > start - size && result.time <= start)
    return {
      label: formatTime(start),
      Demo: availability(entries.filter(result => result.source === 'Demo')),
      Measured: availability(entries.filter(result => result.source === 'Measured')),
      Simulated: availability(entries.filter(result => result.source === 'Simulated')),
    }
  })
}

export const sources = [
  { label: 'Demo', color: '#6493ff' },
  { label: 'Measured', color: '#33cbd6' },
  { label: 'Simulated', color: '#bc97ff' },
]
