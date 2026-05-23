import { useEffect, useRef } from 'react'
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts'

export default function AdvancedChart({ history, ohlc, fibLevels, swingPoints, pair }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const candleRef = useRef(null)
  const volRef = useRef(null)

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

    const candles = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    const now = Math.floor(Date.now() / 1000)
    const bars = history.slice(-100).map((price, i) => ({
      time: now - (100 - i) * 60,
      open: i === 0 ? price : history[i - 1],
      high: price * 1.0003,
      low: price * 0.9997,
      close: price,
    }))
    candles.setData(bars)

    const vol = chart.addHistogramSeries({
      color: '#3b82f6',
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
      scaleMargins: { top: 0.85, bottom: 0 },
    })
    vol.setData(
      bars.map((b) => ({
        time: b.time,
        value: 50 + Math.random() * 50,
        color: b.close >= b.open ? '#22c55e33' : '#ef444433',
      }))
    )

    if (fibLevels) {
      Object.entries(fibLevels).forEach(([key, price]) => {
        candles.createPriceLine({
          price,
          color: '#f59e0b',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: key.replace('fib_', 'Fib '),
        })
      })
    }

    if (swingPoints?.length) {
      const markers = swingPoints.slice(-20).map((sp) => ({
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
    volRef.current = vol

    const observer = new ResizeObserver(() => {
      chart.applyOptions({ width: containerRef.current?.clientWidth || 600 })
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      chart.remove()
    }
  }, [pair, history, fibLevels, swingPoints])

  useEffect(() => {
    if (!candleRef.current || !history.length) return
    const price = history[history.length - 1]
    candleRef.current.update({
      time: Math.floor(Date.now() / 1000),
      open: history[history.length - 2] || price,
      high: price * 1.0003,
      low: price * 0.9997,
      close: price,
    })
  }, [history])

  return <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
}
