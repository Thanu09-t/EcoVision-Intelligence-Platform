"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

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
  { name: "Seedling",         icon: "🌾", minPts: 0,   color: "#6b7280" },
  { name: "Eco Starter",      icon: "♻️", minPts: 50,  color: "#22c55e" },
  { name: "Green Guardian",   icon: "🌱", minPts: 150, color: "#84cc16" },
  { name: "Eco Champion",     icon: "🌿", minPts: 300, color: "#3b82f6" },
  { name: "Planet Protector", icon: "🌳", minPts: 500, color: "#f59e0b" },
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie("token");
    const storedUser = getCookie("user");
    if (!token) { window.location.href = "/login"; return; }
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch {}
    }

    fetch(`${API_BASE}/api/analytics/leaderboard?limit=25`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setLeaderboard(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 glass border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white text-sm">← Back</Link>
          <div>
            <h1 className="text-base font-semibold text-white">🏆 Eco Leaderboard</h1>
            <p className="text-xs text-slate-400">Top citizens making Bengaluru greener</p>
          </div>
        </div>
        <Link href="/report/new" className="btn-primary text-sm py-2">+ Report</Link>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Badge tiers legend */}
        <div className="glass rounded-2xl p-5 border border-white/5">
          <h3 className="font-semibold text-white mb-4">🎖️ Badge Tiers</h3>
          <div className="flex flex-wrap gap-3">
            {BADGE_TIERS.map(tier => (
              <div key={tier.name} className="flex items-center gap-2 glass-light rounded-xl px-3 py-2">
                <span className="text-lg">{tier.icon}</span>
                <div>
                  <div className="text-xs font-medium text-white">{tier.name}</div>
                  <div className="text-xs text-slate-500">{tier.minPts}+ pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="glass rounded-2xl border border-white/5">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-semibold text-white">Top 25 Eco Citizens</h3>
          </div>
          <div className="divide-y divide-white/5">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="p-4 h-16 animate-pulse flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/5 rounded mb-2 w-40" />
                    <div className="h-3 bg-white/5 rounded w-24" />
                  </div>
                </div>
              ))
            ) : leaderboard.map((entry) => {
              const isCurrentUser = currentUser && entry.user_id === currentUser.id;
              return (
                <div
                  key={entry.user_id}
                  className={`p-4 flex items-center gap-4 transition-colors ${
                    isCurrentUser ? "bg-green-500/5 border-l-2 border-green-500" : "hover:bg-white/2"
                  }`}
                >
                  {/* Rank badge */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    entry.rank === 1 ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30" :
                    entry.rank === 2 ? "bg-slate-300 text-black" :
                    entry.rank === 3 ? "bg-amber-600 text-black" :
                    "bg-white/10 text-slate-300"
                  }`}>
                    {entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank-1] : entry.rank}
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {entry.full_name}
                        {isCurrentUser && <span className="text-xs text-green-400 ml-1">(You)</span>}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {entry.ward || "Unknown Ward"} · {entry.total_reports} reports · {entry.badge}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-green-400 font-bold text-lg">{entry.eco_points.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">eco-pts</div>
                  </div>
                </div>
              );
            })}
            {!loading && leaderboard.length === 0 && (
              <div className="p-12 text-center text-slate-500">No data yet. Be the first to report!</div>
            )}
          </div>
        </div>

        {/* How to earn points */}
        <div className="glass rounded-2xl p-5 border border-white/5">
          <h3 className="font-semibold text-white mb-4">💡 How to Earn Points</h3>
          <div className="space-y-3">
            {[
              { action: "Submit a garbage report",     pts: "+10", icon: "📸" },
              { action: "Report a critical site",      pts: "+30", icon: "🔴" },
              { action: "Cleanup completed for your report", pts: "+50", icon: "✅" },
              { action: "Weekly active citizen bonus", pts: "+20", icon: "🏃" },
              { action: "First report of the month",   pts: "+25", icon: "🌟" },
            ].map(item => (
              <div key={item.action} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-slate-300 flex-1">{item.action}</span>
                <span className="text-green-400 font-bold text-sm">{item.pts}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <Link href="/report/new" className="btn-primary w-full justify-center py-2.5 text-sm">
              📸 Report Garbage Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
