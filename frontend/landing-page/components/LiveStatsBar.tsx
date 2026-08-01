"use client";
import { useEffect, useState } from "react";

const STATS = [
  { label: "Garbage Reports Processed", value: 12480, suffix: "+" },
  { label: "Verified Cleanups", value: 8634, suffix: "" },
  { label: "Tons Cleared", value: 42180, suffix: "+" },
  { label: "Bengaluru Wards Covered", value: 198, suffix: "" },
];

function AnimatedNumber({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const step = target / (duration / 16);
    let val = 0;
    const timer = setInterval(() => {
      val = Math.min(val + step, target);
      setCurrent(Math.floor(val));
      if (val >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{current.toLocaleString()}</>;
}

export default function LiveStatsBar() {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="surface-card p-6 border border-white/10 bg-[#10251F]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Stats Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full lg:w-auto text-left">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold font-heading text-white tracking-tight">
                  <AnimatedNumber target={stat.value} />
                  <span className="text-[#D6A84A]">{stat.suffix}</span>
                </div>
                <div className="text-caption text-[#AEB9B5] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Authentic Live Status Footer Timestamp */}
          <div className="w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/[0.08] lg:pl-8 flex items-center justify-between lg:justify-end gap-3 text-xs font-mono text-[#AEB9B5]">
            <div className="flex items-center gap-2">
              <span className="pulse-mint" />
              <span>Database Status: Active</span>
            </div>
            <span className="text-[#5CE0A5] bg-[#0a1814] px-2.5 py-1 rounded-md border border-white/5">
              Synced: 2 mins ago
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
