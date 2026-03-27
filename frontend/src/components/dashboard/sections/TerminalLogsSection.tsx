import { RefreshCw } from 'lucide-react'
import type { RefObject } from 'react'
import type { LogEntry } from '../../../types/dashboard'

interface TerminalLogsSectionProps {
  terminalRef: RefObject<HTMLDivElement | null>
  logs: LogEntry[]
  onClearLogs: () => void
}

export function TerminalLogsSection({ terminalRef, logs, onClearLogs }: TerminalLogsSectionProps) {
  return (
    <div className="group/terminal overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
            <div className="h-2.5 w-2.5 rounded-full bg-orange-500/50" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
          </div>
          <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">rust_backend_logs</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onClearLogs} className="text-[10px] font-mono uppercase tracking-tighter text-slate-600 transition-colors hover:text-emerald-400">
            clear_logs
          </button>
          <div className="text-[10px] font-mono text-slate-600">bash - 80x24</div>
        </div>
      </div>
      <div
        ref={terminalRef}
        className="custom-scrollbar h-56 space-y-1.5 overflow-y-auto bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.02),transparent)] p-4 font-mono text-[11px]"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex animate-in slide-in-from-left-2 gap-3 fade-in duration-300">
            <span className="shrink-0 select-none text-slate-600">[{log.timestamp}]</span>
            <span
              className={`${log.type === 'success' ? 'text-emerald-400/90' : ''} ${log.type === 'warning' ? 'text-orange-400/90' : ''} ${log.type === 'error' ? 'font-bold text-red-400' : ''} ${log.type === 'info' ? 'text-blue-400/90' : ''}`}
            >
              <span className="mr-2 text-slate-500">$</span>
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="flex items-center gap-2 italic text-slate-700">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Initializing kernel and waiting for backend stream...
          </div>
        )}
        <div className="ml-1 inline-block h-1 w-2 animate-pulse bg-emerald-500/50" />
      </div>
    </div>
  )
}
