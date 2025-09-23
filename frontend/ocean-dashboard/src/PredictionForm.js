// PredictionForm.js
import React, { useState } from "react";

export default function PredictionForm({ setLocationData }) {
  const [location, setLocation] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) return;

    // Call backend API to get fishing prediction
    const response = await fetch(`http://127.0.0.1:8000/predict_fish?location=${location}`);
    const data = await response.json();

    if (!data.error) {
      setLocationData({
        lat: data.lat,
        lon: data.lon,
        advice: data.advice,
      });
    } else {
      alert(data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button type="submit">Predict Fish</button>
    </form>
  );
}
