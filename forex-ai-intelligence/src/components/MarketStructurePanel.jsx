import { detectSwingPoints, classifyStructure, findKeyLevels } from '../utils/marketStructure'

export default function MarketStructurePanel({ history }) {
  const prices = history || []
  const swings = detectSwingPoints(prices)
  const structure = classifyStructure(swings)
  const currentPrice = prices[prices.length - 1] || 0
  const levels = findKeyLevels(swings, currentPrice)

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">Market Structure</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-xs text-muted mb-1">Trend</div>
          <div className="font-medium">{structure.trend}</div>
          <div className="text-xs text-muted mt-1">
            HH {structure.isHH ? 'Yes' : 'No'} | HL {structure.isHL ? 'Yes' : 'No'}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-xs text-muted mb-1">Latest Swing</div>
          <div className="font-medium">
            H {structure.lastHigh?.price?.toFixed(5) || 'N/A'} | L {structure.lastLow?.price?.toFixed(5) || 'N/A'}
          </div>
          <div className="text-xs text-muted mt-1">
            Prev H {structure.prevHigh?.price?.toFixed(5) || 'N/A'} | Prev L {structure.prevLow?.price?.toFixed(5) || 'N/A'}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-muted mb-2">Key Levels</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-muted mb-1">Support</div>
            {levels.support.length === 0 ? (
              <div className="text-muted">None</div>
            ) : (
              <div className="space-y-1">
                {levels.support.map((s, idx) => (
                  <div key={`${s.price}-${idx}`} className="font-mono">
                    {s.price.toFixed(5)}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-muted mb-1">Resistance</div>
            {levels.resistance.length === 0 ? (
              <div className="text-muted">None</div>
            ) : (
              <div className="space-y-1">
                {levels.resistance.map((s, idx) => (
                  <div key={`${s.price}-${idx}`} className="font-mono">
                    {s.price.toFixed(5)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
