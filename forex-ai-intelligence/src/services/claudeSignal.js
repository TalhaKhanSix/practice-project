const SIGNAL_API_URL = '/api/signal'

function fmtNumber(value, digits = 5) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'N/A'
  return value.toFixed(digits)
}

export async function generateSignal(data) {
  const {
    pair,
    timeframe,
    price,
    bid,
    ask,
    spread,
    ohlc,
    rsi,
    ema20,
    ema50,
    macd,
    trend,
    session,
    strategies,
    mtf,
    patterns,
    orderFlow,
    structure,
    liquidity,
    pdArray,
    optimalEntry,
    news,
  } = data

  const patternList = (patterns || [])
    .map((p) => `${p.name} (${p.type}, strength ${p.strength}/3)`)
    .join(', ') || 'None'
  const stratList = (strategies || [])
    .map((s) => `${s.name}: ${s.signal}`)
    .join('\n  ') || 'None'
  const mtfSummary = mtf?.timeframes
    ? Object.entries(mtf.timeframes)
        .map(([tf, d]) => `${tf}: ${d.bias} (RSI ${d.rsi}, score ${d.score}%)`)
        .join('\n  ')
    : 'N/A'
  const anomalyText = orderFlow?.anomaly?.isAnomaly
    ? `SPIKE DETECTED - ${orderFlow.anomaly.direction}`
    : 'Normal'
  const newsText = (news || [])
    .slice(0, 4)
    .map((n) => `- ${n.text} (${n.impact} impact)`)
    .join('\n') || 'None'

  const prompt = `You are an elite Forex market analyst trained in ICT methodology, Smart Money Concepts, and institutional order flow. You will reason through this analysis step by step before reaching a conclusion.

============================================================
LIVE MARKET DATA
============================================================
Pair:          ${pair}
Timeframe:     ${timeframe}
Live Price:    ${fmtNumber(price)}
Bid/Ask:       ${fmtNumber(bid)} / ${fmtNumber(ask)} (spread: ${fmtNumber(spread, 5)})
Session:       ${session}
Day High/Low:  ${fmtNumber(ohlc?.high)} / ${fmtNumber(ohlc?.low)}
Day Open:      ${fmtNumber(ohlc?.open)}

============================================================
STEP 1 - MARKET STRUCTURE
============================================================
Swing Structure:  ${structure?.trend || 'UNDEFINED'}
Last HH/HL:       High at ${fmtNumber(structure?.lastHigh?.price)}, Low at ${fmtNumber(
    structure?.lastLow?.price
  )}
Key Levels:       Support: ${fmtNumber(structure?.support?.[0]?.price)}, Resistance: ${fmtNumber(
    structure?.resistance?.[0]?.price
  )}

============================================================
STEP 2 - PREMIUM / DISCOUNT ZONE
============================================================
Current Zone:    ${pdArray?.currentZone || 'N/A'}
Percentile:      ${pdArray?.percentile || 'N/A'}% of session range
Equilibrium:     ${fmtNumber(pdArray?.equilibrium)}
Entry Quality:   ${optimalEntry?.signal || 'N/A'} (Grade: ${optimalEntry?.quality || 'N/A'})

============================================================
STEP 3 - LIQUIDITY ANALYSIS
============================================================
${liquidity?.summary || 'No liquidity summary.'}
Buy-Side Liquidity (BSL):  ${(liquidity?.bsl || []).map((z) => fmtNumber(z.price)).join(', ') || 'None detected'}
Sell-Side Liquidity (SSL): ${(liquidity?.ssl || []).map((z) => fmtNumber(z.price)).join(', ') || 'None detected'}
Previous Day High:         ${fmtNumber(liquidity?.pdh)}
Previous Day Low:          ${fmtNumber(liquidity?.pdl)}

============================================================
STEP 4 - MULTI-TIMEFRAME CONFLUENCE
============================================================
  ${mtfSummary}
Overall Bias:   ${mtf?.overallBias || 'N/A'}
TF Agreement:   ${Math.max(mtf?.bullCount || 0, mtf?.bearCount || 0)}/5 timeframes aligned
MTF Grade:      ${mtf?.confidence || 'N/A'}

============================================================
STEP 5 - SMC PATTERN CONFLUENCE
============================================================
  ${stratList}

============================================================
STEP 6 - CANDLESTICK PATTERNS
============================================================
${patternList}

============================================================
STEP 7 - ORDER FLOW
============================================================
Buy Volume / Sell Volume: ${orderFlow?.buyVol ?? 0} / ${orderFlow?.sellVol ?? 0}
Volume Delta:   ${orderFlow?.delta ?? 0} (${orderFlow?.pressure || 'BALANCED'})
Volume Anomaly: ${anomalyText}

============================================================
STEP 8 - MACRO AND FUNDAMENTALS
============================================================
${newsText}

============================================================
INSTRUCTIONS
============================================================
Work through each step systematically before giving a final answer.
Consider confluences and conflicts between all data points.
Only recommend BUY or SELL if:
  - Market structure, MTF bias, and PD Array all agree
  - At least 5/8 SMC signals confirm the direction
  - Entry quality is A or A+
  - Stop loss can be placed behind a clear structural level
Otherwise recommend WAIT.

Respond ONLY as raw JSON with no markdown or backticks:
{
  "step1_structure":   "One sentence on market structure conclusion",
  "step2_pd_array":    "One sentence on where price is and what it implies",
  "step3_liquidity":   "One sentence on which liquidity pool is the target",
  "step4_mtf":         "One sentence on MTF alignment",
  "step5_smc":         "One sentence on SMC pattern confluence",
  "step6_candles":     "One sentence on candlestick confirmation",
  "step7_flow":        "One sentence on order flow bias",
  "action":            "BUY" | "SELL" | "WAIT",
  "confidence":        "HIGH" | "MEDIUM" | "LOW",
  "entry_zone":        "price level or range e.g. 1.0820-1.0835",
  "entry":             "exact entry price",
  "sl":                "stop loss price",
  "tp1":               "take profit 1 (1:1 RR)",
  "tp2":               "take profit 2 (1:2 RR)",
  "tp3":               "take profit 3 (1:3 RR)",
  "sl_pips":           number,
  "tp1_pips":          number,
  "rr":                "e.g. 1:2.5",
  "grade":             "A+" | "A" | "B" | "C",
  "invalidation":      "price level that would invalidate this setup",
  "reason":            "2-3 sentence professional summary",
  "analysis":          "5-6 sentence full institutional analysis"
}`

  const response = await fetch(SIGNAL_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) throw new Error(`API error: ${response.status}`)

  const responseData = await response.json()
  const raw = responseData.content?.map((b) => b.text || '').join('')
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

export async function notifySignal({ signal, pair, timeframe }) {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signal, pair, timeframe }),
    })
  } catch {
    // Notifications are best-effort; ignore errors.
  }
}
