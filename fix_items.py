import socket
import csv
import os
import time

HOST = "127.0.0.1"
PORT = 12000
CSV_DIR = os.path.join(os.path.dirname(__file__), "dataset")

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((HOST, PORT))

path = os.path.join(CSV_DIR, "olist_order_items_dataset.csv")
with open(path, "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    next(reader)
    count = 0
    for row in reader:
        msg = f"[order_items]{','.join(row)}\n"
        sock.sendall(msg.encode("utf-8"))
        count += 1
        if count >= 200:
            break
        time.sleep(0.2)

print(f"[TCP] order_items: {count} registros enviados")
sock.close()
