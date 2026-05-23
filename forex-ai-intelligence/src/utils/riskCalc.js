// Calculate lot size based on account balance and risk percentage
export function calcLotSize({ accountBalance, riskPercent, slPips, pipValue = 10 }) {
  const riskAmount = accountBalance * (riskPercent / 100)
  const lotSize = riskAmount / (slPips * pipValue)
  return {
    lotSize: parseFloat(lotSize.toFixed(2)),
    riskAmount: parseFloat(riskAmount.toFixed(2)),
    maxLoss: parseFloat((slPips * pipValue * lotSize).toFixed(2)),
  }
}

// Session risk based on time and volatility
export function getSessionRisk() {
  const hour = new Date().getUTCHours()
  if ((hour >= 8 && hour <= 12) || (hour >= 13 && hour <= 17)) {
    return { level: 'HIGH', pct: 80 }
  }
  if ((hour >= 12 && hour <= 13) || (hour >= 7 && hour <= 8)) {
    return { level: 'MEDIUM', pct: 55 }
  }
  return { level: 'LOW', pct: 30 }
}
