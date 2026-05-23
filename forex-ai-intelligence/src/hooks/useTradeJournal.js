import { useState, useEffect } from 'react'

const STORAGE_KEY = 'forex_ai_journal'

export function useTradeJournal() {
  const [journal, setJournal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journal))
  }, [journal])

  const addEntry = (signal, pair, timeframe) => {
    setJournal((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        pair,
        timeframe,
        ...signal,
        outcome: 'OPEN',
      },
      ...prev.slice(0, 49),
    ])
  }

  const updateOutcome = (id, outcome) => {
    setJournal((prev) => prev.map((e) => (e.id === id ? { ...e, outcome } : e)))
  }

  const clearJournal = () => setJournal([])

  return { journal, addEntry, updateOutcome, clearJournal }
}
