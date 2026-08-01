"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

const MapView = dynamic(() => import("./MapViewInner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-slate-500 flex-col gap-3">
      <div className="text-4xl animate-spin" style={{ animationDuration: "2s" }}>🗺️</div>
      <p className="text-sm">Loading global pollution map...</p>
    </div>
  ),
});

const LEGEND = [
  { color: "#22c55e", label: "Very Low (0–20)", range: "Very Low" },
  { color: "#84cc16", label: "Low (21–40)", range: "Low" },
  { color: "#f59e0b", label: "Medium (41–60)", range: "Medium" },
  { color: "#f97316", label: "High (61–80)", range: "High" },
  { color: "#ef4444", label: "Critical (81–100)", range: "Critical" },
];

const REGION_STATS = [
  { name: "Bengaluru Central", sites: 15, critical: 4, high: 5 },
  { name: "Tech Parks (Whitefield / E-City)", sites: 8, critical: 3, high: 3 },
  { name: "Mysuru & South KA", sites: 6, critical: 1, high: 3 },
  { name: "Coastal KA (Mangaluru / Udupi)", sites: 5, critical: 2, high: 2 },
  { name: "North KA (Hubballi / Belagavi)", sites: 6, critical: 2, high: 3 },
];

export default function CitizenMapPage() {
  const [selected, setSelected] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="glass border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors">←</Link>
        <div>
          <h1 className="text-base font-semibold text-white">🗺️ Global Pollution Map</h1>
          <p className="text-xs text-slate-400">Worldwide High / Mid / Low severity sites · Click markers for details</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="glass text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 transition-all"
          >
            📊 Stats
          </button>
          <Link href="/report/new" className="btn-primary text-sm py-1.5">
            + Report
          </Link>
        </div>
      </div>

      <div className="flex-1 relative" style={{ minHeight: "calc(100vh - 56px)" }}>
        <MapView onSelect={setSelected} />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[999] glass rounded-xl p-3 border border-white/10">
          <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Severity Range</p>
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: l.color, boxShadow: `0 0 5px ${l.color}` }} />
              <span className="text-xs text-slate-300">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Region Stats Panel */}
        {showStats && (
          <div className="absolute top-4 left-4 z-[999] glass rounded-2xl p-4 border border-white/10 w-56 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm">📊 Global Overview</h3>
              <button onClick={() => setShowStats(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            <div className="space-y-2">
              {REGION_STATS.map((r) => (
                <div key={r.name} className="glass-light rounded-lg p-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-white">{r.name}</span>
                    <span className="text-xs text-slate-400">{r.sites} sites</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-xs text-red-400">🔴 {r.critical} critical</span>
                    <span className="text-xs text-orange-400">🟠 {r.high} high</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2 border-t border-white/5 pt-2">Zoom map to explore regions</p>
          </div>
        )}

        {/* Selected site panel */}
        {selected && (
          <div className="absolute top-4 right-4 z-[999] glass rounded-2xl p-4 border border-white/10 w-64">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm">Site Details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Location</span><span className="text-white text-right max-w-[130px] truncate">{selected.ward}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Waste</span><span className="text-white capitalize">{selected.waste}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Score</span><span className="text-white font-bold">{selected.score}/100</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Severity</span>
                <span className={`capitalize px-1.5 py-0.5 rounded text-xs font-medium ${
                  selected.severity === "critical" ? "text-red-400 bg-red-400/10" :
                  selected.severity === "high" ? "text-orange-400 bg-orange-400/10" :
                  selected.severity === "medium" ? "text-amber-400 bg-amber-400/10" :
                  "text-green-400 bg-green-400/10"
                }`}>{selected.severity}</span>
              </div>
              <div className="flex justify-between"><span className="text-slate-400">Status</span>
                <span className={`capitalize px-1.5 py-0.5 rounded text-xs ${
                  selected.status === "completed" ? "text-green-400 bg-green-400/10" :
                  selected.status === "assigned" ? "text-purple-400 bg-purple-400/10" :
                  "text-amber-400 bg-amber-400/10"
                }`}>{selected.status.replace("_", " ")}</span>
              </div>
            </div>
            <Link href="/report/new" className="btn-primary w-full justify-center mt-3 text-xs py-1.5">
              Report Similar →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
