"use client";

import { useState, useEffect } from "react";
import { Plus, X, GripVertical } from "lucide-react";

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
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDate, setNewDate] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pb_timeline");
    setMilestones(saved ? JSON.parse(saved) : DEFAULT_MILESTONES);
  }, []);

  function saveMilestones(updated: Milestone[]) {
    setMilestones(updated);
    localStorage.setItem("pb_timeline", JSON.stringify(updated));
  }

  function toggle(id: string) {
    saveMilestones(milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m)));
  }

  function remove(id: string) {
    saveMilestones(milestones.filter((m) => m.id !== id));
  }

  function add() {
    if (!newLabel.trim()) return;
    saveMilestones([...milestones, { id: Date.now().toString(), date: newDate, label: newLabel.trim(), done: false }]);
    setNewLabel("");
    setNewDate("");
    setShowAdd(false);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const active = milestones.filter((m) => !m.done);
    const done = milestones.filter((m) => m.done);
    const from = active.findIndex((m) => m.id === dragId);
    const to = active.findIndex((m) => m.id === targetId);
    const reordered = [...active];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    saveMilestones([...reordered, ...done]);
    setDragId(null);
    setDragOverId(null);
  }

  const active = milestones.filter((m) => !m.done);
  const completed = milestones.filter((m) => m.done);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-[#888] text-sm mt-1">PrimeBind command center</p>
      </div>

      {/* Launch Timeline */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Launch Timeline</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 text-xs text-[#555] hover:text-white transition-colors">
            <Plus size={13} /> Add
          </button>
        </div>

        {showAdd && (
          <div className="flex gap-2 mb-5 items-center">
            <input className="input flex-1" placeholder="Milestone label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} autoFocus />
            <input className="input w-32" placeholder="Date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            <button onClick={add} className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-medium hover:bg-[#e0e0e0]">Add</button>
            <button onClick={() => setShowAdd(false)} className="text-[#555] hover:text-white"><X size={14} /></button>
          </div>
        )}

        <div className="space-y-1">
          {active.map((m) => (
            <div
              key={m.id}
              draggable
              onDragStart={() => setDragId(m.id)}
              onDragOver={(e) => handleDragOver(e, m.id)}
              onDrop={() => handleDrop(m.id)}
              onDragEnd={() => { setDragId(null); setDragOverId(null); }}
              className={`flex items-center gap-3 group px-2 py-2 rounded-lg transition-colors cursor-default
                ${dragOverId === m.id && dragId !== m.id ? "bg-[#1a1a1a]" : ""}
                ${dragId === m.id ? "opacity-40" : ""}
              `}
            >
              <GripVertical size={14} className="text-[#333] group-hover:text-[#555] cursor-grab shrink-0" />
              <button
                onClick={() => toggle(m.id)}
                className="w-4 h-4 rounded-full border border-[#444] shrink-0 hover:border-white transition-colors"
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
              <div key={m.id} className="flex items-center gap-3 group">
                <button onClick={() => toggle(m.id)} className="w-4 h-4 rounded-full bg-[#333] shrink-0 hover:bg-[#444] transition-colors" />
                <div className="flex-1 flex items-baseline justify-between">
                  <p className="text-sm text-[#444] line-through">{m.label}</p>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <p className="text-xs text-[#333]">{m.date}</p>
                    <button onClick={() => remove(m.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#333] hover:text-red-500"><X size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Info */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Company</h2>
          <a href="https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResultDetail?inquirytype=EntityName&directionType=Initial&searchNameOrder=PRIMEBIND%20L26000048504&aggregateId=flal-l26000048504-6af9ab97-9b7c-4f96-ac5d-cb48f1d1d84e&searchTerm=primebind&listNameOrder=PRIMEBIND%20L26000048504" target="_blank" rel="noopener noreferrer" className="text-xs text-[#555] hover:text-white transition-colors">Sunbiz ↗</a>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-4 text-sm">
          {[
            ["Legal Name", "PRIMEBIND LLC"],
            ["Document #", "L26000048504"],
            ["Effective Date", "01/15/2026"],
            ["Status", "ACTIVE"],
            ["State", "FL — Florida LLC"],
            ["Registered Agent", "Villa, Enrique L"],
            ["Business Address", "502 Freedom Court"],
            ["City / ZIP", "Deerfield Beach, FL 33442"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[#555] text-xs mb-0.5">{label}</p>
              <p className="text-white font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
