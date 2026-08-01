"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";

const SEVERITY_CONFIG: Record<string, { color: string; label: string; action: string }> = {
  very_low: { color: "#22c55e", label: "Very Low", action: "Routine collection" },
  low: { color: "#84cc16", label: "Low", action: "Standard pickup" },
  medium: { color: "#f59e0b", label: "Medium", action: "Priority cleanup" },
  high: { color: "#f97316", label: "High", action: "Urgent response" },
  critical: { color: "#ef4444", label: "Critical", action: "Emergency dispatch" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "Pending", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: "⏳" },
  under_review: { label: "Under Review", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: "🔍" },
  assigned: { label: "Assigned", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: "👷" },
  cleaning_started: { label: "In Progress", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", icon: "🚛" },
  completed: { label: "Completed", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: "✅" },
  rejected: { label: "Rejected", color: "text-red-400 bg-red-400/10 border-red-500/20", icon: "❌" },
};

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = use(params);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  };

  useEffect(() => {
    const fetchReport = async () => {
      const token = getCookie("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/api/reports/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error("Report not found");
          if (response.status === 403) throw new Error("Access denied. You do not own this report.");
          throw new Error("Failed to load report details.");
        }

        const data = await response.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#050b14] p-6 flex flex-col justify-center items-center">
        <div className="max-w-md w-full glass rounded-3xl p-8 border border-red-500/20 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Report</h2>
          <p className="text-slate-400 text-sm mb-6">{error || "Could not retrieve report data."}</p>
          <Link href="/" className="btn-primary w-full justify-center text-sm py-2.5">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const severityKey = report.prediction?.severity || "low";
  const severityInfo = SEVERITY_CONFIG[severityKey] || SEVERITY_CONFIG.low;
  const statusInfo = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
  const imageUrl = report.image_url.startsWith("http") ? report.image_url : `http://localhost:8000${report.image_url}`;

  return (
    <div className="min-h-screen p-6 bg-[#050b14] text-slate-300">
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors">
          ← Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Report #{report.id} Details</h1>
            <p className="text-slate-400 text-sm mt-1">Submitted on {new Date(report.created_at).toLocaleString()}</p>
          </div>
          <div className={`inline-flex items-center gap-2 border px-4 py-1.5 rounded-full text-sm font-semibold ${statusInfo.color}`}>
            <span>{statusInfo.icon}</span>
            <span>{statusInfo.label}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Image */}
        <div className="space-y-4">
          <div className="glass rounded-3xl p-4 border border-white/5 overflow-hidden">
            <h3 className="font-semibold text-white mb-3 text-sm">Reported Image</h3>
            <img src={imageUrl} alt="Garbage report" className="w-full h-80 object-cover rounded-2xl" />
          </div>

          <div className="glass rounded-3xl p-5 border border-white/5 space-y-4">
            <h3 className="font-semibold text-white text-sm">Description</h3>
            <p className="text-sm text-slate-300 leading-relaxed italic bg-white/2 rounded-xl p-3 border border-white/5">
              "{report.description || "No description provided."}"
            </p>
          </div>
        </div>

        {/* Right Column: AI Predictions & Details */}
        <div className="space-y-4">
          <div className="glass rounded-3xl p-5 border border-white/5 space-y-4">
            <h3 className="font-semibold text-white text-sm">🤖 AI Assessment</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-light rounded-xl p-3.5 text-center">
                <div className="text-slate-400 text-xs mb-1">Primary Waste</div>
                <div className="text-white font-bold text-base capitalize">{report.prediction?.primary_waste_type || "Mixed"}</div>
              </div>
              <div className="glass-light rounded-xl p-3.5 text-center">
                <div className="text-slate-400 text-xs mb-1">Estimated Area</div>
                <div className="text-white font-bold text-base">{report.prediction?.garbage_area_m2 || 0} m²</div>
              </div>
              <div className="glass-light rounded-xl p-3.5 text-center">
                <div className="text-slate-400 text-xs mb-1">Pollution Score</div>
                <div className="text-white font-bold text-base">{Math.round(report.prediction?.pollution_score || 0)}/100</div>
              </div>
              <div className="glass-light rounded-xl p-3.5 text-center">
                <div className="text-slate-400 text-xs mb-1">Severity</div>
                <div className="font-bold text-base" style={{ color: severityInfo.color }}>{severityInfo.label}</div>
              </div>
            </div>

            {/* Detected objects */}
            {report.prediction?.detected_objects && report.prediction.detected_objects.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Detected Objects:</p>
                <div className="flex flex-wrap gap-2">
                  {report.prediction.detected_objects.map((obj: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 glass px-3 py-1 rounded-full text-xs">
                      <span className="text-white font-medium">{obj.label.replace("_", " ")}</span>
                      <span className="text-green-400 font-bold">{Math.round(obj.confidence * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location details */}
          <div className="glass rounded-3xl p-5 border border-white/5 space-y-3">
            <h3 className="font-semibold text-white text-sm">📍 Location Details</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between pb-2 border-b border-white/5">
                <span className="text-slate-400">Ward / Area</span>
                <span className="text-white font-medium">{report.ward || "Not specified"}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/5">
                <span className="text-slate-400">Address</span>
                <span className="text-white font-medium text-right max-w-[200px] truncate" title={report.address || "GPS Location"}>
                  {report.address || "GPS Location"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coordinates</span>
                <span className="text-white font-mono">{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>

          {/* Response Actions */}
          <div
            className="rounded-3xl p-4 flex items-center gap-3 border"
            style={{
              backgroundColor: `${severityInfo.color}15`,
              borderColor: `${severityInfo.color}40`,
            }}
          >
            <div className="text-2xl">👷</div>
            <div>
              <div className="font-semibold text-sm" style={{ color: severityInfo.color }}>
                Action Status: {severityInfo.action}
              </div>
              <div className="text-xs text-slate-400">
                {report.status === "completed" ? "This site has been successfully cleaned up." : "Municipal team will be dispatched based on priority."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
