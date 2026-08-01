"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";

const INITIAL_NOTIFS = [
  { id: 1, type: "critical", title: "🚨 Critical Garbage Heap Detected", ward: "Ward 151 (Koramangala)", description: "YOLOv11 detected illegal commercial plastic dumping (Score: 96.8). Priority dispatch required.", time: "10 mins ago", read: false },
  { id: 2, type: "dispatch", title: "🚛 Fleet Alpha Dispatched", ward: "Ward 80 (Indiranagar)", description: "Compactor #04 assigned to cleanup site #102. Estimated arrival: 15 mins.", time: "25 mins ago", read: false },
  { id: 3, type: "reward", title: "🌱 Eco-Points Awarded", ward: "Ward 85 (Whitefield)", description: "Citizen Rohan Sharma rewarded +30 eco-points for verified report submission.", time: "1 hour ago", read: true },
  { id: 4, type: "complete", title: "✅ Cleanup Completed", ward: "Ward 111 (Shantala Nagar)", description: "Site #103 cleared by Fleet Beta. SAM 2 post-cleanup scan verified clean area.", time: "2 hours ago", read: true },
  { id: 5, type: "system", title: "🤖 Model Re-trained", ward: "BBMP Central Server", description: "YOLOv11 custom weights updated on GPU cluster (Accuracy: 98.4%).", time: "5 hours ago", read: true },
];

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifs([]);
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
              <h1 className="text-base font-semibold text-white font-serif">🔔 Smart City Notification Feed</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Real-time alerts, fleet updates, AI inferences, and citizen rewards</p>
            </div>
          </div>
          <div className="flex gap-2">
            <MagneticButton onClick={markAllRead}>
              <button className="bg-[#5CE0A5]/20 text-[#5CE0A5] border border-[#5CE0A5]/30 text-xs px-3 py-1.5 rounded-xl font-bold cursor-pointer">
                ✓ Mark All Read
              </button>
            </MagneticButton>
            <MagneticButton onClick={clearAll}>
              <button className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-3 py-1.5 rounded-xl font-bold cursor-pointer">
                🗑️ Clear
              </button>
            </MagneticButton>
          </div>
        </div>

        <div className="p-6 space-y-4 max-w-5xl">
          {notifs.length === 0 ? (
            <div className="bg-[#0a241c] rounded-2xl p-12 text-center border border-white/10 text-slate-400">
              🔔 No active notifications
            </div>
          ) : (
            notifs.map((n) => (
              <TiltCard key={n.id} className={`bg-[#0a241c] rounded-2xl p-5 border transition-all ${
                !n.read ? "border-[#5CE0A5]/40 shadow-lg shadow-[#5CE0A5]/5" : "border-white/10"
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-[#5CE0A5] shadow-sm shadow-[#5CE0A5]" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-sm font-serif">{n.title}</h3>
                        <span className="text-xs font-mono text-[#5CE0A5] bg-[#5CE0A5]/10 px-2 py-0.5 rounded border border-[#5CE0A5]/30">
                          {n.ward}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{n.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 flex-shrink-0">{n.time}</span>
                </div>
              </TiltCard>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
