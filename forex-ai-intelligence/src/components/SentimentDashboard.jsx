const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'NZD', 'CAD']

export default function SentimentDashboard({ sentiment }) {
  if (!sentiment) return null

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">AI Currency Sentiment</div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {CURRENCIES.map((cur) => {
          const s = sentiment[cur]
          if (!s) return null
          const pct = ((s.score + 100) / 200 * 100).toFixed(0)
          const color = s.score > 20 ? '#22c55e' : s.score < -20 ? '#ef4444' : '#f59e0b'
          return (
            <div key={cur} className="bg-background rounded-lg p-2.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-medium">{cur}</span>
                <span className="text-xs" style={{ color }}>{s.label?.replace('_', ' ')}</span>
              </div>
              <div className="w-full bg-surface rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
              <div className="text-xs text-muted mt-1">
                {s.score > 0 ? '+' : ''}{s.score}
              </div>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-background rounded-lg p-2">
          <div className="text-muted">Risk Tone</div>
          <div
            className="font-medium mt-0.5"
            style={{
              color:
                sentiment.overall_risk === 'RISK_ON'
                  ? '#22c55e'
                  : sentiment.overall_risk === 'RISK_OFF'
                    ? '#ef4444'
                    : '#f59e0b',
            }}
          >
            {sentiment.overall_risk}
          </div>
        </div>
        <div className="bg-background rounded-lg p-2">
          <div className="text-muted">Best Long</div>
          <div className="font-medium text-bull mt-0.5">{sentiment.best_long}</div>
        </div>
        <div className="bg-background rounded-lg p-2">
          <div className="text-muted">Top Pair</div>
          <div className="font-medium mt-0.5">{sentiment.top_pair}</div>
        </div>
      </div>
    </div>
  )
}
