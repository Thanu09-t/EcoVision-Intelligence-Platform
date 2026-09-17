"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/dashboard/map", icon: "🗺️", label: "Map View" },
  { href: "/dashboard/reports", icon: "📋", label: "Reports" },
  { href: "/dashboard/routes", icon: "🚛", label: "Routes" },
  { href: "/dashboard/analytics", icon: "📈", label: "Analytics" },
  { href: "/dashboard/ai-reports", icon: "🤖", label: "AI Reports" },
  { href: "/dashboard/admin", icon: "🚗", label: "Vehicles" },
  { href: "/dashboard/team", icon: "👥", label: "Teams" },
  { href: "/dashboard/notifications", icon: "🔔", label: "Notifications" },
  { href: "/dashboard/users", icon: "👤", label: "Users" },
  { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

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

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#041611] text-slate-300 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:flex border-r border-white/10`}
      >
        {/* Logo */}
        <div className="px-5 py-4 flex flex-col gap-2 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#5CE0A5] flex items-center justify-center text-slate-950 font-black text-base shadow-md shadow-[#5CE0A5]/20 group-hover:scale-105 transition-transform">
              🍃
            </div>
            <div>
              <div className="font-extrabold text-sm text-white tracking-tight font-serif">Municipal Dashboard</div>
              <div className="text-[10px] text-[#5CE0A5] font-mono">EcoVision AI System</div>
            </div>
          </Link>
          <Link href="/" className="text-[10px] text-slate-500 hover:text-[#5CE0A5] font-mono transition-colors flex items-center gap-1">
            ← Back to Landing Page
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item, idx) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label + idx}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-[#5CE0A5] text-slate-950 shadow-md shadow-[#5CE0A5]/30 font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <Link href="/citizen" className="text-[11px] text-slate-400 hover:text-[#5CE0A5] font-mono transition-colors flex items-center gap-1.5">
            👤 Citizen Portal
          </Link>
          <Link href="/dashboard/logout" className="text-[11px] text-slate-400 hover:text-red-400 font-mono transition-colors flex items-center gap-1.5">
            → Sign Out
          </Link>
          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1.5 font-mono text-[#5CE0A5] text-[10px]">
              <span className="w-2 h-2 rounded-full bg-[#5CE0A5] animate-pulse" />
              Real-time Sync
            </span>
            <span className="text-slate-500 font-mono text-[10px]">v2.1</span>
          </div>
        </div>
      </aside>
    </>
  );
}
