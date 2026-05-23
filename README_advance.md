# FOREX AI INTELLIGENCE SYSTEM — ADVANCED EDITION
### Professional Full-Stack Trading Intelligence Platform

> Institutional-grade Forex trading intelligence combining real-time multi-source price feeds, 20+ advanced technical and SMC strategies, Claude AI deep analysis, WebSocket live streaming, multi-timeframe confluence scoring, automated alerting, broker API integration, and a professional dark-mode React dashboard.

---

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8)
![Claude](https://img.shields.io/badge/Claude-Sonnet--4-orange)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## What Was Built Previously (Steps 1–12)

The foundation covered:

- Vite + React scaffold with Tailwind CSS
- Live price feeds via Frankfurter ECB API (5-second polling)
- Candlestick chart with Chart.js
- RSI, EMA, MACD, Fibonacci indicators
- SMC pattern detection: BOS, CHOCH, FVG, Order Blocks
- Claude AI signal engine with BUY/SELL/WAIT + SL/TP output
- News and economic calendar panel
- Basic risk calculator (lot size)
- Trade journal in localStorage
- Browser push notifications
- Vercel deployment with serverless API proxy

---

## What This Document Adds (Steps 13–30)

This document extends the project with 18 advanced steps that transform it into a high-level institutional-grade platform. Each step is fully additive — bolt them on top of the existing codebase without breaking what is already working.

---

## Table of Contents

- [Step 13 — WebSocket Real-Time Price Streaming](#step-13--websocket-real-time-price-streaming)
- [Step 14 — Multi-Timeframe Confluence Engine](#step-14--multi-timeframe-confluence-engine)
- [Step 15 — Advanced Candlestick Pattern Recognition](#step-15--advanced-candlestick-pattern-recognition)
- [Step 16 — Institutional Order Flow Analysis](#step-16--institutional-order-flow-analysis)
- [Step 17 — Market Structure Map (Swing Points & Highs/Lows)](#step-17--market-structure-map-swing-points--highslows)
- [Step 18 — Liquidity Zone Detection](#step-18--liquidity-zone-detection)
- [Step 19 — Premium & Discount Zone (PD Array)](#step-19--premium--discount-zone-pd-array)
- [Step 20 — Advanced AI Prompt Engineering (Chain-of-Thought)](#step-20--advanced-ai-prompt-engineering-chain-of-thought)
- [Step 21 — AI Market Sentiment Analyzer](#step-21--ai-market-sentiment-analyzer)
- [Step 22 — Professional UI Overhaul](#step-22--professional-ui-overhaul)
- [Step 23 — Advanced Charting with TradingView Lightweight Charts](#step-23--advanced-charting-with-tradingview-lightweight-charts)
- [Step 24 — Heatmap & Correlation Matrix Panel](#step-24--heatmap--correlation-matrix-panel)
- [Step 25 — Session Killzone Overlay](#step-25--session-killzone-overlay)
- [Step 26 — Backtesting Engine](#step-26--backtesting-engine)
- [Step 27 — Advanced Risk & Portfolio Management](#step-27--advanced-risk--portfolio-management)
- [Step 28 — Telegram & Discord Signal Bot](#step-28--telegram--discord-signal-bot)
- [Step 29 — Authentication & Multi-User Support](#step-29--authentication--multi-user-support)
- [Step 30 — Production Hardening & Performance](#step-30--production-hardening--performance)
- [Full Folder Structure](#full-folder-structure)
- [Environment Variables Reference](#environment-variables-reference)
- [Strategy Reference Table](#strategy-reference-table)
- [Tech Stack Overview](#tech-stack-overview)

---

## Step 13 — WebSocket Real-Time Price Streaming

**Goal:** Replace the 5-second polling interval with genuine WebSocket streaming for true tick-by-tick price updates with sub-second latency.

**Why it matters:** Polling introduces up to 5 seconds of price lag. WebSocket streams fire on every real market tick, making the system suitable for scalping and short-term trading.

**Install:**
```bash
npm install reconnecting-websocket
```

**File:** `src/services/priceSocket.js`

```js
import ReconnectingWebSocket from 'reconnecting-websocket'

// Free tier: Polygon.io WebSocket (requires free API key)
// Alternative: Tiingo WebSocket, Alpaca Markets, FXCM Streaming
const WS_URL = 'wss://socket.polygon.io/forex'

let socket = null
const subscribers = new Map()

export function connectPriceSocket(apiKey) {
  socket = new ReconnectingWebSocket(WS_URL, [], {
    maxRetries: 10,
    reconnectionDelayGrowFactor: 1.3,
    minReconnectionDelay: 1000,
  })

  socket.onopen = () => {
    socket.send(JSON.stringify({ action: 'auth', params: apiKey }))
    socket.send(JSON.stringify({
      action: 'subscribe',
      params: 'C.EUR/USD,C.GBP/USD,C.USD/JPY,C.USD/CHF,C.AUD/USD,C.NZD/USD,C.USD/CAD,C.EUR/GBP,C.EUR/JPY'
    }))
  }

  socket.onmessage = (event) => {
    const messages = JSON.parse(event.data)
    messages.forEach(msg => {
      if (msg.ev !== 'C') return   // Currency tick event
      const pair = msg.p.replace('/', '')  // "EURUSD" → "EUR/USD"
      const normalizedPair = `${pair.slice(0,3)}/${pair.slice(3)}`
      const tick = {
        pair: normalizedPair,
        bid: msg.b,
        ask: msg.a,
        mid: (msg.b + msg.a) / 2,
        spread: +(msg.a - msg.b).toFixed(5),
        timestamp: msg.t,
      }
      subscribers.forEach(cb => cb(tick))
    })
  }

  socket.onerror = (err) => console.error('[PriceSocket] Error:', err)
  socket.onclose = () => console.warn('[PriceSocket] Disconnected. Reconnecting...')
}

export function subscribeTicks(id, callback) {
  subscribers.set(id, callback)
}

export function unsubscribeTicks(id) {
  subscribers.delete(id)
}

export function disconnectPriceSocket() {
  if (socket) socket.close()
}
```

**File:** `src/hooks/useTickStream.js`

```js
import { useEffect, useState, useRef } from 'react'
import { connectPriceSocket, subscribeTicks, unsubscribeTicks } from '../services/priceSocket'

export function useTickStream(apiKey) {
  const [latestTick, setLatestTick] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const idRef = useRef(`tick-${Date.now()}`)

  useEffect(() => {
    if (!apiKey) return
    connectPriceSocket(apiKey)
    setIsConnected(true)
    subscribeTicks(idRef.current, (tick) => {
      setLatestTick(tick)
    })
    return () => {
      unsubscribeTicks(idRef.current)
      setIsConnected(false)
    }
  }, [apiKey])

  return { latestTick, isConnected }
}
```

**Integrate into existing `useLivePrices.js`:**

```js
// In useLivePrices.js, replace the setInterval polling block:
const { latestTick } = useTickStream(import.meta.env.VITE_POLYGON_API_KEY)

useEffect(() => {
  if (!latestTick) return
  setPrices(prev => ({ ...prev, [latestTick.pair]: latestTick.mid }))
  setHistory(prev => ({
    ...prev,
    [latestTick.pair]: [...(prev[latestTick.pair] || []).slice(-299), latestTick.mid]
  }))
}, [latestTick])
```

**Connection status indicator in `TopBar.jsx`:**

```jsx
<div className={`flex items-center gap-1.5 text-xs font-mono ${isConnected ? 'text-bull' : 'text-bear'}`}>
  <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-bull animate-pulse' : 'bg-bear'}`} />
  {isConnected ? 'WS LIVE' : 'RECONNECTING'}
</div>
```

**Free WebSocket providers (no broker account needed):**

| Provider | Free Tier | Pairs | Latency |
|---|---|---|---|
| Polygon.io | 5 connections, delayed | 60+ FX pairs | ~100ms |
| Tiingo | Unlimited free | 40+ FX pairs | ~200ms |
| Alpaca Markets | Free paper trading | Major pairs | ~50ms |
| Bitfinex (crypto FX) | Free, no key | BTC/USD, ETH pairs | ~30ms |

---

## Step 14 — Multi-Timeframe Confluence Engine

**Goal:** Instead of analyzing a single timeframe, evaluate the same pair across M5, M15, H1, H4, and D1 simultaneously. A signal only fires when at least 3 timeframes agree.

**Why it matters:** Multi-timeframe analysis is the single most powerful filter for reducing false signals. Institutional traders never trade on one timeframe alone.

**File:** `src/utils/mtfAnalysis.js`

```js
import { calcRSI, calcEMA, calcTrend } from './indicators'
import { analyzeSMC, getConfluenceScore } from './smcAnalysis'

const TIMEFRAMES = ['M5', 'M15', 'H1', 'H4', 'D1']

// Simulate multi-timeframe price histories from a single tick array
// In production: fetch each TF separately from your data provider
export function buildMTFHistories(tickHistory) {
  const compress = (arr, factor) => {
    const out = []
    for (let i = 0; i < arr.length; i += factor) {
      const slice = arr.slice(i, i + factor)
      out.push(slice[slice.length - 1])   // close of each bar
    }
    return out
  }

  return {
    M5:  tickHistory,
    M15: compress(tickHistory, 3),
    H1:  compress(tickHistory, 12),
    H4:  compress(tickHistory, 48),
    D1:  compress(tickHistory, 288),
  }
}

export function runMTFAnalysis(tickHistory, ohlc) {
  const histories = buildMTFHistories(tickHistory)
  const results = {}

  TIMEFRAMES.forEach(tf => {
    const prices = histories[tf]
    if (prices.length < 15) {
      results[tf] = { trend: 'NEUTRAL', rsi: 50, score: 50, bias: 'NEUTRAL' }
      return
    }
    const strategies = analyzeSMC('', prices, {
      high: Math.max(...prices),
      low:  Math.min(...prices),
      open: prices[0],
    })
    const score = getConfluenceScore(strategies)
    results[tf] = {
      trend:    calcTrend(prices),
      rsi:      calcRSI(prices),
      ema20:    calcEMA(prices, 20),
      score,
      bias:     score >= 62 ? 'BULLISH' : score <= 38 ? 'BEARISH' : 'NEUTRAL',
      strategies,
    }
  })

  // Aggregate decision
  const biases = TIMEFRAMES.map(tf => results[tf].bias)
  const bullCount = biases.filter(b => b === 'BULLISH').length
  const bearCount = biases.filter(b => b === 'BEARISH').length

  const overallBias =
    bullCount >= 3 ? 'STRONG BULLISH' :
    bullCount === 2 ? 'MILD BULLISH'  :
    bearCount >= 3 ? 'STRONG BEARISH' :
    bearCount === 2 ? 'MILD BEARISH'  : 'NEUTRAL'

  const aligned = bullCount >= 3 || bearCount >= 3
  const confidence = bullCount >= 4 || bearCount >= 4 ? 'HIGH' : aligned ? 'MEDIUM' : 'LOW'

  return { timeframes: results, overallBias, bullCount, bearCount, confidence, aligned }
}
```

**File:** `src/components/MTFPanel.jsx`

```jsx
import { useMemo } from 'react'
import { runMTFAnalysis } from '../utils/mtfAnalysis'

const TF_ORDER = ['M5', 'M15', 'H1', 'H4', 'D1']
const BIAS_COLOR = { 'BULLISH': 'text-bull', 'BEARISH': 'text-bear', 'NEUTRAL': 'text-neutral' }

export default function MTFPanel({ history, ohlc }) {
  const mtf = useMemo(() => runMTFAnalysis(history, ohlc), [history])

  return (
    <div className="panel">
      <div className="panel-label">Multi-Timeframe Confluence</div>
      <div className="grid grid-cols-5 gap-1 mb-4">
        {TF_ORDER.map(tf => {
          const d = mtf.timeframes[tf]
          return (
            <div key={tf} className="flex flex-col items-center gap-1 bg-surface rounded-lg p-2">
              <span className="text-xs text-muted font-mono">{tf}</span>
              <span className={`text-xs font-medium ${BIAS_COLOR[d?.bias] || 'text-muted'}`}>
                {d?.bias || '—'}
              </span>
              <div className="w-full bg-background rounded-full h-1 mt-1">
                <div
                  className={`h-1 rounded-full transition-all ${d?.bias === 'BULLISH' ? 'bg-bull' : d?.bias === 'BEARISH' ? 'bg-bear' : 'bg-neutral'}`}
                  style={{ width: `${d?.score || 50}%` }}
                />
              </div>
              <span className="text-xs font-mono text-muted">RSI {d?.rsi || '—'}</span>
            </div>
          )
        })}
      </div>
      <div className={`flex items-center justify-between rounded-lg p-3 border ${
        mtf.overallBias.includes('BULL') ? 'border-bull/30 bg-bull/5' :
        mtf.overallBias.includes('BEAR') ? 'border-bear/30 bg-bear/5' :
        'border-neutral/30 bg-neutral/5'
      }`}>
        <div>
          <div className="text-xs text-muted mb-0.5">Overall Bias</div>
          <div className={`text-sm font-medium ${mtf.overallBias.includes('BULL') ? 'text-bull' : mtf.overallBias.includes('BEAR') ? 'text-bear' : 'text-neutral'}`}>
            {mtf.overallBias}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted mb-0.5">TF Agreement</div>
          <div className="text-sm font-mono">{Math.max(mtf.bullCount, mtf.bearCount)}/5 aligned</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted mb-0.5">Signal Grade</div>
          <div className={`text-sm font-medium ${mtf.confidence === 'HIGH' ? 'text-bull' : mtf.confidence === 'LOW' ? 'text-bear' : 'text-neutral'}`}>
            {mtf.confidence}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Step 15 — Advanced Candlestick Pattern Recognition

**Goal:** Detect 15+ Japanese candlestick patterns in real time and incorporate them into the AI signal prompt.

**File:** `src/utils/candlePatterns.js`

```js
// Each function receives the last N candles as { open, high, low, close } objects
// Returns { detected: boolean, name, type: 'bullish'|'bearish'|'neutral', strength: 1-3 }

function body(c) { return Math.abs(c.close - c.open) }
function upperWick(c) { return c.high - Math.max(c.open, c.close) }
function lowerWick(c) { return Math.min(c.open, c.close) - c.low }
function isBull(c) { return c.close > c.open }
function isBear(c) { return c.close < c.open }

export function detectPatterns(candles) {
  if (candles.length < 3) return []
  const c  = candles[candles.length - 1]   // current
  const p1 = candles[candles.length - 2]   // previous
  const p2 = candles[candles.length - 3]   // 2 back
  const detected = []

  // ── Single candle patterns ──────────────────────────────

  // Doji — open ≈ close, small body
  if (body(c) < (c.high - c.low) * 0.1) {
    detected.push({ name: 'Doji', type: 'neutral', strength: 1 })
  }

  // Hammer — small body at top, long lower wick (bullish reversal)
  if (lowerWick(c) > body(c) * 2 && upperWick(c) < body(c) * 0.5) {
    detected.push({ name: 'Hammer', type: 'bullish', strength: 2 })
  }

  // Shooting Star — small body at bottom, long upper wick (bearish reversal)
  if (upperWick(c) > body(c) * 2 && lowerWick(c) < body(c) * 0.5) {
    detected.push({ name: 'Shooting Star', type: 'bearish', strength: 2 })
  }

  // Marubozu — no wicks, pure momentum candle
  if (upperWick(c) < body(c) * 0.05 && lowerWick(c) < body(c) * 0.05) {
    detected.push({ name: isBull(c) ? 'Bullish Marubozu' : 'Bearish Marubozu', type: isBull(c) ? 'bullish' : 'bearish', strength: 3 })
  }

  // Spinning Top — small body, long wicks on both sides
  if (body(c) < (c.high - c.low) * 0.25 && upperWick(c) > body(c) && lowerWick(c) > body(c)) {
    detected.push({ name: 'Spinning Top', type: 'neutral', strength: 1 })
  }

  // ── Two candle patterns ─────────────────────────────────

  // Bullish Engulfing
  if (isBear(p1) && isBull(c) && c.open < p1.close && c.close > p1.open) {
    detected.push({ name: 'Bullish Engulfing', type: 'bullish', strength: 3 })
  }

  // Bearish Engulfing
  if (isBull(p1) && isBear(c) && c.open > p1.close && c.close < p1.open) {
    detected.push({ name: 'Bearish Engulfing', type: 'bearish', strength: 3 })
  }

  // Tweezer Bottom — two nearly equal lows after downtrend (bullish)
  if (Math.abs(c.low - p1.low) < (c.high - c.low) * 0.05 && isBear(p1) && isBull(c)) {
    detected.push({ name: 'Tweezer Bottom', type: 'bullish', strength: 2 })
  }

  // Tweezer Top — two nearly equal highs after uptrend (bearish)
  if (Math.abs(c.high - p1.high) < (c.high - c.low) * 0.05 && isBull(p1) && isBear(c)) {
    detected.push({ name: 'Tweezer Top', type: 'bearish', strength: 2 })
  }

  // Harami Bullish — small bull candle inside large bear candle
  if (isBear(p1) && isBull(c) && c.open > p1.close && c.close < p1.open) {
    detected.push({ name: 'Bullish Harami', type: 'bullish', strength: 2 })
  }

  // Harami Bearish
  if (isBull(p1) && isBear(c) && c.open < p1.close && c.close > p1.open) {
    detected.push({ name: 'Bearish Harami', type: 'bearish', strength: 2 })
  }

  // ── Three candle patterns ───────────────────────────────

  // Morning Star — bearish, doji/small, bullish (strong bullish reversal)
  if (isBear(p2) && body(p1) < body(p2) * 0.3 && isBull(c) && c.close > (p2.open + p2.close) / 2) {
    detected.push({ name: 'Morning Star', type: 'bullish', strength: 3 })
  }

  // Evening Star
  if (isBull(p2) && body(p1) < body(p2) * 0.3 && isBear(c) && c.close < (p2.open + p2.close) / 2) {
    detected.push({ name: 'Evening Star', type: 'bearish', strength: 3 })
  }

  // Three White Soldiers — three consecutive bullish candles
  if (isBull(p2) && isBull(p1) && isBull(c) && c.close > p1.close && p1.close > p2.close) {
    detected.push({ name: 'Three White Soldiers', type: 'bullish', strength: 3 })
  }

  // Three Black Crows
  if (isBear(p2) && isBear(p1) && isBear(c) && c.close < p1.close && p1.close < p2.close) {
    detected.push({ name: 'Three Black Crows', type: 'bearish', strength: 3 })
  }

  return detected
}
```

**File:** `src/components/PatternBadges.jsx`

```jsx
export default function PatternBadges({ patterns }) {
  if (!patterns.length) return <div className="text-xs text-muted">No patterns detected on current bar.</div>

  const colorMap = { bullish: 'bg-bull/10 text-bull border-bull/30', bearish: 'bg-bear/10 text-bear border-bear/30', neutral: 'bg-neutral/10 text-neutral border-neutral/30' }
  const stars = (s) => '★'.repeat(s) + '☆'.repeat(3 - s)

  return (
    <div className="flex flex-wrap gap-2">
      {patterns.map((p, i) => (
        <div key={i} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${colorMap[p.type]}`}>
          <span>{p.name}</span>
          <span className="opacity-60 text-xs">{stars(p.strength)}</span>
        </div>
      ))}
    </div>
  )
}
```

---

## Step 16 — Institutional Order Flow Analysis

**Goal:** Detect volume anomalies, delta (buy vs sell pressure), and cumulative volume delta (CVD) to identify where institutions are buying or selling.

**File:** `src/utils/orderFlow.js`

```js
// Simulate order flow from tick data
// In production: connect to CME futures data or your broker's L2 book

export function calcVolumeDelta(ticks) {
  // Tick rule: price up = buyer-initiated, price down = seller-initiated
  let buyVol = 0, sellVol = 0
  for (let i = 1; i < ticks.length; i++) {
    const vol = 1  // normalize to 1 unit per tick; replace with real volume
    if (ticks[i] > ticks[i - 1]) buyVol += vol
    else if (ticks[i] < ticks[i - 1]) sellVol += vol
  }
  const delta = buyVol - sellVol
  const pressure = delta > 5 ? 'BUYING' : delta < -5 ? 'SELLING' : 'BALANCED'
  return { buyVol, sellVol, delta, pressure }
}

export function calcCVD(ticks) {
  // Cumulative Volume Delta — tracks running buy vs sell imbalance
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
  // Z-score based anomaly detection
  const deltas = []
  for (let i = 1; i < ticks.length; i++) {
    deltas.push(Math.abs(ticks[i] - ticks[i - 1]))
  }
  const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length
  const std = Math.sqrt(deltas.map(d => (d - mean) ** 2).reduce((a, b) => a + b, 0) / deltas.length)
  const latest = deltas[deltas.length - 1] || 0
  const zScore = std > 0 ? (latest - mean) / std : 0
  return {
    zScore: parseFloat(zScore.toFixed(2)),
    isAnomaly: Math.abs(zScore) > 2,
    direction: latest > mean ? 'SPIKE UP' : 'SPIKE DOWN',
  }
}

export function getImbalanceZones(prices, windowSize = 10) {
  // Find price regions with large directional moves (institutional imbalance)
  const zones = []
  for (let i = windowSize; i < prices.length; i++) {
    const window = prices.slice(i - windowSize, i)
    const move = prices[i] - prices[i - windowSize]
    const volatility = Math.max(...window) - Math.min(...window)
    if (Math.abs(move) > volatility * 0.7) {
      zones.push({
        startPrice: prices[i - windowSize],
        endPrice:   prices[i],
        type:       move > 0 ? 'BULLISH IMBALANCE' : 'BEARISH IMBALANCE',
        strength:   Math.abs(move / volatility),
        index:      i,
      })
    }
  }
  return zones.slice(-5)  // Return 5 most recent zones
}
```

---

## Step 17 — Market Structure Map (Swing Points & Highs/Lows)

**Goal:** Automatically identify and draw Higher Highs (HH), Higher Lows (HL), Lower Highs (LH), and Lower Lows (LL) to determine the macro market structure.

**File:** `src/utils/marketStructure.js`

```js
export function detectSwingPoints(prices, lookback = 5) {
  const swings = []
  for (let i = lookback; i < prices.length - lookback; i++) {
    const left  = prices.slice(i - lookback, i)
    const right = prices.slice(i + 1, i + lookback + 1)
    const isHigh = prices[i] > Math.max(...left) && prices[i] > Math.max(...right)
    const isLow  = prices[i] < Math.min(...left) && prices[i] < Math.min(...right)
    if (isHigh) swings.push({ index: i, price: prices[i], type: 'HIGH' })
    if (isLow)  swings.push({ index: i, price: prices[i], type: 'LOW' })
  }
  return swings
}

export function classifyStructure(swings) {
  const highs = swings.filter(s => s.type === 'HIGH')
  const lows  = swings.filter(s => s.type === 'LOW')
  if (highs.length < 2 || lows.length < 2) return { trend: 'UNDEFINED', points: [] }

  const lastTwoHighs = highs.slice(-2)
  const lastTwoLows  = lows.slice(-2)

  const hh = lastTwoHighs[1].price > lastTwoHighs[0].price
  const hl = lastTwoLows[1].price  > lastTwoLows[0].price
  const lh = lastTwoHighs[1].price < lastTwoHighs[0].price
  const ll = lastTwoLows[1].price  < lastTwoLows[0].price

  let trend = 'RANGING'
  if (hh && hl)   trend = 'UPTREND'     // HH + HL = bullish structure
  if (lh && ll)   trend = 'DOWNTREND'   // LH + LL = bearish structure
  if (hh && ll)   trend = 'TRANSITION'  // Conflicting — structure shift

  return {
    trend,
    lastHigh:     lastTwoHighs[1],
    lastLow:      lastTwoLows[1],
    prevHigh:     lastTwoHighs[0],
    prevLow:      lastTwoLows[0],
    isHH: hh, isHL: hl, isLH: lh, isLL: ll,
  }
}

export function findKeyLevels(swings, currentPrice) {
  const nearbyRange = currentPrice * 0.005   // within 0.5%
  const support = swings
    .filter(s => s.type === 'LOW' && s.price < currentPrice)
    .sort((a, b) => b.price - a.price)
    .slice(0, 3)
  const resistance = swings
    .filter(s => s.type === 'HIGH' && s.price > currentPrice)
    .sort((a, b) => a.price - b.price)
    .slice(0, 3)
  const nearSupport    = support.some(s => Math.abs(s.price - currentPrice) < nearbyRange)
  const nearResistance = resistance.some(s => Math.abs(s.price - currentPrice) < nearbyRange)
  return { support, resistance, nearSupport, nearResistance }
}
```

---

## Step 18 — Liquidity Zone Detection

**Goal:** Identify where stop-loss clusters (liquidity) sit above and below price. Institutions target these zones for entries.

**File:** `src/utils/liquidityZones.js`

```js
export function detectLiquidityZones(swings, pipSize = 0.0001) {
  // Equal Highs — multiple swing highs at the same level (BSL: Buy-Side Liquidity)
  const highs = swings.filter(s => s.type === 'HIGH')
  const lows  = swings.filter(s => s.type === 'LOW')
  const tolerance = pipSize * 5   // within 5 pips

  const equalHighs = []
  for (let i = 0; i < highs.length; i++) {
    for (let j = i + 1; j < highs.length; j++) {
      if (Math.abs(highs[i].price - highs[j].price) < tolerance) {
        equalHighs.push({ price: (highs[i].price + highs[j].price) / 2, type: 'BSL', label: 'Buy-Side Liquidity' })
      }
    }
  }

  const equalLows = []
  for (let i = 0; i < lows.length; i++) {
    for (let j = i + 1; j < lows.length; j++) {
      if (Math.abs(lows[i].price - lows[j].price) < tolerance) {
        equalLows.push({ price: (lows[i].price + lows[j].price) / 2, type: 'SSL', label: 'Sell-Side Liquidity' })
      }
    }
  }

  // Previous Day High/Low — major retail stop clusters
  const pdh = Math.max(...highs.map(h => h.price))
  const pdl = Math.min(...lows.map(l => l.price))

  return {
    bsl:  equalHighs,    // Buy-Side Liquidity (stops above equal highs)
    ssl:  equalLows,     // Sell-Side Liquidity (stops below equal lows)
    pdh,
    pdl,
    summary: `BSL at ${equalHighs[0]?.price?.toFixed(5) || 'none'}, SSL at ${equalLows[0]?.price?.toFixed(5) || 'none'}`
  }
}
```

---

## Step 19 — Premium & Discount Zone (PD Array)

**Goal:** Calculate the Premium (above 50% of the range — sell zone) and Discount (below 50% — buy zone) using the session's trading range, aligned with ICT methodology.

**File:** `src/utils/pdArray.js`

```js
export function calcPDArray(high, low, currentPrice) {
  const range     = high - low
  const midpoint  = low + range * 0.5
  const premium75 = low + range * 0.75
  const discount25= low + range * 0.25

  const zone =
    currentPrice >= premium75  ? 'PREMIUM (SELL BIAS)'   :
    currentPrice >= midpoint   ? 'UPPER PREMIUM'          :
    currentPrice <= discount25 ? 'DISCOUNT (BUY BIAS)'   :
                                  'LOWER DISCOUNT'

  return {
    equilibrium: midpoint,
    premium75,
    discount25,
    currentZone: zone,
    isPremium:  currentPrice > midpoint,
    isDiscount: currentPrice < midpoint,
    percentile: ((currentPrice - low) / range * 100).toFixed(1),
  }
}

export function getOptimalEntry(pdArray, structureBias) {
  // ICT rule: buy in discount when structure is bullish, sell in premium when bearish
  if (structureBias === 'UPTREND' && pdArray.isDiscount)   return { signal: 'OPTIMAL BUY ZONE', quality: 'A+' }
  if (structureBias === 'DOWNTREND' && pdArray.isPremium)  return { signal: 'OPTIMAL SELL ZONE', quality: 'A+' }
  if (structureBias === 'UPTREND' && pdArray.isPremium)    return { signal: 'WAIT — PRICE IN PREMIUM', quality: 'C' }
  if (structureBias === 'DOWNTREND' && pdArray.isDiscount) return { signal: 'WAIT — PRICE IN DISCOUNT', quality: 'C' }
  return { signal: 'NEUTRAL', quality: 'B' }
}
```

---

## Step 20 — Advanced AI Prompt Engineering (Chain-of-Thought)

**Goal:** Upgrade the Claude prompt from a single-shot request to a Chain-of-Thought (CoT) multi-step reasoning prompt that forces the AI to reason through market structure, liquidity, PD arrays, candlestick patterns, and MTF confluence before issuing a signal.

**File:** `src/services/claudeSignal.js` — **replace the prompt entirely:**

```js
export async function generateSignal(data) {
  const {
    pair, timeframe, price, bid, ask, spread,
    ohlc, rsi, ema20, ema50, macd,
    trend, session, strategies,
    mtf,            // from Step 14
    patterns,       // from Step 15
    orderFlow,      // from Step 16
    structure,      // from Step 17
    liquidity,      // from Step 18
    pdArray,        // from Step 19
    optimalEntry,   // from Step 19
    news,           // from Step 8
  } = data

  const patternList = patterns.map(p => `${p.name} (${p.type}, strength ${p.strength}/3)`).join(', ') || 'None'
  const stratList   = strategies.map(s => `${s.name}: ${s.signal}`).join('\n  ')
  const mtfSummary  = Object.entries(mtf.timeframes)
    .map(([tf, d]) => `${tf}: ${d.bias} (RSI ${d.rsi}, score ${d.score}%)`)
    .join('\n  ')

  const prompt = `You are an elite Forex market analyst trained in ICT (Inner Circle Trader) methodology, Smart Money Concepts, and institutional order flow. You will reason through this analysis step by step before reaching a conclusion.

═══════════════════════════════════════════════════════
LIVE MARKET DATA
═══════════════════════════════════════════════════════
Pair:          ${pair}
Timeframe:     ${timeframe}
Live Price:    ${price}
Bid/Ask:       ${bid} / ${ask}  (spread: ${spread} pips)
Session:       ${session}
Day High/Low:  ${ohlc.high} / ${ohlc.low}
Day Open:      ${ohlc.open}

═══════════════════════════════════════════════════════
STEP 1 — MARKET STRUCTURE (reason through this first)
═══════════════════════════════════════════════════════
Swing Structure:  ${structure.trend}
Last HH/HL:       High at ${structure.lastHigh?.price?.toFixed(5)}, Low at ${structure.lastLow?.price?.toFixed(5)}
Key Levels:       Support: ${structure.support?.[0]?.price?.toFixed(5)}, Resistance: ${structure.resistance?.[0]?.price?.toFixed(5)}

═══════════════════════════════════════════════════════
STEP 2 — PREMIUM / DISCOUNT ZONE
═══════════════════════════════════════════════════════
Current Zone:    ${pdArray.currentZone}
Percentile:      ${pdArray.percentile}% of session range
Equilibrium:     ${pdArray.equilibrium?.toFixed(5)}
Entry Quality:   ${optimalEntry.signal} (Grade: ${optimalEntry.quality})

═══════════════════════════════════════════════════════
STEP 3 — LIQUIDITY ANALYSIS
═══════════════════════════════════════════════════════
${liquidity.summary}
Buy-Side Liquidity (BSL):  ${liquidity.bsl.map(z => z.price.toFixed(5)).join(', ') || 'None detected'}
Sell-Side Liquidity (SSL): ${liquidity.ssl.map(z => z.price.toFixed(5)).join(', ') || 'None detected'}
Previous Day High:         ${liquidity.pdh?.toFixed(5)}
Previous Day Low:          ${liquidity.pdl?.toFixed(5)}

═══════════════════════════════════════════════════════
STEP 4 — MULTI-TIMEFRAME CONFLUENCE
═══════════════════════════════════════════════════════
  ${mtfSummary}
Overall Bias:   ${mtf.overallBias}
TF Agreement:   ${Math.max(mtf.bullCount, mtf.bearCount)}/5 timeframes aligned
MTF Grade:      ${mtf.confidence}

═══════════════════════════════════════════════════════
STEP 5 — SMC PATTERN CONFLUENCE
═══════════════════════════════════════════════════════
  ${stratList}

═══════════════════════════════════════════════════════
STEP 6 — CANDLESTICK PATTERNS
═══════════════════════════════════════════════════════
${patternList}

═══════════════════════════════════════════════════════
STEP 7 — ORDER FLOW
═══════════════════════════════════════════════════════
Buy Volume / Sell Volume: ${orderFlow.buyVol} / ${orderFlow.sellVol}
Volume Delta:   ${orderFlow.delta > 0 ? '+' : ''}${orderFlow.delta} (${orderFlow.pressure})
Volume Anomaly: ${orderFlow.anomaly?.isAnomaly ? '⚠ SPIKE DETECTED — ' + orderFlow.anomaly.direction : 'Normal'}

═══════════════════════════════════════════════════════
STEP 8 — MACRO & FUNDAMENTALS
═══════════════════════════════════════════════════════
${news.slice(0, 4).map(n => `- ${n.text} (${n.impact} impact)`).join('\n')}

═══════════════════════════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════════════════════════
Work through each step systematically before giving a final answer.
Consider confluences and conflicts between all data points.
Only recommend BUY or SELL if:
  - Market structure, MTF bias, and PD Array all agree
  - At least 5/8 SMC signals confirm the direction
  - Entry quality is A or A+
  - Stop loss can be placed behind a clear structural level
Otherwise recommend WAIT.

Respond ONLY as raw JSON with no markdown or backticks:
{
  "step1_structure":   "One sentence on market structure conclusion",
  "step2_pd_array":    "One sentence on where price is and what it implies",
  "step3_liquidity":   "One sentence on which liquidity pool is the target",
  "step4_mtf":         "One sentence on MTF alignment",
  "step5_smc":         "One sentence on SMC pattern confluence",
  "step6_candles":     "One sentence on candlestick confirmation",
  "step7_flow":        "One sentence on order flow bias",
  "action":            "BUY" | "SELL" | "WAIT",
  "confidence":        "HIGH" | "MEDIUM" | "LOW",
  "entry_zone":        "price level or range e.g. 1.0820-1.0835",
  "entry":             "exact entry price",
  "sl":                "stop loss price",
  "tp1":               "take profit 1 (1:1 RR)",
  "tp2":               "take profit 2 (1:2 RR)",
  "tp3":               "take profit 3 (1:3 RR)",
  "sl_pips":           number,
  "tp1_pips":          number,
  "rr":                "e.g. 1:2.5",
  "grade":             "A+" | "A" | "B" | "C",
  "invalidation":      "price level that would invalidate this setup",
  "reason":            "2-3 sentence professional summary",
  "analysis":          "5-6 sentence full institutional analysis"
}`

  const response = await fetch('/api/signal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data2 = await response.json()
  const raw = data2.content?.map(b => b.text || '').join('')
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}
```

---

## Step 21 — AI Market Sentiment Analyzer

**Goal:** Add a second AI call that scans news headlines and economic events to produce a sentiment score for each currency, displayed as a sentiment dashboard.

**File:** `src/services/sentimentAnalyzer.js`

```js
export async function analyzeSentiment(newsItems, calendarEvents, pairs) {
  const prompt = `Analyze the following Forex market news and economic events. For each major currency (USD, EUR, GBP, JPY, CHF, AUD, NZD, CAD), assign:
- A sentiment score from -100 (extremely bearish) to +100 (extremely bullish)
- A one-word label: STRONG_BULL, BULL, NEUTRAL, BEAR, STRONG_BEAR
- One sentence explanation

NEWS:
${newsItems.map(n => `- ${n.text}`).join('\n')}

ECONOMIC CALENDAR:
${calendarEvents.map(e => `- ${e.event} (${e.currency}, ${e.impact} impact)`).join('\n')}

Respond ONLY as raw JSON:
{
  "USD": { "score": number, "label": "BULL", "reason": "..." },
  "EUR": { "score": number, "label": "NEUTRAL", "reason": "..." },
  "GBP": { "score": number, "label": "BEAR", "reason": "..." },
  "JPY": { "score": number, "label": "NEUTRAL", "reason": "..." },
  "CHF": { "score": number, "label": "BULL", "reason": "..." },
  "AUD": { "score": number, "label": "BEAR", "reason": "..." },
  "NZD": { "score": number, "label": "NEUTRAL", "reason": "..." },
  "CAD": { "score": number, "label": "NEUTRAL", "reason": "..." },
  "overall_risk": "RISK_ON" | "RISK_OFF" | "NEUTRAL",
  "dxy_bias": "BULLISH" | "BEARISH" | "NEUTRAL",
  "best_long": "currency most bullish",
  "best_short": "currency most bearish",
  "top_pair": "best pair to trade e.g. EUR/USD"
}`

  const res = await fetch('/api/signal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  const raw = data.content?.map(b => b.text || '').join('')
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}
```

**File:** `src/components/SentimentDashboard.jsx`

```jsx
const CURRENCIES = ['USD','EUR','GBP','JPY','CHF','AUD','NZD','CAD']

export default function SentimentDashboard({ sentiment }) {
  if (!sentiment) return null

  return (
    <div className="panel">
      <div className="panel-label">AI Currency Sentiment</div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {CURRENCIES.map(cur => {
          const s = sentiment[cur]
          if (!s) return null
          const pct = ((s.score + 100) / 200 * 100).toFixed(0)
          const color = s.score > 20 ? '#22c55e' : s.score < -20 ? '#ef4444' : '#f59e0b'
          return (
            <div key={cur} className="bg-surface rounded-lg p-2.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-medium">{cur}</span>
                <span className="text-xs" style={{ color }}>{s.label?.replace('_', ' ')}</span>
              </div>
              <div className="w-full bg-background rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
              <div className="text-xs text-muted mt-1">{s.score > 0 ? '+' : ''}{s.score}</div>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-surface rounded-lg p-2">
          <div className="text-muted">Risk Tone</div>
          <div className="font-medium mt-0.5" style={{ color: sentiment.overall_risk === 'RISK_ON' ? '#22c55e' : sentiment.overall_risk === 'RISK_OFF' ? '#ef4444' : '#f59e0b' }}>
            {sentiment.overall_risk}
          </div>
        </div>
        <div className="bg-surface rounded-lg p-2">
          <div className="text-muted">Best Long</div>
          <div className="font-medium text-bull mt-0.5">{sentiment.best_long}</div>
        </div>
        <div className="bg-surface rounded-lg p-2">
          <div className="text-muted">Top Pair</div>
          <div className="font-medium mt-0.5">{sentiment.top_pair}</div>
        </div>
      </div>
    </div>
  )
}
```

---

## Step 22 — Professional UI Overhaul

**Goal:** Replace the basic card layout with a Bloomberg Terminal-inspired professional dark UI with glassmorphism panels, animated data cells, a command palette, and keyboard shortcuts.

**Install:**
```bash
npm install framer-motion @headlessui/react cmdk
```

**`src/index.css` — design token system:**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  /* Core palette */
  --color-bg:         #0a0b0d;
  --color-surface:    #111318;
  --color-surface-2:  #181b22;
  --color-border:     #1e2330;
  --color-border-2:   #252b3a;

  /* Typography */
  --color-text:       #e8eaf0;
  --color-muted:      #6b7280;
  --color-dimmed:     #374151;

  /* Signal colors */
  --color-bull:       #22c55e;
  --color-bear:       #ef4444;
  --color-neutral:    #f59e0b;
  --color-info:       #3b82f6;

  /* Glow effects */
  --glow-bull:        0 0 20px rgba(34, 197, 94, 0.15);
  --glow-bear:        0 0 20px rgba(239, 68, 68, 0.15);
  --glow-info:        0 0 20px rgba(59, 130, 246, 0.12);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--color-bg); color: var(--color-text); font-family: 'Inter', sans-serif; font-size: 14px; }

.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  transition: border-color 0.2s;
}
.panel:hover { border-color: var(--color-border-2); }

.panel-glass {
  background: rgba(17, 19, 24, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 16px;
}

.label { font-size: 10px; letter-spacing: 2px; color: var(--color-muted); text-transform: uppercase; margin-bottom: 10px; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

/* Live flash animation */
@keyframes flashGreen { 0%,100%{background:transparent} 50%{background:rgba(34,197,94,0.15)} }
@keyframes flashRed   { 0%,100%{background:transparent} 50%{background:rgba(239,68,68,0.15)} }
.flash-up   { animation: flashGreen 0.4s ease; }
.flash-down { animation: flashRed   0.4s ease; }

/* Signal card glow */
.signal-buy  { border: 1px solid rgba(34,197,94,0.3);  background: rgba(34,197,94,0.05);  box-shadow: var(--glow-bull); }
.signal-sell { border: 1px solid rgba(239,68,68,0.3);  background: rgba(239,68,68,0.05);  box-shadow: var(--glow-bear); }
.signal-wait { border: 1px solid rgba(245,158,11,0.3); background: rgba(245,158,11,0.05); }

/* Scrollbar */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-border-2); border-radius: 2px; }
```

**`src/components/CommandPalette.jsx` — keyboard-driven pair/action switcher:**

```jsx
import { Command } from 'cmdk'
import { useState, useEffect } from 'react'

const PAIRS = ['EUR/USD','GBP/USD','USD/JPY','USD/CHF','AUD/USD','NZD/USD','USD/CAD','EUR/GBP','EUR/JPY','XAU/USD']
const ACTIONS = ['Analyze Signal', 'Open Trade Journal', 'Export CSV', 'Toggle Theme', 'Reset Layout']

export default function CommandPalette({ onSelectPair, onAction }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-surface border border-border-2 rounded-xl shadow-2xl overflow-hidden">
        <Command>
          <div className="flex items-center px-4 border-b border-border">
            <span className="text-muted mr-3">⌘</span>
            <Command.Input placeholder="Search pairs, actions..." className="flex-1 py-4 bg-transparent outline-none text-sm" />
          </div>
          <Command.List className="max-h-64 overflow-y-auto p-2">
            <Command.Group heading="Pairs">
              {PAIRS.map(p => (
                <Command.Item key={p} onSelect={() => { onSelectPair(p); setOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-surface-2 data-[selected]:bg-surface-2">
                  <span className="font-mono text-xs w-16">{p}</span>
                  <span className="text-muted text-xs">Switch to {p}</span>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Actions">
              {ACTIONS.map(a => (
                <Command.Item key={a} onSelect={() => { onAction(a); setOpen(false) }}
                  className="px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-surface-2 data-[selected]:bg-surface-2">
                  {a}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
        <div className="px-4 py-2 border-t border-border flex gap-4 text-xs text-muted">
          <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span><span className="ml-auto">⌘K to open</span>
        </div>
      </div>
    </div>
  )
}
```

---

## Step 23 — Advanced Charting with TradingView Lightweight Charts

**Goal:** Replace Chart.js with TradingView's Lightweight Charts library for professional OHLC candlestick rendering with volume bars, support/resistance lines, and Fibonacci overlays.

**Install:**
```bash
npm install lightweight-charts
```

**File:** `src/components/AdvancedChart.jsx`

```jsx
import { useEffect, useRef } from 'react'
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts'

export default function AdvancedChart({ history, ohlc, fibLevels, swingPoints, pair }) {
  const containerRef = useRef(null)
  const chartRef     = useRef(null)
  const candleRef    = useRef(null)
  const volRef       = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 320,
      layout: { background: { color: '#111318' }, textColor: '#6b7280' },
      grid: { vertLines: { color: '#1e2330' }, horzLines: { color: '#1e2330' } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#1e2330' },
      timeScale: { borderColor: '#1e2330', timeVisible: true, secondsVisible: false },
    })

    // Candlestick series
    const candles = chart.addCandlestickSeries({
      upColor: '#22c55e', downColor: '#ef4444',
      borderUpColor: '#22c55e', borderDownColor: '#ef4444',
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    })

    // Convert price history to OHLC bars
    const now = Math.floor(Date.now() / 1000)
    const bars = history.slice(-100).map((price, i) => ({
      time: now - (100 - i) * 60,
      open:  i === 0 ? price : history[i - 1],
      high:  price * 1.0003,
      low:   price * 0.9997,
      close: price,
    }))
    candles.setData(bars)

    // Volume series
    const vol = chart.addHistogramSeries({
      color: '#3b82f6', priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
      scaleMargins: { top: 0.85, bottom: 0 },
    })
    vol.setData(bars.map((b, i) => ({
      time: b.time, value: 50 + Math.random() * 50,
      color: b.close >= b.open ? '#22c55e33' : '#ef444433'
    })))

    // Fibonacci levels as horizontal price lines
    if (fibLevels) {
      Object.entries(fibLevels).forEach(([key, price]) => {
        candles.createPriceLine({ price, color: '#f59e0b', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: key.replace('fib_', 'Fib ') })
      })
    }

    // Swing point markers
    if (swingPoints?.length) {
      const markers = swingPoints.slice(-20).map(sp => ({
        time: now - (100 - sp.index) * 60,
        position: sp.type === 'HIGH' ? 'aboveBar' : 'belowBar',
        color: sp.type === 'HIGH' ? '#ef4444' : '#22c55e',
        shape: sp.type === 'HIGH' ? 'arrowDown' : 'arrowUp',
        text: sp.type === 'HIGH' ? 'HH' : 'HL',
        size: 1,
      }))
      candles.setMarkers(markers)
    }

    chartRef.current = chart
    candleRef.current = candles

    const observer = new ResizeObserver(() => {
      chart.applyOptions({ width: containerRef.current?.clientWidth || 600 })
    })
    observer.observe(containerRef.current)

    return () => { observer.disconnect(); chart.remove() }
  }, [pair])

  // Update latest bar on every price tick
  useEffect(() => {
    if (!candleRef.current || !history.length) return
    const price = history[history.length - 1]
    candleRef.current.update({
      time: Math.floor(Date.now() / 1000),
      open: history[history.length - 2] || price,
      high: price * 1.0003,
      low:  price * 0.9997,
      close: price,
    })
  }, [history])

  return <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
}
```

---

## Step 24 — Heatmap & Correlation Matrix Panel

**Goal:** Show a live correlation matrix of all pairs and a performance heatmap, helping traders see which pairs are moving together (avoid over-correlated positions).

**File:** `src/utils/correlation.js`

```js
export function calcCorrelation(arr1, arr2) {
  const n = Math.min(arr1.length, arr2.length)
  if (n < 10) return 0
  const a = arr1.slice(-n), b = arr2.slice(-n)
  const meanA = a.reduce((s, v) => s + v, 0) / n
  const meanB = b.reduce((s, v) => s + v, 0) / n
  let num = 0, denA = 0, denB = 0
  for (let i = 0; i < n; i++) {
    num  += (a[i] - meanA) * (b[i] - meanB)
    denA += (a[i] - meanA) ** 2
    denB += (b[i] - meanB) ** 2
  }
  const denom = Math.sqrt(denA * denB)
  return denom === 0 ? 0 : parseFloat((num / denom).toFixed(2))
}

export function buildCorrelationMatrix(histories, pairs) {
  const matrix = {}
  pairs.forEach(p1 => {
    matrix[p1] = {}
    pairs.forEach(p2 => {
      matrix[p1][p2] = p1 === p2 ? 1 : calcCorrelation(histories[p1] || [], histories[p2] || [])
    })
  })
  return matrix
}
```

**File:** `src/components/CorrelationMatrix.jsx`

```jsx
import { buildCorrelationMatrix } from '../utils/correlation'

const DISPLAY_PAIRS = ['EUR/USD','GBP/USD','USD/JPY','USD/CHF','AUD/USD','USD/CAD']

function corrColor(val) {
  if (val >=  0.7) return 'bg-bull/70 text-black'
  if (val >=  0.3) return 'bg-bull/30 text-bull'
  if (val <= -0.7) return 'bg-bear/70 text-black'
  if (val <= -0.3) return 'bg-bear/30 text-bear'
  return 'bg-surface-2 text-muted'
}

export default function CorrelationMatrix({ histories }) {
  const matrix = buildCorrelationMatrix(histories, DISPLAY_PAIRS)

  return (
    <div className="panel overflow-x-auto">
      <div className="label">Pair Correlation Matrix (30 bars)</div>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-1 text-left text-muted font-normal">Pair</th>
            {DISPLAY_PAIRS.map(p => <th key={p} className="p-1 font-mono font-normal text-muted">{p.split('/')[0]}</th>)}
          </tr>
        </thead>
        <tbody>
          {DISPLAY_PAIRS.map(p1 => (
            <tr key={p1}>
              <td className="p-1 font-mono text-xs">{p1}</td>
              {DISPLAY_PAIRS.map(p2 => {
                const val = matrix[p1]?.[p2] ?? 0
                return (
                  <td key={p2} className={`p-1 text-center rounded font-mono ${corrColor(val)}`}>
                    {val.toFixed(2)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 text-xs text-muted">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-bull/70 rounded-sm" /> Strong +corr</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-bear/70 rounded-sm" /> Strong -corr</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-surface-2 rounded-sm" /> No correlation</span>
      </div>
    </div>
  )
}
```

---

## Step 25 — Session Killzone Overlay

**Goal:** Highlight the most active and profitable trading windows — ICT Killzones — directly on the chart and in the UI, with real-time session tracking.

**File:** `src/utils/sessions.js`

```js
export function getCurrentSession(utcHour) {
  if (utcHour >= 2  && utcHour < 5)  return { name: 'Asia Killzone',   color: '#7c3aed', pip: 'Low volatility, range-bound' }
  if (utcHour >= 7  && utcHour < 10) return { name: 'London Open KZ',  color: '#3b82f6', pip: 'Highest probability — institutional entries' }
  if (utcHour >= 12 && utcHour < 13) return { name: 'NY AM Killzone',  color: '#22c55e', pip: 'Second best window — trend continuation' }
  if (utcHour >= 13 && utcHour < 14) return { name: 'London Close KZ', color: '#f59e0b', pip: 'Reversal and profit-taking setups' }
  if (utcHour >= 19 && utcHour < 21) return { name: 'NY PM Killzone',  color: '#ef4444', pip: 'Low volume, avoid scalping' }
  return { name: 'Off-Session', color: '#374151', pip: 'Reduced liquidity — trade with caution' }
}

export const ALL_KILLZONES = [
  { name: 'Asia KZ',        start:  2, end:  5, color: '#7c3aed', pairs: ['USD/JPY','AUD/USD','NZD/USD'] },
  { name: 'London Open KZ', start:  7, end: 10, color: '#3b82f6', pairs: ['EUR/USD','GBP/USD','EUR/GBP'] },
  { name: 'NY Open KZ',     start: 12, end: 13, color: '#22c55e', pairs: ['EUR/USD','GBP/USD','USD/CAD'] },
  { name: 'London Close',   start: 13, end: 14, color: '#f59e0b', pairs: ['EUR/USD','GBP/USD'] },
  { name: 'NY PM KZ',       start: 19, end: 21, color: '#ef4444', pairs: ['USD/CAD','USD/JPY'] },
]
```

---

## Step 26 — Backtesting Engine

**Goal:** Run the full analysis engine on historical data and measure how often the signal criteria were met and what the win rate would have been.

**Install:**
```bash
npm install papaparse   # for CSV import of historical data
```

**File:** `src/utils/backtester.js`

```js
import { calcRSI, calcEMA, calcTrend } from './indicators'
import { analyzeSMC, getConfluenceScore } from './smcAnalysis'

export function runBacktest(priceHistory, options = {}) {
  const {
    confluenceThreshold = 65,   // Min confluence score to take trade
    rr = 2,                     // Risk:Reward ratio
    slPips = 20,                // Fixed stop loss in pips
    pipValue = 0.0001,          // Pip size
  } = options

  const results = []
  const windowSize = 60         // Bars needed for full indicator calculation

  for (let i = windowSize; i < priceHistory.length - 10; i++) {
    const slice = priceHistory.slice(i - windowSize, i)
    const high = Math.max(...slice)
    const low  = Math.min(...slice)
    const ohlc = { high, low, open: slice[0] }

    const strategies    = analyzeSMC('', slice, ohlc)
    const score         = getConfluenceScore(strategies)
    const trend         = calcTrend(slice)
    const rsi           = calcRSI(slice)
    const currentPrice  = slice[slice.length - 1]

    if (score < confluenceThreshold) continue

    const isBuySignal  = score >= confluenceThreshold && trend === 'BULLISH' && rsi < 70
    const isSellSignal = (100 - score) >= confluenceThreshold && trend === 'BEARISH' && rsi > 30

    if (!isBuySignal && !isSellSignal) continue

    const direction = isBuySignal ? 'BUY' : 'SELL'
    const entry = currentPrice
    const sl    = direction === 'BUY' ? entry - slPips * pipValue : entry + slPips * pipValue
    const tp    = direction === 'BUY' ? entry + slPips * rr * pipValue : entry - slPips * rr * pipValue

    // Simulate outcome over next bars
    let outcome = 'OPEN', exitPrice = null
    for (let j = i + 1; j < Math.min(i + 50, priceHistory.length); j++) {
      const p = priceHistory[j]
      if (direction === 'BUY') {
        if (p <= sl) { outcome = 'LOSS'; exitPrice = sl; break }
        if (p >= tp) { outcome = 'WIN';  exitPrice = tp; break }
      } else {
        if (p >= sl) { outcome = 'LOSS'; exitPrice = sl; break }
        if (p <= tp) { outcome = 'WIN';  exitPrice = tp; break }
      }
    }
    if (outcome === 'OPEN') { outcome = 'EXPIRED'; exitPrice = priceHistory[Math.min(i + 50, priceHistory.length - 1)] }

    const pnlPips = direction === 'BUY'
      ? (exitPrice - entry) / pipValue
      : (entry - exitPrice) / pipValue

    results.push({ index: i, direction, entry, sl, tp, outcome, exitPrice, pnlPips: +pnlPips.toFixed(1), score })
  }

  const wins   = results.filter(r => r.outcome === 'WIN').length
  const losses = results.filter(r => r.outcome === 'LOSS').length
  const total  = wins + losses
  const winRate       = total > 0 ? (wins / total * 100).toFixed(1) : '0'
  const totalPips     = results.reduce((sum, r) => sum + r.pnlPips, 0).toFixed(1)
  const avgWin        = wins   > 0 ? (results.filter(r=>r.outcome==='WIN').reduce((s,r)=>s+r.pnlPips,0)/wins).toFixed(1) : 0
  const avgLoss       = losses > 0 ? (results.filter(r=>r.outcome==='LOSS').reduce((s,r)=>s+r.pnlPips,0)/losses).toFixed(1) : 0
  const profitFactor  = losses > 0 && avgLoss !== 0 ? Math.abs((avgWin * wins) / (avgLoss * losses)).toFixed(2) : 'N/A'

  return { results, wins, losses, total, winRate, totalPips, avgWin, avgLoss, profitFactor }
}
```

---

## Step 27 — Advanced Risk & Portfolio Management

**Goal:** Build a full risk management dashboard: account equity curve, open position tracker, max drawdown calculator, Kelly criterion position sizing.

**File:** `src/utils/portfolioRisk.js`

```js
// Kelly Criterion — optimal position size based on win rate and R:R
export function kellySize(winRate, rr) {
  const w = winRate / 100
  const l = 1 - w
  const b = rr
  const kelly = (b * w - l) / b
  return Math.max(0, +(kelly * 100).toFixed(2))  // as % of account
}

// Max Drawdown from equity curve
export function calcMaxDrawdown(equityCurve) {
  let peak = equityCurve[0]
  let maxDD = 0
  for (const val of equityCurve) {
    if (val > peak) peak = val
    const dd = (peak - val) / peak * 100
    if (dd > maxDD) maxDD = dd
  }
  return +maxDD.toFixed(2)
}

// Sharpe ratio approximation
export function calcSharpeRatio(returns, riskFreeRate = 0.05) {
  const n    = returns.length
  const mean = returns.reduce((a, b) => a + b, 0) / n
  const std  = Math.sqrt(returns.map(r => (r - mean) ** 2).reduce((a, b) => a + b, 0) / n)
  return std > 0 ? +((mean - riskFreeRate / 252) / std * Math.sqrt(252)).toFixed(2) : 0
}

// Daily risk limit check
export function checkDailyRisk(openTrades, accountBalance, maxDailyRiskPct = 3) {
  const totalRisk = openTrades.reduce((sum, t) => sum + t.riskAmount, 0)
  const pct = (totalRisk / accountBalance * 100).toFixed(2)
  return {
    usedRisk:   parseFloat(pct),
    maxRisk:    maxDailyRiskPct,
    remaining:  +(maxDailyRiskPct - parseFloat(pct)).toFixed(2),
    isBreached: parseFloat(pct) > maxDailyRiskPct,
    status:     parseFloat(pct) > maxDailyRiskPct ? 'STOP TRADING' : parseFloat(pct) > maxDailyRiskPct * 0.7 ? 'CAUTION' : 'OK',
  }
}
```

---

## Step 28 — Telegram & Discord Signal Bot

**Goal:** Send every high-confidence AI signal to a Telegram channel and/or Discord webhook automatically when it fires.

**File:** `api/notify.js` (Vercel serverless function)

```js
// Telegram Bot notification
async function sendTelegram(signal, pair, timeframe) {
  const emoji  = signal.action === 'BUY' ? '🟢' : signal.action === 'SELL' ? '🔴' : '🟡'
  const grade  = signal.grade === 'A+' ? '⭐⭐⭐' : signal.grade === 'A' ? '⭐⭐' : '⭐'
  const msg =
`${emoji} *${signal.action} — ${pair}* ${grade}
──────────────────────
⏱ Timeframe:   \`${timeframe}\`
📍 Entry:       \`${signal.entry}\`
🛑 Stop Loss:   \`${signal.sl}\` (${signal.sl_pips} pips)
🎯 TP1:         \`${signal.tp1}\`
🎯 TP2:         \`${signal.tp2}\`
🎯 TP3:         \`${signal.tp3}\`
📊 R:R Ratio:   \`${signal.rr}\`
🏅 Grade:       \`${signal.grade}\`
🔒 Invalidate:  \`${signal.invalidation}\`
──────────────────────
📝 ${signal.reason}

_Signal by FOREX AI Intelligence System_`

  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: msg, parse_mode: 'Markdown' })
  })
}

// Discord Webhook notification
async function sendDiscord(signal, pair, timeframe) {
  const color = signal.action === 'BUY' ? 0x22c55e : signal.action === 'SELL' ? 0xef4444 : 0xf59e0b
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `${signal.action} Signal — ${pair} (${timeframe})`,
        color,
        fields: [
          { name: 'Entry',     value: `\`${signal.entry}\``,      inline: true },
          { name: 'Stop Loss', value: `\`${signal.sl}\``,         inline: true },
          { name: 'TP1/TP2',  value: `\`${signal.tp1} / ${signal.tp2}\``, inline: true },
          { name: 'R:R',       value: signal.rr,                  inline: true },
          { name: 'Grade',     value: signal.grade,               inline: true },
          { name: 'Confidence',value: signal.confidence,          inline: true },
          { name: 'Analysis',  value: signal.reason },
        ],
        footer: { text: 'FOREX AI Intelligence · Powered by Claude AI' },
        timestamp: new Date().toISOString(),
      }]
    })
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { signal, pair, timeframe } = req.body
  if (signal.confidence !== 'HIGH' && signal.grade !== 'A+') return res.json({ sent: false, reason: 'Signal grade too low' })
  await Promise.allSettled([
    process.env.TELEGRAM_BOT_TOKEN  ? sendTelegram(signal, pair, timeframe) : null,
    process.env.DISCORD_WEBHOOK_URL ? sendDiscord(signal, pair, timeframe)  : null,
  ])
  res.json({ sent: true })
}
```

**Setup:**

1. Create a bot via @BotFather on Telegram → get `TELEGRAM_BOT_TOKEN`
2. Get your chat ID by messaging @userinfobot → `TELEGRAM_CHAT_ID`
3. Create a Discord server → Integrations → Webhooks → copy URL → `DISCORD_WEBHOOK_URL`
4. Add all three to Vercel environment variables

---

## Step 29 — Authentication & Multi-User Support

**Goal:** Add Clerk authentication so multiple traders can log in, save their own journal entries, and have personalized alert preferences.

**Install:**
```bash
npm install @clerk/clerk-react
```

**`src/main.jsx`:**

```jsx
import { ClerkProvider } from '@clerk/clerk-react'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={CLERK_KEY}>
    <App />
  </ClerkProvider>
)
```

**`src/components/AuthGuard.jsx`:**

```jsx
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

export function AuthGuard({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <div className="panel text-center max-w-sm w-full">
            <div className="text-2xl font-mono font-medium mb-2">FOREX AI</div>
            <div className="text-muted text-sm mb-6">Professional trading intelligence platform</div>
            <SignInButton mode="modal">
              <button className="w-full py-2.5 bg-info text-white rounded-lg text-sm font-medium hover:opacity-90 transition">
                Sign In to Access Dashboard
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  )
}

export function UserMenu() {
  return (
    <div className="flex items-center gap-3">
      <UserButton afterSignOutUrl="/" />
    </div>
  )
}
```

---

## Step 30 — Production Hardening & Performance

**Goal:** Optimize the app for production: code-splitting, memoization, error boundaries, rate limiting on the API, and Lighthouse score above 90.

**`src/utils/performance.js`:**

```js
// Debounce rapid state updates (prevent chart thrashing)
export function debounce(fn, delay) {
  let timer
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay) }
}

// Throttle price update renders (max 10/sec)
export function throttle(fn, limit) {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= limit) { last = now; return fn(...args) }
  }
}

// Price change threshold — only re-render if price moved enough to matter visually
export function priceChanged(prev, next, decimals = 5) {
  return Math.abs(prev - next) >= Math.pow(10, -decimals)
}
```

**`src/components/ErrorBoundary.jsx`:**

```jsx
import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  componentDidCatch(err, info) { console.error('[ErrorBoundary]', err, info) }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="panel border-bear/30 text-center py-8">
        <div className="text-bear text-sm font-mono mb-2">⚠ COMPONENT ERROR</div>
        <div className="text-xs text-muted mb-4">{this.state.error?.message}</div>
        <button onClick={() => this.setState({ hasError: false, error: null })}
          className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-surface-2">
          Retry
        </button>
      </div>
    )
  }
}
```

**`api/signal.js` — rate limiting (max 20 AI calls/minute per user):**

```js
const rateLimitMap = new Map()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const clientIP = req.headers['x-forwarded-for'] || 'unknown'
  const now = Date.now()
  const window = 60_000   // 1 minute
  const limit = 20

  const history = (rateLimitMap.get(clientIP) || []).filter(t => now - t < window)
  if (history.length >= limit) {
    return res.status(429).json({ error: 'Rate limit exceeded. Max 20 analyses per minute.' })
  }
  rateLimitMap.set(clientIP, [...history, now])

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body)
  })

  const data = await response.json()
  res.status(response.status).json(data)
}
```

**Performance checklist before going live:**

```bash
# Build and analyze bundle size
npm run build
npx vite-bundle-analyzer dist/

# Run Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Check for unused dependencies
npx depcheck

# Type-check (if using TypeScript)
npx tsc --noEmit
```

---

## Full Folder Structure

```
forex-ai-intelligence/
├── public/
│   ├── favicon.ico
│   └── manifest.json              ← PWA manifest
├── src/
│   ├── components/
│   │   ├── TopBar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── CommandPalette.jsx     ← Step 22 (⌘K)
│   │   ├── TickerStrip.jsx
│   │   ├── PricePanel.jsx
│   │   ├── AdvancedChart.jsx      ← Step 23 (TradingView)
│   │   ├── MTFPanel.jsx           ← Step 14
│   │   ├── PatternBadges.jsx      ← Step 15
│   │   ├── StrategyPanel.jsx
│   │   ├── SignalPanel.jsx        ← Step 20 (CoT prompt)
│   │   ├── SentimentDashboard.jsx ← Step 21
│   │   ├── CorrelationMatrix.jsx  ← Step 24
│   │   ├── SessionKillzones.jsx   ← Step 25
│   │   ├── BacktestPanel.jsx      ← Step 26
│   │   ├── RiskCalculator.jsx
│   │   ├── PortfolioPanel.jsx     ← Step 27
│   │   ├── NewsPanel.jsx
│   │   ├── CalendarPanel.jsx
│   │   ├── TradeJournal.jsx
│   │   ├── AuthGuard.jsx          ← Step 29
│   │   └── ErrorBoundary.jsx      ← Step 30
│   ├── context/
│   │   └── MarketContext.jsx
│   ├── hooks/
│   │   ├── useLivePrices.js
│   │   ├── useTickStream.js       ← Step 13 (WebSocket)
│   │   └── useTradeJournal.js
│   ├── services/
│   │   ├── priceSocket.js         ← Step 13
│   │   ├── claudeSignal.js        ← Step 20 (CoT)
│   │   ├── sentimentAnalyzer.js   ← Step 21
│   │   └── notifications.js
│   ├── utils/
│   │   ├── indicators.js
│   │   ├── smcAnalysis.js
│   │   ├── mtfAnalysis.js         ← Step 14
│   │   ├── candlePatterns.js      ← Step 15
│   │   ├── orderFlow.js           ← Step 16
│   │   ├── marketStructure.js     ← Step 17
│   │   ├── liquidityZones.js      ← Step 18
│   │   ├── pdArray.js             ← Step 19
│   │   ├── correlation.js         ← Step 24
│   │   ├── sessions.js            ← Step 25
│   │   ├── backtester.js          ← Step 26
│   │   ├── portfolioRisk.js       ← Step 27
│   │   ├── riskCalc.js
│   │   └── performance.js         ← Step 30
│   ├── data/
│   │   └── marketNews.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Backtest.jsx
│   │   └── Journal.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── api/
│   ├── signal.js                  ← Claude proxy + rate limiter
│   └── notify.js                  ← Telegram + Discord bot
├── .env
├── .env.example
├── tailwind.config.js
├── vite.config.js
├── vercel.json
└── README.md
```

---

## Environment Variables Reference

| Variable | Description | Step |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | Claude API key (client dev only) | 7 |
| `ANTHROPIC_API_KEY` | Claude API key (server-side, production) | 12 |
| `VITE_POLYGON_API_KEY` | Polygon.io WebSocket key | 13 |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk auth public key | 29 |
| `CLERK_SECRET_KEY` | Clerk auth secret (server) | 29 |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | 28 |
| `TELEGRAM_CHAT_ID` | Telegram channel/group ID | 28 |
| `DISCORD_WEBHOOK_URL` | Discord incoming webhook URL | 28 |
| `VITE_FX_API_URL` | Frankfurter API base URL | 3 |

---

## Strategy Reference Table

| # | Strategy | Category | Signal Output | Step |
|---|---|---|---|---|
| 1 | Support & Resistance | Classic TA | HOLD / RESISTANCE | 6 |
| 2 | Break of Structure (BOS) | SMC | CONFIRMED / RANGING | 6 |
| 3 | Change of Character (CHOCH) | SMC | DETECTED / NONE | 6 |
| 4 | Fair Value Gap (FVG) | SMC | PRESENT / NO GAP | 6 |
| 5 | Order Block | SMC | BULLISH OB / BEARISH OB | 6 |
| 6 | Fibonacci Retracement | Classic TA | IN ZONE / OUTSIDE | 6 |
| 7 | EMA 20/50 Cross | Classic TA | ABOVE / BELOW | 5 |
| 8 | RSI (14) | Classic TA | 0–100 + label | 5 |
| 9 | MACD | Classic TA | BULL X / BEAR X | 5 |
| 10 | Multi-Timeframe Bias | MTF | STRONG BULL / BEAR | 14 |
| 11 | Doji | Candlestick | Indecision | 15 |
| 12 | Hammer / Shooting Star | Candlestick | Bullish / Bearish | 15 |
| 13 | Engulfing (Bull/Bear) | Candlestick | Reversal | 15 |
| 14 | Morning / Evening Star | Candlestick | Strong reversal | 15 |
| 15 | Three Soldiers / Crows | Candlestick | Trend confirmation | 15 |
| 16 | Volume Delta | Order Flow | BUYING / SELLING | 16 |
| 17 | Cumulative Volume Delta | Order Flow | Running imbalance | 16 |
| 18 | Swing High / Low Map | Structure | HH/HL / LH/LL | 17 |
| 19 | Equal Highs / Lows | Liquidity | BSL / SSL targets | 18 |
| 20 | Premium / Discount | PD Array | BUY BIAS / SELL BIAS | 19 |
| 21 | Currency Sentiment | AI | -100 to +100 score | 21 |
| 22 | Session Killzones | Time | KZ active / off | 25 |

---

## Tech Stack Overview

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 18 + Vite | Fast HMR, production build |
| Styling | Tailwind CSS 3.4 | Utility-first design system |
| Animation | Framer Motion | Panel transitions, data flash |
| Charts | TradingView Lightweight Charts | Professional OHLC rendering |
| WebSocket | Polygon.io / ReconnectingWebSocket | Real-time tick streaming |
| AI Engine | Anthropic Claude (claude-sonnet-4) | Chain-of-thought signal generation |
| Auth | Clerk | Multi-user authentication |
| Command UI | cmdk | Keyboard-driven command palette |
| Deployment | Vercel + Edge Functions | Serverless API proxy |
| Notifications | Telegram Bot + Discord Webhook | Signal delivery |
| Price Data | Frankfurter ECB + Polygon.io | Live exchange rates |

---

> Built with Claude AI · TradingView Charts · React 18 · Tailwind CSS · Polygon.io · Vercel
>
> **Disclaimer:** This system is for educational and informational purposes. All trading involves substantial risk of loss. Never risk more than you can afford to lose. Past signal performance does not guarantee future results.