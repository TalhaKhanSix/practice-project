import { useState } from 'react'
import Papa from 'papaparse'
import { runBacktest } from '../utils/backtester'

const DEFAULT_OPTIONS = {
  confluenceThreshold: 65,
  rr: 2,
  slPips: 20,
  pipValue: 0.0001,
}

function parsePrices(rows) {
  const keys = ['close', 'Close', 'close_price', 'price', 'Price', 'c', 'C']
  const prices = []
  rows.forEach((row) => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        const value = Number(row[key])
        if (Number.isFinite(value)) {
          prices.push(value)
          return
        }
      }
    }
  })
  return prices
}

export default function BacktestPanel() {
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState(DEFAULT_OPTIONS)

  const handleFile = (file) => {
    if (!file) return
    setLoading(true)
    setError('')
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        try {
          const prices = parsePrices(res.data)
          if (prices.length < 100) {
            setError('Not enough data. Provide at least 100 rows of prices.')
            setResults(null)
          } else {
            const backtest = runBacktest(prices, options)
            setResults(backtest)
          }
        } catch (e) {
          setError('Failed to parse CSV. Ensure it has a close/price column.')
          setResults(null)
        } finally {
          setLoading(false)
        }
      },
      error: () => {
        setError('CSV parsing failed.')
        setResults(null)
        setLoading(false)
      },
    })
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">Backtesting Engine</div>
      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
        <label className="flex flex-col gap-1">
          Confluence Threshold
          <input
            type="number"
            value={options.confluenceThreshold}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, confluenceThreshold: Number(e.target.value) }))
            }
            className="rounded-md border border-border bg-background px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          Risk Reward
          <input
            type="number"
            value={options.rr}
            step="0.1"
            onChange={(e) => setOptions((prev) => ({ ...prev, rr: Number(e.target.value) }))}
            className="rounded-md border border-border bg-background px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          Stop Loss (pips)
          <input
            type="number"
            value={options.slPips}
            onChange={(e) => setOptions((prev) => ({ ...prev, slPips: Number(e.target.value) }))}
            className="rounded-md border border-border bg-background px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          Pip Value
          <input
            type="number"
            value={options.pipValue}
            step="0.0001"
            onChange={(e) => setOptions((prev) => ({ ...prev, pipValue: Number(e.target.value) }))}
            className="rounded-md border border-border bg-background px-2 py-1"
          />
        </label>
      </div>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="text-xs"
      />
      {loading && <div className="text-xs text-muted mt-2">Running backtest...</div>}
      {error && <div className="text-xs text-bear mt-2">{error}</div>}

      {results && (
        <div className="mt-4">
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="rounded-md border border-border bg-background p-2">
              <div className="text-muted">Win Rate</div>
              <div className="font-medium">{results.winRate}%</div>
            </div>
            <div className="rounded-md border border-border bg-background p-2">
              <div className="text-muted">Total Pips</div>
              <div className="font-medium">{results.totalPips}</div>
            </div>
            <div className="rounded-md border border-border bg-background p-2">
              <div className="text-muted">Profit Factor</div>
              <div className="font-medium">{results.profitFactor}</div>
            </div>
            <div className="rounded-md border border-border bg-background p-2">
              <div className="text-muted">Trades</div>
              <div className="font-medium">{results.total}</div>
            </div>
          </div>
          <div className="mt-3 max-h-48 overflow-auto text-xs">
            <table className="w-full text-left">
              <thead className="text-muted">
                <tr>
                  <th className="py-1">Dir</th>
                  <th className="py-1">Outcome</th>
                  <th className="py-1">Entry</th>
                  <th className="py-1">Exit</th>
                  <th className="py-1">Pips</th>
                </tr>
              </thead>
              <tbody>
                {results.results.slice(0, 20).map((row) => (
                  <tr key={row.index}>
                    <td className="py-1 font-mono">{row.direction}</td>
                    <td className="py-1">{row.outcome}</td>
                    <td className="py-1 font-mono">{row.entry.toFixed(5)}</td>
                    <td className="py-1 font-mono">{row.exitPrice.toFixed(5)}</td>
                    <td className="py-1 font-mono">{row.pnlPips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
