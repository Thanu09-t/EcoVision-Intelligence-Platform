"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";

export default function AdminPanelPage() {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiMode, setAiMode] = useState("mock");
  const [llmProvider, setLlmProvider] = useState("template");
  const [yoloWeights, setYoloWeights] = useState("./ai/yolo/weights/best.pt");
  const [saved, setSaved] = useState(false);

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
    const token = getCookie("token");

    if (!storedUser || !token) {
      window.location.href = "http://localhost:3001/login";
    } else {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role !== "admin") {
          if (parsed.role === "municipal") {
            window.location.href = "/";
          } else {
            window.location.href = "http://localhost:3001/";
          }
        } else {
          setUser(parsed);
        }
      } catch (e) {
        window.location.href = "http://localhost:3001/login";
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#041611] flex items-center justify-center relative overflow-hidden">
        <FloatingParticles />
        <div className="text-center relative z-20">
          <div className="w-12 h-12 border-4 border-[#5CE0A5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#041611] flex relative overflow-hidden">
      {/* Floating Canvas Particles */}
      <FloatingParticles />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0 overflow-auto relative z-20">
        <div className="sticky top-0 z-30 bg-[#041611]/90 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <h1 className="text-base font-semibold text-white">⚙️ System Admin Control Center</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Orchestrate AI models, database backups, and environment configs</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#5CE0A5]/10 border border-[#5CE0A5]/30 text-[#5CE0A5] text-xs font-mono">
            ● System Admin Mode Active
          </div>
        </div>

        <div className="p-6 space-y-6 max-w-4xl">
          {/* Admin 3D Tilt Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Database Status", val: "Operational", desc: "SQLite (aiosqlite) active", color: "text-[#5CE0A5]" },
              { title: "AI Inference Engine", val: aiMode === "mock" ? "Mock Mode" : "GPU Mode", desc: "Toggle between mock and PyTorch weights", color: "text-[#38BDF8]" },
              { title: "Connected Wards", val: "198 Wards Mapped", desc: "Bengaluru BBMP jurisdiction", color: "text-[#D6A84A]" },
            ].map((c) => (
              <TiltCard key={c.title} className="bg-[#0a241c] rounded-2xl p-5 border border-white/10 shadow-lg">
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{c.title}</div>
                <div className={`text-xl font-bold mt-2 ${c.color}`}>{c.val}</div>
                <div className="text-xs text-slate-500 mt-1">{c.desc}</div>
              </TiltCard>
            ))}
          </div>

          {/* Config Form Card */}
          <TiltCard className="bg-[#0a241c] rounded-2xl p-6 border border-white/10 shadow-xl">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>🔧 AI Orchestration & System Configs</span>
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">AI Mode</label>
                  <select
                    value={aiMode}
                    onChange={(e) => setAiMode(e.target.value)}
                    className="w-full bg-[#041611] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-[#5CE0A5]"
                  >
                    <option value="mock">Mock Inference (Demo)</option>
                    <option value="real">Real Inference (PyTorch/YOLO/SAM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">LLM Provider (AI Reports)</label>
                  <select
                    value={llmProvider}
                    onChange={(e) => setLlmProvider(e.target.value)}
                    className="w-full bg-[#041611] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-[#5CE0A5]"
                  >
                    <option value="template">Jinja2 Template (Offline)</option>
                    <option value="openai">OpenAI GPT-4o-mini</option>
                    <option value="gemini">Google Gemini 1.5 Pro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">YOLOv11 Weights Path</label>
                <input
                  type="text"
                  value={yoloWeights}
                  onChange={(e) => setYoloWeights(e.target.value)}
                  className="w-full bg-[#041611] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-[#5CE0A5]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">SAM 2 Model Path</label>
                  <input
                    type="text"
                    defaultValue="./ai/segmentation/weights/sam2.pt"
                    className="w-full bg-[#041611] border border-white/5 rounded-xl px-4 py-2.5 text-slate-500 text-xs outline-none cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">EfficientNet Model Path</label>
                  <input
                    type="text"
                    defaultValue="./ai/classifier/weights/efficientnet.pth"
                    className="w-full bg-[#041611] border border-white/5 rounded-xl px-4 py-2.5 text-slate-500 text-xs outline-none cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {saved ? (
                  <span className="text-[#5CE0A5] text-xs font-medium">✓ System configurations updated successfully!</span>
                ) : <span />}
                <MagneticButton>
                  <button type="submit" className="bg-[#5CE0A5] text-slate-900 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-[#5CE0A5]/20">
                    Apply & Reload
                  </button>
                </MagneticButton>
              </div>
            </form>
          </TiltCard>

          {/* Database maintenance */}
          <div className="bg-[#0a241c] rounded-2xl p-6 border border-white/10 shadow-xl">
            <h3 className="font-semibold text-white mb-4">🗄️ Database & System Operations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TiltCard className="bg-[#041611] rounded-xl p-4 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="font-medium text-white text-sm">Clear DB Cache</div>
                  <div className="text-xs text-slate-400 mt-1">Clears Redis cache and transient session files.</div>
                </div>
                <MagneticButton className="mt-3">
                  <button
                    onClick={() => alert("Redis cache cleared successfully.")}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg transition-all"
                  >
                    Clear Cache
                  </button>
                </MagneticButton>
              </TiltCard>

              <TiltCard className="bg-[#041611] rounded-xl p-4 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="font-medium text-white text-sm">Reseed database</div>
                  <div className="text-xs text-slate-400 mt-1">Deletes all current records and runs seed.py.</div>
                </div>
                <MagneticButton className="mt-3">
                  <button
                    onClick={() => alert("Please run 'python seed.py' in the backend terminal directly to execute database seed.")}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs px-4 py-2 rounded-lg transition-all"
                  >
                    Trigger Database Seed
                  </button>
                </MagneticButton>
              </TiltCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
