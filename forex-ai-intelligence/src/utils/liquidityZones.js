export function detectLiquidityZones(swings, pipSize = 0.0001) {
  const highs = swings.filter((s) => s.type === 'HIGH')
  const lows = swings.filter((s) => s.type === 'LOW')
  const tolerance = pipSize * 5

  const equalHighs = []
  for (let i = 0; i < highs.length; i++) {
    for (let j = i + 1; j < highs.length; j++) {
      if (Math.abs(highs[i].price - highs[j].price) < tolerance) {
        equalHighs.push({
          price: (highs[i].price + highs[j].price) / 2,
          type: 'BSL',
          label: 'Buy-Side Liquidity',
        })
      }
    }
  }

  const equalLows = []
  for (let i = 0; i < lows.length; i++) {
    for (let j = i + 1; j < lows.length; j++) {
      if (Math.abs(lows[i].price - lows[j].price) < tolerance) {
        equalLows.push({
          price: (lows[i].price + lows[j].price) / 2,
          type: 'SSL',
          label: 'Sell-Side Liquidity',
        })
      }
    }
  }

  const pdh = highs.length ? Math.max(...highs.map((h) => h.price)) : null
  const pdl = lows.length ? Math.min(...lows.map((l) => l.price)) : null

  return {
    bsl: equalHighs,
    ssl: equalLows,
    pdh,
    pdl,
    summary: `BSL at ${equalHighs[0]?.price?.toFixed(5) || 'none'}, SSL at ${
      equalLows[0]?.price?.toFixed(5) || 'none'
    }`,
  }
}
