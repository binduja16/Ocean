from fastapi import APIRouter, Query
import random
import requests
import os
from dotenv import load_dotenv

load_dotenv()
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

router = APIRouter()

def snap_to_sea(lat, lon, max_offset=1.0, step=0.05):
    """
    Snap given lat/lon to nearest sea coordinate by checking marine SST data.
    Uses step size for finer location increments.
    Returns snapped coordinates or original if sea not found.
    """
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
    return lat, lon

@router.get("/heatmap")
def get_heatmap(city: str = Query(...)):
    # Get city coordinates
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
        res = requests.get(url, timeout=5).json()
        if "coord" in res:
            lat, lon = res["coord"]["lat"], res["coord"]["lon"]
        else:
            lat, lon = 20.5937, 78.9629  # fallback: India center
    except Exception:
        lat, lon = 20.5937, 78.9629

    # Snap city center to nearest sea
    lat, lon = snap_to_sea(lat, lon)

    # Generate and snap 8 random heatmap points near city center
    points = []
    for _ in range(8):
        offset_lat = lat + random.uniform(-0.3, 0.3)
        offset_lon = lon + random.uniform(-0.3, 0.3)
        # Snap each random point to sea to ensure it's over water
        snapped_lat, snapped_lon = snap_to_sea(offset_lat, offset_lon)
        intensity = random.uniform(0.5, 1.0)
        points.append([snapped_lat, snapped_lon, intensity])

    markers = [{"lat": lat, "lon": lon, "name": f"{city.title()} Sea Location"}]

    return {"center": [lat, lon], "points": points, "markers": markers}
