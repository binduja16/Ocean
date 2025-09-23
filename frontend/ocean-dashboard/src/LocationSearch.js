// src/LocationSearch.js
import React, { useRef } from "react";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";

export default function LocationSearch({ setLocationData }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const searchBoxRef = useRef();

  const handlePlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places.length === 0) return;
    const place = places[0];
    const lat = place.geometry.location.lat();
    const lon = place.geometry.location.lng();

    setLocationData({ lat, lon, advice: "" });
  };

  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <StandaloneSearchBox
      onLoad={(ref) => (searchBoxRef.current = ref)}
      onPlacesChanged={handlePlacesChanged}
    >
      <input type="text" placeholder="Search location" />
    </StandaloneSearchBox>
  );
}
