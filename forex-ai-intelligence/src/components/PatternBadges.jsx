export default function PatternBadges({ patterns }) {
  if (!patterns.length) {
    return <div className="text-xs text-muted">No patterns detected on current bar.</div>
  }

  const colorMap = {
    bullish: 'bg-bull/10 text-bull border-bull/30',
    bearish: 'bg-bear/10 text-bear border-bear/30',
    neutral: 'bg-neutral/10 text-neutral border-neutral/30',
  }

  const stars = (s) => '*'.repeat(s) + '.'.repeat(3 - s)

  return (
    <div className="flex flex-wrap gap-2">
      {patterns.map((p, i) => (
        <div
          key={`${p.name}-${i}`}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
            colorMap[p.type]
          }`}
        >
          <span>{p.name}</span>
          <span className="opacity-60 text-xs">{stars(p.strength)}</span>
        </div>
      ))}
    </div>
  )
}
