import { useState } from 'react'
import { motion } from 'motion/react'

interface ActionModalProps {
  title: string
  description: string
  confirmText?: string
  onConfirm: () => void
  onClose: () => void
  isDanger?: boolean
}

export function ActionModal({ 
  title, 
  description, 
  confirmText, 
  onConfirm, 
  onClose,
  isDanger = true 
}: ActionModalProps) {
  const [input, setInput] = useState('')
  const isValid = !confirmText || input === confirmText

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
          
          {confirmText && (
            <div className="mt-6 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Type <span className="text-white">"{confirmText}"</span> to confirm
              </label>
              <input
                type="text"
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={confirmText}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none"
              />
            </div>
          )}
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
            disabled={!isValid}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white transition-all ${
              isValid 
                ? isDanger ? 'bg-red-500 hover:bg-red-400' : 'bg-emerald-500 hover:bg-emerald-400'
                : 'bg-slate-800 opacity-50 cursor-not-allowed text-slate-500'
            }`}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  )
}
