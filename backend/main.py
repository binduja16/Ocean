from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import requests
from datetime import datetime, timedelta
from fastapi import FastAPI, Query

from ml_model import predict_fishing
from llm_api import ask_ai
from biodiversity import router as biodiversity_router, fetch_biodiversity_metrics
from database import SessionLocal
from models import Prediction

load_dotenv()
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(biodiversity_router, prefix="/api/biodiversity", tags=["biodiversity"])

# Root
@app.get("/")
def root():
    return {"message": "🌊 Ocean AI Backend Running"}

# AI Chat
@app.get("/ask_ai")
def ask_ai_endpoint(query: str = Query(...)):
    return {"answer": ask_ai(query)}

# ---------------------------
# Helpers
# ---------------------------
def snap_to_sea(lat, lon, max_offset=0.5, step=0.05):
    offsets = [
        (i, j)
        for i in range(-int(max_offset / step), int(max_offset / step) + 1)
        for j in range(-int(max_offset / step), int(max_offset / step) + 1)
    ]
    for dx, dy in offsets:
        check_lat = lat + dx * step
        check_lon = lon + dy * step
        try:
            sst_url = f"https://marine-api.open-meteo.com/v1/marine?latitude={check_lat}&longitude={check_lon}&hourly=sea_surface_temperature&timezone=auto"
            sst_data = requests.get(sst_url, timeout=5).json()
            sst_values = sst_data.get("hourly", {}).get("sea_surface_temperature", [])
            if any(sst_values):
                return check_lat, check_lon
        except Exception:
            continue
    return lat, lon

def nearest_coast(lat, lon):
    """Shift slightly towards coast for road routing"""
    return lat - 0.05, lon
@app.get("/api/heatmap")
def get_heatmap(city: str):
    # Example demo data (replace with DB/ML output)
    if city.lower() == "goa":
        return {
            "center": [15.3, 74.08],
            "points": [
                [15.3, 74.08, 0.8],
                [15.4, 74.1, 0.6],
                [15.35, 74.05, 0.9],
            ],
            "markers": [
                {"lat": 15.3, "lon": 74.08, "name": "Fish Zone A"},
                {"lat": 15.4, "lon": 74.1, "name": "Fish Zone B"},
            ],
        }
    else:
        return {
            "center": [20.5937, 78.9629],
            "points": [],
            "markers": [],
        }

# ---------------------------
# Predict Fish
# ---------------------------
@app.get("/predict_fish")
def predict_fish(location: str = None, lat: float = None, lon: float = None):
    db = SessionLocal()
    try:
        if location:
            weather_url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={OPENWEATHER_API_KEY}&units=metric"
            weather_res = requests.get(weather_url, timeout=5).json()
            if "coord" not in weather_res:
                return {"error": "Invalid location"}
            lat, lon = weather_res["coord"]["lat"], weather_res["coord"]["lon"]
            temp = weather_res["main"]["temp"]
            wind = weather_res["wind"]["speed"]
            desc = weather_res["weather"][0]["description"]
        elif lat is not None and lon is not None:
            temp, wind, desc = 28, 5, "Sunny"
            location = "Detected Location"
        else:
            return {"error": "Provide either location or coordinates"}

        # Snap to nearest sea
        lat, lon = snap_to_sea(lat, lon)

        # Nearest coast
        coast_lat, coast_lon = nearest_coast(lat, lon)

        # SST
        sst_url = f"https://marine-api.open-meteo.com/v1/marine?latitude={lat}&longitude={lon}&hourly=sea_surface_temperature&timezone=auto"
        sst_data = requests.get(sst_url).json()
        sst_values = sst_data.get("hourly", {}).get("sea_surface_temperature", [])
        sst = next((val for val in sst_values if val is not None), 28)

        # Biodiversity
        try:
            biodiv = fetch_biodiversity_metrics(lat, lon, radius=50)
        except Exception as e:
            biodiv = {"error": str(e)}

        # AI advice
        advice = predict_fishing(temp, wind, sst)

        # Save DB
        prediction = Prediction(
            location=location,
            lat=lat,
            lon=lon,
            weather=f"{temp}°C, {desc}, wind {wind} m/s",
            sst=sst,
            advice=advice
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        return {
            "source": "live-api",
            "location": prediction.location,
            "lat": prediction.lat,
            "lon": prediction.lon,
            "coast_lat": coast_lat,
            "coast_lon": coast_lon,
            "weather": prediction.weather,
            "sst": prediction.sst,
            "biodiversity": biodiv,
            "advice": prediction.advice,
        }
    finally:
        db.close()
