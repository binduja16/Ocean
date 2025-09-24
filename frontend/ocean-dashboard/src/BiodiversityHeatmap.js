import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

function HeatmapLayer({ points, markers }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points) return;

    const gradient = {
      0.2: 'blue',
      0.4: 'lime',
      0.6: 'yellow',
      0.8: 'orange',
      1.0: 'red',
    };

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      gradient: gradient,
      maxZoom: 12,
      max: 1.0,
    }).addTo(map);

    const leafletMarkers = (markers || []).map((m) =>
      L.marker([m.lat, m.lon]).addTo(map).bindPopup(m.name)
    );

    return () => {
      map.removeLayer(heatLayer);
      leafletMarkers.forEach((m) => map.removeLayer(m));
    };
  }, [map, points, markers]);

  return null;
}

const BiodiversityHeatmap = ({ city }) => {
  const [heatmapData, setHeatmapData] = useState(null);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/biodiversity/heatmap?city=${encodeURIComponent(city)}`
        );
        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        setHeatmapData(data);
      } catch (error) {
        console.error("Error fetching heatmap:", error);
      }
    };

    fetchHeatmap();
  }, [city]);

  return (
    <div>
      <h2>Biodiversity Heatmap for {city}</h2>
      {heatmapData ? (
        <MapContainer center={heatmapData.center || [20.5937, 78.9629]} zoom={7} style={{ height: "500px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <HeatmapLayer points={heatmapData.points} markers={heatmapData.markers} />
        </MapContainer>
      ) : (
        <p>Loading heatmap...</p>
      )}
    </div>
  );
};

export default BiodiversityHeatmap;