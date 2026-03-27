import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { NetworkStats } from '../../../types/dashboard'

interface TrafficChartSectionProps {
  stats: NetworkStats[]
}

export function TrafficChartSection({ stats }: TrafficChartSectionProps) {
  return (
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
  )
}
