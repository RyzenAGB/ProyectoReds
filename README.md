# Data Warehouse Logistico — Brazilian E-Commerce Dataset (Olist)

**Proyecto Final — Programacion de Aplicaciones de Red**  
Ingenieria en Datos e Inteligencia Organizacional

---

## Descripcion del Proyecto

Sistema completo de **Data Warehouse logistica** que simula un pipeline moderno de ETL (Extract, Transform, Load) usando datos reales de comercio electronico de Brasil.

El sistema demuestra el flujo completo de datos:
1. **Ingesta**: Agentes Python envian datos via TCP (transaccional) y UDP (telemetria GPS)
2. **Almacenamiento**: Servidor concurrente recibe y guarda datos en PostgreSQL (Supabase)
3. **Visualizacion**: Dashboard React consume API REST y muestra metricas analiticas en tiempo real

---

## Recursos en Produccion (Acceso Publico)

| Recurso | URL | Descripcion |
|---------|-----|-------------|
| **Dashboard Web** | [https://proyecto-reds.vercel.app/](https://proyecto-reds.vercel.app/) | Interfaz visual con 6 pestanas de analisis |
| **API REST** | [https://datawarehouse-api.onrender.com](https://datawarehouse-api.onrender.com) | 10 endpoints analiticos + documentacion auto-generada |
| **Repositorio** | [https://github.com/RyzenAGB/ProyectoReds](https://github.com/RyzenAGB/ProyectoReds) | Codigo fuente completo |

**Nota**: La API en Render puede tardar ~30 segundos en responder el primer request (plan gratuito con auto-sleep).

---

## Arquitectura del Sistema

```
┌─────────────────┐         TCP (12000)         ┌─────────────────┐
│  Agente TCP     │ ───────────────────────────>│                 │
│  (Transaccional)│  CSV: ordenes, clientes,    │  Servidor       │
│                 │  productos, vendedores      │  Concurrente    │
└─────────────────┘                             │  Python         │
                                                │  threading      │
┌─────────────────┐         UDP (12001)         │                 │
│  Agente UDP     │ ───────────────────────────>│                 │
│  (Telemetria    │  GPS: lat/lng cada 0.5s     │                 │
│   GPS)          │                             │                 │
└─────────────────┘                             └────────┬────────┘
                                                         │
                                                         │ INSERT
                                                         ▼
                                                ┌─────────────────┐
                                                │   PostgreSQL    │
                                                │   (Supabase)    │
                                                │                 │
                                                │  dim_customers  │
                                                │  dim_sellers    │
                                                │  dim_products   │
                                                │  dim_geolocation│
                                                │  fact_orders    │
                                                │  fact_order_items│
                                                │  ingestion_log  │
                                                └────────┬────────┘
                                                         │
                                                         │ SQL Queries
                                                         ▼
                                                ┌─────────────────┐
                                                │   API REST      │
                                                │   FastAPI       │
                                                │   (Render)      │
                                                └────────┬────────┘
                                                         │ HTTP/JSON
                                                         ▼
                                                ┌─────────────────┐
                                                │   Dashboard     │
                                                │   React +       │
                                                │   Chart.js      │
                                                │   (Vercel)      │
                                                └─────────────────┘
```

---

## Stack Tecnologico

| Capa | Tecnologia | Proposito |
|------|-----------|-----------|
| **Ingesta** | Python + sockets (TCP/UDP) | Agentes de envio de datos |
| **Servidor** | Python + threading | Recepcion concurrente multi-cliente |
| **Base de Datos** | PostgreSQL (Supabase) | Almacenamiento relacional en la nube |
| **Backend** | FastAPI | API REST con endpoints analiticos |
| **Frontend** | React 18 + Vite | Interfaz de usuario |
| **Graficos** | Chart.js + react-chartjs-2 | Visualizacion de metricas |
| **Despliegue** | Render (API) + Vercel (Frontend) | Hosting gratuito en la nube |

---

## Estructura del Proyecto

```
Proyecto/
├── agentes/
│   ├── agente_tcp.py          # Agente transaccional (SOCK_STREAM)
│   └── agente_udp.py          # Agente telemetria GPS (SOCK_DGRAM)
├── servidor/
│   ├── servidor.py            # Servidor concurrente TCP+UDP
│   └── database.py            # Conexion a PostgreSQL con context manager
├── api/
│   ├── app.py                 # FastAPI con 10 endpoints
│   └── queries.py             # Queries SQL analiticas
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Componente principal + tabs
│   │   ├── api.js             # Cliente HTTP para la API
│   │   └── components/
│   │       ├── IngestionTable.jsx      # Tabla de datos crudos
│   │       ├── DistanceChart.jsx       # Scatter plot distancia vs retraso
│   │       ├── FreightRoutes.jsx       # Top 5 rutas por flete
│   │       ├── SalesByState.jsx        # Ventas por estado (dona)
│   │       ├── CategoryDelays.jsx      # Retrasos por categoria
│   │       └── IngestionTimeline.jsx   # Timeline TCP/UDP
│   └── vercel.json            # Config despliegue Vercel
├── dataset/
│   └── *.csv                  # Archivos del dataset Olist
├── start.ps1                  # Script para iniciar todo localmente
├── stop.ps1                   # Script para detener procesos
├── render.yaml                # Config despliegue Render
├── requirements.txt           # Dependencias Python
└── .env.example               # Variables de entorno requeridas
```

---

## Funcionalidades del Dashboard

El dashboard web incluye **6 pestanas analiticas**:

### 1. Datos Recibidos
- Tabla con los ultimos 100 registros del `ingestion_log`
- KPIs: Registros TCP, Pings UDP, Tablas procesadas, Total ordenes, Productos unicos, Flete promedio
- Actualizacion automatica cada 5 segundos

### 2. Distancia vs Retrasos
- Scatter plot con distancia Haversine (km) vs dias de desviacion
- **Verde**: Entregas anticipadas (93% de casos)
- **Naranja**: Entregas con retraso (7% de casos)
- Linea de referencia en Y=0 (fecha estimada)

### 3. Top 5 Rutas
- Rutas interestatales con mayor costo promedio de flete
- Incluye categorias de productos por ruta
- Ejemplo: PR -> PE lidera con R$ 63.17 promedio

### 4. Ventas por Estado
- Grafico de dona con distribucion geografica
- Sao Paulo (SP): 44.9% de las ventas
- 14 estados representados con cards de resumen

### 5. Retrasos por Categoria
- Barras verticales con promedio de dias vs fecha estimada
- Valores negativos = entregas anticipadas
- cool_stuff y telefonia: mayores margenes de anticipacion

### 6. Timeline de Ingesta
- Grafico de area con volumen de registros por minuto
- Diferenciacion por protocolo (TCP azul, UDP amarillo)
- 6 minutos de actividad, pico de 285 registros TCP

---

## API Endpoints

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/health` | Health check del servicio |
| GET | `/api/db-check` | Verificacion de conexion a BD |
| GET | `/api/datos` | Ultimos 100 registros del log de ingesta |
| GET | `/api/metricas/resumen` | KPIs agregados (TCP, UDP, ordenes, productos, flete) |
| GET | `/api/metricas/distancias` | Distancia Haversine vs dias de retraso |
| GET | `/api/metricas/rutas` | Top 5 rutas interestatales por flete promedio |
| GET | `/api/metricas/ventas-estado` | Ventas por estado geografico |
| GET | `/api/metricas/categorias-retraso` | Retraso promedio por categoria de producto |
| GET | `/api/metricas/ingesta-timeline` | Timeline de ingesta por minuto y protocolo |

**Documentacion interactiva**: Disponible en `/docs` (Swagger UI) o `/redoc` (ReDoc)

---

## Ejecucion Local

### Requisitos
- Python 3.10+
- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Dataset: [Brazilian E-Commerce (Kaggle)](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)

### Configuracion

1. **Clonar repositorio**:
   ```bash
   git clone https://github.com/RyzenAGB/ProyectoReds.git
   cd ProyectoReds
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales de Supabase
   ```

3. **Instalar dependencias Python**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Colocar archivos CSV** en la carpeta `dataset/`

### Iniciar el sistema

Opcion A: **Script PowerShell** (Windows):
```powershell
.\start.ps1
```

Opcion B: **Manual** (4 terminales):
```bash
# Terminal 1: Servidor concurrente
py -m servidor.servidor

# Terminal 2: Agente TCP
py -m agentes.agente_tcp

# Terminal 3: Agente UDP
py -m agentes.agente_udp

# Terminal 4: API REST
uvicorn api.app:app --reload --port 8000

# Terminal 5: Frontend
cd frontend
npm install
npm run dev
```

### Acceso local
- Dashboard: http://localhost:5173
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Esquema de Base de Datos

```
ingestion_log          → Registro crudo de ingesta (origen, tabla, contenido, fecha)
dim_customers          → Clientes (id, zip_code, city, state)
dim_sellers            → Vendedores (id, zip_code, city, state)
dim_products           → Productos (id, categoria, peso, dimensiones)
dim_geolocation        → Coordenadas por codigo postal (lat, lng, city, state)
fact_orders            → Ordenes (id, cliente, status, fechas)
fact_order_items       → Items de orden (orden, producto, vendedor, precio, flete)
```

---

## Caracteristicas Tecnicas Destacadas

- **Concurrencia real**: Servidor atiende TCP y UDP simultaneamente usando `threading`
- **Protocolos de red**: Implementacion nativa de sockets SOCK_STREAM (TCP) y SOCK_DGRAM (UDP)
- **Calculo geoespacial**: Distancia Haversine entre coordenadas de vendedor y cliente
- **Context manager seguro**: `db_cursor()` garantiza commit/rollback automatico
- **Manejo de errores**: Badge visual en frontend + logs detallados en consola
- **Auto-refresh**: Dashboard actualiza datos cada 5 segundos
- **CORS habilitado**: Permite comunicacion entre Vercel y Render

---

## Hallazgos del Analisis

Basado en el dataset analizado (100 ordenes):

- **93% de entregas anticipadas**: Promedio de -11.54 dias vs fecha estimada
- **Rutas mas caras**: PR -> PE (R$ 63.17), SP -> PE (R$ 37.11)
- **Hub comercial**: Sao Paulo concentra 44.9% de las ventas
- **Categorias eficientes**: cool_stuff y telefonia con mayores margenes de anticipacion

---

## Licencia

Proyecto academico — Programacion de Aplicaciones de Red  
Ingenieria en Datos e Inteligencia Organizacional
