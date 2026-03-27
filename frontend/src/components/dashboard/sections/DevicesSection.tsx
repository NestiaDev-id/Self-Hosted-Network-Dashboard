import { ChevronRight, Laptop, Monitor, Smartphone } from 'lucide-react'
import { motion } from 'motion/react'
import type { Device } from '../../../types/dashboard'

interface DevicesSectionProps {
  devices: Device[]
}

export function DevicesSection({ devices }: DevicesSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Connected Devices</h2>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
          {devices.filter((d) => d.status === 'online').length} ONLINE
        </span>
      </div>

      <div className="custom-scrollbar max-h-[440px] space-y-4 overflow-y-auto pr-2">
        {devices.map((device) => (
          <div
            key={device.id}
            className="group flex-col cursor-pointer rounded-xl border border-transparent p-3 transition-all hover:border-slate-700/50 hover:bg-slate-800/50"
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
                  <span className="mt-1 font-mono text-[10px] text-slate-600">{device.bandwidth > 0 ? `${device.bandwidth.toFixed(1)}M/s` : 'Offline'}</span>
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
  )
}
