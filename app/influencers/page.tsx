"use client";

import { Fragment, useState, useEffect } from "react";
import { Plus, Trash2, Copy, ChevronDown, ChevronRight } from "lucide-react";

type Status = "Prospecting" | "Contacted" | "Interested" | "Package Sent" | "Posted" | "Passed";
type Shipment = { id: string; skuId: string; colorId: string; batch: number };
type SKU = { id: string; parentId: string | null; name: string };
type Color = { id: string; name: string; hex: string };

type Influencer = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: string;
  status: Status;
  refLink: string;
  notes: string;
  shipments: Shipment[];
};

const DEFAULT_COLORS: Color[] = [
  { id: "obsidian", name: "Obsidian", hex: "#1a1a1a" },
  { id: "pearl", name: "Pearl", hex: "#e8e8e8" },
  { id: "rose", name: "Rose", hex: "#d4a0a0" },
  { id: "crimson", name: "Crimson", hex: "#8b0000" },
  { id: "jade", name: "Jade", hex: "#2d5a3d" },
  { id: "abyss", name: "Abyss", hex: "#1a2744" },
];

const STATUS_COLORS: Record<Status, string> = {
  Prospecting: "bg-[#333] text-[#888]",
  Contacted: "bg-blue-950 text-blue-400",
  Interested: "bg-yellow-950 text-yellow-400",
  "Package Sent": "bg-purple-950 text-purple-400",
  Posted: "bg-green-950 text-green-400",
  Passed: "bg-[#222] text-[#555]",
};

const STATUSES: Status[] = ["Prospecting", "Contacted", "Interested", "Package Sent", "Posted", "Passed"];
const PLATFORMS = ["TikTok", "YouTube", "Instagram", "Twitter/X"];

function makeRef(handle: string) {
  return handle ? `kickstarter.com/projects/primebind/primebind?ref=${handle.replace("@", "").toLowerCase().replace(/\s+/g, "_")}` : "";
}

