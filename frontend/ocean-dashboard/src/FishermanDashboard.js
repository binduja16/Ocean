import React, { useState, useEffect } from "react";
import MapView from "./MapView";
import Chatbot from "./Chatbot";

function FishermanDashboard() {
  const [location, setLocation] = useState("");
  const [fishData, setFishData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (err) => console.error(err)
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

      {/* Search Bar */}
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

      {/* Loading Indicator */}
      {loading && <p>Loading data...</p>}

      {/* Fishing Info */}
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
              <h2>Fishing Info for {fishData.location}</h2>
              <ul style={{ listStyle: "none", padding: 0, lineHeight: "1.8em" }}>
                <li>
                  <strong>Weather:</strong> {fishData.weather}
                </li>
                <li>
                  <strong>SST (Sea Surface Temp):</strong> {fishData.sst}
                </li>
                <li>
                  <strong>AI Advice:</strong>{" "}
                  <span style={{ color: fishData.advice.includes("Good") ? "green" : "red" }}>
                    {fishData.advice}
                  </span>
                </li>
                <li>
                  <strong>Route:</strong>
                  {userLocation ? (
                    <MapView
                      lat={fishData.lat}
                      lon={fishData.lon}
                      advice={fishData.advice}
                      userLocation={userLocation}
                    />
                  ) : (
                    <p>Allow location to see directions on map</p>
                  )}
                </li>
              </ul>
            </>
          )}
        </div>
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default FishermanDashboard;