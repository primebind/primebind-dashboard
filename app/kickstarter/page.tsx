"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";

const KS_FEE = 0.105;

type Tier = {
  id: string;
  name: string;
  price: number;
  contents: string;
  retailValue: number;
  slots: number;
  note: string;
};

type Addon = {
  id: string;
  name: string;
  price: number;
  note: string;
};

type Unlockable = {
  id: string;
  name: string;
  milestone: number;
  description: string;
  unlocked: boolean;
};

const DEFAULT_TIERS: Tier[] = [
  { id: "1", name: "Early Bird", price: 39, contents: "1x 9PB + Numbered Founders Stamp", retailValue: 60, slots: 100, note: "48 hr only · 100 slots" },
  { id: "2", name: "Solo", price: 45, contents: "1x 9PB", retailValue: 60, slots: 0, note: "" },
  { id: "3", name: "Duo", price: 83, contents: "2x 9PB", retailValue: 120, slots: 0, note: "" },
  { id: "4", name: "Prime", price: 159, contents: "2x 9PB + 2x 12PB", retailValue: 260, slots: 0, note: "Lower funnel sweet spot" },
  { id: "5", name: "Collector", price: 229, contents: "2x 9PB + 2x 12PB + 2x Card Box + Free US Shipping", retailValue: 342, slots: 0, note: "Gateway to upper funnel" },
  { id: "6", name: "The Archive", price: 319, contents: "3x 9PB + 3x 12PB + 3x Card Box + Exclusive (TBD) + Free US Shipping", retailValue: 510, slots: 0, note: "Upper funnel sweet spot — Exclusive TBD" },
];

const DEFAULT_ADDONS: Addon[] = [
  { id: "1", name: "9 Pocket Binder", price: 48, note: "Steers toward Duo tier" },
  { id: "2", name: "12 Pocket Binder", price: 58, note: "Steers toward Prime over Duo + add-ons" },
  { id: "3", name: "Card Box", price: 30, note: "$5 below retail — low friction" },
  { id: "4", name: "FindMy Upgrade", price: 20, note: "Per binder, applied during BackerKit survey" },
];

const DEFAULT_UNLOCKABLES: Unlockable[] = [
  { id: "1", name: "Jade Colorway", milestone: 50000, description: "Deep green — stretch colorway", unlocked: false },
  { id: "2", name: "Abyss Colorway", milestone: 100000, description: "Dark navy — stretch colorway", unlocked: false },
];

function net(price: number) {
  return price * (1 - KS_FEE);
}

function saves(price: number, retail: number) {
  if (!retail) return { amt: 0, pct: 0 };
  return { amt: retail - price, pct: Math.round(((retail - price) / retail) * 100) };
}

// ── Tier row ──────────────────────────────────────────────────────────────────
function TierRow({
  tier,
  onSave,
  onDelete,
}: {
  tier: Tier;
  onSave: (t: Tier) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tier);

  function commit() { onSave(draft); setEditing(false); }
  function cancel() { setDraft(tier); setEditing(false); }

  const sv = saves(tier.price, tier.retailValue);
  const isSweet = tier.note.toLowerCase().includes("sweet spot");

  if (editing) {
    return (
      <tr className="border-b border-[#1a1a1a] bg-[#151515]">
        <td className="px-4 py-3">
          <input className="input w-32" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
          <input className="input w-32 mt-1" placeholder="Note" value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })} />
        </td>
        <td className="px-4 py-3">
          <input type="number" className="input w-20" value={draft.price} onChange={e => setDraft({ ...draft, price: +e.target.value })} />
        </td>
        <td className="px-4 py-3">
          <textarea className="input w-full text-xs resize-none h-16" value={draft.contents} onChange={e => setDraft({ ...draft, contents: e.target.value })} />
        </td>
        <td className="px-4 py-3">
          <input type="number" className="input w-20" value={draft.retailValue} onChange={e => setDraft({ ...draft, retailValue: +e.target.value })} />
        </td>
        <td className="px-4 py-3 text-[#555] text-xs">—</td>
        <td className="px-4 py-3 text-[#555] text-xs">—</td>
        <td className="px-4 py-3">
          <input type="number" className="input w-16" placeholder="∞" value={draft.slots || ""} onChange={e => setDraft({ ...draft, slots: +e.target.value })} />
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <button onClick={commit} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
            <button onClick={cancel} className="text-[#555] hover:text-white"><X size={14} /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`border-b border-[#1a1a1a] hover:bg-[#151515] ${isSweet ? "ring-inset ring-1 ring-[#2a2a2a]" : ""}`}>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium text-sm">{tier.name}</p>
          {isSweet && <span className="text-[10px] bg-white text-black px-1.5 py-0.5 rounded font-medium">Sweet Spot</span>}
        </div>
        {tier.note && !isSweet && <p className="text-[#555] text-xs mt-0.5">{tier.note}</p>}
        {tier.slots > 0 && <p className="text-yellow-600 text-xs mt-0.5">{tier.slots} slots</p>}
      </td>
      <td className="px-4 py-4 text-white font-semibold">${tier.price}</td>
      <td className="px-4 py-4 text-[#888] text-xs max-w-[220px]">{tier.contents}</td>
      <td className="px-4 py-4 text-[#555] text-sm">${tier.retailValue}</td>
      <td className="px-4 py-4">
        {sv.amt > 0 && (
          <div>
            <span className="text-green-400 text-sm font-medium">${sv.amt}</span>
            <span className="text-[#555] text-xs ml-1">({sv.pct}%)</span>
          </div>
        )}
      </td>
      <td className="px-4 py-4 text-[#888] text-sm">${net(tier.price).toFixed(2)}</td>
      <td className="px-4 py-4 text-[#555] text-xs">{tier.slots > 0 ? tier.slots : "∞"}</td>
      <td className="px-4 py-4">
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button>
          <button onClick={onDelete} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  );
}

