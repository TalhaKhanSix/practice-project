export function detectSwingPoints(prices, lookback = 5) {
  const swings = []
  for (let i = lookback; i < prices.length - lookback; i++) {
    const left = prices.slice(i - lookback, i)
    const right = prices.slice(i + 1, i + lookback + 1)
    const isHigh = prices[i] > Math.max(...left) && prices[i] > Math.max(...right)
    const isLow = prices[i] < Math.min(...left) && prices[i] < Math.min(...right)
    if (isHigh) swings.push({ index: i, price: prices[i], type: 'HIGH' })
    if (isLow) swings.push({ index: i, price: prices[i], type: 'LOW' })
  }
  return swings
}

export function classifyStructure(swings) {
  const highs = swings.filter((s) => s.type === 'HIGH')
  const lows = swings.filter((s) => s.type === 'LOW')
  if (highs.length < 2 || lows.length < 2) return { trend: 'UNDEFINED', points: [] }

  const lastTwoHighs = highs.slice(-2)
  const lastTwoLows = lows.slice(-2)

  const hh = lastTwoHighs[1].price > lastTwoHighs[0].price
  const hl = lastTwoLows[1].price > lastTwoLows[0].price
  const lh = lastTwoHighs[1].price < lastTwoHighs[0].price
  const ll = lastTwoLows[1].price < lastTwoLows[0].price

  let trend = 'RANGING'
  if (hh && hl) trend = 'UPTREND'
  if (lh && ll) trend = 'DOWNTREND'
  if (hh && ll) trend = 'TRANSITION'

  return {
    trend,
    lastHigh: lastTwoHighs[1],
    lastLow: lastTwoLows[1],
    prevHigh: lastTwoHighs[0],
    prevLow: lastTwoLows[0],
    isHH: hh,
    isHL: hl,
    isLH: lh,
    isLL: ll,
  }
}

export function findKeyLevels(swings, currentPrice) {
  const nearbyRange = currentPrice * 0.005
  const support = swings
    .filter((s) => s.type === 'LOW' && s.price < currentPrice)
    .sort((a, b) => b.price - a.price)
    .slice(0, 3)
  const resistance = swings
    .filter((s) => s.type === 'HIGH' && s.price > currentPrice)
    .sort((a, b) => a.price - b.price)
    .slice(0, 3)
  const nearSupport = support.some((s) => Math.abs(s.price - currentPrice) < nearbyRange)
  const nearResistance = resistance.some((s) => Math.abs(s.price - currentPrice) < nearbyRange)
  return { support, resistance, nearSupport, nearResistance }
}
