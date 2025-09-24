import React, { useState, useEffect } from "react";
import MapView from "./MapView";
import Chatbot from "./Chatbot";

export default function FishermanDashboard() {
  const [location, setLocation] = useState("");
  const [fishData, setFishData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]),
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/predict_fish?location=${encodeURIComponent(location)}`
      );
      const data = await res.json();
      setFishData(data);
    } catch (err) {
      setFishData({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>🌊 Ocean AI Dashboard</h1>
      <p>Get real-time fishing advice based on your location!</p>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter your city"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ padding: "8px", width: "250px", marginRight: "10px" }}
        />
        <button onClick={handleSearch} style={{ padding: "8px 16px" }}>
          Search
        </button>
      </div>

      {loading && <p>Loading data...</p>}

      {fishData && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            maxWidth: "600px",
            backgroundColor: "#f0f8ff",
          }}
        >
          {fishData.error ? (
            <p style={{ color: "red" }}>Error: {fishData.error}</p>
          ) : (
            <>
              <p><b>Location:</b> {fishData.location}</p>
              <p><b>Weather:</b> {fishData.weather}</p>
              <p><b>SST:</b> {fishData.sst} °C</p>
              <p><b>Advice:</b> {fishData.advice}</p>

              {/* ✅ Map with route */}
              <MapView
                userLocation={userLocation}
                lat={fishData.lat}
                lon={fishData.lon}
              />
            </>
          )}
        </div>
      )}

      <Chatbot />
    </div>
  );
}
