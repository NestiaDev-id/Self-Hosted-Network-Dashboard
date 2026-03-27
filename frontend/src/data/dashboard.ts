import type { Device, ISPInfo, LogEntry, NetworkStats } from '../types/dashboard'

export const ISP_INFO: ISPInfo = {
  provider: 'Telkom Indonesia (IndiHome)',
  ip: '36.85.122.44',
  location: 'Jakarta, Indonesia',
  type: 'Fiber Optic',
  securityStatus: 'optimal',
}

export const INITIAL_DEVICES: Device[] = [
  { id: '1', name: 'MacBook Pro 16', type: 'laptop', ip: '192.168.100.12', status: 'online', bandwidth: 12.5 },
  { id: '2', name: 'iPhone 15 Pro', type: 'phone', ip: '192.168.100.45', status: 'online', bandwidth: 4.2 },
  { id: '3', name: 'Gaming Rig', type: 'desktop', ip: '192.168.100.7', status: 'online', bandwidth: 25.8 },
  { id: '4', name: 'iPad Air', type: 'phone', ip: '192.168.100.22', status: 'offline', bandwidth: 0 },
]

export const generateInitialData = (): NetworkStats[] => {
  const data: NetworkStats[] = []
  const now = new Date()
  for (let i = 20; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3000)
    data.push({
      download: Math.floor(Math.random() * 40) + 10,
      upload: Math.floor(Math.random() * 10) + 2,
      totalReceived: '1.2 TB',
      timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    })
  }
  return data
}

export const createLogEntry = (message: string, type: LogEntry['type']): LogEntry => ({
  id: Math.random().toString(36).slice(2, 11),
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  message,
  type,
})
