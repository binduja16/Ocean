import React, { useState } from "react";
import { getCoordinates } from "./utils";

export default function BiodiversitySpecies() {
  const [city, setCity] = useState("");
  const [species, setSpecies] = useState([]);

  const fetchSpecies = async () => {
    if (!city) return alert("Enter a city name");

    const coords = await getCoordinates(city);
    if (!coords) return alert("City not found");

    try {
      const res = await fetch(`/api/biodiversity/species?lat=${coords.lat}&lon=${coords.lon}`);
      if (!res.ok) throw new Error("Failed to fetch species data");
      const data = await res.json();
      setSpecies(data.species || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching species: " + err.message);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "20px" }}>
      <h3>Species Records</h3>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ padding: "5px", marginRight: "10px" }}
      />
      <button onClick={fetchSpecies}>Get Species</button>
      <ul>
        {species.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
