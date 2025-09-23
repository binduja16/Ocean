import React, { useState } from "react";
import { getCoordinates } from "./utils";

export default function BiodiversityDiversity() {
  const [city, setCity] = useState("");
  const [diversity, setDiversity] = useState(null);

  const fetchDiversity = async () => {
    if (!city) return alert("Enter a city name");

    const coords = await getCoordinates(city);
    if (!coords) return alert("City not found");

    try {
      const res = await fetch(`/api/biodiversity/diversity?lat=${coords.lat}&lon=${coords.lon}`);
      if (!res.ok) throw new Error("Failed to fetch diversity data");
      const data = await res.json();
      setDiversity(data);
    } catch (err) {
      console.error(err);
      alert("Error fetching diversity: " + err.message);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "20px" }}>
      <h3>Diversity Index</h3>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ padding: "5px", marginRight: "10px" }}
      />
      <button onClick={fetchDiversity}>Get Diversity</button>
      {diversity && (
        <div>
          <p><strong>Species Richness:</strong> {diversity.richness}</p>
          <p><strong>Shannon Index:</strong> {diversity.shannon_index}</p>
        </div>
      )}
    </div>
  );
}
