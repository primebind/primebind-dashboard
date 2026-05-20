"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";

const DEFAULT_KS_FEE = 0.12;
const DEFAULT_BLENDED_LOW = 80;
const DEFAULT_BLENDED_HIGH = 100;

type TierItem = { skuId: string; qty: number };
type Tier = { id: string; name: string; price: number; contents: TierItem[]; slots: number; note: string };
type Addon = { id: string; skuId: string; price: number; note: string };
type Unlockable = { id: string; refType: "color" | "sku"; refId: string; milestone: number; description: string; unlocked: boolean };
type SKU = { id: string; parentId: string | null; name: string; retailPrice: number };
type Color = { id: string; name: string; hex: string };

const DEFAULT_COLORS: Color[] = [
  { id: "obsidian", name: "Obsidian", hex: "#1a1a1a" },
  { id: "pearl", name: "Pearl", hex: "#e8e8e8" },
  { id: "rose", name: "Rose", hex: "#d4a0a0" },
  { id: "crimson", name: "Crimson", hex: "#8b0000" },
  { id: "jade", name: "Jade", hex: "#2d5a3d" },
  { id: "abyss", name: "Abyss", hex: "#1a2744" },
];

const DEFAULT_TIERS: Tier[] = [
  { id: "1", name: "Early Bird", price: 39, contents: [{ skuId: "9pb", qty: 1 }], slots: 100, note: "" },
  { id: "2", name: "Solo", price: 45, contents: [{ skuId: "9pb", qty: 1 }], slots: 0, note: "" },
  { id: "3", name: "Duo", price: 83, contents: [{ skuId: "9pb", qty: 2 }], slots: 0, note: "" },
  { id: "4", name: "Prime", price: 159, contents: [{ skuId: "9pb", qty: 2 }, { skuId: "12pb", qty: 2 }], slots: 0, note: "" },
  { id: "5", name: "Collector", price: 229, contents: [{ skuId: "9pb", qty: 2 }, { skuId: "12pb", qty: 2 }, { skuId: "cb", qty: 2 }], slots: 0, note: "" },
  { id: "6", name: "The Archive", price: 319, contents: [{ skuId: "9pb", qty: 3 }, { skuId: "12pb", qty: 3 }, { skuId: "cb", qty: 3 }], slots: 0, note: "" },
];

const DEFAULT_ADDONS: Addon[] = [
  { id: "1", skuId: "9pb", price: 48, note: "Steers toward Duo tier" },
  { id: "2", skuId: "12pb", price: 58, note: "Steers toward Prime over Duo + add-ons" },
  { id: "3", skuId: "cb", price: 30, note: "$5 below retail — low friction" },
  { id: "4", skuId: "fm9pb", price: 20, note: "Per binder, applied during BackerKit survey" },
];

const DEFAULT_UNLOCKABLES: Unlockable[] = [
  { id: "1", refType: "color", refId: "jade", milestone: 50000, description: "Deep green — stretch colorway", unlocked: false },
  { id: "2", refType: "color", refId: "abyss", milestone: 100000, description: "Dark navy — stretch colorway", unlocked: false },
];

function calcRetail(contents: TierItem[], skus: SKU[]): number {
  return contents.reduce((sum, item) => {
    const sku = skus.find((s) => s.id === item.skuId);
    return sum + (sku?.retailPrice || 0) * item.qty;
  }, 0);
}

function skuName(id: string, skus: SKU[]): string {
  return skus.find((s) => s.id === id)?.name || id;
}

function contentsLabel(contents: TierItem[], skus: SKU[]): string {
  if (!contents.length) return "—";
  return contents.map((i) => `${i.qty}x ${skuName(i.skuId, skus)}`).join(" · ");
}

