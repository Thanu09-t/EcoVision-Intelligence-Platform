"use client";
import Link from "next/link";
import { AnimatedHeading } from "./AnimatedHeading";
import { FadeIn } from "./FadeIn";
import SplineHeroObject from "./SplineHeroObject";
import MagneticButton from "./MagneticButton";

const NAV_LINKS = [
  { href: "/citizen", label: "Citizen Portal" },
  { href: "/dashboard", label: "Municipal Dashboard" },
  { href: "/docs", label: "API Docs" },
  { href: "#features", label: "Capabilities" },
  { href: "#map", label: "Ward Heatmap" },
  { href: "#workflow", label: "SLA Workflow" },
];

const CITIZEN_URL = "/citizen";
const MUNICIPAL_URL = "/dashboard";

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden flex flex-col justify-between">
      {/* 1. Full-Screen Background Video - Plays Raw with NO dimming or overlays (UNTOUCHED) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
          type="video/mp4"
        />
      </video>

      {/* 2. Top Navbar with Page Padding */}
      <div className="relative z-20 px-6 md:px-12 lg:px-16 pt-6">
        <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
          {/* Left: EcoVision AI Logo */}
          <Link href="/" className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            <span>EcoVision AI</span>
            <span className="text-xs font-mono text-[#5CE0A5] bg-[#5CE0A5]/10 px-2 py-0.5 rounded border border-[#5CE0A5]/30 hidden sm:inline-block">
              v2.4.0
            </span>
          </Link>

          {/* Center Links (hidden on mobile, visible md+) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white hover:text-[#5CE0A5] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right CTA Magnetic Button */}
          <MagneticButton href={`${CITIZEN_URL}/login`}>
            <span className="bg-white text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors block">
              Sign In →
            </span>
          </MagneticButton>
        </nav>
      </div>

      {/* 3. Hero Content Pushed to Bottom of Viewport */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-12 lg:pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:items-end gap-8">
          
          {/* Left Column: EcoVision AI Heading, Subheading & CTAs */}
          <div className="space-y-4">
            {/* Character-by-Character Entrance Heading */}
            <AnimatedHeading
              text={"Smart City Intelligence\nfor Cleaner Communities."}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-[#FFFFFF] mb-4 leading-tight font-serif"
              initialDelay={200}
              charDelay={30}
              duration={500}
            />

            {/* Subheading with 800ms FadeIn */}
            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-5 max-w-xl">
                Citizens report waste in under 20 seconds. AI identifies dumping severity, calculates volume in m², and dispatches municipal truck routes automatically.
              </p>
            </FadeIn>

            {/* Magnetic CTA Buttons Row with 1200ms FadeIn */}
            <FadeIn delay={1200} duration={1000} className="flex flex-wrap items-center gap-4">
              <MagneticButton href={`${CITIZEN_URL}/report/new`}>
                <span className="bg-[#5CE0A5] text-slate-950 font-bold px-8 py-3 rounded-lg font-medium hover:bg-[#48cb92] transition-colors block">
                  Report Waste Now →
                </span>
              </MagneticButton>

              <MagneticButton href={MUNICIPAL_URL}>
                <span className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors block">
                  Officer Command Center
                </span>
              </MagneticButton>

              <MagneticButton href="/docs">
                <span className="liquid-glass border border-white/10 text-[#D6A84A] px-5 py-3 rounded-lg font-mono text-xs font-semibold hover:border-[#D6A84A]/40 transition-colors block">
                  Interactive API Docs (/docs)
                </span>
              </MagneticButton>
            </FadeIn>
          </div>

          {/* Right Column: Floating Spline 3D Hero Object + Glass Tag */}
          <div className="flex flex-col items-start lg:items-end justify-end mt-8 lg:mt-0 space-y-4">
            <FadeIn delay={1000} duration={1000}>
              <SplineHeroObject />
            </FadeIn>

            <FadeIn delay={1400} duration={1000}>
              <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                <span className="text-lg md:text-xl lg:text-2xl font-light text-white">
                  Detect. Analyze. Prioritize. Clean.
                </span>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}
