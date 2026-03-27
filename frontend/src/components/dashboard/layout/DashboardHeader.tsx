import { Activity, RefreshCw, Settings, LogOut } from 'lucide-react'

interface DashboardHeaderProps {
  isConnected: boolean
  isRefreshing: boolean
  routerIp: string
  onRefresh: () => void
  onOpenSettings: () => void
  onLogout: () => void
}

export function DashboardHeader({ 
  isConnected, 
  isRefreshing, 
  routerIp,
  onRefresh, 
  onOpenSettings,
  onLogout 
}: DashboardHeaderProps) {
  return (
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
            <span className="font-mono text-sm text-emerald-400">{routerIp}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="group rounded-lg p-2 transition-colors hover:bg-slate-800">
            <RefreshCw
              className={`h-5 w-5 text-slate-400 transition-all group-hover:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
          <button onClick={onOpenSettings} className="group rounded-lg p-2 transition-colors hover:bg-slate-800">
            <Settings className="h-5 w-5 text-slate-400 transition-colors group-hover:text-white" />
          </button>
          <div className="h-4 w-[1px] bg-slate-800 mx-1" />
          <button onClick={onLogout} className="group rounded-lg p-2 transition-colors hover:bg-red-500/10">
            <LogOut className="h-5 w-5 text-slate-500 transition-colors group-hover:text-red-400" />
          </button>
        </div>
      </div>
    </header>
  )
}
