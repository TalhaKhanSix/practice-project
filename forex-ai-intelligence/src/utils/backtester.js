import { calcRSI, calcEMA, calcTrend } from './indicators'
import { analyzeSMC, getConfluenceScore } from './smcAnalysis'

export function runBacktest(priceHistory, options = {}) {
  const {
    confluenceThreshold = 65,
    rr = 2,
    slPips = 20,
    pipValue = 0.0001,
  } = options

  const results = []
  const windowSize = 60

  for (let i = windowSize; i < priceHistory.length - 10; i++) {
    const slice = priceHistory.slice(i - windowSize, i)
    const high = Math.max(...slice)
    const low = Math.min(...slice)
    const ohlc = { high, low, open: slice[0] }

    const strategies = analyzeSMC('', slice, ohlc)
    const score = getConfluenceScore(strategies)
    const trend = calcTrend(slice)
    const rsi = calcRSI(slice)
    const currentPrice = slice[slice.length - 1]

    if (score < confluenceThreshold) continue

    const isBuySignal = score >= confluenceThreshold && trend === 'BULLISH' && rsi < 70
    const isSellSignal =
      (100 - score) >= confluenceThreshold && trend === 'BEARISH' && rsi > 30

    if (!isBuySignal && !isSellSignal) continue

    const direction = isBuySignal ? 'BUY' : 'SELL'
    const entry = currentPrice
    const sl = direction === 'BUY' ? entry - slPips * pipValue : entry + slPips * pipValue
    const tp = direction === 'BUY' ? entry + slPips * rr * pipValue : entry - slPips * rr * pipValue

    let outcome = 'OPEN'
    let exitPrice = null
    for (let j = i + 1; j < Math.min(i + 50, priceHistory.length); j++) {
      const p = priceHistory[j]
      if (direction === 'BUY') {
        if (p <= sl) {
          outcome = 'LOSS'
          exitPrice = sl
          break
        }
        if (p >= tp) {
          outcome = 'WIN'
          exitPrice = tp
          break
        }
      } else {
        if (p >= sl) {
          outcome = 'LOSS'
          exitPrice = sl
          break
        }
        if (p <= tp) {
          outcome = 'WIN'
          exitPrice = tp
          break
        }
      }
    }
    if (outcome === 'OPEN') {
      outcome = 'EXPIRED'
      exitPrice = priceHistory[Math.min(i + 50, priceHistory.length - 1)]
    }

    const pnlPips =
      direction === 'BUY' ? (exitPrice - entry) / pipValue : (entry - exitPrice) / pipValue

    results.push({
      index: i,
      direction,
      entry,
      sl,
      tp,
      outcome,
      exitPrice,
      pnlPips: +pnlPips.toFixed(1),
      score,
    })
  }

  const wins = results.filter((r) => r.outcome === 'WIN').length
  const losses = results.filter((r) => r.outcome === 'LOSS').length
  const total = wins + losses
  const winRate = total > 0 ? (wins / total * 100).toFixed(1) : '0'
  const totalPips = results.reduce((sum, r) => sum + r.pnlPips, 0).toFixed(1)
  const avgWin =
    wins > 0
      ? (
          results.filter((r) => r.outcome === 'WIN').reduce((s, r) => s + r.pnlPips, 0) /
          wins
        ).toFixed(1)
      : 0
  const avgLoss =
    losses > 0
      ? (
          results.filter((r) => r.outcome === 'LOSS').reduce((s, r) => s + r.pnlPips, 0) /
          losses
        ).toFixed(1)
      : 0
  const profitFactor =
    losses > 0 && avgLoss !== 0
      ? Math.abs((avgWin * wins) / (avgLoss * losses)).toFixed(2)
      : 'N/A'

  return { results, wins, losses, total, winRate, totalPips, avgWin, avgLoss, profitFactor }
}
