import { useCallback, useEffect, useRef, useState } from 'react'
import { checkDevice } from '../services/monitoring.js'
import { historyLimit, loadState, saveState } from '../services/storage.js'
import { sampleDevices, sampleHistory } from '../data/sampleDevices.js'

export function useMonitoring() {
  const [state, setState] = useState(loadState)
  const [checking, setChecking] = useState([])
  const [running, setRunning] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const active = useRef(new Map())
  const batch = useRef(null)

  useEffect(() => {
    const saved = saveState(state)
    const timer = setTimeout(() => setStorageError(!saved), 0)
    return () => clearTimeout(timer)
  }, [state])

  useEffect(() => {
    const requests = active.current
    return () => {
      requests.forEach(controller => controller.abort())
      requests.clear()
      batch.current?.abort()
    }
  }, [])

  const run = useCallback(async device => {
    if (active.current.has(device.id)) return
    const controller = new AbortController()
    active.current.set(device.id, controller)
    setChecking(ids => [...ids, device.id])
    try {
      const result = await checkDevice(device, controller.signal)
      if (result && !controller.signal.aborted) {
        setState(current => ({
          ...current, history: [result, ...current.history].slice(0, historyLimit),
        }))
      }
    } finally {
      if (active.current.get(device.id) === controller) {
        active.current.delete(device.id)
        setChecking(ids => ids.filter(id => id !== device.id))
      }
    }
  }, [])

  const runAll = useCallback(async devices => {
    if (batch.current || !devices.length) return
    const controller = new AbortController()
    batch.current = controller
    setRunning(true)
    try {
      for (const device of devices) {
        if (controller.signal.aborted) break
        await run(device)
      }
    } finally {
      if (batch.current === controller) {
        batch.current = null
        setRunning(false)
      }
    }
  }, [run])

  const { devices, settings } = state
  useEffect(() => {
    if (!settings.interval || !devices.length) return
    const timer = setInterval(() => {
      if (!document.hidden) void runAll(devices)
    }, settings.interval * 1000)
    return () => clearInterval(timer)
  }, [devices, settings.interval, runAll])

  function stopDevice(id) {
    batch.current?.abort()
    active.current.get(id)?.abort()
    active.current.delete(id)
    setChecking(ids => ids.filter(value => value !== id))
  }

  function save(device, id) {
    if (id) stopDevice(id)
    const target = { ...device, id: id || crypto.randomUUID() }
    setState(current => {
      const previous = current.devices.find(item => item.id === id)
      const changed = previous && ['address', 'method', 'port'].some(key => previous[key] !== target[key])
      return {
        ...current,
        devices: id ? current.devices.map(item => item.id === id ? { ...target, demo: item.demo } : item) : [...current.devices, target],
        history: changed ? current.history.filter(item => item.deviceId !== id) :
          current.history.map(item => item.deviceId === id ? { ...item, name: target.name } : item),
      }
    })
  }

  function remove(id) {
    stopDevice(id)
    setState(current => ({
      ...current, devices: current.devices.filter(device => device.id !== id),
      history: current.history.filter(item => item.deviceId !== id),
    }))
  }

  function clearDemo() {
    devices.filter(device => device.demo).forEach(device => stopDevice(device.id))
    setState(current => {
      const demoIds = new Set(current.devices.filter(device => device.demo).map(device => device.id))
      return {
        ...current, devices: current.devices.filter(device => !device.demo),
        history: current.history.filter(item => !demoIds.has(item.deviceId) && item.source !== 'Demo'),
      }
    })
  }

  function restoreDemo() {
    const now = Date.now()
    setState(current => {
      const missing = sampleDevices.filter(device => !current.devices.some(item => item.id === device.id))
      const ids = new Set(missing.map(device => device.id))
      return {
        ...current, devices: [...current.devices, ...missing],
        history: [...current.history, ...sampleHistory(now).filter(item => ids.has(item.deviceId))]
          .sort((a, b) => b.time - a.time).slice(0, historyLimit),
      }
    })
  }

  function updateSettings(patch) {
    setState(current => ({ ...current, settings: { ...current.settings, ...patch } }))
  }

  return { ...state, checking, running, storageError, run, runAll, save, remove, clearDemo, restoreDemo, updateSettings }
}
