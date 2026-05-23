export default function TradeJournal({ journal, onUpdateOutcome, onClear }) {
  return (
    <div id="trade-journal" className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-widest text-muted">Trade Journal</div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{journal.length} entries</span>
          <button
            type="button"
            onClick={onClear}
            className="text-xs px-2 py-1 rounded-md border border-border hover:bg-background"
          >
            Clear
          </button>
        </div>
      </div>
      {journal.length === 0 ? (
        <div className="text-sm text-muted">No signals saved yet.</div>
      ) : (
        <div className="space-y-3">
          {journal.map((entry) => {
            const tp1 = entry.tp1 || entry.tp || 'N/A'
            const tp2 = entry.tp2
            const tp3 = entry.tp3
            return (
              <div key={entry.id} className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">
                    {entry.action} - {entry.pair} {entry.timeframe}
                  </div>
                  <div className="text-xs text-muted">{new Date(entry.timestamp).toLocaleString()}</div>
                </div>
                <select
                  value={entry.outcome}
                  onChange={(e) => onUpdateOutcome(entry.id, e.target.value)}
                  className="text-xs rounded-md border border-border bg-surface px-2 py-1"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="WIN">WIN</option>
                  <option value="LOSS">LOSS</option>
                  <option value="BREAKEVEN">BREAKEVEN</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3">
                <div className="rounded-md border border-border bg-surface py-2">
                  <div className="font-mono">{entry.sl}</div>
                  <div className="text-[10px] text-muted mt-1">SL</div>
                </div>
                <div className="rounded-md border border-border bg-surface py-2">
                  <div className="font-mono">{entry.entry}</div>
                  <div className="text-[10px] text-muted mt-1">ENTRY</div>
                </div>
                <div className="rounded-md border border-border bg-surface py-2">
                  <div className="font-mono">{tp1}</div>
                  <div className="text-[10px] text-muted mt-1">TP</div>
                  {tp2 && <div className="text-[10px] text-muted">TP2 {tp2}</div>}
                  {tp3 && <div className="text-[10px] text-muted">TP3 {tp3}</div>}
                </div>
              </div>
              <div className="text-xs text-muted mt-2">{entry.reason}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
