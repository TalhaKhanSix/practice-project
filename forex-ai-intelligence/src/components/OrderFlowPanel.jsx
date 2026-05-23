import { calcVolumeDelta, calcCVD, detectVolumeAnomaly, getImbalanceZones } from '../utils/orderFlow'

export default function OrderFlowPanel({ history }) {
  const prices = history || []
  const volume = calcVolumeDelta(prices)
  const cvd = calcCVD(prices)
  const anomaly = detectVolumeAnomaly(prices)
  const zones = getImbalanceZones(prices)

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">Order Flow</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-xs text-muted mb-1">Volume Delta</div>
          <div className="font-medium">
            {volume.delta > 0 ? '+' : ''}{volume.delta} ({volume.pressure})
          </div>
          <div className="text-xs text-muted mt-1">
            Buy {volume.buyVol} / Sell {volume.sellVol}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-xs text-muted mb-1">Volume Anomaly</div>
          <div className={`font-medium ${anomaly.isAnomaly ? 'text-bear' : 'text-neutral'}`}>
            {anomaly.isAnomaly ? 'Spike' : 'Normal'} ({anomaly.direction})
          </div>
          <div className="text-xs text-muted mt-1">Z-Score {anomaly.zScore}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-muted mb-2">CVD (last 10)</div>
        <div className="flex gap-1">
          {cvd.slice(-10).map((val, idx) => (
            <div
              key={`${val}-${idx}`}
              className={`h-8 w-2 rounded-sm ${val >= 0 ? 'bg-bull/60' : 'bg-bear/60'}`}
              title={String(val)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-muted mb-2">Imbalance Zones</div>
        {zones.length === 0 ? (
          <div className="text-xs text-muted">No zones detected.</div>
        ) : (
          <div className="space-y-2 text-xs">
            {zones.map((z, idx) => (
              <div key={`${z.index}-${idx}`} className="flex items-center justify-between">
                <span>{z.type}</span>
                <span className="font-mono">
                  {z.startPrice.toFixed(5)} - {z.endPrice.toFixed(5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
