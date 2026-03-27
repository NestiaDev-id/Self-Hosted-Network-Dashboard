import { ActionButton } from '../../ui/ActionButton'

interface QuickActionsSectionProps {
  onAction: (label: string) => void
  isGuestWifiEnabled: boolean
}

export function QuickActionsSection({ onAction, isGuestWifiEnabled }: QuickActionsSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-800/40 bg-slate-900/20 p-6 shadow-xl backdrop-blur-sm">
      <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-slate-400">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <ActionButton label="Reboot" onClick={() => onAction('Reboot')} />
        <ActionButton label="Scan Security" onClick={() => onAction('Scan Security')} />
        <ActionButton label="Renew IP" onClick={() => onAction('Renew IP')} />
        <ActionButton 
          label="Guest WiFi" 
          isActive={isGuestWifiEnabled}
          onClick={() => onAction('Guest WiFi')} 
        />
        <ActionButton label="Diagnostics" onClick={() => onAction('Diagnostics')} />
        <ActionButton label="Logs" onClick={() => onAction('Logs')} />
      </div>
    </div>
  )
}
