import { sampleDevices, sampleHistory } from '../data/sampleDevices.js'

const key = 'netwatch-v1'
export const historyLimit = 500

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(key))
    if (Array.isArray(saved?.devices) && Array.isArray(saved?.history)) return saved
  } catch {
    // The dashboard can still run when storage is unavailable or corrupted.
  }
  return {
    devices: sampleDevices, history: sampleHistory(),
    settings: { theme: 'dark', interval: 0 },
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(key, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}
