"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, GripVertical, X, ChevronDown, ChevronRight } from "lucide-react";

type SKU = { id: string; parentId: string | null; name: string; retailPrice: number };

type WebsiteProduct = {
  skuId: string;
  order: number;
  headline: string;
  subhead: string;
  bullets: string[];
  notes: string;
};

type OtherNote = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

type WebsiteData = {
  products: WebsiteProduct[];
  others: OtherNote[];
};

const EMPTY: WebsiteData = { products: [], others: [] };

function load(): WebsiteData {
  try {
    const raw = localStorage.getItem("pb_website");
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch { return EMPTY; }
}

function persist(data: WebsiteData) {
  localStorage.setItem("pb_website", JSON.stringify(data));
}

// ── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const [data, setData] = useState<WebsiteData>(EMPTY);
  const [allSkus, setAllSkus] = useState<SKU[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  useEffect(() => {
    setData(load());
    const raw = localStorage.getItem("pb_skus");
    if (raw) {
      const parsed: SKU[] = JSON.parse(raw);
      setAllSkus(parsed.filter((s) => !s.parentId));
    } else {
      // defaults
      setAllSkus([
        { id: "9pb", parentId: null, name: "9 Pocket Binder", retailPrice: 60 },
        { id: "12pb", parentId: null, name: "12 Pocket Binder", retailPrice: 70 },
        { id: "cb", parentId: null, name: "Card Box", retailPrice: 35 },
        { id: "fm9pb", parentId: null, name: "FindMy 9PB", retailPrice: 80 },
        { id: "fmcb", parentId: null, name: "FindMy Card Box", retailPrice: 55 },
      ]);
    }
  }, []);

  function save(next: WebsiteData) { setData(next); persist(next); }

  function addProduct(sku: SKU) {
    if (data.products.find((p) => p.skuId === sku.id)) return;
    const next: WebsiteData = {
      ...data,
      products: [...data.products, { skuId: sku.id, order: data.products.length, headline: "", subhead: "", bullets: [""], notes: "" }],
    };
    save(next);
    setExpandedId(sku.id);
  }

  function removeProduct(skuId: string) {
    save({ ...data, products: data.products.filter((p) => p.skuId !== skuId).map((p, i) => ({ ...p, order: i })) });
    if (expandedId === skuId) setExpandedId(null);
  }

  function updateProduct(skuId: string, patch: Partial<WebsiteProduct>) {
    save({ ...data, products: data.products.map((p) => p.skuId === skuId ? { ...p, ...patch } : p) });
  }

  function updateBullet(skuId: string, idx: number, val: string) {
    const product = data.products.find((p) => p.skuId === skuId)!;
    const bullets = [...product.bullets];
    bullets[idx] = val;
    updateProduct(skuId, { bullets });
  }

  function addBullet(skuId: string) {
    const product = data.products.find((p) => p.skuId === skuId)!;
    updateProduct(skuId, { bullets: [...product.bullets, ""] });
  }

  function removeBullet(skuId: string, idx: number) {
    const product = data.products.find((p) => p.skuId === skuId)!;
    updateProduct(skuId, { bullets: product.bullets.filter((_, i) => i !== idx) });
  }

  function onDragStart(idx: number) { dragItem.current = idx; setDraggingIdx(idx); }
  function onDragEnter(idx: number) { dragOver.current = idx; setDragOverIdx(idx); }
  function onDragEnd() {
    if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) {
      setDraggingIdx(null); setDragOverIdx(null); return;
    }
    const sorted = [...data.products];
    const dragged = sorted.splice(dragItem.current, 1)[0];
    sorted.splice(dragOver.current, 0, dragged);
    save({ ...data, products: sorted.map((p, i) => ({ ...p, order: i })) });
    setDraggingIdx(null); setDragOverIdx(null);
    dragItem.current = null; dragOver.current = null;
  }

  const added = [...data.products].sort((a, b) => a.order - b.order);
  const available = allSkus.filter((s) => !data.products.find((p) => p.skuId === s.id));

  return (
    <div className="grid grid-cols-[220px_1fr] gap-6">
      {/* Left: SKU picker */}
      <div className="space-y-2">
        <p className="text-xs text-[#555] uppercase tracking-wider mb-3">Available SKUs</p>
        {available.length === 0 ? (
          <p className="text-xs text-[#444] italic">All SKUs added.</p>
        ) : available.map((sku) => (
          <button
            key={sku.id}
            onClick={() => addProduct(sku)}
            className="w-full flex items-center justify-between text-left px-3 py-2 bg-[#111] border border-[#222] rounded-lg hover:border-[#444] transition-colors group"
          >
            <span className="text-sm text-white">{sku.name}</span>
            <Plus size={13} className="text-[#444] group-hover:text-[#888]" />
          </button>
        ))}
      </div>

      {/* Right: Added products */}
      <div className="space-y-3">
        {added.length === 0 ? (
          <div className="bg-[#111] border border-[#222] rounded-xl text-center py-16 text-[#555] text-sm">
            Select a SKU from the left to start building your product page copy.
          </div>
        ) : added.map((product, idx) => {
          const sku = allSkus.find((s) => s.id === product.skuId);
          const isExpanded = expandedId === product.skuId;
          const isDragging = draggingIdx === idx;
          const isOver = dragOverIdx === idx;

          return (
            <div
              key={product.skuId}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragEnter={() => onDragEnter(idx)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`bg-[#111] border rounded-xl transition-all ${isOver && !isDragging ? "border-white" : "border-[#222]"} ${isDragging ? "opacity-40" : ""}`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <GripVertical size={14} className="text-[#333] cursor-grab shrink-0" />
                <button
                  onClick={() => setExpandedId(isExpanded ? null : product.skuId)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  {isExpanded ? <ChevronDown size={13} className="text-[#555]" /> : <ChevronRight size={13} className="text-[#555]" />}
                  <span className="text-white font-medium text-sm">{sku?.name ?? product.skuId}</span>
                  {sku?.retailPrice && <span className="text-[#555] text-xs">${sku.retailPrice}</span>}
                  {product.headline && <span className="text-[#444] text-xs truncate max-w-[200px] ml-2">— {product.headline}</span>}
                </button>
                <button onClick={() => removeProduct(product.skuId)} className="text-[#333] hover:text-red-500 transition-colors shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-[#1a1a1a] pt-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Headline</label>
                      <input
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#555] placeholder-[#444]"
                        placeholder="e.g. Built for the card you waited two years to pull."
                        value={product.headline}
                        onChange={(e) => updateProduct(product.skuId, { headline: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Subheadline</label>
                      <input
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#555] placeholder-[#444]"
                        placeholder="e.g. Premium 900D TPU-laminated shell. Side-loading pages. Security zipper."
                        value={product.subhead}
                        onChange={(e) => updateProduct(product.skuId, { subhead: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-2">Bullet Points</label>
                      <div className="space-y-1.5">
                        {product.bullets.map((b, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[#444] text-xs shrink-0">·</span>
                            <input
                              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#555] placeholder-[#444]"
                              placeholder="Feature or benefit..."
                              value={b}
                              onChange={(e) => updateBullet(product.skuId, i, e.target.value)}
                            />
                            {product.bullets.length > 1 && (
                              <button onClick={() => removeBullet(product.skuId, i)} className="text-[#333] hover:text-red-500 shrink-0">
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => addBullet(product.skuId)} className="flex items-center gap-1.5 text-xs text-[#444] hover:text-[#888] mt-1">
                          <Plus size={11} /> Add bullet
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Notes & Ideas</label>
                      <textarea
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#555] placeholder-[#444] resize-none"
                        rows={4}
                        placeholder="Rough copy, ideas, competitor comparisons, things to test..."
                        value={product.notes}
                        onChange={(e) => updateProduct(product.skuId, { notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Others Tab ────────────────────────────────────────────────────────────────

function OthersTab() {
  const [data, setData] = useState<WebsiteData>(EMPTY);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => { setData(load()); }, []);

  function save(next: WebsiteData) { setData(next); persist(next); }

  function addNote() {
    if (!newTitle.trim()) return;
    const note: OtherNote = { id: Date.now().toString(), title: newTitle.trim(), content: "", createdAt: new Date().toISOString() };
    const next = { ...data, others: [...data.others, note] };
    save(next);
    setNewTitle("");
    setShowNew(false);
    setExpandedId(note.id);
  }

  function updateNote(id: string, patch: Partial<OtherNote>) {
    save({ ...data, others: data.others.map((n) => n.id === id ? { ...n, ...patch } : n) });
  }

  function removeNote(id: string) {
    save({ ...data, others: data.others.filter((n) => n.id !== id) });
    if (expandedId === id) setExpandedId(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors"
        >
          <Plus size={14} /> New Note
        </button>
      </div>

      {showNew && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center gap-3">
          <input
            autoFocus
            className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#555] placeholder-[#444]"
            placeholder="Section title (e.g. About Page, FAQ, Brand Story, Homepage Hero...)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addNote(); if (e.key === "Escape") setShowNew(false); }}
          />
          <button onClick={addNote} className="bg-white text-black text-sm px-3 py-2 rounded-lg font-medium hover:bg-[#e0e0e0]">Add</button>
          <button onClick={() => setShowNew(false)} className="text-[#555] hover:text-white"><X size={14} /></button>
        </div>
      )}

      {data.others.length === 0 && !showNew ? (
        <div className="bg-[#111] border border-[#222] rounded-xl text-center py-16 text-[#555] text-sm">
          No notes yet. Add sections for your About page, FAQ, brand story, homepage copy, etc.
        </div>
      ) : data.others.map((note) => {
        const isExpanded = expandedId === note.id;
        return (
          <div key={note.id} className="bg-[#111] border border-[#222] rounded-xl">
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => setExpandedId(isExpanded ? null : note.id)} className="flex items-center gap-2 flex-1 text-left">
                {isExpanded ? <ChevronDown size={13} className="text-[#555]" /> : <ChevronRight size={13} className="text-[#555]" />}
                <span className="text-white font-medium text-sm">{note.title}</span>
                {note.content && <span className="text-[#444] text-xs ml-2 truncate max-w-[300px]">{note.content.slice(0, 60)}…</span>}
              </button>
              <span className="text-[#444] text-xs shrink-0">{new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              <button onClick={() => removeNote(note.id)} className="text-[#333] hover:text-red-500 transition-colors shrink-0"><Trash2 size={13} /></button>
            </div>
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-[#1a1a1a] pt-4">
                <textarea
                  autoFocus
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#555] placeholder-[#444] resize-none"
                  rows={8}
                  placeholder="Write copy, ideas, structure, rough drafts..."
                  value={note.content}
                  onChange={(e) => updateNote(note.id, { content: e.target.value })}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function WebsitePage() {
  const [tab, setTab] = useState<"products" | "others">("products");

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Website</h1>
          <p className="text-[#888] text-sm mt-1">Build and store copy, ideas, and structure for the PrimeBind site</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[#222]">
        {([{ key: "products", label: "Products" }, { key: "others", label: "Others" }] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === key ? "border-white text-white" : "border-transparent text-[#555] hover:text-[#888]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "products" && <ProductsTab />}
      {tab === "others" && <OthersTab />}
    </div>
  );
}
