// RSI - Relative Strength Index (14-period default)
export function calcRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50
  let gains = 0
  let losses = 0
  for (let i = prices.length - period; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1]
    if (d > 0) gains += d
    else losses += Math.abs(d)
  }
  const rs = losses === 0 ? Infinity : gains / losses
  return parseFloat((100 - 100 / (1 + rs)).toFixed(1))
}

// EMA - Exponential Moving Average
export function calcEMA(prices, period) {
  if (prices.length < period) return null
  const k = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k)
  }
  return parseFloat(ema.toFixed(5))
}

// MACD - Moving Average Convergence Divergence
export function calcMACD(prices) {
  const ema12 = calcEMA(prices, 12)
  const ema26 = calcEMA(prices, 26)
  if (!ema12 || !ema26) return { macd: 0, signal: 'NEUTRAL' }
  const macd = ema12 - ema26
  return {
    macd: parseFloat(macd.toFixed(6)),
    signal: macd > 0.00015 ? 'BULLISH X' : macd < -0.00015 ? 'BEARISH X' : 'NEUTRAL',
  }
}

// Trend direction based on price momentum
export function calcTrend(prices) {
  if (prices.length < 2) return 'NEUTRAL'
  const chgPct = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100
  if (chgPct > 0.002) return 'BULLISH'
  if (chgPct < -0.002) return 'BEARISH'
  return 'NEUTRAL'
}

// Fibonacci levels from session OHLC
export function calcFibLevels(high, low) {
  const range = high - low
  return {
    fib_236: parseFloat((low + range * 0.236).toFixed(5)),
    fib_382: parseFloat((low + range * 0.382).toFixed(5)),
    fib_500: parseFloat((low + range * 0.5).toFixed(5)),
    fib_618: parseFloat((low + range * 0.618).toFixed(5)),
    fib_786: parseFloat((low + range * 0.786).toFixed(5)),
  }
}
