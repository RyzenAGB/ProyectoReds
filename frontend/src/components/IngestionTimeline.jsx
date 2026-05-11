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
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'UDP (Telemetría GPS)',
        data: udpData,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.3,
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
        labels: { color: '#94a3b8', font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          title: (items) => `⏱ ${items[0].label}`,
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} registros`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Hora (HH:MM)', color: '#94a3b8' },
        ticks: { color: '#64748b', maxRotation: 0 },
        grid: { color: '#1e293b' },
      },
      y: {
        title: { display: true, text: 'Registros por minuto', color: '#94a3b8' },
        ticks: { color: '#64748b', stepSize: 1 },
        grid: { color: '#1e293b' },
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
