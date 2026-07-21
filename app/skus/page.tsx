"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";

type SKU = {
  id: string;
  parentId: string | null;
  name: string;
  colorHex: string;
  unitPrice: number;
  estShipping: number;
  estDuties: number;
  estPackaging: number;
  retailPrice: number;
  unitsInInventory: number;
  samplesInInventory: number;
  dylanFernando?: number;
};

type ProfitAssumptions = {
  customerDiscountPct: number;
  opsCostPct: number;
  marketingCostPct: number;
  factorToSell: number;
  kickstarterFeePct: number;
  backerkitFeePct: number;
};

const DEFAULT_ASSUMPTIONS: ProfitAssumptions = {
  customerDiscountPct: 0,
  opsCostPct: 20,
  marketingCostPct: 30,
  factorToSell: 4,
  kickstarterFeePct: 10,
  backerkitFeePct: 2,
};

type Color = { id: string; name: string; hex: string };

const DEFAULT_COLORS: Color[] = [
  { id: "obsidian", name: "Obsidian", hex: "#1a1a1a" },
  { id: "pearl", name: "Pearl", hex: "#e8e8e8" },
  { id: "rose", name: "Rose", hex: "#d4a0a0" },
  { id: "crimson", name: "Crimson", hex: "#8b0000" },
  { id: "jade", name: "Jade", hex: "#2d5a3d" },
  { id: "abyss", name: "Abyss", hex: "#1a2744" },
];

const DEFAULT_SKUS: SKU[] = [
  { id: "9pb", parentId: null, name: "9 Pocket Binder", colorHex: "", unitPrice: 14, estShipping: 0, estDuties: 0, estPackaging: 0, retailPrice: 60, unitsInInventory: 0, samplesInInventory: 0, dylanFernando: 3 },
  { id: "9pb-obsidian", parentId: "9pb", name: "Obsidian", colorHex: "#1a1a1a", unitPrice: 0, estShipping: 0, estDuties: 0, estPackaging: 0, retailPrice: 0, unitsInInventory: 0, samplesInInventory: 0 },
  { id: "9pb-pearl", parentId: "9pb", name: "Pearl", colorHex: "#e8e8e8", unitPrice: 0, estShipping: 0, estDuties: 0, estPackaging: 0, retailPrice: 0, unitsInInventory: 0, samplesInInventory: 0 },
  { id: "9pb-rose", parentId: "9pb", name: "Rose", colorHex: "#d4a0a0", unitPrice: 0, estShipping: 0, estDuties: 0, estPackaging: 0, retailPrice: 0, unitsInInventory: 0, samplesInInventory: 0 },
  { id: "9pb-crimson", parentId: "9pb", name: "Crimson", colorHex: "#8b0000", unitPrice: 0, estShipping: 0, estDuties: 0, estPackaging: 0, retailPrice: 0, unitsInInventory: 0, samplesInInventory: 0 },
  { id: "12pb", parentId: null, name: "12 Pocket Binder", colorHex: "", unitPrice: 16.75, estShipping: 0, estDuties: 0, estPackaging: 0, retailPrice: 70, unitsInInventory: 0, samplesInInventory: 0, dylanFernando: 3.5 },
  { id: "cb", parentId: null, name: "Card Box", colorHex: "", unitPrice: 7.5, estShipping: 0, estDuties: 0, estPackaging: 0, retailPrice: 35, unitsInInventory: 0, samplesInInventory: 0, dylanFernando: 1 },
  { id: "fm9pb", parentId: null, name: "FindMy 9PB", colorHex: "", unitPrice: 19, estShipping: 0, estDuties: 0, estPackaging: 0, retailPrice: 80, unitsInInventory: 0, samplesInInventory: 0, dylanFernando: 3.5 },
  { id: "fmcb", parentId: null, name: "FindMy Card Box", colorHex: "", unitPrice: 12.5, estShipping: 0, estDuties: 0, estPackaging: 0, retailPrice: 55, unitsInInventory: 0, samplesInInventory: 0, dylanFernando: 1.5 },
];

