const API_BASE = '/api'

export async function fetchDatos() {
  const res = await fetch(`${API_BASE}/datos`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchDistancias() {
  const res = await fetch(`${API_BASE}/metricas/distancias`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchRutas() {
  const res = await fetch(`${API_BASE}/metricas/rutas`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchResumen() {
  const res = await fetch(`${API_BASE}/metricas/resumen`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchVentasEstado() {
  const res = await fetch(`${API_BASE}/metricas/ventas-estado`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchCategoriasRetraso() {
  const res = await fetch(`${API_BASE}/metricas/categorias-retraso`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchIngestaTimeline() {
  const res = await fetch(`${API_BASE}/metricas/ingesta-timeline`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
