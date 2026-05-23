import { useEffect, useState } from 'react'
import { useSocketStatus } from '../hooks/useTickStream'

export default function TopBar({ rightSlot }) {
  const apiKey = import.meta.env.VITE_POLYGON_API_KEY
  const isConnected = useSocketStatus(apiKey)
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().split(' ')[4] + ' UTC')
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-bull animate-pulse" />
        <span className="text-sm font-mono font-medium tracking-widest">FOREX AI INTELLIGENCE</span>
        <span className="text-xs text-bull tracking-widest">LIVE</span>
        {apiKey ? (
          <div
            className={`flex items-center gap-1.5 text-xs font-mono ${
              isConnected ? 'text-bull' : 'text-bear'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-bull animate-pulse' : 'bg-bear'
              }`}
            />
            {isConnected ? 'WS LIVE' : 'RECONNECTING'}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral" />
            WS OFF
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {rightSlot}
        <span className="text-xs font-mono text-muted">{time}</span>
      </div>
    </header>
  )
}
