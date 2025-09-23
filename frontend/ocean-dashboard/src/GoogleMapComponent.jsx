// src/GoogleMapComponent.js
import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const GoogleMapComponent = ({ lat, lon, advice }) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Load Google Maps JS API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const [map, setMap] = useState(null);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: lat || 10, lng: lon || 76 }}
      zoom={8}
      onLoad={(mapInstance) => setMap(mapInstance)}
    >
      {lat && lon && <Marker position={{ lat, lng: lon }} />}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
