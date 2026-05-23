export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const rateLimitMap = globalThis.__fxRateLimit || new Map()
  globalThis.__fxRateLimit = rateLimitMap
  const clientIP = req.headers['x-forwarded-for'] || 'unknown'
  const now = Date.now()
  const windowMs = 60_000
  const limit = 20
  const history = (rateLimitMap.get(clientIP) || []).filter((t) => now - t < windowMs)
  if (history.length >= limit) {
    return res.status(429).json({ error: 'Rate limit exceeded. Max 20 analyses per minute.' })
  }
  rateLimitMap.set(clientIP, [...history, now])
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  })
  const data = await response.json()
  res.status(response.status).json(data)
}
