interface ActionButtonProps {
  label: string
  onClick?: () => void
}

export function ActionButton({ label, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-[10px] font-bold uppercase tracking-tight text-slate-400 transition-all hover:border-emerald-500 hover:bg-emerald-500 hover:text-slate-950"
    >
      {label}
    </button>
  )
}
