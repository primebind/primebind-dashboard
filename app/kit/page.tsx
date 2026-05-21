"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";

type KitData = {
  subscribers: number;
  goal: number;
};

const DEFAULT: KitData = { subscribers: 0, goal: 1000 };

function load(): KitData {
  try {
    const raw = localStorage.getItem("pb_kit");
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function save(data: KitData) {
  localStorage.setItem("pb_kit", JSON.stringify(data));
}

export default function KitPage() {
  const [data, setData] = useState<KitData>(DEFAULT);
  const [editingSubscribers, setEditingSubscribers] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [subDraft, setSubDraft] = useState("");
  const [goalDraft, setGoalDraft] = useState("");

  useEffect(() => {
    setData(load());
  }, []);

  function update(next: KitData) {
    setData(next);
    save(next);
  }

  function commitSubscribers() {
    const val = parseInt(subDraft, 10);
    if (!isNaN(val) && val >= 0) update({ ...data, subscribers: val });
    setEditingSubscribers(false);
  }

  function commitGoal() {
    const val = parseInt(goalDraft, 10);
    if (!isNaN(val) && val > 0) update({ ...data, goal: val });
    setEditingGoal(false);
  }

  const remaining = Math.max(0, data.goal - data.subscribers);
  const pct = data.goal > 0 ? Math.min(100, Math.round((data.subscribers / data.goal) * 100)) : 0;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-white font-semibold text-xl mb-1">Kit Subscribers</h1>
      <p className="text-[#555] text-sm mb-8">Email list tracker</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Subscribers */}
        <div className="bg-[#111] border border-[#222] rounded-lg p-5">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Current Subscribers</p>
          {editingSubscribers ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="number"
                min={0}
                value={subDraft}
                onChange={(e) => setSubDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitSubscribers();
                  if (e.key === "Escape") setEditingSubscribers(false);
                }}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-1.5 text-white text-2xl font-bold focus:outline-none focus:border-[#555]"
              />
              <button onClick={commitSubscribers} className="text-green-400 hover:text-green-300"><Check size={16} /></button>
              <button onClick={() => setEditingSubscribers(false)} className="text-[#555] hover:text-[#888]"><X size={16} /></button>
            </div>
          ) : (
            <div className="flex items-end justify-between">
              <span className="text-white text-3xl font-bold">{data.subscribers.toLocaleString()}</span>
              <button
                onClick={() => { setSubDraft(String(data.subscribers)); setEditingSubscribers(true); }}
                className="text-[#555] hover:text-[#888] mb-1"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Goal */}
        <div className="bg-[#111] border border-[#222] rounded-lg p-5">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Goal</p>
          {editingGoal ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="number"
                min={1}
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitGoal();
                  if (e.key === "Escape") setEditingGoal(false);
                }}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-1.5 text-white text-2xl font-bold focus:outline-none focus:border-[#555]"
              />
              <button onClick={commitGoal} className="text-green-400 hover:text-green-300"><Check size={16} /></button>
              <button onClick={() => setEditingGoal(false)} className="text-[#555] hover:text-[#888]"><X size={16} /></button>
            </div>
          ) : (
            <div className="flex items-end justify-between">
              <span className="text-white text-3xl font-bold">{data.goal.toLocaleString()}</span>
              <button
                onClick={() => { setGoalDraft(String(data.goal)); setEditingGoal(true); }}
                className="text-[#555] hover:text-[#888] mb-1"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Remaining */}
      <div className="bg-[#111] border border-[#222] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-[#555] uppercase tracking-widest">Remaining to Goal</p>
          <span className="text-xs text-[#555]">{pct}%</span>
        </div>
        <p className="text-white text-3xl font-bold mb-5">
          {remaining === 0 ? "Goal reached!" : `${remaining.toLocaleString()} to go`}
        </p>
        <div className="w-full bg-[#222] rounded-full h-2">
          <div
            className="h-2 rounded-full bg-white transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
