# Data Warehouse Logístico — Brazilian E-Commerce Dataset

Sistema completo de ETL logístico que simula un Data Warehouse moderno usando el dataset público de Olist. Ingestiona datos vía TCP/UDP, los almacena en PostgreSQL (Supabase) y los expone mediante API REST + dashboard React.

## Propuesta Técnica

**Enfoque**: Logística, Envíos y Análisis Geoespacial
**Nivel**: Avanzado (Esquema Copo de Nieve con análisis espacial)

### Tablas Seleccionadas

| Tipo | Tabla | Propósito |
|------|-------|-----------|
| Hechos | `olist_orders_dataset` | Estados de órdenes y fechas críticas |
| Hechos | `olist_order_items_dataset` | Costo del producto y valor del flete |
| Dimensión | `olist_customers_dataset` | Identificador y código postal del cliente |
| Dimensión | `olist_sellers_dataset` | Identificador y código postal del vendedor |
| Dimensión | `olist_geolocation_dataset` | Latitud, longitud, ciudad y estado por código postal |
| Dimensión | `olist_products_dataset` | Categoría, peso y dimensiones del producto |

### Justificación de Negocio

- **Optimización de Rutas y Fletes**: Identificar combinaciones origen-destino con mayores costos de envío
- **Detección de Cuellos de Botella Geoespaciales**: Mapear estados con mayores retrasos
- **Toma de Decisiones de Infraestructura**: Justificar matemáticamente ubicación de nuevos centros de distribución

### Métricas Estratégicas

1. **Eficiencia Logística**: Correlación entre distancia geográfica real (Haversine) y tasa de retrasos
2. **Costos de Transporte**: Top 5 rutas interestatales por costo promedio de flete + categorías de producto

## Arquitectura de Ingesta

### Agente TCP (Puerto 12000)
- **Protocolo**: SOCK_STREAM — confiable, orientado a conexión
- **Tablas**: orders, order_items, customers, sellers, products
- **Justificación**: Datos transaccionales críticos que no pueden perderse (órdenes, pagos, facturación)
- **Comportamiento**: Lee CSV línea a línea, envía cada 0.2 segundos

### Agente UDP (Puerto 12001)
- **Protocolo**: SOCK_DGRAM — rápido, sin garantía de entrega
- **Tabla**: geolocation (con variación aleatoria ±0.001°)
- **Justificación**: Simula GPS de flota en tiempo real; velocidad sobre confiabilidad
- **Comportamiento**: Envía coordenadas cada 0.5 segundos

## Requisitos

- Python 3.10+
- Node.js 18+
- Cuenta gratuita en [Supabase](https://supabase.com)
- Dataset: [Brazilian E-Commerce (Kaggle)](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)

## Configuración

1. Clona el repositorio
2. Copia `.env.example` a `.env` y completa con tus credenciales de Supabase
3. Instala dependencias Python: `pip install -r requirements.txt`
4. Coloca los archivos CSV en la carpeta `dataset/`

## Ejecución

```bash
# Terminal 1: Servidor concurrente
py -m servidor.servidor

# Terminal 2: Agente TCP (datos transaccionales)
py -m agentes.agente_tcp

# Terminal 3: Agente UDP (telemetría GPS)
py -m agentes.agente_udp

# Terminal 4: API REST
uvicorn api.app:app --reload --port 8000

# Terminal 5: Frontend
cd frontend
npm install
npm run dev
```

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/datos` | Últimos 100 registros del ingestion_log |
| GET | `/api/metricas/distancias` | Distancia Haversine vs días de retraso |
| GET | `/api/metricas/rutas` | Top 5 rutas interestatales por flete promedio |
| GET | `/api/metricas/resumen` | Conteo de ingesta por tabla TCP y total pings UDP |
| GET | `/api/health` | Health check |

## Esquema de Base de Datos

```
ingestion_log          → Registro crudo de ingesta (origen, tabla, contenido, fecha)
dim_customers          → Clientes (id, zip_code, city, state)
dim_sellers            → Vendedores (id, zip_code, city, state)
dim_products           → Productos (id, categoría, peso, dimensiones)
dim_geolocation        → Coordenadas por código postal (lat, lng, city, state)
fact_orders            → Órdenes (id, cliente, status, fechas)
fact_order_items       → Ítems de orden (orden, producto, vendedor, precio, flete)
```

## Despliegue

### Arquitectura de Producción

```
┌─────────────┐      HTTP       ┌─────────────┐      SQL       ┌─────────────┐
│   Vercel    │  ◄────────────► │   Render    │  ◄────────────►│  Supabase   │
│  (Frontend) │                 │   (API)     │                │     (DB)    │
│  React +    │                 │  FastAPI    │                │ PostgreSQL  │
│  Chart.js   │                 │             │                │             │
└─────────────┘                 └─────────────┘                └─────────────┘
```

### Paso 1: Subir a GitHub
```bash
git init
git add .
git commit -m "fase 3: sistema completo listo para despliegue"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/datawarehouse-olist.git
git push -u origin main
```

### Paso 2: API en Render
1. Ve a [render.com](https://render.com) → "New Web Service"
2. Conecta tu repo de GitHub
3. Configura:
   - **Name**: `datawarehouse-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api.app:app --host 0.0.0.0 --port 10000`
4. Añade variable `DATABASE_URL` en Environment Variables
5. Click **Deploy**

### Paso 3: Frontend en Vercel
1. Ve a [vercel.com](https://vercel.com) → "Add New Project"
2. Importa tu repo
3. Configura:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Añade variable `VITE_API_URL=https://tu-api.onrender.com/api`
5. Click **Deploy**

### Notas
- **Servidor TCP/UDP**: Solo para desarrollo local. En producción, la API lee directamente de Supabase.
- **CORS**: El `app.py` tiene `allow_origins=["*"]`. Para producción restrictiva, cambia a tu URL de Vercel.
- **Datos**: Los datos ya están en Supabase. El frontend en Vercel consume la API en Render, que a su vez lee de Supabase.

## Autores

Proyecto académico — Redes de Computadores — Ingeniería de Sistemas UNI
