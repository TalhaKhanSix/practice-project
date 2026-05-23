export function calcPDArray(high, low, currentPrice) {
  const range = high - low
  const midpoint = low + range * 0.5
  const premium75 = low + range * 0.75
  const discount25 = low + range * 0.25

  const zone =
    currentPrice >= premium75
      ? 'PREMIUM (SELL BIAS)'
      : currentPrice >= midpoint
        ? 'UPPER PREMIUM'
        : currentPrice <= discount25
          ? 'DISCOUNT (BUY BIAS)'
          : 'LOWER DISCOUNT'

  return {
    equilibrium: midpoint,
    premium75,
    discount25,
    currentZone: zone,
    isPremium: currentPrice > midpoint,
    isDiscount: currentPrice < midpoint,
    percentile: ((currentPrice - low) / range * 100).toFixed(1),
  }
}

export function getOptimalEntry(pdArray, structureBias) {
  if (structureBias === 'UPTREND' && pdArray.isDiscount) {
    return { signal: 'OPTIMAL BUY ZONE', quality: 'A+' }
  }
  if (structureBias === 'DOWNTREND' && pdArray.isPremium) {
    return { signal: 'OPTIMAL SELL ZONE', quality: 'A+' }
  }
  if (structureBias === 'UPTREND' && pdArray.isPremium) {
    return { signal: 'WAIT - PRICE IN PREMIUM', quality: 'C' }
  }
  if (structureBias === 'DOWNTREND' && pdArray.isDiscount) {
    return { signal: 'WAIT - PRICE IN DISCOUNT', quality: 'C' }
  }
  return { signal: 'NEUTRAL', quality: 'B' }
}
