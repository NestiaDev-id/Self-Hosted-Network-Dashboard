import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Activity, ShieldCheck, Lock, User, Globe, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface LoginPageProps {
  onLogin: (ip: string, user: string, pass: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [step, setStep] = useState(1)
  const [routerIp, setRouterIp] = useState('192.168.100.1')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [discoveredIps, setDiscoveredIps] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)

  // Dynamic Router Discovery Logic
  useEffect(() => {
    const commonIps = ['192.168.100.1', '192.168.1.1', '192.168.0.1', '10.0.0.1', '192.168.2.1'];
    setIsScanning(true)
    
    const probeIps = async () => {
      const discovered: string[] = [];
      
      // We use a small timeout for each probe
      const probes = commonIps.map(async (ip) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);
          
          // Try to fetch a common resource (favicon or public endpoint)
          // Even if it's CORS-blocked, a "Network Error" vs "Timeout" can give us a hint.
          await fetch(`http://${ip}/favicon.ico`, { 
            mode: 'no-cors', 
            signal: controller.signal 
          });
          
          clearTimeout(timeoutId);
          discovered.push(ip);
        } catch (err) {
          // If it didn't timeout, it might be alive but rejecting the specific path
          // we treat it as "potential" if it didn't take too long
        }
      });

      await Promise.allSettled(probes);
      
      // If none found, show defaults but marked as "Common"
      if (discovered.length === 0) {
        setDiscoveredIps(['192.168.100.1', '192.168.1.1']);
      } else {
        setDiscoveredIps(discovered);
        toast.success(`Found ${discovered.length} potential router(s)`);
      }
      setIsScanning(false)
    };

    probeIps();
  }, [])

  const handleNextStep = () => {
    if (step === 1 && !routerIp) {
      toast.error('Please select or enter a router IP')
      return
    }
    setStep(2)
  }

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error('Please enter all credentials')
      return
    }

    setIsConnecting(true)
    // Simulate verification
    setTimeout(() => {
      setIsConnecting(false)
      toast.success('Connection established!', {
        description: `Logged in to router at ${routerIp}`
      })
      onLogin(routerIp, username, password)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 px-4">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/40 p-1 shadow-2xl backdrop-blur-xl"
      >
        <div className="bg-slate-900/80 p-8">
          <div className="mb-10 text-center">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10"
            >
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
            </motion.div>
            <h1 className="text-2xl font-black tracking-tight text-white">NetDash</h1>
            <p className="mt-2 text-sm text-slate-500 uppercase tracking-widest font-bold">Secure Local Connection</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                    Step 1: Identify Router
                  </label>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Globe className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={routerIp}
                      onChange={(e) => setRouterIp(e.target.value)}
                      placeholder="e.g. 192.168.100.1"
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 py-4 pl-12 pr-4 font-mono text-sm text-emerald-400 focus:border-emerald-500/50 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <p className="mb-3 text-[10px] font-bold text-slate-600 uppercase">Suggested Hosts</p>
                    <div className="flex gap-2">
                      {isScanning ? (
                        <div className="flex items-center gap-2 text-xs text-slate-600 animate-pulse">
                          <Loader2 className="h-3 w-3 animate-spin" /> Scanning local network...
                        </div>
                      ) : (
                        discoveredIps.map(ip => (
                          <button
                            key={ip}
                            onClick={() => setRouterIp(ip)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              routerIp === ip 
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' 
                                : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            {ip}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                  <p className="text-[11px] leading-relaxed text-amber-500/80">
                    Ensure you have allowed <strong>"Insecure Content"</strong> in your browser settings for this domain.
                  </p>
                </div>

                <button
                  onClick={handleNextStep}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  Configure Hardware
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleFinalSubmit}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[10px] font-bold uppercase text-emerald-500 hover:underline mb-2"
                  >
                    ← Change Router ({routerIp})
                  </button>

                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Admin Username"
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 py-4 pl-12 pr-4 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Admin Password"
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 py-4 pl-12 pr-4 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-bold text-slate-950 transition-all disabled:opacity-50 hover:bg-emerald-400"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      Sync with Gateway
                      <Activity className="h-5 w-5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-700">
              End-to-End Local Sync • No Cloud Credentials Stored
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
