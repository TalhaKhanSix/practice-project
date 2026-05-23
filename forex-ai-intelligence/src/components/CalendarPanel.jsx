import { ECONOMIC_CALENDAR } from '../data/marketNews'

const impactStyles = {
  HIGH: 'bg-bear text-white',
  MEDIUM: 'bg-neutral text-white',
  LOW: 'bg-foreground text-background',
}

export default function CalendarPanel() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">Economic Calendar</div>
      <div className="space-y-3">
        {ECONOMIC_CALENDAR.map((item, index) => (
          <div key={`${item.time}-${index}`} className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm">{item.event}</div>
              <div className="text-xs text-muted mt-1">
                {item.time} - {item.currency}
              </div>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-1 rounded-full ${
                impactStyles[item.impact] || 'bg-foreground text-background'
              }`}
            >
              {item.impact}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
