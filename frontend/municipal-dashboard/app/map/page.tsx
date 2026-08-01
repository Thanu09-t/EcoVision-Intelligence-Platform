"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";

const MapView = dynamic(() => import("@/components/GISMapView"), { ssr: false, loading: () => (
  <div className="flex items-center justify-center h-full text-slate-500">
    <div className="text-center">
      <div className="text-4xl mb-3">🗺️</div>
      <p>Loading GIS map...</p>
    </div>
  </div>
)});

const FILTERS = [
  { key: "all", label: "All Sites" },
  { key: "critical", label: "🔴 Critical" },
  { key: "high", label: "🟠 High" },
  { key: "medium", label: "🟡 Medium" },
  { key: "low", label: "🟢 Low / Clear" },
];

export default function GISMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedSite, setSelectedSite] = useState<any>(null);

  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden" style={{ height: "100vh" }}>
        {/* Top bar */}
        <div className="flex-shrink-0 glass border-b border-white/5 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <h1 className="text-base font-semibold text-white">🗺️ Pollution GIS Map</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Click any marker for AI analysis details</p>
            </div>
          </div>
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.key ? "bg-green-500 text-black" : "glass text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <MapView filter={filter} onSiteSelect={setSelectedSite} />

          {/* Site detail panel */}
          {selectedSite && (
            <div className="absolute top-4 right-4 z-[999] glass rounded-2xl p-5 border border-white/10 w-72 animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Site #{selectedSite.id}</h3>
                <button onClick={() => setSelectedSite(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Ward</span><span className="text-white">{selectedSite.ward}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Severity</span>
                  <span className={`font-semibold severity-${selectedSite.severity}`}>{selectedSite.severity}</span>
                </div>
                <div className="flex justify-between"><span className="text-slate-400">Score</span><span className="text-white">{selectedSite.score}/100</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Waste Type</span><span className="text-white">{selectedSite.waste}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-white">{selectedSite.status}</span></div>
                {selectedSite.area && <div className="flex justify-between"><span className="text-slate-400">Area</span><span className="text-white">{selectedSite.area} m²</span></div>}
                {selectedSite.isIllegal && (
                  <div className="glass-light rounded-lg p-2 text-red-400 text-xs text-center mt-2">
                    ⚠️ Illegal Dump Detected
                  </div>
                )}
              </div>
              <button className="btn-primary w-full justify-center mt-3 text-xs py-1.5">
                Assign Cleanup Team →
              </button>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[999] glass rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Severity</p>
            {[
              { color: "#22c55e", label: "Very Low / Clean" },
              { color: "#84cc16", label: "Low" },
              { color: "#f59e0b", label: "Medium" },
              { color: "#f97316", label: "High" },
              { color: "#ef4444", label: "Critical" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                <span className="text-xs text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
