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
  unitsInInventory: number;
  samplesInInventory: number;
};

const COLORWAY_HEX: Record<string, string> = {
  Obsidian: "#1a1a1a",
  Pearl: "#e8e8e8",
  Rose: "#d4a0a0",
  Crimson: "#8b0000",
  Jade: "#2d5a3d",
  Abyss: "#1a2744",
};

const DEFAULT_SKUS: SKU[] = [
  { id: "9pb", parentId: null, name: "9 Pocket Binder", colorHex: "", unitPrice: 14, estShipping: 0, estDuties: 0, estPackaging: 0, unitsInInventory: 0, samplesInInventory: 0 },
  { id: "9pb-obsidian", parentId: "9pb", name: "Obsidian", colorHex: "#1a1a1a", unitPrice: 0, estShipping: 0, estDuties: 0, estPackaging: 0, unitsInInventory: 0, samplesInInventory: 0 },
  { id: "9pb-pearl", parentId: "9pb", name: "Pearl", colorHex: "#e8e8e8", unitPrice: 0, estShipping: 0, estDuties: 0, estPackaging: 0, unitsInInventory: 0, samplesInInventory: 0 },
  { id: "9pb-rose", parentId: "9pb", name: "Rose", colorHex: "#d4a0a0", unitPrice: 0, estShipping: 0, estDuties: 0, estPackaging: 0, unitsInInventory: 0, samplesInInventory: 0 },
  { id: "9pb-crimson", parentId: "9pb", name: "Crimson", colorHex: "#8b0000", unitPrice: 0, estShipping: 0, estDuties: 0, estPackaging: 0, unitsInInventory: 0, samplesInInventory: 0 },
  { id: "12pb", parentId: null, name: "12 Pocket Binder", colorHex: "", unitPrice: 16.75, estShipping: 0, estDuties: 0, estPackaging: 0, unitsInInventory: 0, samplesInInventory: 0 },
  { id: "cb", parentId: null, name: "Card Box", colorHex: "", unitPrice: 7.5, estShipping: 0, estDuties: 0, estPackaging: 0, unitsInInventory: 0, samplesInInventory: 0 },
  { id: "fm9pb", parentId: null, name: "FindMy 9PB", colorHex: "", unitPrice: 19, estShipping: 0, estDuties: 0, estPackaging: 0, unitsInInventory: 0, samplesInInventory: 0 },
  { id: "fmcb", parentId: null, name: "FindMy Card Box", colorHex: "", unitPrice: 12.5, estShipping: 0, estDuties: 0, estPackaging: 0, unitsInInventory: 0, samplesInInventory: 0 },
];

function landed(s: SKU) {
  return s.unitPrice + s.estShipping + s.estDuties + s.estPackaging;
}

function fmt(n: number) {
  return n === 0 ? "—" : `$${n % 1 === 0 ? n : n.toFixed(2)}`;
}

