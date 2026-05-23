export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

export function sendSignalAlert(pair, action, confidence) {
  if (Notification.permission !== 'granted') return
  const icon = action === 'BUY' ? '^' : action === 'SELL' ? 'v' : '-'
  new Notification(`${icon} ${action} Signal - ${pair}`, {
    body: `${confidence} confidence signal generated. Open the dashboard for details.`,
    icon: '/favicon.ico',
    tag: 'forex-signal',
  })
}
