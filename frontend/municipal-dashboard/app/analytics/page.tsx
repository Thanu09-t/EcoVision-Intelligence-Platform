"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";

const API_BASE = "http://localhost:8000";

const DEFAULT_MONTHLY = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [{ data: [42, 68, 95, 120, 154, 198] }],
};

const DEFAULT_WASTE_TYPES = {
  labels: ["Plastic & Packaging", "Construction Debris", "Organic Market", "Electronic Waste", "Biomedical"],
  datasets: [
    {
      data: [48, 22, 16, 9, 5],
      colors: ["#5CE0A5", "#D6A84A", "#38BDF8", "#ef4444", "#a855f7"],
    },
  ],
};

const DEFAULT_SEVERITY_TREND = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"],
  datasets: [{ data: [88, 84, 79, 74, 70, 65, 62, 58] }],
};

const DEFAULT_WARD_RANKINGS = [
  { ward: "Ward 151 (Koramangala)", avg_score: 96, total_reports: 28, color: "#ef4444" },
  { ward: "Ward 85 (Whitefield)", avg_score: 94, total_reports: 24, color: "#ef4444" },
  { ward: "Ward 7 (Hebbal)", avg_score: 88, total_reports: 19, color: "#f97316" },
  { ward: "Ward 80 (Indiranagar)", avg_score: 82, total_reports: 15, color: "#f97316" },
  { ward: "Ward 111 (Shantala Nagar)", avg_score: 64, total_reports: 10, color: "#f59e0b" },
  { ward: "Ward 153 (Jayanagar)", avg_score: 52, total_reports: 8, color: "#84cc16" },
  { ward: "Ward 174 (HSR Layout)", avg_score: 32, total_reports: 4, color: "#5CE0A5" },
];

const DEFAULT_LEADERBOARD = [
  { user_id: 1, rank: 1, full_name: "Rohan Sharma", ward: "Ward 151 (Koramangala)", total_reports: 14, eco_points: 1450, badge: "🥇 Eco Champion" },
  { user_id: 2, rank: 2, full_name: "Priya Nair", ward: "Ward 80 (Indiranagar)", total_reports: 11, eco_points: 1120, badge: "🥈 Green Guardian" },
  { user_id: 3, rank: 3, full_name: "Anil Kumar", ward: "Ward 85 (Whitefield)", total_reports: 9, eco_points: 940, badge: "🥉 Earth Sentinel" },
  { user_id: 4, rank: 4, full_name: "Deepa Rao", ward: "Ward 7 (Hebbal)", total_reports: 7, eco_points: 720, badge: "🌱 Active Reporter" },
];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  for (const c of document.cookie.split(";")) {
    const t = c.trim();
    if (t.startsWith(nameEQ)) return decodeURIComponent(t.slice(nameEQ.length));
  }
  return null;
}

