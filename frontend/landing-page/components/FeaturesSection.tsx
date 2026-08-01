"use client";
import TiltCard from "./TiltCard";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto space-y-12 text-left">
      {/* Header with Specific Outcome Copy */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#10251F] border border-white/10 px-3 py-1 rounded-md text-xs font-mono text-[#5CE0A5]">
          <span>● Engineering Capabilities</span>
        </div>
        <h2 className="text-major-section font-heading text-white">
          Detect dumping, estimate volume, and dispatch fleets.
        </h2>
        <p className="text-body text-[#AEB9B5]">
          Every component performs a specific function in the municipal cleanup pipeline.
        </p>
      </div>

      {/* Asymmetric Pinterest / Masonry Layout with 3D Tilt Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* 1. Frameless Image & Detection UI Card (Span 7) */}
        <TiltCard className="md:col-span-7 surface-card surface-card-hover p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#D6A84A] uppercase tracking-wider">Module 01</span>
              <span className="text-xs font-mono text-[#5CE0A5] bg-[#0a1814] px-2 py-0.5 rounded border border-white/5">YOLOv11 + SAM2</span>
            </div>
            <h3 className="text-card-title font-heading text-white">
              AI identifies waste type and estimates volume in m²
            </h3>
            <p className="text-caption text-[#AEB9B5]">
              Smartphone photos uploaded by citizens are parsed in under 450ms. Bounding boxes isolate plastic, organic, and hazardous waste.
            </p>
          </div>

          {/* Product UI Graphic Inside Card */}
          <div className="surface-inset p-4 rounded-[12px] space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-white border-b border-white/10 pb-2">
              <span className="font-bold">Inference Output #3091</span>
              <span className="text-[#5CE0A5]">Confidence: 94.8%</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#10251F] p-2.5 rounded-lg border border-white/5">
                <div className="text-[11px] text-[#AEB9B5]">Garbage Area</div>
                <div className="text-sm font-bold text-white mt-0.5">28.5 m²</div>
              </div>
              <div className="bg-[#10251F] p-2.5 rounded-lg border border-white/5">
                <div className="text-[11px] text-[#AEB9B5]">Primary Waste</div>
                <div className="text-sm font-bold text-[#D6A84A] mt-0.5">Plastic/Commercial</div>
              </div>
              <div className="bg-[#10251F] p-2.5 rounded-lg border border-white/5">
                <div className="text-[11px] text-[#AEB9B5]">Severity Score</div>
                <div className="text-sm font-bold text-[#5CE0A5] mt-0.5">88 / 100</div>
              </div>
            </div>
          </div>
        </TiltCard>

        {/* 2. Solid Inset Route Solver Card (Span 5) */}
        <TiltCard className="md:col-span-5 surface-card surface-card-hover p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#D6A84A] uppercase tracking-wider">Module 02</span>
              <span className="text-xs font-mono text-[#5CE0A5] bg-[#0a1814] px-2 py-0.5 rounded border border-white/5">Google OR-Tools</span>
            </div>
            <h3 className="text-card-title font-heading text-white">
              Optimize municipal cleanup truck routes
            </h3>
            <p className="text-caption text-[#AEB9B5]">
              Vehicle Routing Problem (VRP) solver matches active garbage reports with the nearest available sanitation vehicle based on capacity.
            </p>
          </div>

          <div className="surface-inset p-4 rounded-[12px] space-y-2 text-xs font-mono">
            <div className="flex justify-between text-white border-b border-white/10 pb-1.5">
              <span>Optimized Route #VRP-04</span>
              <span className="text-[#5CE0A5]">3 Stops</span>
            </div>
            <div className="flex justify-between text-[#AEB9B5]">
              <span>Total Distance:</span>
              <span className="text-white font-bold">27.4 km</span>
            </div>
            <div className="flex justify-between text-[#AEB9B5]">
              <span>Estimated Travel Time:</span>
              <span className="text-white font-bold">2h 35m</span>
            </div>
            <div className="flex justify-between text-[#AEB9B5]">
              <span>Fuel Saved:</span>
              <span className="text-[#5CE0A5] font-bold">3.8 Liters</span>
            </div>
          </div>
        </TiltCard>

        {/* 3. Horizontal Code & PostGIS Spatial Card (Span 5) */}
        <TiltCard className="md:col-span-5 surface-card surface-card-hover p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#D6A84A] uppercase tracking-wider">Module 03</span>
              <span className="text-xs font-mono text-[#5CE0A5] bg-[#0a1814] px-2 py-0.5 rounded border border-white/5">PostGIS 3.4</span>
            </div>
            <h3 className="text-card-title font-heading text-white">
              Spatial queries index coordinates & ward boundaries
            </h3>
            <p className="text-caption text-[#AEB9B5]">
              PostgreSQL geospatial indexes calculate report density per square kilometer and alert ward sanitation officers in real time.
            </p>
          </div>

          <div className="surface-inset p-3.5 rounded-[12px] font-mono text-[11px] text-[#5CE0A5] space-y-1 overflow-x-auto">
            <div><span className="text-white">SELECT</span> ward_id, ST_ClusterDBSCAN(...)</div>
            <div><span className="text-white">OVER</span> (ORDER BY created_at) <span className="text-white">AS</span> cluster_id</div>
            <div><span className="text-white">FROM</span> garbage_reports</div>
            <div><span className="text-white">WHERE</span> ST_DWithin(geom, user_location, 500);</div>
          </div>
        </TiltCard>

        {/* 4. Gamified Citizen Rewards Card (Span 7) */}
        <TiltCard className="md:col-span-7 surface-card surface-card-hover p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#D6A84A] uppercase tracking-wider">Module 04</span>
              <span className="text-xs font-mono text-[#5CE0A5] bg-[#0a1814] px-2 py-0.5 rounded border border-white/5">Eco-Points Ledger</span>
            </div>
            <h3 className="text-card-title font-heading text-white">
              Gamified eco-points incentivize citizen participation
            </h3>
            <p className="text-caption text-[#AEB9B5]">
              Citizens earn 50 eco-points for verified reports, 100 bonus points when municipal crews complete cleanup, redeemable for public transit discounts.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="surface-inset p-3 rounded-lg">
              <div className="text-lg font-bold text-white font-mono">+50 pts</div>
              <div className="text-[10px] text-[#AEB9B5] uppercase font-mono mt-1">Valid Report</div>
            </div>
            <div className="surface-inset p-3 rounded-lg">
              <div className="text-lg font-bold text-[#5CE0A5] font-mono">+100 pts</div>
              <div className="text-[10px] text-[#AEB9B5] uppercase font-mono mt-1">Resolved</div>
            </div>
            <div className="surface-inset p-3 rounded-lg">
              <div className="text-lg font-bold text-[#D6A84A] font-mono">Rank #4</div>
              <div className="text-[10px] text-[#AEB9B5] uppercase font-mono mt-1">Ward Leader</div>
            </div>
            <div className="surface-inset p-3 rounded-lg">
              <div className="text-lg font-bold text-white font-mono">1,450</div>
              <div className="text-[10px] text-[#AEB9B5] uppercase font-mono mt-1">Total Earned</div>
            </div>
          </div>
        </TiltCard>

      </div>
    </section>
  );
}
