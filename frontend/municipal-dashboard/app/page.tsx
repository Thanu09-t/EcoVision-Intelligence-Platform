"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import FloatingParticles from "@/components/FloatingParticles";

const MOCK_LIVE_REPORTS = [
  { id: "RPT-1048", location: "Koramangala 4th Block", type: "Plastic & Packaging", area: "14.2 m²", severity: "Critical", confidence: 96.4, sla: "1h 45m left", status: "assigned", team: "Fleet Alpha (Truck #04)" },
  { id: "RPT-1047", location: "Indiranagar 100ft Rd", type: "Construction Waste", area: "28.5 m²", severity: "High", confidence: 94.1, sla: "3h 10m left", status: "cleaning_started", team: "Fleet Beta (Truck #09)" },
  { id: "RPT-1046", location: "Whitefield Main Rd", type: "Organic & Household", area: "8.0 m²", severity: "Medium", confidence: 91.8, sla: "5h 30m left", status: "under_review", team: "Unassigned" },
  { id: "RPT-1045", location: "Jayanagar 9th Block", type: "Electronic Waste", area: "5.4 m²", severity: "Low", confidence: 97.2, sla: "9h 15m left", status: "pending", team: "Unassigned" },
  { id: "RPT-1044", location: "Hebbal Flyover", type: "Illegal Dump", area: "45.0 m²", severity: "Critical", confidence: 98.6, sla: "0h 40m left", status: "assigned", team: "Fleet Gamma (Truck #12)" },
];

