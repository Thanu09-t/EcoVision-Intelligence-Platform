"use client";
import { useState, useRef } from "react";
import TiltCard from "./TiltCard";

export default function ProductReveal3D() {
  const [activeTab, setActiveTab] = useState<"yolo" | "sam" | "vrp">("yolo");
  const [rotation, setRotation] = useState({ x: 12, y: -15 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 12, rotY: -15 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotation.x,
      rotY: rotation.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setRotation({
      x: Math.max(-30, Math.min(30, dragStart.current.rotX - dy * 0.4)),
      y: Math.max(-45, Math.min(45, dragStart.current.rotY + dx * 0.4)),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <section id="product-reveal-3d" className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto text-left relative z-20">
      {/* Header */}
      <div className="max-w-3xl space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 bg-[#10251F] border border-[#5CE0A5]/30 px-3 py-1 rounded-md text-xs font-mono text-[#5CE0A5]">
          <span>● 3D Product Inspection Reveal</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-heading text-white">
          Interactive 3D Multi-Model AI Inspector
        </h2>
        <p className="text-body text-[#AEB9B5]">
          Drag to rotate the 3D inspection viewport. Toggle AI detection layers to inspect YOLOv11 bounding boxes, SAM 2 segmentation masks, and OR-Tools VRP route calculations in real-time.
        </p>
      </div>

      {/* Model Selector Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button
          onClick={() => setActiveTab("yolo")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "yolo"
              ? "bg-[#5CE0A5] text-black shadow-lg shadow-[#5CE0A5]/20"
              : "bg-[#10251F] text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          🎯 YOLOv11 Bounding Box (98.4%)
        </button>
        <button
          onClick={() => setActiveTab("sam")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "sam"
              ? "bg-[#D6A84A] text-black shadow-lg shadow-[#D6A84A]/20"
              : "bg-[#10251F] text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          📐 SAM 2 Surface Area (28.4 m²)
        </button>
        <button
          onClick={() => setActiveTab("vrp")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "vrp"
              ? "bg-[#38BDF8] text-black shadow-lg shadow-[#38BDF8]/20"
              : "bg-[#10251F] text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          🚚 OR-Tools VRP Dispatch Solver
        </button>
      </div>

      {/* 3D Viewport Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* 3D Interactive Canvas Box */}
        <div className="lg:col-span-2 relative h-[420px] rounded-3xl bg-[#0a1814] border border-white/15 overflow-hidden flex items-center justify-center p-6 select-none shadow-2xl">
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transition: isDragging ? "none" : "transform 0.4s ease-out",
            }}
          >
            {/* 3D Product Box Mockup Layer */}
            <div className="relative w-[320px] sm:w-[380px] h-[260px] bg-[#10251F] border-2 border-[#5CE0A5]/40 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between">
              
              {/* Top AI Bounding Overlay */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-mono font-bold text-white uppercase">Site #RPT-BLR-101</span>
                </div>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                  CRITICAL (96.8/100)
                </span>
              </div>

              {/* Dynamic Tab 3D Display Content */}
              {activeTab === "yolo" && (
                <div className="space-y-3 my-4">
                  <div className="border border-red-500/60 bg-red-500/10 rounded-xl p-3 relative">
                    <span className="absolute -top-2.5 left-3 bg-red-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                      YOLOv11: Plastic Heap (98.4%)
                    </span>
                    <p className="text-xs text-white font-serif mt-1">
                      High-density non-biodegradable commercial plastic dumping detected.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                    <div>Class: <span className="text-[#5CE0A5]">Plastic & Packaging</span></div>
                    <div>Conf: <span className="text-[#5CE0A5]">98.4%</span></div>
                  </div>
                </div>
              )}

              {activeTab === "sam" && (
                <div className="space-y-3 my-4">
                  <div className="border border-[#D6A84A]/60 bg-[#D6A84A]/10 rounded-xl p-3 relative">
                    <span className="absolute -top-2.5 left-3 bg-[#D6A84A] text-black font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                      SAM 2 Segmented Area: 28.4 m²
                    </span>
                    <p className="text-xs text-white font-serif mt-1">
                      Instance segmentation mask calculated estimated waste volume ~14.2 m³.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                    <div>Coverage: <span className="text-[#D6A84A]">28.4 m²</span></div>
                    <div>Tonnage: <span className="text-[#D6A84A]">~3.8 Tons</span></div>
                  </div>
                </div>
              )}

              {activeTab === "vrp" && (
                <div className="space-y-3 my-4">
                  <div className="border border-[#38BDF8]/60 bg-[#38BDF8]/10 rounded-xl p-3 relative">
                    <span className="absolute -top-2.5 left-3 bg-[#38BDF8] text-black font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                      OR-Tools Assigned: Vehicle KA-04-EV-8821
                    </span>
                    <p className="text-xs text-white font-serif mt-1">
                      Optimal 14.2 km cleanup route dispatched to Sanitation Team 3.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                    <div>Route ETA: <span className="text-[#38BDF8]">18 mins</span></div>
                    <div>SLA Target: <span className="text-[#38BDF8]">2.0 Hours</span></div>
                  </div>
                </div>
              )}

              {/* Bottom Instructions */}
              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>🖱️ Drag mouse to tilt in 3D</span>
                <span>EcoVision 3D Core</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Tilt Card */}
        <TiltCard className="surface-card p-8 border border-white/15 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0a1814] border border-[#5CE0A5]/30 flex items-center justify-center text-2xl">
            ⚡
          </div>
          <h3 className="text-2xl font-heading text-white">
            End-to-End AI Automation Pipeline
          </h3>
          <p className="text-sm text-[#AEB9B5] leading-relaxed">
            From raw smartphone uploads to automated OR-Tools route optimization, EcoVision AI continuously scans, segments, and dispatches cleanup teams with zero manual friction.
          </p>

          <div className="pt-4 border-t border-white/10 space-y-3 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-[#5CE0A5]">✓</span> YOLOv11 Garbage Detection
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#5CE0A5]">✓</span> SAM 2 Surface Area Segmentation
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#5CE0A5]">✓</span> Google OR-Tools VRP Dispatch
            </div>
          </div>
        </TiltCard>
      </div>
    </section>
  );
}
