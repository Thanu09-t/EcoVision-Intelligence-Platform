"use client";
import { useState } from "react";
import Link from "next/link";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";

const DEMO_CREDENTIALS = [
  { label: "Citizen", email: "citizen@demo.com", password: "demo1234", role: "citizen" },
  { label: "Municipal Officer", email: "officer@demo.com", password: "demo1234", role: "municipal" },
  { label: "System Admin", email: "admin@ecovision.ai", password: "admin1234", role: "admin" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemoClick = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed. Please check your credentials.");
      }

      // Save token and user info to shared cookies
      const setCookie = (name: string, value: string, days: number) => {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "; expires=" + date.toUTCString();
        document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; domain=localhost";
      };

      setCookie("token", data.access_token, 7);
      setCookie("user", JSON.stringify(data.user), 7);

      // Redirect based on role
      const role = data.user.role;
      if (role === "admin") {
        window.location.href = "http://localhost:3002/admin";
      } else if (role === "municipal") {
        window.location.href = "http://localhost:3002/";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check if the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#041611] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Ambient Floating Canvas Particles */}
      <FloatingParticles />

      {/* Background ambient light effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#163832]/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[#235347]/40 blur-[120px] pointer-events-none" />

      {/* Main Glassmorphism 3D Tilt Card */}
      <TiltCard className="w-full max-w-md bg-[#0a241c] rounded-3xl p-8 border border-white/10 shadow-2xl relative z-20">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="http://localhost:3000" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#5CE0A5] flex items-center justify-center text-[#041611] font-bold text-xl shadow-lg shadow-[#5CE0A5]/20 group-hover:scale-110 transition-transform">
              🌍
            </div>
            <span className="text-xl font-bold text-white font-serif">
              <span className="text-[#5CE0A5]">Eco</span>Vision <span className="text-white">AI</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white mt-2 font-serif">Welcome Back</h2>
          <p className="text-[#CBD5E1] text-sm mt-1">Sign in to access your garbage mapping dashboard</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/40 border border-red-500/40 text-red-200 text-sm flex gap-2">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-[#CBD5E1] mb-1.5 block font-medium uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full bg-[#041611]/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#5CE0A5] transition-all placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="text-xs text-[#CBD5E1] mb-1.5 block font-medium uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#041611]/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#5CE0A5] transition-all placeholder:text-slate-500"
            />
          </div>

          <MagneticButton className="w-full">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D6A84A] to-[#e5b85b] text-slate-900 py-3 rounded-xl justify-center text-sm font-bold shadow-lg shadow-[#D6A84A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </MagneticButton>
        </form>

        {/* Demo Credentials quick fill */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-[#CBD5E1] text-center mb-3 font-medium uppercase tracking-wider">Quick Fill Demo Roles</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_CREDENTIALS.map((demo) => (
              <MagneticButton key={demo.label} onClick={() => handleDemoClick(demo.email, demo.password)}>
                <div
                  className="bg-white/10 hover:bg-[#5CE0A5] hover:text-slate-900 border border-white/10 text-white transition-all text-[11px] py-2 px-1.5 rounded-lg font-medium text-center truncate cursor-pointer"
                  title={`Log in as ${demo.label}`}
                >
                  {demo.label}
                </div>
              </MagneticButton>
            ))}
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
