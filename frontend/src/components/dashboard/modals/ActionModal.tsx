import { motion } from 'motion/react'

interface ActionModalProps {
  title: string
  description: string
  onConfirm: () => void
  onClose: () => void
}

export function ActionModal({ title, description, onConfirm, onClose }: ActionModalProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
        </div>
        <div className="flex gap-3 border-t border-slate-800 bg-slate-950/50 p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-800 py-2.5 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-400"
          >
            Confirm Action
          </button>
        </div>
      </motion.div>
    </div>
  )
}
