function body(c) {
  return Math.abs(c.close - c.open)
}

function upperWick(c) {
  return c.high - Math.max(c.open, c.close)
}

function lowerWick(c) {
  return Math.min(c.open, c.close) - c.low
}

function isBull(c) {
  return c.close > c.open
}

function isBear(c) {
  return c.close < c.open
}

export function detectPatterns(candles) {
  if (candles.length < 3) return []
  const c = candles[candles.length - 1]
  const p1 = candles[candles.length - 2]
  const p2 = candles[candles.length - 3]
  const detected = []

  if (body(c) < (c.high - c.low) * 0.1) {
    detected.push({ name: 'Doji', type: 'neutral', strength: 1 })
  }

  if (lowerWick(c) > body(c) * 2 && upperWick(c) < body(c) * 0.5) {
    detected.push({ name: 'Hammer', type: 'bullish', strength: 2 })
  }

  if (upperWick(c) > body(c) * 2 && lowerWick(c) < body(c) * 0.5) {
    detected.push({ name: 'Shooting Star', type: 'bearish', strength: 2 })
  }

  if (upperWick(c) < body(c) * 0.05 && lowerWick(c) < body(c) * 0.05) {
    detected.push({
      name: isBull(c) ? 'Bullish Marubozu' : 'Bearish Marubozu',
      type: isBull(c) ? 'bullish' : 'bearish',
      strength: 3,
    })
  }

  if (body(c) < (c.high - c.low) * 0.25 && upperWick(c) > body(c) && lowerWick(c) > body(c)) {
    detected.push({ name: 'Spinning Top', type: 'neutral', strength: 1 })
  }

  if (isBear(p1) && isBull(c) && c.open < p1.close && c.close > p1.open) {
    detected.push({ name: 'Bullish Engulfing', type: 'bullish', strength: 3 })
  }

  if (isBull(p1) && isBear(c) && c.open > p1.close && c.close < p1.open) {
    detected.push({ name: 'Bearish Engulfing', type: 'bearish', strength: 3 })
  }

  if (Math.abs(c.low - p1.low) < (c.high - c.low) * 0.05 && isBear(p1) && isBull(c)) {
    detected.push({ name: 'Tweezer Bottom', type: 'bullish', strength: 2 })
  }

  if (Math.abs(c.high - p1.high) < (c.high - c.low) * 0.05 && isBull(p1) && isBear(c)) {
    detected.push({ name: 'Tweezer Top', type: 'bearish', strength: 2 })
  }

  if (isBear(p1) && isBull(c) && c.open > p1.close && c.close < p1.open) {
    detected.push({ name: 'Bullish Harami', type: 'bullish', strength: 2 })
  }

  if (isBull(p1) && isBear(c) && c.open < p1.close && c.close > p1.open) {
    detected.push({ name: 'Bearish Harami', type: 'bearish', strength: 2 })
  }

  if (isBear(p2) && body(p1) < body(p2) * 0.3 && isBull(c) && c.close > (p2.open + p2.close) / 2) {
    detected.push({ name: 'Morning Star', type: 'bullish', strength: 3 })
  }

  if (isBull(p2) && body(p1) < body(p2) * 0.3 && isBear(c) && c.close < (p2.open + p2.close) / 2) {
    detected.push({ name: 'Evening Star', type: 'bearish', strength: 3 })
  }

  if (isBull(p2) && isBull(p1) && isBull(c) && c.close > p1.close && p1.close > p2.close) {
    detected.push({ name: 'Three White Soldiers', type: 'bullish', strength: 3 })
  }

  if (isBear(p2) && isBear(p1) && isBear(c) && c.close < p1.close && p1.close < p2.close) {
    detected.push({ name: 'Three Black Crows', type: 'bearish', strength: 3 })
  }

  return detected
}
