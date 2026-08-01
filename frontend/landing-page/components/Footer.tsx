"use client";
import Link from "next/link";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#081B16] border-t border-white/[0.08] text-[#AEB9B5] pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-[1280px] mx-auto space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand & Mission (Span 2) */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#10251F] border border-white/10 flex items-center justify-center text-lg shadow-sm">
                🌍
              </div>
              <span className="text-xl font-bold font-heading tracking-tight text-white">
                EcoVision<span className="text-[#D6A84A]">AI</span>
              </span>
            </Link>
            <p className="text-caption text-[#AEB9B5] leading-relaxed max-w-sm">
              Municipal Waste Intelligence Platform. Automated illegal dump detection, volume estimation, and vehicle routing.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-[#5CE0A5]">
              <span className="pulse-mint" />
              <span>Production Deployment • Version 2.4.0</span>
            </div>
          </div>

          {/* Core Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-heading text-white uppercase tracking-wider">Modules</h4>
            <ul className="space-y-2 text-caption">
              <li><a href="#features" className="hover:text-white transition-colors">YOLOv11 Detection</a></li>
              <li><a href="#map" className="hover:text-white transition-colors">PostGIS Heatmap</a></li>
              <li><a href="#workflow" className="hover:text-white transition-colors">SLA Workflow</a></li>
              <li><a href="http://localhost:3002/routes" className="hover:text-white transition-colors">OR-Tools Dispatch</a></li>
            </ul>
          </div>

          {/* User Portals & API */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-heading text-white uppercase tracking-wider">Portals & API</h4>
            <ul className="space-y-2 text-caption">
              <li><a href="http://localhost:3001" className="hover:text-white transition-colors">Citizen Upload Portal</a></li>
              <li><a href="http://localhost:3002" className="hover:text-white transition-colors">Municipal Officer Command</a></li>
              <li><a href="http://localhost:8000/docs" className="hover:text-white transition-colors">FastAPI Interactive Docs</a></li>
              <li><a href="http://localhost:8000/health" className="hover:text-white transition-colors">API Healthcheck Status</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Back to Top */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-caption font-mono">
          <div>
            © 2026 EcoVision AI Infrastructure. Built for municipal operations.
          </div>
          <div className="flex items-center gap-6">
            <a href="http://localhost:8000/docs" className="hover:text-white transition-colors">API Endpoint Docs</a>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-[#5CE0A5] hover:text-white transition-colors font-semibold"
            >
              <span>Back to Top</span>
              <span>↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
