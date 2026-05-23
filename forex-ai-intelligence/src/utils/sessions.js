export function getCurrentSession(utcHour) {
  if (utcHour >= 2 && utcHour < 5) {
    return { name: 'Asia Killzone', color: '#7c3aed', pip: 'Low volatility, range-bound' }
  }
  if (utcHour >= 7 && utcHour < 10) {
    return { name: 'London Open KZ', color: '#3b82f6', pip: 'Highest probability - institutional entries' }
  }
  if (utcHour >= 12 && utcHour < 13) {
    return { name: 'NY AM Killzone', color: '#22c55e', pip: 'Second best window - trend continuation' }
  }
  if (utcHour >= 13 && utcHour < 14) {
    return { name: 'London Close KZ', color: '#f59e0b', pip: 'Reversal and profit-taking setups' }
  }
  if (utcHour >= 19 && utcHour < 21) {
    return { name: 'NY PM Killzone', color: '#ef4444', pip: 'Low volume, avoid scalping' }
  }
  return { name: 'Off-Session', color: '#374151', pip: 'Reduced liquidity - trade with caution' }
}

export const ALL_KILLZONES = [
  { name: 'Asia KZ', start: 2, end: 5, color: '#7c3aed', pairs: ['USD/JPY', 'AUD/USD', 'NZD/USD'] },
  { name: 'London Open KZ', start: 7, end: 10, color: '#3b82f6', pairs: ['EUR/USD', 'GBP/USD', 'EUR/GBP'] },
  { name: 'NY Open KZ', start: 12, end: 13, color: '#22c55e', pairs: ['EUR/USD', 'GBP/USD', 'USD/CAD'] },
  { name: 'London Close', start: 13, end: 14, color: '#f59e0b', pairs: ['EUR/USD', 'GBP/USD'] },
  { name: 'NY PM KZ', start: 19, end: 21, color: '#ef4444', pairs: ['USD/CAD', 'USD/JPY'] },
]
