import { Clock, Cpu, HardDrive } from 'lucide-react'

interface SystemMetricsSectionProps {
  cpuLoad: number
  memoryUsage: string
  uptime: string
}

export function SystemMetricsSection({ cpuLoad, memoryUsage, uptime }: SystemMetricsSectionProps) {
  return (
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
          <p className="text-sm font-semibold text-white">{memoryUsage}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
          <Clock className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500">Uptime</p>
          <p className="text-sm font-semibold text-white">{uptime}</p>
        </div>
      </div>
    </div>
  )
}
