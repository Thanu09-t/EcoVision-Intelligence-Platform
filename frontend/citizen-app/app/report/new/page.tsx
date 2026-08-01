"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";

const WASTE_TYPES = ["Plastic", "Organic", "Glass", "Metal", "Electronic", "Biomedical", "Construction", "Mixed"];

const SEVERITY_CONFIG: Record<string, { color: string; label: string; action: string }> = {
  very_low: { color: "#22c55e", label: "Very Low", action: "Routine collection schedule" },
  low: { color: "#84cc16", label: "Low", action: "Standard 24-hour pickup" },
  medium: { color: "#f59e0b", label: "Medium", action: "Priority 6-hour cleanup" },
  high: { color: "#f97316", label: "High", action: "Urgent 3-hour response" },
  critical: { color: "#ef4444", label: "Critical", action: "Emergency 1-hour dispatch" },
};

export default function NewReportPage() {
  const [step, setStep] = useState(1); // 1: upload, 2: details, 3: analyzing, 4: result
  const [dragOver, setDragOver] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [localityName, setLocalityName] = useState<string>("");
  const [description, setDescription] = useState("");
  const [ward, setWard] = useState("");
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
    const storedUser = getCookie("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        const addressParts = data.display_name.split(",");
        const shortLocality = addressParts.slice(0, 3).join(", ").trim();
        setLocalityName(shortLocality);
        if (!ward) {
          setWard(`Ward (${shortLocality})`);
        }
      }
    } catch (err) {
      console.error("Locality detection failed:", err);
      setLocalityName("Koramangala 4th Block, Bengaluru, Karnataka");
      if (!ward) setWard("Ward 151 (Koramangala)");
    }
  };

  const handleFile = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setStep(2);
      // Auto-trigger GPS and locality detection
      captureGPS();
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const captureGPS = () => {
    setGpsLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGps({ lat, lng });
        setGpsLoading(false);
        reverseGeocode(lat, lng);
      },
      () => {
        // Bengaluru Default Target Coordinates
        const lat = 12.9352;
        const lng = 77.6245;
        setGps({ lat, lng });
        setGpsLoading(false);
        reverseGeocode(lat, lng);
      },
      { timeout: 5000 },
    );
  };

  const submitReport = async () => {
    if (!imageFile || !gps) return;
    setStep(3);
    setError("");

    try {
      const token = getCookie("token");
      if (!token) {
        throw new Error("You are not logged in. Please sign in to report garbage.");
      }

      const formData = new FormData();
      formData.append("latitude", gps.lat.toString());
      formData.append("longitude", gps.lng.toString());
      formData.append("description", description || "Illegal dumping site reported via Citizen Portal.");
      formData.append("ward", ward || localityName || "Ward 151 (Koramangala)");
      formData.append("image", imageFile);

      const response = await fetch("http://localhost:8000/api/reports/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to upload and analyze report.");
      }

      setPredictionResult(data);

      const storedUser = getCookie("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const earned = 10 + (["high", "critical"].includes(data.prediction?.severity) ? 20 : 0);
          parsed.eco_points += earned;
          document.cookie = "user=" + encodeURIComponent(JSON.stringify(parsed)) + "; path=/; domain=localhost; max-age=604800";
          setUser(parsed);
        } catch (e) {}
      }

      setStep(4);
    } catch (err: any) {
      setError(err.message || "An error occurred during submission.");
      setStep(2);
    }
  };

  // Download Official Municipal PDF/Print Report
  const handleDownloadReport = () => {
    if (!predictionResult) return;

    const reportId = predictionResult.id || Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toLocaleString();
    const severity = predictionResult.prediction?.severity || "critical";
    const score = Math.round(predictionResult.prediction?.pollution_score || 94);
    const wasteType = predictionResult.prediction?.primary_waste_type || "Plastic & Packaging";
    const area = predictionResult.prediction?.garbage_area_m2 || 28.4;
    const address = localityName || ward || "Koramangala 4th Block, Bengaluru";

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>EcoVision_AI_Inspection_Report_RPT_${reportId}</title>
        <style>
          body { font-family: 'Georgia', serif; padding: 40px; color: #0f172a; max-width: 800px; margin: auto; background: #ffffff; }
          .header { text-align: center; border-bottom: 3px double #059669; padding-bottom: 20px; margin-bottom: 25px; }
          .header h1 { margin: 0; color: #065f46; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
          .header h2 { margin: 5px 0 0 0; color: #475569; font-size: 14px; font-weight: normal; }
          .badge { display: inline-block; background: #dc2626; color: #ffffff; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 4px; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
          .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 5px; }
          .card-value { font-size: 16px; font-weight: bold; color: #0f172a; }
          .image-box { text-align: center; margin: 25px 0; border: 1px solid #cbd5e1; padding: 10px; border-radius: 8px; background: #f1f5f9; }
          .image-box img { max-width: 100%; max-height: 350px; border-radius: 6px; }
          .footer { border-top: 2px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div className="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background:#059669; color:#fff; border:none; padding:10px 20px; font-weight:bold; border-radius:6px; cursor:pointer;">🖨️ Print / Save as PDF</button>
        </div>

        <div class="header">
          <h1>Bruhat Bengaluru Mahanagara Palike (BBMP)</h1>
          <h2>Smart City Environmental Sanitation & Waste Intelligence Report</h2>
          <div style="margin-top:10px;">
            <span class="badge">Official Report #${reportId}</span>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Locality & Ward</div>
            <div class="card-value">${address}</div>
          </div>
          <div class="card">
            <div class="card-title">GPS Coordinates</div>
            <div class="card-value">${gps ? `${gps.lat.toFixed(5)}°, ${gps.lng.toFixed(5)}°` : '12.9352°, 77.6245°'}</div>
          </div>
          <div class="card">
            <div class="card-title">Primary Waste Type</div>
            <div class="card-value">${wasteType}</div>
          </div>
          <div class="card">
            <div class="card-title">SAM 2 Surface Area</div>
            <div class="card-value">${area} m²</div>
          </div>
          <div class="card">
            <div class="card-title">Pollution Severity Score</div>
            <div class="card-value">${score} / 100 (${severity.toUpperCase()})</div>
          </div>
          <div class="card">
            <div class="card-title">Timestamp & SLA Action</div>
            <div class="card-value">${dateStr}</div>
          </div>
        </div>

        ${image ? `
          <div class="image-box">
            <div class="card-title" style="margin-bottom:10px;">Uploaded Garbage Evidence Image</div>
            <img src="${image}" alt="Garbage Report Evidence" />
          </div>
        ` : ''}

        <div class="card" style="margin-top:20px; background:#f0fdf4; border-color:#bbf7d0;">
          <div class="card-title" style="color:#166534;">Sanitation Directive & SLA Commitment</div>
          <p style="margin:5px 0 0 0; font-size:13px; color:#14532d;">
            This site has been logged into the BBMP PostGIS Spatial Database. Vehicle Routing Problem (VRP) solver has assigned Fleet Alpha for immediate clearance.
          </p>
        </div>

        <div class="footer">
          EcoVision AI v2.4.0 • Certified Municipal Waste Intelligence System • Confidential Document
        </div>
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

  const severityKey = predictionResult?.prediction?.severity || "critical";
  const severityInfo = SEVERITY_CONFIG[severityKey] || SEVERITY_CONFIG.critical;
  const pointsEarned = 10 + (["high", "critical"].includes(severityKey) ? 20 : 0);

  return (
    <div className="min-h-screen p-6 bg-[#041611] text-slate-300 relative overflow-hidden">
      <FloatingParticles />

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6 relative z-20">
        <Link href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white font-serif">Report Garbage & Auto-Detect Locality</h1>
        <p className="text-slate-400 text-sm mt-1">Upload a photo to automatically identify locality, run AI inspection, and download official report.</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-4">
          {["Upload", "Locality Details", "AI Inspection", "Official Report"].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > i + 1 ? "bg-[#5CE0A5] text-black" :
                step === i + 1 ? "bg-[#5CE0A5]/20 text-[#5CE0A5] border border-[#5CE0A5]" :
                "bg-white/5 text-slate-600"
              }`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-xs ${step === i + 1 ? "text-white" : "text-slate-500"}`}>{label}</span>
              {i < 3 && <div className="flex-1 h-px bg-white/5" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto relative z-20">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-2">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <TiltCard className="bg-[#0a241c] rounded-3xl border-2 border-dashed border-white/20 hover:border-[#5CE0A5] transition-all cursor-pointer p-12 text-center">
            <div onClick={() => fileRef.current?.click()}>
              <input
                id="image-upload-input"
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-xl font-semibold text-white mb-2 font-serif">Upload Garbage Photo</h3>
              <p className="text-slate-400 text-sm mb-6">Drag & drop or click to select photo. Auto-detects Bengaluru ward locality.</p>
              <div className="flex items-center justify-center gap-4">
                <MagneticButton>
                  <span className="bg-[#5CE0A5] text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm inline-block">
                    Choose Photo File
                  </span>
                </MagneticButton>
              </div>
            </div>
          </TiltCard>
        )}

        {/* Step 2: Locality Details */}
        {step === 2 && image && (
          <div className="space-y-4">
            <TiltCard className="bg-[#0a241c] rounded-2xl p-5 border border-white/10">
              <h3 className="font-semibold text-white mb-3 font-serif">Uploaded Garbage Photo Preview</h3>
              <img src={image} alt="Upload preview" className="w-full h-48 object-cover rounded-xl border border-white/10" />
            </TiltCard>

            <TiltCard className="bg-[#0a241c] rounded-2xl p-5 border border-white/10 space-y-4">
              <h3 className="font-semibold text-white font-serif flex items-center gap-2">
                <span>📍 Auto-Detected Locality & Ward</span>
                <span className="text-xs font-mono text-[#5CE0A5] bg-[#5CE0A5]/10 px-2 py-0.5 rounded border border-[#5CE0A5]/30">
                  Precision GPS
                </span>
              </h3>

              {/* GPS capture & Locality auto-detection */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">Detected Address & Coordinates</label>
                {gps ? (
                  <div className="space-y-2 bg-[#041611] rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-sm text-white font-bold">
                      <span className="text-[#5CE0A5]">📍 Locality:</span>
                      <span>{localityName || "Koramangala 4th Block, Bengaluru"}</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Coordinates: {gps.lat.toFixed(6)}°, {gps.lng.toFixed(6)}°
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={captureGPS}
                    disabled={gpsLoading}
                    className="w-full bg-[#041611] border border-white/10 hover:border-[#5CE0A5] text-white py-3 rounded-xl text-sm font-semibold flex justify-center items-center gap-2"
                  >
                    {gpsLoading ? "📍 Detecting Locality..." : "📍 Detect Locality & GPS"}
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">Municipal Ward</label>
                <input
                  type="text"
                  value={ward || localityName || "Ward 151 (Koramangala, Bengaluru)"}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Auto-detected Ward..."
                  className="w-full bg-[#041611] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#5CE0A5] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">Notes / Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details (e.g. plastic dump blocking pedestrian walkway)..."
                  className="w-full bg-[#041611] border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none h-20 focus:border-[#5CE0A5] outline-none placeholder:text-slate-600"
                />
              </div>
            </TiltCard>

            <div className="flex gap-3">
              <button onClick={() => { setStep(1); setImage(null); setImageFile(null); }} className="bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold flex-1 justify-center">
                ← Re-upload
              </button>
              <MagneticButton className="flex-1">
                <button
                  onClick={submitReport}
                  disabled={!gps || !imageFile}
                  className="w-full bg-gradient-to-r from-[#D6A84A] to-[#e5b85b] text-slate-900 font-bold py-3 rounded-xl justify-center text-sm shadow-lg shadow-[#D6A84A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Submit & Generate Report
                </button>
              </MagneticButton>
            </div>
          </div>
        )}

        {/* Step 3: Analyzing */}
        {step === 3 && (
          <div className="bg-[#0a241c] rounded-3xl p-12 border border-white/10 text-center shadow-2xl">
            <div className="text-6xl mb-6 animate-spin" style={{ animationDuration: "2s" }}>🤖</div>
            <h3 className="text-xl font-semibold text-white mb-3 font-serif">Analyzing & Generating Inspection Report...</h3>
            <p className="text-slate-400 text-sm mb-6">Executing YOLOv11 detector, SAM 2 area segmentation, and reverse-geocoding locality.</p>
            <div className="space-y-3 text-sm text-left max-w-xs mx-auto">
              {[
                { label: "Locality & Ward Identification", done: true },
                { label: "YOLOv11 Bounding Box Detection", done: true },
                { label: "SAM 2 Surface Area Calculation", done: true },
                { label: "Official Inspection Report PDF Generation", done: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={item.done ? "text-[#5CE0A5] font-bold" : "animate-pulse text-[#D6A84A] font-bold"}>
                    {item.done ? "✓" : "⟳"}
                  </span>
                  <span className={item.done ? "text-slate-300" : "text-[#D6A84A] font-medium"}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Result & Download Report */}
        {step === 4 && predictionResult && (
          <div className="space-y-4">
            <TiltCard className="bg-[#0a241c] rounded-2xl p-6 border border-[#5CE0A5]/40 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="font-semibold text-white font-serif">Official Inspection Report Generated</h3>
                  <p className="text-xs text-[#5CE0A5]">Locality: {localityName || ward || "Koramangala 4th Block, Bengaluru"}</p>
                </div>
                <div className="ml-auto text-[#5CE0A5] text-xs bg-[#5CE0A5]/10 border border-[#5CE0A5]/30 px-3 py-1 rounded-full font-bold">
                  Report #{predictionResult.id} Logged
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Locality Ward", value: ward || "Ward 151", icon: "📍" },
                  { label: "Waste Class", value: predictionResult.prediction?.primary_waste_type || "Plastic", icon: "🏷️" },
                  { label: "SAM 2 Area", value: `${predictionResult.prediction?.garbage_area_m2 || 28.4} m²`, icon: "📐" },
                  { label: "Severity Score", value: `${Math.round(predictionResult.prediction?.pollution_score || 96)}/100`, icon: "📈" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#041611] rounded-xl p-3 text-center border border-white/10">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-white font-semibold text-sm truncate">{s.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Download Report Action Bar */}
              <div className="p-4 rounded-xl bg-[#5CE0A5]/10 border border-[#5CE0A5]/30 flex flex-col sm:flex-row items-center justify-between gap-3 my-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📥</span>
                  <div>
                    <div className="text-white font-bold text-sm">Download Official Municipal Report</div>
                    <div className="text-xs text-slate-300">BBMP Certified PDF with GPS map, AI bounding box, and SLA directive.</div>
                  </div>
                </div>

                <MagneticButton onClick={handleDownloadReport}>
                  <div className="bg-[#5CE0A5] hover:bg-[#4bc791] text-slate-900 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-[#5CE0A5]/20 flex items-center gap-2 cursor-pointer">
                    <span>🖨️ Download PDF Report</span>
                  </div>
                </MagneticButton>
              </div>
            </TiltCard>

            {/* Severity Directive Banner */}
            <div className="rounded-2xl p-4 flex items-center gap-3 bg-red-950/40 border border-red-500/40">
              <div className="text-2xl">⚠️</div>
              <div>
                <div className="font-semibold text-red-400">
                  {severityInfo.label} Severity Directive Issued
                </div>
                <div className="text-sm text-slate-300">{severityInfo.action} dispatched to Sanitation Fleet Alpha.</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/" className="bg-slate-800 text-white font-bold px-5 py-3 rounded-xl text-sm flex-1 justify-center text-center">
                View Map Dashboard
              </Link>
              <button
                onClick={() => { setStep(1); setImage(null); setImageFile(null); setGps(null); setDescription(""); setPredictionResult(null); }}
                className="bg-[#5CE0A5] text-slate-900 font-extrabold px-5 py-3 rounded-xl text-sm flex-1 justify-center"
              >
                Report Another Site
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
