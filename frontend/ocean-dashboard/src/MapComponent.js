// src/MapComponent.js
import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

function MapComponent() {
  useEffect(() => {
    // Check if map container exists already
    if (document.getElementById("map")) {
      const map = L.map("map").setView([51.505, -0.09], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      return () => {
        map.remove(); // Clean up map when component unmounts
      };
    }
  }, []);

  return <div id="map" style={{ height: "500px", width: "100%" }}></div>;
}

export default MapComponent;
