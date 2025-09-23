import React, { useState } from "react";
import GMap from "./GMap";

export default function PredictionResult({ data }) {
  const [showMap, setShowMap] = useState(false);

  if (!data) return null;

  const isGood = data.advice.toLowerCase().includes("good");

  return (
    <div>
      <h3>Location: {data.location}</h3>
      <p>Weather: {data.weather}</p>
      <p>Sea Surface Temp: {data.sst}</p>
      <p>Fishing Advice: {data.advice}</p>

      {isGood && !showMap && (
        <button onClick={() => setShowMap(true)}>View on Map</button>
      )}

      {showMap && <GMap lat={data.lat} lon={data.lon} />}
    </div>
  );
}
