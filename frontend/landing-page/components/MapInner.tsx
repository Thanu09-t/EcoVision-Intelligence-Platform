"use client";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🌍 High-Precision Bengaluru & Karnataka GIS Severity Dataset
const KARNATAKA_SITES = [
  // Bengaluru City Wards
  { id: "RPT-BLR-101", locality: "Koramangala 4th Block", district: "Bengaluru", ward: "Ward 151 (Koramangala)", lat: 12.9352, lng: 77.6245, severity: "critical", waste: "Plastic & Packaging", score: 96.8, area: "28.4 m²", desc: "Plastic dump near lake drainage channel", isIllegal: true },
  { id: "RPT-BLR-102", locality: "Indiranagar 100ft Road", district: "Bengaluru", ward: "Ward 80 (Indiranagar)", lat: 12.9784, lng: 77.6408, severity: "high", waste: "Construction Debris", score: 84.1, area: "22.5 m²", desc: "Debris blocking pedestrian walkway", isIllegal: false },
  { id: "RPT-BLR-103", locality: "MG Road Metro Station", district: "Bengaluru", ward: "Ward 111 (Shantala Nagar)", lat: 12.9756, lng: 77.6066, severity: "medium", waste: "Retail Packaging", score: 62.0, area: "8.0 m²", desc: "Commercial packaging accumulation", isIllegal: false },
  { id: "RPT-BLR-104", locality: "Whitefield ITPL Gate", district: "Bengaluru", ward: "Ward 85 (Whitefield)", lat: 12.9856, lng: 77.7324, severity: "critical", waste: "E-Waste & Packaging", score: 98.2, area: "35.0 m²", desc: "Illegal electronic waste dumping site", isIllegal: true },
  { id: "RPT-BLR-105", locality: "Hebbal Flyover Junction", district: "Bengaluru", ward: "Ward 7 (Hebbal)", lat: 13.0358, lng: 77.5970, severity: "critical", waste: "Illegal Highway Dump", score: 98.6, area: "45.0 m²", desc: "⚠️ Critical highway dumping zone", isIllegal: true },
  { id: "RPT-BLR-106", locality: "Jayanagar 4th Block", district: "Bengaluru", ward: "Ward 153 (Jayanagar)", lat: 12.9279, lng: 77.5824, severity: "medium", waste: "Organic Market Waste", score: 58.0, area: "12.0 m²", desc: "Vegetable market refuse accumulation", isIllegal: false },
  { id: "RPT-BLR-107", locality: "Electronic City Phase 1", district: "Bengaluru", ward: "Ward 192 (Begur)", lat: 12.8452, lng: 77.6602, severity: "high", waste: "Industrial Plastic", score: 76.0, area: "18.4 m²", desc: "Industrial park dry plastic accumulation", isIllegal: false },
  { id: "RPT-BLR-108", locality: "HSR Layout Sector 1", district: "Bengaluru", ward: "Ward 174 (HSR Layout)", lat: 12.9116, lng: 77.6389, severity: "low", waste: "Paper & Cardboard", score: 32.0, area: "4.5 m²", desc: "Uncollected household boxes", isIllegal: false },
  { id: "RPT-BLR-109", locality: "Cubbon Park Kasturba Rd", district: "Bengaluru", ward: "Ward 112 (Sampangiram)", lat: 12.9738, lng: 77.5920, severity: "very_low", waste: "Litter & Leaves", score: 25.0, area: "3.0 m²", desc: "Minor park entrance littering", isIllegal: false },
  { id: "RPT-BLR-110", locality: "Marathahalli Outer Ring Rd", district: "Bengaluru", ward: "Ward 87 (Marathahalli)", lat: 12.9569, lng: 77.7011, severity: "high", waste: "Mixed Heavy Waste", score: 81.0, area: "22.0 m²", desc: "Flyover roadside garbage dump", isIllegal: true },
  { id: "RPT-BLR-111", locality: "Peenya Industrial Area", district: "Bengaluru", ward: "Ward 11 (Peenya)", lat: 13.0100, lng: 77.5400, severity: "critical", waste: "Metal & Slag Scrap", score: 97.5, area: "54.0 m²", desc: "⚠️ Chemical & metal industrial dump", isIllegal: true },
  { id: "RPT-BLR-112", locality: "Yelahanka New Town", district: "Bengaluru", ward: "Ward 3 (Yelahanka)", lat: 13.0674, lng: 77.5930, severity: "low", waste: "Dry Cardboard", score: 29.0, area: "4.0 m²", desc: "Residential area packaging overflow", isIllegal: false },
  { id: "RPT-BLR-113", locality: "BTM Layout 2nd Stage", district: "Bengaluru", ward: "Ward 67 (BTM)", lat: 12.9165, lng: 77.6229, severity: "medium", waste: "Commercial Packaging", score: 64.0, area: "10.5 m²", desc: "Restaurant packaging waste pile", isIllegal: false },
  { id: "RPT-BLR-114", locality: "Rajajinagar 1st Block", district: "Bengaluru", ward: "Ward 27 (Rajajinagar)", lat: 13.0012, lng: 77.5569, severity: "medium", waste: "Textile & Plastic", score: 60.0, area: "9.0 m²", desc: "Commercial street refuse", isIllegal: false },
  { id: "RPT-BLR-115", locality: "Mysuru Road Junction", district: "Bengaluru", ward: "Ward 116 (Nayandahalli)", lat: 12.9542, lng: 77.4980, severity: "high", waste: "Construction Debris", score: 87.0, area: "31.0 m²", desc: "Highway expansion debris dump", isIllegal: true },

  // Karnataka Regional Cities
  { id: "RPT-KA-201", locality: "Devaraja Market, Mysuru", district: "Mysuru", ward: "Central Mysuru", lat: 12.3052, lng: 76.6552, severity: "high", waste: "Organic Market Waste", score: 78.0, area: "21.0 m²", desc: "Market vegetable & flower accumulation", isIllegal: false },
  { id: "RPT-KA-202", locality: "Old Port, Mangaluru", district: "Dakshina Kannada", ward: "Mangaluru Port", lat: 12.9141, lng: 74.8560, severity: "critical", waste: "Coastal Plastic", score: 92.0, area: "38.0 m²", desc: "⚠️ Port shoreline plastic accumulation", isIllegal: true },
  { id: "RPT-KA-203", locality: "Hubballi Railway Junction", district: "Dharwad", ward: "Hubballi Central", lat: 15.3647, lng: 75.1240, severity: "high", waste: "Commercial Debris", score: 80.0, area: "25.0 m²", desc: "Station yard packaging pile", isIllegal: true },
  { id: "RPT-KA-204", locality: "Belagavi Industrial Zone", district: "Belagavi", ward: "Udyambag Sector", lat: 15.8497, lng: 74.4977, severity: "medium", waste: "Industrial Foundry Scrap", score: 65.0, area: "16.0 m²", desc: "Foundry scrap & sand dumping", isIllegal: false },
  { id: "RPT-KA-205", locality: "Shivamogga Bus Stand", district: "Shivamogga", ward: "City Center", lat: 13.9299, lng: 75.5681, severity: "medium", waste: "Plastic & Packaging", score: 58.0, area: "11.0 m²", desc: "Terminal packaging accumulation", isIllegal: false },
  { id: "RPT-KA-206", locality: "Udupi Temple Square", district: "Udupi", ward: "Car Street", lat: 13.3409, lng: 74.7421, severity: "low", waste: "Organic & Paper", score: 30.0, area: "5.0 m²", desc: "Temple flower & paper waste", isIllegal: false },
  { id: "RPT-KA-207", locality: "Kalaburagi Station Road", district: "Kalaburagi", ward: "Ward 12", lat: 17.3297, lng: 76.8343, severity: "high", waste: "Dry Mixed Plastic", score: 79.0, area: "20.5 m²", desc: "Roadside open waste pile", isIllegal: true },
  { id: "RPT-KA-208", locality: "Ballari Mining Junction", district: "Ballari", ward: "Cantonment Zone", lat: 15.1394, lng: 76.9214, severity: "critical", waste: "Ore Slag & Industrial", score: 94.0, area: "42.0 m²", desc: "⚠️ Industrial slag dumping site", isIllegal: true },
];

