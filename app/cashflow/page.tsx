"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";

import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";

type ProjectedItem = {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
};

type FinancialEntry = {
  id: string;
  date: string;
  amount: number;
};

const CATEGORIES = ["Manufacturing", "Marketing", "Operations", "Travel", "Software", "KS Revenue", "Other"];

const DEFAULT_PROJECTED: ProjectedItem[] = [
  { id: "proj-1", date: "2026-07-01", description: "Sample Batch 2 — Jason/Dijin", amount: -1500, category: "Manufacturing" },
  { id: "proj-2", date: "2026-08-15", description: "Sample Batch 3 — Final", amount: -1500, category: "Manufacturing" },
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtLabel(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-xs">
      <p className="text-[#888] mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  );
}

export default function CashflowPage() {
  const [actuals, setActuals] = useState<FinancialEntry[]>([]);
  const [projected, setProjected] = useState<ProjectedItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", description: "", amount: "", category: "Manufacturing" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ProjectedItem>>({});

  useEffect(() => {
    const raw = localStorage.getItem("pb_financials");
    if (raw) {
      const parsed = JSON.parse(raw) as FinancialEntry[];
      setActuals(parsed.sort((a, b) => a.date.localeCompare(b.date)));
    }

    const rawP = localStorage.getItem("pb_cashflow_projected");
    if (rawP) {
      setProjected(JSON.parse(rawP));
    } else {
      setProjected(DEFAULT_PROJECTED);
      localStorage.setItem("pb_cashflow_projected", JSON.stringify(DEFAULT_PROJECTED));
    }
  }, []);

  function saveProjected(items: ProjectedItem[]) {
    const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
    setProjected(sorted);
    localStorage.setItem("pb_cashflow_projected", JSON.stringify(sorted));
  }

  function addItem() {
    if (!form.date || !form.description || !form.amount) return;
    const item: ProjectedItem = {
      id: Date.now().toString(),
      date: form.date,
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
    };
    saveProjected([...projected, item]);
    setForm({ date: "", description: "", amount: "", category: "Manufacturing" });
    setShowForm(false);
  }

  function removeItem(id: string) { saveProjected(projected.filter((p) => p.id !== id)); }
  function startEdit(item: ProjectedItem) { setEditingId(item.id); setEditDraft({ ...item }); }
  function commitEdit() {
    if (!editingId) return;
    saveProjected(projected.map((p) => p.id === editingId ? { ...p, ...editDraft } as ProjectedItem : p));
    setEditingId(null); setEditDraft({});
  }
  function cancelEdit() { setEditingId(null); setEditDraft({}); }

  const today = new Date().toISOString().split("T")[0];

  // Build chart data
  const chartData = (() => {
    type Point = { date: string; label: string; actual?: number; projected?: number };
    const map = new Map<string, Point>();

    function upsert(date: string, patch: Partial<Point>) {
      const label = date === today ? "Today" : fmtLabel(date);
      map.set(date, { date, label, ...map.get(date), ...patch });
    }

    // Walk actuals — start from $0, let deposits build the balance
    let bal = 0;
    const startDate = actuals.length > 0 ? actuals[0].date.slice(0, 7) + "-01" : today.slice(0, 7) + "-01";
    upsert(startDate, { actual: 0 });

    for (const t of actuals) {
      bal += t.amount;
      upsert(t.date, { actual: Math.round(bal) });
    }

    const actualBal = bal;

    // Connection point at today
    upsert(today, { actual: Math.round(actualBal), projected: Math.round(actualBal) });

    // Walk projected (future only)
    let projBal = actualBal;
    for (const p of projected.filter((p) => p.date >= today)) {
      projBal += p.amount;
      upsert(p.date, { projected: Math.round(projBal) });
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  })();

  const currentBalance = [...chartData].reverse().find((p) => p.actual !== undefined)?.actual ?? 0;
  const projectedPoints = chartData.filter((p) => p.projected !== undefined).map((p) => p.projected!);
  const projectedLow = projectedPoints.length ? Math.min(...projectedPoints) : currentBalance;
  const totalOut = projected.filter((p) => p.amount < 0).reduce((s, p) => s + p.amount, 0);
  const totalIn = projected.filter((p) => p.amount > 0).reduce((s, p) => s + p.amount, 0);

  // Runway: first projected item that pushes balance <= 0
  let runway: string | null = null;
  let runBal = currentBalance;
  for (const item of projected) {
    runBal += item.amount;
    if (runBal <= 0) { runway = item.date; break; }
  }

  const yMin = Math.min(0, projectedLow - 2000);
  const yMax = currentBalance + 5000;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cashflow</h1>
          <p className="text-[#888] text-sm mt-1">Actuals + projected spend through launch</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors"
        >
          <Plus size={16} /> Add Projection
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <p className="text-[#555] text-xs mb-1">Current Balance</p>
          <p className={`text-xl font-bold tabular-nums ${currentBalance < 5000 ? "text-red-400" : "text-white"}`}>{fmt(currentBalance)}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <p className="text-[#555] text-xs mb-1">Projected Low</p>
          <p className={`text-xl font-bold tabular-nums ${projectedLow < 5000 ? "text-yellow-400" : "text-white"}`}>{fmt(projectedLow)}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <p className="text-[#555] text-xs mb-1">Projected Out</p>
          <p className="text-xl font-bold text-red-400 tabular-nums">{fmt(totalOut)}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <p className="text-[#555] text-xs mb-1">{totalIn > 0 ? "Projected In" : "Runway"}</p>
          {totalIn > 0
            ? <p className="text-xl font-bold text-green-400 tabular-nums">{fmt(totalIn)}</p>
            : <p className="text-xl font-bold text-white">{runway ? fmtDate(runway) : "Safe"}</p>
          }
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Balance Over Time</h2>
          <div className="flex items-center gap-5 text-xs text-[#555]">
            <span className="flex items-center gap-2">
              <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="white" strokeWidth="2" /></svg>
              Actual
            </span>
            <span className="flex items-center gap-2">
              <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="#60a5fa" strokeWidth="2" strokeDasharray="6 3" /></svg>
              Projected
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#555", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fill: "#555", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#ef4444" strokeOpacity={0.5} strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine x="Today" stroke="#333" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#ffffff"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              name="Actual"
              activeDot={{ r: 4, fill: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls={false}
              name="Projected"
              activeDot={{ r: 4, fill: "#60a5fa" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">Add Projection</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#888] mb-1 block">Date</label>
              <input type="date" className="input w-full [color-scheme:dark]" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Amount <span className="text-[#444]">(negative = expense)</span></label>
              <input className="input w-full" placeholder="-1500" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Description</label>
              <input className="input w-full" placeholder="Sample Batch 2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Category</label>
              <select className="input w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addItem} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors">Add</button>
            <button onClick={() => setShowForm(false)} className="text-[#888] text-sm px-4 py-2 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Projected items */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Projected Items</h2>
          <p className="text-xs text-[#555]">{projected.length} item{projected.length !== 1 ? "s" : ""}</p>
        </div>
        {projected.length === 0 ? (
          <div className="text-center py-12 text-[#555] text-sm">No projected items yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Description</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {projected.map((item) => (
                <tr key={item.id} className="border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors">
                  <td className="px-5 py-3 text-[#888] text-xs whitespace-nowrap">
                    {editingId === item.id
                      ? <input type="date" className="input [color-scheme:dark]" value={editDraft.date || ""} onChange={(e) => setEditDraft({ ...editDraft, date: e.target.value })} />
                      : fmtDate(item.date)}
                  </td>
                  <td className="px-5 py-3 text-white">
                    {editingId === item.id
                      ? <input className="input w-full" value={editDraft.description || ""} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} />
                      : item.description}
                  </td>
                  <td className="px-5 py-3 text-[#555] text-xs">
                    {editingId === item.id
                      ? <select className="input" value={editDraft.category || ""} onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
                      : item.category}
                  </td>
                  <td className={`px-5 py-3 text-right font-medium tabular-nums ${item.amount < 0 ? "text-red-400" : "text-green-400"}`}>
                    {editingId === item.id
                      ? <input className="input w-28 text-right" value={editDraft.amount ?? ""} onChange={(e) => setEditDraft({ ...editDraft, amount: parseFloat(e.target.value) || 0 })} />
                      : fmt(item.amount)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2 justify-end">
                      {editingId === item.id ? (
                        <>
                          <button onClick={commitEdit} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
                          <button onClick={cancelEdit} className="text-[#555] hover:text-white"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(item)} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => removeItem(item.id)} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
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
