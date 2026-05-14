# kml2json.py

import json
import xml.etree.ElementTree as ET

KML_FILE = "data.kml"
OUTPUT_FILE = "data_geo.json"

# Namespace KML
ns = {
    "kml": "http://www.opengis.net/kml/2.2"
}

tree = ET.parse(KML_FILE)
root = tree.getroot()

results = []

node_counter = 1

# Cari semua Placemark
for placemark in root.findall(".//kml:Placemark", ns):

    # Ambil name
    name_elem = placemark.find("kml:name", ns)

    if name_elem is None:
        continue

    node_name = (name_elem.text or "").strip()

    if not node_name:
        continue

    # Ambil Point coordinates
    coord_elem = placemark.find(".//kml:Point/kml:coordinates", ns)

    if coord_elem is None:
        continue

    coord_text = (coord_elem.text or "").strip()

    if not coord_text:
        continue

    # Format KML: longitude,latitude,altitude
    parts = coord_text.split(",")

    longitude = float(parts[0])
    latitude = float(parts[1])

    # Tentukan type berdasarkan nama
    if "_P" in node_name:
        node_type = "pvb"
    elif "_T" in node_name:
        node_type = "trotoar"
    else:
        node_type = "hotspot"

    # Susun data
    item = {
        "node_id": str(node_counter),
        "node_name": node_name,
        "latitude": latitude,
        "longitude": longitude,
        "node_type": node_type
    }

    results.append(item)

    node_counter += 1

# Simpan JSON
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Saved {len(results)} nodes to {OUTPUT_FILE}")