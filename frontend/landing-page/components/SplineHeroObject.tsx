"use client";
import { useEffect, useRef, useState } from "react";

export default function SplineHeroObject() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angleX = 0;
    let angleY = 0;

    const size = 300;
    canvas.width = size * 2; // High DPI resolution
    canvas.height = size * 2;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseRef.current.targetX = (e.clientX - cx) / (rect.width / 2);
      mouseRef.current.targetY = (e.clientY - cy) / (rect.height / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Render 3D Floating Interactive Scanner Orb
    const render = () => {
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      angleX += 0.015 + mouseRef.current.x * 0.02;
      angleY += 0.01 + mouseRef.current.y * 0.02;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // 1. Core Glass Sphere Gradient Glow
      const coreGradient = ctx.createRadialGradient(
        cx + mouseRef.current.x * 20,
        cy + mouseRef.current.y * 20,
        10,
        cx,
        cy,
        80
      );
      coreGradient.addColorStop(0, "rgba(92, 224, 165, 0.95)");
      coreGradient.addColorStop(0.4, "rgba(13, 148, 136, 0.7)");
      coreGradient.addColorStop(0.8, "rgba(6, 78, 59, 0.4)");
      coreGradient.addColorStop(1, "rgba(6, 78, 59, 0)");

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 75, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.shadowBlur = 35;
      ctx.shadowColor = "#5CE0A5";
      ctx.fill();
      ctx.restore();

      // 2. Outer Orbital Ring 1 (Emerald Wireframe 3D Rotation)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleX);
      ctx.scale(1, 0.35 + mouseRef.current.y * 0.1);
      ctx.beginPath();
      ctx.arc(0, 0, 115, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(92, 224, 165, 0.75)";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#5CE0A5";
      ctx.stroke();

      // Orbital Satellite Nodes on Ring 1
      for (let i = 0; i < 3; i++) {
        const nodeAngle = angleY * 2 + (i * Math.PI * 2) / 3;
        const nx = Math.cos(nodeAngle) * 115;
        const ny = Math.sin(nodeAngle) * 115;
        ctx.beginPath();
        ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#FFFFFF";
        ctx.fill();
      }
      ctx.restore();

      // 3. Counter-Rotating Orbital Ring 2 (Gold 3D Axis)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angleY * 1.3);
      ctx.scale(0.4 + mouseRef.current.x * 0.1, 1);
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(214, 168, 74, 0.65)";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#D6A84A";
      ctx.stroke();
      ctx.restore();

      // 4. Scanning Precision Grid Lines
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleX * 0.5);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      for (let r = 40; r <= 140; r += 30) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.setLineDash([4, 8]);
        ctx.stroke();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-[300px] h-[300px] flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-300 hover:scale-105"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(92,224,165,0.4)]"
      />
      {/* Dynamic 3D Tag Overlay */}
      <div className="absolute -bottom-2 bg-black/60 backdrop-blur-md border border-[#5CE0A5]/40 text-[#5CE0A5] font-mono text-[10px] uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#5CE0A5] animate-ping" />
        <span>Spline 3D AI Scanner Core</span>
      </div>
    </div>
  );
}
