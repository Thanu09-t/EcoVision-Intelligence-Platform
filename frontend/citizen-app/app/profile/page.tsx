"use client";
import { useState } from "react";
import Link from "next/link";

const DEMO_USER = {
  name: "Ananya Krishnan",
  email: "citizen@demo.com",
  phone: "+91 98765 43210",
  ward: "Ward 68",
  joined: "July 2026",
  eco_points: 240,
  badge: "🌿 Green Guardian",
};

const ECO_LOGS = [
  { id: 1, points: 50, reason: "Cleanup completed for your reported site in Koramangala", date: "2h ago" },
  { id: 2, points: 30, reason: "Submitted a high-severity garbage report", date: "1d ago" },
  { id: 3, points: 10, reason: "Submitted a garbage report", date: "3d ago" },
  { id: 4, points: 10, reason: "Welcome bonus for joining EcoVision AI", date: "7d ago" },
];

export default function ProfilePage() {
  const [phone, setPhone] = useState(DEMO_USER.phone);
  const [ward, setWard] = useState(DEMO_USER.ward);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto mb-6">
        <Link href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account details and view your eco-points history.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* User Card */}
        <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-green-500/20">
            {DEMO_USER.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-white">{DEMO_USER.name}</h2>
            <p className="text-sm text-slate-400">{DEMO_USER.email}</p>
            <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                {DEMO_USER.badge}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                📍 {DEMO_USER.ward}
              </span>
            </div>
          </div>
          <div className="glass-light rounded-xl p-4 text-center min-w-[120px]">
            <div className="text-2xl font-black text-green-400">{DEMO_USER.eco_points}</div>
            <div className="text-xs text-slate-400 mt-1">Total Eco-Points</div>
          </div>
        </div>

        {/* Update Form */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="font-semibold text-white mb-4">Edit Profile Details</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={DEMO_USER.name}
                disabled
                className="w-full glass bg-transparent border border-white/5 rounded-xl px-4 py-2.5 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Email Address</label>
              <input
                type="email"
                value={DEMO_USER.email}
                disabled
                className="w-full glass bg-transparent border border-white/5 rounded-xl px-4 py-2.5 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full glass bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-green-500/50 outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Default Ward</label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full glass bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-green-500/50 outline-none"
              >
                {["Ward 5", "Ward 27", "Ward 67", "Ward 68", "Ward 76", "Ward 81", "Ward 82", "Ward 116", "Ward 150"].map((w) => (
                  <option key={w} value={w} className="bg-[#0d1a2b]">{w}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saved ? (
                <span className="text-green-400 text-sm font-medium">✓ Changes saved successfully!</span>
              ) : <span />}
              <button type="submit" className="btn-primary py-2 text-sm">
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Eco points history */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="font-semibold text-white mb-4">🌱 Eco-Points Log</h3>
          <div className="space-y-3">
            {ECO_LOGS.map((log) => (
              <div key={log.id} className="glass-light rounded-xl p-3 flex justify-between items-center border border-white/5">
                <div>
                  <div className="text-sm text-white font-medium">{log.reason}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{log.date}</div>
                </div>
                <div className="text-green-400 font-bold text-sm">+{log.points} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
