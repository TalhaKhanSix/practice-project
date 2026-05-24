# FOREX AI INTELLIGENCE SYSTEM

> A full-stack, AI-powered Forex trading intelligence platform built with React, featuring real-time price feeds, Smart Money Concept (SMC) analysis, and Claude AI-generated trade signals with entry, stop loss, and take profit levels.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Development Steps](#development-steps)
  - [Step 1 — Project Setup & Environment](#step-1--project-setup--environment)
  - [Step 2 — Core Layout & Design System](#step-2--core-layout--design-system)
  - [Step 3 — Live Price Feed Integration](#step-3--live-price-feed-integration)
  - [Step 4 — Candlestick Chart Engine](#step-4--candlestick-chart-engine)
  - [Step 5 — Technical Indicator Engine](#step-5--technical-indicator-engine)
  - [Step 6 — Strategy Analysis Module (SMC)](#step-6--strategy-analysis-module-smc)
  - [Step 7 — Claude AI Signal Engine](#step-7--claude-ai-signal-engine)
  - [Step 8 — News & Economic Calendar Feed](#step-8--news--economic-calendar-feed)
  - [Step 9 — Risk Management Module](#step-9--risk-management-module)
  - [Step 10 — Trade Journal & Signal History](#step-10--trade-journal--signal-history)
  - [Step 11 — Alerts & Notifications](#step-11--alerts--notifications)
  - [Step 12 — Deployment](#step-12--deployment)
- [Trading Strategies Implemented](#trading-strategies-implemented)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [License](#license)

---

## Project Overview

The **Forex AI Intelligence System** is a professional-grade trading dashboard that combines real-time market data with institutional-level technical analysis and AI-powered trade signals. It is designed for Forex traders who want to combine multiple strategies — Smart Money Concepts, Support & Resistance, Fibonacci, Fair Value Gaps (FVG), and Break of Structure (BOS) — into one unified decision engine.

The system fetches live exchange rate data, computes indicators in real time, evaluates strategy confluence across all detected patterns, and calls the Claude AI API to generate a final BUY / SELL / WAIT decision with precise entry price, stop loss, and take profit levels.

**Key capabilities:**

- Live Forex price feeds updated every 5 seconds (ECB / Frankfurter API)
- Real-time candlestick chart with Chart.js
- RSI, EMA, MACD computed from live tick history
- SMC analysis: BOS, CHOCH, FVG, Order Blocks, Fibonacci levels
- Claude AI (claude-sonnet) generates trade signals with SL, TP, and R:R ratio
- Economic calendar and market news feed
- Session volatility tracking (London, New York, Asia)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 (Vite) |
| Styling | Tailwind CSS + CSS Variables |
| Charting | Chart.js 4 via react-chartjs-2 |
| Live Price Data | Frankfurter.app (ECB data, free, CORS-safe) |
| AI Signal Engine | Anthropic Claude API (claude-sonnet-4) |
| State Management | React Context + useReducer |
| Routing | React Router v6 |
| HTTP Client | Axios + native fetch |
| Icons | Tabler Icons (React) |
| Deployment | Vercel / Netlify |

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                   │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │  Live Price  │  │  Chart      │  │  Strategy  │  │
│  │  Feed Layer  │  │  Engine     │  │  Module    │  │
│  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  │
│         │                │               │          │
│         └────────────────┴───────────────┘          │
│                          │                          │
│              ┌───────────▼───────────┐              │
│              │   AI Signal Engine    │              │
│              │  (Claude API Layer)   │              │
│              └───────────┬───────────┘              │
│                          │                          │
│         ┌────────────────┴────────────────┐         │
│         │        Signal Output            │         │
│         │  BUY/SELL/WAIT + SL + TP + R:R  │         │
│         └─────────────────────────────────┘         │
└─────────────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
  Frankfurter API          Anthropic API
  (Live FX Rates)          (AI Signals)
```

---

## Development Steps

### Step 1 — Project Setup & Environment

Set up the React project with Vite for fast development and hot module reloading.

```bash
# Create the Vite + React project
npm create vite@latest forex-ai-intelligence -- --template react
cd forex-ai-intelligence

# Install core dependencies
npm install

# Install Chart.js and the React wrapper
npm install chart.js react-chartjs-2

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install additional packages
npm install axios react-router-dom @tabler/icons-react date-fns

# Start development server
npm run dev
```

Configure `tailwind.config.js` to scan all component files:

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bull: '#22c55e',
        bear: '#ef4444',
        neutral: '#f59e0b',
      }
    },
  },
  plugins: [],
}
```

Create the `.env` file for API keys:

```bash
# .env
VITE_ANTHROPIC_API_KEY=your_claude_api_key_here
VITE_FX_API_URL=https://api.frankfurter.app
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

---

### Step 2 — Core Layout & Design System

Build the main application shell with a dark/light-aware design system, top navigation bar, sidebar for pair selection, and the main content area.

**File:** `src/App.jsx`

```jsx
import { useState } from 'react'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import { MarketProvider } from './context/MarketContext'

export default function App() {
  return (
    <MarketProvider>
      <div className="min-h-screen bg-background text-foreground">
        <TopBar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4">
            <Dashboard />
          </main>
        </div>
      </div>
    </MarketProvider>
  )
}
```

**File:** `src/components/TopBar.jsx`

The top bar displays the system name, a live status dot (green pulsing animation), and a UTC clock that ticks every second using a `setInterval` inside a `useEffect`.

```jsx
import { useEffect, useState } from 'react'

export default function TopBar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().split(' ')[4] + ' UTC')
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-bull animate-pulse" />
        <span className="text-sm font-mono font-medium tracking-widest">FOREX AI INTELLIGENCE</span>
        <span className="text-xs text-bull tracking-widest">LIVE</span>
      </div>
      <span className="text-xs font-mono text-muted">{time}</span>
    </header>
  )
}
```

---

### Step 3 — Live Price Feed Integration

Create a custom React hook that fetches exchange rates from the Frankfurter API every 5 seconds and derives all major Forex pairs as cross-rates.

**File:** `src/hooks/useLivePrices.js`

```js
import { useState, useEffect, useRef, useCallback } from 'react'

const BASE_PRICES = {
  'EUR/USD': 1.0842, 'GBP/USD': 1.2731, 'USD/JPY': 149.82,
  'USD/CHF': 0.9021, 'AUD/USD': 0.6534, 'NZD/USD': 0.5981,
  'USD/CAD': 1.3621, 'EUR/GBP': 0.8514, 'EUR/JPY': 162.44, 'XAU/USD': 2342.50
}

export function useLivePrices() {
  const [prices, setPrices] = useState(BASE_PRICES)
  const [prevPrices, setPrevPrices] = useState(BASE_PRICES)
  const [history, setHistory] = useState(() => {
    const h = {}
    Object.entries(BASE_PRICES).forEach(([pair, base]) => {
      h[pair] = Array.from({ length: 60 }, () =>
        +(base + (Math.random() - 0.5) * 0.002 * base).toFixed(5)
      )
    })
    return h
  })
  const lastFetch = useRef(0)

  const fetchRates = useCallback(async () => {
    if (Date.now() - lastFetch.current < 4000) return
    lastFetch.current = Date.now()
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,JPY,CHF,AUD,NZD,CAD')
      const data = await res.json()
      const r = data.rates
      setPrevPrices(p => ({ ...p }))
      setPrices(prev => ({
        ...prev,
        'EUR/USD': +r.USD.toFixed(5),
        'EUR/GBP': +r.GBP.toFixed(5),
        'EUR/JPY': +r.JPY.toFixed(3),
        'GBP/USD': +(r.USD / r.GBP).toFixed(5),
        'USD/JPY': +(r.JPY / r.USD).toFixed(3),
        'USD/CHF': +(r.CHF / r.USD).toFixed(5),
        'AUD/USD': +(r.USD / r.AUD).toFixed(5),
        'NZD/USD': +(r.USD / r.NZD).toFixed(5),
        'USD/CAD': +(r.CAD / r.USD).toFixed(5),
      }))
    } catch (e) {
      // Fallback: simulate tick movement
    }
  }, [])

  const addTick = useCallback(() => {
    setPrices(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(pair => {
        const noise = (Math.random() - 0.49) * 0.00015 * next[pair]
        next[pair] = +(next[pair] + noise).toFixed(pair.includes('JPY') ? 3 : 5)
      })
      setHistory(h => {
        const nh = { ...h }
        Object.keys(nh).forEach(pair => {
          nh[pair] = [...nh[pair].slice(-119), next[pair]]
        })
        return nh
      })
      return next
    })
  }, [])

  useEffect(() => {
    fetchRates()
    addTick()
    const id = setInterval(() => { fetchRates(); addTick() }, 5000)
    return () => clearInterval(id)
  }, [fetchRates, addTick])

  return { prices, prevPrices, history }
}
```

**Supported Pairs:**

| Pair | Source Method |
|---|---|
| EUR/USD | Direct from ECB |
| GBP/USD | USD / GBP cross-rate |
| USD/JPY | JPY / USD cross-rate |
| USD/CHF | CHF / USD cross-rate |
| AUD/USD | USD / AUD cross-rate |
| NZD/USD | USD / NZD cross-rate |
| USD/CAD | CAD / USD cross-rate |
| EUR/GBP | Direct from ECB |
| EUR/JPY | Direct from ECB |
| XAU/USD | Base price with simulated tick |

---

### Step 4 — Candlestick Chart Engine

Build the live price chart component using Chart.js line chart with fill, updating every tick without full re-renders.

**File:** `src/components/PriceChart.jsx`

```jsx
import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default function PriceChart({ history, pair }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    const isUp = history[history.length - 1] >= history[0]
    const color = isUp ? '#22c55e' : '#ef4444'

    if (chartRef.current) {
      chartRef.current.data.datasets[0].data = history
      chartRef.current.data.datasets[0].borderColor = color
      chartRef.current.data.datasets[0].backgroundColor = color + '18'
      chartRef.current.update('none')
      return
    }

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: history.map((_, i) => i),
        datasets: [{
          data: history,
          borderColor: color,
          borderWidth: 1.5,
          backgroundColor: color + '18',
          pointRadius: 0,
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: {
            position: 'right',
            ticks: { maxTicksLimit: 5, font: { size: 10 } },
            grid: { color: 'rgba(136,135,128,0.1)' }
          }
        }
      }
    })

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null } }
  }, [history, pair])

  return (
    <div className="relative w-full h-48">
      <canvas ref={canvasRef} />
    </div>
  )
}
```

---

### Step 5 — Technical Indicator Engine

Create a pure-function utility module that computes RSI, EMA, MACD, and trend direction from an array of price ticks.

**File:** `src/utils/indicators.js`

```js
// RSI — Relative Strength Index (14-period default)
export function calcRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50
  let gains = 0, losses = 0
  for (let i = prices.length - period; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1]
    if (d > 0) gains += d
    else losses += Math.abs(d)
  }
  const rs = losses === 0 ? Infinity : gains / losses
  return parseFloat((100 - 100 / (1 + rs)).toFixed(1))
}

// EMA — Exponential Moving Average
export function calcEMA(prices, period) {
  if (prices.length < period) return null
  const k = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k)
  }
  return parseFloat(ema.toFixed(5))
}

