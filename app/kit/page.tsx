"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, RefreshCw } from "lucide-react";

type Subscriber = { id: number; email: string; subscribedAt: string };
type KitData = { subscribers: number; goal: number; lastSynced: string | null };

const DEFAULT: KitData = { subscribers: 0, goal: 1000, lastSynced: null };

function load(): KitData {
  try {
    const raw = localStorage.getItem("pb_kit");
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function persist(data: KitData) {
  localStorage.setItem("pb_kit", JSON.stringify(data));
}

export default function KitPage() {
  const [data, setData] = useState<KitData>(DEFAULT);
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [editingSubscribers, setEditingSubscribers] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [subDraft, setSubDraft] = useState("");
  const [goalDraft, setGoalDraft] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");

  useEffect(() => { setData(load()); }, []);

  function update(next: KitData) { setData(next); persist(next); }

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

  async function syncFromKit() {
    setSyncing(true);
    setSyncError("");
    try {
      const res = await fetch("/api/kit");
      if (!res.ok) {
        const err = await res.json();
        setSyncError(err.error === "KIT_API_SECRET not set" ? "Add KIT_API_SECRET to Vercel env vars to enable sync." : "Kit API error — check your key.");
        return;
      }
      const { total, subscribers } = await res.json();
      update({ ...data, subscribers: total, lastSynced: new Date().toISOString() });
      setRows(subscribers ?? []);
    } catch {
      setSyncError("Network error — try again.");
    } finally {
      setSyncing(false);
    }
  }

  const remaining = Math.max(0, data.goal - data.subscribers);
  const pct = data.goal > 0 ? Math.min(100, Math.round((data.subscribers / data.goal) * 100)) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kit Subscribers</h1>
          <p className="text-[#888] text-sm mt-1">
            Email list tracker
            {data.lastSynced && (
              <span className="ml-2 text-[#555]">
                · Last synced {new Date(data.lastSynced).toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={syncFromKit}
          disabled={syncing}
          className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing…" : "Sync from Kit"}
        </button>
      </div>

      {syncError && (
        <p className="text-sm text-red-400 bg-red-950 border border-red-900 rounded-lg px-4 py-3">{syncError}</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {/* Subscribers */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Current Subscribers</p>
          {editingSubscribers ? (
            <div className="flex items-center gap-2 mt-1">
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
              <p className="text-2xl font-bold text-white">{data.subscribers.toLocaleString()}</p>
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
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Goal</p>
          {editingGoal ? (
            <div className="flex items-center gap-2 mt-1">
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
              <p className="text-2xl font-bold text-white">{data.goal.toLocaleString()}</p>
              <button
                onClick={() => { setGoalDraft(String(data.goal)); setEditingGoal(true); }}
                className="text-[#555] hover:text-[#888] mb-1"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Remaining + progress bar merged */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#888] text-xs uppercase tracking-wider">Remaining to Goal</p>
            <span className="text-[#555] text-xs">{pct}%</span>
          </div>
          <p className="text-2xl font-bold text-white mb-4">
            {remaining === 0 ? "Goal reached!" : remaining.toLocaleString()}
          </p>
          <div className="w-full bg-[#222] rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-white transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subscriber table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="text-center py-16 text-[#555] text-sm">
            {data.lastSynced ? "No subscribers yet." : "Sync from Kit to see your subscriber list."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-[#1a1a1a] hover:bg-[#151515]">
                  <td className="px-5 py-3 text-white">{s.email}</td>
                  <td className="px-5 py-3 text-[#555]">
                    {new Date(s.subscribedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
