import math


def haversine(lat1, lng1, lat2, lng2):
    """Calcula la distancia en km entre dos puntos geográficos usando la fórmula de Haversine."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


SQL_DISTANCIA_RETRASOS = """
SELECT
    o.order_id,
    c.customer_id,
    s.seller_id,
    gc.lat AS cust_lat,
    gc.lng AS cust_lng,
    gs.lat AS seller_lat,
    gs.lng AS seller_lng,
    o.delivered_ts,
    o.estimated_ts,
    oi.freight_value
FROM fact_orders o
JOIN dim_customers c ON o.customer_id = c.customer_id
JOIN fact_order_items oi ON o.order_id = oi.order_id
JOIN dim_sellers s ON oi.seller_id = s.seller_id
LEFT JOIN LATERAL (
    SELECT lat, lng FROM dim_geolocation
    WHERE zip_code_prefix = c.zip_code_prefix
    LIMIT 1
) gc ON true
LEFT JOIN LATERAL (
    SELECT lat, lng FROM dim_geolocation
    WHERE zip_code_prefix = s.zip_code_prefix
    LIMIT 1
) gs ON true
WHERE o.order_status = 'delivered'
  AND o.delivered_ts IS NOT NULL
  AND o.estimated_ts IS NOT NULL
LIMIT 500
"""

SQL_RUTAS_FLEVES = """
SELECT
    gs.state AS estado_origen,
    gc.state AS estado_destino,
    COUNT(*) AS total_envios,
    ROUND(AVG(oi.freight_value)::numeric, 2) AS flete_promedio,
    ROUND(SUM(oi.freight_value)::numeric, 2) AS flete_total,
    STRING_AGG(DISTINCT p.category_name, ', ') AS categorias
FROM fact_order_items oi
JOIN fact_orders o ON oi.order_id = o.order_id
JOIN dim_sellers s ON oi.seller_id = s.seller_id
JOIN dim_customers c ON o.customer_id = c.customer_id
JOIN dim_products p ON oi.product_id = p.product_id
LEFT JOIN LATERAL (
    SELECT state FROM dim_geolocation
    WHERE zip_code_prefix = s.zip_code_prefix
    LIMIT 1
) gs ON true
LEFT JOIN LATERAL (
    SELECT state FROM dim_geolocation
    WHERE zip_code_prefix = c.zip_code_prefix
    LIMIT 1
) gc ON true
WHERE gs.state IS NOT NULL
  AND gc.state IS NOT NULL
  AND gs.state != gc.state
GROUP BY gs.state, gc.state
ORDER BY flete_promedio DESC
LIMIT 5
"""

SQL_INGESTION_LOG = """
SELECT id, origen, tabla_origen, contenido, fecha
FROM ingestion_log
ORDER BY fecha DESC
LIMIT 100
"""

SQL_RESUMEN_TCP = """
SELECT tabla_origen, COUNT(*) as total
FROM ingestion_log
WHERE origen = 'TCP'
GROUP BY tabla_origen
ORDER BY total DESC
"""

SQL_RESUMEN_UDP = """
SELECT COUNT(*) as total_pings
FROM ingestion_log
WHERE origen = 'UDP'
"""

# ── Nuevas queries ────────────────────────────────────────────────────────────

SQL_RESUMEN_EXTRA = """
SELECT
    (SELECT COUNT(*) FROM fact_orders) AS total_ordenes,
    (SELECT COUNT(*) FROM dim_products) AS total_productos,
    (SELECT COALESCE(ROUND(AVG(freight_value)::numeric, 2), 0) FROM fact_order_items) AS flete_promedio
"""

SQL_VENTAS_POR_ESTADO = """
SELECT
    c.state AS estado,
    COUNT(DISTINCT o.order_id) AS total_ventas
FROM fact_orders o
JOIN dim_customers c ON o.customer_id = c.customer_id
GROUP BY c.state
ORDER BY total_ventas DESC
LIMIT 15
"""

SQL_CATEGORIAS_RETRASO = """
SELECT
    p.category_name AS categoria,
    ROUND(AVG(
        EXTRACT(EPOCH FROM (o.delivered_ts - o.estimated_ts)) / 86400.0
    )::numeric, 2) AS dias_retraso_promedio,
    COUNT(*) AS total_ordenes
FROM fact_orders o
JOIN fact_order_items oi ON o.order_id = oi.order_id
JOIN dim_products p ON oi.product_id = p.product_id
WHERE o.order_status = 'delivered'
  AND o.delivered_ts IS NOT NULL
  AND o.estimated_ts IS NOT NULL
  AND p.category_name IS NOT NULL
  AND p.category_name != ''
GROUP BY p.category_name
ORDER BY dias_retraso_promedio DESC
LIMIT 10
"""

SQL_INGESTA_TIMELINE = """
SELECT
    DATE_TRUNC('minute', fecha) AS minuto,
    origen,
    COUNT(*) AS total
FROM ingestion_log
GROUP BY DATE_TRUNC('minute', fecha), origen
ORDER BY minuto ASC
LIMIT 200
"""
