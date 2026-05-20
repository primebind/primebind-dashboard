"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

type SKU = {
  id: string;
  name: string;
  cogs: number;
  retail: number;
  ksPrice: number;
  unitsSold: number;
  revenue: number;
  notes: string;
};

const DEFAULT_SKUS: SKU[] = [
  { id: "1", name: "9 Pocket Binder", cogs: 14, retail: 60, ksPrice: 45, unitsSold: 0, revenue: 0, notes: "Core SKU" },
  { id: "2", name: "12 Pocket Binder", cogs: 16.75, retail: 70, ksPrice: 58, unitsSold: 0, revenue: 0, notes: "" },
  { id: "3", name: "Card Box", cogs: 7.5, retail: 35, ksPrice: 30, unitsSold: 0, revenue: 0, notes: "Add-on" },
  { id: "4", name: "FindMy 9PB", cogs: 19, retail: 80, ksPrice: 0, unitsSold: 0, revenue: 0, notes: "Premium SKU — upgrade via BackerKit" },
  { id: "5", name: "FindMy Card Box", cogs: 12.5, retail: 55, ksPrice: 0, unitsSold: 0, revenue: 0, notes: "Premium SKU — upgrade via BackerKit" },
];

export default function SKUs() {
  const [skus, setSkus] = useState<SKU[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", cogs: "", retail: "", ksPrice: "", notes: "" });

  useEffect(() => {
    const saved = localStorage.getItem("pb_skus");
    setSkus(saved ? JSON.parse(saved) : DEFAULT_SKUS);
  }, []);

  function save(updated: SKU[]) {
    setSkus(updated);
    localStorage.setItem("pb_skus", JSON.stringify(updated));
  }

  function add() {
    if (!form.name) return;
    save([...skus, { id: Date.now().toString(), name: form.name, cogs: +form.cogs, retail: +form.retail, ksPrice: +form.ksPrice, unitsSold: 0, revenue: 0, notes: form.notes }]);
    setForm({ name: "", cogs: "", retail: "", ksPrice: "", notes: "" });
    setShowForm(false);
  }

  function update(id: string, field: keyof SKU, value: string | number) {
    save(skus.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }

  function remove(id: string) { save(skus.filter((s) => s.id !== id)); }

  const totalRevenue = skus.reduce((s, k) => s + k.revenue, 0);
  const totalUnits = skus.reduce((s, k) => s + k.unitsSold, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SKUs</h1>
          <p className="text-[#888] text-sm mt-1">Product performance tracking</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors">
          <Plus size={16} /> Add SKU
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Total Units Sold</p>
          <p className="text-3xl font-bold text-white">{totalUnits.toLocaleString()}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Active SKUs</p>
          <p className="text-3xl font-bold text-white">{skus.length}</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">New SKU</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="col-span-2">
              <label className="text-xs text-[#888] mb-1 block">Product Name</label>
              <input className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#555]" placeholder="9 Pocket Binder" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            {[["cogs", "COGS ($)"], ["retail", "Retail ($)"], ["ksPrice", "KS Price ($)"]].map(([key, label]) => (
              <div key={key}>
                <label className="text-xs text-[#888] mb-1 block">{label}</label>
                <input type="number" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#555]" placeholder="0" value={(form as Record<string, string>)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-xs text-[#888] mb-1 block">Notes</label>
              <input className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#555]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={add} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0]">Add</button>
            <button onClick={() => setShowForm(false)} className="text-[#888] text-sm px-4 py-2 hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
              {["Product", "COGS", "Retail", "KS Price", "Margin", "Units Sold", "Revenue", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skus.map((s) => {
              const margin = s.retail > 0 ? (((s.retail - s.cogs) / s.retail) * 100).toFixed(0) : "—";
              return (
                <tr key={s.id} className="border-b border-[#1a1a1a] hover:bg-[#151515]">
                  <td className="px-5 py-4">
                    <p className="text-white font-medium">{s.name}</p>
                    {s.notes && <p className="text-[#555] text-xs">{s.notes}</p>}
                  </td>
                  <td className="px-5 py-4 text-[#888]">${s.cogs}</td>
                  <td className="px-5 py-4 text-[#888]">${s.retail}</td>
                  <td className="px-5 py-4 text-[#888]">{s.ksPrice ? `$${s.ksPrice}` : "—"}</td>
                  <td className="px-5 py-4 text-green-400">{margin}%</td>
                  <td className="px-5 py-4">
                    <input
                      type="number"
                      className="w-20 bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#555]"
                      value={s.unitsSold}
                      onChange={(e) => {
                        const units = +e.target.value;
                        const revenue = units * (s.ksPrice || s.retail);
                        save(skus.map((k) => k.id === s.id ? { ...k, unitsSold: units, revenue } : k));
                      }}
                    />
                  </td>
                  <td className="px-5 py-4 text-white">${s.revenue.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => remove(s.id)} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
