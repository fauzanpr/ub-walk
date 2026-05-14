# kml2json_dist.py
# Konversi dist.kml -> data_dist.json
#
# Rules:
# - dist_id: D1, D2, ...
# - dist_name: dari <name>
# - upper_node: sebelum "-"
# - lower_node: setelah "-"
# - distance: dihitung dari coordinates dengan haversine
# - dist_type:
#     #blueLine   -> "pvb"
#     #yellowLine -> "trotoar"
#     selain itu  -> "other"

import json
import math
import re
import xml.etree.ElementTree as ET


INPUT_KML = "dist.kml"
OUTPUT_JSON = "data_dist.json"


def haversine(lat1, lon1, lat2, lon2):
    """
    Hitung jarak meter antara dua koordinat.
    """
    R = 6371000  # meter

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)

    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1)
        * math.cos(phi2)
        * math.sin(dlambda / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def parse_name(name_text):
    """
    Parse:
        A-B
        A - B
        NODE1-NODE2

    upper_node = sebelum '-'
    lower_node = setelah '-'
    """
    parts = re.split(r"\s*-\s*", name_text.strip(), maxsplit=1)

    if len(parts) == 2:
        upper_node = parts[0].strip()
        lower_node = parts[1].strip()
    else:
        upper_node = ""
        lower_node = ""

    return upper_node, lower_node


def style_to_type(style_url):
    style_url = (style_url or "").strip()

    if style_url == "#blueLine":
        return "pvb"
    elif style_url == "#yellowLine":
        return "trotoar"
    else:
        return "other"


def parse_coordinates(coord_text):
    """
    Format KML:
        lon,lat,alt lon,lat,alt ...

    Ambil titik pertama dan terakhir.
    """
    coords = coord_text.strip().split()

    if len(coords) < 2:
        return None

    first = coords[0].split(",")
    last = coords[-1].split(",")

    lon1 = float(first[0])
    lat1 = float(first[1])

    lon2 = float(last[0])
    lat2 = float(last[1])

    return lat1, lon1, lat2, lon2


def main():
    tree = ET.parse(INPUT_KML)
    root = tree.getroot()

    ns = {
        "kml": "http://www.opengis.net/kml/2.2"
    }

    placemarks = root.findall(".//kml:Placemark", ns)

    result = []

    for idx, pm in enumerate(placemarks, start=1):
        name_elem = pm.find("kml:name", ns)
        style_elem = pm.find("kml:styleUrl", ns)
        coord_elem = pm.find(".//kml:coordinates", ns)

        if name_elem is None or coord_elem is None:
            continue

        dist_name = (name_elem.text or "").strip()

        if not dist_name:
            continue

        upper_node, lower_node = parse_name(dist_name)

        style_url = style_elem.text if style_elem is not None else ""
        dist_type = style_to_type(style_url)

        parsed = parse_coordinates(coord_elem.text)

        if parsed is None:
            continue

        lat1, lon1, lat2, lon2 = parsed

        distance = haversine(lat1, lon1, lat2, lon2)

        item = {
            "dist_id": f"D{idx}",
            "dist_name": dist_name,
            "lower_node": lower_node,
            "upper_node": upper_node,
            "distance": round(distance, 2),
            "dist_type": dist_type
        }

        result.append(item)

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(result)} entries to {OUTPUT_JSON}")


if __name__ == "__main__":
    main()