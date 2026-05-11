import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

function formatMinute(isoStr) {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  } catch {
    return isoStr
  }
}

export default function IngestionTimeline({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ fontSize: '2rem' }}>📡</p>
        <p>Sin datos de timeline. Los registros aparecerán conforme los agentes envíen datos.</p>
      </div>
    )
  }

  // Agrupar por minuto y origen
  const minutos = [...new Set(data.map((d) => d.minuto))].sort()
  const tcpMap = {}
  const udpMap = {}
  data.forEach((d) => {
    if (d.origen === 'TCP') tcpMap[d.minuto] = d.total
    if (d.origen === 'UDP') udpMap[d.minuto] = d.total
  })

  const labels = minutos.map(formatMinute)
  const tcpData = minutos.map((m) => tcpMap[m] || 0)
  const udpData = minutos.map((m) => udpMap[m] || 0)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'TCP (Transaccional)',
        data: tcpData,
        borderColor: '#38bdf8', // Cyan accent
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#0a0f1c',
        pointHoverBackgroundColor: '#7dd3fc',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'UDP (Telemetría GPS)',
        data: udpData,
        borderColor: '#fbbf24', // Amber
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#0a0f1c',
        pointHoverBackgroundColor: '#fcd34d',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: "'Inter', sans-serif", size: 12 } },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(56, 189, 248, 0.2)',
        borderWidth: 1,
        titleFont: { family: "'Space Grotesk', sans-serif", weight: '700' },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: (items) => `⏱ ${items[0].label}`,
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} registros`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Hora (HH:MM)', color: '#94a3b8', font: { family: "'Inter', sans-serif" } },
        ticks: { color: '#475569', maxRotation: 0, font: { family: "'JetBrains Mono', monospace", size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
      },
      y: {
        title: { display: true, text: 'Registros por minuto', color: '#94a3b8', font: { family: "'Inter', sans-serif" } },
        ticks: { color: '#475569', stepSize: 1, font: { family: "'JetBrains Mono', monospace", size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
        beginAtZero: true,
      },
    },
  }

  const totalTcp = tcpData.reduce((a, b) => a + b, 0)
  const totalUdp = udpData.reduce((a, b) => a + b, 0)

  return (
    <>
      <div className="timeline-kpis">
        <div className="timeline-kpi">
          <span className="kpi-dot kpi-dot--tcp" />
          <span className="kpi-label">Total TCP</span>
          <span className="kpi-value kpi-value--tcp">{totalTcp}</span>
        </div>
        <div className="timeline-kpi">
          <span className="kpi-dot kpi-dot--udp" />
          <span className="kpi-label">Total UDP</span>
          <span className="kpi-value kpi-value--udp">{totalUdp}</span>
        </div>
        <div className="timeline-kpi">
          <span className="kpi-label">Minutos activos</span>
          <span className="kpi-value">{data.length}</span>
        </div>
      </div>
      <div className="chart-container">
        <div className="chart-wrapper">
          <Line data={chartData} options={options} />
        </div>
      </div>
    </>
  )
}
