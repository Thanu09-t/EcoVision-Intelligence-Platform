"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";

const API_BASE = "http://localhost:8000";

const DEFAULT_MOCK_REPORTS = [
  { id: 101, ward: "Ward 151 (Koramangala)", address: "Koramangala 4th Block, 80ft Road", description: "Large commercial plastic heap dumped near park gate.", status: "assigned", created_at: new Date().toISOString(), prediction: { severity: "critical", pollution_score: 96.8, primary_waste_type: "plastic", garbage_area_m2: 28.4, is_illegal: true } },
  { id: 102, ward: "Ward 80 (Indiranagar)", address: "Indiranagar 100ft Road, 12th Main", description: "Construction debris dumped along footpath.", status: "cleaning_started", created_at: new Date().toISOString(), prediction: { severity: "high", pollution_score: 84.1, primary_waste_type: "construction", garbage_area_m2: 22.5, is_illegal: false } },
  { id: 103, ward: "Ward 111 (Shantala Nagar)", address: "MG Road Metro Station North Gate", description: "Organic food market waste behind metro exit.", status: "under_review", created_at: new Date().toISOString(), prediction: { severity: "medium", pollution_score: 62.0, primary_waste_type: "organic", garbage_area_m2: 8.0, is_illegal: false } },
  { id: 104, ward: "Ward 85 (Whitefield)", address: "Whitefield ITPL Main Gate Junction", description: "Electronic circuit boards & industrial waste.", status: "pending", created_at: new Date().toISOString(), prediction: { severity: "critical", pollution_score: 98.2, primary_waste_type: "electronic", garbage_area_m2: 35.0, is_illegal: true } },
  { id: 105, ward: "Ward 7 (Hebbal)", address: "Hebbal Flyover Service Road", description: "Illegal night dumping on highway service lane.", status: "assigned", created_at: new Date().toISOString(), prediction: { severity: "critical", pollution_score: 98.6, primary_waste_type: "illegal_dump", garbage_area_m2: 45.0, is_illegal: true } },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; next?: string; nextLabel?: string }> = {
  pending:          { label: "Pending",      color: "text-amber-400 bg-amber-400/10 border border-amber-400/30",   next: "under_review",     nextLabel: "Start Review" },
  under_review:     { label: "Reviewing",    color: "text-blue-400 bg-blue-400/10 border border-blue-400/30",     next: "assigned",          nextLabel: "Assign Team" },
  assigned:         { label: "Assigned",     color: "text-purple-400 bg-purple-400/10 border border-purple-400/30", next: "cleaning_started",  nextLabel: "Start Cleanup" },
  cleaning_started: { label: "Cleaning",     color: "text-cyan-400 bg-cyan-400/10 border border-cyan-400/30",     next: "completed",         nextLabel: "Mark Done" },
  completed:        { label: "Done",         color: "text-[#5CE0A5] bg-[#5CE0A5]/10 border border-[#5CE0A5]/30" },
  rejected:         { label: "Rejected",     color: "text-red-400 bg-red-400/10 border border-red-400/30" },
};

const SEVERITY_COLOR: Record<string, string> = {
  very_low: "#22c55e", low: "#84cc16", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
};

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  for (const c of document.cookie.split(";")) {
    const t = c.trim();
    if (t.startsWith(nameEQ)) return decodeURIComponent(t.slice(nameEQ.length));
  }
  return null;
}

