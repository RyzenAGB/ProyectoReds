import { useState, useEffect, useCallback } from 'react'
import IngestionTable from './components/IngestionTable'
import DistanceChart from './components/DistanceChart'
import FreightRoutes from './components/FreightRoutes'
import { fetchDatos, fetchDistancias, fetchRutas, fetchResumen } from './api'

const TABS = [
  { id: 'ingestion', label: 'Datos Recibidos' },
  { id: 'distancia', label: 'Distancia vs Retrasos' },
  { id: 'rutas', label: 'Top 5 Rutas Logísticas' },
]

export default function App() {
  const [tab, setTab] = useState('ingestion')
  const [datos, setDatos] = useState([])
  const [distancias, setDistancias] = useState([])
  const [rutas, setRutas] = useState([])
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const cargarDatos = useCallback(async () => {
    setRefreshing(true)
    try {
      const [d, dist, r, res] = await Promise.all([
        fetchDatos(),
        fetchDistancias(),
        fetchRutas(),
        fetchResumen(),
      ])
      setDatos(d.data || [])
      setDistancias(dist.data || [])
      setRutas(r.data || [])
      setResumen(res)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
    const interval = setInterval(cargarDatos, 5000)
    return () => clearInterval(interval)
  }, [cargarDatos])

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Conectando al Data Warehouse...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Data Warehouse Logístico</h1>
        <p>Brazilian E-Commerce Dataset — Olist</p>
        <div className="header-badge">
          <span className={`badge ${error ? 'badge-error' : 'badge-ok'}`}>
            {error ? 'ERROR' : refreshing ? 'ACTUALIZANDO' : 'CONECTADO'}
          </span>
        </div>
      </header>

      <div className="tab-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="tab-content">
        {tab === 'ingestion' && (
          <section>
            {resumen && (
              <div className="summary-cards">
                <div className="card">
                  <h3>Registros TCP</h3>
                  <div className="card-value">
                    {resumen.tcp_por_tabla?.reduce((s, i) => s + i.total, 0) || 0}
                  </div>
                </div>
                <div className="card">
                  <h3>Pings UDP</h3>
                  <div className="card-value">{resumen.udp_total_pings || 0}</div>
                </div>
                <div className="card">
                  <h3>Tablas TCP</h3>
                  <div className="card-value">{resumen.tcp_por_tabla?.length || 0}</div>
                </div>
              </div>
            )}
            <IngestionTable data={datos} />
          </section>
        )}

        {tab === 'distancia' && (
          <section>
            <h2>Correlación: Distancia Geográfica vs Días de Retraso</h2>
            <p className="metric-desc">
              Cada punto representa una orden entregada. Eje X: distancia en km entre vendedor y cliente.
              Eje Y: días de retraso respecto a la fecha estimada.
            </p>
            <DistanceChart data={distancias} />
          </section>
        )}

        {tab === 'rutas' && (
          <section>
            <h2>Top 5 Rutas Logísticas Interestatales por Costo de Flete</h2>
            <p className="metric-desc">
              Rutas con mayor costo promedio de envío entre estados de Brasil, incluyendo
              las categorías de productos que más transitan por cada ruta.
            </p>
            <FreightRoutes data={rutas} />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Proyecto Data Warehouse — Redes de Computadores — Ing. de Sistemas UNI</p>
      </footer>
    </div>
  )
}
