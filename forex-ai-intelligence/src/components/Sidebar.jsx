import { useMarket } from '../context/MarketContext'

export default function Sidebar() {
  const { pair, setPair, timeframe, setTimeframe, pairs, timeframes } = useMarket()

  return (
    <aside className="w-64 border-r border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">Pairs</div>
      <div className="space-y-2">
        {pairs.map((item) => {
          const active = item === pair
          return (
            <button
              key={item}
              type="button"
              onClick={() => setPair(item)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                active
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-foreground border-border hover:bg-background'
              }`}
            >
              {item}
            </button>
          )
        })}
      </div>

      <div className="text-xs uppercase tracking-widest text-muted mt-6 mb-3">Timeframe</div>
      <div className="grid grid-cols-3 gap-2">
        {timeframes.map((tf) => {
          const active = tf === timeframe
          return (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`rounded-md border px-2 py-1 text-xs font-mono transition ${
                active
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-foreground border-border hover:bg-background'
              }`}
            >
              {tf}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
