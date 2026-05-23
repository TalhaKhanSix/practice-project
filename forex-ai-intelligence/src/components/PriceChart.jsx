import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default function PriceChart({ history, pair }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !history?.length) return
    const ctx = canvasRef.current.getContext('2d')
    const isUp = history[history.length - 1] >= history[0]
    const color = isUp ? '#22c55e' : '#ef4444'

    if (chartRef.current) {
      chartRef.current.data.datasets[0].data = history
      chartRef.current.data.datasets[0].borderColor = color
      chartRef.current.data.datasets[0].backgroundColor = color + '18'
      chartRef.current.update('none')
      return
    }

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: history.map((_, i) => i),
        datasets: [
          {
            data: history,
            borderColor: color,
            borderWidth: 1.5,
            backgroundColor: color + '18',
            pointRadius: 0,
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: {
            position: 'right',
            ticks: { maxTicksLimit: 5, font: { size: 10 } },
            grid: { color: 'rgba(136,135,128,0.1)' },
          },
        },
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [history, pair])

  return (
    <div className="relative w-full h-48">
      <canvas ref={canvasRef} />
    </div>
  )
}
