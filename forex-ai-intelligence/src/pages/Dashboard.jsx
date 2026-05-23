import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import CalendarPanel from '../components/CalendarPanel'
import LiquidityPanel from '../components/LiquidityPanel'
import MTFPanel from '../components/MTFPanel'
import MarketStructurePanel from '../components/MarketStructurePanel'
import NewsPanel from '../components/NewsPanel'
import OrderFlowPanel from '../components/OrderFlowPanel'
import PDArrayPanel from '../components/PDArrayPanel'
import PatternBadges from '../components/PatternBadges'
import RiskCalculator from '../components/RiskCalculator'
import PortfolioPanel from '../components/PortfolioPanel'
import SessionKillzones from '../components/SessionKillzones'
import SignalPanel from '../components/SignalPanel'
import { useMarket } from '../context/MarketContext'
import { useLivePrices } from '../hooks/useLivePrices'
import { useTradeJournal } from '../hooks/useTradeJournal'
import { ECONOMIC_CALENDAR, MARKET_NEWS } from '../data/marketNews'
import { analyzeSentiment } from '../services/sentimentAnalyzer'
import { detectPatterns } from '../utils/candlePatterns'
import { calcEMA, calcMACD, calcRSI, calcTrend, calcFibLevels } from '../utils/indicators'
import { detectLiquidityZones } from '../utils/liquidityZones'
import { classifyStructure, detectSwingPoints, findKeyLevels } from '../utils/marketStructure'
import { runMTFAnalysis } from '../utils/mtfAnalysis'
import { calcVolumeDelta, detectVolumeAnomaly } from '../utils/orderFlow'
import { calcPDArray, getOptimalEntry } from '../utils/pdArray'
import { analyzeSMC } from '../utils/smcAnalysis'

const AdvancedChart = lazy(() => import('../components/AdvancedChart'))
const BacktestPanel = lazy(() => import('../components/BacktestPanel'))
const CorrelationMatrix = lazy(() => import('../components/CorrelationMatrix'))
const HeatmapPanel = lazy(() => import('../components/HeatmapPanel'))
const SentimentDashboard = lazy(() => import('../components/SentimentDashboard'))
const TradeJournal = lazy(() => import('../components/TradeJournal'))

