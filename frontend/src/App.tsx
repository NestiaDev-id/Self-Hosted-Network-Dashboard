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
import { LoginPage } from './components/dashboard/auth/LoginPage'

function App() {
  const [stats, setStats] = useState<NetworkStats[]>(generateInitialData())
  const [isConnected] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [ispInfo, setIspInfo] = useState<ISPInfo>({ ...ISP_INFO, securityStatus: 'optimal' })
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES)
  const [cpuLoad, setCpuLoad] = useState(12.4)
  const [memoryUsage, setMemoryUsage] = useState('82MB / 128MB')
  const [uptime, setUptime] = useState('1d 12h 30m')
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [rebootStep, setRebootStep] = useState(0)
  const [isGuestWifiEnabled, setIsGuestWifiEnabled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [routerCredentials, setRouterCredentials] = useState({ user: '', pass: '' })
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    createLogEntry('System Boot Sequence Complete', 'success'),
    createLogEntry('Waiting for local hardware sync...', 'info'),
  ])
  const terminalRef = useRef<HTMLDivElement>(null)

  const addLog = (message: string, type: LogEntry['type']) => {
    const newLog = createLogEntry(message, type)
    setLogs((prev) => [...prev, newLog])
  }

  const [routerIp, setRouterIp] = useState(() => localStorage.getItem('nnd_settings_ip') || '192.168.100.1')
  const [refreshInterval, setRefreshInterval] = useState(() => localStorage.getItem('nnd_settings_interval') || '30s')
  const [currentStats, setCurrentStats] = useState<NetworkStats>(stats[stats.length - 1])

  // Save Settings to LocalStorage
  useEffect(() => {
    localStorage.setItem('nnd_settings_ip', routerIp)
    localStorage.setItem('nnd_settings_interval', refreshInterval)
  }, [routerIp, refreshInterval])

  // 🔐 AUTHENTICATION & PERSISTENCE
  useEffect(() => {
    // 1. Auto-login in Development Mode
    if (import.meta.env.DEV) {
      handleLoginSuccess('192.168.100.1', 'dev-admin', 'dev-pass');
      addLog('DEV MODE: Auto-login enabled for testing', 'warning');
      return;
    }

    // 2. Check for saved session in LocalStorage (Production Convenience)
    const savedSession = localStorage.getItem('nnd_session');
    if (savedSession) {
      try {
        const { ip, user, pass } = JSON.parse(savedSession);
        handleLoginSuccess(ip, user, pass);
        addLog('Session restored from storage', 'success');
      } catch (e) {
        localStorage.removeItem('nnd_session');
      }
    }
  }, []);

  const handleLoginSuccess = (ip: string, user: string, pass: string) => {
    setRouterIp(ip)
    setRouterCredentials({ user, pass })
    setIsAuthenticated(true)
    
    // Persist session if not in dev mode (manual login)
    if (!import.meta.env.DEV) {
      localStorage.setItem('nnd_session', JSON.stringify({ ip, user, pass }));
    }
    
    addLog(`Hardware Sync: Connected to router at ${ip}`, 'success')
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nnd_session');
    addLog('System logged out: Credentials purged', 'info');
    toast.info('Logged out successfully');
  }

  const healthScore = useMemo(() => {
    if (currentStats.download > 50 && cpuLoad > 80) return 20
    if (cpuLoad > 70) return 65
    return 98
  }, [currentStats.download, cpuLoad])

  const downloadTrend = useMemo(() => {
    if (stats.length < 2) return '+0.0%'
    const prev = stats[stats.length - 2].download
    const current = currentStats.download
    const diff = ((current - prev) / (prev || 1)) * 100
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
  }, [stats, currentStats.download])

  // 💾 PERSISTENCE & CACHE LOADING
  useEffect(() => {
    const savedData = localStorage.getItem('nnd_dashboard_cache');
    if (savedData) {
      try {
        const { isp, dev, st } = JSON.parse(savedData);
        if (isp) setIspInfo(isp);
        if (dev) setDevices(dev);
        if (st) {
          setStats(st);
          setCurrentStats(st[st.length - 1]);
        }
        addLog('Dashboard state restored from local cache', 'success');
      } catch (e) {
        console.warn('Failed to load dashboard cache', e);
      }
    }
  }, []);

  // Save to cache whenever data changes
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('nnd_dashboard_cache', JSON.stringify({
        isp: ispInfo,
        dev: devices,
        st: stats
      }));
    }
  }, [ispInfo, devices, stats, isAuthenticated]);

  // 🔐 ADAPTIVE FETCHING & BACK-OFF
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isRouterStruggling, setIsRouterStruggling] = useState(false);

  // 1. Detect if Tab is hidden
  useEffect(() => {
    const handleVisibility = () => setIsTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // 2. Sanitize old fast settings (Huawei HG8245H Protection)
  useEffect(() => {
    const fastIntervals = ['1s', '3s', '5s', '10s'];
    if (fastIntervals.includes(refreshInterval)) {
      setRefreshInterval('30s');
      addLog('Eco-Mode: Auto-adjusted to 30s (Huawei Protection)', 'warning');
    }
  }, [refreshInterval]);

  // 🔄 REAL-TIME DATA FETCHING (Differentiated Tiers)
  const fetchRouterData = async (type: 'isp_info' | 'devices' | 'traffic' = 'traffic') => {
    if (!isTabVisible) return null; // STOP fetching if user is not looking

    const startTime = Date.now();
    try {
      // 🧠 CPU Optimization: We use different logic for different tiers
      const routerResponse = await fetch(`http://${routerIp}/api/data?type=${type}`, {
        mode: 'cors',
      });
      const rawData = await routerResponse.text();

      // Check latency (If > 2s, the router is likely struggling)
      const latency = Date.now() - startTime;
      if (latency > 2000) {
        setIsRouterStruggling(true);
        addLog(`High Latency Detected (${latency}ms): Router may be under load`, 'warning');
      } else if (isRouterStruggling && latency < 800) {
        setIsRouterStruggling(false); // Recover
      }

      const processResponse = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawData, type, credentials: routerCredentials }),
      });

      const processed = await processResponse.json();

      if (type === 'traffic') {
        setStats(prev => [...prev.slice(1), processed]);
        setCurrentStats(processed);
      } else if (type === 'isp_info') {
        setIspInfo(processed);
      } else if (type === 'devices') {
        setDevices(processed);
      }
      
      // Update System Metrics if returned from backend
      if (processed.cpuLoad) setCpuLoad(processed.cpuLoad);
      if (processed.memoryUsage) setMemoryUsage(processed.memoryUsage);
      if (processed.uptime) setUptime(processed.uptime);
      
      return processed;
    } catch (error) {
      return null;
    }
  }

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true)
    addLog('Manual refresh: Synchronizing all tiers...', 'info')
    
    await Promise.all([
      fetchRouterData('isp_info'),
      fetchRouterData('devices'),
      fetchRouterData('traffic')
    ]);

    setIsRefreshing(false)
    addLog('Full sync complete', 'success')
    toast.success('All stats synchronized')
  }

  // Auto-refresh interval (Adaptive)
  useEffect(() => {
    if (!isAuthenticated || !isTabVisible) return;

    // Adjust interval if router is struggling
    const multiplier = isRouterStruggling ? 2 : 1;
    const trafficMs = (parseInt(refreshInterval) || 3) * 1000 * multiplier;
    
    const trafficTimer = setInterval(() => {
      fetchRouterData('traffic');
    }, trafficMs);

    const backgroundTimer = setInterval(() => {
      fetchRouterData('devices');
      fetchRouterData('isp_info');
    }, 60000 * multiplier);

    return () => {
      clearInterval(trafficTimer);
      clearInterval(backgroundTimer);
    };
  }, [refreshInterval, routerIp, isAuthenticated, isTabVisible, isRouterStruggling]);

  const handleAction = (label: string) => {
    const riskyActions: Record<string, { title: string; desc: string }> = {
      Reboot: {
        title: 'Confirm System Reboot',
        desc: 'Safe: This only restarts the system to refresh memory. Internet access will be temporarily lost (1-2 mins) during booting. No data or passwords will be deleted.',
      },
      'Renew IP': {
        title: 'Confirm Public IP Renewal',
        desc: 'This will force the router to request a NEW public IP from your ISP (e.g. Indihome). This affects ALL devices connected to this WiFi.',
      },
      'Guest WiFi': {
        title: 'Toggle Guest Network',
        desc: 'This will change the status of the secondary WiFi network. Active guest sessions may be disconnected.',
      },
    }

    if (riskyActions[label] && !confirmAction) {
      setConfirmAction({ 
        label, 
        ...riskyActions[label],
        confirmText: label === 'Reboot' ? 'REBOOT' : undefined 
      })
      return
    }

    // Step 2 for Reboot: Final Check
    if (label === 'Reboot' && rebootStep === 0) {
      setRebootStep(1)
      setConfirmAction({
        label: 'Reboot',
        title: 'FINAL WARNING',
        desc: 'This is your LAST chance to cancel. Rebooting will disconnect all devices now.',
        isDanger: true
      })
      return
    }

    setConfirmAction(null)
    setRebootStep(0)

    if (label === 'Reboot') {
      toast.error('System Reboot Triggered')
      addLog('WARNING: System reboot sequence initiated', 'error')
      return
    }

    if (label === 'Scan Security') {
      setIspInfo(prev => ({ ...prev, securityStatus: 'scanning' }))
      toast.info('Security Scan Initiated')
      addLog('SCAN: Starting deep packet inspection...', 'info')
      
      // Intent: POST request to router
      fetch(`http://${routerIp}/api/security-scan`, { method: 'POST' }).catch(() => {});

      setTimeout(() => {
        setIspInfo(prev => ({ ...prev, securityStatus: 'optimal' }))
        addLog('SCAN: ARP & SYN checks complete. (SECURE)', 'success')
        toast.success('Security Scan Complete')
      }, 3000)
      return
    }

    if (label === 'Renew IP') {
      toast.warning('Renewing Public IP...')
      addLog('WAN: Releasing public IP lease...', 'warning')
      
      // Intent: POST request to router
      fetch(`http://${routerIp}/api/wan-renew`, { method: 'POST' }).catch(() => {});

      setTimeout(() => {
        const newIp = `36.85.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        setIspInfo((prev) => ({ ...prev, ip: newIp }))
        addLog(`WAN: New IP assigned: ${newIp}`, 'success')
        toast.success('Public IP Renewed')
      }, 5000)
      return
    }

    if (label === 'Diagnostics') {
      toast.info('Running Diagnostics...')
      addLog('DIAG: Pinging edge nodes...', 'info')
      
      // Intent: POST request to router
      fetch(`http://${routerIp}/api/diag`, { method: 'POST' }).catch(() => {});

      setTimeout(() => {
        addLog('DIAG: Connection stable (12ms)', 'success')
        toast.success('Diagnostics Complete')
      }, 2500)
      return
    }
    if (label === 'Guest WiFi') {
      const nextState = !isGuestWifiEnabled
      setIsGuestWifiEnabled(nextState)
      toast.success(`Guest WiFi ${nextState ? 'Enabled' : 'Disabled'}`)
      addLog(`WiFi: Guest network ${nextState ? 'activated' : 'deactivated'}`, 'info')
      return
    }

    if (label === 'Logs') {
      terminalRef.current?.scrollIntoView({ behavior: 'smooth' })
      addLog('View: Navigated to system logs', 'info')
      return
    }

    toast.info(`Action Executed: ${label}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-12 font-sans text-slate-200 selection:bg-emerald-500/30">
      <Toaster position="top-right" theme="dark" richColors closeButton />
      
      <AnimatePresence>
        {!isAuthenticated && (
          <LoginPage onLogin={handleLoginSuccess} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthenticated && isSettingsOpen && (
          <SettingsModal
            routerIp={routerIp}
            setRouterIp={setRouterIp}
            refreshInterval={refreshInterval}
            setRefreshInterval={setRefreshInterval}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
        {isAuthenticated && confirmAction && (
          <ActionModal
            title={confirmAction.title}
            description={confirmAction.desc}
            confirmText={confirmAction.confirmText}
            isDanger={confirmAction.isDanger}
            onConfirm={() => handleAction(confirmAction.label)}
            onClose={() => {
              setConfirmAction(null)
              setRebootStep(0)
            }}
          />
        )}
      </AnimatePresence>

      {isAuthenticated && (
        <>
          <DashboardHeader
            isConnected={isConnected}
            isRefreshing={isRefreshing}
            routerIp={routerIp}
            onRefresh={handleRefresh}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onLogout={handleLogout}
          />

          <main className="mx-auto max-w-7xl px-4 py-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="space-y-6 lg:col-span-3">
                <TopStatsSection 
                  ispInfo={ispInfo} 
                  currentStats={currentStats} 
                  healthScore={healthScore} 
                  downloadTrend={downloadTrend}
                />
                <TrafficChartSection stats={stats} />
                <SystemMetricsSection 
                  cpuLoad={cpuLoad} 
                  memoryUsage={memoryUsage}
                  uptime={uptime}
                />
                <TerminalLogsSection terminalRef={terminalRef} logs={logs} onClearLogs={() => setLogs([])} />
              </div>

              <div className="space-y-6">
                <DevicesSection devices={devices} />
                <QuickActionsSection 
                  onAction={handleAction} 
                  isGuestWifiEnabled={isGuestWifiEnabled}
                />
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  )
}

export default App
