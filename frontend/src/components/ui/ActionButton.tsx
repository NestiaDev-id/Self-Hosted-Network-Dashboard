interface ActionButtonProps {
  label: string
  isActive?: boolean
  onClick?: () => void
}

export function ActionButton({ label, isActive, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-4 py-2 text-[10px] font-bold uppercase tracking-tight transition-all ${
        isActive 
          ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400' 
          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-emerald-500 hover:bg-emerald-500 hover:text-slate-950'
      }`}
    >
      {label}
    </button>
  )
}