const WARDS = [
  "All Wards", "Ward 151 (Koramangala)", "Ward 80 (Indiranagar)", "Ward 111 (Shantala Nagar)",
  "Ward 85 (Whitefield)", "Ward 7 (Hebbal)", "Ward 153 (Jayanagar)", "Ward 192 (Begur)",
];

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState<any[]>(DEFAULT_MOCK_REPORTS);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [wardFilter, setWardFilter] = useState("All Wards");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const token = getCookie("token");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      if (token) {
        const params = new URLSearchParams({ limit: "200", offset: "0" });
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (wardFilter !== "All Wards") params.set("ward", wardFilter);
        if (severityFilter !== "all") params.set("severity", severityFilter);

        const res = await fetch(`${API_BASE}/api/reports?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setReports(data);
            setLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.log("Using local reports fallback.");
    }
    setReports(DEFAULT_MOCK_REPORTS);
    setLoading(false);
  }, [token, statusFilter, wardFilter, severityFilter]);

  useEffect(() => {
    fetchReports();
    setPage(0);
  }, [fetchReports]);

  const updateStatus = async (reportId: number, newStatus: string) => {
    setUpdatingId(reportId);
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    setTimeout(() => setUpdatingId(null), 300);
  };

  const filteredReports = reports.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(r.id).includes(q) ||
      (r.ward || "").toLowerCase().includes(q) ||
      (r.address || "").toLowerCase().includes(q) ||
      (r.description || "").toLowerCase().includes(q)
    );
  });

  const paged = filteredReports.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE);

  const statusCounts: Record<string, number> = { all: reports.length };
  reports.forEach(r => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });

  return (
    <div className="min-h-screen bg-[#041611] text-slate-100 flex font-sans relative overflow-hidden">
      <FloatingParticles />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0 overflow-auto relative z-20">
        <div className="sticky top-0 z-30 bg-[#041611]/90 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <h1 className="text-base font-semibold text-white font-serif">📋 Ward Reports Management</h1>
              <p className="text-xs text-slate-400 hidden sm:block">{reports.length} reports logged · Bengaluru BBMP jurisdiction</p>
            </div>
          </div>
          <MagneticButton onClick={fetchReports}>
            <button className="bg-[#5CE0A5] text-slate-950 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer">↻ Refresh</button>
          </MagneticButton>
        </div>

        <div className="p-6 space-y-4 max-w-5xl">
          {/* Filters Card */}
          <TiltCard className="bg-[#0a241c] rounded-2xl p-4 border border-white/10 space-y-3 shadow-xl">
            {/* Status tabs */}
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "under_review", "assigned", "cleaning_started", "completed", "rejected"].map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(0); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === s ? "bg-[#5CE0A5] text-slate-950 shadow" : "bg-[#041611] text-slate-300 border border-white/10 hover:border-white/20"
                  }`}
                >
                  {s === "all" ? `All (${reports.length})` :
                   `${STATUS_CONFIG[s]?.label || s} (${statusCounts[s] || 0})`}
                </button>
              ))}
            </div>

            {/* Secondary filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={wardFilter}
                onChange={e => { setWardFilter(e.target.value); setPage(0); }}
                className="bg-[#041611] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#5CE0A5]"
              >
                {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>

              <select
                value={severityFilter}
                onChange={e => { setSeverityFilter(e.target.value); setPage(0); }}
                className="bg-[#041611] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#5CE0A5]"
              >
                {["all", "critical", "high", "medium", "low", "very_low"].map(s => (
                  <option key={s} value={s}>{s === "all" ? "All Severities" : s.replace("_", " ")}</option>
                ))}
              </select>

              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search report ID or address..."
                className="bg-[#041611] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#5CE0A5] placeholder:text-slate-500 flex-1 min-w-40"
              />
            </div>
          </TiltCard>

          {/* Reports List */}
          <div className="bg-[#0a241c] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="divide-y divide-white/10">
              {paged.map((r) => {
                const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                const severity = r.prediction?.severity || "critical";
                const score = Math.round(r.prediction?.pollution_score || 94);
                const wasteType = (r.prediction?.primary_waste_type || "plastic").replace("_", " ");
                const area = r.prediction?.garbage_area_m2 || 28.4;
                const isIllegal = r.prediction?.is_illegal;
                const date = r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";

                return (
                  <div key={r.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: SEVERITY_COLOR[severity], boxShadow: `0 0 8px ${SEVERITY_COLOR[severity]}` }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white font-mono">#{r.id}</span>
                          <span className="text-sm font-semibold text-[#5CE0A5]">{r.ward || r.address}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${sc.color}`}>{sc.label}</span>
                          {isIllegal && (
                            <span className="text-xs px-2 py-0.5 rounded-full text-red-400 bg-red-500/10 border border-red-500/30 font-bold">⚠️ Illegal Dump</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-300 mt-1">
                          Waste Class: <span className="text-white font-bold">{wasteType}</span> · Score: <span className="font-bold" style={{ color: SEVERITY_COLOR[severity] }}>{score}/100</span> · Area: {area} m²
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{r.address} · {date}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {sc.next && (
                          <MagneticButton onClick={() => updateStatus(r.id, sc.next!)}>
                            <div className="bg-[#5CE0A5] text-slate-950 font-bold text-xs px-3 py-1 rounded-lg cursor-pointer">
                              {sc.nextLabel}
                            </div>
                          </MagneticButton>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
