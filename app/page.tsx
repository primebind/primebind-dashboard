"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

type Milestone = {
  id: string;
  date: string;
  label: string;
  done: boolean;
};

const DEFAULT_MILESTONES: Milestone[] = [
  { id: "1", date: "~June 2026", label: "Samples arrive", done: false },
  { id: "2", date: "June 2026", label: "Activate pre-launch deposit page", done: false },
  { id: "3", date: "July 2026", label: "Pre-launch giveaway", done: false },
  { id: "4", date: "July 2026", label: "Reddit 'I built this' post", done: false },
  { id: "5", date: "Aug 1", label: "Send review units to 10–15 creators", done: false },
  { id: "6", date: "Aug 14", label: "KS identity/payment confirmed", done: false },
  { id: "7", date: "Aug 21", label: "Submit campaign for KS review", done: false },
  { id: "8", date: "Aug 29–31", label: "Final emails to pre-launch list", done: false },
  { id: "9", date: "Sept 1 — 8 AM EST", label: "LAUNCH", done: false },
];

export default function Overview() {
  const launch = new Date("2026-09-01");
  const today = new Date();
  const daysUntil = Math.ceil((launch.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("pb_timeline");
    setMilestones(saved ? JSON.parse(saved) : DEFAULT_MILESTONES);
  }, []);

  function save(updated: Milestone[]) {
    setMilestones(updated);
    localStorage.setItem("pb_timeline", JSON.stringify(updated));
  }

  function toggle(id: string) {
    save(milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m)));
  }

  function remove(id: string) {
    save(milestones.filter((m) => m.id !== id));
  }

  function add() {
    if (!newLabel.trim()) return;
    save([...milestones, { id: Date.now().toString(), date: newDate, label: newLabel.trim(), done: false }]);
    setNewLabel("");
    setNewDate("");
    setShowAdd(false);
  }

  const active = milestones.filter((m) => !m.done);
  const completed = milestones.filter((m) => m.done);

  const stats = [
    { label: "Days to Launch", value: daysUntil.toString(), sub: "Sept 1, 2026" },
    { label: "KS Goal", value: "$20,000", sub: "Break-even $18,300" },
    { label: "Influencers", value: "0", sub: "Target: 20" },
    { label: "Email List", value: "0", sub: "Target: 1,000+ pre-launch" },
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

      {/* Launch Timeline */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Launch Timeline</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 text-xs text-[#555] hover:text-white transition-colors"
          >
            <Plus size={13} /> Add
          </button>
        </div>

        {showAdd && (
          <div className="flex gap-2 mb-5 items-center">
            <input
              className="input flex-1"
              placeholder="Milestone label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              autoFocus
            />
            <input
              className="input w-32"
              placeholder="Date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <button onClick={add} className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-medium hover:bg-[#e0e0e0]">Add</button>
            <button onClick={() => setShowAdd(false)} className="text-[#555] hover:text-white"><X size={14} /></button>
          </div>
        )}

        <div className="space-y-3">
          {active.map((m) => (
            <div key={m.id} className="flex items-start gap-3 group">
              <button
                onClick={() => toggle(m.id)}
                className="mt-0.5 w-4 h-4 rounded-full border border-[#444] shrink-0 hover:border-white transition-colors flex items-center justify-center"
              />
              <div className="flex-1 flex items-baseline justify-between">
                <p className="text-sm text-white">{m.label}</p>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <p className="text-xs text-[#555]">{m.date}</p>
                  <button onClick={() => remove(m.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-red-500">
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#444] mb-4">Completed</h2>
          <div className="space-y-3">
            {completed.map((m) => (
              <div key={m.id} className="flex items-start gap-3 group">
                <button
                  onClick={() => toggle(m.id)}
                  className="mt-0.5 w-4 h-4 rounded-full bg-[#333] shrink-0 hover:bg-[#444] transition-colors"
                />
                <div className="flex-1 flex items-baseline justify-between">
                  <p className="text-sm text-[#444] line-through">{m.label}</p>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <p className="text-xs text-[#333]">{m.date}</p>
                    <button onClick={() => remove(m.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#333] hover:text-red-500">
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* KS Tiers */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-3">KS Tiers</p>
          <div className="space-y-2 text-sm">
            {[
              ["Early Bird", "$39"],
              ["Solo", "$45"],
              ["Duo", "$83"],
              ["Prime", "$159"],
              ["Collector", "$229"],
              ["The Archive", "$319"],
            ].map(([tier, price]) => (
              <div key={tier} className="flex justify-between text-[#aaa]">
                <span>{tier}</span>
                <span className="text-white">{price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Colorways */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-3">Colorways</p>
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

        {/* Financials */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-3">Financials</p>
          <div className="space-y-2 text-sm text-[#aaa]">
            <div className="flex justify-between"><span>Break-even</span><span className="text-white">$18,300</span></div>
            <div className="flex justify-between"><span>KS Goal</span><span className="text-white">$20,000</span></div>
            <div className="flex justify-between"><span>Target</span><span className="text-white">$30,000</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
