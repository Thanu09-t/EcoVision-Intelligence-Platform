"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "#master-launchpad", label: "🌐 Launch All" },
  { href: "#features", label: "Capabilities" },
  { href: "#activity", label: "Live Dispatch" },
  { href: "#map", label: "Ward Heatmap" },
  { href: "#workflow", label: "SLA Workflow" },
  { href: "#about", label: "Architecture" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#081B16]/95 border-b border-white/[0.08] shadow-xl py-3"
          : "bg-[#081B16]/80 border-b border-white/[0.04] py-4"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left Brand & Version Tag */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#10251F] border border-white/10 flex items-center justify-center text-lg shadow-sm">
              🌍
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-heading text-white tracking-tight">
                  EcoVision<span className="text-[#D6A84A]">AI</span>
                </span>
                <span className="text-[10px] font-mono text-[#5CE0A5] bg-[#5CE0A5]/10 px-1.5 py-0.5 rounded border border-[#5CE0A5]/20">
                  v2.4.0
                </span>
              </div>
              <span className="text-[11px] text-[#AEB9B5] font-mono hidden sm:block">
                Municipal Waste Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center gap-7 text-caption font-medium">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[#AEB9B5] hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right Actions & Status Badge */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#master-launchpad"
              className="flex items-center gap-2 text-xs font-mono text-[#5CE0A5] bg-[#10251F] px-3.5 py-1.5 rounded-lg border border-[#5CE0A5]/30 hover:bg-[#5CE0A5] hover:text-slate-950 transition-all font-bold"
            >
              <span>🌐 Launch All Portals</span>
            </a>

            <Link
              href="http://localhost:3001/login"
              className="btn-gold-primary text-xs py-2 px-4"
            >
              Sign In →
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-[#AEB9B5] hover:text-white border border-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#081B16] border-b border-white/10 px-6 py-6 space-y-4">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-[#AEB9B5] hover:text-white text-base py-1"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <Link
              href="http://localhost:3001/login"
              onClick={() => setMenuOpen(false)}
              className="btn-gold-primary text-sm justify-center py-2.5"
            >
              Sign In →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
