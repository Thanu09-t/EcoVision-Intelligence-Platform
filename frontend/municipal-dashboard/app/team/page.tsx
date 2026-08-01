"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";

const INITIAL_TEAMS = [
  { id: 1, name: "Fleet Alpha", lead: "Ramesh Kumar (Officer)", vehicle: "Compactor #04 (KA-04-EV-8821)", ward: "Ward 151 (Koramangala)", status: "Active Cleanup", members: 4, sitesCleared: 142 },
  { id: 2, name: "Fleet Beta", lead: "Suresh Gowda (Officer)", vehicle: "Mini-Truck #09 (KA-04-EV-3109)", ward: "Ward 80 (Indiranagar)", status: "In Transit", members: 3, sitesCleared: 118 },
  { id: 3, name: "Fleet Gamma", lead: "Manjunath P. (Officer)", vehicle: "Heavy Tipper #12 (KA-04-EV-9012)", ward: "Ward 85 (Whitefield)", status: "Active Cleanup", members: 5, sitesCleared: 165 },
  { id: 4, name: "Fleet Delta", lead: "Venkatesh R. (Officer)", vehicle: "Compactor #07 (KA-04-EV-4407)", ward: "Ward 7 (Hebbal)", status: "Off Duty / Standby", members: 3, sitesCleared: 89 },
];

export default function TeamsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [dispatchedId, setDispatchedId] = useState<number | null>(null);

  const handleDispatch = (id: number) => {
    setDispatchedId(id);
    setTeams(prev => prev.map(t => t.id === id ? { ...t, status: "Active Cleanup", sitesCleared: t.sitesCleared + 1 } : t));
    setTimeout(() => setDispatchedId(null), 1000);
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
              <h1 className="text-base font-semibold text-white font-serif">👥 Sanitation Teams & Fleets</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Manage cleanup crews, assigned vehicles, and ward coverage</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#5CE0A5]/10 border border-[#5CE0A5]/30 text-[#5CE0A5] text-xs font-mono">
            ● 4 Active Teams Deployed
          </div>
        </div>

        <div className="p-6 space-y-6 max-w-5xl">
          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => (
              <TiltCard key={team.id} className="bg-[#0a241c] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5CE0A5]/20 border border-[#5CE0A5]/30 flex items-center justify-center text-xl">
                      🚛
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base font-serif">{team.name}</h3>
                      <p className="text-xs text-[#5CE0A5]">{team.lead}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    team.status.includes("Active") ? "bg-[#5CE0A5]/20 text-[#5CE0A5] border border-[#5CE0A5]/40" :
                    team.status.includes("Transit") ? "bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40" :
                    "bg-slate-800 text-slate-400 border border-white/10"
                  }`}>
                    {team.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs bg-[#041611] p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between text-slate-300">
                    <span>Assigned Vehicle:</span>
                    <span className="font-mono text-white font-bold">{team.vehicle}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Ward Jurisdiction:</span>
                    <span className="text-[#5CE0A5] font-bold">{team.ward}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Crew Members:</span>
                    <span className="text-white font-bold">{team.members} Personnel</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Sites Cleared:</span>
                    <span className="text-[#D6A84A] font-bold font-mono">{team.sitesCleared} Sites</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <MagneticButton className="w-full" onClick={() => handleDispatch(team.id)}>
                    <button className="w-full bg-[#5CE0A5] hover:bg-[#4bc791] text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer">
                      {dispatchedId === team.id ? "✓ Dispatched!" : "🚀 Re-Dispatch Team"}
                    </button>
                  </MagneticButton>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