function fmt(n: number) {
  return n === 0 ? "—" : `$${n % 1 === 0 ? n : n.toFixed(2)}`;
}

export default function SKUs() {
  const [tab, setTab] = useState<"products" | "colors" | "profitability">("products");
  const [skus, setSkus] = useState<SKU[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<SKU>>({});
  const [addingColorTo, setAddingColorTo] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState("");
  const [showNewParent, setShowNewParent] = useState(false);
  const [parentForm, setParentForm] = useState({ name: "", unitPrice: "", estShipping: "", estDuties: "", estPackaging: "", retailPrice: "", dylanFernando: "" });
  const [assumptions, setAssumptions] = useState<ProfitAssumptions>(DEFAULT_ASSUMPTIONS);

  // Colors tab state
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [colorDraft, setColorDraft] = useState<Color>({ id: "", name: "", hex: "" });
  const [showAddColor, setShowAddColor] = useState(false);
  const [addColorForm, setAddColorForm] = useState({ name: "", hex: "" });

  const [onOrderMap, setOnOrderMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedSkus = localStorage.getItem("pb_skus");
    if (savedSkus) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSkus(JSON.parse(savedSkus).map((s: any) => ({ ...s, retailPrice: s.retailPrice ?? 0 })));
    } else {
      setSkus(DEFAULT_SKUS);
    }

    const savedColors = localStorage.getItem("pb_colors");
    const loadedColors: Color[] = savedColors ? JSON.parse(savedColors) : DEFAULT_COLORS;
    setColors(loadedColors);
    if (loadedColors.length) setSelectedColorId(loadedColors[0].id);

    const savedAssumptions = localStorage.getItem("pb_profit_assumptions");
    if (savedAssumptions) setAssumptions({ ...DEFAULT_ASSUMPTIONS, ...JSON.parse(savedAssumptions) });

    const savedInbounds = localStorage.getItem("pb_inbounds");
    if (savedInbounds) {
      const map: Record<string, number> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      JSON.parse(savedInbounds).forEach((inbound: any) => {
        if (inbound.status === "Received" || inbound.status === "Cancelled") return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (inbound.lines || []).forEach((line: any) => {
          if (!line.colorwayId) return;
          const outstanding = Math.max(0, (line.qtyOrdered || 0) - (line.qtyReceived || 0));
          map[line.colorwayId] = (map[line.colorwayId] || 0) + outstanding;
        });
      });
      setOnOrderMap(map);
    }
  }, []);

  function saveSkus(updated: SKU[]) {
    setSkus(updated);
    localStorage.setItem("pb_skus", JSON.stringify(updated));
  }

  function saveColors(updated: Color[]) {
    setColors(updated);
    localStorage.setItem("pb_colors", JSON.stringify(updated));
  }

  function saveAssumptions(updated: ProfitAssumptions) {
    setAssumptions(updated);
    localStorage.setItem("pb_profit_assumptions", JSON.stringify(updated));
  }

  function updateDylanFernando(id: string, value: number) {
    saveSkus(skus.map((s) => (s.id === id ? { ...s, dylanFernando: value } : s)));
  }

  function updateRetailPrice(id: string, value: number) {
    saveSkus(skus.map((s) => (s.id === id ? { ...s, retailPrice: value } : s)));
  }

  function startEdit(s: SKU) { setEditingId(s.id); setDraft({ ...s }); }
  function commitEdit() {
    if (!editingId) return;
    saveSkus(skus.map((s) => s.id === editingId ? { ...s, ...draft } : s));
    setEditingId(null); setDraft({});
  }
  function cancelEdit() { setEditingId(null); setDraft({}); }
  function removeSku(id: string) { saveSkus(skus.filter((s) => s.id !== id && s.parentId !== id)); }

  function addColorway(parentId: string) {
    const color = colors.find((c) => c.id === selectedColorId);
    if (!color) return;
    const newChild: SKU = {
      id: `${parentId}-${color.id}-${Date.now()}`,
      parentId, name: color.name, colorHex: color.hex,
      unitPrice: 0, estShipping: 0, estDuties: 0, estPackaging: 0, retailPrice: 0,
      unitsInInventory: 0, samplesInInventory: 0,
    };
    saveSkus([...skus, newChild]);
    setAddingColorTo(null);
  }

  function addParent() {
    if (!parentForm.name.trim()) return;
    const newParent: SKU = {
      id: `sku-${Date.now()}`, parentId: null, name: parentForm.name.trim(), colorHex: "",
      unitPrice: +parentForm.unitPrice || 0, estShipping: +parentForm.estShipping || 0,
      estDuties: +parentForm.estDuties || 0, estPackaging: +parentForm.estPackaging || 0,
      retailPrice: +parentForm.retailPrice || 0,
      unitsInInventory: 0, samplesInInventory: 0,
      dylanFernando: +parentForm.dylanFernando || 0,
    };
    saveSkus([...skus, newParent]);
    setParentForm({ name: "", unitPrice: "", estShipping: "", estDuties: "", estPackaging: "", retailPrice: "", dylanFernando: "" });
    setShowNewParent(false);
  }

  function addColor() {
    if (!addColorForm.name.trim() || !addColorForm.hex.trim()) return;
    const newColor: Color = { id: `color-${Date.now()}`, name: addColorForm.name.trim(), hex: addColorForm.hex.trim() };
    saveColors([...colors, newColor]);
    setAddColorForm({ name: "", hex: "" });
    setShowAddColor(false);
  }

  function commitColorEdit() {
    if (!editingColorId) return;
    saveColors(colors.map((c) => c.id === editingColorId ? colorDraft : c));
    setEditingColorId(null);
  }

  const parents = skus.filter((s) => s.parentId === null);
  const totalUnits = skus.filter((s) => s.parentId !== null).reduce((sum, s) => sum + s.unitsInInventory, 0);
  const totalSamples = skus.filter((s) => s.parentId !== null).reduce((sum, s) => sum + s.samplesInInventory, 0);
  const totalOnOrder = Object.values(onOrderMap).reduce((sum, n) => sum + n, 0);
  const activeColor = colors.find((c) => c.id === selectedColorId);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SKUs</h1>
          <p className="text-[#888] text-sm mt-1">Product cost and inventory tracking</p>
        </div>
        {tab === "products" && (
          <button onClick={() => setShowNewParent(!showNewParent)} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors">
            <Plus size={16} /> Add SKU
          </button>
        )}
        {tab === "colors" && (
          <button onClick={() => setShowAddColor(!showAddColor)} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors">
            <Plus size={16} /> Add Color
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[#222]">
        {(["products", "colors", "profitability"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === key ? "text-white border-white" : "text-[#555] border-transparent hover:text-[#888]"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#111] border border-[#222] rounded-xl p-5">
              <p className="text-[#888] text-xs uppercase tracking-wider mb-2">On Hand</p>
              <p className="text-3xl font-bold text-white">{totalUnits.toLocaleString()}</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-5">
              <p className="text-[#888] text-xs uppercase tracking-wider mb-2">On Order</p>
              <p className={`text-3xl font-bold ${totalOnOrder > 0 ? "text-blue-400" : "text-white"}`}>{totalOnOrder.toLocaleString()}</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-5">
              <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Samples</p>
              <p className="text-3xl font-bold text-white">{totalSamples.toLocaleString()}</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-5">
              <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Active SKUs</p>
              <p className="text-3xl font-bold text-white">{parents.length}</p>
            </div>
          </div>

          {showNewParent && (
            <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
              <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">New SKU</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
                <div className="col-span-2">
                  <label className="text-xs text-[#888] mb-1 block">Product Name</label>
                  <input className="input w-full" placeholder="9 Pocket Binder" value={parentForm.name} onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })} />
                </div>
                {[["unitPrice","Unit Price ($)"],["estShipping","Est. Shipping ($)"],["estDuties","Est. Duties ($)"],["estPackaging","Est. Packaging ($)"],["retailPrice","Retail Price ($)"],["dylanFernando","Dylan/Fernando ($)"]].map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs text-[#888] mb-1 block">{label}</label>
                    <input type="number" className="input w-full" placeholder="0" value={(parentForm as Record<string, string>)[key]} onChange={(e) => setParentForm({ ...parentForm, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={addParent} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0]">Add</button>
                <button onClick={() => setShowNewParent(false)} className="text-[#888] text-sm px-4 py-2 hover:text-white">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {parents.map((parent) => {
              const children = skus.filter((s) => s.parentId === parent.id);
              const isEditing = editingId === parent.id;
              const p = isEditing ? { ...parent, ...draft } as SKU : parent;
              const landedCost = p.unitPrice + p.estShipping + p.estDuties + p.estPackaging;

              return (
                <div key={parent.id} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#222] flex items-center gap-4 flex-wrap">
                    <p className="text-white font-semibold text-sm w-36 shrink-0">{parent.name}</p>

                    {isEditing ? (
                      <>
                        <div className="flex flex-wrap gap-3 flex-1">
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[10px] text-[#555] whitespace-nowrap">Name</label>
                            <input className="input w-36" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                          </div>
                          {[["unitPrice","Unit Price"],["estShipping","Shipping"],["estDuties","Duties"],["estPackaging","Packaging"],["retailPrice","Retail Price"]].map(([field, label]) => (
                            <div key={field} className="flex flex-col gap-0.5">
                              <label className="text-[10px] text-[#555] whitespace-nowrap">{label}</label>
                              <input type="number" className="input w-16" value={(draft as Record<string, number>)[field] ?? 0} onChange={(e) => setDraft({ ...draft, [field]: +e.target.value })} />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 ml-2 shrink-0">
                          <button onClick={commitEdit} className="text-green-400 hover:text-green-300"><Check size={15} /></button>
                          <button onClick={cancelEdit} className="text-[#555] hover:text-white"><X size={15} /></button>
                        </div>
                      </>
                    ) : (
                      <>
                        {[["Unit Price", fmt(parent.unitPrice)],["Est. Shipping", fmt(parent.estShipping)],["Est. Duties", fmt(parent.estDuties)],["Est. Packaging", fmt(parent.estPackaging)]].map(([label, val]) => (
                          <div key={label} className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-[#555]">{label}</span>
                            <span className="text-sm text-[#888]">{val}</span>
                          </div>
                        ))}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-[#555]">Landed</span>
                          <span className="text-sm text-white font-medium">{fmt(landedCost)}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-[#555]">Retail Price</span>
                          <span className="text-sm text-green-400 font-medium">{fmt(parent.retailPrice)}</span>
                        </div>
                        <div className="flex gap-2 ml-auto">
                          <button onClick={() => startEdit(parent)} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => removeSku(parent.id)} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </>
                    )}
                  </div>

                  {children.length > 0 && (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[#444] text-xs uppercase tracking-wider border-b border-[#1a1a1a]">
                          <th className="text-left px-5 py-2 pl-10">Colorway</th>
                          <th className="text-left px-5 py-2">Samples</th>
                          <th className="text-left px-5 py-2">On Order</th>
                          <th className="text-left px-5 py-2">On Hand</th>
                          <th className="px-5 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {children.map((child) => {
                          const isEditingChild = editingId === child.id;
                          return (
                            <tr key={child.id} className="border-b border-[#1a1a1a] hover:bg-[#151515]">
                              <td className="px-5 py-3 pl-10">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full border border-[#444] shrink-0" style={{ background: child.colorHex }} />
                                  {isEditingChild
                                    ? <input className="input w-28 text-sm" value={draft.name ?? child.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                                    : <span className="text-white text-sm">{child.name}</span>
                                  }
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                {isEditingChild ? <input type="number" className="input w-20" value={draft.samplesInInventory ?? 0} onChange={(e) => setDraft({ ...draft, samplesInInventory: +e.target.value })} /> : <span className="text-[#888]">{child.samplesInInventory}</span>}
                              </td>
                              <td className="px-5 py-3">
                                {(() => { const qty = onOrderMap[child.id] || 0; return qty > 0 ? <span className="text-blue-400 font-medium">{qty}</span> : <span className="text-[#333]">—</span>; })()}
                              </td>
                              <td className="px-5 py-3">
                                {isEditingChild ? <input type="number" className="input w-20" value={draft.unitsInInventory ?? 0} onChange={(e) => setDraft({ ...draft, unitsInInventory: +e.target.value })} /> : <span className="text-[#888]">{child.unitsInInventory}</span>}
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex gap-2 justify-end">
                                  {isEditingChild ? (
                                    <><button onClick={commitEdit} className="text-green-400 hover:text-green-300"><Check size={13} /></button><button onClick={cancelEdit} className="text-[#555] hover:text-white"><X size={13} /></button></>
                                  ) : (
                                    <><button onClick={() => startEdit(child)} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button><button onClick={() => removeSku(child.id)} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={13} /></button></>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {addingColorTo === parent.id ? (
                    <div className="px-5 py-3 pl-10 flex items-center gap-2 border-t border-[#1a1a1a]">
                      <select
                        className="input flex-1"
                        value={selectedColorId}
                        onChange={(e) => setSelectedColorId(e.target.value)}
                        autoFocus
                      >
                        {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      {activeColor && (
                        <div className="w-4 h-4 rounded-full border border-[#444] shrink-0" style={{ background: activeColor.hex }} />
                      )}
                      <button onClick={() => addColorway(parent.id)} className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-medium hover:bg-[#e0e0e0]">Add</button>
                      <button onClick={() => setAddingColorTo(null)} className="text-[#555] hover:text-white"><X size={14} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setAddingColorTo(parent.id)} className="w-full text-left px-5 py-2.5 pl-10 text-xs text-[#444] hover:text-[#888] transition-colors border-t border-[#1a1a1a] flex items-center gap-1.5">
                      <Plus size={12} /> Add colorway
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "colors" && (
        <div className="space-y-4">
          {showAddColor && (
            <div className="bg-[#111] border border-[#222] rounded-xl p-5 flex items-end gap-3 flex-wrap">
              <div>
                <label className="text-xs text-[#888] mb-1 block">Color Name</label>
                <input className="input w-32" placeholder="Obsidian" autoFocus value={addColorForm.name} onChange={(e) => setAddColorForm({ ...addColorForm, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addColor()} />
              </div>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Hex</label>
                <input className="input w-28" placeholder="#1a1a1a" value={addColorForm.hex} onChange={(e) => setAddColorForm({ ...addColorForm, hex: e.target.value })} />
              </div>
              {/^#[0-9a-fA-F]{3,6}$/.test(addColorForm.hex) && (
                <div className="w-8 h-8 rounded-lg border border-[#444] shrink-0" style={{ background: addColorForm.hex }} />
              )}
              <button onClick={addColor} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0]">Add</button>
              <button onClick={() => setShowAddColor(false)} className="text-[#555] hover:text-white"><X size={14} /></button>
            </div>
          )}

          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 w-16">Swatch</th>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Hex</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {colors.map((color) => {
                  const isEditingColor = editingColorId === color.id;
                  const displayHex = isEditingColor ? colorDraft.hex : color.hex;
                  return (
                    <tr key={color.id} className="border-b border-[#1a1a1a] hover:bg-[#151515]">
                      <td className="px-5 py-3">
                        <div className="w-6 h-6 rounded-md border border-[#444]" style={{ background: displayHex }} />
                      </td>
                      <td className="px-5 py-3">
                        {isEditingColor ? (
                          <input className="input w-32" value={colorDraft.name} onChange={(e) => setColorDraft({ ...colorDraft, name: e.target.value })} />
                        ) : (
                          <span className="text-white font-medium">{color.name}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {isEditingColor ? (
                          <input className="input w-28" value={colorDraft.hex} onChange={(e) => setColorDraft({ ...colorDraft, hex: e.target.value })} />
                        ) : (
                          <span className="text-[#555] font-mono text-xs">{color.hex}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2 justify-end">
                          {isEditingColor ? (
                            <><button onClick={commitColorEdit} className="text-green-400 hover:text-green-300"><Check size={13} /></button><button onClick={() => setEditingColorId(null)} className="text-[#555] hover:text-white"><X size={13} /></button></>
                          ) : (
                            <><button onClick={() => { setEditingColorId(color.id); setColorDraft({ ...color }); }} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button><button onClick={() => saveColors(colors.filter((c) => c.id !== color.id))} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={13} /></button></>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "profitability" && (
        <div className="space-y-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-5">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Assumptions</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {([
                ["customerDiscountPct", "Customer Discount %"],
                ["factorToSell", "Factor to Sell"],
                ["opsCostPct", "Ops Cost %"],
                ["marketingCostPct", "Marketing Cost %"],
                ["kickstarterFeePct", "Kickstarter Fee %"],
                ["backerkitFeePct", "BackerKit Fee %"],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs text-[#888] mb-1 block">{label}</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={assumptions[key]}
                    onChange={(e) => saveAssumptions({ ...assumptions, [key]: +e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider whitespace-nowrap">
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3">Landed Cost</th>
                  <th className="text-left px-4 py-3">Ideal Sell</th>
                  <th className="text-left px-4 py-3">Realistic Sell</th>
                  <th className="text-left px-4 py-3">W/ Discount</th>
                  <th className="text-left px-4 py-3">Rev − COGS</th>
                  <th className="text-left px-4 py-3">COGS %</th>
                  <th className="text-left px-4 py-3">Ops Cost</th>
                  <th className="text-left px-4 py-3">Marketing</th>
                  <th className="text-left px-4 py-3">Dylan/Fern.</th>
                  <th className="text-left px-4 py-3">KS Fee</th>
                  <th className="text-left px-4 py-3">BackerKit</th>
                  <th className="text-left px-4 py-3">Profit/Unit</th>
                  <th className="text-left px-4 py-3">Profit %</th>
                </tr>
              </thead>
              <tbody>
                {parents.map((p) => {
                  const landed = p.unitPrice + p.estShipping + p.estDuties + p.estPackaging;
                  const ideal = landed * assumptions.factorToSell;
                  const realistic = p.retailPrice;
                  const discounted = realistic * (1 - assumptions.customerDiscountPct / 100);
                  const revenueMinusCogs = discounted - landed;
                  const cogsPct = discounted !== 0 ? (landed / discounted) * 100 : 0;
                  const opsCost = discounted * (assumptions.opsCostPct / 100);
                  const marketingCost = realistic * (assumptions.marketingCostPct / 100);
                  const dylanFernando = p.dylanFernando ?? 0;
                  const ksFee = discounted * (assumptions.kickstarterFeePct / 100);
                  const bkFee = discounted * (assumptions.backerkitFeePct / 100);
                  const profit = discounted - landed - opsCost - marketingCost - dylanFernando - ksFee - bkFee;
                  const profitPct = discounted !== 0 ? (profit / discounted) * 100 : 0;

                  return (
                    <tr key={p.id} className="border-b border-[#1a1a1a] hover:bg-[#151515] whitespace-nowrap">
                      <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-[#888]">{fmt(landed)}</td>
                      <td className="px-4 py-3 text-[#888]">{fmt(ideal)}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="input w-20"
                          value={realistic}
                          onChange={(e) => updateRetailPrice(p.id, +e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3 text-[#888]">{fmt(discounted)}</td>
                      <td className="px-4 py-3 text-[#888]">{fmt(revenueMinusCogs)}</td>
                      <td className="px-4 py-3 text-[#888]">{cogsPct.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-[#888]">{fmt(opsCost)}</td>
                      <td className="px-4 py-3 text-[#888]">{fmt(marketingCost)}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="input w-16"
                          value={dylanFernando}
                          onChange={(e) => updateDylanFernando(p.id, +e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3 text-[#888]">{fmt(ksFee)}</td>
                      <td className="px-4 py-3 text-[#888]">{fmt(bkFee)}</td>
                      <td className="px-4 py-3 text-green-400 font-medium">{fmt(profit)}</td>
                      <td className="px-4 py-3 text-green-400">{profitPct.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
