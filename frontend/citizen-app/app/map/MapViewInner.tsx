"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const KARNATAKA_CITIZEN_SITES = [
  { id: 1, lat: 12.9352, lng: 77.6245, locality: "Koramangala 4th Block", ward: "Ward 151 (Koramangala)", severity: "critical", waste: "Plastic & Packaging", score: 96, status: "assigned", address: "Near Wipro Park Signal" },
  { id: 2, lat: 12.9784, lng: 77.6408, locality: "Indiranagar 100ft Road", ward: "Ward 80 (Indiranagar)", severity: "high", waste: "Construction Debris", score: 84, status: "cleaning_started", address: "12th Main Corner" },
  { id: 3, lat: 12.9756, lng: 77.6066, locality: "MG Road Metro Station", ward: "Ward 111 (Shantala Nagar)", severity: "medium", waste: "Commercial Packaging", score: 62, status: "under_review", address: "North Gate Exit" },
  { id: 4, lat: 12.9856, lng: 77.7324, locality: "Whitefield ITPL Gate", ward: "Ward 85 (Whitefield)", severity: "critical", waste: "E-Waste Dump", score: 98, status: "pending", address: "ITPL Main Entrance" },
  { id: 5, lat: 13.0358, lng: 77.5970, locality: "Hebbal Flyover Junction", ward: "Ward 7 (Hebbal)", severity: "critical", waste: "Illegal Highway Dump", score: 98, status: "assigned", address: "Service Road Underpass" },
  { id: 6, lat: 12.9279, lng: 77.5824, locality: "Jayanagar 4th Block", ward: "Ward 153 (Jayanagar)", severity: "medium", waste: "Organic Market Waste", score: 58, status: "under_review", address: "Vegetable Market Backgate" },
  { id: 7, lat: 12.8452, lng: 77.6602, locality: "Electronic City Phase 1", ward: "Ward 192 (Begur)", severity: "high", waste: "Industrial Plastic", score: 76, status: "assigned", address: "Wipro Avenue Gate 2" },
  { id: 8, lat: 12.9116, lng: 77.6389, locality: "HSR Layout Sector 1", ward: "Ward 174 (HSR Layout)", severity: "low", waste: "Paper Boxes", score: 32, status: "completed", address: "27th Main Park" },
  { id: 9, lat: 12.9569, lng: 77.7011, locality: "Marathahalli Bridge", ward: "Ward 87 (Marathahalli)", severity: "high", waste: "Roadside Dump", score: 81, status: "assigned", address: "Outer Ring Road Junction" },
  { id: 10, lat: 12.3052, lng: 76.6552, locality: "Devaraja Market, Mysuru", ward: "Central Mysuru", severity: "high", waste: "Organic Market Waste", score: 78, status: "pending", address: "Mysuru Market Gate" },
  { id: 11, lat: 12.9141, lng: 74.8560, locality: "Old Port, Mangaluru", ward: "Mangaluru Port", severity: "critical", waste: "Coastal Plastic", score: 92, status: "assigned", address: "Port Beach Road" },
];

const SEVERITY_COLORS: Record<string, string> = {
  very_low: "#16a34a", low: "#65a30d", medium: "#d97706", high: "#ea580c", critical: "#dc2626",
};

interface MapViewInnerProps {
  onSelect: (site: any) => void;
}

export default function MapViewInner({ onSelect }: MapViewInnerProps) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    // Center on Bengaluru
    const map = L.map("citizen-map-gmaps-container", {
      center: [12.9716, 77.5946],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: "Map data &copy; Google Maps • EcoVision AI Bengaluru",
      maxZoom: 20,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    KARNATAKA_CITIZEN_SITES.forEach((site) => {
      const color = SEVERITY_COLORS[site.severity] || "#dc2626";

      const pinIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            position:relative; width:32px; height:32px;
            display:flex; items-center; justify-center;
            cursor:pointer;
          ">
            <div style="
              width:26px; height:26px; border-radius:50% 50% 50% 0;
              background:${color}; transform:rotate(-45deg);
              border:2px solid #ffffff;
              box-shadow:0 3px 8px rgba(0,0,0,0.45);
              display:flex; items-center; justify-center;
            ">
              <div style="
                width:9px; height:9px; border-radius:50%;
                background:#ffffff; transform:rotate(45deg);
              "></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([site.lat, site.lng], { icon: pinIcon }).addTo(map);

      marker.on("click", () => {
        onSelect({
          ward: site.locality,
          waste: site.waste,
          score: site.score,
          severity: site.severity,
          status: site.status,
          address: site.address,
        });
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onSelect]);

  return <div id="citizen-map-gmaps-container" className="w-full h-full" style={{ position: "absolute", inset: 0 }} />;
}
