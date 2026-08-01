"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";

const INITIAL_USERS = [
  { id: 1, name: "Rohan Sharma", email: "citizen@demo.com", role: "citizen", ward: "Ward 151 (Koramangala)", points: 1450, reports: 14, badge: "🥇 Eco Champion", status: "Verified" },
  { id: 2, name: "Suresh Gowda", email: "officer@demo.com", role: "municipal", ward: "Ward 80 (Indiranagar)", points: 0, reports: 42, badge: "🏛️ Sanitation Officer", status: "Active" },
  { id: 3, name: "Admin Officer", email: "admin@ecovision.ai", role: "admin", ward: "BBMP HQ Central", points: 0, reports: 0, badge: "⚙️ System Admin", status: "Active" },
  { id: 4, name: "Priya Nair", email: "priya@demo.com", role: "citizen", ward: "Ward 85 (Whitefield)", points: 1120, reports: 11, badge: "🥈 Green Guardian", status: "Verified" },
  { id: 5, name: "Anil Kumar", email: "anil@demo.com", role: "citizen", ward: "Ward 7 (Hebbal)", points: 940, reports: 9, badge: "🥉 Earth Sentinel", status: "Verified" },
];

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredUsers = INITIAL_USERS.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase()) && !u.ward.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#041611] text-slate-100 flex font-sans relative overflow-hidden">
      <FloatingParticles />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0 overflow-auto relative z-20">
        <div className="sticky top-0 z-30 bg-[#041611]/90 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <h1 className="text-base font-semibold text-white font-serif">👤 User Directory & Access Management</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Manage citizen reporters, sanitation officers, and system admins</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#5CE0A5]/10 border border-[#5CE0A5]/30 text-[#5CE0A5] text-xs font-mono">
            ● {INITIAL_USERS.length} Registered Accounts
          </div>
        </div>

        <div className="p-6 space-y-6 max-w-5xl">
          {/* Filter Bar */}
          <TiltCard className="bg-[#0a241c] rounded-2xl p-4 border border-white/10 flex flex-wrap gap-3 items-center justify-between shadow-xl">
            <div className="flex gap-2">
              {["all", "citizen", "municipal", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === r ? "bg-[#5CE0A5] text-slate-950 shadow" : "bg-[#041611] text-slate-300 border border-white/10"
                  }`}
                >
                  {r === "all" ? "All Users" : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name, email, or ward..."
              className="bg-[#041611] border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-[#5CE0A5] w-64"
            />
          </TiltCard>

          {/* User Table Card */}
          <div className="bg-[#0a241c] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="divide-y divide-white/10">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-lg font-bold text-white">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{u.name}</span>
                        <span className="text-xs font-mono text-[#5CE0A5] bg-[#5CE0A5]/10 px-2 py-0.5 rounded border border-[#5CE0A5]/30">
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{u.email} · {u.ward}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-xs font-mono font-bold text-[#5CE0A5]">{u.points} pts</div>
                      <div className="text-[10px] text-slate-400">{u.reports} Reports</div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#5CE0A5]/10 text-[#5CE0A5] border border-[#5CE0A5]/30">
                      {u.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
