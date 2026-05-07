import os
import json
import re
import psycopg2
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_PASSWORD = os.getenv("SUPABASE_PASSWORD")


def _build_db_params():
    if DATABASE_URL:
        return {"dsn": DATABASE_URL}
    if not SUPABASE_URL or not SUPABASE_PASSWORD:
        raise RuntimeError("Configura DATABASE_URL o SUPABASE_URL + SUPABASE_PASSWORD en .env")
    ref = re.sub(r"^https://(.*)\.supabase\.co$", r"\1", SUPABASE_URL)
    return {
        "host": f"db.{ref}.supabase.co",
        "port": 5432,
        "dbname": "postgres",
        "user": "postgres",
        "password": SUPABASE_PASSWORD,
        "sslmode": "require",
    }


DB_PARAMS = _build_db_params()


def get_connection():
    return psycopg2.connect(**DB_PARAMS)


def put_connection(conn):
    try:
        conn.close()
    except Exception:
        pass


@contextmanager
def db_cursor():
    conn = get_connection()
    cur = conn.cursor()
    try:
        yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def init_db():
    with db_cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS ingestion_log (
                id SERIAL PRIMARY KEY,
                origen VARCHAR(3) NOT NULL,
                tabla_origen VARCHAR(50) NOT NULL,
                contenido JSONB NOT NULL,
                fecha TIMESTAMP DEFAULT NOW()
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS dim_customers (
                customer_id VARCHAR(50) PRIMARY KEY,
                customer_unique_id VARCHAR(50),
                zip_code_prefix VARCHAR(10),
                city VARCHAR(100),
                state VARCHAR(5)
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS dim_sellers (
                seller_id VARCHAR(50) PRIMARY KEY,
                zip_code_prefix VARCHAR(10),
                city VARCHAR(100),
                state VARCHAR(5)
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS dim_products (
                product_id VARCHAR(50) PRIMARY KEY,
                category_name VARCHAR(100),
                weight_g INTEGER,
                length_cm INTEGER,
                height_cm INTEGER,
                width_cm INTEGER
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS dim_geolocation (
                id SERIAL PRIMARY KEY,
                zip_code_prefix VARCHAR(10),
                lat DOUBLE PRECISION,
                lng DOUBLE PRECISION,
                city VARCHAR(100),
                state VARCHAR(5)
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS fact_orders (
                order_id VARCHAR(50) PRIMARY KEY,
                customer_id VARCHAR(50),
                order_status VARCHAR(20),
                purchase_ts TIMESTAMP,
                approved_ts TIMESTAMP,
                carrier_ts TIMESTAMP,
                delivered_ts TIMESTAMP,
                estimated_ts TIMESTAMP
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS fact_order_items (
                id SERIAL PRIMARY KEY,
                order_id VARCHAR(50),
                item_id INTEGER,
                product_id VARCHAR(50),
                seller_id VARCHAR(50),
                price DECIMAL(10,2),
                freight_value DECIMAL(10,2)
            );
        """)


def insert_data(origen, tabla, raw_line):
    parts = raw_line.strip().split(",")
    if not parts or parts == [""]:
        return

    contenido_json = json.dumps(parts)

    with db_cursor() as cur:
        cur.execute(
            "INSERT INTO ingestion_log (origen, tabla_origen, contenido) VALUES (%s, %s, %s::jsonb)",
            (origen, tabla, contenido_json),
        )

        if tabla == "customers" and len(parts) >= 5:
            cur.execute(
                """INSERT INTO dim_customers (customer_id, customer_unique_id, zip_code_prefix, city, state)
                   VALUES (%s, %s, %s, %s, %s) ON CONFLICT (customer_id) DO NOTHING""",
                (parts[0], parts[1], parts[2], parts[3], parts[4]),
            )
        elif tabla == "sellers" and len(parts) >= 4:
            cur.execute(
                """INSERT INTO dim_sellers (seller_id, zip_code_prefix, city, state)
                   VALUES (%s, %s, %s, %s) ON CONFLICT (seller_id) DO NOTHING""",
                (parts[0], parts[1], parts[2], parts[3]),
            )
        elif tabla == "products" and len(parts) >= 7:
            cur.execute(
                """INSERT INTO dim_products (product_id, category_name, weight_g, length_cm, height_cm, width_cm)
                   VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT (product_id) DO NOTHING""",
                (parts[0], parts[1],
                 int(float(parts[2])) if parts[2] else 0,
                 int(float(parts[3])) if parts[3] else 0,
                 int(float(parts[4])) if parts[4] else 0,
                 int(float(parts[5])) if parts[5] else 0),
            )
        elif tabla == "geolocation" and len(parts) >= 5:
            cur.execute(
                """INSERT INTO dim_geolocation (zip_code_prefix, lat, lng, city, state)
                   VALUES (%s, %s, %s, %s, %s)""",
                (parts[0], float(parts[1]), float(parts[2]), parts[3], parts[4]),
            )
        elif tabla == "orders" and len(parts) >= 8:
            cur.execute(
                """INSERT INTO fact_orders (order_id, customer_id, order_status, purchase_ts,
                   approved_ts, carrier_ts, delivered_ts, estimated_ts)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (order_id) DO NOTHING""",
                (parts[0], parts[1], parts[2],
                 parts[3] if parts[3] else None,
                 parts[4] if parts[4] else None,
                 parts[5] if parts[5] else None,
                 parts[6] if parts[6] else None,
                 parts[7] if parts[7] else None),
            )
        elif tabla == "order_items" and len(parts) >= 7:
            cur.execute(
                """INSERT INTO fact_order_items (order_id, item_id, product_id, seller_id, price, freight_value)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (parts[0], int(parts[1]), parts[2], parts[3],
                 float(parts[5]) if parts[5] else 0,
                 float(parts[6]) if parts[6] else 0),
            )
