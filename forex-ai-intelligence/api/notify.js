async function sendTelegram(signal, pair, timeframe) {
  const emoji = signal.action === 'BUY' ? 'GREEN' : signal.action === 'SELL' ? 'RED' : 'YELLOW'
  const grade = signal.grade === 'A+' ? '***' : signal.grade === 'A' ? '**' : '*'
  const msg =
    `${emoji} ${signal.action} - ${pair} ${grade}\n` +
    `------------------------------\n` +
    `Timeframe:   ${timeframe}\n` +
    `Entry:       ${signal.entry}\n` +
    `Stop Loss:   ${signal.sl} (${signal.sl_pips} pips)\n` +
    `TP1:         ${signal.tp1 || signal.tp}\n` +
    `TP2:         ${signal.tp2 || 'N/A'}\n` +
    `TP3:         ${signal.tp3 || 'N/A'}\n` +
    `R:R Ratio:   ${signal.rr}\n` +
    `Grade:       ${signal.grade}\n` +
    `Invalidate:  ${signal.invalidation || 'N/A'}\n` +
    `------------------------------\n` +
    `${signal.reason}\n\n` +
    `Signal by FOREX AI Intelligence System`

  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: msg,
    }),
  })
}

async function sendDiscord(signal, pair, timeframe) {
  const color = signal.action === 'BUY' ? 0x22c55e : signal.action === 'SELL' ? 0xef4444 : 0xf59e0b
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: `${signal.action} Signal - ${pair} (${timeframe})`,
          color,
          fields: [
            { name: 'Entry', value: `${signal.entry}`, inline: true },
            { name: 'Stop Loss', value: `${signal.sl}`, inline: true },
            { name: 'TP1/TP2', value: `${signal.tp1 || signal.tp} / ${signal.tp2 || 'N/A'}`, inline: true },
            { name: 'R:R', value: `${signal.rr}`, inline: true },
            { name: 'Grade', value: `${signal.grade}`, inline: true },
            { name: 'Confidence', value: `${signal.confidence}`, inline: true },
            { name: 'Analysis', value: signal.reason },
          ],
          footer: { text: 'FOREX AI Intelligence' },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { signal, pair, timeframe } = req.body
  if (signal.confidence !== 'HIGH' && signal.grade !== 'A+') {
    return res.json({ sent: false, reason: 'Signal grade too low' })
  }
  await Promise.allSettled([
    process.env.TELEGRAM_BOT_TOKEN ? sendTelegram(signal, pair, timeframe) : null,
    process.env.DISCORD_WEBHOOK_URL ? sendDiscord(signal, pair, timeframe) : null,
  ])
  res.json({ sent: true })
}
