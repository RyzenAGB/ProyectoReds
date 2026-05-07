import os
import csv

CSV_DIR = os.path.join(os.path.dirname(__file__), "dataset")

def load_csv(filename):
    path = os.path.join(CSV_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)
    return header, rows

def save_csv(filename, header, rows):
    path = os.path.join(CSV_DIR, filename)
    with open(path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)

print("Cargando datasets originales...")
orders_h, orders_r = load_csv("olist_orders_dataset.csv")
items_h, items_r = load_csv("olist_order_items_dataset.csv")
cust_h, cust_r = load_csv("olist_customers_dataset.csv")
sell_h, sell_r = load_csv("olist_sellers_dataset.csv")
prod_h, prod_r = load_csv("olist_products_dataset.csv")

# Queremos 100 órdenes que ESTÉN en order_items y estén "delivered"
print("Filtrando 100 ordenes con matching data...")
valid_orders = []
order_ids = set()
customer_ids = set()

items_by_order = {}
for r in items_r:
    items_by_order.setdefault(r[0], []).append(r)

for r in orders_r:
    if r[2] == "delivered" and r[0] in items_by_order:
        valid_orders.append(r)
        order_ids.add(r[0])
        customer_ids.add(r[1])
        if len(valid_orders) == 100:
            break

matched_items = []
product_ids = set()
seller_ids = set()
for r in items_r:
    if r[0] in order_ids:
        matched_items.append(r)
        product_ids.add(r[2])
        seller_ids.add(r[3])

matched_cust = [r for r in cust_r if r[0] in customer_ids]
matched_sell = [r for r in sell_r if r[0] in seller_ids]
matched_prod = [r for r in prod_r if r[0] in product_ids]

print(f"Resultados: Orders: {len(valid_orders)}, Items: {len(matched_items)}, Cust: {len(matched_cust)}, Sell: {len(matched_sell)}, Prod: {len(matched_prod)}")

# Guardar
save_csv("olist_orders_dataset.csv", orders_h, valid_orders)
save_csv("olist_order_items_dataset.csv", items_h, matched_items)
save_csv("olist_customers_dataset.csv", cust_h, matched_cust)
save_csv("olist_sellers_dataset.csv", sell_h, matched_sell)
save_csv("olist_products_dataset.csv", prod_h, matched_prod)

print("Datasets reescritos con datos correlacionados.")
