// src/BiodiversityHeatmap.js
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ✅ Component to add heat layer
function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points, map]);

  return null;
}

export default function BiodiversityHeatmap({ city }) {
  const [points, setPoints] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState([20.5937, 78.9629]); // Default India

  useEffect(() => {
    if (!city) return;

    const fetchData = async () => {
      try {
        // Example: call backend to fetch biodiversity points
       const res = await fetch(
  `http://127.0.0.1:8000/api/heatmap?city=${encodeURIComponent(city)}`
);

        const data = await res.json();

        // ✅ Assume backend returns format:
        // { center: [lat, lon], points: [[lat, lon, intensity], ...], markers: [{lat, lon, name}] }

        setCenter(data.center || [20.5937, 78.9629]);
        setPoints(data.points || []);
        setMarkers(data.markers || []);
      } catch (err) {
        console.error("Error fetching heatmap:", err);
      }
    };

    fetchData();
  }, [city]);

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Heat layer */}
      <HeatmapLayer points={points} />

      {/* Markers */}
      {markers.map((m, idx) => (
        <Marker key={idx} position={[m.lat, m.lon]}>
          <Popup>
            <b>{m.name}</b> <br />
            Biodiversity hotspot
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
