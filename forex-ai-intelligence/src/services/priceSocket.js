import ReconnectingWebSocket from 'reconnecting-websocket'

// Free tier: Polygon.io WebSocket (requires free API key)
// Alternative: Tiingo WebSocket, Alpaca Markets, FXCM Streaming
const WS_URL = 'wss://socket.polygon.io/forex'

let socket = null
let connected = false
const subscribers = new Map()
const connectionSubscribers = new Map()

function notifyConnection(status) {
  connected = status
  connectionSubscribers.forEach((cb) => cb(status))
}

export function connectPriceSocket(apiKey) {
  if (!apiKey) return
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return
  }

  socket = new ReconnectingWebSocket(WS_URL, [], {
    maxRetries: 10,
    reconnectionDelayGrowFactor: 1.3,
    minReconnectionDelay: 1000,
  })

  socket.onopen = () => {
    notifyConnection(true)
    socket.send(JSON.stringify({ action: 'auth', params: apiKey }))
    socket.send(
      JSON.stringify({
        action: 'subscribe',
        params:
          'C.EUR/USD,C.GBP/USD,C.USD/JPY,C.USD/CHF,C.AUD/USD,C.NZD/USD,C.USD/CAD,C.EUR/GBP,C.EUR/JPY',
      })
    )
  }

  socket.onmessage = (event) => {
    const messages = JSON.parse(event.data)
    messages.forEach((msg) => {
      if (msg.ev !== 'C') return
      const pair = msg.p.replace('/', '')
      const normalizedPair = `${pair.slice(0, 3)}/${pair.slice(3)}`
      const tick = {
        pair: normalizedPair,
        bid: msg.b,
        ask: msg.a,
        mid: (msg.b + msg.a) / 2,
        spread: +(msg.a - msg.b).toFixed(5),
        timestamp: msg.t,
      }
      subscribers.forEach((cb) => cb(tick))
    })
  }

  socket.onerror = (err) => console.error('[PriceSocket] Error:', err)
  socket.onclose = () => {
    notifyConnection(false)
    console.warn('[PriceSocket] Disconnected. Reconnecting...')
  }
}

export function subscribeTicks(id, callback) {
  subscribers.set(id, callback)
}

export function unsubscribeTicks(id) {
  subscribers.delete(id)
}

export function subscribeConnection(id, callback) {
  connectionSubscribers.set(id, callback)
  callback(connected)
}

export function unsubscribeConnection(id) {
  connectionSubscribers.delete(id)
}

export function disconnectPriceSocket() {
  if (socket) {
    socket.close()
    socket = null
    notifyConnection(false)
  }
}
