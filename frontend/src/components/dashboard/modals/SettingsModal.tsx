import { RefreshCw, Settings } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'

interface SettingsModalProps {
  routerIp: string
  setRouterIp: (ip: string) => void
  refreshInterval: string
  setRefreshInterval: (interval: string) => void
  onClose: () => void
}

export function SettingsModal({
  routerIp,
  setRouterIp,
  refreshInterval,
  setRefreshInterval,
  onClose,
}: SettingsModalProps) {

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
          <button onClick={onClose} className="text-slate-500 transition-colors hover:text-white">
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
              <option value="30s">30 Seconds (Standard)</option>
              <option value="60s">1 Minute (Eco Mode)</option>
              <option value="300s">5 Minutes (Ultra Save)</option>
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