function BarChart({ labels, data, color = "#5CE0A5" }: { labels: string[]; data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2 h-44 pt-4">
      {labels.map((label, i) => {
        const pct = (data[i] / max) * 100;
        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-xs font-mono text-[#5CE0A5] font-bold">{data[i]}</span>
            <div
              className="w-full rounded-t-xl transition-all duration-500 hover:scale-105 cursor-pointer shadow-lg"
              style={{ height: `${Math.max(pct, 6)}%`, backgroundColor: color, boxShadow: `0 0 12px ${color}40` }}
              title={`${label}: ${data[i]} reports`}
            />
            <span className="text-[11px] text-slate-400 font-mono truncate w-full text-center">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ labels, data, colors }: { labels: string[]; data: number[]; colors: string[] }) {
  const total = data.reduce((a, b) => a + b, 0) || 1;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-36 h-36 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {data.map((val, i) => {
            const pct = (val / total) * 100;
            const el = (
              <circle
                key={i}
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke={colors[i] || "#5CE0A5"}
                strokeWidth="3.4"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={-offset}
                className="transition-all duration-500"
              />
            );
            offset += pct;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-white font-mono">{total}%</div>
            <div className="text-[10px] uppercase font-mono text-[#5CE0A5]">Total Split</div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {labels.slice(0, 5).map((label, i) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i] || "#5CE0A5" }} />
              <span className="text-slate-300 font-medium">{label}</span>
            </div>
            <span className="font-mono font-bold text-white">{data[i]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ labels, data, color = "#D6A84A" }: { labels: string[]; data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 380 + 10;
    const y = 110 - (v / max) * 100;
    return `${x},${y}`;
  }).join(" ");
  const areaPath = `M10,110 L${data.map((v, i) => {
    const x = (i / (data.length - 1)) * 380 + 10;
    const y = 110 - (v / max) * 100;
    return `${x},${y}`;
  }).join(" L")} L390,110 Z`;

  return (
    <div className="relative h-44 pt-2">
      <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#lineGrad)" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * 380 + 10;
          const y = 110 - (v / max) * 100;
          return <circle key={i} cx={x} cy={y} r="5" fill={color} stroke="#041611" strokeWidth="2.5" />;
        })}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] font-mono text-slate-400">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [monthly, setMonthly] = useState<any>(DEFAULT_MONTHLY);
  const [wasteTypes, setWasteTypes] = useState<any>(DEFAULT_WASTE_TYPES);
  const [severityTrend, setSeverityTrend] = useState<any>(DEFAULT_SEVERITY_TREND);
  const [wardRankings, setWardRankings] = useState<any[]>(DEFAULT_WARD_RANKINGS);
  const [leaderboard, setLeaderboard] = useState<any[]>(DEFAULT_LEADERBOARD);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getCookie("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE}/api/analytics/charts/monthly`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/api/analytics/charts/waste-types`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/api/analytics/charts/severity-trend`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/api/analytics/ward-rankings?limit=10`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/api/analytics/leaderboard?limit=10`, { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([m, w, s, wr, lb]) => {
      if (m && m.labels) setMonthly(m);
      if (w && w.labels) setWasteTypes(w);
      if (s && s.labels) setSeverityTrend(s);
      if (wr && wr.length > 0) setWardRankings(wr);
      if (lb && lb.length > 0) setLeaderboard(lb);
    }).catch(err => console.log("Using local analytics dataset:", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#041611] text-slate-100 flex font-sans relative overflow-hidden">
      <FloatingParticles />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0 overflow-auto relative z-20">
        <div className="sticky top-0 z-30 bg-[#041611]/90 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <h1 className="text-base font-semibold text-white font-serif">📊 Smart City Pollution Analytics</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Real-time pollution trends, waste distribution, and ward rankings for Bengaluru BBMP</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#5CE0A5]/10 border border-[#5CE0A5]/30 text-[#5CE0A5] text-xs font-mono">
            ● PostGIS & AI Analytics Active
          </div>
        </div>

        <div className="p-6 space-y-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Monthly Reports Bar Chart */}
            <TiltCard className="bg-[#0a241c] rounded-2xl p-5 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white font-serif flex items-center gap-2">
                  <span>📈 Monthly Reports Submitted</span>
                </h3>
                <span className="text-xs font-mono text-[#5CE0A5] bg-[#5CE0A5]/10 px-2 py-0.5 rounded border border-[#5CE0A5]/30">+28% YoY</span>
              </div>
              <BarChart labels={monthly.labels} data={monthly.datasets[0]?.data || []} color="#5CE0A5" />
            </TiltCard>

            {/* Waste Type Distribution Donut */}
            <TiltCard className="bg-[#0a241c] rounded-2xl p-5 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white font-serif">♻️ Waste Type Classification</h3>
                <span className="text-xs font-mono text-[#D6A84A] bg-[#D6A84A]/10 px-2 py-0.5 rounded border border-[#D6A84A]/30">YOLOv11 Inference</span>
              </div>
              <DonutChart
                labels={wasteTypes.labels || []}
                data={wasteTypes.datasets?.[0]?.data || []}
                colors={wasteTypes.datasets?.[0]?.colors || ["#5CE0A5", "#D6A84A", "#38BDF8", "#ef4444", "#a855f7"]}
              />
            </TiltCard>

            {/* Severity Trend Line Chart */}
            <TiltCard className="bg-[#0a241c] rounded-2xl p-5 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white font-serif">📉 Avg Pollution Score Reduction Trend</h3>
                <span className="text-xs font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/30">8-Week SLA Impact</span>
              </div>
              <LineChart labels={severityTrend.labels} data={severityTrend.datasets[0]?.data || []} color="#D6A84A" />
            </TiltCard>

            {/* Ward Pollution Heatmap Rankings */}
            <TiltCard className="bg-[#0a241c] rounded-2xl p-5 border border-white/10 shadow-xl">
              <h3 className="font-semibold text-white mb-4 font-serif">🏙️ Bengaluru Ward Pollution Heatmap</h3>
              <div className="space-y-2.5">
                {wardRankings.map((w) => (
                  <div key={w.ward} className="flex items-center gap-3">
                    <div className="w-36 text-xs font-bold text-slate-200 text-right flex-shrink-0 truncate">{w.ward}</div>
                    <div className="flex-1 bg-[#041611] rounded-full h-5 overflow-hidden border border-white/10">
                      <div
                        className="h-5 rounded-full flex items-center justify-end pr-2 text-xs text-slate-950 font-bold transition-all duration-500"
                        style={{ width: `${w.avg_score}%`, backgroundColor: w.color }}
                      >
                        {w.avg_score}
                      </div>
                    </div>
                    <div className="w-16 text-xs font-mono text-slate-400 text-right">{w.total_reports} sites</div>
                  </div>
                ))}
              </div>
            </TiltCard>
          </div>

          {/* Citizen Leaderboard */}
          <TiltCard className="bg-[#0a241c] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white font-serif">🏆 Top Eco Citizens Leaderboard</h3>
                <p className="text-xs text-slate-400 mt-0.5">Citizens ranked by verified eco-points earned through garbage reporting</p>
              </div>
              <span className="text-xs font-mono text-[#5CE0A5] bg-[#5CE0A5]/10 px-3 py-1 rounded-full border border-[#5CE0A5]/30">
                Eco Rewards Active
              </span>
            </div>

            <div className="divide-y divide-white/10">
              {leaderboard.map((entry) => (
                <div key={entry.user_id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                    entry.rank === 1 ? "bg-[#D6A84A] text-slate-950 shadow-lg shadow-[#D6A84A]/30" :
                    entry.rank === 2 ? "bg-slate-300 text-slate-950" :
                    entry.rank === 3 ? "bg-amber-600 text-slate-950" :
                    "bg-white/10 text-slate-300"
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{entry.full_name}</div>
                    <div className="text-xs text-slate-400">{entry.ward} · {entry.total_reports} verified reports · <span className="text-[#5CE0A5] font-bold">{entry.badge}</span></div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[#5CE0A5] font-extrabold font-mono text-base">{entry.eco_points.toLocaleString()}</div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Eco Points</div>
                  </div>
                </div>
              ))}
            </div>
          </TiltCard>
        </div>
      </main>
    </div>
  );
}