export default function Influencers() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [skus, setSkus] = useState<SKU[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", handle: "", platform: "TikTok", followers: "", status: "Prospecting" as Status, notes: "" });
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [shipForm, setShipForm] = useState({ skuId: "", colorId: "", batch: 2 });

  useEffect(() => {
    const saved = localStorage.getItem("pb_influencers");
    if (saved) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setInfluencers(JSON.parse(saved).map((i: any) => ({ ...i, shipments: i.shipments || [] })));
    }

    const rawSkus = localStorage.getItem("pb_skus");
    const loadedSkus: SKU[] = rawSkus ? JSON.parse(rawSkus) : [];
    setSkus(loadedSkus);

    const rawColors = localStorage.getItem("pb_colors");
    const loadedColors: Color[] = rawColors ? JSON.parse(rawColors) : DEFAULT_COLORS;
    setColors(loadedColors);

    const firstParent = loadedSkus.find((s) => s.parentId === null);
    setShipForm((f) => ({
      ...f,
      skuId: firstParent?.id || "",
      colorId: loadedColors[0]?.id || "",
    }));
  }, []);

  function save(updated: Influencer[]) {
    setInfluencers(updated);
    localStorage.setItem("pb_influencers", JSON.stringify(updated));
  }

  function add() {
    if (!form.name || !form.handle) return;
    const entry: Influencer = {
      id: Date.now().toString(),
      name: form.name, handle: form.handle, platform: form.platform,
      followers: form.followers, status: form.status,
      refLink: makeRef(form.handle), notes: form.notes, shipments: [],
    };
    save([...influencers, entry]);
    setForm({ name: "", handle: "", platform: "TikTok", followers: "", status: "Prospecting", notes: "" });
    setShowForm(false);
  }

  function remove(id: string) { save(influencers.filter((i) => i.id !== id)); }

  function updateStatus(id: string, status: Status) {
    save(influencers.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  function copyLink(link: string, id: string) {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  function addShipment(influencerId: string) {
    if (!shipForm.skuId || !shipForm.colorId) return;
    const newShipment: Shipment = { id: Date.now().toString(), ...shipForm };
    save(influencers.map((i) => i.id === influencerId ? { ...i, shipments: [...i.shipments, newShipment] } : i));
  }

  function removeShipment(influencerId: string, shipmentId: string) {
    save(influencers.map((i) => i.id === influencerId ? { ...i, shipments: i.shipments.filter((s) => s.id !== shipmentId) } : i));
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  const parentSkus = skus.filter((s) => s.parentId === null);
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: influencers.filter((i) => i.status === s).length }), {} as Record<string, number>);
  const totalShipped = influencers.reduce((sum, i) => sum + i.shipments.length, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Influencers</h1>
          <p className="text-[#888] text-sm mt-1">{influencers.length} tracked · {totalShipped} sample{totalShipped !== 1 ? "s" : ""} sent · Target: 20</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors">
          <Plus size={16} /> Add Influencer
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {STATUSES.map((s) => (
          <div key={s} className="bg-[#111] border border-[#222] rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-white">{counts[s] || 0}</p>
            <p className="text-[#555] text-xs mt-1">{s}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">New Influencer</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#888] mb-1 block">Name</label>
              <input className="input w-full" placeholder="Jake TCG" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Handle</label>
              <input className="input w-full" placeholder="@jaketcg" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Platform</label>
              <select className="input w-full" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Followers</label>
              <input className="input w-full" placeholder="45K" value={form.followers} onChange={(e) => setForm({ ...form, followers: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-[#888] mb-1 block">Notes</label>
              <input className="input w-full" placeholder="Pokemon collector, no VaultX ties, 8% engagement" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={add} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors">Add</button>
            <button onClick={() => setShowForm(false)} className="text-[#888] text-sm px-4 py-2 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {influencers.length === 0 ? (
          <div className="text-center py-16 text-[#555] text-sm">No influencers yet. Add your first target above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Platform</th>
                <th className="text-left px-5 py-3">Followers</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Ref Link</th>
                <th className="text-left px-5 py-3">Notes</th>
                <th className="text-left px-5 py-3">Samples</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {influencers.map((inf) => {
                const isExpanded = expandedId === inf.id;
                const shipped = inf.shipments || [];
                return (
                  <Fragment key={inf.id}>
                    <tr className="border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-white font-medium">{inf.name}</p>
                        <p className="text-[#555] text-xs">{inf.handle}</p>
                      </td>
                      <td className="px-5 py-4 text-[#888]">{inf.platform}</td>
                      <td className="px-5 py-4 text-[#888]">{inf.followers || "—"}</td>
                      <td className="px-5 py-4">
                        <select
                          value={inf.status}
                          onChange={(e) => updateStatus(inf.id, e.target.value as Status)}
                          className={`text-xs px-2 py-1 rounded-md border-0 font-medium focus:outline-none cursor-pointer ${STATUS_COLORS[inf.status]}`}
                        >
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        {inf.refLink && (
                          <button onClick={() => copyLink(inf.refLink, inf.id)} className="flex items-center gap-1.5 text-xs text-[#555] hover:text-white transition-colors">
                            <Copy size={12} />{copied === inf.id ? "Copied!" : "Copy link"}
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[#555] text-xs max-w-[160px] truncate">{inf.notes || "—"}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => toggleExpand(inf.id)} className="flex items-center gap-1.5 text-xs text-[#555] hover:text-white transition-colors">
                          {shipped.length > 0 ? (
                            <>
                              <span className="flex gap-0.5">
                                {shipped.slice(0, 4).map((s) => {
                                  const c = colors.find((c) => c.id === s.colorId);
                                  return <span key={s.id} className="w-2.5 h-2.5 rounded-full border border-[#444] inline-block" style={{ background: c?.hex || "#555" }} />;
                                })}
                              </span>
                              <span className="text-[#888]">{shipped.length}</span>
                            </>
                          ) : (
                            <span className="text-[#444]">none</span>
                          )}
                          {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => remove(inf.id)} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-b border-[#1a1a1a]">
                        <td colSpan={8} className="px-10 pb-4 pt-2 bg-[#0d0d0d]">
                          {shipped.length > 0 && (
                            <div className="space-y-1.5 mb-3">
                              {shipped.map((s) => {
                                const sku = skus.find((k) => k.id === s.skuId);
                                const color = colors.find((c) => c.id === s.colorId);
                                return (
                                  <div key={s.id} className="flex items-center gap-2 text-xs">
                                    <span className="w-2.5 h-2.5 rounded-full border border-[#444] shrink-0" style={{ background: color?.hex || "#555" }} />
                                    <span className="text-white">{sku?.name || s.skuId}</span>
                                    <span className="text-[#555]">·</span>
                                    <span className="text-[#888]">{color?.name || s.colorId}</span>
                                    <span className="text-[#555]">·</span>
                                    <span className="text-[#555]">Batch {s.batch}</span>
                                    <button onClick={() => removeShipment(inf.id, s.id)} className="ml-auto text-[#333] hover:text-red-500 transition-colors"><Trash2 size={11} /></button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            <select className="input text-xs" value={shipForm.skuId} onChange={(e) => setShipForm({ ...shipForm, skuId: e.target.value })}>
                              {parentSkus.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <select className="input text-xs" value={shipForm.colorId} onChange={(e) => setShipForm({ ...shipForm, colorId: e.target.value })}>
                              {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {colors.find((c) => c.id === shipForm.colorId) && (
                              <span className="w-3.5 h-3.5 rounded-full border border-[#444] shrink-0" style={{ background: colors.find((c) => c.id === shipForm.colorId)?.hex }} />
                            )}
                            <div className="flex items-center gap-1 text-xs text-[#555]">
                              <span>Batch</span>
                              <input type="number" className="input w-12 text-center" min={1} value={shipForm.batch} onChange={(e) => setShipForm({ ...shipForm, batch: +e.target.value })} />
                            </div>
                            <button onClick={() => addShipment(inf.id)} className="flex items-center gap-1 text-xs bg-[#1a1a1a] border border-[#333] text-[#888] hover:text-white px-2.5 py-1 rounded-md transition-colors">
                              <Plus size={11} /> Log shipment
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
