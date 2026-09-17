"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const KARNATAKA_MUNICIPAL_SITES = [
  // Bengaluru Wards
  { id: "RPT-BLR-101", latitude: 12.9352, longitude: 77.6245, ward: "Ward 151 (Koramangala)", address: "Koramangala 4th Block, 80ft Road", severity: "critical", primary_waste_type: "plastic", pollution_score: 96.8, garbage_area_m2: 28.4, is_illegal: true },
  { id: "RPT-BLR-102", latitude: 12.9784, longitude: 77.6408, ward: "Ward 80 (Indiranagar)", address: "Indiranagar 100ft Road, 12th Main", severity: "high", primary_waste_type: "construction", pollution_score: 84.1, garbage_area_m2: 22.5, is_illegal: false },
  { id: "RPT-BLR-103", latitude: 12.9756, longitude: 77.6066, ward: "Ward 111 (Shantala Nagar)", address: "MG Road Metro Station North Gate", severity: "medium", primary_waste_type: "organic", pollution_score: 62.0, garbage_area_m2: 8.0, is_illegal: false },
  { id: "RPT-BLR-104", latitude: 12.9856, longitude: 77.7324, ward: "Ward 85 (Whitefield)", address: "Whitefield ITPL Main Gate Junction", severity: "critical", primary_waste_type: "electronic", pollution_score: 98.2, garbage_area_m2: 35.0, is_illegal: true },
  { id: "RPT-BLR-105", latitude: 13.0358, longitude: 77.5970, ward: "Ward 7 (Hebbal)", address: "Hebbal Flyover Service Road", severity: "critical", primary_waste_type: "illegal_dump", pollution_score: 98.6, garbage_area_m2: 45.0, is_illegal: true },
  { id: "RPT-BLR-106", latitude: 12.9279, longitude: 77.5824, ward: "Ward 153 (Jayanagar)", address: "Jayanagar 4th Block Shopping Complex", severity: "medium", primary_waste_type: "organic", pollution_score: 58.0, garbage_area_m2: 12.0, is_illegal: false },
  { id: "RPT-BLR-107", latitude: 12.8452, longitude: 77.6602, ward: "Ward 192 (Begur)", address: "Electronic City Phase 1 Main Gate", severity: "high", primary_waste_type: "plastic", pollution_score: 76.0, garbage_area_m2: 18.4, is_illegal: false },
  { id: "RPT-BLR-108", latitude: 12.9116, longitude: 77.6389, ward: "Ward 174 (HSR Layout)", address: "HSR Layout Sector 1, 27th Main", severity: "low", primary_waste_type: "paper", pollution_score: 32.0, garbage_area_m2: 4.5, is_illegal: false },
  { id: "RPT-BLR-109", latitude: 12.9738, longitude: 77.5920, ward: "Ward 112 (Sampangiram)", address: "Cubbon Park Gate, Kasturba Road", severity: "low", primary_waste_type: "organic", pollution_score: 25.0, garbage_area_m2: 3.0, is_illegal: false },
  { id: "RPT-BLR-110", latitude: 12.9569, longitude: 77.7011, ward: "Ward 87 (Marathahalli)", address: "Marathahalli Outer Ring Road Bridge", severity: "high", primary_waste_type: "mixed", pollution_score: 81.0, garbage_area_m2: 22.0, is_illegal: true },
  { id: "RPT-BLR-111", latitude: 13.0100, longitude: 77.5400, ward: "Ward 11 (Peenya)", address: "Peenya 2nd Stage Industrial Estate", severity: "critical", primary_waste_type: "metal", pollution_score: 97.5, garbage_area_m2: 54.0, is_illegal: true },
  { id: "RPT-BLR-112", latitude: 13.0674, longitude: 77.5930, ward: "Ward 3 (Yelahanka)", address: "Yelahanka New Town 4th Phase", severity: "low", primary_waste_type: "paper", pollution_score: 29.0, garbage_area_m2: 4.0, is_illegal: false },
  { id: "RPT-BLR-113", latitude: 12.9165, longitude: 77.6229, ward: "Ward 67 (BTM)", address: "BTM Layout 2nd Stage 100ft Road", severity: "medium", primary_waste_type: "mixed", pollution_score: 64.0, garbage_area_m2: 10.5, is_illegal: false },
  { id: "RPT-BLR-114", latitude: 13.0012, longitude: 77.5569, ward: "Ward 27 (Rajajinagar)", address: "Rajajinagar 1st Block Industrial", severity: "medium", primary_waste_type: "plastic", pollution_score: 60.0, garbage_area_m2: 9.0, is_illegal: false },
  { id: "RPT-BLR-115", latitude: 12.9542, longitude: 77.4980, ward: "Ward 116 (Nayandahalli)", address: "Mysuru Road Flyover Underpass", severity: "high", primary_waste_type: "construction", pollution_score: 87.0, garbage_area_m2: 31.0, is_illegal: true },

  // Karnataka Region Hubs
  { id: "RPT-KA-201", latitude: 12.3052, longitude: 76.6552, ward: "Central Mysuru", address: "Devaraja Market, Mysuru", severity: "high", primary_waste_type: "organic", pollution_score: 78.0, garbage_area_m2: 21.0, is_illegal: false },
  { id: "RPT-KA-202", latitude: 12.9141, longitude: 74.8560, ward: "Mangaluru Port", address: "Old Port Beach, Mangaluru", severity: "critical", primary_waste_type: "plastic", pollution_score: 92.0, garbage_area_m2: 38.0, is_illegal: true },
  { id: "RPT-KA-203", latitude: 15.3647, longitude: 75.1240, ward: "Hubballi Central", address: "Hubballi Railway Station Yard", severity: "high", primary_waste_type: "mixed", pollution_score: 80.0, garbage_area_m2: 25.0, is_illegal: true },
  { id: "RPT-KA-204", latitude: 15.8497, longitude: 74.4977, ward: "Udyambag Sector", address: "Belagavi Industrial Zone", severity: "medium", primary_waste_type: "metal", pollution_score: 65.0, garbage_area_m2: 16.0, is_illegal: false },
  { id: "RPT-KA-205", latitude: 13.9299, longitude: 75.5681, ward: "City Center", address: "Shivamogga KSRTC Bus Stand", severity: "medium", primary_waste_type: "plastic", pollution_score: 58.0, garbage_area_m2: 11.0, is_illegal: false },
  { id: "RPT-KA-206", latitude: 13.3409, longitude: 74.7421, ward: "Car Street", address: "Udupi Temple Square", severity: "low", primary_waste_type: "organic", pollution_score: 30.0, garbage_area_m2: 5.0, is_illegal: false },
];

