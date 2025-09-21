# main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
from dotenv import load_dotenv
import os
from ml_model import predict_fishing
from llm_api import ask_ai

# -------------------------------
# Load API keys
# -------------------------------
load_dotenv()
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

# -------------------------------
# FastAPI app & CORS
# -------------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    answer = ask_ai(query)
    return {"answer": answer}

# -------------------------------
# Rule-based fallback
# -------------------------------
def fishing_advice(temp, wind, sst):
    if sst is None:
        return f"Moderate fishing conditions based on temp {temp}°C and wind {wind} m/s."
    return predict_fishing(temp, wind, sst)

# -------------------------------
# Helper: Snap coordinates to sea
# -------------------------------
def snap_to_sea(lat, lon, max_offset=0.5, step=0.05):
    offsets = [(i, j) for i in range(-int(max_offset/step), int(max_offset/step)+1)
                      for j in range(-int(max_offset/step), int(max_offset/step)+1)]
    
    for dx, dy in offsets:
        check_lat = lat + dx*step
        check_lon = lon + dy*step
        sst_url = f"https://marine-api.open-meteo.com/v1/marine?latitude={check_lat}&longitude={check_lon}&hourly=sea_surface_temperature&timezone=auto"
        sst_data = requests.get(sst_url).json()
        sst_values = sst_data.get("hourly", {}).get("sea_surface_temperature", [])
        if any(sst_values):
            return check_lat, check_lon
    # fallback to original coordinates
    return lat, lon

# -------------------------------
# Predict fish endpoint
# -------------------------------
@app.get("/predict_fish")
def predict_fish(location: str = None, lat: float = None, lon: float = None):
    try:
        if location:
            # Get weather and coordinates
            weather_url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={OPENWEATHER_API_KEY}&units=metric"
            weather = requests.get(weather_url).json()
            if "main" not in weather:
                return {"error": "Invalid location or API issue", "api_response": weather}

            temp = weather["main"]["temp"]
            wind = weather["wind"]["speed"]
            desc = weather["weather"][0]["description"]
            lat, lon = weather["coord"]["lat"], weather["coord"]["lon"]

        elif lat is not None and lon is not None:
            # clicked coordinates
            temp = 28  # default temp
            wind = 5
            desc = "Sunny"
        else:
            return {"error": "Provide either location or coordinates"}

        # Snap to nearest sea coordinates
        lat, lon = snap_to_sea(lat, lon)

        # Get SST from marine API
        sst_url = f"https://marine-api.open-meteo.com/v1/marine?latitude={lat}&longitude={lon}&hourly=sea_surface_temperature&timezone=auto"
        sst_data = requests.get(sst_url).json()
        sst_values = sst_data.get("hourly", {}).get("sea_surface_temperature", [])
        sst = next((val for val in sst_values if val is not None), 28)

        # Fishing advice
        advice = fishing_advice(temp, wind, sst)

        return {
            "location": location or "Selected Spot",
            "lat": lat,
            "lon": lon,
            "weather": f"{temp}°C, {desc}, wind {wind} m/s",
            "sst": f"{sst} °C",
            "advice": advice
        }

    except Exception as e:
        return {"error": str(e)}