export default function Dashboard() {
  const { pair, timeframe } = useMarket()
  const { prices, history, latestTick } = useLivePrices()
  const { journal, addEntry, updateOutcome, clearJournal } = useTradeJournal()
  const [sentiment, setSentiment] = useState(null)
  const [sentimentError, setSentimentError] = useState('')
  const [sentimentLoading, setSentimentLoading] = useState(false)
  const series = history[pair] || []
  const lastPrice = prices[pair] ?? '—'
  const priceValue = typeof lastPrice === 'number' ? lastPrice : series[series.length - 1] || 0
  const bid = latestTick?.bid ?? priceValue
  const ask = latestTick?.ask ?? priceValue
  const spread = latestTick?.spread ?? 0

  const ohlc = useMemo(() => {
    if (!series.length) return { open: 0, high: 0, low: 0 }
    return {
      open: series[0],
      high: Math.max(...series),
      low: Math.min(...series),
    }
  }, [series])

  const rsi = useMemo(() => calcRSI(series), [series])
  const ema20 = useMemo(() => calcEMA(series, 20), [series])
  const ema50 = useMemo(() => calcEMA(series, 50), [series])
  const macd = useMemo(() => calcMACD(series), [series])
  const trend = useMemo(() => calcTrend(series), [series])
  const strategies = useMemo(
    () => (series.length > 2 ? analyzeSMC(pair, series, ohlc) : []),
    [pair, series, ohlc]
  )
  const session = useMemo(() => {
    const hour = new Date().getUTCHours()
    if (hour >= 0 && hour < 7) return 'ASIA'
    if (hour >= 7 && hour < 13) return 'LONDON'
    if (hour >= 13 && hour < 20) return 'NEW YORK'
    return 'ASIA'
  }, [])
  const candles = useMemo(() => {
    if (series.length < 3) return []
    return series.map((price, index) => {
      const open = index === 0 ? price : series[index - 1]
      const close = price
      const high = Math.max(open, close) * 1.0003
      const low = Math.min(open, close) * 0.9997
      return { open, high, low, close }
    })
  }, [series])
  const patterns = useMemo(() => detectPatterns(candles), [candles])
  const mtf = useMemo(() => runMTFAnalysis(series), [series])
  const swings = useMemo(() => detectSwingPoints(series), [series])
  const structure = useMemo(() => classifyStructure(swings), [swings])
  const levels = useMemo(() => findKeyLevels(swings, priceValue), [swings, priceValue])
  const structureData = useMemo(
    () => ({ ...structure, support: levels.support, resistance: levels.resistance }),
    [structure, levels]
  )
  const liquidity = useMemo(() => detectLiquidityZones(swings), [swings])
  const pdArray = useMemo(() => calcPDArray(ohlc.high, ohlc.low, priceValue), [ohlc, priceValue])
  const optimalEntry = useMemo(() => getOptimalEntry(pdArray, structure.trend), [pdArray, structure])
  const orderFlow = useMemo(() => {
    const volume = calcVolumeDelta(series)
    const anomaly = detectVolumeAnomaly(series)
    return { ...volume, anomaly }
  }, [series])
  const histories = history
  const fibLevels = useMemo(() => {
    if (!series.length) return null
    return calcFibLevels(ohlc.high, ohlc.low)
  }, [ohlc, series])
  const onAnalyzeSentiment = async () => {
    setSentimentLoading(true)
    setSentimentError('')
    try {
      const result = await analyzeSentiment(MARKET_NEWS, ECONOMIC_CALENDAR, [])
      setSentiment(result)
    } catch (e) {
      setSentimentError('Sentiment analysis failed. Check your API key and proxy.')
    } finally {
      setSentimentLoading(false)
    }
  }

  useEffect(() => {
    onAnalyzeSentiment()
  }, [])

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="text-xs uppercase tracking-widest text-muted">Active Market</div>
        <div className="mt-2 text-xl font-semibold">
          {pair} - {timeframe}
        </div>
        <p className="mt-2 text-sm text-muted">
          Step 2 layout is ready. Next modules will populate live prices, charts, and strategy panels.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-widest text-muted">Price Chart</div>
          <div className="text-sm font-mono">{lastPrice}</div>
        </div>
        {series.length ? (
          <Suspense fallback={<div className="text-sm text-muted">Loading chart...</div>}>
            <AdvancedChart
              history={series}
              ohlc={ohlc}
              fibLevels={fibLevels}
              swingPoints={swings}
              pair={pair}
            />
          </Suspense>
        ) : (
          <div className="text-sm text-muted">Loading price history...</div>
        )}
      </div>
      <MTFPanel history={series} />
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="text-xs uppercase tracking-widest text-muted mb-3">Candlestick Patterns</div>
        <PatternBadges patterns={patterns} />
      </div>
      <MarketStructurePanel history={series} />
      <LiquidityPanel history={series} />
      <PDArrayPanel history={series} />
      <OrderFlowPanel history={series} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<div className="panel text-xs text-muted">Loading heatmap...</div>}>
          <HeatmapPanel histories={histories} />
        </Suspense>
        <Suspense fallback={<div className="panel text-xs text-muted">Loading correlation...</div>}>
          <CorrelationMatrix histories={histories} />
        </Suspense>
      </div>
      <SessionKillzones pair={pair} />
      <Suspense fallback={<div className="panel text-xs text-muted">Loading backtest...</div>}>
        <BacktestPanel />
      </Suspense>
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-widest text-muted">AI Sentiment</div>
          <button
            type="button"
            onClick={onAnalyzeSentiment}
            className="text-xs px-2 py-1 rounded-md border border-border hover:bg-background"
            disabled={sentimentLoading}
          >
            {sentimentLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {sentimentError && <div className="text-xs text-bear mb-2">{sentimentError}</div>}
        <Suspense fallback={<div className="text-xs text-muted">Loading sentiment...</div>}>
          <SentimentDashboard sentiment={sentiment} />
        </Suspense>
      </div>
      <SignalPanel
        pair={pair}
        timeframe={timeframe}
        price={priceValue}
        bid={bid}
        ask={ask}
        spread={spread}
        ohlc={ohlc}
        rsi={rsi}
        trend={trend}
        ema20={ema20}
        ema50={ema50}
        macd={macd}
        strategies={strategies}
        session={session}
        mtf={mtf}
        patterns={patterns}
        orderFlow={orderFlow}
        structure={structureData}
        liquidity={liquidity}
        pdArray={pdArray}
        optimalEntry={optimalEntry}
        news={MARKET_NEWS}
        onSignal={(signal) => addEntry(signal, pair, timeframe)}
      />
      <PortfolioPanel trades={journal} equityCurve={[]} />
      <RiskCalculator slPips={20} />
      <Suspense fallback={<div className="panel text-xs text-muted">Loading trade journal...</div>}>
        <TradeJournal journal={journal} onUpdateOutcome={updateOutcome} onClear={clearJournal} />
      </Suspense>
      <div className="grid gap-4 lg:grid-cols-2">
        <NewsPanel />
        <CalendarPanel />
      </div>
    </section>
  )
}
