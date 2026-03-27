import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
  color: 'emerald' | 'blue' | 'purple'
  trend: string
}

export function StatCard({ label, value, icon, color, trend }: StatCardProps) {
  const colorClasses = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  }

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