export default function MunicipalDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedWard, setSelectedWard] = useState("All Wards");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reports, setReports] = useState(MOCK_LIVE_REPORTS);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      <FloatingParticles />
      
      {/* Dark Executive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Command Center Body */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-950">
        
        {/* Executive Top Navigation Header */}
        <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h1 className="text-xl font-extrabold text-white tracking-tight">Smart City Command Center</h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bengaluru Central Municipal Corporation • AI Pollution Mapping & Fleet Dispatch
              </p>
            </div>
          </div>

          {/* Action Toolbar & Filters */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            {/* Ward Selector Dropdown */}
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option>All Wards (Central Zone)</option>
              <option>Ward 7 – Indiranagar</option>
              <option>Ward 12 – Koramangala</option>
              <option>Ward 5 – Jayanagar</option>
              <option>Ward 3 – Whitefield</option>
              <option>Ward 9 – Hebbal</option>
            </select>

            {/* Date Range Picker Badge */}
            <div className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2 rounded-xl flex items-center gap-2">
              <span>📅</span>
              <span>May 1 – May 31, 2025</span>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={handleRefresh}
              className={`bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isRefreshing ? "animate-spin" : ""
              }`}
              title="Refresh Real-time Feed"
            >
              🔄 Refresh
            </button>

            {/* Quick Dispatch CTA Button */}
            <button
              onClick={() => setShowDispatchModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/30 transition-all font-bold flex items-center gap-2 cursor-pointer"
            >
              🚛 Dispatch Fleet
            </button>

            {/* Officer Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src="/images/officer.png"
                alt="Officer Avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
              />
              <div className="hidden xl:block text-left">
                <div className="font-extrabold text-white text-xs leading-tight">Officer V. Sharma</div>
                <div className="text-[10px] text-slate-400 font-medium">Chief Sanitation Officer</div>
              </div>
            </div>
          </div>
        </header>

        {/* Command Center Body Container */}
        <div className="p-6 space-y-6">
          
          {/* Executive SLA Performance Ticker Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
                SYSTEM HEALTH 100%
              </span>
              <span>Avg Cleanup Time: <strong className="text-white">4.2 hours</strong> (28% faster than SLA)</span>
            </div>
            <div className="flex items-center gap-6">
              <div>AI Inference Confidence: <strong className="text-emerald-400">94.8%</strong></div>
              <div>Active Fleets: <strong className="text-white">24 / 28 Trucks</strong></div>
              <div>Total Area Scanned: <strong className="text-white">142.5 km²</strong></div>
            </div>
          </div>

          {/* 5 KPI Executive Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Total Reports</span>
                <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">📋</span>
              </div>
              <div className="text-3xl font-black text-white mt-2">1,248</div>
              <div className="text-[11px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <span>▲ +18%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Critical Sites</span>
                <span className="p-1.5 bg-red-500/10 text-red-400 rounded-lg">🚨</span>
              </div>
              <div className="text-3xl font-black text-white mt-2">142</div>
              <div className="text-[11px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <span>▲ +25%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Cleanups Completed</span>
                <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">✅</span>
              </div>
              <div className="text-3xl font-black text-white mt-2">832</div>
              <div className="text-[11px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <span>▲ +22%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Active Vehicles</span>
                <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">🚛</span>
              </div>
              <div className="text-3xl font-black text-white mt-2">24</div>
              <div className="text-[11px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <span>▲ +14%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Eco Points Awarded</span>
                <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">🌱</span>
              </div>
              <div className="text-3xl font-black text-white mt-2">18,450</div>
              <div className="text-[11px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <span>▲ +27%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

          </div>

          {/* Row 1 Grid: GIS Heatmap Command View + Status Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GIS Pollution Heatmap Card (2 Cols) */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-extrabold text-lg text-white">Pollution Heatmap & GIS Intelligence</h2>
                  <p className="text-xs text-slate-400">Real-time geospatial hotspot density powered by PostGIS & Leaflet</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> High Critical
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Medium
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Low Risk
                  </span>
                </div>
              </div>

              {/* Map Canvas Preview */}
              <div className="relative h-72 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src="/images/gis_map.png"
                  alt="GIS Map View"
                  className="w-full h-full object-cover brightness-85"
                />
                
                {/* Thermal Heatmap Hotspot Animations */}
                <div className="absolute top-16 left-28 w-40 h-40 bg-red-500/50 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-28 left-64 w-32 h-32 bg-amber-500/40 rounded-full blur-2xl" />
                <div className="absolute bottom-12 right-36 w-48 h-48 bg-red-600/50 rounded-full blur-3xl animate-pulse" />
                
                {/* Interactive Map Overlay Badges */}
                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs text-white p-2.5 rounded-xl space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    GIS Sensor Layer Active
                  </div>
                  <div className="text-[10px] text-slate-400">142 Critical Sites Geofenced</div>
                </div>

                {/* Map Control Buttons */}
                <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-xl rounded-xl p-1 text-slate-200 flex flex-col text-xs font-bold">
                  <button className="px-2.5 py-1 hover:bg-slate-800 rounded">┼</button>
                  <button className="px-2.5 py-1 hover:bg-slate-800 rounded border-t border-slate-800 font-bold">─</button>
                </div>
              </div>
            </div>

            {/* Reports by Status Donut Chart */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="font-extrabold text-lg text-white mb-1">Reports by Status</h2>
                <p className="text-xs text-slate-400 mb-4">Breakdown across all 1,248 registered issues</p>
              </div>

              <div className="flex flex-col items-center justify-center my-3">
                {/* Conic Donut Chart */}
                <div className="relative w-40 h-40 rounded-full flex items-center justify-center bg-[conic-gradient(#3b82f6_0deg_90deg,#f59e0b_90deg_162deg,#f97316_162deg_216deg,#10b981_216deg_360deg)] shadow-xl">
                  <div className="w-28 h-28 rounded-full bg-slate-900 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Reports</span>
                    <span className="text-2xl font-black text-white">1,248</span>
                  </div>
                </div>
              </div>

              {/* Status Breakdown Legend */}
              <div className="space-y-2 text-xs font-semibold pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Registered
                  </span>
                  <span className="font-bold text-white">25% (312)</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In Progress
                  </span>
                  <span className="font-bold text-white">20% (250)</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Assigned
                  </span>
                  <span className="font-bold text-white">15% (187)</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
                  </span>
                  <span className="font-bold text-white">40% (499)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Live Incident Queue Desk */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-extrabold text-lg text-white">Live Incident Queue & Dispatch Desk</h2>
                <p className="text-xs text-slate-400 mt-0.5">Active garbage reports requiring vehicle dispatch or SLA monitoring</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Filter Status:</span>
                <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-lg text-xs font-semibold border border-slate-700">
                  All Live Complaints ({reports.length})
                </span>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Report ID</th>
                    <th className="py-3 px-4">Location / Ward</th>
                    <th className="py-3 px-4">Waste Classification</th>
                    <th className="py-3 px-4">AI Confidence</th>
                    <th className="py-3 px-4">Severity Level</th>
                    <th className="py-3 px-4">SLA Countdown</th>
                    <th className="py-3 px-4">Assigned Team</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{report.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{report.location}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                          {report.type} ({report.area})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{report.confidence}%</td>
                      <td className="py-3.5 px-4">
                        {report.severity === "Critical" ? (
                          <span className="bg-red-500/10 text-red-400 border border-red-500/20 font-bold px-2.5 py-1 rounded-full text-[10px]">
                            🔴 Critical
                          </span>
                        ) : report.severity === "High" ? (
                          <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold px-2.5 py-1 rounded-full text-[10px]">
                            🟠 High Risk
                          </span>
                        ) : (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2.5 py-1 rounded-full text-[10px]">
                            🟡 Medium
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-amber-400">{report.sla}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">{report.team}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDispatchModal(true);
                          }}
                          className="bg-emerald-600/20 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Dispatch / Action →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>

      {/* Dispatch Fleet Modal Drawer */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <span>🚛</span> Dispatch Sanitation Vehicle
              </h3>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold uppercase">Target Location / Incident</label>
                <input
                  type="text"
                  readOnly
                  value={selectedReport ? `${selectedReport.id} – ${selectedReport.location}` : "Ward 12 (Koramangala 4th Block)"}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl font-semibold mt-1"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold uppercase">Select Fleet / Team</label>
                <select className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl font-semibold mt-1 focus:border-emerald-500">
                  <option>Fleet Alpha (Heavy Tipper Truck #04 - Driver: Ramesh)</option>
                  <option>Fleet Beta (Compact Pickup Truck #09 - Driver: Suresh)</option>
                  <option>Fleet Gamma (Heavy Loader Truck #12 - Driver: Kumar)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold uppercase">VRP Route Optimization</label>
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl mt-1 text-xs">
                  ✓ OR-Tools VRP Solver path calculated: <strong className="text-white">Est. arrival 18 mins</strong> (Fuel saving: 1.4 L).
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Vehicle successfully dispatched! SLA clock updated.");
                  setShowDispatchModal(false);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-emerald-600/30"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
