import { useState, useEffect, useRef, useCallback } from 'react'
import { useTickStream } from './useTickStream'

const BASE_PRICES = {
  'EUR/USD': 1.0842,
  'GBP/USD': 1.2731,
  'USD/JPY': 149.82,
  'USD/CHF': 0.9021,
  'AUD/USD': 0.6534,
  'NZD/USD': 0.5981,
  'USD/CAD': 1.3621,
  'EUR/GBP': 0.8514,
  'EUR/JPY': 162.44,
  'XAU/USD': 2342.5,
}

export function useLivePrices() {
  const apiKey = import.meta.env.VITE_POLYGON_API_KEY
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
  const { latestTick, isConnected } = useTickStream(apiKey)

  const fetchRates = useCallback(async () => {
    if (Date.now() - lastFetch.current < 4000) return
    lastFetch.current = Date.now()
    try {
      const res = await fetch(
        'https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,JPY,CHF,AUD,NZD,CAD'
      )
      const data = await res.json()
      const r = data.rates
      setPrevPrices((p) => ({ ...p }))
      setPrices((prev) => ({
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
    setPrices((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((pair) => {
        const noise = (Math.random() - 0.49) * 0.00015 * next[pair]
        next[pair] = +(next[pair] + noise).toFixed(pair.includes('JPY') ? 3 : 5)
      })
      setHistory((h) => {
        const nh = { ...h }
        Object.keys(nh).forEach((pair) => {
          nh[pair] = [...nh[pair].slice(-119), next[pair]]
        })
        return nh
      })
      return next
    })
  }, [])

  useEffect(() => {
    if (apiKey) return
    fetchRates()
    addTick()
    const id = setInterval(() => {
      fetchRates()
      addTick()
    }, 5000)
    return () => clearInterval(id)
  }, [apiKey, fetchRates, addTick])

  useEffect(() => {
    if (!latestTick) return
    setPrices((prev) => {
      const next = { ...prev, [latestTick.pair]: latestTick.mid }
      setPrevPrices((p) => ({ ...p, [latestTick.pair]: prev[latestTick.pair] }))
      return next
    })
    setHistory((prev) => ({
      ...prev,
      [latestTick.pair]: [...(prev[latestTick.pair] || []).slice(-299), latestTick.mid],
    }))
  }, [latestTick])

  return { prices, prevPrices, history, isConnected, latestTick }
}
