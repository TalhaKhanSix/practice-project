import { buildCorrelationMatrix } from '../utils/correlation'

const DISPLAY_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD']

function corrColor(val) {
  if (val >= 0.7) return 'bg-bull/70 text-black'
  if (val >= 0.3) return 'bg-bull/30 text-bull'
  if (val <= -0.7) return 'bg-bear/70 text-black'
  if (val <= -0.3) return 'bg-bear/30 text-bear'
  return 'bg-surface-2 text-muted'
}

export default function CorrelationMatrix({ histories }) {
  const matrix = buildCorrelationMatrix(histories, DISPLAY_PAIRS)

  return (
    <div className="rounded-lg border border-border bg-surface p-4 overflow-x-auto">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">
        Pair Correlation Matrix (30 bars)
      </div>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-1 text-left text-muted font-normal">Pair</th>
            {DISPLAY_PAIRS.map((p) => (
              <th key={p} className="p-1 font-mono font-normal text-muted">
                {p.split('/')[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DISPLAY_PAIRS.map((p1) => (
            <tr key={p1}>
              <td className="p-1 font-mono text-xs">{p1}</td>
              {DISPLAY_PAIRS.map((p2) => {
                const val = matrix[p1]?.[p2] ?? 0
                return (
                  <td key={p2} className={`p-1 text-center rounded font-mono ${corrColor(val)}`}>
                    {val.toFixed(2)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-bull/70 rounded-sm" /> Strong +corr
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-bear/70 rounded-sm" /> Strong -corr
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-surface-2 rounded-sm" /> No correlation
        </span>
      </div>
    </div>
  )
}
