import { useState, useEffect, useCallback } from 'react'
import IngestionTable from './components/IngestionTable'
import DistanceChart from './components/DistanceChart'
import FreightRoutes from './components/FreightRoutes'
import SalesByState from './components/SalesByState'
import CategoryDelays from './components/CategoryDelays'
import IngestionTimeline from './components/IngestionTimeline'
import {
  fetchDatos,
  fetchDistancias,
  fetchRutas,
  fetchResumen,
  fetchVentasEstado,
  fetchCategoriasRetraso,
  fetchIngestaTimeline,
} from './api'

const TABS = [
  { id: 'ingestion',  label: '📋 Datos Recibidos' },
  { id: 'distancia',  label: '📍 Distancia vs Retrasos' },
  { id: 'rutas',      label: '🚚 Top 5 Rutas' },
  { id: 'ventas',     label: '🗺️ Ventas por Estado' },
  { id: 'categorias', label: '📦 Retrasos por Categoría' },
  { id: 'timeline',   label: '📡 Timeline de Ingesta' },
]

export default function App() {
  const [tab, setTab] = useState('ingestion')
  const [datos, setDatos] = useState([])
  const [distancias, setDistancias] = useState([])
  const [rutas, setRutas] = useState([])
  const [resumen, setResumen] = useState(null)
  const [ventasEstado, setVentasEstado] = useState([])
  const [categoriasRetraso, setCategoriasRetraso] = useState([])
  const [ingestaTimeline, setIngestaTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const cargarEndpoint = useCallback(async (key, fetcher, setter) => {
    try {
      const result = await fetcher()
      setter(result.data || result)
      return null
    } catch (err) {
      return `${key}: ${err.message}`
    }
  }, [])

  const cargarDatos = useCallback(async () => {
    setRefreshing(true)
    const results = await Promise.allSettled([
      cargarEndpoint('datos',      fetchDatos,              setDatos),
      cargarEndpoint('distancias', fetchDistancias,         setDistancias),
      cargarEndpoint('rutas',      fetchRutas,              setRutas),
      cargarEndpoint('resumen',    fetchResumen,            setResumen),
      cargarEndpoint('ventas',     fetchVentasEstado,       setVentasEstado),
      cargarEndpoint('categorias', fetchCategoriasRetraso,  setCategoriasRetraso),
      cargarEndpoint('timeline',   fetchIngestaTimeline,    setIngestaTimeline),
    ])
    const errores = results
      .filter((r) => r.status === 'fulfilled' && r.value !== null)
      .map((r) => r.value)
    // Solo mostrar ERROR si fallan los endpoints criticos (datos o resumen)
    const errorCritico = errores.some(e => e.includes('datos') || e.includes('resumen'))
    if (errorCritico) {
      setError(errores.join(' | '))
    } else if (errores.length > 0) {
      console.warn('Endpoints secundarios fallaron:', errores)
      setError(null)
    } else {
      setError(null)
    }
    setLoading(false)
    setRefreshing(false)
  }, [cargarEndpoint])

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
        {/* ── Tab 1: Datos Recibidos ── */}
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
                <div className="card card--highlight">
                  <h3>Total Órdenes</h3>
                  <div className="card-value card-value--green">{resumen.total_ordenes || 0}</div>
                </div>
                <div className="card card--highlight">
                  <h3>Productos Únicos</h3>
                  <div className="card-value card-value--purple">{resumen.total_productos || 0}</div>
                </div>
                <div className="card card--highlight">
                  <h3>Flete Promedio</h3>
                  <div className="card-value card-value--amber">R$ {resumen.flete_promedio || 0}</div>
                </div>
              </div>
            )}
            <IngestionTable data={datos} />
          </section>
        )}

        {/* ── Tab 2: Distancia vs Retrasos ── */}
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

        {/* ── Tab 3: Top 5 Rutas ── */}
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

        {/* ── Tab 4: Ventas por Estado ── */}
        {tab === 'ventas' && (
          <section>
            <h2>Volumen de Ventas por Estado Geográfico</h2>
            <p className="metric-desc">
              Distribución de órdenes según el estado del cliente. Responde a la pregunta estratégica:
              <em> ¿Cuál es el volumen de ventas por estado geográfico?</em>
            </p>
            <SalesByState data={ventasEstado} />
          </section>
        )}

        {/* ── Tab 5: Categorías con Retraso ── */}
        {tab === 'categorias' && (
          <section>
            <h2>Categorías de Productos con Mayor Retraso en Entrega</h2>
            <p className="metric-desc">
              Promedio de días de retraso por categoría de producto. Responde a la pregunta estratégica:
              <em> ¿Cuáles son las categorías con mayores retrasos en la entrega?</em>
            </p>
            <CategoryDelays data={categoriasRetraso} />
          </section>
        )}

        {/* ── Tab 6: Timeline de Ingesta ── */}
        {tab === 'timeline' && (
          <section>
            <h2>Volumen de Ingesta TCP/UDP en Tiempo Real</h2>
            <p className="metric-desc">
              Registros insertados por minuto diferenciados por protocolo. Visualiza el flujo
              de datos del sistema de red en tiempo real.
            </p>
            <IngestionTimeline data={ingestaTimeline} />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Proyecto Data Warehouse — Redes de Computadores — Ing. de Sistemas UNI</p>
      </footer>
    </div>
  )
}
