from fastapi import APIRouter, Query
import random
import requests
import os
from dotenv import load_dotenv

load_dotenv()
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

router = APIRouter()

# -------------------------------
# Helper: Snap coordinates to sea
# -------------------------------
def snap_to_sea(lat, lon, max_offset=1.0, step=0.1):
    """Shift coordinates slightly until marine SST data is found."""
    offsets = [
        (i, j)
        for i in range(-int(max_offset / step), int(max_offset / step) + 1)
        for j in range(-int(max_offset / step), int(max_offset / step) + 1)
    ]
    for dx, dy in offsets:
        check_lat = lat + dx * step
        check_lon = lon + dy * step
        try:
            sst_url = (
                f"https://marine-api.open-meteo.com/v1/marine"
                f"?latitude={check_lat}&longitude={check_lon}"
                f"&hourly=sea_surface_temperature&timezone=auto"
            )
            sst_data = requests.get(sst_url, timeout=5).json()
            sst_values = sst_data.get("hourly", {}).get("sea_surface_temperature", [])
            if any(sst_values):
                return check_lat, check_lon
        except Exception:
            continue
    return lat, lon  # fallback if no sea found

# -------------------------------
# Endpoint: Heatmap
# -------------------------------
@router.get("/heatmap")
def get_heatmap(city: str = Query(...)):
    # 1. Resolve city → coordinates
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
        res = requests.get(url, timeout=5).json()
        if "coord" in res:
            lat, lon = res["coord"]["lat"], res["coord"]["lon"]
        else:
            lat, lon = 20.5937, 78.9629  # fallback: India center
    except Exception:
        lat, lon = 20.5937, 78.9629

    # 2. Snap to nearest sea point
    lat, lon = snap_to_sea(lat, lon)

    # 3. Generate random heatmap points near sea
    points = []
    for _ in range(8):
        offset_lat = lat + random.uniform(-0.3, 0.3)
        offset_lon = lon + random.uniform(-0.3, 0.3)
        intensity = random.uniform(0.5, 1.0)
        points.append([offset_lat, offset_lon, intensity])

    # 4. Example markers
    markers = [
    {"lat": lat, "lon": lon, "name": f"{city.title()} Sea Location"}
]


    return {
        "center": [lat, lon],
        "points": points,
        "markers": markers,
    }
