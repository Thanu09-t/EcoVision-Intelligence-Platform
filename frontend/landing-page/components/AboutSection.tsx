"use client";

const MILESTONES = [
  { phase: "v1.0", title: "Dataset Ingestion & EXIF GPS Extraction", desc: "Built pipeline for parsing smartphone photos, extracting EXIF lat/long, and storing records." },
  { phase: "v1.5", title: "YOLOv11 Detector & SAM 2 Segmentor", desc: "Trained object detection model on TACO dataset and integrated SAM 2 for m² surface calculation." },
  { phase: "v2.0", title: "PostGIS Spatial Engine & Leaflet", desc: "Indexed 198 Bengaluru wards in PostGIS 3.4 for real-time spatial heatmaps." },
  { phase: "v2.4", title: "OR-Tools VRP Fleet Dispatch & LLM Directives", desc: "Implemented Vehicle Routing Problem (VRP) solver and automated PDF report generator." },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto space-y-12 text-left">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#10251F] border border-white/10 px-3 py-1 rounded-md text-xs font-mono text-[#5CE0A5]">
          <span>● Technical Architecture</span>
        </div>
        <h2 className="text-major-section font-heading text-white">
          Built for scale, precision, and low latency.
        </h2>
        <p className="text-body text-[#AEB9B5]">
          Software milestones and open-source infrastructure powering EcoVision AI.
        </p>
      </div>

      {/* Engineering Roadmap Timeline */}
      <div className="surface-card p-8 border border-white/10 bg-[#10251F]">
        <h3 className="text-card-title font-heading text-white mb-6">Engineering Roadmap</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {MILESTONES.map((item) => (
            <div key={item.phase} className="surface-inset p-5 rounded-[12px] space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#5CE0A5] font-bold">{item.phase}</span>
                <span className="text-white/60">Deployed</span>
              </div>
              <h4 className="text-sm font-bold font-heading text-white">{item.title}</h4>
              <p className="text-caption text-[#AEB9B5] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Production Tech Dependencies */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="surface-card p-4 border border-white/10">
          <div className="text-[#D6A84A] font-bold mb-1">Vision Engine</div>
          <div className="text-white">YOLOv11 + SAM2</div>
        </div>
        <div className="surface-card p-4 border border-white/10">
          <div className="text-[#D6A84A] font-bold mb-1">Geospatial DB</div>
          <div className="text-white">PostGIS 3.4 / Postgres 15</div>
        </div>
        <div className="surface-card p-4 border border-white/10">
          <div className="text-[#D6A84A] font-bold mb-1">Route Solver</div>
          <div className="text-white">Google OR-Tools VRP</div>
        </div>
        <div className="surface-card p-4 border border-white/10">
          <div className="text-[#D6A84A] font-bold mb-1">REST API</div>
          <div className="text-white">FastAPI Python 3.11</div>
        </div>
      </div>
    </section>
  );
}
