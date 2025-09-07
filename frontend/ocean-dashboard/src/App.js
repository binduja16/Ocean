import React, { useState } from "react";

function App() {
  const [location, setLocation] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/predict_fish?location=${encodeURIComponent(location)}`
      );
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      setPrediction({ error: err.message });
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

      {prediction && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            maxWidth: "500px",
            backgroundColor: "#f0f8ff",
          }}
        >
          {prediction.error ? (
            <p style={{ color: "red" }}>Error: {prediction.error}</p>
          ) : (
            <>
              <h2>Fishing Info for {prediction.location}</h2>
              <p>
                <strong>Weather:</strong> {prediction.weather}
              </p>
              <p>
                <strong>SST:</strong> {prediction.sst}
              </p>
              <p>
                <strong>AI Advice:</strong> {prediction.advice}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
