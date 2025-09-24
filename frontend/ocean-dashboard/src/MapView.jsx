import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

export default function MapView({ userLocation, lat, lon }) {
  const start = userLocation || [12.9716, 77.5946]; // default: Bangalore
  const end = lat && lon ? [lat, lon] : null;

  return (
    <MapContainer center={start} zoom={7} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {userLocation && (
        <Marker position={userLocation}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {end && (
        <Marker position={end}>
          <Popup>Fishing Spot</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
