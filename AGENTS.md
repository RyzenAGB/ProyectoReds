# AGENTS.md - Proyecto Data Warehouse Logístico

## Resumen del Proyecto
Sistema completo de ETL logístico que simula un Data Warehouse moderno usando el **Brazilian E-Commerce Dataset** de Olist. Ingestiona datos vía TCP/UDP, los almacena en PostgreSQL (Supabase) y los expone mediante API REST + dashboard React.

## Stack Tecnológico
- **Backend**: Python 3.10+ (sockets, threading, FastAPI)
- **Base de Datos**: PostgreSQL en Supabase (nube)
- **Frontend**: React 18 + Vite + Chart.js 4
- **Despliegue**: GitHub + Vercel (frontend), Supabase (DB)

## Estructura del Proyecto
```
Proyecto/
├── dataset/                          # CSVs del Brazilian E-Commerce Dataset
├── agentes/
│   ├── agente_tcp.py                 # Cliente TCP - envía datos transaccionales
│   └── agente_udp.py                 # Cliente UDP - simula telemetría GPS
├── servidor/
│   ├── servidor.py                   # Servidor concurrente TCP:12000 + UDP:12001
│   └── database.py                   # Conexión Supabase + inserción
├── api/
│   ├── app.py                        # FastAPI - endpoints REST
│   └── queries.py                    # Consultas SQL analíticas
├── frontend/                         # React App (Vite)
├── requirements.txt
├── AGENTS.md
└── README.md
```

## Variables de Entorno (.env)
```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=eyJhbG...
SUPABASE_PASSWORD=<db-password>
```

## Comandos

### Arrancar servidor (terminal 1)
```bash
python servidor/servidor.py
```

### Ejecutar agentes (terminales 2 y 3)
```bash
python agentes/agente_tcp.py
python agentes/agente_udp.py
```

### Arrancar API (terminal 4)
```bash
uvicorn api.app:app --reload --port 8000
```

### Arrancar frontend (terminal 5)
```bash
cd frontend
npm install
npm run dev
```

### Instalar dependencias Python
```bash
pip install -r requirements.txt
```

## Convenciones
- Python: snake_case, UTF-8 encoding, type hints donde aplique
- React: JSX funcional con hooks, fetch nativo
- Mensajes de red: prefijo `[tabla]` seguido del contenido CSV
- Commit messages: en español, formato: `fase X: descripción breve`

## Flujo de Datos
1. Agente TCP lee CSVs línea a línea → envía con pausa 1s → servidor TCP:12000
2. Agente UDP lee geolocation + variación aleatoria → envía cada 0.5s → servidor UDP:12001
3. Servidor recibe, parsea, inserta en `ingestion_log` + tablas dimensionales en Supabase
4. FastAPI consulta Supabase → expone JSON en `/api/datos` y `/api/metricas/*`
5. Frontend React consume API → muestra dashboard con tablas y gráficos Chart.js
