import { calcRSI, calcEMA, calcFibLevels } from './indicators'

export function analyzeSMC(pair, prices, ohlc) {
  const price = prices[prices.length - 1]
  const { high, low } = ohlc
  const mid = (high + low) / 2
  const fib = calcFibLevels(high, low)
  const rsi = calcRSI(prices)
  const ema20 = calcEMA(prices, 20)
  const ema50 = calcEMA(prices, 50)

  // Break of Structure - price breaks above recent swing high
  const recentHigh = Math.max(...prices.slice(-20, -1))
  const bos = price > recentHigh

  // Change of Character - momentum reversal on lower timeframe
  const choch = !bos && prices.length > 10 && price < prices[prices.length - 10]

  // Fair Value Gap - large imbalance candle
  const fvg =
    prices.length > 3 &&
    Math.abs(prices[prices.length - 1] - prices[prices.length - 3]) > (high - low) * 0.3

  // Order Block - institutional buy/sell zone
  const orderBlockBull = price < mid
  const orderBlockBear = price > mid

  // Support / Resistance
  const nearFib618 = Math.abs(price - fib.fib_618) < (high - low) * 0.1
  const aboveMid = price > mid

  // EMA confluence
  const emaAbove = ema20 && ema50 && ema20 > ema50

  return [
    {
      name: 'Support / Resistance',
      signal: aboveMid ? 'SUPPORT HOLD' : 'AT RESISTANCE',
      bullish: aboveMid,
    },
    {
      name: 'Break of Structure (BOS)',
      signal: bos ? 'BOS CONFIRMED' : 'RANGING',
      bullish: bos,
    },
    {
      name: 'Fair Value Gap (FVG)',
      signal: fvg ? 'FVG PRESENT' : 'NO GAP',
      bullish: fvg,
    },
    {
      name: 'Fibonacci 0.618',
      signal: nearFib618 ? 'IN ZONE' : 'OUTSIDE',
      bullish: nearFib618,
    },
    {
      name: 'Order Block',
      signal: orderBlockBull ? 'OB ABOVE (BULLISH)' : 'OB BELOW (BEARISH)',
      bullish: orderBlockBull,
    },
    {
      name: 'CHOCH',
      signal: choch ? 'DETECTED' : 'NONE',
      bullish: !choch,
    },
    {
      name: 'EMA 20/50 Cross',
      signal: emaAbove ? 'PRICE ABOVE EMAs' : 'PRICE BELOW EMAs',
      bullish: emaAbove,
    },
    {
      name: 'RSI Confluence',
      signal: rsi > 70 ? 'OVERBOUGHT' : rsi < 30 ? 'OVERSOLD' : `RSI ${rsi}`,
      bullish: rsi < 70 && rsi > 40,
    },
  ]
}

export function getConfluenceScore(strategies) {
  const bullCount = strategies.filter((s) => s.bullish).length
  return Math.round((bullCount / strategies.length) * 100)
}
