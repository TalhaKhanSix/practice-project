import { MARKET_NEWS } from '../data/marketNews'

export default function NewsPanel() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">Market News</div>
      <div className="space-y-3">
        {MARKET_NEWS.map((item, index) => (
          <div key={`${item.time}-${index}`} className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm">{item.text}</div>
              <div className="text-xs text-muted mt-1">
                {item.time} - {item.pair}
              </div>
            </div>
            <span
              className="text-[10px] font-mono px-2 py-1 rounded-full"
              style={{ backgroundColor: item.color, color: '#ffffff' }}
            >
              {item.impact}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
