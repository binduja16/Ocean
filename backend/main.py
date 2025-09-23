from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import requests

from ml_model import predict_fishing
from llm_api import ask_ai
from biodiversity import router as biodiversity_router, fetch_biodiversity_metrics
import heatmap

# -------------------------------
# Load environment variables
# -------------------------------
load_dotenv()
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

# -------------------------------
# Create FastAPI app
# -------------------------------
app = FastAPI()

# -------------------------------
# Enable CORS
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Include routers
# -------------------------------
app.include_router(biodiversity_router, prefix="/api/biodiversity", tags=["biodiversity"])
app.include_router(heatmap.router, prefix="/api", tags=["heatmap"])

# -------------------------------
# Root endpoint
# -------------------------------
@app.get("/")
def root():
    return {"message": "🌊 Ocean AI Backend Running"}

# -------------------------------
# AI Chat endpoint
# -------------------------------
@app.get("/ask_ai")
def ask_ai_endpoint(query: str = Query(...)):
    return {"answer": ask_ai(query)}

# -------------------------------
# Helper functions
# -------------------------------
def fishing_advice(temp, wind, sst):
    if sst is None:
        return f"Moderate fishing conditions based on temp {temp}°C and wind {wind} m/s."
    return predict_fishing(temp, wind, sst)

def snap_to_sea(lat, lon, max_offset=0.5, step=0.05):
    """Shift coordinates slightly until marine SST data is found."""
    offsets = [
        (i, j)
        for i in range(-int(max_offset / step), int(max_offset / step) + 1)
        for j in range(-int(max_offset / step), int(max_offset / step) + 1)
    ]
    for dx, dy in offsets:
        check_lat = lat + dx * step
        check_lon = lon + dy * step
        sst_url = f"https://marine-api.open-meteo.com/v1/marine?latitude={check_lat}&longitude={check_lon}&hourly=sea_surface_temperature&timezone=auto"
        sst_data = requests.get(sst_url).json()
        sst_values = sst_data.get("hourly", {}).get("sea_surface_temperature", [])
        if any(sst_values):
            return check_lat, check_lon
    return lat, lon

# -------------------------------
# Predict Fish endpoint
# -------------------------------
@app.get("/predict_fish")
def predict_fish(location: str = None, lat: float = None, lon: float = None):
    try:
        # Case 1: Location string
        if location:
            weather_url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={OPENWEATHER_API_KEY}&units=metric"
            weather = requests.get(weather_url).json()
            if "main" not in weather:
                return {"error": "Invalid location or API issue", "api_response": weather}
            temp = weather["main"]["temp"]
            wind = weather["wind"]["speed"]
            desc = weather["weather"][0]["description"]
            lat, lon = weather["coord"]["lat"], weather["coord"]["lon"]

        # Case 2: Coordinates directly
        elif lat is not None and lon is not None:
            temp = 28
            wind = 5
            desc = "Sunny"

        else:
            return {"error": "Provide either location or coordinates"}

        # Snap to nearest ocean grid
        lat, lon = snap_to_sea(lat, lon)

        # Fetch SST data
        sst_url = f"https://marine-api.open-meteo.com/v1/marine?latitude={lat}&longitude={lon}&hourly=sea_surface_temperature&timezone=auto"
        sst_data = requests.get(sst_url).json()
        sst_values = sst_data.get("hourly", {}).get("sea_surface_temperature", [])
        sst = next((val for val in sst_values if val is not None), 28)

        # Fetch biodiversity data
        try:
            biodiv = fetch_biodiversity_metrics(lat, lon, radius=50)
        except Exception as e:
            biodiv = {"error": f"Could not fetch biodiversity: {e}"}

        # AI fishing advice
        advice = fishing_advice(temp, wind, sst)

        return {
            "location": location or "Detected Location",
            "lat": lat,
            "lon": lon,
            "weather": f"{temp}°C, {desc}, wind {wind} m/s",
            "sst": f"{sst} °C",
            "biodiversity": biodiv,
            "advice": advice,
        }

    except Exception as e:
        return {"error": str(e)}
