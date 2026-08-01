"use client";

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Photo & GPS Capture",
    desc: "Citizen uploads a photo. GPS EXIF metadata tags exact latitude/longitude.",
    icon: "📱",
    outcome: "< 20 Seconds",
  },
  {
    step: "02",
    title: "YOLOv11 & SAM2 Inference",
    desc: "AI identifies waste classification and calculates pile area in m².",
    icon: "🤖",
    outcome: "450ms Latency",
  },
  {
    step: "03",
    title: "PostGIS Ward Match",
    desc: "Geospatial query assigns report to the precise municipal ward boundary.",
    icon: "📍",
    outcome: "Ward Polygon Match",
  },
  {
    step: "04",
    title: "VRP Fleet Dispatch",
    desc: "Google OR-Tools solver assigns nearest available sanitation truck.",
    icon: "🚛",
    outcome: "3.8L Fuel Saved",
  },
  {
    step: "05",
    title: "After-Photo Proof",
    desc: "Sanitation crew uploads post-cleanup photo for verification.",
    icon: "📷",
    outcome: "Verified Cleaned",
  },
  {
    step: "06",
    title: "Eco-Points Credited",
    desc: "Citizen receives +50 eco-points credited to their profile.",
    icon: "🏆",
    outcome: "+50 Eco-Points",
  },
];

export default function ComplaintWorkflow() {
  return (
    <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto space-y-12 text-left">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#10251F] border border-white/10 px-3 py-1 rounded-md text-xs font-mono text-[#5CE0A5]">
          <span>● End-to-End SLA Pipeline</span>
        </div>
        <h2 className="text-major-section font-heading text-white">
          Automated cleanup workflow from capture to dispatch.
        </h2>
        <p className="text-body text-[#AEB9B5]">
          Every complaint follows a structured 6-stage verification and resolution process.
        </p>
      </div>

      {/* Horizontal Workflow Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {WORKFLOW_STEPS.map((item) => (
          <div key={item.step} className="surface-card surface-card-hover p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-mono font-bold text-[#5CE0A5] bg-[#0a1814] px-2 py-0.5 rounded border border-white/5">
                  {item.step}
                </span>
              </div>
              <div>
                <h4 className="text-card-title text-base font-bold font-heading text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-caption text-[#AEB9B5] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] text-[11px] font-mono text-[#D6A84A]">
              ✓ {item.outcome}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
