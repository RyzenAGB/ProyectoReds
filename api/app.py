import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from servidor.database import get_connection
from api.queries import (
    SQL_DISTANCIA_RETRASOS,
    SQL_RUTAS_FLEVES,
    SQL_INGESTION_LOG,
    SQL_RESUMEN_TCP,
    SQL_RESUMEN_UDP,
    haversine,
)

app = FastAPI(title="Data Warehouse Logístico - Olist", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/datos")
def obtener_datos():
    """Devuelve los últimos 100 registros del ingestion_log."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(SQL_INGESTION_LOG)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    resultados = []
    for r in rows:
        resultados.append(
            {
                "id": r[0],
                "origen": r[1],
                "tabla": r[2],
                "contenido": r[3],
                "fecha": r[4].isoformat() if r[4] else None,
            }
        )
    return {"data": resultados, "total": len(resultados)}


@app.get("/api/metricas/distancias")
def metrica_distancias():
    """Calcula correlación distancia vs retraso en entregas."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(SQL_DISTANCIA_RETRASOS)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    puntos = []
    for r in rows:
        cust_lat = r[3]
        cust_lng = r[4]
        seller_lat = r[5]
        seller_lng = r[6]

        if None in (cust_lat, cust_lng, seller_lat, seller_lng):
            continue

        distancia = round(haversine(float(cust_lat), float(cust_lng), float(seller_lat), float(seller_lng)), 2)
        delivered = r[7]
        estimated = r[8]

        if delivered and estimated:
            dias_retraso = (delivered - estimated).days
        else:
            dias_retraso = 0

        puntos.append(
            {
                "order_id": r[0],
                "distancia_km": distancia,
                "dias_retraso": max(0, dias_retraso),
                "freight_value": float(r[9]) if r[9] else 0,
            }
        )

    return {"data": puntos, "total": len(puntos)}


@app.get("/api/metricas/rutas")
def metrica_rutas():
    """Top 5 rutas interestatales por costo promedio de flete."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(SQL_RUTAS_FLEVES)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    rutas = []
    for r in rows:
        rutas.append(
            {
                "estado_origen": r[0],
                "estado_destino": r[1],
                "total_envios": r[2],
                "flete_promedio": float(r[3]) if r[3] else 0,
                "flete_total": float(r[4]) if r[4] else 0,
                "categorias": r[5],
            }
        )

    return {"data": rutas, "total": len(rutas)}


@app.get("/api/metricas/resumen")
def metrica_resumen():
    """Resumen de ingesta: conteo por tabla (TCP) y total pings (UDP)."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(SQL_RESUMEN_TCP)
    tcp_rows = cur.fetchall()
    cur.execute(SQL_RESUMEN_UDP)
    udp_row = cur.fetchone()
    cur.close()
    conn.close()

    tcp_resumen = [{"tabla": r[0], "total": r[1]} for r in tcp_rows]
    udp_total = udp_row[0] if udp_row else 0

    return {
        "tcp_por_tabla": tcp_resumen,
        "udp_total_pings": udp_total,
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "datawarehouse-api"}
