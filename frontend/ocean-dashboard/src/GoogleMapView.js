import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";

export default function GoogleMapView({ userLocation, lat, lon }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [directions, setDirections] = useState(null);

  useEffect(() => {
    if (!isLoaded || !userLocation || !lat || !lon) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: userLocation[0], lng: userLocation[1] },
        destination: { lat: lat, lng: lon },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        } else {
          console.error("Directions request failed due to " + status);
        }
      }
    );
  }, [isLoaded, userLocation, lat, lon]);

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <GoogleMap
      center={userLocation || { lat: 20.5937, lng: 78.9629 }} // default India
      zoom={6}
      mapContainerStyle={{ height: "400px", width: "100%" }}
    >
      {userLocation && <Marker position={{ lat: userLocation[0], lng: userLocation[1] }} />}
      {lat && lon && <Marker position={{ lat, lng: lon }} />}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}
