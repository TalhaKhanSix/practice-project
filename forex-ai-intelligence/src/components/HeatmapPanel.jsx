import { useMemo } from 'react'

const PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'EUR/JPY', 'EUR/GBP']

function perfColor(val) {
  if (val > 0.15) return 'bg-bull/40 text-bull'
  if (val > 0.05) return 'bg-bull/20 text-bull'
  if (val < -0.15) return 'bg-bear/40 text-bear'
  if (val < -0.05) return 'bg-bear/20 text-bear'
  return 'bg-surface-2 text-muted'
}

export default function HeatmapPanel({ histories }) {
  const rows = useMemo(() => {
    return PAIRS.map((pair) => {
      const data = histories[pair] || []
      if (data.length < 2) return { pair, change: 0 }
      const base = data[0]
      const last = data[data.length - 1]
      const changePct = ((last - base) / base) * 100
      return { pair, change: parseFloat(changePct.toFixed(2)) }
    })
  }, [histories])

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">Performance Heatmap</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {rows.map((row) => (
          <div key={row.pair} className={`rounded-md p-3 ${perfColor(row.change)}`}>
            <div className="text-xs font-mono">{row.pair}</div>
            <div className="text-sm font-medium">{row.change > 0 ? '+' : ''}{row.change}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}
