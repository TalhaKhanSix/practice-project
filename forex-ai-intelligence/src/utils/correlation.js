export function calcCorrelation(arr1, arr2) {
  const n = Math.min(arr1.length, arr2.length)
  if (n < 10) return 0
  const a = arr1.slice(-n)
  const b = arr2.slice(-n)
  const meanA = a.reduce((s, v) => s + v, 0) / n
  const meanB = b.reduce((s, v) => s + v, 0) / n
  let num = 0
  let denA = 0
  let denB = 0
  for (let i = 0; i < n; i++) {
    num += (a[i] - meanA) * (b[i] - meanB)
    denA += (a[i] - meanA) ** 2
    denB += (b[i] - meanB) ** 2
  }
  const denom = Math.sqrt(denA * denB)
  return denom === 0 ? 0 : parseFloat((num / denom).toFixed(2))
}

export function buildCorrelationMatrix(histories, pairs) {
  const matrix = {}
  pairs.forEach((p1) => {
    matrix[p1] = {}
    pairs.forEach((p2) => {
      matrix[p1][p2] = p1 === p2 ? 1 : calcCorrelation(histories[p1] || [], histories[p2] || [])
    })
  })
  return matrix
}
