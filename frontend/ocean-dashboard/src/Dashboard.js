// src/Dashboard.js
import React from "react";
import BiodiversitySpecies from "./BiodiversitySpecies";
import BiodiversityDiversity from "./BiodiversityDiversity";

// If you want to use the card style, import your UI component library
// Example: using shadcn/ui or your own Card component
// import { Card } from "@/components/ui/card";

export default function Dashboard({ data }) {
  return (
    <div style={{ marginTop: "40px" }}>
      <h2>🐠 Biodiversity Module</h2>
      <p>Explore real-time marine species and diversity indices</p>

      {/* ✅ Option 1: Use separate components */}
      <BiodiversitySpecies />
      <BiodiversityDiversity />

      {/* ✅ Option 2: Show biodiversity data inside a Card if passed as prop */}
      {data && data.biodiversity && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            marginTop: "20px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>🌱 Biodiversity Insights</h3>
          <p>
            <b>Species Richness:</b> {data.biodiversity.richness}
          </p>
          <p>
            <b>Shannon Index:</b> {data.biodiversity.shannon_index}
          </p>
          <ul>
            {data.biodiversity.species &&
              data.biodiversity.species.map((sp, idx) => (
                <li key={idx}>• {sp}</li>
              ))}
          </ul>
          {data.biodiversity.note && (
            <p style={{ fontStyle: "italic", color: "gray" }}>
              {data.biodiversity.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
