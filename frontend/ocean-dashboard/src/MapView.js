import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import RoutingMachine from "./Routing";
import L from "leaflet";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icons for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapView({ userLocation, lat, lon }) {
  const start = userLocation || [12.9716, 77.5946]; // Default Bangalore
  const end = lat && lon ? [lat, lon] : null;

  return (
    <MapContainer
      center={start}
      zoom={7}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {userLocation && (
        <Marker position={userLocation}>
          <Popup>📍 You are here</Popup>
        </Marker>
      )}

      {end && (
        <Marker position={end}>
          <Popup>🎣 Fishing Spot</Popup>
        </Marker>
      )}

      {end && <RoutingMachine start={start} end={end} />}
    </MapContainer>
  );
}
