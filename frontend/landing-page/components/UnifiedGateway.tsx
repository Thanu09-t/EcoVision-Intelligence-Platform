"use client";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";

const MASTER_LINKS = [
  {
    category: "📱 Citizen Portal",
    badge: "Public Access",
    badgeColor: "bg-[#5CE0A5]/10 text-[#5CE0A5] border-[#5CE0A5]/30",
    links: [
      { name: "📸 Report Garbage Site (Auto GPS)", url: "http://localhost:3001/report/new", desc: "Snap photo, auto-detect locality & download report" },
      { name: "📋 My Complaints Tracker", url: "http://localhost:3001#my-complaints", desc: "Live 4-step SLA dispatch tracking" },
      { name: "🗺️ Bengaluru Pollution Map", url: "http://localhost:3001/map", desc: "View 25+ ward garbage sites & district stats" },
      { name: "🏆 Eco Rewards & Leaderboard", url: "http://localhost:3001/achievements", desc: "Track eco-points, badges & city rank" },
      { name: "🔐 Citizen Sign-In", url: "http://localhost:3001/login", desc: "Log in with demo credentials" },
    ],
  },
  {
    category: "🏛️ Municipal Officer Command Center",
    badge: "Officer & Admin",
    badgeColor: "bg-[#D6A84A]/10 text-[#D6A84A] border-[#D6A84A]/30",
    links: [
      { name: "📊 Officer Overview Dashboard", url: "http://localhost:3002", desc: "City-wide statistics & live map" },
      { name: "🗺️ GIS Ward Heatmap", url: "http://localhost:3002/map", desc: "Interactive Bengaluru ward heatmap" },
      { name: "📋 Ward Reports Management", url: "http://localhost:3002/reports", desc: "Filter, review & assign sanitation crews" },
      { name: "🚛 OR-Tools VRP Fleet Solver", url: "http://localhost:3002/routes", desc: "Vehicle Routing Problem optimization engine" },
      { name: "📈 Smart City Analytics", url: "http://localhost:3002/analytics", desc: "Waste distribution, monthly trends & ward rankings" },
      { name: "🤖 AI Report Generator & PDF", url: "http://localhost:3002/ai-reports", desc: "Synthesize LLM reports & export official PDF" },
      { name: "👥 Sanitation Cleanup Teams", url: "http://localhost:3002/team", desc: "Manage fleets Alpha, Beta, Gamma & Delta" },
      { name: "👤 User Access Directory", url: "http://localhost:3002/users", desc: "Manage citizens, officers & admin roles" },
      { name: "🔔 Notification Feed", url: "http://localhost:3002/notifications", desc: "Real-time alerts, fleet updates & AI inferences" },
      { name: "⚙️ System Settings", url: "http://localhost:3002/settings", desc: "Configure dispatch thresholds & alert rules" },
      { name: "🚗 System Admin Panel", url: "http://localhost:3002/admin", desc: "System-wide vehicles & infrastructure" },
    ],
  },
  {
    category: "⚡ FastAPI Backend Engine",
    badge: "Developers & API",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    links: [
      { name: "📖 Interactive Swagger API Docs", url: "http://localhost:8000/docs", desc: "Explore FastAPI REST endpoints & test schemas" },
      { name: "🟢 Backend Health Status", url: "http://localhost:8000/health", desc: "PostGIS Supabase & AI inference health check" },
    ],
  },
];

export default function UnifiedGateway() {
  return (
    <section id="master-launchpad" className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto text-left relative z-20">
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 bg-[#10251F] border border-white/10 px-4 py-1.5 rounded-full text-xs font-mono text-[#5CE0A5]">
          <span className="w-2 h-2 rounded-full bg-[#5CE0A5] animate-pulse" />
          <span>Master System Launchpad</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
          1 Unified Master Link to Access Everything
        </h2>
        <p className="text-body text-[#AEB9B5] text-sm sm:text-base">
          Access all citizen portals, municipal officer command centers, route solvers, analytics hubs, and backend API endpoints from this single master gateway.
        </p>
      </div>

      <div className="space-y-10">
        {MASTER_LINKS.map((group) => (
          <TiltCard key={group.category} className="surface-card p-8 border border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold font-serif text-white flex items-center gap-3">
                {group.category}
              </h3>
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${group.badgeColor}`}>
                {group.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.links.map((link) => (
                <MagneticButton key={link.url} href={link.url} className="w-full">
                  <div className="bg-[#041611] hover:bg-[#0a241c] border border-white/10 hover:border-[#5CE0A5]/50 p-4 rounded-xl transition-all cursor-pointer group flex flex-col justify-between h-full w-full">
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-[#5CE0A5] transition-colors flex items-center justify-between">
                        <span>{link.name}</span>
                        <span className="text-xs text-slate-500 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                      <p className="text-xs text-[#AEB9B5] mt-1">{link.desc}</p>
                    </div>
                    <div className="text-[10px] font-mono text-[#5CE0A5] mt-3 opacity-70 truncate">
                      {link.url}
                    </div>
                  </div>
                </MagneticButton>
              ))}
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
