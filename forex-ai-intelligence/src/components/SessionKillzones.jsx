import { useEffect, useMemo, useState } from 'react'
import { ALL_KILLZONES, getCurrentSession } from '../utils/sessions'

function formatRange(start, end) {
  const pad = (v) => String(v).padStart(2, '0')
  return `${pad(start)}:00-${pad(end)}:00 UTC`
}

export default function SessionKillzones({ pair }) {
  const [utcHour, setUtcHour] = useState(new Date().getUTCHours())

  useEffect(() => {
    const id = setInterval(() => setUtcHour(new Date().getUTCHours()), 60000)
    return () => clearInterval(id)
  }, [])

  const current = useMemo(() => getCurrentSession(utcHour), [utcHour])

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">Session Killzones</div>
      <div className="rounded-md border border-border bg-background p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{current.name}</div>
          <div className="text-xs font-mono" style={{ color: current.color }}>
            {formatRange(utcHour, utcHour + 1)}
          </div>
        </div>
        <div className="text-xs text-muted mt-1">{current.pip}</div>
      </div>
      <div className="space-y-2 text-xs">
        {ALL_KILLZONES.map((zone) => {
          const isActive = utcHour >= zone.start && utcHour < zone.end
          const isPair = zone.pairs.includes(pair)
          return (
            <div
              key={zone.name}
              className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                isActive ? 'border-transparent' : 'border-border'
              }`}
              style={
                isActive
                  ? { backgroundColor: `${zone.color}22`, boxShadow: `0 0 12px ${zone.color}33` }
                  : undefined
              }
            >
              <div>
                <div className="font-medium">{zone.name}</div>
                <div className="text-muted">{formatRange(zone.start, zone.end)}</div>
              </div>
              <div className="text-right">
                <div className="font-mono" style={{ color: zone.color }}>
                  {isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
                {isPair && <div className="text-[10px] text-muted">Pair Focus</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
