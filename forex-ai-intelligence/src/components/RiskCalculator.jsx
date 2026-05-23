import { useState } from 'react'
import { calcLotSize, getSessionRisk } from '../utils/riskCalc'

export default function RiskCalculator({ slPips }) {
  const [balance, setBalance] = useState(10000)
  const [riskPct, setRiskPct] = useState(1)
  const sessionRisk = getSessionRisk()
  const result = calcLotSize({
    accountBalance: balance,
    riskPercent: riskPct,
    slPips: slPips || 20,
  })

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-widest text-muted">Risk Calculator</div>
        <div className="text-xs font-mono">
          Session Risk: {sessionRisk.level} ({sessionRisk.pct}%)
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-muted">Account Balance ($)</label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(+e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted">Risk % per Trade</label>
          <input
            type="number"
            value={riskPct}
            min="0.1"
            max="5"
            step="0.1"
            onChange={(e) => setRiskPct(+e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md border border-border bg-background px-2 py-3">
          <div className="text-sm font-mono font-medium">{result.lotSize}</div>
          <div className="text-[10px] text-muted mt-1">LOT SIZE</div>
        </div>
        <div className="rounded-md border border-border bg-background px-2 py-3">
          <div className="text-sm font-mono font-medium">${result.riskAmount}</div>
          <div className="text-[10px] text-muted mt-1">RISK ($)</div>
        </div>
        <div className="rounded-md border border-border bg-background px-2 py-3">
          <div className="text-sm font-mono font-medium">${result.maxLoss}</div>
          <div className="text-[10px] text-muted mt-1">MAX LOSS</div>
        </div>
      </div>
    </div>
  )
}
