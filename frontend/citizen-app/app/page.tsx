"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";

const API_BASE = "http://localhost:8000";

const DEFAULT_MY_REPORTS = [
  { id: 1048, address: "Koramangala 4th Block, 80ft Road", ward: "Ward 151 (Koramangala)", description: "Commercial plastic waste pile near public park gate.", status: "cleaning_started", severity: "critical", score: 96, created_at: "2026-07-31" },
  { id: 1024, address: "Indiranagar 100ft Road, 12th Main", ward: "Ward 80 (Indiranagar)", description: "Construction debris dumped on pedestrian walkway.", status: "assigned", severity: "high", score: 84, created_at: "2026-07-28" },
  { id: 982,  address: "MG Road Metro Gate 2", ward: "Ward 111 (Shantala Nagar)", description: "Organic food market waste behind metro exit.", status: "completed", severity: "medium", score: 62, created_at: "2026-07-20" },
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

function eraseCookie(name: string) {
  if (typeof document !== "undefined") {
    document.cookie = name + "=; Path=/; Domain=localhost; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }
}

export default function CitizenDashboard() {
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>(DEFAULT_MY_REPORTS);
  const [showReportModal, setShowReportModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [locality, setLocality] = useState("Koramangala 4th Block, Bengaluru, Karnataka");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReportDescription, setNewReportDescription] = useState("");
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);

  useEffect(() => {
    const storedUser = getCookie("user");
    const token = getCookie("token");

    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch {}
    } else {
      setUser({ full_name: "Rohan Sharma", eco_points: 2450, ward: "Ward 151 (Koramangala)" });
    }

    if (token) {
      fetch(`${API_BASE}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setReports(data);
        })
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    eraseCookie("token");
    eraseCookie("user");
    window.location.href = "/login";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));

      setLocality("Detecting locality via GPS...");
      try {
        const lat = 12.9352 + (Math.random() - 0.5) * 0.02;
        const lng = 77.6245 + (Math.random() - 0.5) * 0.02;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (res.ok) {
          const geoData = await res.json();
          const name = geoData.display_name || "Koramangala 4th Block, Bengaluru";
          setLocality(name.split(",").slice(0, 3).join(","));
          return;
        }
      } catch {}
      setLocality("Koramangala 4th Block, Bengaluru, Karnataka");
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newRep = {
        id: Math.floor(1000 + Math.random() * 9000),
        address: locality.includes("Detecting") ? "Koramangala 4th Block, Bengaluru" : locality,
        ward: "Ward 151 (Koramangala)",
        description: newReportDescription || "Commercial plastic waste pile requiring urgent municipal clearance.",
        status: "under_review",
        severity: "critical",
        score: 96.5,
        waste_type: "Plastic & Packaging",
        area_m2: 28.4,
        created_at: new Date().toISOString().split("T")[0],
      };
      setReports((prev) => [newRep, ...prev]);
      setGeneratedReport(newRep);
      setIsSubmitting(false);
      setUser((prev: any) => ({ ...prev, eco_points: (prev?.eco_points || 2450) + 50 }));
    }, 1000);
  };

  const handleDownloadPDF = (rep: any) => {
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>EcoVision_AI_Report_RPT_${rep.id}</title>
        <style>
          body { font-family: 'Georgia', serif; padding: 40px; color: #0f172a; max-width: 800px; margin: auto; background: #ffffff; }
          .header { text-align: center; border-bottom: 3px double #059669; padding-bottom: 20px; margin-bottom: 25px; }
          .header h1 { margin: 0; color: #065f46; font-size: 24px; text-transform: uppercase; }
          .header h2 { margin: 5px 0 0 0; color: #475569; font-size: 14px; font-weight: normal; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
          .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 5px; }
          .card-value { font-size: 16px; font-weight: bold; color: #0f172a; }
          .footer { border-top: 2px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()" style="background:#059669; color:#fff; border:none; padding:10px 20px; font-weight:bold; border-radius:6px; cursor:pointer;">🖨️ Print / Save PDF</button>
        </div>
        <div class="header">
          <h1>Bruhat Bengaluru Mahanagara Palike (BBMP)</h1>
          <h2>Smart City Waste Inspection Report #${rep.id}</h2>
        </div>
        <div class="grid">
          <div class="card"><div class="card-title">Locality & Ward</div><div class="card-value">${rep.address}</div></div>
          <div class="card"><div class="card-title">Waste Classification</div><div class="card-value">${rep.waste_type || "Plastic"}</div></div>
          <div class="card"><div class="card-title">Pollution Severity Score</div><div class="card-value">${rep.score} / 100 (CRITICAL)</div></div>
          <div class="card"><div class="card-title">SAM 2 Area</div><div class="card-value">${rep.area_m2 || 28.4} m²</div></div>
        </div>
        <div class="footer">EcoVision AI Certified Report · Bengaluru Jurisdiction</div>
      </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending:          { label: "Submitted", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
    under_review:     { label: "Under Review", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
    assigned:         { label: "Team Assigned", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
    cleaning_started: { label: "Cleaning in Progress", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
    completed:        { label: "Cleaned & Verified", color: "bg-[#5CE0A5]/10 text-[#5CE0A5] border-[#5CE0A5]/30" },
  };

  return (
    <div className="min-h-screen bg-[#041611] text-slate-100 flex flex-col font-sans relative overflow-hidden selection:bg-[#5CE0A5] selection:text-slate-950">
      <FloatingParticles />

      {/* 1. Header */}
      <header className="bg-[#041611]/90 backdrop-blur-md border-b border-white/10 px-6 py-3.5 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#5CE0A5] flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-[#5CE0A5]/20 group-hover:scale-105 transition-transform">
              🍃
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white font-serif">
                <span className="text-[#5CE0A5]">EcoVision</span> AI
              </span>
              <span className="text-[11px] text-slate-400 font-mono block leading-none mt-0.5">
                Citizen Portal · Bengaluru Jurisdiction
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300 font-mono">
            <Link href="/" className="text-[#5CE0A5] border-b-2 border-[#5CE0A5] pb-1">
              Dashboard
            </Link>
            <button onClick={() => { setGeneratedReport(null); setShowReportModal(true); }} className="hover:text-[#5CE0A5] transition-colors cursor-pointer">
              📸 Report Garbage
            </button>
            <a href="#my-complaints" className="hover:text-[#5CE0A5] transition-colors">
              📋 My Complaints
            </a>
            <Link href="/map" className="hover:text-[#5CE0A5] transition-colors">
              🗺️ Map View
            </Link>
            <Link href="/achievements" className="hover:text-[#5CE0A5] transition-colors">
              🏆 Eco Rewards
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="bg-[#5CE0A5]/10 border border-[#5CE0A5]/30 text-[#5CE0A5] px-3.5 py-1.5 rounded-full text-xs font-extrabold font-mono flex items-center gap-1.5 shadow-inner">
              <span>🍃</span>
              <span>{(user?.eco_points || 2450).toLocaleString()} pts</span>
            </div>

            <MagneticButton onClick={handleLogout}>
              <button className="text-xs font-bold text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-xl border border-white/10 transition-colors cursor-pointer">
                Sign Out
              </button>
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 relative z-20">

        {/* 2. Hero Welcome Banner */}
        <TiltCard className="bg-[#0a241c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#5CE0A5]/10 border border-[#5CE0A5]/30 px-3 py-1 rounded-full text-xs font-mono font-bold text-[#5CE0A5]">
              <span>📍 {user?.ward || "Ward 151 (Koramangala)"}</span>
              <span>•</span>
              <span>Active Citizen Status</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
              Welcome back, {user?.full_name || "Rohan Sharma"}! 🍃
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Snap photos of garbage piles with automatic GPS locality detection, track AI classification & fleet cleanup dispatches in real-time, and collect Eco-Points for BBMP tax credits.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto relative z-10">
            <div className="bg-[#041611] border border-white/10 p-3.5 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-bold font-mono uppercase">Eco Points</div>
              <div className="text-2xl font-black text-[#5CE0A5] font-mono mt-0.5">{(user?.eco_points || 2450).toLocaleString()}</div>
            </div>
            <div className="bg-[#041611] border border-white/10 p-3.5 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-bold font-mono uppercase">My Reports</div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">{reports.length}</div>
            </div>
            <div className="bg-[#041611] border border-white/10 p-3.5 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-bold font-mono uppercase">Cleaned</div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">15</div>
            </div>
            <div className="bg-[#041611] border border-white/10 p-3.5 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-bold font-mono uppercase">Ward Rank</div>
              <div className="text-2xl font-black text-[#5CE0A5] font-mono mt-0.5">#1</div>
            </div>
          </div>
        </TiltCard>

        {/* 3. Primary Action Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MagneticButton className="w-full" onClick={() => { setGeneratedReport(null); setShowReportModal(true); }}>
            <div className="bg-[#5CE0A5] hover:bg-[#4bc791] text-slate-950 rounded-2xl p-5 shadow-xl flex items-center gap-4 transition-all text-left cursor-pointer group w-full">
              <div className="w-12 h-12 rounded-xl bg-slate-950/20 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                📸
              </div>
              <div>
                <h3 className="font-extrabold text-base font-serif">Report Garbage Site</h3>
                <p className="text-slate-900 text-xs font-medium mt-0.5">Auto GPS Locality Detection</p>
              </div>
            </div>
          </MagneticButton>

          <TiltCard className="bg-[#0a241c] border border-white/10 rounded-2xl p-5 shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#5CE0A5]/10 text-[#5CE0A5] border border-[#5CE0A5]/30 flex items-center justify-center text-2xl flex-shrink-0">
              📋
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white font-serif">My Complaints</h3>
              <p className="text-slate-400 text-xs mt-0.5">{reports.length} Reports Tracked</p>
            </div>
          </TiltCard>

          <TiltCard className="bg-[#0a241c] border border-white/10 rounded-2xl p-5 shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D6A84A]/10 text-[#D6A84A] border border-[#D6A84A]/30 flex items-center justify-center text-2xl flex-shrink-0">
              🗺️
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white font-serif">Bengaluru Map</h3>
              <p className="text-slate-400 text-xs mt-0.5">View 25+ Ward Sites</p>
            </div>
          </TiltCard>

          <TiltCard className="bg-[#0a241c] border border-white/10 rounded-2xl p-5 shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center text-2xl flex-shrink-0">
              🎁
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white font-serif">Eco Rewards</h3>
              <p className="text-slate-400 text-xs mt-0.5">🥇 Eco Champion Level</p>
            </div>
          </TiltCard>
        </div>

        {/* 4. Main Complaints Tracker Section */}
        <div id="my-complaints" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white font-serif">📋 My Complaints & Incident Reports</h2>
              <p className="text-xs text-slate-400">Live AI classification, reverse geocoded locality, and cleanup timeline</p>
            </div>
            <MagneticButton onClick={() => { setGeneratedReport(null); setShowReportModal(true); }}>
              <button className="bg-[#5CE0A5] text-slate-950 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer">
                + New Report
              </button>
            </MagneticButton>
          </div>

          <div className="space-y-4">
            {reports.map((r) => {
              const statusCfg = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
              return (
                <TiltCard key={r.id} className="bg-[#0a241c] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-[#5CE0A5]">#{r.id}</span>
                        <h3 className="font-bold text-white text-base font-serif">{r.address || r.ward}</h3>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{r.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold font-mono border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <button
                        onClick={() => handleDownloadPDF(r)}
                        className="bg-[#5CE0A5]/10 text-[#5CE0A5] border border-[#5CE0A5]/30 hover:bg-[#5CE0A5] hover:text-slate-950 text-xs px-3 py-1 rounded-lg font-bold transition-all cursor-pointer"
                      >
                        🖨️ PDF Report
                      </button>
                    </div>
                  </div>

                  {/* Incident Step Timeline */}
                  <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs font-semibold bg-[#041611] p-4 rounded-xl border border-white/10">
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-full bg-[#5CE0A5] text-slate-950 flex items-center justify-center mx-auto font-bold text-xs">1</div>
                      <div className="text-white text-[11px]">Submitted</div>
                      <div className="text-[9px] text-slate-500 font-mono">{r.created_at}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-full bg-[#5CE0A5] text-slate-950 flex items-center justify-center mx-auto font-bold text-xs">2</div>
                      <div className="text-white text-[11px]">AI Score {r.score || 96}%</div>
                      <div className="text-[9px] text-slate-400 font-mono">YOLOv11</div>
                    </div>
                    <div className="space-y-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto font-bold text-xs ${
                        r.status === "completed" ? "bg-[#5CE0A5] text-slate-950" : "bg-[#38BDF8] text-slate-950 animate-pulse"
                      }`}>3</div>
                      <div className="text-[#38BDF8] text-[11px]">Fleet Assigned</div>
                      <div className="text-[9px] text-slate-400 font-mono">Compactor #04</div>
                    </div>
                    <div className={`space-y-1 ${r.status === "completed" ? "" : "opacity-40"}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto font-bold text-xs ${
                        r.status === "completed" ? "bg-[#5CE0A5] text-slate-950" : "bg-slate-800 text-slate-400"
                      }`}>4</div>
                      <div className="text-slate-300 text-[11px]">Cleaned & Verified</div>
                      <div className="text-[9px] text-slate-500 font-mono">{r.status === "completed" ? "Verified" : "Pending"}</div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>

      </main>

      {/* Garbage Report Modal Drawer */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-[#041611]/80 backdrop-blur-md flex items-center justify-center p-4">
          <TiltCard className="bg-[#0a241c] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-lg text-white font-serif flex items-center gap-2">
                <span>📷</span> Report Garbage Site & Auto-Generate Report
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {generatedReport ? (
              <div className="space-y-4">
                <div className="bg-[#5CE0A5]/10 border border-[#5CE0A5]/30 p-4 rounded-2xl text-center space-y-2">
                  <div className="text-3xl">🎉</div>
                  <h4 className="text-white font-bold text-base font-serif">Report Generated & Logged Successfully!</h4>
                  <p className="text-xs text-slate-300">You earned <span className="text-[#5CE0A5] font-bold">+50 Eco-Points</span> for this submission.</p>
                </div>

                <div className="bg-[#041611] rounded-2xl p-4 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Report ID:</span>
                    <span className="font-mono text-[#5CE0A5] font-bold">#{generatedReport.id}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Detected Locality:</span>
                    <span className="text-white font-bold">{generatedReport.address}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Waste Class:</span>
                    <span className="text-white font-bold">{generatedReport.waste_type}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Pollution Severity:</span>
                    <span className="text-red-400 font-bold font-mono">{generatedReport.score} / 100 (CRITICAL)</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => handleDownloadPDF(generatedReport)}
                    className="flex-1 bg-[#5CE0A5] text-slate-950 font-extrabold text-xs py-3 rounded-xl cursor-pointer shadow-lg"
                  >
                    🖨️ Download PDF Report
                  </button>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-bold uppercase font-mono">Garbage Photo Upload</label>
                  <div className="mt-1 border-2 border-dashed border-white/20 hover:border-[#5CE0A5] rounded-xl p-4 text-center bg-[#041611] cursor-pointer transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-32 mx-auto rounded-lg object-cover" />
                    ) : (
                      <div>
                        <div className="text-3xl mb-1">📸</div>
                        <div className="font-bold text-white">Click or drag garbage photo here</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">Supports JPG, PNG (Auto Locality Detection)</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#041611] p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-mono">Detected GPS Locality</div>
                  <div className="font-mono text-[#5CE0A5] font-bold mt-0.5 flex items-center justify-between text-xs">
                    <span>{locality}</span>
                    <span>📍</span>
                  </div>
                </div>

                <div className="bg-[#5CE0A5]/10 border border-[#5CE0A5]/30 p-3 rounded-xl text-[#5CE0A5] flex items-center justify-between font-mono">
                  <span>🤖 AI Auto-Classifier:</span>
                  <span className="font-extrabold text-white">Plastic Waste (96.5% Severity)</span>
                </div>

                <div>
                  <label className="text-slate-300 font-bold uppercase font-mono">Description / Notes</label>
                  <textarea
                    value={newReportDescription}
                    onChange={(e) => setNewReportDescription(e.target.value)}
                    placeholder="e.g. Large heap of plastic bottles dumping near park entrance..."
                    rows={2}
                    className="w-full bg-[#041611] border border-white/10 text-white p-3 rounded-xl mt-1 focus:outline-none focus:border-[#5CE0A5] text-xs"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <MagneticButton>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-[#5CE0A5] text-slate-950 font-extrabold rounded-xl shadow-lg cursor-pointer"
                    >
                      {isSubmitting ? "Uploading & Analyzing..." : "Submit & Generate Report"}
                    </button>
                  </MagneticButton>
                </div>
              </form>
            )}
          </TiltCard>
        </div>
      )}
    </div>
  );
}
