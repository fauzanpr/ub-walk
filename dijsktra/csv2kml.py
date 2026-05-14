# csv2kml.py

import csv
import xml.etree.ElementTree as ET

KML_FILE = "data.kml"
CSV_FILE = "dist.csv"
OUTPUT_FILE = "dist.kml"

# =========================
# LOAD NODE DATA FROM KML
# =========================

ns = {
    "kml": "http://www.opengis.net/kml/2.2"
}

tree = ET.parse(KML_FILE)
root = tree.getroot()

nodes = {}

for placemark in root.findall(".//kml:Placemark", ns):

    name_elem = placemark.find("kml:name", ns)
    coord_elem = placemark.find(".//kml:Point/kml:coordinates", ns)

    if name_elem is None or coord_elem is None:
        continue

    node_name = (name_elem.text or "").strip()
    coord_text = (coord_elem.text or "").strip()

    if not node_name or not coord_text:
        continue

    parts = coord_text.split(",")

    longitude = float(parts[0])
    latitude = float(parts[1])

    nodes[node_name] = {
        "latitude": latitude,
        "longitude": longitude
    }

# =========================
# KML HEADER
# =========================

kml = '''<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>

    <!-- BLUE -->
    <Style id="blueLine">
        <LineStyle>
            <color>ffff0000</color>
            <width>4</width>
        </LineStyle>
    </Style>

    <!-- YELLOW -->
    <Style id="yellowLine">
        <LineStyle>
            <color>ff00ffff</color>
            <width>4</width>
        </LineStyle>
    </Style>

    <!-- RED -->
    <Style id="redLine">
        <LineStyle>
            <color>ff0000ff</color>
            <width>4</width>
        </LineStyle>
    </Style>

'''

# =========================
# READ CSV
# =========================
#
# Expected CSV format:
#
# source,target,dist_type
# A,B,pvb
# A,C,trotoar
#

with open(CSV_FILE, newline="", encoding="utf-8") as f:

    reader = csv.DictReader(f)

    for row in reader:

        source = row["source"].strip()
        target = row["target"].strip()
        dist_type = row["dist_type"].strip().lower()

        if source not in nodes or target not in nodes:
            print(f"Skip: {source} -> {target}")
            continue

        src = nodes[source]
        dst = nodes[target]

        # style
        if dist_type == "pvb":
            style = "#blueLine"

        elif dist_type == "trotoar":
            style = "#yellowLine"

        else:
            style = "#redLine"

        kml += f'''
    <Placemark>
        <name>{source}-{target}</name>

        <styleUrl>{style}</styleUrl>

        <LineString>
            <coordinates>
                {src["longitude"]},{src["latitude"]},0
                {dst["longitude"]},{dst["latitude"]},0
            </coordinates>
        </LineString>
    </Placemark>
'''

# =========================
# KML FOOTER
# =========================

kml += '''
</Document>
</kml>
'''

# save
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(kml)

print(f"Saved to {OUTPUT_FILE}")