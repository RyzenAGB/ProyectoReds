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

print("Cargando datasets originales para geolocation...")
geo_h, geo_r = load_csv("olist_geolocation_dataset.csv")
cust_h, cust_r = load_csv("olist_customers_dataset.csv")
sell_h, sell_r = load_csv("olist_sellers_dataset.csv")

zip_codes = set()
for r in cust_r:
    zip_codes.add(r[2])  # zip_code_prefix is at index 2
for r in sell_r:
    zip_codes.add(r[1])  # zip_code_prefix is at index 1

matched_geo = []
found_zips = set()

for r in geo_r:
    if r[0] in zip_codes and r[0] not in found_zips:
        matched_geo.append(r)
        found_zips.add(r[0])

# Just add any missing zip codes as mock data to prevent dropping
for z in zip_codes:
    if z not in found_zips:
        # Mock lat/lng in Sao Paulo
        matched_geo.append([z, "-23.5505", "-46.6333", "sao paulo", "SP"])

save_csv("olist_geolocation_dataset.csv", geo_h, matched_geo)
print(f"Geolocation filtrada. Total: {len(matched_geo)}")
