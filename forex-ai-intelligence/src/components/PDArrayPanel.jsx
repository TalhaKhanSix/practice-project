import { calcPDArray, getOptimalEntry } from '../utils/pdArray'
import { detectSwingPoints, classifyStructure } from '../utils/marketStructure'

export default function PDArrayPanel({ history }) {
  const prices = history || []
  const high = prices.length ? Math.max(...prices) : 0
  const low = prices.length ? Math.min(...prices) : 0
  const currentPrice = prices[prices.length - 1] || 0
  const pdArray = calcPDArray(high, low, currentPrice)

  const swings = detectSwingPoints(prices)
  const structure = classifyStructure(swings)
  const optimal = getOptimalEntry(pdArray, structure.trend)

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">Premium / Discount</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-xs text-muted mb-1">Current Zone</div>
          <div className="font-medium">{pdArray.currentZone}</div>
          <div className="text-xs text-muted mt-1">{pdArray.percentile}% of range</div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-xs text-muted mb-1">Optimal Entry</div>
          <div className="font-medium">{optimal.signal}</div>
          <div className="text-xs text-muted mt-1">Grade {optimal.quality}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs mt-3">
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-muted mb-1">Premium 75%</div>
          <div className="font-mono">{pdArray.premium75.toFixed(5)}</div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-muted mb-1">Equilibrium</div>
          <div className="font-mono">{pdArray.equilibrium.toFixed(5)}</div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-muted mb-1">Discount 25%</div>
          <div className="font-mono">{pdArray.discount25.toFixed(5)}</div>
        </div>
      </div>
    </div>
  )
}