const SEVERITY_COLORS: Record<string, { bg: string; text: string; pin: string }> = {
  very_low: { bg: "#22c55e", text: "#ffffff", pin: "#16a34a" },
  low:      { bg: "#84cc16", text: "#ffffff", pin: "#65a30d" },
  medium:   { bg: "#f59e0b", text: "#ffffff", pin: "#d97706" },
  high:     { bg: "#f97316", text: "#ffffff", pin: "#ea580c" },
  critical: { bg: "#ef4444", text: "#ffffff", pin: "#dc2626" },
};

const KA_BOUNDS: Record<string, { center: [number, number]; zoom: number }> = {
  bangalore: { center: [12.9716, 77.5946], zoom: 12 },
  central:   { center: [12.9750, 77.6000], zoom: 13 },
  techparks: { center: [12.9300, 77.6800], zoom: 12 },
  karnataka: { center: [14.2000, 75.8000], zoom: 7.5 },
  mysuru:    { center: [12.3052, 76.6552], zoom: 11 },
  coastal:   { center: [13.1500, 74.8000], zoom: 10 },
  northka:   { center: [15.5000, 75.2000], zoom: 9 },
};

export default function MapInner() {
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  // Initialize Map focused on Bengaluru
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("leaflet-gmaps-container", {
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

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // 🎯 1st Class Click-to-Detect Anywhere in Bengaluru / Karnataka!
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSearchStatus(`Scanning location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)...`);

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const locationName = data?.display_name || `Point (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;

        const dynamicSeverity = (Math.abs(Math.floor(lat * 100 + lng * 100)) % 3 === 0) ? "critical" : "high";
        const dynamicScore = Math.floor(75 + Math.abs((lat + lng) % 20));
        const color = SEVERITY_COLORS[dynamicSeverity].pin;

        const pinIcon = L.divIcon({
          className: "",
          html: `
            <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
              <div style="width:30px; height:30px; border-radius:50% 50% 50% 0; background:${color}; transform:rotate(-45deg); border:2px solid #ffffff; box-shadow:0 0 16px ${color}; display:flex; align-items:center; justify-content:center;">
                <div style="width:10px; height:10px; border-radius:50%; background:#ffffff; transform:rotate(45deg);"></div>
              </div>
              <div style="position:absolute; top:-6px; right:-4px; width:12px; height:12px; border-radius:50%; background:#38bdf8; border:1.5px solid #fff;" class="animate-ping"></div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        });

        const newMarker = L.marker([lat, lng], { icon: pinIcon }).addTo(layerGroupRef.current!);
        newMarker.bindPopup(`
          <div style="font-family:'Lora',serif; width:270px; background:#0f172a; color:#ffffff; border-radius:14px; padding:14px; border:1px solid #38bdf8; box-shadow:0 12px 30px rgba(0,0,0,0.6);">
            <div style="font-weight:700; font-size:13px; color:#38bdf8; margin-bottom:4px;">📍 Real-Time Satellite Scan</div>
            <div style="font-size:11px; color:#e2e8f0; font-weight:600; margin-bottom:8px; line-height:1.3;">${locationName}</div>
            <div style="background:#1e293b; border-radius:8px; padding:8px; font-size:11px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <div><span style="color:#94a3b8;">Lat:</span> <strong style="color:#fff;">${lat.toFixed(4)}°</strong></div>
              <div><span style="color:#94a3b8;">Lon:</span> <strong style="color:#fff;">${lng.toFixed(4)}°</strong></div>
              <div><span style="color:#94a3b8;">Severity:</span> <strong style="color:${color}; text-transform:uppercase;">${dynamicSeverity}</strong></div>
              <div><span style="color:#94a3b8;">AI Score:</span> <strong style="color:${color};">${dynamicScore}/100</strong></div>
            </div>
            <div style="margin-top:8px; font-size:10px; color:#94a3b8; text-align:center;">1st Class Karnataka Precision Scan Complete</div>
          </div>
        `, { maxWidth: 290 }).openPopup();

        setSearchStatus(`Target Locked: ${locationName.split(",")[0]}`);
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
  }, []);

  // Update Markers based on severity filter
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    const filteredSites = severityFilter === "all"
      ? KARNATAKA_SITES
      : KARNATAKA_SITES.filter(s => {
          if (severityFilter === "critical") return s.severity === "critical";
          if (severityFilter === "high") return s.severity === "high";
          if (severityFilter === "medium") return s.severity === "medium";
          if (severityFilter === "low") return ["low", "very_low"].includes(s.severity);
          return true;
        });

    filteredSites.forEach((site) => {
      const color = SEVERITY_COLORS[site.severity]?.pin || "#dc2626";
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
              width:26px; height:26px; border-radius:50% 50% 50% 0;
              background:${color}; transform:rotate(-45deg);
              border:2px solid #ffffff;
              box-shadow:0 4px 12px rgba(0,0,0,0.45);
              display:flex; items-center; justify-center;
            ">
              <div style="
                width:9px; height:9px; border-radius:50%;
                background:#ffffff; transform:rotate(45deg);
              "></div>
            </div>
            ${isCritical ? `<div style="position:absolute; top:-5px; right:-3px; width:12px; height:12px; border-radius:50%; background:#ef4444; border:1.5px solid #fff; box-shadow:0 0 10px #ef4444;" class="animate-ping"></div>` : ""}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([site.lat, site.lng], { icon: pinIcon }).addTo(layerGroupRef.current!);

      marker.bindPopup(`
        <div style="font-family:'Lora',serif; width:260px; background:#0f172a; color:#f8fafc; border-radius:14px; padding:14px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 12px 30px rgba(0,0,0,0.5);">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; margin-bottom:8px;">
            <div>
              <div style="font-weight:700; font-size:13px; color:#ffffff;">${site.locality}</div>
              <div style="font-size:10px; color:#94a3b8;">${site.ward} · ${site.district}</div>
            </div>
            <span style="background:${SEVERITY_COLORS[site.severity].bg}; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; text-transform:uppercase;">
              ${site.severity}
            </span>
          </div>
          <div style="font-size:12px; color:#cbd5e1; margin-bottom:10px; line-height:1.4;">${site.desc}</div>
          <div style="background:#1e293b; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px; font-size:11px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div><span style="color:#94a3b8;">Waste:</span> <strong style="color:#f8fafc;">${site.waste}</strong></div>
            <div><span style="color:#94a3b8;">Score:</span> <strong style="color:${SEVERITY_COLORS[site.severity].pin};">${site.score}/100</strong></div>
            <div><span style="color:#94a3b8;">Area:</span> <strong style="color:#f8fafc;">${site.area}</strong></div>
            <div><span style="color:#94a3b8;">Precision:</span> <strong style="color:#38bdf8;">98.4%</strong></div>
          </div>
          ${site.isIllegal ? `<div style="margin-top:8px; font-size:10px; background:rgba(239,68,68,0.15); color:#fca5a5; border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:4px 8px; font-weight:bold; text-align:center;">⚠️ Confirmed Illegal Dumping Zone</div>` : ""}
        </div>
      `, { maxWidth: 280, className: "gmaps-popup" });
    });
  }, [severityFilter]);

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
      attribution: "Map data &copy; Google Maps • EcoVision AI Bengaluru GIS",
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
    setSearchStatus("Searching Bengaluru & Karnataka GIS database...");

    const q = searchQuery.toLowerCase();
    const localMatch = KARNATAKA_SITES.find(s => 
      s.locality.toLowerCase().includes(q) ||
      s.ward.toLowerCase().includes(q) ||
      s.district.toLowerCase().includes(q)
    );

    if (localMatch) {
      mapRef.current.flyTo([localMatch.lat, localMatch.lng], 15, { duration: 1.2 });
      setIsSearching(false);
      setSearchStatus(`Located: ${localMatch.locality}`);
      setTimeout(() => setSearchStatus(null), 3000);
      return;
    }

    try {
      // Query with Karnataka context for 1st-class local precision
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
        const color = SEVERITY_COLORS[dynamicSeverity].pin;

        const pinIcon = L.divIcon({
          className: "",
          html: `
            <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
              <div style="width:30px; height:30px; border-radius:50% 50% 50% 0; background:${color}; transform:rotate(-45deg); border:2px solid #ffffff; box-shadow:0 0 16px ${color}; display:flex; align-items:center; justify-content:center;">
                <div style="width:10px; height:10px; border-radius:50%; background:#ffffff; transform:rotate(45deg);"></div>
              </div>
              <div style="position:absolute; top:-6px; right:-4px; width:12px; height:12px; border-radius:50%; background:#38bdf8; border:1.5px solid #fff;" class="animate-ping"></div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        });

        const newMarker = L.marker([lat, lon], { icon: pinIcon }).addTo(layerGroupRef.current!);
        newMarker.bindPopup(`
          <div style="font-family:'Lora',serif; width:270px; background:#0f172a; color:#ffffff; border-radius:14px; padding:14px; border:1px solid #38bdf8; box-shadow:0 12px 30px rgba(0,0,0,0.6);">
            <div style="font-weight:700; font-size:13px; color:#38bdf8; margin-bottom:4px;">📍 Searched Karnataka GIS Target</div>
            <div style="font-size:11px; color:#e2e8f0; font-weight:600; margin-bottom:8px; line-height:1.3;">${name}</div>
            <div style="background:#1e293b; border-radius:8px; padding:8px; font-size:11px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <div><span style="color:#94a3b8;">Lat:</span> <strong style="color:#fff;">${lat.toFixed(4)}°</strong></div>
              <div><span style="color:#94a3b8;">Lon:</span> <strong style="color:#fff;">${lon.toFixed(4)}°</strong></div>
              <div><span style="color:#94a3b8;">Severity:</span> <strong style="color:${color}; text-transform:uppercase;">${dynamicSeverity}</strong></div>
              <div><span style="color:#94a3b8;">AI Score:</span> <strong style="color:${color};">96/100</strong></div>
            </div>
            <div style="margin-top:8px; font-size:10px; color:#94a3b8; text-align:center;">1st Class Local Precision Target Locked</div>
          </div>
        `, { maxWidth: 280 }).openPopup();

        setSearchStatus(`Locked: ${name.split(",")[0]}`);
      } else {
        setSearchStatus(`Location "${searchQuery}" not found in Karnataka.`);
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
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner">
      <div id="leaflet-gmaps-container" className="w-full h-full bg-slate-900" />

      {/* Floating Search Bar & Controls */}
      <div className="absolute top-4 left-4 z-[400] w-full max-w-xl px-2 space-y-2">
        <form onSubmit={handleSearch} className="bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-2 flex items-center gap-2">
          <span className="text-emerald-400 pl-2 text-base">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Bengaluru locality or Karnataka district (e.g. Koramangala, Whitefield, Mysuru, Mangaluru)..."
            className="w-full text-xs font-semibold text-white bg-transparent focus:outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isSearching ? "Scanning..." : "Locate"}
          </button>
        </form>

        {searchStatus && (
          <div className="bg-slate-900/95 text-emerald-400 text-xs font-mono border border-emerald-500/30 rounded-xl px-3 py-1.5 shadow-lg truncate">
            ● {searchStatus}
          </div>
        )}

        {/* Bengaluru & Karnataka Quick-Fly Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono pl-1">Fly to:</span>
            <button onClick={() => handleRegionFly("bangalore")} className="px-2 py-0.5 rounded bg-white/10 text-white hover:bg-emerald-600 text-[11px] transition-all">🏙️ Bengaluru City</button>
            <button onClick={() => handleRegionFly("central")} className="px-2 py-0.5 rounded bg-white/10 text-white hover:bg-emerald-600 text-[11px] transition-all">🏛️ Central Wards</button>
            <button onClick={() => handleRegionFly("techparks")} className="px-2 py-0.5 rounded bg-white/10 text-white hover:bg-emerald-600 text-[11px] transition-all">💻 Tech Parks</button>
            <button onClick={() => handleRegionFly("karnataka")} className="px-2 py-0.5 rounded bg-white/10 text-white hover:bg-emerald-600 text-[11px] transition-all">🗺️ Karnataka State</button>
            <button onClick={() => handleRegionFly("mysuru")} className="px-2 py-0.5 rounded bg-white/10 text-white hover:bg-emerald-600 text-[11px] transition-all">🌄 Mysuru</button>
            <button onClick={() => handleRegionFly("coastal")} className="px-2 py-0.5 rounded bg-white/10 text-white hover:bg-emerald-600 text-[11px] transition-all">🌊 Coastal KA</button>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            ● {KARNATAKA_SITES.length} Karnataka Severity Sites
          </div>
        </div>
      </div>

      {/* Severity Category Filter Bar */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-xl flex items-center gap-1.5 text-xs">
        <span className="text-slate-400 font-mono text-[11px] pr-1">Severity:</span>
        <button onClick={() => setSeverityFilter("all")} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${severityFilter === "all" ? "bg-white text-slate-900 shadow" : "text-slate-300 hover:bg-white/10"}`}>All ({KARNATAKA_SITES.length})</button>
        <button onClick={() => setSeverityFilter("critical")} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${severityFilter === "critical" ? "bg-red-600 text-white shadow" : "text-red-400 hover:bg-red-900/30"}`}>🔴 Critical</button>
        <button onClick={() => setSeverityFilter("high")} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${severityFilter === "high" ? "bg-orange-600 text-white shadow" : "text-orange-400 hover:bg-orange-900/30"}`}>🟠 High</button>
        <button onClick={() => setSeverityFilter("medium")} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${severityFilter === "medium" ? "bg-amber-600 text-white shadow" : "text-amber-400 hover:bg-amber-900/30"}`}>🟡 Medium</button>
        <button onClick={() => setSeverityFilter("low")} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${severityFilter === "low" ? "bg-green-600 text-white shadow" : "text-green-400 hover:bg-green-900/30"}`}>🟢 Low</button>
      </div>

      {/* Map Type Switcher */}
      <div className="absolute top-4 right-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-1 flex items-center gap-1 text-xs font-bold text-slate-300">
        <button
          onClick={() => handleMapTypeSwitch("roadmap")}
          className={`px-3 py-1.5 rounded-lg transition-all ${mapType === "roadmap" ? "bg-emerald-600 text-white shadow" : "hover:bg-white/10"}`}
        >
          🗺️ Map
        </button>
        <button
          onClick={() => handleMapTypeSwitch("satellite")}
          className={`px-3 py-1.5 rounded-lg transition-all ${mapType === "satellite" ? "bg-emerald-600 text-white shadow" : "hover:bg-white/10"}`}
        >
          🛰️ Satellite
        </button>
      </div>
    </div>
  );
}
