// In production, replace with a live API:
// GET https://newsapi.org/v2/everything?q=forex+USD+EUR&apiKey=YOUR_KEY
// GET https://nfs.faireconomy.media/ff_calendar_thisweek.json (ForexFactory)

export const MARKET_NEWS = [
  {
    text: 'Fed officials signal patience on rate decisions amid mixed economic data',
    time: '09:41 UTC',
    impact: 'HIGH',
    color: '#ef4444',
    pair: 'USD',
  },
  {
    text: 'Euro zone inflation cools further as ECB watchers remain cautious',
    time: '09:20 UTC',
    impact: 'HIGH',
    color: '#ef4444',
    pair: 'EUR',
  },
  {
    text: 'Dollar index retreats as risk appetite improves in global markets',
    time: '08:55 UTC',
    impact: 'MEDIUM',
    color: '#f59e0b',
    pair: 'USD',
  },
  {
    text: 'Gold holds above 2340 amid geopolitical tensions and dollar weakness',
    time: '08:30 UTC',
    impact: 'MEDIUM',
    color: '#f59e0b',
    pair: 'XAU',
  },
]

export const ECONOMIC_CALENDAR = [
  { event: 'US Core CPI m/m', time: '13:30 UTC', impact: 'HIGH', currency: 'USD' },
  { event: 'ECB President Lagarde Speaks', time: '14:00 UTC', impact: 'HIGH', currency: 'EUR' },
  { event: 'US Initial Jobless Claims', time: '13:30 UTC', impact: 'MEDIUM', currency: 'USD' },
  {
    event: 'BoE Consumer Inflation Expectations',
    time: '09:30 UTC',
    impact: 'MEDIUM',
    currency: 'GBP',
  },
]
