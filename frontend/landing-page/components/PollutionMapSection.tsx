"use client";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-[#AEB9B5] bg-[#081B16]">
      <div className="text-center space-y-2">
        <div className="text-3xl animate-bounce">🗺️</div>
        <p className="font-mono text-white text-xs">Loading PostGIS Ward Coordinates...</p>
      </div>
    </div>
  ),
});

const SEVERITY_LEGEND = [
  { color: "#5CE0A5", label: "Clean / Cleared" },
  { color: "#D6A84A", label: "Low Severity" },
  { color: "#f59e0b", label: "Moderate" },
  { color: "#f97316", label: "High Severity" },
  { color: "#ef4444", label: "Critical Dump" },
];

export default function PollutionMapSection() {
  return (
    <section id="map" className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto space-y-8 text-left">
      {/* Section Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#10251F] border border-white/10 px-3 py-1 rounded-md text-xs font-mono text-[#5CE0A5]">
          <span>● Geospatial Intelligence</span>
        </div>
        <h2 className="text-major-section font-heading text-white">
          Real-time incident heatmap across 198 wards.
        </h2>
        <p className="text-body text-[#AEB9B5]">
          PostGIS 3.4 spatial indexes render exact lat/long coordinates of reported garbage sites.
        </p>
      </div>

      {/* Municipal Dashboard Interface Wrapper */}
      <div className="surface-card overflow-hidden border border-white/10 bg-[#10251F]">
        
        {/* Top Control Bar */}
        <div className="p-4 bg-[#081B16] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search ward or location..."
              className="input-field w-48 sm:w-64"
              readOnly
            />
            <select className="bg-[#10251F] border border-white/10 text-white rounded-lg px-3 py-2 outline-none">
              <option>All 198 Wards</option>
              <option>Ward 76 (Richmond Town)</option>
              <option>Ward 68 (Koramangala)</option>
              <option>Ward 150 (Bellandur)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-[#AEB9B5]">
            <span className="pulse-mint" />
            <span>40+ Active Hotspot Markers</span>
          </div>
        </div>

        {/* Map View & Drawer Overlay */}
        <div className="relative h-[500px] w-full bg-[#081B16]">
          <MapComponent />

          {/* Left Floating Legend Drawer */}
          <div className="absolute top-4 left-4 z-[999] surface-card p-4 bg-[#081B16]/95 max-w-xs text-xs space-y-2">
            <div className="font-mono font-bold text-white uppercase tracking-wider text-[11px] mb-1">
              Severity Categories
            </div>
            <div className="space-y-1.5">
              {SEVERITY_LEGEND.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#AEB9B5]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Floating Incident Drawer */}
          <div className="absolute top-4 right-4 z-[999] hidden md:block surface-card p-4 bg-[#081B16]/95 text-xs text-white space-y-2 border border-white/10">
            <div className="font-mono font-bold text-[#D6A84A]">Ward 76 Live Incident</div>
            <div className="flex justify-between gap-6 text-[#AEB9B5]">
              <span>Active Reports:</span>
              <span className="text-white font-mono">14</span>
            </div>
            <div className="flex justify-between gap-6 text-[#AEB9B5]">
              <span>Assigned Fleet:</span>
              <span className="text-[#5CE0A5] font-mono">3 Trucks</span>
            </div>
            <div className="flex justify-between gap-6 text-[#AEB9B5]">
              <span>SLA Response:</span>
              <span className="text-white font-mono">2.4 Hours</span>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="p-3 bg-[#081B16] border-t border-white/[0.08] flex items-center justify-between text-xs text-[#AEB9B5] font-mono px-6">
          <span>PostGIS 3.4 Spatial Indexing • Leaflet Vector Layer</span>
          <span className="text-[#5CE0A5]">Synced: Just now</span>
        </div>
      </div>
    </section>
  );
}
