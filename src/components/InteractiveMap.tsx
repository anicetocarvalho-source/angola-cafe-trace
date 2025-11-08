import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Exploracao {
  id: string;
  designacao: string;
  provincia: string;
  municipio: string;
  latitude: number;
  longitude: number;
  area_ha: number;
  status: string;
}

interface InteractiveMapProps {
  exploracoes: Exploracao[];
  onMarkerClick?: (exploracao: Exploracao) => void;
}

const InteractiveMap = ({ exploracoes, onMarkerClick }: InteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on Angola
    map.current = L.map(mapContainer.current).setView([-12.5, 17.5], 6);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.current?.removeLayer(layer);
      }
    });

    // Add markers for each exploration
    exploracoes.forEach((exp) => {
      if (!exp.latitude || !exp.longitude || !map.current) return;

      const markerColor =
        exp.status === "validado"
          ? "green"
          : exp.status === "pendente"
          ? "orange"
          : "red";

      const marker = L.marker([exp.latitude, exp.longitude], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(map.current);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <strong>${exp.designacao}</strong><br/>
          <small>${exp.municipio}, ${exp.provincia}</small><br/>
          <small>Área: ${exp.area_ha} ha</small><br/>
          <small>Status: <span style="color: ${markerColor}; font-weight: bold;">${exp.status}</span></small>
        </div>
      `);

      marker.on("click", () => {
        if (onMarkerClick) {
          onMarkerClick(exp);
        }
      });
    });

    // Fit bounds if there are explorations
    if (exploracoes.length > 0) {
      const bounds = exploracoes
        .filter((e) => e.latitude && e.longitude)
        .map((e) => [e.latitude, e.longitude] as [number, number]);
      
      if (bounds.length > 0) {
        map.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [exploracoes, onMarkerClick]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg border"
      style={{ minHeight: "500px" }}
    />
  );
};

export default InteractiveMap;
