import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const RouteMapView = ({ routeId, routes = [] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const selectedRoute = routeId ? routes.find(r => r.id === routeId) : undefined;
  const displayRoutes = selectedRoute ? [selectedRoute] : routes.slice(0, 5);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    const map = L.map(mapRef.current).setView([18.35, 83.5], 9);
    mapInstance.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    const colors = ["#a3e635", "#fb923c", "#38bdf8", "#f472b6", "#a78bfa"];

    displayRoutes.forEach((route, i) => {
      const coords = route.coordinates.map(c => L.latLng(c[0], c[1]));
      L.polyline(coords, { color: colors[i % colors.length], weight: 3, opacity: 0.8 }).addTo(map);
      coords.forEach(c => {
        L.circleMarker(c, { radius: 6, fillColor: colors[i % colors.length], fillOpacity: 1, color: "#000", weight: 1 }).addTo(map);
      });
    });

    return () => { map.remove(); mapInstance.current = null; };
  }, [routeId, routes]);

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-display font-bold text-sm uppercase tracking-widest">Route Map</h3>
      </div>
      <div ref={mapRef} className="h-[400px] w-full" />
    </div>
  );
};

export default RouteMapView;
