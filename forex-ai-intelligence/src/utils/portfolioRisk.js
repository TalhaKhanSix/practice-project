export function kellySize(winRate, rr) {
  const w = winRate / 100
  const l = 1 - w
  const b = rr
  const kelly = (b * w - l) / b
  return Math.max(0, +(kelly * 100).toFixed(2))
}

export function calcMaxDrawdown(equityCurve) {
  let peak = equityCurve[0]
  let maxDD = 0
  for (const val of equityCurve) {
    if (val > peak) peak = val
    const dd = ((peak - val) / peak) * 100
    if (dd > maxDD) maxDD = dd
  }
  return +maxDD.toFixed(2)
}

export function calcSharpeRatio(returns, riskFreeRate = 0.05) {
  const n = returns.length
  const mean = returns.reduce((a, b) => a + b, 0) / n
  const std = Math.sqrt(returns.map((r) => (r - mean) ** 2).reduce((a, b) => a + b, 0) / n)
  return std > 0 ? +(((mean - riskFreeRate / 252) / std) * Math.sqrt(252)).toFixed(2) : 0
}

export function checkDailyRisk(openTrades, accountBalance, maxDailyRiskPct = 3) {
  const totalRisk = openTrades.reduce((sum, t) => sum + t.riskAmount, 0)
  const pct = ((totalRisk / accountBalance) * 100).toFixed(2)
  return {
    usedRisk: parseFloat(pct),
    maxRisk: maxDailyRiskPct,
    remaining: +(maxDailyRiskPct - parseFloat(pct)).toFixed(2),
    isBreached: parseFloat(pct) > maxDailyRiskPct,
    status:
      parseFloat(pct) > maxDailyRiskPct
        ? 'STOP TRADING'
        : parseFloat(pct) > maxDailyRiskPct * 0.7
          ? 'CAUTION'
          : 'OK',
  }
}
