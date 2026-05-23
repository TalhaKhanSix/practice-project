import { calcRSI, calcEMA, calcTrend } from './indicators'
import { analyzeSMC, getConfluenceScore } from './smcAnalysis'

const TIMEFRAMES = ['M5', 'M15', 'H1', 'H4', 'D1']

export function buildMTFHistories(tickHistory) {
  const compress = (arr, factor) => {
    const out = []
    for (let i = 0; i < arr.length; i += factor) {
      const slice = arr.slice(i, i + factor)
      if (slice.length) out.push(slice[slice.length - 1])
    }
    return out
  }

  return {
    M5: tickHistory,
    M15: compress(tickHistory, 3),
    H1: compress(tickHistory, 12),
    H4: compress(tickHistory, 48),
    D1: compress(tickHistory, 288),
  }
}

export function runMTFAnalysis(tickHistory) {
  const histories = buildMTFHistories(tickHistory || [])
  const results = {}

  TIMEFRAMES.forEach((tf) => {
    const prices = histories[tf] || []
    if (prices.length < 15) {
      results[tf] = { trend: 'NEUTRAL', rsi: 50, score: 50, bias: 'NEUTRAL', strategies: [] }
      return
    }
    const strategies = analyzeSMC('', prices, {
      high: Math.max(...prices),
      low: Math.min(...prices),
      open: prices[0],
    })
    const score = getConfluenceScore(strategies)
    results[tf] = {
      trend: calcTrend(prices),
      rsi: calcRSI(prices),
      ema20: calcEMA(prices, 20),
      score,
      bias: score >= 62 ? 'BULLISH' : score <= 38 ? 'BEARISH' : 'NEUTRAL',
      strategies,
    }
  })

  const biases = TIMEFRAMES.map((tf) => results[tf].bias)
  const bullCount = biases.filter((b) => b === 'BULLISH').length
  const bearCount = biases.filter((b) => b === 'BEARISH').length

  const overallBias =
    bullCount >= 3
      ? 'STRONG BULLISH'
      : bullCount === 2
        ? 'MILD BULLISH'
        : bearCount >= 3
          ? 'STRONG BEARISH'
          : bearCount === 2
            ? 'MILD BEARISH'
            : 'NEUTRAL'

  const aligned = bullCount >= 3 || bearCount >= 3
  const confidence = bullCount >= 4 || bearCount >= 4 ? 'HIGH' : aligned ? 'MEDIUM' : 'LOW'

  return { timeframes: results, overallBias, bullCount, bearCount, confidence, aligned }
}
