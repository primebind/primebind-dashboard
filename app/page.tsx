export default function Overview() {
  const launch = new Date("2026-09-01");
  const today = new Date();
  const daysUntil = Math.ceil((launch.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const stats = [
    { label: "Days to Launch", value: daysUntil.toString(), sub: "Sept 1, 2026" },
    { label: "KS Goal", value: "$25,000", sub: "Break-even $18,300" },
    { label: "Influencers", value: "0", sub: "Target: 20" },
    { label: "Email List", value: "0", sub: "Target: 1,000+ pre-launch" },
  ];

  const milestones = [
    { date: "~June 2026", label: "Samples arrive", done: false },
    { date: "June 2026", label: "Activate pre-launch deposit page", done: false },
    { date: "July 2026", label: "Pre-launch giveaway", done: false },
    { date: "July 2026", label: "Reddit 'I built this' post", done: false },
    { date: "Aug 1", label: "Send review units to 10–15 creators", done: false },
    { date: "Aug 14", label: "KS identity/payment confirmed", done: false },
    { date: "Aug 21", label: "Submit campaign for KS review", done: false },
    { date: "Aug 29–31", label: "Final emails to pre-launch list", done: false },
    { date: "Sept 1 — 8 AM EST", label: "LAUNCH", done: false },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-[#888] text-sm mt-1">PrimeBind command center</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#111] border border-[#222] rounded-xl p-5">
            <p className="text-[#888] text-xs uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-[#555] text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#888] mb-6">
          Launch Timeline
        </h2>
        <div className="space-y-4">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${m.done ? "bg-white" : "bg-[#333]"}`} />
              <div className="flex-1 flex items-baseline justify-between">
                <p className={`text-sm ${m.done ? "line-through text-[#555]" : "text-white"}`}>
                  {m.label}
                </p>
                <p className="text-xs text-[#555] ml-4 shrink-0">{m.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">KS Tiers</p>
          <div className="space-y-1 text-sm">
            {[
              ["Early Bird", "$39", "100 slots"],
              ["Solo", "$45", ""],
              ["Duo", "$83", ""],
              ["Prime", "$159", "Sweet spot"],
              ["Collector", "$229", ""],
              ["The Archive", "$319", "Upper funnel"],
            ].map(([tier, price, note]) => (
              <div key={tier} className="flex justify-between text-[#aaa]">
                <span>{tier}</span>
                <span className="text-white">{price} {note && <span className="text-[#555] text-xs ml-1">{note}</span>}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Colorways</p>
          <div className="space-y-2 text-sm">
            {[
              { name: "Obsidian", color: "#1a1a1a", launch: true },
              { name: "Pearl", color: "#e8e8e8", launch: true },
              { name: "Rose", color: "#d4a0a0", launch: true },
              { name: "Crimson", color: "#8b0000", launch: true },
              { name: "Jade", color: "#2d5a3d", launch: false },
              { name: "Abyss", color: "#1a2744", launch: false },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-[#aaa]">
                <div className="w-3 h-3 rounded-full border border-[#444]" style={{ background: c.color }} />
                <span>{c.name}</span>
                {!c.launch && <span className="text-[#555] text-xs">stretch</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Financials</p>
          <div className="space-y-2 text-sm text-[#aaa]">
            <div className="flex justify-between"><span>Break-even</span><span className="text-white">$18,300</span></div>
            <div className="flex justify-between"><span>KS Goal</span><span className="text-white">$25,000</span></div>
            <div className="flex justify-between"><span>Target</span><span className="text-white">$100,000</span></div>
            <div className="flex justify-between"><span>Contribution margin</span><span className="text-white">~47%</span></div>
            <div className="flex justify-between"><span>Blended avg pledge</span><span className="text-white">$175–185</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
