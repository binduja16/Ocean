// src/ResearcherDashboard.js
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import BiodiversityHeatmap from "./BiodiversityHeatmap";

export default function ResearcherDashboard() {
  const [city, setCity] = useState("");
  const [submittedCity, setSubmittedCity] = useState(null);
  const [view, setView] = useState(null);

  const [species, setSpecies] = useState([]);
  const [diversity, setDiversity] = useState(null);
  const [trends, setTrends] = useState([]);

  // ✅ Fetch species dynamically from backend
  const fetchSpecies = async (lat, lon) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/biodiversity/species?lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      setSpecies(data.species || []);
    } catch (err) {
      console.error("Error fetching species:", err);
      setSpecies([]);
    }
  };

  // ✅ Fetch diversity dynamically from backend
  const fetchDiversity = async (lat, lon) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/biodiversity/diversity?lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      setDiversity(data);
    } catch (err) {
      console.error("Error fetching diversity:", err);
      setDiversity({ richness: 0, shannon_index: 0 });
    }
  };

  // ✅ Mock trends until backend supports it
  const fetchTrends = () => {
    const mockTrends = [
      { year: 2015, richness: 5, shannon: 2.5 },
      { year: 2016, richness: 6, shannon: 2.7 },
      { year: 2017, richness: 6, shannon: 2.8 },
      { year: 2018, richness: 7, shannon: 2.9 },
      { year: 2019, richness: 6, shannon: 2.8 },
      { year: 2020, richness: 7, shannon: 3.0 },
      { year: 2021, richness: 7, shannon: 3.1 },
      { year: 2022, richness: 7, shannon: 3.15 },
      { year: 2023, richness: 8, shannon: 3.2 },
      { year: 2024, richness: 8, shannon: 3.25 },
      { year: 2025, richness: 8, shannon: 3.3 },
    ];
    setTrends(mockTrends);
  };

  // ✅ Handle button click (decide which API to call)
  const handleView = async (selectedView) => {
    setView(selectedView);

    if (!submittedCity) return;

    // For now, hardcode Goa coords. Replace later with geocoding API
    const lat = 15.3005;
    const lon = 74.0855;

    if (selectedView === "species") {
      await fetchSpecies(lat, lon);
    } else if (selectedView === "diversity") {
      await fetchDiversity(lat, lon);
    } else if (selectedView === "trends") {
      fetchTrends();
    }
    // ❌ no need to handle "heatmap" here
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim() === "") return;
    setSubmittedCity(city.trim());
    setView(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🔬 Researcher Dashboard</h2>
      <p>Explore marine biodiversity by entering a city</p>

      {/* City input */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter city name (e.g., Goa)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Submit
        </button>
      </form>

      {submittedCity && (
        <>
          <h3>Location: {submittedCity}</h3>

          {/* Buttons */}
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => handleView("species")}
              style={{ marginRight: "10px", padding: "8px" }}
            >
              🐠 Species
            </button>
            <button
              onClick={() => handleView("diversity")}
              style={{ marginRight: "10px", padding: "8px" }}
            >
              📊 Diversity Index
            </button>
            <button
              onClick={() => handleView("trends")}
              style={{ marginRight: "10px", padding: "8px" }}
            >
              📈 Trends
            </button>
            <button
              onClick={() => setView("heatmap")}
              style={{ padding: "8px" }}
            >
              🌍 Heatmap
            </button>
          </div>

          {/* Views */}
          {view === "species" && (
            <div>
              <h3>Available Species</h3>
              {species.length > 0 ? (
                <ul>
                  {species.map((sp, idx) => (
                    <li key={idx}>{sp}</li>
                  ))}
                </ul>
              ) : (
                <p>No species data available</p>
              )}
            </div>
          )}

          {view === "diversity" && diversity && (
            <div>
              <h3>Diversity Index</h3>
              <p>
                <strong>Species Richness:</strong> {diversity.richness}
              </p>
              <p>
                <strong>Shannon Index:</strong> {diversity.shannon_index}
              </p>
            </div>
          )}

          {view === "trends" && (
            <div style={{ height: 400 }}>
              <h3>Biodiversity Trends (2015–2025)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="richness"
                    stroke="#8884d8"
                    name="Species Richness"
                  />
                  <Line
                    type="monotone"
                    dataKey="shannon"
                    stroke="#82ca9d"
                    name="Shannon Index"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {view === "heatmap" && (
            <div style={{ marginTop: "20px" }}>
              <BiodiversityHeatmap city={submittedCity} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
