import socket
import threading
import csv
import os
import json
from servidor.database import insert_data, init_db

HOST = "127.0.0.1"
TCP_PORT = 12000
UDP_PORT = 12001

CSV_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dataset")


def handle_tcp_client(conn, addr):
    print(f"[TCP] Cliente conectado desde {addr}")
    buffer = ""
    try:
        while True:
            data = conn.recv(4096)
            if not data:
                break
            buffer += data.decode("utf-8", errors="ignore")
            while "\n" in buffer:
                line, buffer = buffer.split("\n", 1)
                line = line.strip()
                if not line:
                    continue
                if line.startswith("[") and "]" in line[:30]:
                    end_bracket = line.index("]")
                    tabla = line[1:end_bracket]
                    contenido = line[end_bracket + 1 :]
                    print(f"[TCP] Recibido: [{tabla}] {contenido[:80]}...")
                    insert_data("TCP", tabla, contenido)
    except Exception as e:
        print(f"[TCP] Error con {addr}: {e}")
    finally:
        conn.close()
        print(f"[TCP] Cliente desconectado: {addr}")


def tcp_server():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind((HOST, TCP_PORT))
    sock.listen(5)
    print(f"[TCP] Servidor escuchando en {HOST}:{TCP_PORT}")

    while True:
        conn, addr = sock.accept()
        client_thread = threading.Thread(target=handle_tcp_client, args=(conn, addr), daemon=True)
        client_thread.start()


def udp_server():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((HOST, UDP_PORT))
    print(f"[UDP] Servidor escuchando en {HOST}:{UDP_PORT}")

    while True:
        data, addr = sock.recvfrom(4096)
        message = data.decode("utf-8", errors="ignore").strip()
        if not message:
            continue
        if message.startswith("[") and "]" in message[:30]:
            end_bracket = message.index("]")
            tabla = message[1:end_bracket]
            contenido = message[end_bracket + 1 :]
            print(f"[UDP] Recibido de {addr}: [{tabla}] {contenido[:80]}...")
            insert_data("UDP", tabla, contenido)


def main():
    print("Inicializando base de datos...")
    try:
        init_db()
        print("[DB] Tablas inicializadas correctamente.")
    except Exception as e:
        print(f"[DB] ERROR al inicializar: {e}")
        print("[DB] El servidor continuará sin base de datos.")

    tcp_thread = threading.Thread(target=tcp_server, daemon=True)
    tcp_thread.start()

    udp_thread = threading.Thread(target=udp_server, daemon=True)
    udp_thread.start()

    print("Servidor concurrente activo. Ctrl+C para detener.")
    try:
        while True:
            threading.Event().wait(1)
    except KeyboardInterrupt:
        print("\nServidor detenido.")


if __name__ == "__main__":
    main()
