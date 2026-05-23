import { detectSwingPoints } from '../utils/marketStructure'
import { detectLiquidityZones } from '../utils/liquidityZones'

export default function LiquidityPanel({ history }) {
  const prices = history || []
  const swings = detectSwingPoints(prices)
  const zones = detectLiquidityZones(swings)

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">Liquidity Zones</div>
      <div className="text-sm">
        <div className="mb-2">{zones.summary}</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-muted mb-1">Buy-Side Liquidity</div>
            {zones.bsl.length === 0 ? (
              <div className="text-muted">None</div>
            ) : (
              zones.bsl.slice(0, 3).map((z, idx) => (
                <div key={`${z.price}-${idx}`} className="font-mono">
                  {z.price.toFixed(5)}
                </div>
              ))
            )}
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-muted mb-1">Sell-Side Liquidity</div>
            {zones.ssl.length === 0 ? (
              <div className="text-muted">None</div>
            ) : (
              zones.ssl.slice(0, 3).map((z, idx) => (
                <div key={`${z.price}-${idx}`} className="font-mono">
                  {z.price.toFixed(5)}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs mt-3">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-muted mb-1">Previous Day High</div>
            <div className="font-mono">{zones.pdh ? zones.pdh.toFixed(5) : 'N/A'}</div>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-muted mb-1">Previous Day Low</div>
            <div className="font-mono">{zones.pdl ? zones.pdl.toFixed(5) : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
