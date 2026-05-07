import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from servidor.database import db_cursor
from api.queries import (
    SQL_DISTANCIA_RETRASOS,
    SQL_RUTAS_FLEVES,
    SQL_INGESTION_LOG,
    SQL_RESUMEN_TCP,
    SQL_RESUMEN_UDP,
    SQL_RESUMEN_EXTRA,
    SQL_VENTAS_POR_ESTADO,
    SQL_CATEGORIAS_RETRASO,
    SQL_INGESTA_TIMELINE,
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
    with db_cursor() as cur:
        cur.execute(SQL_INGESTION_LOG)
        rows = cur.fetchall()

    resultados = []
    for r in rows:
        resultados.append({
            "id": r[0],
            "origen": r[1],
            "tabla": r[2],
            "contenido": r[3],
            "fecha": r[4].isoformat() if r[4] else None,
        })
    return {"data": resultados, "total": len(resultados)}


@app.get("/api/metricas/distancias")
def metrica_distancias():
    with db_cursor() as cur:
        cur.execute(SQL_DISTANCIA_RETRASOS)
        rows = cur.fetchall()

    puntos = []
    for r in rows:
        cust_lat, cust_lng = r[3], r[4]
        seller_lat, seller_lng = r[5], r[6]
        if None in (cust_lat, cust_lng, seller_lat, seller_lng):
            continue

        distancia = round(haversine(float(cust_lat), float(cust_lng), float(seller_lat), float(seller_lng)), 2)
        delivered, estimated = r[7], r[8]
        dias_retraso = (delivered - estimated).days if delivered and estimated else 0

        puntos.append({
            "order_id": r[0],
            "distancia_km": distancia,
            "dias_retraso": max(0, dias_retraso),
            "freight_value": float(r[9]) if r[9] else 0,
        })
    return {"data": puntos, "total": len(puntos)}


@app.get("/api/metricas/rutas")
def metrica_rutas():
    with db_cursor() as cur:
        cur.execute(SQL_RUTAS_FLEVES)
        rows = cur.fetchall()

    rutas = []
    for r in rows:
        rutas.append({
            "estado_origen": r[0],
            "estado_destino": r[1],
            "total_envios": r[2],
            "flete_promedio": float(r[3]) if r[3] else 0,
            "flete_total": float(r[4]) if r[4] else 0,
            "categorias": r[5],
        })
    return {"data": rutas, "total": len(rutas)}


@app.get("/api/metricas/resumen")
def metrica_resumen():
    with db_cursor() as cur:
        cur.execute(SQL_RESUMEN_TCP)
        tcp_rows = cur.fetchall()
        cur.execute(SQL_RESUMEN_UDP)
        udp_row = cur.fetchone()
        cur.execute(SQL_RESUMEN_EXTRA)
        extra = cur.fetchone()

    return {
        "tcp_por_tabla": [{"tabla": r[0], "total": r[1]} for r in tcp_rows],
        "udp_total_pings": udp_row[0] if udp_row else 0,
        "total_ordenes": extra[0] if extra else 0,
        "total_productos": extra[1] if extra else 0,
        "flete_promedio": float(extra[2]) if extra and extra[2] else 0,
    }


@app.get("/api/metricas/ventas-estado")
def metrica_ventas_estado():
    with db_cursor() as cur:
        cur.execute(SQL_VENTAS_POR_ESTADO)
        rows = cur.fetchall()

    return {
        "data": [{"estado": r[0], "total_ventas": r[1]} for r in rows],
        "total": len(rows),
    }


@app.get("/api/metricas/categorias-retraso")
def metrica_categorias_retraso():
    with db_cursor() as cur:
        cur.execute(SQL_CATEGORIAS_RETRASO)
        rows = cur.fetchall()

    return {
        "data": [
            {
                "categoria": r[0],
                "dias_retraso_promedio": float(r[1]) if r[1] else 0,
                "total_ordenes": r[2],
            }
            for r in rows
        ],
        "total": len(rows),
    }


@app.get("/api/metricas/ingesta-timeline")
def metrica_ingesta_timeline():
    with db_cursor() as cur:
        cur.execute(SQL_INGESTA_TIMELINE)
        rows = cur.fetchall()

    # Build structure: [{minuto, tcp, udp}]
    timeline = {}
    for r in rows:
        minuto = r[0].isoformat() if r[0] else None
        origen = r[1]
        total = r[2]
        if minuto not in timeline:
            timeline[minuto] = {"minuto": minuto, "TCP": 0, "UDP": 0}
        timeline[minuto][origen] = total

    return {
        "data": list(timeline.values()),
        "total": len(timeline),
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "datawarehouse-api"}
