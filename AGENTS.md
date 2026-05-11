# AGENTS.md - Proyecto Data Warehouse Logístico

## Resumen del Proyecto
Sistema completo de ETL logístico que simula un Data Warehouse moderno usando el **Brazilian E-Commerce Dataset** de Olist. Ingestiona datos vía TCP/UDP, los almacena en PostgreSQL (Supabase) y los expone mediante API REST + dashboard React.

## Stack Tecnológico
- **Backend**: Python 3.10+ (sockets, threading, FastAPI)
- **Base de Datos**: PostgreSQL en Supabase (nube)
- **Frontend**: React 18 + Vite + Chart.js 4
- **Despliegue**: GitHub + Vercel (frontend), Render (API), Supabase (DB)

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
│   ├── .env.production               # URL de la API para producción
│   └── vercel.json                   # Configuración de Vercel
├── vercel.json                       # Configuración raíz de Vercel
├── render.yaml                       # Configuración de Render
├── start.ps1                         # Script: abre servidor + agentes
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
# Session Pooler de Supabase (recomendado para Render/Vercel - IPv4)
# Obtener desde: Supabase Dashboard → Settings → Database → Session pooler
DATABASE_URL=postgresql://postgres.[REF]:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

## URLs de Producción

| Servicio | URL |
|---|---|
| **API** | https://datawarehouse-api.onrender.com |
| **Frontend** | https://proyecto-reds.vercel.app |
| **Supabase** | https://supabase.com/dashboard/project/lgpswoemtsatisdkjhaq |

## Comandos Rápidos

### Todo en uno (3 ventanas: servidor + agentes)
```bash
powershell -ExecutionPolicy Bypass -File start.ps1
```

### Detener todo
```bash
powershell -ExecutionPolicy Bypass -File stop.ps1
```

### Manual (3 terminales separadas)

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

**API y Frontend** ya están desplegados en Render y Vercel respectivamente. No necesitan correr localmente.

### Instalar dependencias
```bash
pip install -r requirements.txt
```

## Endpoints API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Mensaje de bienvenida |
| GET | `/api/health` | Health check |
| GET | `/api/db-check` | Verifica conexión a DB |
| GET | `/api/datos` | Últimos 100 registros del ingestion_log |
| GET | `/api/metricas/resumen` | Conteo TCP/UDP + totales |
| GET | `/api/metricas/distancias` | Distancia Haversine vs días de retraso |
| GET | `/api/metricas/rutas` | Top 5 rutas interestatales por flete |
| GET | `/api/metricas/ventas-estado` | Ventas por estado geográfico |
| GET | `/api/metricas/categorias-retraso` | Retrasos por categoría de producto |
| GET | `/api/metricas/ingesta-timeline` | Timeline de ingesta por minuto |

## Despliegue en Producción

### Paso 1: Subir a GitHub
```bash
git init
git add .
git commit -m "fase 3: sistema completo listo para despliegue"
git branch -M main
git remote add origin https://github.com/RyzenAGB/ProyectoReds.git
git push -u origin main
```

### Paso 2: Desplegar API en Render
1. Ve a [render.com](https://render.com) → "New Web Service"
2. Conecta tu repo de GitHub
3. Configura:
   - **Name**: `datawarehouse-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api.app:app --host 0.0.0.0 --port 10000`
4. En **Environment Variables**, añade `DATABASE_URL` con el Session Pooler de Supabase
5. Click **Deploy**

### Paso 3: Desplegar Frontend en Vercel
1. Ve a [vercel.com](https://vercel.com) → "Add New Project"
2. Importa tu repo de GitHub
3. Configura:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. En **Environment Variables**, añade:
   ```
   VITE_API_URL=https://datawarehouse-api.onrender.com/api
   ```
5. Click **Deploy**

### Paso 4: Ingestar datos
Ejecuta `start.ps1` localmente. Los agentes envían datos al servidor local, que los guarda en Supabase. El frontend en Vercel los lee desde la API en Render.

## Notas Técnicas

- **Conexión a DB**: `database.py` usa conexiones directas (`psycopg2.connect`) cerradas después de cada operación. El pool fue eliminado por problemas de agotamiento en Windows.
- **Socket UDP**: `servidor.py` incluye `SO_REUSEADDR` en el socket UDP para evitar `WinError 10048` al reiniciar.
- **Delay TCP**: El agente TCP usa pausa de **0.2s** por registro. Las 5 tablas se ingieren en ~1 min 40s.
- **Módulos Python**: Las carpetas `servidor/`, `agentes/` y `api/` incluyen `__init__.py`. Ejecutar con `py -m <paquete>.<modulo>`.
- **Frontend proxy**: El `vite.config.js` redirige `/api` a `http://127.0.0.1:8000` en desarrollo. En producción usa `VITE_API_URL`.
- **Bug order_items corregido**: El CSV tiene 7 columnas (incluye `shipping_limit_date`); el INSERT usa índices 5 y 6 para `price` y `freight_value`.
- **Connection Pooler**: Supabase requiere Session Pooler (IPv4) para Render/Vercel. La conexión directa usa IPv6 y no funciona en redes IPv4-only.

## Convenciones
- Python: snake_case, UTF-8 encoding, type hints donde aplique
- React: JSX funcional con hooks, fetch nativo
- Mensajes de red: prefijo `[tabla]` seguido del contenido CSV
- Commit messages: en español, formato: `fase X: descripción breve`

## Flujo de Datos
1. Agente TCP lee CSVs línea a línea → envía con pausa 0.2s → servidor TCP:12000
2. Agente UDP lee geolocation + variación aleatoria → envía cada 0.5s → servidor UDP:12001
3. Servidor recibe, parsea, inserta en `ingestion_log` + tablas dimensionales en Supabase
4. FastAPI (Render) consulta Supabase → expone JSON en `/api/*`
5. Frontend (Vercel) consume API → muestra dashboard con tablas y gráficos Chart.js
