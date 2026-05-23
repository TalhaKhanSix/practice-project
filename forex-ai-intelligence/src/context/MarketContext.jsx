import { createContext, useContext, useMemo, useState } from 'react'

const MarketContext = createContext(null)

const DEFAULT_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'NZD/USD',
  'USD/CAD',
  'EUR/GBP',
  'EUR/JPY',
  'XAU/USD',
]

const DEFAULT_TIMEFRAMES = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1']

export function MarketProvider({ children }) {
  const [pair, setPair] = useState(DEFAULT_PAIRS[0])
  const [timeframe, setTimeframe] = useState('M15')

  const value = useMemo(
    () => ({
      pair,
      setPair,
      timeframe,
      setTimeframe,
      pairs: DEFAULT_PAIRS,
      timeframes: DEFAULT_TIMEFRAMES,
    }),
    [pair, timeframe]
  )

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
}

export function useMarket() {
  const context = useContext(MarketContext)
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider')
  }
  return context
}
