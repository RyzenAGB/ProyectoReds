import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from servidor.database import db_cursor

tables = [
    'fact_order_items',
    'fact_orders',
    'dim_geolocation',
    'dim_products',
    'dim_sellers',
    'dim_customers',
    'ingestion_log'
]

try:
    with db_cursor() as cur:
        for t in tables:
            cur.execute(f"TRUNCATE TABLE {t} CASCADE;")
    print("Datos borrados exitosamente.")
except Exception as e:
    print(f"Error: {e}")
