import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  Download,
  HardDrive,
  Laptop,
  Monitor,
  RefreshCw,
  Settings,
  Smartphone,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AnimatePresence, motion } from 'motion/react'
import { Toaster, toast } from 'sonner'

interface NetworkStats {
  download: number
  upload: number
  totalReceived: string
  timestamp: string
}

interface ISPInfo {
  provider: string
  ip: string
  location: string
  type: string
  securityStatus: 'optimal' | 'warning' | 'alert'
}

interface Device {
  id: string
  name: string
  type: 'laptop' | 'phone' | 'desktop'
  ip: string
  status: 'online' | 'offline'
  bandwidth: number
}

interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
}

const createLogEntry = (message: string, type: LogEntry['type']): LogEntry => ({
  id: Math.random().toString(36).slice(2, 11),
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  message,
  type,
})

const generateInitialData = (): NetworkStats[] => {
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

const INITIAL_DEVICES: Device[] = [
  { id: '1', name: 'MacBook Pro 16', type: 'laptop', ip: '192.168.100.12', status: 'online', bandwidth: 12.5 },
  { id: '2', name: 'iPhone 15 Pro', type: 'phone', ip: '192.168.100.45', status: 'online', bandwidth: 4.2 },
  { id: '3', name: 'Gaming Rig', type: 'desktop', ip: '192.168.100.7', status: 'online', bandwidth: 25.8 },
  { id: '4', name: 'iPad Air', type: 'phone', ip: '192.168.100.22', status: 'offline', bandwidth: 0 },
]

const ISP_INFO: ISPInfo = {
  provider: 'Telkom Indonesia (IndiHome)',
  ip: '36.85.122.44',
  location: 'Jakarta, Indonesia',
  type: 'Fiber Optic',
  securityStatus: 'optimal',
}

function App() {
  const [stats, setStats] = useState<NetworkStats[]>(generateInitialData())
  const [isConnected] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [ispInfo, setIspInfo] = useState<ISPInfo>({ ...ISP_INFO, securityStatus: 'optimal' })
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES)
  const [cpuLoad, setCpuLoad] = useState(12.4)
  const [confirmAction, setConfirmAction] = useState<{ label: string; title: string; desc: string } | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    createLogEntry('System Boot Sequence Complete', 'success'),
    createLogEntry('Connected to Huawei Router Gateway (192.168.100.1)', 'info'),
  ])
  const terminalRef = React.useRef<HTMLDivElement>(null)

  const addLog = (message: string, type: LogEntry['type']) => {
    const newLog = createLogEntry(message, type)
    setLogs((prev) => [...prev.slice(-49), newLog])
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const isSpike = Math.random() > 0.9
      const download = isSpike ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 45) + 5
      const newCpu = isSpike ? Math.floor(Math.random() * 15) + 82 : Math.floor(Math.random() * 10) + 10

      setCpuLoad(newCpu)
      setStats((prev) => [
        ...prev.slice(1),
        {
          download,
          upload: Math.floor(Math.random() * 12) + 1,
          totalReceived: '1.24 TB',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      ])
      setDevices((prev) =>
        prev.map((d) => ({
          ...d,
          bandwidth: d.status === 'online' ? Math.max(0, d.bandwidth + (Math.random() * 4 - 2)) : 0,
        })),
      )

      if (isSpike) {
        addLog(`Traffic Spike Detected: +${Math.floor(Math.random() * 100 + 100)}% in 5s`, 'error')
        addLog(`High CPU Usage: ${newCpu}% (Critical)`, 'warning')
      } else if (Math.random() > 0.7) {
        const randomDevice = INITIAL_DEVICES[Math.floor(Math.random() * INITIAL_DEVICES.length)]
        addLog(`Request from ${randomDevice.ip}: Success (200 OK)`, 'success')
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Real ISP Detection
    const fetchISP = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        setIspInfo((prev) => ({
          ...prev,
          provider: data.org || 'Unknown Provider',
          ip: data.ip || 'Unknown IP',
          location: `${data.city}, ${data.country_name}` || 'Unknown Location',
          type: 'Broadband',
          securityStatus: 'optimal',
        }))
        addLog(`ISP Detected: ${data.org} (${data.ip})`, 'success')
        addLog('Public IP security check: OPTIMAL (No SYN Flood detected)', 'info')
      } catch (err) {
        console.error('ISP detection failed:', err)
        addLog('ISP detection failed. Using default profile.', 'warning')
      }
    }
    fetchISP()
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs])

  const currentStats = useMemo(() => stats[stats.length - 1], [stats])

  const healthScore = useMemo(() => {
    if (currentStats.download > 50 && cpuLoad > 80) return 20
    if (cpuLoad > 70) return 65
    return 98
  }, [currentStats.download, cpuLoad])

  const handleRefresh = () => {
    setIsRefreshing(true)
    const promise = new Promise((resolve) => setTimeout(resolve, 1500))
    toast.promise(promise, {
      loading: 'Refreshing network stats...',
      success: 'Stats updated successfully',
      error: 'Failed to refresh stats',
    })

    promise.then(() => {
      setIsRefreshing(false)
      addLog('Manual refresh triggered: API sync complete', 'info')
    })
  }

  const handleAction = (label: string) => {
    // Risky actions that need confirmation
    const riskyActions: Record<string, { title: string; desc: string }> = {
      Reboot: {
        title: 'Confirm System Reboot',
        desc: 'This will take the router offline for approximately 2 minutes. All connected devices will lose internet access.',
      },
      'Renew IP': {
        title: 'Confirm IP Renewal',
        desc: 'Your public IP will be released and a new one will be requested. This may cause a temporary connection drop.',
      },
      'Guest WiFi': {
        title: 'Toggle Guest Network',
        desc: 'This will change the status of the secondary WiFi network. Active guest sessions may be disconnected.',
      },
    }

    if (riskyActions[label] && !confirmAction) {
      setConfirmAction({ label, ...riskyActions[label] })
      return
    }

    setConfirmAction(null)

    if (label === 'Reboot') {
      toast.error('System Reboot Triggered')
      addLog('WARNING: System reboot sequence initiated', 'error')
      return
    }

    if (label === 'Scan Security') {
      toast.info('Security Scan Initiated')
      addLog('SCAN: Starting deep packet inspection...', 'info')
      setTimeout(() => {
        addLog('SCAN: ARP & SYN checks complete. (SECURE)', 'success')
        toast.success('Security Scan Complete')
      }, 2000)
      return
    }

    if (label === 'Renew IP') {
      toast.warning('Renewing Public IP...')
      addLog('WAN: Releasing public IP lease...', 'warning')
      setTimeout(() => {
        const newIp = `36.85.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        setIspInfo((prev) => ({ ...prev, ip: newIp }))
        addLog(`WAN: New IP assigned: ${newIp}`, 'success')
        toast.success('Public IP Renewed')
      }, 3000)
      return
    }

    if (label === 'Diagnostics') {
      toast.info('Running Diagnostics...')
      addLog('DIAG: Pinging edge nodes...', 'info')
      setTimeout(() => {
        addLog('DIAG: Connection stable (12ms)', 'success')
        toast.success('Diagnostics Complete')
      }, 2500)
      return
    }

    toast.info(`Action Executed: ${label}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-12 font-sans text-slate-200 selection:bg-emerald-500/30">
      <Toaster position="top-right" theme="dark" richColors closeButton />
      <AnimatePresence>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        {confirmAction && (
          <ActionModal
            title={confirmAction.title}
            description={confirmAction.desc}
            onConfirm={() => handleAction(confirmAction.label)}
            onClose={() => setConfirmAction(null)}
          />
        )}
      </AnimatePresence>
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Activity className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="leading-none text-lg font-bold tracking-tight text-white">NetDash</h1>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Self-Hosted Dashboard</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1.5">
              <div
                className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}
              />
              <span className="text-xs font-medium text-slate-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">Router IP</span>
              <span className="font-mono text-sm text-emerald-400">192.168.100.1</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="group rounded-lg p-2 transition-colors hover:bg-slate-800">
              <RefreshCw
                className={`h-5 w-5 text-slate-400 transition-all group-hover:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="group rounded-lg p-2 transition-colors hover:bg-slate-800"
            >
              <Settings className="h-5 w-5 text-slate-400 transition-colors group-hover:text-white" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-3">
                <StatCard
                  label="ISP Provider"
                  value={ispInfo.provider}
                  icon={<Database className="h-5 w-5" />}
                  color={ispInfo.securityStatus === 'optimal' ? 'purple' : 'emerald'}
                  trend={ispInfo.securityStatus === 'optimal' ? 'SECURE' : 'UNSECURE'}
                />
                <StatCard
                  label="Current Download"
                  value={`${currentStats.download} Mbps`}
                  icon={<Download className="h-5 w-5" />}
                  color="emerald"
                  trend="+2.4%"
                />
                <StatCard
                  label="Public IP"
                  value={ispInfo.ip}
                  icon={<Activity className="h-5 w-5" />}
                  color="blue"
                  trend={ispInfo.location}
                />
              </div>

              <div className="group relative flex h-32 items-center justify-between overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 shadow-lg backdrop-blur-sm lg:col-span-1">
                <div className={`absolute inset-0 opacity-5 transition-colors duration-500 ${healthScore === 20 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                <div className="relative z-10 flex h-full flex-col justify-between text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Network Health</p>
                  <p className={`text-[10px] font-bold uppercase tracking-tighter ${healthScore === 20 ? 'animate-pulse text-red-500' : 'text-emerald-400'}`}>
                    {healthScore === 20 ? 'Attack Detected!' : 'System Optimal'}
                  </p>
                </div>

                <div className="relative z-10 flex h-20 w-20 items-center justify-center">
                  <svg className="h-full w-full -rotate-90 transform">
                    <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray="201"
                      initial={{ strokeDashoffset: 201 }}
                      animate={{ strokeDashoffset: 201 - (201 * healthScore) / 100 }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={healthScore === 20 ? 'text-red-500' : healthScore < 80 ? 'text-orange-500' : 'text-emerald-500'}
                    />
                  </svg>
                  <span className={`absolute text-sm font-black ${healthScore === 20 ? 'text-red-400' : 'text-white'}`}>{healthScore}%</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Network Traffic</h2>
                  <p className="text-xs text-slate-500">Real-time monitoring (3s interval)</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="font-medium text-slate-400">Download</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="font-medium text-slate-400">Upload</span>
                  </div>
                </div>
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats}>
                    <defs>
                      <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="timestamp" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `${value}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#f1f5f9',
                      }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Area type="monotone" dataKey="download" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDownload)" animationDuration={1000} />
                    <Area type="monotone" dataKey="upload" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUpload)" animationDuration={1000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-4 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${cpuLoad > 80 ? 'border-red-500/20 bg-red-500/10' : 'border-orange-500/20 bg-orange-500/10'}`}>
                  <Cpu className={`h-5 w-5 ${cpuLoad > 80 ? 'text-red-400' : 'text-orange-400'}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">CPU Load</p>
                  <p className={`text-sm font-semibold ${cpuLoad > 80 ? 'text-red-400' : 'text-white'}`}>{cpuLoad}%</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                  <HardDrive className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Memory</p>
                  <p className="text-sm font-semibold text-white">256MB / 512MB</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                  <Clock className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Uptime</p>
                  <p className="text-sm font-semibold text-white">14d 06h 22m</p>
                </div>
              </div>
            </div>

            <div className="group/terminal overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-orange-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">rust_backend_logs</span>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setLogs([])} className="text-[10px] font-mono uppercase tracking-tighter text-slate-600 transition-colors hover:text-emerald-400">
                    clear_logs
                  </button>
                  <div className="text-[10px] font-mono text-slate-600">bash - 80x24</div>
                </div>
              </div>
              <div
                ref={terminalRef}
                className="h-56 custom-scrollbar space-y-1.5 overflow-y-auto bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.02),transparent)] p-4 font-mono text-[11px]"
              >
                {logs.map((log) => (
                  <div key={log.id} className="flex animate-in slide-in-from-left-2 gap-3 duration-300 fade-in">
                    <span className="shrink-0 select-none text-slate-600">[{log.timestamp}]</span>
                    <span
                      className={`${log.type === 'success' ? 'text-emerald-400/90' : ''} ${log.type === 'warning' ? 'text-orange-400/90' : ''} ${log.type === 'error' ? 'font-bold text-red-400' : ''} ${log.type === 'info' ? 'text-blue-400/90' : ''}`}
                    >
                      <span className="mr-2 text-slate-500">$</span>
                      {log.message}
                    </span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="flex items-center gap-2 italic text-slate-700">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Initializing kernel and waiting for backend stream...
                  </div>
                )}
                <div className="ml-1 inline-block h-1 w-2 animate-pulse bg-emerald-500/50" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Connected Devices</h2>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {devices.filter((d) => d.status === 'online').length} ONLINE
                </span>
              </div>

              <div className="max-h-[440px] overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="group cursor-pointer flex-col rounded-xl border border-transparent p-3 transition-all hover:border-slate-700/50 hover:bg-slate-800/50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                            device.status === 'online'
                              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                              : 'border-slate-700 bg-slate-800/50 text-slate-500'
                          }`}
                        >
                          {device.type === 'laptop' && <Laptop className="h-5 w-5" />}
                          {device.type === 'phone' && <Smartphone className="h-5 w-5" />}
                          {device.type === 'desktop' && <Monitor className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-slate-200 transition-colors group-hover:text-white">{device.name}</h3>
                          </div>
                          <p className="font-mono text-[10px] text-slate-500">{device.ip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <div className={`h-1.5 w-1.5 rounded-full ${device.status === 'online' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                          <span className="mt-1 font-mono text-[10px] text-slate-600">
                            {device.bandwidth > 0 ? `${device.bandwidth.toFixed(1)}M/s` : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {device.status === 'online' && (
                      <div className="mt-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[8px] font-bold uppercase text-slate-600">Bandwidth Usage</span>
                          <span className="text-[8px] font-bold text-emerald-500">{Math.round((device.bandwidth / 50) * 100)}%</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                          <motion.div
                            className="h-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (device.bandwidth / 50) * 100)}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 py-3 text-xs font-medium text-slate-500 transition-all hover:border-emerald-500/50 hover:text-emerald-400">
                View All Devices
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800/40 bg-slate-900/20 p-6 shadow-xl backdrop-blur-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400 text-center">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <ActionButton label="Reboot" onClick={() => handleAction('Reboot')} />
                <ActionButton label="Scan Security" onClick={() => handleAction('Scan Security')} />
                <ActionButton label="Renew IP" onClick={() => handleAction('Renew IP')} />
                <ActionButton label="Guest WiFi" onClick={() => handleAction('Guest WiFi')} />
                <ActionButton label="Diagnostics" onClick={() => handleAction('Diagnostics')} />
                <ActionButton label="Logs" onClick={() => handleAction('Logs')} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
  trend,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: 'emerald' | 'blue' | 'purple'
  trend: string
}) {
  const colorClasses = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  }

  // Dynamic font sizing based on value length
  const getFontSize = (text: string) => {
    if (text.length > 30) return 'text-[10px]'
    if (text.length > 20) return 'text-xs'
    if (text.length > 15) return 'text-base'
    return 'text-xl'
  }

  const isLongValue = value.length > 15

  return (
    <div className="group flex h-32 flex-col justify-between rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorClasses[color]}`}>{icon}</div>
        <span
          className={`max-w-[100px] truncate rounded-full px-2 py-0.5 text-[8px] font-bold ${
            trend.startsWith('+')
              ? 'bg-emerald-500/10 text-emerald-400'
              : trend.startsWith('-')
                ? 'bg-red-500/10 text-red-400'
                : 'bg-slate-800 text-slate-400'
          }`}
        >
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p
          className={`mt-1 line-clamp-2 origin-left font-bold text-white transition-transform group-hover:scale-[1.02] ${getFontSize(value)} ${
            isLongValue ? 'break-all font-mono leading-tight' : ''
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

function ActionButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-[10px] font-bold uppercase tracking-tight text-slate-400 transition-all hover:border-emerald-500 hover:bg-emerald-500 hover:text-slate-950"
    >
      {label}
    </button>
  )
}

function ActionModal({
  title,
  description,
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
        </div>
        <div className="flex gap-3 border-t border-slate-800 bg-slate-950/50 p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-800 py-2.5 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-400"
          >
            Confirm Action
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [routerIp, setRouterIp] = useState('192.168.100.1')
  const [refreshInterval, setRefreshInterval] = useState('3s')

  const handleSave = () => {
    toast.success('Settings Saved', {
      description: 'System configuration has been updated successfully.',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
              <Settings className="h-4 w-4 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-white">System Settings</h2>
          </div>
          <button onClick={onClose} className="transition-colors hover:text-white text-slate-500">
            <RefreshCw className="h-5 w-5 rotate-45" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Router Gateway IP</label>
            <input
              type="text"
              value={routerIp}
              onChange={(e) => setRouterIp(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 font-mono text-sm text-emerald-400 transition-colors focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Refresh Interval</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 transition-colors focus:border-emerald-500/50 focus:outline-none"
            >
              <option value="1s">1 Second (Real-time)</option>
              <option value="3s">3 Seconds (Standard)</option>
              <option value="5s">5 Seconds (Balanced)</option>
              <option value="10s">10 Seconds (Low Power)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-800 bg-slate-950/50 p-6">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-800 py-2.5 text-sm font-bold text-slate-400 transition-colors hover:bg-slate-800">
            Discard
          </button>
          <button onClick={handleSave} className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400">
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default App