const SEVERITY_COLORS: Record<string, string> = {
  very_low: "#16a34a", low: "#65a30d", medium: "#d97706", high: "#ea580c", critical: "#dc2626",
};

const KA_BOUNDS: Record<string, { center: [number, number]; zoom: number }> = {
  bangalore: { center: [12.9716, 77.5946], zoom: 12 },
  central:   { center: [12.9750, 77.6000], zoom: 13 },
  techparks: { center: [12.9300, 77.6800], zoom: 12 },
  karnataka: { center: [14.2000, 75.8000], zoom: 7.5 },
  mysuru:    { center: [12.3052, 76.6552], zoom: 11 },
  coastal:   { center: [13.1500, 74.8000], zoom: 10 },
};

interface Props {
  filter: string;
  onSiteSelect: (site: any) => void;
}

export default function GISMapView({ filter, onSiteSelect }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    // Center on Bengaluru City Center
    const map = L.map("municipal-gis-gmaps", {
      center: [12.9716, 77.5946],
      zoom: 12,
      zoomControl: false,
      minZoom: 6,
      maxZoom: 20,
    });

    L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: "Map data &copy; Google Maps • EcoVision AI Bengaluru GIS",
      maxZoom: 20,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // 🎯 1st Class Click-to-Detect Anywhere in Bengaluru / Karnataka
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSearchStatus(`Scanning location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)...`);

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const locationName = data?.display_name || `Point (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;

        const dynamicSeverity = "critical";
        const color = SEVERITY_COLORS[dynamicSeverity];

        const pinIcon = L.divIcon({
          className: "",
          html: `
            <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
              <div style="width:30px; height:30px; border-radius:50% 50% 50% 0; background:${color}; transform:rotate(-45deg); border:2px solid #ffffff; box-shadow:0 0 16px ${color}; display:flex; align-items:center; justify-content:center;">
                <div style="width:10px; height:10px; border-radius:50%; background:#ffffff; transform:rotate(45deg);"></div>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });

        L.marker([lat, lng], { icon: pinIcon }).addTo(markersLayerRef.current!);
        onSiteSelect({
          id: `RPT-CLICK-${Math.floor(1000 + Math.random() * 9000)}`,
          ward: `Bengaluru / KA GIS Target`,
          severity: dynamicSeverity,
          score: 96,
          waste: "Detected Plastic & Construction Waste",
          area: 32.0,
          isIllegal: true,
          address: locationName,
        });

        setSearchStatus(`Coordinates Locked: ${locationName.split(",")[0]}`);
      } catch (err) {
        console.error("Click detection error:", err);
      } finally {
        setTimeout(() => setSearchStatus(null), 4000);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onSiteSelect]);

  // Update Markers based on severity filter
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = filter === "all"
      ? KARNATAKA_MUNICIPAL_SITES
      : KARNATAKA_MUNICIPAL_SITES.filter(s => {
          if (filter === "critical") return s.severity === "critical";
          if (filter === "high") return s.severity === "high";
          if (filter === "medium") return s.severity === "medium";
          if (filter === "low") return ["low", "very_low"].includes(s.severity);
          return true;
        });

    filtered.forEach((site) => {
      const color = SEVERITY_COLORS[site.severity] || "#dc2626";
      const isCritical = site.severity === "critical";

      const pinIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            position:relative; width:34px; height:34px;
            display:flex; items-center; justify-center;
            cursor:pointer;
          ">
            <div style="
              width:28px; height:28px; border-radius:50% 50% 50% 0;
              background:${color}; transform:rotate(-45deg);
              border:2px solid #ffffff;
              box-shadow:0 4px 10px rgba(0,0,0,0.5);
              display:flex; items-center; justify-center;
            ">
              <div style="
                width:10px; height:10px; border-radius:50%;
                background:#ffffff; transform:rotate(45deg);
              "></div>
            </div>
            ${site.is_illegal ? `<div style="position:absolute; top:-6px; right:-2px; background:#ef4444; color:#fff; border:1px solid #fff; border-radius:50%; width:14px; height:14px; font-size:9px; font-weight:bold; display:flex; align-items:center; justify-content:center;">!</div>` : ""}
            ${isCritical ? `<div style="position:absolute; top:-4px; left:-2px; width:10px; height:10px; border-radius:50%; background:#ef4444; border:1px solid #fff;" class="animate-ping"></div>` : ""}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const marker = L.marker([site.latitude, site.longitude], { icon: pinIcon })
        .addTo(markersLayerRef.current!);

      marker.on("click", () => onSiteSelect({
        id: site.id,
        ward: site.ward,
        severity: site.severity,
        score: Math.round(site.pollution_score),
        waste: site.primary_waste_type,
        area: site.garbage_area_m2,
        isIllegal: site.is_illegal,
        address: site.address,
      }));

      marker.bindTooltip(`
        <div style="font-family:'Lora',serif; font-size:12px; background:#0f172a; color:#ffffff; border-radius:8px; padding:8px 12px; border:1px solid rgba(255,255,255,0.15);">
          <strong>#${site.id} – ${site.address}</strong><br/>
          <span style="color:${color}; font-weight:bold; text-transform:uppercase;">${site.severity}</span> · Area: ${site.garbage_area_m2} m²
          ${site.is_illegal ? " · ⚠️ Illegal Dump" : ""}
        </div>
      `, { permanent: false });
    });
  }, [filter, onSiteSelect]);

  const handleMapTypeSwitch = (type: "roadmap" | "satellite") => {
    if (!mapRef.current) return;
    setMapType(type);
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    const url = type === "satellite"
      ? "https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
      : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

    L.tileLayer(url, {
      attribution: "Map data &copy; Google Maps • EcoVision AI Bengaluru GIS Intelligence",
      maxZoom: 20,
    }).addTo(mapRef.current);
  };

  const handleRegionFly = (regionKey: string) => {
    if (!mapRef.current || !KA_BOUNDS[regionKey]) return;
    const { center, zoom } = KA_BOUNDS[regionKey];
    mapRef.current.flyTo(center, zoom, { duration: 1.5 });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;

    setIsSearching(true);
    setSearchStatus("Scanning Bengaluru & Karnataka GIS database...");

    const q = searchQuery.toLowerCase();
    const match = KARNATAKA_MUNICIPAL_SITES.find(s => 
      s.address.toLowerCase().includes(q) || 
      s.ward.toLowerCase().includes(q)
    );

    if (match) {
      mapRef.current.flyTo([match.latitude, match.longitude], 15, { duration: 1.2 });
      onSiteSelect({
        id: match.id,
        ward: match.ward,
        severity: match.severity,
        score: Math.round(match.pollution_score),
        waste: match.primary_waste_type,
        area: match.garbage_area_m2,
        isIllegal: match.is_illegal,
        address: match.address,
      });
      setIsSearching(false);
      setSearchStatus(`Target Located: ${match.address}`);
      setTimeout(() => setSearchStatus(null), 3000);
      return;
    }

    try {
      const query = searchQuery.toLowerCase().includes("karnataka") || searchQuery.toLowerCase().includes("bengaluru") || searchQuery.toLowerCase().includes("bangalore")
        ? searchQuery
        : `${searchQuery}, Karnataka, India`;

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const name = data[0].display_name;

        mapRef.current.flyTo([lat, lon], 15, { duration: 1.5 });

        const dynamicSeverity = "critical";
        const color = SEVERITY_COLORS[dynamicSeverity];

        const pinIcon = L.divIcon({
          className: "",
          html: `
            <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
              <div style="width:30px; height:30px; border-radius:50% 50% 50% 0; background:${color}; transform:rotate(-45deg); border:2px solid #ffffff; box-shadow:0 0 16px ${color}; display:flex; align-items:center; justify-content:center;">
                <div style="width:10px; height:10px; border-radius:50%; background:#ffffff; transform:rotate(45deg);"></div>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });

        L.marker([lat, lon], { icon: pinIcon }).addTo(markersLayerRef.current!);
        onSiteSelect({
          id: `RPT-GEO-${Math.floor(1000 + Math.random() * 9000)}`,
          ward: `Karnataka GIS Node`,
          severity: dynamicSeverity,
          score: 95,
          waste: "Detected Plastic & Solid Debris",
          area: 28.5,
          isIllegal: true,
          address: name,
        });

        setSearchStatus(`Precise Coordinates Locked: ${name.split(",")[0]}`);
      } else {
        setSearchStatus(`No match for "${searchQuery}" in Karnataka`);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      setSearchStatus("Geocoding service timeout.");
    } finally {
      setIsSearching(false);
      setTimeout(() => setSearchStatus(null), 4000);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div id="municipal-gis-gmaps" className="w-full h-full bg-slate-900" />

      {/* Floating Search Bar & Region Switcher */}
      <div className="absolute top-4 left-4 z-[400] w-full max-w-md space-y-2">
        <form onSubmit={handleSearch} className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-2 flex items-center gap-2">
          <span className="text-emerald-400 pl-2 text-base">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Bengaluru Ward or Karnataka city (e.g. Koramangala, Mysuru)..."
            className="w-full text-xs font-semibold text-white bg-transparent focus:outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isSearching ? "Scanning..." : "Search"}
          </button>
        </form>

        {searchStatus && (
          <div className="bg-slate-900/95 text-emerald-400 text-xs font-mono border border-emerald-500/30 rounded-xl px-3 py-1.5 shadow-lg truncate">
            ● {searchStatus}
          </div>
        )}

        {/* Quick Fly Controls for Bengaluru & Karnataka */}
        <div className="flex flex-wrap items-center justify-between gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 text-xs">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono pl-1">Fly:</span>
            <button onClick={() => handleRegionFly("bangalore")} className="px-2 py-0.5 rounded bg-slate-800 text-white hover:bg-emerald-600 text-[11px] transition-all">🏙️ Bengaluru</button>
            <button onClick={() => handleRegionFly("karnataka")} className="px-2 py-0.5 rounded bg-slate-800 text-white hover:bg-emerald-600 text-[11px] transition-all">🗺️ Karnataka</button>
            <button onClick={() => handleRegionFly("mysuru")} className="px-2 py-0.5 rounded bg-slate-800 text-white hover:bg-emerald-600 text-[11px] transition-all">🌄 Mysuru</button>
            <button onClick={() => handleRegionFly("coastal")} className="px-2 py-0.5 rounded bg-slate-800 text-white hover:bg-emerald-600 text-[11px] transition-all">🌊 Coastal KA</button>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            ● {KARNATAKA_MUNICIPAL_SITES.length} KA Sites
          </div>
        </div>
      </div>

      {/* Map Layer Switcher */}
      <div className="absolute top-4 right-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl p-1 flex items-center gap-1 text-xs font-bold text-slate-300">
        <button
          onClick={() => handleMapTypeSwitch("roadmap")}
          className={`px-3 py-1.5 rounded-lg transition-all ${mapType === "roadmap" ? "bg-emerald-600 text-white shadow" : "hover:bg-slate-800"}`}
        >
          🗺️ Map
        </button>
        <button
          onClick={() => handleMapTypeSwitch("satellite")}
          className={`px-3 py-1.5 rounded-lg transition-all ${mapType === "satellite" ? "bg-emerald-600 text-white shadow" : "hover:bg-slate-800"}`}
        >
          🛰️ Satellite
        </button>
      </div>
    </div>
  );
}