// ── Addon row ─────────────────────────────────────────────────────────────────
function AddonRow({ addon, onSave, onDelete }: { addon: Addon; onSave: (a: Addon) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(addon);

  function commit() { onSave(draft); setEditing(false); }
  function cancel() { setDraft(addon); setEditing(false); }

  if (editing) {
    return (
      <tr className="border-b border-[#1a1a1a] bg-[#151515]">
        <td className="px-4 py-3"><input className="input w-40" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></td>
        <td className="px-4 py-3"><input type="number" className="input w-20" value={draft.price} onChange={e => setDraft({ ...draft, price: +e.target.value })} /></td>
        <td className="px-4 py-3"><input className="input w-full" value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })} /></td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <button onClick={commit} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
            <button onClick={cancel} className="text-[#555] hover:text-white"><X size={14} /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-[#1a1a1a] hover:bg-[#151515]">
      <td className="px-4 py-3 text-white text-sm">{addon.name}</td>
      <td className="px-4 py-3 text-white font-medium">${addon.price}</td>
      <td className="px-4 py-3 text-[#555] text-xs">{addon.note}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button>
          <button onClick={onDelete} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  );
}

// ── Unlockable row ────────────────────────────────────────────────────────────
function UnlockableRow({ item, onSave, onDelete }: { item: Unlockable; onSave: (u: Unlockable) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  function commit() { onSave(draft); setEditing(false); }
  function cancel() { setDraft(item); setEditing(false); }

  if (editing) {
    return (
      <tr className="border-b border-[#1a1a1a] bg-[#151515]">
        <td className="px-4 py-3"><input className="input w-36" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></td>
        <td className="px-4 py-3"><input type="number" className="input w-28" value={draft.milestone} onChange={e => setDraft({ ...draft, milestone: +e.target.value })} /></td>
        <td className="px-4 py-3"><input className="input w-full" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></td>
        <td className="px-4 py-3 text-[#555] text-xs">—</td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <button onClick={commit} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
            <button onClick={cancel} className="text-[#555] hover:text-white"><X size={14} /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-[#1a1a1a] hover:bg-[#151515]">
      <td className="px-4 py-3 text-white text-sm font-medium">{item.name}</td>
      <td className="px-4 py-3 text-[#888] text-sm">${item.milestone.toLocaleString()}</td>
      <td className="px-4 py-3 text-[#555] text-xs">{item.description}</td>
      <td className="px-4 py-3">
        <button
          onClick={() => onSave({ ...item, unlocked: !item.unlocked })}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${item.unlocked ? "bg-green-950 text-green-400" : "bg-[#1a1a1a] text-[#555] hover:text-white"}`}
        >
          {item.unlocked ? "Unlocked" : "Locked"}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button>
          <button onClick={onDelete} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Kickstarter() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [unlockables, setUnlockables] = useState<Unlockable[]>([]);

  useEffect(() => {
    const t = localStorage.getItem("pb_ks_tiers");
    const a = localStorage.getItem("pb_ks_addons");
    const u = localStorage.getItem("pb_ks_unlockables");
    setTiers(t ? JSON.parse(t) : DEFAULT_TIERS);
    setAddons(a ? JSON.parse(a) : DEFAULT_ADDONS);
    setUnlockables(u ? JSON.parse(u) : DEFAULT_UNLOCKABLES);
  }, []);

  function saveTiers(updated: Tier[]) { setTiers(updated); localStorage.setItem("pb_ks_tiers", JSON.stringify(updated)); }
  function saveAddons(updated: Addon[]) { setAddons(updated); localStorage.setItem("pb_ks_addons", JSON.stringify(updated)); }
  function saveUnlockables(updated: Unlockable[]) { setUnlockables(updated); localStorage.setItem("pb_ks_unlockables", JSON.stringify(updated)); }

  function addTier() {
    const t: Tier = { id: Date.now().toString(), name: "New Tier", price: 0, contents: "", retailValue: 0, slots: 0, note: "" };
    saveTiers([...tiers, t]);
  }

  function addAddon() {
    const a: Addon = { id: Date.now().toString(), name: "New Add-on", price: 0, note: "" };
    saveAddons([...addons, a]);
  }

  function addUnlockable() {
    const u: Unlockable = { id: Date.now().toString(), name: "New Stretch Goal", milestone: 0, description: "", unlocked: false };
    saveUnlockables([...unlockables, u]);
  }

  const blendedLow = 175;
  const blendedHigh = 185;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kickstarter</h1>
        <p className="text-[#888] text-sm mt-1">Tiers, add-ons, and stretch goals — Sept 1, 2026</p>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "KS Goal", value: "$25,000" },
          { label: "Break-even", value: "$18,300" },
          { label: "Blended Avg Pledge", value: `$${blendedLow}–${blendedHigh}` },
          { label: "KS + BackerKit Fees", value: `${(KS_FEE * 100).toFixed(1)}%` },
        ].map((s) => (
          <div key={s.label} className="bg-[#111] border border-[#222] rounded-xl p-5">
            <p className="text-[#888] text-xs uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tiers ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Tiers</h2>
            <p className="text-[#555] text-xs mt-0.5">Dual funnel — Prime ($159) lower · The Archive ($319) upper</p>
          </div>
          <button onClick={addTier} className="flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-[#333] text-[#888] hover:text-white px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={13} /> Add Tier
          </button>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                {["Tier", "Price", "Contents", "Retail", "Saves", "Net (after fees)", "Slots", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tiers.map((t) => (
                <TierRow
                  key={t.id}
                  tier={t}
                  onSave={(updated) => saveTiers(tiers.map((x) => x.id === updated.id ? updated : x))}
                  onDelete={() => saveTiers(tiers.filter((x) => x.id !== t.id))}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Add-ons ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Add-ons</h2>
            <p className="text-[#555] text-xs mt-0.5">Collected via BackerKit after campaign closes</p>
          </div>
          <button onClick={addAddon} className="flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-[#333] text-[#888] hover:text-white px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={13} /> Add Add-on
          </button>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                {["Item", "Price", "Note", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {addons.map((a) => (
                <AddonRow
                  key={a.id}
                  addon={a}
                  onSave={(updated) => saveAddons(addons.map((x) => x.id === updated.id ? updated : x))}
                  onDelete={() => saveAddons(addons.filter((x) => x.id !== a.id))}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Unlockables ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Stretch Goals</h2>
            <p className="text-[#555] text-xs mt-0.5">Unlocked live during the campaign when funding milestones are hit</p>
          </div>
          <button onClick={addUnlockable} className="flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-[#333] text-[#888] hover:text-white px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={13} /> Add Goal
          </button>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                {["Goal", "Milestone", "Description", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unlockables.map((u) => (
                <UnlockableRow
                  key={u.id}
                  item={u}
                  onSave={(updated) => saveUnlockables(unlockables.map((x) => x.id === updated.id ? updated : x))}
                  onDelete={() => saveUnlockables(unlockables.filter((x) => x.id !== u.id))}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
