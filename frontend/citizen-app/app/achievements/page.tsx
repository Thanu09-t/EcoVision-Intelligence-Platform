"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";

const API_BASE = "http://localhost:8000";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  for (const c of document.cookie.split(";")) {
    const t = c.trim();
    if (t.startsWith(nameEQ)) return decodeURIComponent(t.slice(nameEQ.length));
  }
  return null;
}

const BADGE_TIERS = [
  { name: "Seedling",         icon: "🌾", minPts: 0,   maxPts: 49,   desc: "Welcome to EcoVision! Start by reporting your first garbage site.",  color: "from-slate-800 to-slate-700",  glow: "#6b7280" },
  { name: "Eco Starter",      icon: "♻️", minPts: 50,  maxPts: 149,  desc: "You've made your first impact. Keep reporting to help your community.", color: "from-green-900 to-green-800",  glow: "#22c55e" },
  { name: "Green Guardian",   icon: "🌱", minPts: 150, maxPts: 299,  desc: "You're a consistent eco-reporter. Your ward is getting cleaner!",       color: "from-lime-900 to-lime-800",   glow: "#84cc16" },
  { name: "Eco Champion",     icon: "🌿", minPts: 300, maxPts: 499,  desc: "Top performer! Your reports have triggered multiple cleanups.",          color: "from-[#0a241c] to-[#041611]", glow: "#5CE0A5" },
  { name: "Planet Protector", icon: "🌳", minPts: 500, maxPts: 9999, desc: "Elite status! You're one of Bengaluru's most impactful eco-citizens.",   color: "from-amber-900 to-amber-800", glow: "#f59e0b" },
];

const ACHIEVEMENTS = [
  { id: "first_report",    icon: "📸", name: "First Report",         desc: "Submit your first garbage report",        pts: 10 },
  { id: "critical",        icon: "🔴", name: "Critical Alert",       desc: "Report a critical severity site",         pts: 30 },
  { id: "5_reports",       icon: "⭐", name: "Active Reporter",       desc: "Submit 5 garbage reports",               pts: 25 },
  { id: "10_reports",      icon: "🌟", name: "Dedicated Citizen",     desc: "Submit 10 garbage reports",              pts: 50 },
  { id: "cleanup_done",    icon: "✅", name: "Cleanup Hero",         desc: "Have your reported site cleaned up",      pts: 50 },
  { id: "illegal",         icon: "⚠️", name: "Watchdog",             desc: "Report an illegal dump site",            pts: 20 },
  { id: "streak_week",     icon: "🔥", name: "Weekly Streak",         desc: "Report every day for a week",            pts: 35 },
  { id: "top_10",          icon: "🏆", name: "Leaderboard Star",      desc: "Reach top 10 on the leaderboard",        pts: 40 },
  { id: "25_reports",      icon: "🌍", name: "Eco Warrior",           desc: "Submit 25 garbage reports",              pts: 100 },
];

export default function AchievementsPage() {
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = getCookie("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch {}
    } else {
      setUser({ full_name: "Rohan Sharma", eco_points: 2450, ward: "Ward 151 (Koramangala)" });
    }
  }, []);

  const ecoPoints = user?.eco_points || 2450;

  const currentTier = BADGE_TIERS.reduce((best, tier) => {
    return ecoPoints >= tier.minPts ? tier : best;
  }, BADGE_TIERS[0]);

  const nextTier = BADGE_TIERS.find(t => t.minPts > ecoPoints);
  const ptsToNext = nextTier ? nextTier.minPts - ecoPoints : 0;
  const progressPct = nextTier
    ? ((ecoPoints - currentTier.minPts) / (nextTier.minPts - currentTier.minPts)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-[#041611] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <FloatingParticles />

      <div className="sticky top-0 z-30 bg-[#041611]/90 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white text-xs font-mono">← Back to Dashboard</Link>
          <div>
            <h1 className="text-base font-semibold text-white font-serif">🏅 Eco Rewards & Achievements</h1>
            <p className="text-xs text-slate-400">Track eco-points, unlocked badges, and tax credits</p>
          </div>
        </div>
        <MagneticButton>
          <Link href="/leaderboard" className="bg-[#5CE0A5] text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl">
            🏆 City Leaderboard
          </Link>
        </MagneticButton>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-6 relative z-20">
        {/* Current badge card */}
        <TiltCard className={`rounded-3xl p-8 border border-white/20 bg-gradient-to-br ${currentTier.color} shadow-2xl text-center space-y-4`}>
          <div className="text-7xl mb-2" style={{ filter: `drop-shadow(0 0 24px ${currentTier.glow})` }}>
            {currentTier.icon}
          </div>
          <h2 className="text-3xl font-extrabold text-white font-serif">{currentTier.name}</h2>
          <p className="text-sm text-slate-200 leading-relaxed max-w-md mx-auto">{currentTier.desc}</p>
          <div className="text-4xl font-extrabold text-[#5CE0A5] font-mono">{ecoPoints.toLocaleString()}</div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">Total Eco-Points Earned</div>

          {nextTier && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs text-slate-300 font-mono mb-2">
                <span>Progress to {nextTier.name} {nextTier.icon}</span>
                <span>{ptsToNext} pts to go</span>
              </div>
              <div className="w-full bg-[#041611] rounded-full h-3 border border-white/10 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500 bg-[#5CE0A5]"
                  style={{ width: `${Math.min(progressPct, 100)}%` }}
                />
              </div>
            </div>
          )}
        </TiltCard>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          <TiltCard className="bg-[#0a241c] rounded-2xl p-4 border border-white/10 text-center">
            <div className="text-2xl mb-1">📸</div>
            <div className="text-2xl font-bold text-white font-mono">18</div>
            <div className="text-xs text-slate-400">Reports Submitted</div>
          </TiltCard>

          <TiltCard className="bg-[#0a241c] rounded-2xl p-4 border border-white/10 text-center">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-2xl font-bold text-white font-mono">15</div>
            <div className="text-xs text-slate-400">Verified Cleanups</div>
          </TiltCard>

          <TiltCard className="bg-[#0a241c] rounded-2xl p-4 border border-white/10 text-center">
            <div className="text-2xl mb-1">🍃</div>
            <div className="text-2xl font-bold text-[#5CE0A5] font-mono">2,450</div>
            <div className="text-xs text-slate-400">Eco Points</div>
          </TiltCard>
        </div>

        {/* Achievements list */}
        <TiltCard className="bg-[#0a241c] rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base font-serif">
            🎖️ Unlocked Achievements (8 / {ACHIEVEMENTS.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((a, i) => (
              <div key={a.id} className="bg-[#041611] rounded-2xl p-4 text-center border border-white/10 space-y-1">
                <div className="text-3xl mb-1">{a.icon}</div>
                <div className="text-xs font-bold text-white">{a.name}</div>
                <div className="text-[11px] text-slate-400 leading-tight">{a.desc}</div>
                <div className="text-xs font-mono font-bold text-[#5CE0A5] pt-1">+{a.pts} pts ✓</div>
              </div>
            ))}
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
