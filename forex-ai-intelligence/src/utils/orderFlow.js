export function calcVolumeDelta(ticks) {
  let buyVol = 0
  let sellVol = 0
  for (let i = 1; i < ticks.length; i++) {
    const vol = 1
    if (ticks[i] > ticks[i - 1]) buyVol += vol
    else if (ticks[i] < ticks[i - 1]) sellVol += vol
  }
  const delta = buyVol - sellVol
  const pressure = delta > 5 ? 'BUYING' : delta < -5 ? 'SELLING' : 'BALANCED'
  return { buyVol, sellVol, delta, pressure }
}

export function calcCVD(ticks) {
  let cvd = 0
  const cvdSeries = []
  for (let i = 1; i < ticks.length; i++) {
    if (ticks[i] > ticks[i - 1]) cvd += 1
    else if (ticks[i] < ticks[i - 1]) cvd -= 1
    cvdSeries.push(cvd)
  }
  return cvdSeries
}

export function detectVolumeAnomaly(ticks) {
  const deltas = []
  for (let i = 1; i < ticks.length; i++) {
    deltas.push(Math.abs(ticks[i] - ticks[i - 1]))
  }
  const mean = deltas.reduce((a, b) => a + b, 0) / (deltas.length || 1)
  const std = Math.sqrt(
    deltas.map((d) => (d - mean) ** 2).reduce((a, b) => a + b, 0) / (deltas.length || 1)
  )
  const latest = deltas[deltas.length - 1] || 0
  const zScore = std > 0 ? (latest - mean) / std : 0
  return {
    zScore: parseFloat(zScore.toFixed(2)),
    isAnomaly: Math.abs(zScore) > 2,
    direction: latest > mean ? 'SPIKE UP' : 'SPIKE DOWN',
  }
}

export function getImbalanceZones(prices, windowSize = 10) {
  const zones = []
  for (let i = windowSize; i < prices.length; i++) {
    const window = prices.slice(i - windowSize, i)
    const move = prices[i] - prices[i - windowSize]
    const volatility = Math.max(...window) - Math.min(...window)
    if (Math.abs(move) > volatility * 0.7) {
      zones.push({
        startPrice: prices[i - windowSize],
        endPrice: prices[i],
        type: move > 0 ? 'BULLISH IMBALANCE' : 'BEARISH IMBALANCE',
        strength: Math.abs(move / (volatility || 1)),
        index: i,
      })
    }
  }
  return zones.slice(-5)
}