// ── Tier row ──────────────────────────────────────────────────────────────────
function TierRow({ tier, skus, ksFee, onSave, onDelete }: { tier: Tier; skus: SKU[]; ksFee: number; onSave: (t: Tier) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Tier>(tier);
  const [addSkuId, setAddSkuId] = useState("");

  const parentSkus = skus.filter((s) => s.parentId === null);

  useEffect(() => {
    if (parentSkus.length && !addSkuId) setAddSkuId(parentSkus[0]?.id || "");
  }, [skus]);

  function commit() { onSave(draft); setEditing(false); }
  function cancel() { setDraft(tier); setEditing(false); }

  function addItem() {
    if (!addSkuId) return;
    const existing = draft.contents.find((i) => i.skuId === addSkuId);
    if (existing) {
      setDraft({ ...draft, contents: draft.contents.map((i) => i.skuId === addSkuId ? { ...i, qty: i.qty + 1 } : i) });
    } else {
      setDraft({ ...draft, contents: [...draft.contents, { skuId: addSkuId, qty: 1 }] });
    }
  }

  function removeItem(skuId: string) {
    setDraft({ ...draft, contents: draft.contents.filter((i) => i.skuId !== skuId) });
  }

  function updateQty(skuId: string, qty: number) {
    setDraft({ ...draft, contents: draft.contents.map((i) => i.skuId === skuId ? { ...i, qty } : i) });
  }

  const retail = calcRetail(tier.contents, skus);
  const draftRetail = calcRetail(draft.contents, skus);
  const sv = retail > 0 ? { amt: retail - tier.price, pct: Math.round(((retail - tier.price) / retail) * 100) } : null;

  if (editing) {
    return (
      <tr className="border-b border-[#1a1a1a] bg-[#151515]">
        <td className="px-4 py-3">
          <input className="input w-32" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </td>
        <td className="px-4 py-3">
          <input type="number" className="input w-20" value={draft.price} onChange={(e) => setDraft({ ...draft, price: +e.target.value })} />
        </td>
        <td className="px-4 py-3 min-w-[200px]">
          <div className="space-y-1.5">
            {draft.contents.map((item) => (
              <div key={item.skuId} className="flex items-center gap-1.5">
                <input type="number" className="input w-10 text-center" min={1} value={item.qty} onChange={(e) => updateQty(item.skuId, +e.target.value)} />
                <span className="text-xs text-[#888]">×</span>
                <span className="text-xs text-white">{skuName(item.skuId, skus)}</span>
                <button onClick={() => removeItem(item.skuId)} className="text-[#444] hover:text-red-500 ml-auto"><X size={11} /></button>
              </div>
            ))}
            <div className="flex items-center gap-1.5 pt-1">
              <select className="input text-xs flex-1" value={addSkuId} onChange={(e) => setAddSkuId(e.target.value)}>
                {parentSkus.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button onClick={addItem} className="text-[#555] hover:text-white"><Plus size={13} /></button>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-[#555] text-sm">${draftRetail || "—"}</td>
        <td className="px-4 py-3 text-[#555] text-xs">—</td>
        <td className="px-4 py-3 text-[#555] text-xs">—</td>
        <td className="px-4 py-3">
          <input type="number" className="input w-16" placeholder="∞" value={draft.slots || ""} onChange={(e) => setDraft({ ...draft, slots: +e.target.value })} />
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
    <tr className="border-b border-[#1a1a1a] hover:bg-[#151515]">
      <td className="px-4 py-4">
        <p className="text-white font-medium text-sm">{tier.name}</p>
      </td>
      <td className="px-4 py-4 text-white font-semibold">${tier.price}</td>
      <td className="px-4 py-4 text-[#888] text-xs">{contentsLabel(tier.contents, skus)}</td>
      <td className="px-4 py-4 text-[#555] text-sm">{retail > 0 ? `$${retail}` : "—"}</td>
      <td className="px-4 py-4">
        {sv && sv.amt > 0 && (
          <span className="text-green-400 text-sm font-medium">${sv.amt.toFixed(2)} <span className="text-[#555] text-xs">({sv.pct}%)</span></span>
        )}
      </td>
      <td className="px-4 py-4 text-[#888] text-sm">${(tier.price * (1 - ksFee)).toFixed(2)}</td>
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
function AddonRow({ addon, skus, onSave, onDelete }: { addon: Addon; skus: SKU[]; onSave: (a: Addon) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(addon);
  function commit() { onSave(draft); setEditing(false); }
  function cancel() { setDraft(addon); setEditing(false); }

  const parentSkus = skus.filter((s) => s.parentId === null);
  const itemName = skus.find((s) => s.id === addon.skuId)?.name || "—";

  if (editing) return (
    <tr className="border-b border-[#1a1a1a] bg-[#151515]">
      <td className="px-4 py-3">
        <select className="input w-44" value={draft.skuId} onChange={(e) => setDraft({ ...draft, skuId: e.target.value })}>
          {parentSkus.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </td>
      <td className="px-4 py-3"><input type="number" className="input w-20" value={draft.price} onChange={(e) => setDraft({ ...draft, price: +e.target.value })} /></td>
      <td className="px-4 py-3"><input className="input w-full" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} /></td>
      <td className="px-4 py-3"><div className="flex gap-2"><button onClick={commit} className="text-green-400 hover:text-green-300"><Check size={14} /></button><button onClick={cancel} className="text-[#555] hover:text-white"><X size={14} /></button></div></td>
    </tr>
  );

  return (
    <tr className="border-b border-[#1a1a1a] hover:bg-[#151515]">
      <td className="px-4 py-3 text-white text-sm">{itemName}</td>
      <td className="px-4 py-3 text-white font-medium">${addon.price}</td>
      <td className="px-4 py-3 text-[#555] text-xs">{addon.note}</td>
      <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => setEditing(true)} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button><button onClick={onDelete} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={13} /></button></div></td>
    </tr>
  );
}

// ── Unlockable row ────────────────────────────────────────────────────────────
function UnlockableRow({ item, skus, colors, onSave, onDelete }: { item: Unlockable; skus: SKU[]; colors: Color[]; onSave: (u: Unlockable) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);
  function commit() { onSave(draft); setEditing(false); }
  function cancel() { setDraft(item); setEditing(false); }

  const parentSkus = skus.filter((s) => s.parentId === null);

  function switchType(type: "color" | "sku") {
    const defaultId = type === "color" ? (colors[0]?.id || "") : (parentSkus[0]?.id || "");
    setDraft({ ...draft, refType: type, refId: defaultId });
  }

  const goalColor = item.refType === "color" ? colors.find((c) => c.id === item.refId) : null;
  const goalLabel = item.refType === "color"
    ? (goalColor?.name || item.refId || "—")
    : (skus.find((s) => s.id === item.refId)?.name || item.refId || "—");

  const draftColor = draft.refType === "color" ? colors.find((c) => c.id === draft.refId) : null;

  if (editing) return (
    <tr className="border-b border-[#1a1a1a] bg-[#151515]">
      <td className="px-4 py-3">
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {(["color", "sku"] as const).map((type) => (
              <button
                key={type}
                onClick={() => switchType(type)}
                className={`text-xs px-2.5 py-0.5 rounded font-medium transition-colors capitalize ${
                  draft.refType === type ? "bg-white text-black" : "bg-[#222] text-[#888] hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <select className="input flex-1" value={draft.refId} onChange={(e) => setDraft({ ...draft, refId: e.target.value })}>
              {draft.refType === "color"
                ? colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                : parentSkus.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
              }
            </select>
            {draftColor && <div className="w-4 h-4 rounded-full border border-[#444] shrink-0" style={{ background: draftColor.hex }} />}
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><input type="number" className="input w-28" value={draft.milestone} onChange={(e) => setDraft({ ...draft, milestone: +e.target.value })} /></td>
      <td className="px-4 py-3"><input className="input w-full" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></td>
      <td className="px-4 py-3 text-[#555] text-xs">—</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button onClick={commit} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
          <button onClick={cancel} className="text-[#555] hover:text-white"><X size={14} /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="border-b border-[#1a1a1a] hover:bg-[#151515]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {goalColor && <div className="w-3 h-3 rounded-full border border-[#444] shrink-0" style={{ background: goalColor.hex }} />}
          <span className="text-white text-sm font-medium">{goalLabel}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-[#888] text-sm">${item.milestone.toLocaleString()}</td>
      <td className="px-4 py-3 text-[#555] text-xs">{item.description}</td>
      <td className="px-4 py-3">
        <button onClick={() => onSave({ ...item, unlocked: !item.unlocked })} className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${item.unlocked ? "bg-green-950 text-green-400" : "bg-[#1a1a1a] text-[#555] hover:text-white"}`}>
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
  const [skus, setSkus] = useState<SKU[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [ksFee, setKsFee] = useState(DEFAULT_KS_FEE);
  const [blendedLow, setBlendedLow] = useState(DEFAULT_BLENDED_LOW);
  const [blendedHigh, setBlendedHigh] = useState(DEFAULT_BLENDED_HIGH);
  const [editingFee, setEditingFee] = useState(false);
  const [editingBlended, setEditingBlended] = useState(false);
  const [feeDraft, setFeeDraft] = useState("");
  const [blendedLowDraft, setBlendedLowDraft] = useState("");
  const [blendedHighDraft, setBlendedHighDraft] = useState("");

  useEffect(() => {
    const rawSkus = localStorage.getItem("pb_skus");
    if (rawSkus) setSkus(JSON.parse(rawSkus));

    const rawColors = localStorage.getItem("pb_colors");
    setColors(rawColors ? JSON.parse(rawColors) : DEFAULT_COLORS);

    const fee = localStorage.getItem("pb_ks_fee");
    if (fee) setKsFee(parseFloat(fee));

    const blended = localStorage.getItem("pb_ks_blended");
    if (blended) { const b = JSON.parse(blended); setBlendedLow(b.low); setBlendedHigh(b.high); }

    const t = localStorage.getItem("pb_ks_tiers");
    if (t) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setTiers(JSON.parse(t).map((tier: any) => ({
        ...tier,
        contents: typeof tier.contents === "string" ? [] : (tier.contents || []),
      })));
    } else {
      setTiers(DEFAULT_TIERS);
    }

    const a = localStorage.getItem("pb_ks_addons");
    if (a) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAddons(JSON.parse(a).map((addon: any) => ({ ...addon, skuId: addon.skuId || "" })));
    } else {
      setAddons(DEFAULT_ADDONS);
    }

    const u = localStorage.getItem("pb_ks_unlockables");
    if (u) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUnlockables(JSON.parse(u).map((item: any) => ({
        ...item,
        refType: item.refType || "color",
        refId: item.refId || "",
      })));
    } else {
      setUnlockables(DEFAULT_UNLOCKABLES);
    }
  }, []);

  function saveTiers(updated: Tier[]) { setTiers(updated); localStorage.setItem("pb_ks_tiers", JSON.stringify(updated)); }
  function saveAddons(updated: Addon[]) { setAddons(updated); localStorage.setItem("pb_ks_addons", JSON.stringify(updated)); }
  function saveUnlockables(updated: Unlockable[]) { setUnlockables(updated); localStorage.setItem("pb_ks_unlockables", JSON.stringify(updated)); }

  function addTier() {
    saveTiers([...tiers, { id: Date.now().toString(), name: "New Tier", price: 0, contents: [], slots: 0, note: "" }]);
  }
  function addAddon() {
    const firstSkuId = skus.filter((s) => s.parentId === null)[0]?.id || "";
    saveAddons([...addons, { id: Date.now().toString(), skuId: firstSkuId, price: 0, note: "" }]);
  }
  function addUnlockable() {
    const firstColorId = colors[0]?.id || "";
    saveUnlockables([...unlockables, { id: Date.now().toString(), refType: "color", refId: firstColorId, milestone: 0, description: "", unlocked: false }]);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kickstarter</h1>
        <p className="text-[#888] text-sm mt-1">Tiers, add-ons, and stretch goals — Sept 1, 2026</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "KS Goal", value: "$20,000" },
          { label: "Break-even", value: "$18,300" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111] border border-[#222] rounded-xl p-5">
            <p className="text-[#888] text-xs uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}

        {/* Blended Avg Pledge — editable */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Blended Avg Pledge</p>
          {editingBlended ? (
            <div className="flex items-center gap-1">
              <span className="text-white text-sm">$</span>
              <input autoFocus type="number" className="input w-14 text-lg font-bold" value={blendedLowDraft}
                onChange={(e) => setBlendedLowDraft(e.target.value)} />
              <span className="text-[#555] text-sm">–</span>
              <span className="text-white text-sm">$</span>
              <input type="number" className="input w-14 text-lg font-bold" value={blendedHighDraft}
                onChange={(e) => setBlendedHighDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const lo = parseInt(blendedLowDraft) || blendedLow;
                    const hi = parseInt(blendedHighDraft) || blendedHigh;
                    setBlendedLow(lo); setBlendedHigh(hi);
                    localStorage.setItem("pb_ks_blended", JSON.stringify({ low: lo, high: hi }));
                    setEditingBlended(false);
                  }
                  if (e.key === "Escape") setEditingBlended(false);
                }} />
              <button onClick={() => {
                const lo = parseInt(blendedLowDraft) || blendedLow;
                const hi = parseInt(blendedHighDraft) || blendedHigh;
                setBlendedLow(lo); setBlendedHigh(hi);
                localStorage.setItem("pb_ks_blended", JSON.stringify({ low: lo, high: hi }));
                setEditingBlended(false);
              }} className="text-green-400 hover:text-green-300 ml-1"><Check size={13} /></button>
            </div>
          ) : (
            <button onClick={() => { setBlendedLowDraft(String(blendedLow)); setBlendedHighDraft(String(blendedHigh)); setEditingBlended(true); }}
              className="text-2xl font-bold text-white hover:text-[#ccc] transition-colors text-left">
              ${blendedLow}–${blendedHigh}
            </button>
          )}
        </div>

        {/* KS + BackerKit Fees — editable */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">KS + BackerKit Fees</p>
          {editingFee ? (
            <div className="flex items-center gap-1">
              <input autoFocus type="number" step="0.1" min="0" max="100" className="input w-20 text-2xl font-bold"
                value={feeDraft} onChange={(e) => setFeeDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = parseFloat(feeDraft) / 100;
                    if (!isNaN(v)) { setKsFee(v); localStorage.setItem("pb_ks_fee", String(v)); }
                    setEditingFee(false);
                  }
                  if (e.key === "Escape") setEditingFee(false);
                }} />
              <span className="text-white text-lg font-bold">%</span>
              <button onClick={() => {
                const v = parseFloat(feeDraft) / 100;
                if (!isNaN(v)) { setKsFee(v); localStorage.setItem("pb_ks_fee", String(v)); }
                setEditingFee(false);
              }} className="text-green-400 hover:text-green-300 ml-1"><Check size={13} /></button>
            </div>
          ) : (
            <button onClick={() => { setFeeDraft((ksFee * 100).toFixed(1)); setEditingFee(true); }}
              className="text-2xl font-bold text-white hover:text-[#ccc] transition-colors text-left">
              {(ksFee * 100).toFixed(1)}%
            </button>
          )}
        </div>
      </div>

      {/* Tiers */}
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
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-visible">
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
                  skus={skus}
                  ksFee={ksFee}
                  onSave={(updated) => saveTiers(tiers.map((x) => x.id === updated.id ? updated : x))}
                  onDelete={() => saveTiers(tiers.filter((x) => x.id !== t.id))}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add-ons */}
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
                {["Item", "Price", "Note", ""].map((h) => <th key={h} className="text-left px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {addons.map((a) => (
                <AddonRow key={a.id} addon={a} skus={skus} onSave={(u) => saveAddons(addons.map((x) => x.id === u.id ? u : x))} onDelete={() => saveAddons(addons.filter((x) => x.id !== a.id))} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Stretch Goals */}
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
                {["Goal", "Milestone", "Description", "Status", ""].map((h) => <th key={h} className="text-left px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {unlockables.map((u) => (
                <UnlockableRow
                  key={u.id}
                  item={u}
                  skus={skus}
                  colors={colors}
                  onSave={(upd) => saveUnlockables(unlockables.map((x) => x.id === upd.id ? upd : x))}
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