export default function SKUs() {
  const [skus, setSkus] = useState<SKU[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<SKU>>({});
  const [addingColorTo, setAddingColorTo] = useState<string | null>(null);
  const [colorForm, setColorForm] = useState({ name: "", colorHex: "" });
  const [showNewParent, setShowNewParent] = useState(false);
  const [parentForm, setParentForm] = useState({ name: "", unitPrice: "", estShipping: "", estDuties: "", estPackaging: "" });

  useEffect(() => {
    const saved = localStorage.getItem("pb_skus");
    setSkus(saved ? JSON.parse(saved) : DEFAULT_SKUS);
  }, []);

  function save(updated: SKU[]) {
    setSkus(updated);
    localStorage.setItem("pb_skus", JSON.stringify(updated));
  }

  function startEdit(s: SKU) {
    setEditingId(s.id);
    setDraft({ ...s });
  }

  function commitEdit() {
    if (!editingId) return;
    save(skus.map((s) => s.id === editingId ? { ...s, ...draft } : s));
    setEditingId(null);
    setDraft({});
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({});
  }

  function removeSku(id: string) {
    save(skus.filter((s) => s.id !== id && s.parentId !== id));
  }

  function addColorway(parentId: string) {
    if (!colorForm.name.trim()) return;
    const hex = colorForm.colorHex || COLORWAY_HEX[colorForm.name] || "#555555";
    const parent = skus.find((s) => s.id === parentId);
    const newChild: SKU = {
      id: `${parentId}-${colorForm.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      parentId,
      name: colorForm.name.trim(),
      colorHex: hex,
      unitPrice: 0,
      estShipping: parent?.estShipping || 0,
      estDuties: parent?.estDuties || 0,
      estPackaging: parent?.estPackaging || 0,
      unitsInInventory: 0,
      samplesInInventory: 0,
    };
    save([...skus, newChild]);
    setColorForm({ name: "", colorHex: "" });
    setAddingColorTo(null);
  }

  function addParent() {
    if (!parentForm.name.trim()) return;
    const newParent: SKU = {
      id: `sku-${Date.now()}`,
      parentId: null,
      name: parentForm.name.trim(),
      colorHex: "",
      unitPrice: +parentForm.unitPrice || 0,
      estShipping: +parentForm.estShipping || 0,
      estDuties: +parentForm.estDuties || 0,
      estPackaging: +parentForm.estPackaging || 0,
      unitsInInventory: 0,
      samplesInInventory: 0,
    };
    save([...skus, newParent]);
    setParentForm({ name: "", unitPrice: "", estShipping: "", estDuties: "", estPackaging: "" });
    setShowNewParent(false);
  }

  const parents = skus.filter((s) => s.parentId === null);
  const totalUnits = skus.filter((s) => s.parentId !== null).reduce((sum, s) => sum + s.unitsInInventory, 0);
  const totalSamples = skus.filter((s) => s.parentId !== null).reduce((sum, s) => sum + s.samplesInInventory, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SKUs</h1>
          <p className="text-[#888] text-sm mt-1">Product cost and inventory tracking</p>
        </div>
        <button
          onClick={() => setShowNewParent(!showNewParent)}
          className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors"
        >
          <Plus size={16} /> Add SKU
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Units in Inventory</p>
          <p className="text-3xl font-bold text-white">{totalUnits.toLocaleString()}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Samples in Inventory</p>
          <p className="text-3xl font-bold text-white">{totalSamples.toLocaleString()}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Active SKUs</p>
          <p className="text-3xl font-bold text-white">{parents.length}</p>
        </div>
      </div>

      {/* Add parent form */}
      {showNewParent && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">New SKU</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="col-span-2">
              <label className="text-xs text-[#888] mb-1 block">Product Name</label>
              <input className="input w-full" placeholder="9 Pocket Binder" value={parentForm.name} onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })} />
            </div>
            {[["unitPrice", "Unit Price ($)"], ["estShipping", "Est. Shipping ($)"], ["estDuties", "Est. Duties ($)"], ["estPackaging", "Est. Packaging ($)"]].map(([key, label]) => (
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

      {/* SKU cards */}
      <div className="space-y-4">
        {parents.map((parent) => {
          const children = skus.filter((s) => s.parentId === parent.id);
          const isEditingParent = editingId === parent.id;
          const landedCost = landed(isEditingParent ? { ...parent, ...draft } as SKU : parent);

          return (
            <div key={parent.id} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
              {/* Parent header */}
              <div className="px-5 py-4 border-b border-[#222] flex items-center gap-4 flex-wrap">
                <p className="text-white font-semibold text-sm w-40 shrink-0">{parent.name}</p>

                {isEditingParent ? (
                  <>
                    {[
                      ["unitPrice", "Unit Price"],
                      ["estShipping", "Est. Shipping"],
                      ["estDuties", "Est. Duties"],
                      ["estPackaging", "Est. Packaging"],
                    ].map(([field, label]) => (
                      <div key={field} className="flex flex-col gap-0.5">
                        <label className="text-[10px] text-[#555]">{label}</label>
                        <input
                          type="number"
                          className="input w-24"
                          value={(draft as Record<string, number | string>)[field] ?? 0}
                          onChange={(e) => setDraft({ ...draft, [field]: +e.target.value })}
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 ml-auto">
                      <button onClick={commitEdit} className="text-green-400 hover:text-green-300"><Check size={15} /></button>
                      <button onClick={cancelEdit} className="text-[#555] hover:text-white"><X size={15} /></button>
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      ["Unit Price", fmt(parent.unitPrice)],
                      ["Est. Shipping", fmt(parent.estShipping)],
                      ["Est. Duties", fmt(parent.estDuties)],
                      ["Est. Packaging", fmt(parent.estPackaging)],
                    ].map(([label, val]) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-[#555]">{label}</span>
                        <span className="text-sm text-[#888]">{val}</span>
                      </div>
                    ))}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-[#555]">Landed</span>
                      <span className="text-sm text-white font-medium">{fmt(landedCost)}</span>
                    </div>
                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => startEdit(parent)} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button>
                      <button onClick={() => removeSku(parent.id)} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </>
                )}
              </div>

              {/* Children */}
              {children.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#444] text-xs uppercase tracking-wider border-b border-[#1a1a1a]">
                      <th className="text-left px-5 py-2 pl-10">Colorway</th>
                      <th className="text-left px-5 py-2">Units in Inventory</th>
                      <th className="text-left px-5 py-2">Samples</th>
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
                              <span className="text-white text-sm">{child.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {isEditingChild ? (
                              <input type="number" className="input w-20" value={draft.unitsInInventory ?? 0} onChange={(e) => setDraft({ ...draft, unitsInInventory: +e.target.value })} />
                            ) : (
                              <span className="text-[#888]">{child.unitsInInventory}</span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            {isEditingChild ? (
                              <input type="number" className="input w-20" value={draft.samplesInInventory ?? 0} onChange={(e) => setDraft({ ...draft, samplesInInventory: +e.target.value })} />
                            ) : (
                              <span className="text-[#888]">{child.samplesInInventory}</span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2 justify-end">
                              {isEditingChild ? (
                                <>
                                  <button onClick={commitEdit} className="text-green-400 hover:text-green-300"><Check size={13} /></button>
                                  <button onClick={cancelEdit} className="text-[#555] hover:text-white"><X size={13} /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => startEdit(child)} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button>
                                  <button onClick={() => removeSku(child.id)} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Add colorway */}
              {addingColorTo === parent.id ? (
                <div className="px-5 py-3 pl-10 flex items-center gap-2 border-t border-[#1a1a1a]">
                  <input
                    className="input w-32"
                    placeholder="Color name"
                    autoFocus
                    value={colorForm.name}
                    onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && addColorway(parent.id)}
                  />
                  <input
                    className="input w-24"
                    placeholder="Hex (opt)"
                    value={colorForm.colorHex}
                    onChange={(e) => setColorForm({ ...colorForm, colorHex: e.target.value })}
                  />
                  {colorForm.colorHex && (
                    <div className="w-4 h-4 rounded-full border border-[#444]" style={{ background: colorForm.colorHex }} />
                  )}
                  <button onClick={() => addColorway(parent.id)} className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-medium hover:bg-[#e0e0e0]">Add</button>
                  <button onClick={() => { setAddingColorTo(null); setColorForm({ name: "", colorHex: "" }); }} className="text-[#555] hover:text-white"><X size={14} /></button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingColorTo(parent.id)}
                  className="w-full text-left px-5 py-2.5 pl-10 text-xs text-[#444] hover:text-[#888] transition-colors border-t border-[#1a1a1a] flex items-center gap-1.5"
                >
                  <Plus size={12} /> Add colorway
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
