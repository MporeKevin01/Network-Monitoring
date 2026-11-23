import { deviceTypes } from '../data/sampleDevices.js'

export function httpUrl(address) {
  return new URL(address.includes('://') ? address : `https://${address}`)
}

export function validateDevice(values) {
  const errors = {}
  const name = values.name.trim()
  const address = values.address.trim()
  if (!name || name.length > 80) errors.name = 'Enter a device name of 1–80 characters.'
  if (!deviceTypes.includes(values.type)) errors.type = 'Choose a device type.'
  if (!['HTTP', 'TCP'].includes(values.method)) errors.method = 'Choose HTTP or TCP.'
  if (!address || address.length > 2048 || /[\s\\]/.test(address)) {
    errors.address = 'Enter a valid hostname, IP address or HTTP(S) URL.'
  } else {
    try {
      const tcp = values.method === 'TCP'
      const host = tcp && address.includes(':') && !address.startsWith('[') ? `[${address}]` : address
      if (tcp && !/^(?:\[[0-9a-f:.]+\]|[a-z0-9.-]+)$/i.test(host)) throw new Error()
      const url = httpUrl(host)
      const validHost = url.hostname.startsWith('[') || url.hostname.replace(/\.$/, '').split('.').every(
        label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label),
      )
      if (!validHost || !['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
          (!tcp && !/^(?:https?:\/\/)?[^/?#]+/i.test(address))) throw new Error()
    } catch {
      errors.address = values.method === 'TCP'
        ? 'Enter a hostname or IP address. Use the separate port field.'
        : 'Enter a hostname, IPv4 address, bracketed IPv6 address or HTTP(S) URL without credentials.'
    }
  }
  const port = Number(values.port)
  if (values.method === 'TCP' && (!/^\d+$/.test(String(values.port)) || port < 1 || port > 65535)) {
    errors.port = 'Enter a whole-number port from 1 to 65535.'
  }
  return { errors, device: { name, address, type: values.type, method: values.method, port: values.method === 'TCP' ? port : null } }
}

export async function checkDevice(device, signal) {
  const base = { id: crypto.randomUUID(), deviceId: device.id, name: device.name, httpStatus: null, error: '' }
  const result = (source, status, duration, extra = {}) => ({
    ...base, time: Date.now(), source, status, duration, ...extra,
  })
  if (device.method === 'TCP') {
    // Standard web pages have no API for opening an arbitrary TCP socket.
    const online = Math.random() >= 0.15
    return result('Simulated', online ? 'Online' : 'Offline', online ? 8 + Math.floor(Math.random() * 56) : null, {
      error: online ? '' : 'Simulated port connection failure.',
    })
  }

  const timeout = AbortSignal.timeout(5000)
  const start = performance.now()
  const elapsed = () => Math.round(performance.now() - start)
  try {
    const response = await fetch(httpUrl(device.address), {
      method: 'HEAD', mode: 'cors', cache: 'no-store', credentials: 'omit',
      signal: AbortSignal.any([timeout, signal]),
    })
    // A readable 4xx/5xx confirms reachability, but the HTTP check failed.
    return result('Measured', response.ok ? 'Online' : 'Offline', elapsed(), {
      httpStatus: response.status,
      error: response.ok ? '' : `HTTP ${response.status} from the service. Check the endpoint and HEAD support.`,
    })
  } catch {
    if (signal.aborted) return null
    // Fetch intentionally hides the distinction between CORS and many network errors.
    return result('HTTP attempt', 'Unknown', elapsed(), {
      error: timeout.aborted
        ? 'Timed out after 5 seconds. The service status could not be verified.'
        : 'The browser could not read a response. Check CORS, HTTPS, DNS, and network access.',
    })
  }
}
