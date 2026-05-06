import socket
import csv
import time
import os

HOST = "127.0.0.1"
PORT = 12000

CSV_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dataset")

TABLAS = {
    "orders": "olist_orders_dataset.csv",
    "order_items": "olist_order_items_dataset.csv",
    "customers": "olist_customers_dataset.csv",
    "sellers": "olist_sellers_dataset.csv",
    "products": "olist_products_dataset.csv",
}

LIMITE = 100


def enviar_tcp(tabla, nombre_archivo):
    path = os.path.join(CSV_DIR, nombre_archivo)
    if not os.path.exists(path):
        print(f"[!] Archivo no encontrado: {path}")
        return

    print(f"[TCP] Conectando a {HOST}:{PORT} ...")
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((HOST, PORT))
    print(f"[TCP] Conectado. Enviando tabla [{tabla}] del archivo {nombre_archivo}")

    with open(path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        count = 0
        for row in reader:
            contenido = ",".join(row)
            mensaje = f"[{tabla}]{contenido}\n"
            sock.sendall(mensaje.encode("utf-8"))
            count += 1
            if count % 50 == 0:
                print(f"[TCP] [{tabla}] {count} registros enviados...")
            if LIMITE and count >= LIMITE:
                break
            time.sleep(1)

    print(f"[TCP] [{tabla}] Total enviado: {count} registros.")
    sock.close()


def main():
    for tabla, archivo in TABLAS.items():
        enviar_tcp(tabla, archivo)
        print()
    print("[TCP] Todos los archivos enviados.")


if __name__ == "__main__":
    main()
