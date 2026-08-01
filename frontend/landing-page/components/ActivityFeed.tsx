"use client";

const RECENT_ACTIVITIES = [
  {
    id: "REP-9921",
    user: "Ananya K.",
    action: "Submitted garbage report with GPS",
    ward: "Ward 76 (Richmond Town)",
    time: "2 mins ago",
    status: "Verified",
    badgeColor: "text-[#5CE0A5] bg-[#5CE0A5]/10 border-[#5CE0A5]/30",
  },
  {
    id: "VRP-0412",
    user: "Sanitation Fleet #KA-01-1234",
    action: "Assigned to High-Severity dump site",
    ward: "Ward 68 (Koramangala)",
    time: "8 mins ago",
    status: "In Transit",
    badgeColor: "text-[#D6A84A] bg-[#D6A84A]/10 border-[#D6A84A]/30",
  },
  {
    id: "CLR-8810",
    user: "Ravi Kumar (Team Alpha)",
    action: "Submitted post-cleanup verification photo",
    ward: "Ward 150 (Bellandur)",
    time: "15 mins ago",
    status: "Completed",
    badgeColor: "text-white bg-white/10 border-white/20",
  },
  {
    id: "ECO-4419",
    user: "Suresh B.",
    action: "Earned +50 Eco-Points for report verification",
    ward: "Ward 82 (Garuda Mall)",
    time: "24 mins ago",
    status: "Points Credited",
    badgeColor: "text-[#5CE0A5] bg-[#5CE0A5]/10 border-[#5CE0A5]/30",
  },
];

export default function ActivityFeed() {
  return (
    <section id="activity" className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto text-left">
      <div className="surface-card p-8 border border-white/10 bg-[#10251F]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pulse-mint" />
              <span className="text-xs font-mono text-[#5CE0A5] uppercase tracking-wider">Live Municipal Activity Stream</span>
            </div>
            <h3 className="text-card-title font-heading text-white">Recent Incident & Cleanup Queue</h3>
          </div>
          <div className="text-xs font-mono text-[#AEB9B5] bg-[#0a1814] px-3 py-1.5 rounded-lg border border-white/5">
            Auto-refreshing every 30s
          </div>
        </div>

        {/* Activity Items List */}
        <div className="space-y-3">
          {RECENT_ACTIVITIES.map((act) => (
            <div
              key={act.id}
              className="surface-inset p-4 rounded-[12px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#10251F] border border-white/10 flex items-center justify-center font-mono font-bold text-white text-[11px]">
                  {act.user.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-medium flex items-center gap-2">
                    <span>{act.user}</span>
                    <span className="text-[#AEB9B5] font-normal">• {act.action}</span>
                  </div>
                  <div className="text-[#AEB9B5] text-[11px] mt-0.5">
                    {act.ward} <span className="font-mono text-white/50">({act.id})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right self-end sm:self-center">
                <span className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] border ${act.badgeColor}`}>
                  {act.status}
                </span>
                <span className="text-[#AEB9B5] font-mono text-[11px]">{act.time}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
