import { useMemo } from 'react'
import { calcMaxDrawdown, calcSharpeRatio, checkDailyRisk, kellySize } from '../utils/portfolioRisk'

export default function PortfolioPanel({ trades, equityCurve }) {
  const equity = equityCurve.length ? equityCurve : [10000, 10050, 9950, 10200, 10120]
  const returns = equity.slice(1).map((v, i) => (v - equity[i]) / equity[i])

  const winRate = trades.length
    ? (trades.filter((t) => t.outcome === 'WIN').length / trades.length) * 100
    : 55
  const rr = 2

  const kelly = kellySize(winRate, rr)
  const maxDD = calcMaxDrawdown(equity)
  const sharpe = calcSharpeRatio(returns)
  const riskStatus = checkDailyRisk(trades, equity[equity.length - 1], 3)

  const curve = useMemo(() => equity.map((v, i) => ({ idx: i, value: v })), [equity])

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">Portfolio Risk</div>
      <div className="grid grid-cols-4 gap-2 text-xs mb-4">
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-muted">Kelly Size</div>
          <div className="font-medium">{kelly}%</div>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-muted">Max Drawdown</div>
          <div className="font-medium">{maxDD}%</div>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-muted">Sharpe</div>
          <div className="font-medium">{sharpe}</div>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-muted">Daily Risk</div>
          <div className={`font-medium ${riskStatus.status === 'OK' ? 'text-bull' : 'text-bear'}`}>
            {riskStatus.usedRisk}%
          </div>
        </div>
      </div>
      <div className="rounded-md border border-border bg-background p-3">
        <div className="text-xs text-muted mb-2">Equity Curve (sample)</div>
        <div className="flex items-end gap-1 h-20">
          {curve.map((point) => (
            <div
              key={point.idx}
              className="flex-1 rounded-sm bg-info/40"
              style={{ height: `${(point.value / Math.max(...equity)) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs mt-3">
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-muted">Risk Status</div>
          <div className="font-medium">{riskStatus.status}</div>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-muted">Remaining Risk</div>
          <div className="font-medium">{riskStatus.remaining}%</div>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-muted">Account Equity</div>
          <div className="font-medium">{equity[equity.length - 1].toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}
