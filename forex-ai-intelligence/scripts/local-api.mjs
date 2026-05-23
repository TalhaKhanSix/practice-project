import http from 'http'
import { config } from 'dotenv'

config()

const PORT = Number(process.env.LOCAL_API_PORT || 8787)

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(payload))
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      if (!raw) return resolve(null)
      try {
        resolve(JSON.parse(raw))
      } catch (err) {
        reject(err)
      }
    })
  })
}

async function handleSignal(req, res) {
  const body = await readBody(req)
  if (!body) return sendJson(res, 400, { error: 'Missing request body.' })

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    return sendJson(res, 500, { error: 'Missing ANTHROPIC_API_KEY in .env.' })
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()
  res.writeHead(response.status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

async function sendTelegram(signal, pair, timeframe) {
  const grade = signal.grade === 'A+' ? '***' : signal.grade === 'A' ? '**' : '*'
  const msg =
    `${signal.action} - ${pair} ${grade}\n` +
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

async function handleNotify(req, res) {
  const body = await readBody(req)
  if (!body?.signal) return sendJson(res, 400, { error: 'Missing signal payload.' })

  const { signal, pair, timeframe } = body
  if (signal.confidence !== 'HIGH' && signal.grade !== 'A+') {
    return sendJson(res, 200, { sent: false, reason: 'Signal grade too low' })
  }

  await Promise.allSettled([
    process.env.TELEGRAM_BOT_TOKEN ? sendTelegram(signal, pair, timeframe) : null,
    process.env.DISCORD_WEBHOOK_URL ? sendDiscord(signal, pair, timeframe) : null,
  ])

  return sendJson(res, 200, { sent: true })
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' })
    }

    if (req.url === '/api/signal') return await handleSignal(req, res)
    if (req.url === '/api/notify') return await handleNotify(req, res)

    return sendJson(res, 404, { error: 'Not found' })
  } catch (err) {
    console.error('[local-api] error', err)
    return sendJson(res, 500, { error: 'Local API error' })
  }
})

server.listen(PORT, () => {
  console.log(`[local-api] listening on http://localhost:${PORT}`)
})
