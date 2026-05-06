export default function IngestionTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ fontSize: '2rem' }}>📭</p>
        <p>No hay datos recibidos aún. Ejecuta los agentes para empezar a ver datos.</p>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Origen</th>
            <th>Tabla</th>
            <th>Contenido</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>
                <span className={row.origen === 'TCP' ? 'badge-tcp' : 'badge-udp'}>
                  {row.origen}
                </span>
              </td>
              <td>{row.tabla}</td>
              <td title={JSON.stringify(row.contenido)}>
                {JSON.stringify(row.contenido).substring(0, 50)}
                {JSON.stringify(row.contenido).length > 50 ? '...' : ''}
              </td>
              <td>{new Date(row.fecha).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
