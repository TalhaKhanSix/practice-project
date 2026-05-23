export async function analyzeSentiment(newsItems, calendarEvents, pairs) {
  const prompt = `Analyze the following Forex market news and economic events. For each major currency (USD, EUR, GBP, JPY, CHF, AUD, NZD, CAD), assign:
- A sentiment score from -100 (extremely bearish) to +100 (extremely bullish)
- A one-word label: STRONG_BULL, BULL, NEUTRAL, BEAR, STRONG_BEAR
- One sentence explanation

NEWS:
${newsItems.map((n) => `- ${n.text}`).join('\n')}

ECONOMIC CALENDAR:
${calendarEvents.map((e) => `- ${e.event} (${e.currency}, ${e.impact} impact)`).join('\n')}

Respond ONLY as raw JSON:
{
  "USD": { "score": number, "label": "BULL", "reason": "..." },
  "EUR": { "score": number, "label": "NEUTRAL", "reason": "..." },
  "GBP": { "score": number, "label": "BEAR", "reason": "..." },
  "JPY": { "score": number, "label": "NEUTRAL", "reason": "..." },
  "CHF": { "score": number, "label": "BULL", "reason": "..." },
  "AUD": { "score": number, "label": "BEAR", "reason": "..." },
  "NZD": { "score": number, "label": "NEUTRAL", "reason": "..." },
  "CAD": { "score": number, "label": "NEUTRAL", "reason": "..." },
  "overall_risk": "RISK_ON" | "RISK_OFF" | "NEUTRAL",
  "dxy_bias": "BULLISH" | "BEARISH" | "NEUTRAL",
  "best_long": "currency most bullish",
  "best_short": "currency most bearish",
  "top_pair": "best pair to trade e.g. EUR/USD"
}`

  const res = await fetch('/api/signal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  const raw = data.content?.map((b) => b.text || '').join('')
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}
