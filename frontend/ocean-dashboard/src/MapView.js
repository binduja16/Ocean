import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Routing from "./Routing"; // Routing component
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function MapView({ lat, lon, advice, userLocation }) {
  if (!lat || !lon) return null;

  return (
    <div style={{ height: "500px", width: "100%", marginTop: "20px" }}>
      <MapContainer
        center={userLocation || [lat, lon]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Destination marker */}
        <Marker position={[lat, lon]}>
          <Popup>{advice || "Destination"}</Popup>
        </Marker>

        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Routing from user to destination */}
        {userLocation && <Routing start={userLocation} end={[lat, lon]} />}
      </MapContainer>
    </div>
  );
}
