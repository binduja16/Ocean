import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

export default function Routing({ start, end }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;

    // Always remove existing routing control first
    if (routingRef.current) {
      try {
        if (map.hasControl(routingRef.current)) {
          map.removeControl(routingRef.current);
        }
        if (routingRef.current._router) {
          routingRef.current._router.abort();
        }
      } catch (err) {
        console.warn("Cleanup error:", err);
      }
    }

    // Create new routing control
    routingRef.current = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      addWaypoints: false,
      draggableWaypoints: false,
      lineOptions: { styles: [{ color: "#1976d2", weight: 4 }] },
      show: false,
      fitSelectedRoutes: true,
      routeWhileDragging: false,
    });

    routingRef.current.addTo(map);

    return () => {
      if (routingRef.current) {
        try {
          // Abort any requests
          if (routingRef.current._router && routingRef.current._router.abort) {
            routingRef.current._router.abort();
          }
          
          // Remove from map
          if (map && map.removeControl && map.hasControl(routingRef.current)) {
            map.removeControl(routingRef.current);
          }
        } catch (err) {
          console.warn("Cleanup error:", err);
        }
      }
    };
  }, [map, start, end]);

  return null;
}