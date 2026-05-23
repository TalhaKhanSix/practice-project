export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function throttle(fn, limit) {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= limit) {
      last = now
      return fn(...args)
    }
  }
}

export function priceChanged(prev, next, decimals = 5) {
  return Math.abs(prev - next) >= Math.pow(10, -decimals)
}
