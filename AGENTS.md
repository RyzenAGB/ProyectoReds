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
│   ├── __init__.py
│   ├── agente_tcp.py                 # Cliente TCP - envía datos transaccionales
│   └── agente_udp.py                 # Cliente UDP - simula telemetría GPS
├── servidor/
│   ├── __init__.py
│   ├── servidor.py                   # Servidor concurrente TCP:12000 + UDP:12001
│   └── database.py                   # Conexión directa Supabase + inserción
├── api/
│   ├── __init__.py
│   ├── app.py                        # FastAPI - endpoints REST
│   └── queries.py                    # Consultas SQL analíticas
├── frontend/                         # React App (Vite)
├── start.ps1                         # Script: abre todas las ventanas
├── stop.ps1                          # Script: cierra todas las ventanas
├── .env.example                      # Variables de entorno
├── .gitignore
├── requirements.txt
├── AGENTS.md
└── README.md
```

## Variables de Entorno (.env)
Copia `.env.example` a `.env` y completa:

```bash
# Opción 1 (recomendada): Connection string completo
DATABASE_URL=postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres

# Opción 2: Variables separadas
SUPABASE_URL=https://REF.supabase.co
SUPABASE_KEY=eyJhbG...
SUPABASE_PASSWORD=PASSWORD
```

## Comandos Rápidos

### Todo en uno (5 ventanas automáticas)
```bash
powershell -ExecutionPolicy Bypass -File start.ps1
```

### Detener todo
```bash
powershell -ExecutionPolicy Bypass -File stop.ps1
```

### Manual (5 terminales separadas)

**Terminal 1 - Servidor:**
```bash
py -m servidor.servidor
```

**Terminal 2 - Agente TCP:**
```bash
py -m agentes.agente_tcp
```

**Terminal 3 - Agente UDP:**
```bash
py -m agentes.agente_udp
```

**Terminal 4 - API:**
```bash
uvicorn api.app:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 5 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Instalar dependencias
```bash
pip install -r requirements.txt
```

## Notas Técnicas

- **Conexión a DB**: `database.py` usa conexiones directas (`psycopg2.connect`) cerradas después de cada operación. El pool fue eliminado por problemas de agotamiento en Windows.
- **Socket UDP**: `servidor.py` incluye `SO_REUSEADDR` en el socket UDP para evitar `WinError 10048` al reiniciar.
- **Delay TCP**: El agente TCP usa pausa de **0.2s** por registro (antes 1s). Las 5 tablas se ingieren en ~1 min 40s.
- **Módulos Python**: Las carpetas `servidor/`, `agentes/` y `api/` incluyen `__init__.py`. Ejecutar con `py -m <paquete>.<modulo>` (ej: `py -m servidor.servidor`).
- **Frontend proxy**: El `vite.config.js` redirige `/api` a `http://127.0.0.1:8000`.
- **Bug order_items corregido**: El CSV tiene 7 columnas (incluye `shipping_limit_date`); el INSERT usa índices 5 y 6 para `price` y `freight_value`.

## Convenciones
- Python: snake_case, UTF-8 encoding, type hints donde aplique
- React: JSX funcional con hooks, fetch nativo
- Mensajes de red: prefijo `[tabla]` seguido del contenido CSV
- Commit messages: en español, formato: `fase X: descripción breve`

## Flujo de Datos
1. Agente TCP lee CSVs línea a línea → envía con pausa 0.2s → servidor TCP:12000
2. Agente UDP lee geolocation + variación aleatoria → envía cada 0.5s → servidor UDP:12001
3. Servidor recibe, parsea, inserta en `ingestion_log` + tablas dimensionales en Supabase
4. FastAPI consulta Supabase → expone JSON en `/api/datos` y `/api/metricas/*`
5. Frontend React consume API → muestra dashboard con tablas y gráficos Chart.js
