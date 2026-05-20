"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";

type AdCampaign = {
  id: string;
  name: string;
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  date: string;
};

export default function Ads() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", platform: "Meta", spend: "", impressions: "", clicks: "", conversions: "", revenue: "", date: new Date().toISOString().split("T")[0] });

  useEffect(() => {
    const saved = localStorage.getItem("pb_ads");
    if (saved) setCampaigns(JSON.parse(saved));
  }, []);

  function save(updated: AdCampaign[]) {
    setCampaigns(updated);
    localStorage.setItem("pb_ads", JSON.stringify(updated));
  }

  function add() {
    if (!form.name) return;
    save([...campaigns, { id: Date.now().toString(), name: form.name, platform: form.platform, spend: +form.spend, impressions: +form.impressions, clicks: +form.clicks, conversions: +form.conversions, revenue: +form.revenue, date: form.date }]);
    setForm({ name: "", platform: "Meta", spend: "", impressions: "", clicks: "", conversions: "", revenue: "", date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
  }

  function remove(id: string) { save(campaigns.filter((c) => c.id !== id)); }

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const avgRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : "—";
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "—";

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ad Performance</h1>
          <p className="text-[#888] text-sm mt-1">Track Meta, TikTok, and other campaigns</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors">
          <Plus size={16} /> Add Campaign
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Spend", value: `$${totalSpend.toLocaleString()}` },
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}` },
          { label: "ROAS", value: avgRoas === "—" ? "—" : `${avgRoas}x`, good: +avgRoas >= 2.5 },
          { label: "CTR", value: avgCtr === "—" ? "—" : `${avgCtr}%` },
        ].map((s) => (
          <div key={s.label} className="bg-[#111] border border-[#222] rounded-xl p-5">
            <p className="text-[#888] text-xs uppercase tracking-wider mb-2">{s.label}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              {"good" in s && s.value !== "—" && (
                s.good
                  ? <TrendingUp size={16} className="text-green-400" />
                  : <TrendingDown size={16} className="text-red-400" />
              )}
            </div>
            {"good" in s && s.value !== "—" && (
              <p className="text-xs mt-1 text-[#555]">Floor: 2.5x ROAS</p>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">New Campaign</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="col-span-2">
              <label className="text-xs text-[#888] mb-1 block">Campaign Name</label>
              <input className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#555]" placeholder="Binder awareness — May" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Platform</label>
              <select className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#555]" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                {["Meta", "TikTok", "Google", "Other"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Date</label>
              <input type="date" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#555]" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            {[
              { key: "spend", label: "Spend ($)" },
              { key: "impressions", label: "Impressions" },
              { key: "clicks", label: "Clicks" },
              { key: "conversions", label: "Conversions" },
              { key: "revenue", label: "Revenue ($)" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-[#888] mb-1 block">{label}</label>
                <input type="number" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#555]" placeholder="0" value={(form as Record<string, string>)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={add} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0]">Add</button>
            <button onClick={() => setShowForm(false)} className="text-[#888] text-sm px-4 py-2 hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="text-center py-16 text-[#555] text-sm">No campaigns yet. Add your first above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                {["Campaign", "Platform", "Spend", "Impressions", "Clicks", "CTR", "ROAS", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : "—";
                const roas = c.spend > 0 ? (c.revenue / c.spend).toFixed(2) : "—";
                const roasNum = +roas;
                return (
                  <tr key={c.id} className="border-b border-[#1a1a1a] hover:bg-[#151515]">
                    <td className="px-5 py-4">
                      <p className="text-white font-medium">{c.name}</p>
                      <p className="text-[#555] text-xs">{c.date}</p>
                    </td>
                    <td className="px-5 py-4 text-[#888]">{c.platform}</td>
                    <td className="px-5 py-4 text-white">${c.spend.toLocaleString()}</td>
                    <td className="px-5 py-4 text-[#888]">{fmt(c.impressions)}</td>
                    <td className="px-5 py-4 text-[#888]">{fmt(c.clicks)}</td>
                    <td className="px-5 py-4 text-[#888]">{ctr === "—" ? "—" : `${ctr}%`}</td>
                    <td className="px-5 py-4">
                      <span className={roas === "—" ? "text-[#555]" : roasNum >= 2.5 ? "text-green-400" : "text-red-400"}>
                        {roas === "—" ? "—" : `${roas}x`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => remove(c.id)} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
