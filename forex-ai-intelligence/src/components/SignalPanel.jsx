import { useCallback, useEffect, useState } from 'react'
import { generateSignal, notifySignal } from '../services/claudeSignal'
import { requestNotificationPermission, sendSignalAlert } from '../services/notifications'

export default function SignalPanel({
  pair,
  timeframe,
  price,
  bid,
  ask,
  spread,
  ohlc,
  rsi,
  trend,
  ema20,
  ema50,
  macd,
  strategies,
  session,
  mtf,
  patterns,
  orderFlow,
  structure,
  liquidity,
  pdArray,
  optimalEntry,
  news,
  onSignal,
}) {
  const [signal, setSignal] = useState(null)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notificationsReady, setNotificationsReady] = useState(false)

  useEffect(() => {
    requestNotificationPermission().then(setNotificationsReady)
  }, [])

  const handleAnalyze = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await generateSignal({
        pair,
        timeframe,
        price,
        bid,
        ask,
        spread,
        ohlc,
        rsi,
        ema20,
        ema50,
        trend,
        macd,
        strategies,
        session,
        mtf,
        patterns,
        orderFlow,
        structure,
        liquidity,
        pdArray,
        optimalEntry,
        news,
      })
      setSignal(result)
      setAnalysis(result.analysis)
      if (onSignal) onSignal(result)
      if (notificationsReady) {
        sendSignalAlert(pair, result.action, result.confidence)
      }
      notifySignal({ signal: result, pair, timeframe })
    } catch (e) {
      setError('Analysis failed. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }, [
    ask,
    bid,
    ema20,
    ema50,
    liquidity,
    macd,
    mtf,
    news,
    onSignal,
    optimalEntry,
    orderFlow,
    ohlc,
    pair,
    patterns,
    pdArray,
    price,
    rsi,
    session,
    spread,
    strategies,
    structure,
    timeframe,
    trend,
    notificationsReady,
  ])

  useEffect(() => {
    const handler = () => {
      if (!loading) handleAnalyze()
    }
    window.addEventListener('fx-analyze-signal', handler)
    return () => window.removeEventListener('fx-analyze-signal', handler)
  }, [handleAnalyze, loading])

  const actionColor =
    signal?.action === 'BUY'
      ? 'text-bull'
      : signal?.action === 'SELL'
        ? 'text-bear'
        : 'text-neutral'
  const tpPrimary = signal?.tp1 || signal?.tp || ''
  const tpSecondary = signal?.tp2 || ''
  const tpTertiary = signal?.tp3 || ''
  const confidenceText = signal?.grade
    ? `${signal.confidence} / ${signal.grade}`
    : `${signal.confidence} CONFIDENCE`

  return (
    <div className="panel">
      <div className="panel-label">
        AI Signal Engine - {pair} {timeframe}
      </div>
      <button onClick={handleAnalyze} disabled={loading} className="analyze-btn">
        {loading ? 'Analyzing with live data...' : 'ANALYZE MARKET AND GENERATE SIGNAL'}
      </button>
      {error && <p className="text-bear text-xs mt-2">{error}</p>}
      {analysis && <p className="text-sm mt-3 leading-relaxed">{analysis}</p>}
      {signal && (
        <div
          className={`signal-card mt-3 ${
            signal.action === 'BUY'
              ? 'sig-buy'
              : signal.action === 'SELL'
                ? 'sig-sell'
                : 'sig-wait'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={`text-base font-medium ${actionColor}`}>
              {signal.action === 'BUY'
                ? 'BUY / LONG'
                : signal.action === 'SELL'
                  ? 'SELL / SHORT'
                  : 'WAIT / NO TRADE'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface">{confidenceText}</span>
          </div>
          <p className="text-xs text-muted mb-3">{signal.reason}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-mono font-medium text-bear">{signal.sl}</div>
              <div className="text-xs text-muted mt-1">STOP LOSS</div>
            </div>
            <div>
              <div className="text-sm font-mono font-medium">{signal.entry}</div>
              <div className="text-xs text-muted mt-1">ENTRY</div>
            </div>
            <div>
              <div className="text-sm font-mono font-medium text-bull">
                {tpPrimary || 'N/A'} {signal.rr ? `R:R ${signal.rr}` : ''}
              </div>
              <div className="text-xs text-muted mt-1">TAKE PROFIT</div>
              {tpSecondary && (
                <div className="text-[10px] text-muted">TP2 {tpSecondary}</div>
              )}
              {tpTertiary && (
                <div className="text-[10px] text-muted">TP3 {tpTertiary}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
