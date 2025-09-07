# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from dotenv import load_dotenv
import os
from ml_model import predict_fishing

# -------------------------------
# Load API key
# -------------------------------
load_dotenv()
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

# -------------------------------
# FastAPI app & CORS
# -------------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
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
# Rule-based advice fallback
# -------------------------------
def fishing_advice(temp, wind, sst):
    # Use ML model if SST is available, else fallback
    if sst is None:
        return f"Moderate fishing conditions based on temp {temp}°C and wind {wind} m/s."
    return predict_fishing(temp, wind, sst)

# -------------------------------
# Predict fish endpoint
# -------------------------------
@app.get("/predict_fish")
def predict_fish(location: str):
    try:
        # 1️⃣ Get weather from OpenWeather
        weather_url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={OPENWEATHER_API_KEY}&units=metric"
        weather = requests.get(weather_url).json()
        if "main" not in weather:
            return {"error": "Invalid location or API issue", "api_response": weather}

        temp = weather["main"]["temp"]
        wind = weather["wind"]["speed"]
        desc = weather["weather"][0]["description"]
        lat = weather["coord"]["lat"]
        lon = weather["coord"]["lon"]

        # 2️⃣ Get SST from Open-Meteo
        sst_url = f"https://marine-api.open-meteo.com/v1/marine?latitude={lat}&longitude={lon}&hourly=sea_surface_temperature&timezone=auto"
        sst_data = requests.get(sst_url).json()
        sst_values = sst_data.get("hourly", {}).get("sea_surface_temperature", [])

        # Pick first available SST, or fallback to default ocean temperature
        sst = next((val for val in sst_values if val is not None), 28)

        # Optional: print SST data for debugging
        print("SST API response:", sst_data)

        # 3️⃣ Get fishing advice (ML or rule-based)
        advice = fishing_advice(temp, wind, sst)

        # 4️⃣ Return structured response
        return {
            "location": location,
            "weather": f"{temp}°C, {desc}, wind {wind} m/s",
            "sst": f"{sst} °C",
            "advice": advice
        }

    except Exception as e:
        return {"error": str(e)}
