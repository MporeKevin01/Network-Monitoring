export const deviceTypes = ['Router', 'Switch', 'Server', 'Website', 'Other']
export const sampleDevices = [
  { id: 'demo-router', name: 'Office Router', address: '192.168.1.1', type: 'Router', method: 'TCP', port: 443 },
  { id: 'demo-switch', name: 'Core Switch', address: '192.168.1.2', type: 'Switch', method: 'TCP', port: 22 },
  { id: 'demo-server', name: 'Web Server', address: 'example.com', type: 'Server', method: 'HTTP' },
  { id: 'demo-site', name: 'Company Website', address: 'https://example.com', type: 'Website', method: 'HTTP' },
  { id: 'demo-dns', name: 'DNS Service', address: '1.1.1.1', type: 'Other', method: 'TCP', port: 53 },
].map(device => ({ ...device, demo: true }))

export function sampleHistory(now = Date.now()) {
  return Array.from({ length: 48 }, (_, hour) => sampleDevices.map((device, index) => {
    const down = (index === 1 && (hour < 2 || hour % 11 === 0)) ||
      (index === 2 && hour >= 7 && hour <= 9) || (index === 4 && hour === 16)
    return {
      id: `sample-${hour}-${index}`, deviceId: device.id, name: device.name,
      time: now - hour * 3600000, source: 'Demo', status: down ? 'Offline' : 'Online',
      duration: down ? null : [12, 18, 83, 112, 24][index] + (hour * 17 + index * 7) % 21,
      httpStatus: device.method === 'HTTP' ? (down ? 503 : 200) : null,
      error: down ? 'Sample service outage' : '',
    }
  })).flat()
}
