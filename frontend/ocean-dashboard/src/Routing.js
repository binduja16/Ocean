import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

const Routing = ({ start, end }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;

    // Remove existing routing control safely
    if (routingControlRef.current) {
      try {
        if (map.hasControl(routingControlRef.current)) {
          map.removeControl(routingControlRef.current);
        }
      } catch (error) {
        console.warn('Error removing routing control:', error);
      }
      routingControlRef.current = null;
    }

    // Create new routing control
    try {
      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(start[0], start[1]),
          L.latLng(end[0], end[1]),
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        show: false,
        lineOptions: { 
          styles: [{ color: '#3498db', weight: 5 }] 
        },
        createMarker: () => null, // Disable default markers if you want custom ones 
      }).addTo(map);
    } catch (error) {
      console.error('Error creating routing control:', error);
    }

    // Cleanup on unmount or dependencies change
    return () => {
      if (routingControlRef.current) {
        try {
          if (map.hasControl(routingControlRef.current)) {
            map.removeControl(routingControlRef.current);
          }
        } catch (error) {
          console.warn('Error during cleanup:', error);
        }
        routingControlRef.current = null;
      }
    };
  }, [map, start, end]);

  return null;
};

export default Routing;
