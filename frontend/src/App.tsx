import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Toaster, toast } from 'sonner'
import { INITIAL_DEVICES, ISP_INFO, createLogEntry, generateInitialData } from './data/dashboard'
import type { ConfirmAction, Device, ISPInfo, LogEntry, NetworkStats } from './types/dashboard'
import { DashboardHeader } from './components/dashboard/layout/DashboardHeader'
import { ActionModal } from './components/dashboard/modals/ActionModal'
import { SettingsModal } from './components/dashboard/modals/SettingsModal'
import { DevicesSection } from './components/dashboard/sections/DevicesSection'
import { QuickActionsSection } from './components/dashboard/sections/QuickActionsSection'
import { SystemMetricsSection } from './components/dashboard/sections/SystemMetricsSection'
import { TerminalLogsSection } from './components/dashboard/sections/TerminalLogsSection'
import { TopStatsSection } from './components/dashboard/sections/TopStatsSection'
import { TrafficChartSection } from './components/dashboard/sections/TrafficChartSection'

function App() {
  const [stats, setStats] = useState<NetworkStats[]>(generateInitialData())
  const [isConnected] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [ispInfo, setIspInfo] = useState<ISPInfo>({ ...ISP_INFO, securityStatus: 'optimal' })
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES)
  const [cpuLoad, setCpuLoad] = useState(12.4)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    createLogEntry('System Boot Sequence Complete', 'success'),
    createLogEntry('Connected to Huawei Router Gateway (192.168.100.1)', 'info'),
  ])
  const terminalRef = useRef<HTMLDivElement>(null)

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

      <DashboardHeader
        isConnected={isConnected}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-3">
            <TopStatsSection ispInfo={ispInfo} currentStats={currentStats} healthScore={healthScore} />
            <TrafficChartSection stats={stats} />
            <SystemMetricsSection cpuLoad={cpuLoad} />
            <TerminalLogsSection terminalRef={terminalRef} logs={logs} onClearLogs={() => setLogs([])} />
          </div>

          <div className="space-y-6">
            <DevicesSection devices={devices} />
            <QuickActionsSection onAction={handleAction} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
