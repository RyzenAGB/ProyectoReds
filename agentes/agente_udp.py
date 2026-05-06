import socket
import csv
import random
import time
import os

HOST = "127.0.0.1"
PORT = 12001

CSV_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dataset")

LIMITE = 200
INTERVALO = 0.5
VARIACION = 0.001


def enviar_udp():
    path = os.path.join(CSV_DIR, "olist_geolocation_dataset.csv")
    if not os.path.exists(path):
        print(f"[!] Archivo no encontrado: {path}")
        return

    print(f"[UDP] Preparando envío de telemetría GPS cada {INTERVALO}s hacia {HOST}:{PORT}")

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    with open(path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)

    count = 0
    idx = 0

    while LIMITE == 0 or count < LIMITE:
        row = rows[idx % len(rows)]

        lat = float(row[1]) + random.uniform(-VARIACION, VARIACION)
        lng = float(row[2]) + random.uniform(-VARIACION, VARIACION)

        mensaje = f"[geolocation]{row[0]},{lat:.7f},{lng:.7f},{row[3]},{row[4]}"
        sock.sendto(mensaje.encode("utf-8"), (HOST, PORT))
        count += 1
        idx += 1

        if count % 40 == 0:
            print(f"[UDP] {count} pings GPS enviados...")

        time.sleep(INTERVALO)

    print(f"[UDP] Total pings GPS enviados: {count}. Simulación finalizada.")
    sock.close()


if __name__ == "__main__":
    enviar_udp()
