import { Activity, Database, Download } from 'lucide-react'
import { motion } from 'motion/react'
import type { ISPInfo, NetworkStats } from '../../../types/dashboard'
import { StatCard } from '../../ui/StatCard'

interface TopStatsSectionProps {
  ispInfo: ISPInfo
  currentStats: NetworkStats
  healthScore: number
  downloadTrend: string
}

export function TopStatsSection({ ispInfo, currentStats, healthScore, downloadTrend }: TopStatsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-3">
        <StatCard
          label="ISP Provider"
          value={ispInfo.securityStatus === 'scanning' ? 'Scanning...' : ispInfo.provider}
          icon={<Database className={`h-5 w-5 ${ispInfo.securityStatus === 'scanning' ? 'animate-pulse' : ''}`} />}
          color={ispInfo.securityStatus === 'scanning' ? 'purple' : 'emerald'}
          trend={ispInfo.securityStatus === 'scanning' ? 'PROCESSING' : 'SECURE'}
        />
        <StatCard
          label="Current Download"
          value={`${currentStats.download} Mbps`}
          icon={<Download className="h-5 w-5" />}
          color="emerald"
          trend={downloadTrend}
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
  )
}
