"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jurisdiction, setJurisdiction] = useState("Bengaluru BBMP (All 198 Wards)");
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [severityThreshold, setSeverityThreshold] = useState(80);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#041611] text-slate-100 flex font-sans relative overflow-hidden">
      <FloatingParticles />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0 overflow-auto relative z-20">
        <div className="sticky top-0 z-30 bg-[#041611]/90 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <h1 className="text-base font-semibold text-white font-serif">⚙️ Municipal System Settings</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Configure ward dispatching rules, AI sensitivity thresholds, and notifications</p>
            </div>
          </div>
          {saved && (
            <span className="text-xs font-bold text-[#5CE0A5] bg-[#5CE0A5]/10 border border-[#5CE0A5]/30 px-3 py-1 rounded-full animate-bounce">
              ✓ Settings Saved Successfully!
            </span>
          )}
        </div>

        <div className="p-6 space-y-6 max-w-4xl">
          <form onSubmit={handleSave} className="space-y-6">

            {/* Jurisdiction Settings */}
            <TiltCard className="bg-[#0a241c] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base font-serif flex items-center gap-2">
                <span>🏙️ Jurisdiction & Regional Scope</span>
              </h3>
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">Assigned Zone Jurisdiction</label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full bg-[#041611] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-[#5CE0A5]"
                >
                  <option value="Bengaluru BBMP (All 198 Wards)">Bengaluru BBMP (All 198 Wards)</option>
                  <option value="South Zone (Koramangala, Jayanagar, HSR)">South Zone (Koramangala, Jayanagar, HSR)</option>
                  <option value="East Zone (Indiranagar, Whitefield, CV Raman)">East Zone (Indiranagar, Whitefield, CV Raman)</option>
                  <option value="North Zone (Hebbal, Yelahanka)">North Zone (Hebbal, Yelahanka)</option>
                </select>
              </div>
            </TiltCard>

            {/* AI Fleet Automation */}
            <TiltCard className="bg-[#0a241c] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base font-serif flex items-center gap-2">
                <span>🤖 AI Dispatch & Threshold Rules</span>
              </h3>

              <div className="flex items-center justify-between p-3 bg-[#041611] rounded-xl border border-white/10">
                <div>
                  <div className="text-xs font-bold text-white">Auto-Dispatch Sanitation Fleets</div>
                  <div className="text-[11px] text-slate-400">Automatically assign nearest available vehicle when critical illegal dump detected</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoDispatch}
                  onChange={(e) => setAutoDispatch(e.target.checked)}
                  className="w-5 h-5 accent-[#5CE0A5] cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Critical Alert Trigger Score</span>
                  <span className="font-mono text-[#5CE0A5] font-bold">{severityThreshold} / 100</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={severityThreshold}
                  onChange={(e) => setSeverityThreshold(Number(e.target.value))}
                  className="w-full accent-[#5CE0A5] cursor-pointer"
                />
              </div>
            </TiltCard>

            {/* Alerts & Digest */}
            <TiltCard className="bg-[#0a241c] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base font-serif flex items-center gap-2">
                <span>🔔 Notification Channels</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#041611] rounded-xl border border-white/10">
                  <span className="text-xs text-slate-300 font-medium">Instant SMS High-Priority Alerts</span>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-5 h-5 accent-[#5CE0A5] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#041611] rounded-xl border border-white/10">
                  <span className="text-xs text-slate-300 font-medium">Daily Executive Email Summary</span>
                  <input
                    type="checkbox"
                    checked={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className="w-5 h-5 accent-[#5CE0A5] cursor-pointer"
                  />
                </div>
              </div>
            </TiltCard>

            <MagneticButton className="w-full">
              <button
                type="submit"
                className="w-full bg-[#5CE0A5] hover:bg-[#4bc791] text-slate-950 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#5CE0A5]/20"
              >
                💾 Save System Configuration
              </button>
            </MagneticButton>
          </form>
        </div>
      </main>
    </div>
  );
}
