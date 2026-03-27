export interface NetworkStats {
  download: number
  upload: number
  totalReceived: string
  timestamp: string
}

export interface ISPInfo {
  provider: string
  ip: string
  location: string
  type: string
  securityStatus: 'optimal' | 'warning' | 'alert'
}

export interface Device {
  id: string
  name: string
  type: 'laptop' | 'phone' | 'desktop'
  ip: string
  status: 'online' | 'offline'
  bandwidth: number
}

export interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
}

export interface ConfirmAction {
  label: string
  title: string
  desc: string
}