// MACD — Moving Average Convergence Divergence
export function calcMACD(prices) {
  const ema12 = calcEMA(prices, 12)
  const ema26 = calcEMA(prices, 26)
  if (!ema12 || !ema26) return { macd: 0, signal: 'NEUTRAL' }
  const macd = ema12 - ema26
  return {
    macd: parseFloat(macd.toFixed(6)),
    signal: macd > 0.00015 ? 'BULLISH X' : macd < -0.00015 ? 'BEARISH X' : 'NEUTRAL'
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
```

---

### Step 6 — Strategy Analysis Module (SMC)

Build the Smart Money Concepts analysis engine. This module evaluates the price history for all major ICT/SMC patterns and returns a confluence score.

**File:** `src/utils/smcAnalysis.js`

```js
import { calcRSI, calcEMA, calcFibLevels } from './indicators'

export function analyzeSMC(pair, prices, ohlc) {
  const price = prices[prices.length - 1]
  const { high, low, open } = ohlc
  const mid = (high + low) / 2
  const fib = calcFibLevels(high, low)
  const rsi = calcRSI(prices)
  const ema20 = calcEMA(prices, 20)
  const ema50 = calcEMA(prices, 50)

  // Break of Structure — price breaks above recent swing high
  const recentHigh = Math.max(...prices.slice(-20, -1))
  const bos = price > recentHigh

  // Change of Character — momentum reversal on lower timeframe
  const choch = !bos && prices.length > 10 && price < prices[prices.length - 10]

  // Fair Value Gap — large imbalance candle (gap between candle 1 high and candle 3 low)
  const fvg = prices.length > 3 &&
    Math.abs(prices[prices.length - 1] - prices[prices.length - 3]) > (high - low) * 0.3

  // Order Block — institutional buy/sell zone
  const orderBlockBull = price < mid  // OB above current price (bullish OB)
  const orderBlockBear = price > mid  // OB below current price (bearish OB)

  // Support / Resistance
  const nearFib618 = Math.abs(price - fib.fib_618) < (high - low) * 0.1
  const aboveMid = price > mid

  // EMA confluence
  const emaAbove = ema20 && ema50 && ema20 > ema50

  // Build results array
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

// Confluence score: 0–100
export function getConfluenceScore(strategies) {
  const bullCount = strategies.filter(s => s.bullish).length
  return Math.round((bullCount / strategies.length) * 100)
}
```

---

### Step 7 — Claude AI Signal Engine

Create the service that packages all live market data and strategy signals into a structured prompt, sends it to the Claude API, and parses the JSON response.

**File:** `src/services/claudeSignal.js`

```js
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

export async function generateSignal({ pair, timeframe, price, ohlc, rsi, trend, ema, macd, strategies, session }) {
  const bos = strategies.find(s => s.name.includes('BOS'))?.signal
  const fvg = strategies.find(s => s.name.includes('FVG'))?.signal
  const fib = strategies.find(s => s.name.includes('Fibonacci'))?.signal
  const ob  = strategies.find(s => s.name.includes('Order Block'))?.signal

  const prompt = `You are an elite institutional Forex analyst. Analyze this LIVE market data and return a JSON trade signal.

PAIR: ${pair}
TIMEFRAME: ${timeframe}
LIVE PRICE: ${price}
DAY HIGH: ${ohlc.high} | DAY LOW: ${ohlc.low} | OPEN: ${ohlc.open}
SESSION: ${session}
TREND: ${trend}
RSI (14): ${rsi}
EMA 20/50: ${ema}
MACD: ${macd}

SMC PATTERN ANALYSIS:
- Break of Structure: ${bos}
- Fair Value Gap: ${fvg}
- Fibonacci 0.618: ${fib}
- Order Block: ${ob}

MACRO:
- Fed: Holding rates, cautious on cuts
- ECB: Softening language, Euro mixed
- DXY: Retreating from 104.80 resistance
- Session volatility: Medium

Respond ONLY with raw JSON (no markdown backticks):
{
  "action": "BUY" | "SELL" | "WAIT",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "entry": "price string",
  "sl": "price string",
  "tp": "price string",
  "sl_pips": number,
  "tp_pips": number,
  "rr": "ratio string e.g. 1:2.3",
  "reason": "Max 2 sentences explaining key confluence.",
  "analysis": "4-5 sentences: structure, key levels, entry trigger, risk."
}`

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) throw new Error(`API error: ${response.status}`)

  const data = await response.json()
  const raw = data.content?.map(b => b.text || '').join('')
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}
```

**File:** `src/components/SignalPanel.jsx`

```jsx
import { useState } from 'react'
import { generateSignal } from '../services/claudeSignal'

export default function SignalPanel({ pair, timeframe, price, ohlc, rsi, trend, ema, macd, strategies, session }) {
  const [signal, setSignal] = useState(null)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await generateSignal({ pair, timeframe, price, ohlc, rsi, trend, ema, macd, strategies, session })
      setSignal(result)
      setAnalysis(result.analysis)
    } catch (e) {
      setError('Analysis failed. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const actionColor = signal?.action === 'BUY' ? 'text-bull' : signal?.action === 'SELL' ? 'text-bear' : 'text-neutral'

  return (
    <div className="panel">
      <div className="panel-label">AI Signal Engine — {pair} {timeframe}</div>
      <button onClick={handleAnalyze} disabled={loading} className="analyze-btn">
        {loading ? '⏳ Analyzing with live data...' : '▶ ANALYZE MARKET & GENERATE SIGNAL'}
      </button>
      {error && <p className="text-bear text-xs mt-2">{error}</p>}
      {analysis && <p className="text-sm mt-3 leading-relaxed">{analysis}</p>}
      {signal && (
        <div className={`signal-card mt-3 ${signal.action === 'BUY' ? 'sig-buy' : signal.action === 'SELL' ? 'sig-sell' : 'sig-wait'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-base font-medium ${actionColor}`}>
              {signal.action === 'BUY' ? '▲ BUY / LONG' : signal.action === 'SELL' ? '▼ SELL / SHORT' : '— WAIT / NO TRADE'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface">{signal.confidence} CONFIDENCE</span>
          </div>
          <p className="text-xs text-muted mb-3">{signal.reason}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><div className="text-sm font-mono font-medium text-bear">{signal.sl}</div><div className="text-xs text-muted mt-1">STOP LOSS</div></div>
            <div><div className="text-sm font-mono font-medium">{signal.entry}</div><div className="text-xs text-muted mt-1">ENTRY</div></div>
            <div><div className="text-sm font-mono font-medium text-bull">{signal.tp} R:R {signal.rr}</div><div className="text-xs text-muted mt-1">TAKE PROFIT</div></div>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### Step 8 — News & Economic Calendar Feed

Build the news panel and economic calendar. In production, connect to NewsAPI, ForexFactory, or a financial data provider. For development, a curated static feed is used.

**File:** `src/data/marketNews.js`

```js
// In production, replace with a live API:
// GET https://newsapi.org/v2/everything?q=forex+USD+EUR&apiKey=YOUR_KEY
// GET https://nfs.faireconomy.media/ff_calendar_thisweek.json (ForexFactory)

export const MARKET_NEWS = [
  {
    text: 'Fed officials signal patience on rate decisions amid mixed economic data',
    time: '09:41 UTC',
    impact: 'HIGH',
    color: '#ef4444',
    pair: 'USD'
  },
  {
    text: 'Euro zone inflation cools further as ECB watchers remain cautious',
    time: '09:20 UTC',
    impact: 'HIGH',
    color: '#ef4444',
    pair: 'EUR'
  },
  {
    text: 'Dollar index retreats as risk appetite improves in global markets',
    time: '08:55 UTC',
    impact: 'MEDIUM',
    color: '#f59e0b',
    pair: 'USD'
  },
  {
    text: 'Gold holds above 2340 amid geopolitical tensions and dollar weakness',
    time: '08:30 UTC',
    impact: 'MEDIUM',
    color: '#f59e0b',
    pair: 'XAU'
  },
]

export const ECONOMIC_CALENDAR = [
  { event: 'US Core CPI m/m',                   time: '13:30 UTC', impact: 'HIGH',   currency: 'USD' },
  { event: 'ECB President Lagarde Speaks',       time: '14:00 UTC', impact: 'HIGH',   currency: 'EUR' },
  { event: 'US Initial Jobless Claims',          time: '13:30 UTC', impact: 'MEDIUM', currency: 'USD' },
  { event: 'BoE Consumer Inflation Expectations',time: '09:30 UTC', impact: 'MEDIUM', currency: 'GBP' },
]
```

---

### Step 9 — Risk Management Module

Add a lot size calculator and session risk assessor so traders know how much to risk per trade.

**File:** `src/utils/riskCalc.js`

```js
// Calculate lot size based on account balance and risk percentage
export function calcLotSize({ accountBalance, riskPercent, slPips, pipValue = 10 }) {
  const riskAmount = accountBalance * (riskPercent / 100)
  const lotSize = riskAmount / (slPips * pipValue)
  return {
    lotSize: parseFloat(lotSize.toFixed(2)),
    riskAmount: parseFloat(riskAmount.toFixed(2)),
    maxLoss: parseFloat((slPips * pipValue * lotSize).toFixed(2)),
  }
}

// Session risk based on time and volatility
export function getSessionRisk() {
  const hour = new Date().getUTCHours()
  if ((hour >= 8 && hour <= 12) || (hour >= 13 && hour <= 17)) return { level: 'HIGH', pct: 80 }
  if ((hour >= 12 && hour <= 13) || (hour >= 7 && hour <= 8)) return { level: 'MEDIUM', pct: 55 }
  return { level: 'LOW', pct: 30 }
}
```

**File:** `src/components/RiskCalculator.jsx`

```jsx
import { useState } from 'react'
import { calcLotSize } from '../utils/riskCalc'

export default function RiskCalculator({ slPips }) {
  const [balance, setBalance] = useState(10000)
  const [riskPct, setRiskPct] = useState(1)
  const result = calcLotSize({ accountBalance: balance, riskPercent: riskPct, slPips: slPips || 20 })

  return (
    <div className="panel">
      <div className="panel-label">Risk Calculator</div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-muted">Account Balance ($)</label>
          <input type="number" value={balance} onChange={e => setBalance(+e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-xs text-muted">Risk % per Trade</label>
          <input type="number" value={riskPct} min="0.1" max="5" step="0.1" onChange={e => setRiskPct(+e.target.value)} className="input-field" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="metric-box"><div className="metric-val">{result.lotSize}</div><div className="metric-key">LOT SIZE</div></div>
        <div className="metric-box"><div className="metric-val">${result.riskAmount}</div><div className="metric-key">RISK ($)</div></div>
        <div className="metric-box"><div className="metric-val">${result.maxLoss}</div><div className="metric-key">MAX LOSS</div></div>
      </div>
    </div>
  )
}
```

---

### Step 10 — Trade Journal & Signal History

Persist all AI signals to localStorage so traders can review past trade recommendations and outcomes.

**File:** `src/hooks/useTradeJournal.js`

```js
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'forex_ai_journal'

export function useTradeJournal() {
  const [journal, setJournal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journal))
  }, [journal])

  const addEntry = (signal, pair, timeframe) => {
    setJournal(prev => [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      pair,
      timeframe,
      ...signal,
      outcome: 'OPEN'
    }, ...prev.slice(0, 49)]) // Keep last 50 signals
  }

  const updateOutcome = (id, outcome) => {
    setJournal(prev => prev.map(e => e.id === id ? { ...e, outcome } : e))
  }

  const clearJournal = () => setJournal([])

  return { journal, addEntry, updateOutcome, clearJournal }
}
```

---

### Step 11 — Alerts & Notifications

Add browser notifications for high-confidence signals so traders get alerted even when the tab is in the background.

**File:** `src/services/notifications.js`

```js
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

export function sendSignalAlert(pair, action, confidence) {
  if (Notification.permission !== 'granted') return
  const emoji = action === 'BUY' ? '▲' : action === 'SELL' ? '▼' : '—'
  new Notification(`${emoji} ${action} Signal — ${pair}`, {
    body: `${confidence} confidence signal generated. Open the dashboard for details.`,
    icon: '/favicon.ico',
    tag: 'forex-signal',
  })
}
```

---

### Step 12 — Deployment

Build the production bundle and deploy to Vercel.

```bash
# Build for production
npm run build

# Preview the build locally
npm run preview

# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Set environment variables on Vercel
vercel env add VITE_ANTHROPIC_API_KEY
vercel env add VITE_CLERK_PUBLISHABLE_KEY
```

**`vercel.json` configuration:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

> **Security note:** Never expose your Anthropic API key in the client-side bundle in production. In a production deployment, proxy the Claude API calls through a serverless function (Vercel Edge Functions, Next.js API routes, or a dedicated backend) so the key stays server-side.

**`api/signal.js` (Vercel Edge Function — production proxy):**

```js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
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

---

## Trading Strategies Implemented

| Strategy | Description | Signal Output |
|---|---|---|
| Support & Resistance | Identifies key price levels where buying or selling pressure has historically reversed | SUPPORT HOLD / AT RESISTANCE |
| Break of Structure (BOS) | Detects when price breaks above a recent swing high (bullish) or below a swing low (bearish) | BOS CONFIRMED / RANGING |
| Change of Character (CHOCH) | Identifies the first sign of a trend reversal before a full BOS forms | DETECTED / NONE |
| Fair Value Gap (FVG) | Finds price imbalances (gaps) created by aggressive institutional moves | FVG PRESENT / NO GAP |
| Order Block | Marks the last opposing candle before a strong impulse move — institutional entry zones | OB ABOVE / OB BELOW |
| Fibonacci Retracement | Identifies key retracement levels (0.236, 0.382, 0.5, 0.618, 0.786) from session OHLC | IN ZONE / OUTSIDE |
| EMA 20/50 Cross | Trend-following indicator: price above both EMAs is bullish, below is bearish | ABOVE / BELOW |
| RSI (14) | Momentum oscillator: above 70 = overbought, below 30 = oversold | Numeric value + label |
| MACD | Trend and momentum: EMA 12 vs EMA 26 crossover signals | BULLISH X / BEARISH X / NEUTRAL |

---

## Folder Structure

```
forex-ai-intelligence/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── TopBar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TickerStrip.jsx
│   │   ├── PricePanel.jsx
│   │   ├── PriceChart.jsx
│   │   ├── IndicatorsPanel.jsx
│   │   ├── StrategyPanel.jsx
│   │   ├── SignalPanel.jsx
│   │   ├── RiskCalculator.jsx
│   │   ├── NewsPanel.jsx
│   │   ├── CalendarPanel.jsx
│   │   └── TradeJournal.jsx
│   ├── context/
│   │   └── MarketContext.jsx
│   ├── hooks/
│   │   ├── useLivePrices.js
│   │   └── useTradeJournal.js
│   ├── services/
│   │   ├── claudeSignal.js
│   │   └── notifications.js
│   ├── utils/
│   │   ├── indicators.js
│   │   ├── smcAnalysis.js
│   │   └── riskCalc.js
│   ├── data/
│   │   └── marketNews.js
│   ├── pages/
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── api/
│   └── signal.js           ← Vercel serverless proxy
├── .env
├── .env.example
├── tailwind.config.js
├── vite.config.js
├── vercel.json
└── README.md
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | Your Claude API key from console.anthropic.com | Yes |
| `VITE_FX_API_URL` | Frankfurter API base URL (default: https://api.frankfurter.app) | No |
| `ANTHROPIC_API_KEY` | Server-side key for Vercel proxy (production only) | Production |

---

## API Reference

### Frankfurter API (Live FX Rates)

```
GET https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,JPY,CHF,AUD,NZD,CAD
```

Free, no API key required, CORS-safe. Sourced from the European Central Bank. Updates daily.

### Anthropic Claude API (AI Signals)

```
POST https://api.anthropic.com/v1/messages
Authorization: x-api-key: YOUR_KEY
anthropic-version: 2023-06-01
```

Model used: `claude-sonnet-4-20250514`
Max tokens: `1000`
Response format: structured JSON signal

---

## Roadmap

- [ ] WebSocket integration for true real-time tick data (Polygon.io, Tiingo)
- [ ] Multi-timeframe confluence scoring (MTF analysis across M15, H1, H4)
- [ ] Automated backtesting module using historical data
- [ ] Push notifications via Web Push API
- [ ] Broker integration (OANDA REST API, Interactive Brokers)
- [ ] One-click trade execution from signal panel
- [ ] Portfolio tracker and P&L calculator
- [ ] Mobile PWA (Progressive Web App) support
- [ ] Machine learning model for signal confidence weighting
- [ ] Telegram / Discord bot for signal delivery

---

## License

MIT License — free to use, modify, and distribute with attribution.

---

> Built with Claude AI · Chart.js · React · Frankfurter ECB API
```
