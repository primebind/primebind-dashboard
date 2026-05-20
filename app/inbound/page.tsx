"use client";

import { useState, useEffect, Fragment } from "react";
import { Plus, X, ChevronDown, ChevronRight, Check } from "lucide-react";

type InboundStatus = "Pending" | "In Transit" | "Partial" | "Received" | "Cancelled";

type InboundLine = {
  id: string;
  description: string;
  poItemId: string;
  skuId: string;
  colorwayId: string;
  qtyOrdered: number;
  qtyReceived: number;
};

type Inbound = {
  id: string;
  poId: string;
  vendorName: string;
  carrier: string;
  trackingNumber: string;
  eta: string;
  status: InboundStatus;
  lines: InboundLine[];
  notes: string;
  createdAt: string;
};

type StoredSKU = {
  id: string;
  parentId: string | null;
  name: string;
  colorHex: string;
  unitsInInventory: number;
  samplesInInventory: number;
  unitPrice: number;
  estShipping: number;
  estDuties: number;
  estPackaging: number;
  retailPrice: number;
};

type StoredPO = {
  id: string;
  vendorId: string;
  vendorName: string;
  date: string;
  items: { id: string; description: string; qty: number; unitCost: number; account: string }[];
};

type StoredVendor = { id: string; name: string };

const STATUS_COLORS: Record<InboundStatus, string> = {
  "Pending":    "bg-[#1a1a1a] text-[#888]",
  "In Transit": "bg-blue-950 text-blue-400",
  "Partial":    "bg-yellow-950 text-yellow-400",
  "Received":   "bg-green-950 text-green-400",
  "Cancelled":  "bg-[#111] text-[#444]",
};

const STATUSES: InboundStatus[] = ["Pending", "In Transit", "Partial", "Received", "Cancelled"];
const CARRIERS = ["DHL", "FedEx", "UPS", "EMS", "SF Express", "USPS", "Other"];

function blankLine(): InboundLine {
  return { id: `${Date.now()}-${Math.random()}`, description: "", poItemId: "", skuId: "", colorwayId: "", qtyOrdered: 1, qtyReceived: 0 };
}

export default function InboundPage() {
  const [inbounds, setInbounds] = useState<Inbound[]>([]);
  const [pos, setPos] = useState<StoredPO[]>([]);
  const [vendors, setVendors] = useState<StoredVendor[]>([]);
  const [skus, setSkus] = useState<StoredSKU[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [receivingId, setReceivingId] = useState<string | null>(null);
  const [receiveDraft, setReceiveDraft] = useState<Record<string, number>>({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({
    poId: "",
    vendorName: "",
    carrier: "DHL",
    trackingNumber: "",
    eta: "",
    notes: "",
    lines: [blankLine()] as InboundLine[],
  });

  useEffect(() => {
    const raw = localStorage.getItem("pb_inbounds");
    if (raw) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setInbounds(JSON.parse(raw).map((i: any) => ({
        ...i,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lines: (i.lines || []).map((l: any) => ({
          ...l,
          poItemId: l.poItemId ?? "",
          skuId: l.skuId ?? "",
          colorwayId: l.colorwayId ?? "",
          qtyReceived: l.qtyReceived ?? 0,
        })),
      })));
    }
    const rawPos = localStorage.getItem("pb_pos");
    if (rawPos) setPos(JSON.parse(rawPos));
    const rawVendors = localStorage.getItem("pb_vendors");
    if (rawVendors) setVendors(JSON.parse(rawVendors));
    const rawSkus = localStorage.getItem("pb_skus");
    if (rawSkus) setSkus(JSON.parse(rawSkus));
  }, []);

  function saveInbounds(updated: Inbound[]) {
    setInbounds(updated);
    localStorage.setItem("pb_inbounds", JSON.stringify(updated));
  }

  function saveSkus(updated: StoredSKU[]) {
    setSkus(updated);
    localStorage.setItem("pb_skus", JSON.stringify(updated));
  }

  function onSelectPO(poId: string) {
    const po = pos.find((p) => p.id === poId);
    const vendor = po ? vendors.find((v) => v.id === po.vendorId) : null;
    setNewForm({ ...newForm, poId, vendorName: vendor?.name || po?.vendorName || newForm.vendorName });
  }

  function importFromPO() {
    const po = pos.find((p) => p.id === newForm.poId);
    if (!po) return;
    setNewForm({
      ...newForm,
      lines: po.items.map((item) => ({
        id: `${Date.now()}-${Math.random()}`,
        description: item.description,
        poItemId: item.id,
        skuId: "",
        colorwayId: "",
        qtyOrdered: item.qty,
        qtyReceived: 0,
      })),
    });
  }

  function updateNewLine(id: string, patch: Partial<InboundLine>) {
    setNewForm({
      ...newForm,
      lines: newForm.lines.map((l) =>
        l.id === id ? { ...l, ...patch, ...(patch.skuId !== undefined ? { colorwayId: "" } : {}) } : l
      ),
    });
  }

  function createInbound() {
    const lines = newForm.lines.filter((l) => l.description.trim() || l.skuId);
    if (!lines.length) return;
    const inbound: Inbound = {
      id: Date.now().toString(),
      poId: newForm.poId,
      vendorName: newForm.vendorName.trim() || "Unknown",
      carrier: newForm.carrier,
      trackingNumber: newForm.trackingNumber.trim(),
      eta: newForm.eta,
      status: "Pending",
      lines,
      notes: newForm.notes.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    saveInbounds([...inbounds, inbound]);
    setNewForm({ poId: "", vendorName: "", carrier: "DHL", trackingNumber: "", eta: "", notes: "", lines: [blankLine()] });
    setShowNew(false);
  }

  function startReceive(id: string) {
    const inbound = inbounds.find((i) => i.id === id);
    if (!inbound) return;
    const draft: Record<string, number> = {};
    inbound.lines.forEach((l) => { draft[l.id] = Math.max(0, l.qtyOrdered - l.qtyReceived); });
    setReceiveDraft(draft);
    setReceivingId(id);
    setExpandedId(id);
  }

  function confirmReceive(inboundId: string) {
    const inbound = inbounds.find((i) => i.id === inboundId);
    if (!inbound) return;

    let updatedSkus = [...skus];
    const updatedLines = inbound.lines.map((l) => {
      const adding = receiveDraft[l.id] || 0;
      if (adding > 0 && l.colorwayId) {
        updatedSkus = updatedSkus.map((s) =>
          s.id === l.colorwayId ? { ...s, unitsInInventory: s.unitsInInventory + adding } : s
        );
      }
      return { ...l, qtyReceived: l.qtyReceived + adding };
    });

    const totalOrdered = updatedLines.reduce((sum, l) => sum + l.qtyOrdered, 0);
    const totalReceived = updatedLines.reduce((sum, l) => sum + l.qtyReceived, 0);
    const newStatus: InboundStatus =
      totalReceived >= totalOrdered ? "Received" :
      totalReceived > 0 ? "Partial" : inbound.status;

    saveInbounds(inbounds.map((i) => i.id === inboundId ? { ...i, lines: updatedLines, status: newStatus } : i));
    saveSkus(updatedSkus);
    setReceivingId(null);
    setReceiveDraft({});
  }

  function updateStatus(id: string, status: InboundStatus) {
    saveInbounds(inbounds.map((i) => i.id === id ? { ...i, status } : i));
  }

  const parentSkus = skus.filter((s) => s.parentId === null);
  function childrenOf(skuId: string) { return skus.filter((s) => s.parentId === skuId); }
  function resolveVendorName(po: StoredPO) { return vendors.find((v) => v.id === po.vendorId)?.name || po.vendorName; }
  function skuName(id: string) { return skus.find((s) => s.id === id)?.name || ""; }
  function colorwayName(id: string) { return skus.find((s) => s.id === id)?.name || ""; }
  function colorwayHex(id: string) { return skus.find((s) => s.id === id)?.colorHex || ""; }

  const activeCount = inbounds.filter((i) => i.status === "Pending" || i.status === "In Transit").length;
  const inTransitCount = inbounds.filter((i) => i.status === "In Transit").length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbounds</h1>
          <p className="text-[#888] text-sm mt-1">{activeCount} active · {inTransitCount} in transit</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors">
          <Plus size={16} /> New Shipment
        </button>
      </div>

      {/* New shipment form */}
      {showNew && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">New Inbound Shipment</h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs text-[#888] mb-1 block">Link to PO (optional)</label>
              <select className="input w-full" value={newForm.poId} onChange={(e) => onSelectPO(e.target.value)}>
                <option value="">— None —</option>
                {pos.map((po) => <option key={po.id} value={po.id}>{resolveVendorName(po)} — {po.date}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Vendor / Shipper</label>
              <input className="input w-full" placeholder="Shanghai Dijin" value={newForm.vendorName} onChange={(e) => setNewForm({ ...newForm, vendorName: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Carrier</label>
              <select className="input w-full" value={newForm.carrier} onChange={(e) => setNewForm({ ...newForm, carrier: e.target.value })}>
                {CARRIERS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Tracking #</label>
              <input className="input w-full" placeholder="Tracking number" value={newForm.trackingNumber} onChange={(e) => setNewForm({ ...newForm, trackingNumber: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Expected Arrival</label>
              <input type="date" className="input w-full" value={newForm.eta} onChange={(e) => setNewForm({ ...newForm, eta: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Notes</label>
              <input className="input w-full" placeholder="Batch 2 final samples" value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#555] uppercase tracking-wider">Items</p>
              {newForm.poId && (
                <button onClick={importFromPO} className="text-xs text-[#555] hover:text-white transition-colors">↓ Import from PO</button>
              )}
            </div>
            <div className="space-y-2">
              <div className="hidden sm:grid text-[10px] text-[#444] uppercase tracking-wider mb-1" style={{ gridTemplateColumns: "1fr 8rem 8rem 4.5rem 1.5rem" }}>
                <span className="pl-1">Description</span><span>SKU</span><span>Colorway</span><span className="text-center">Qty</span><span />
              </div>
              {newForm.lines.map((line) => {
                const children = line.skuId ? childrenOf(line.skuId) : [];
                return (
                  <div key={line.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 8rem 8rem 4.5rem 1.5rem" }}>
                    <input className="input" placeholder="e.g. 9PB Obsidian final" value={line.description} onChange={(e) => updateNewLine(line.id, { description: e.target.value })} />
                    <select className="input text-xs" value={line.skuId} onChange={(e) => updateNewLine(line.id, { skuId: e.target.value })}>
                      <option value="">— SKU —</option>
                      {parentSkus.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select className="input text-xs" value={line.colorwayId} onChange={(e) => updateNewLine(line.id, { colorwayId: e.target.value })} disabled={!line.skuId || children.length === 0}>
                      <option value="">— Color —</option>
                      {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="number" className="input text-center" min={1} value={line.qtyOrdered} onChange={(e) => updateNewLine(line.id, { qtyOrdered: +e.target.value })} />
                    {newForm.lines.length > 1
                      ? <button onClick={() => setNewForm({ ...newForm, lines: newForm.lines.filter((l) => l.id !== line.id) })} className="text-[#444] hover:text-red-500"><X size={13} /></button>
                      : <span />}
                  </div>
                );
              })}
              <button onClick={() => setNewForm({ ...newForm, lines: [...newForm.lines, blankLine()] })} className="flex items-center gap-1.5 text-xs text-[#444] hover:text-[#888] mt-1">
                <Plus size={11} /> Add item
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={createInbound} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0]">Create Shipment</button>
            <button onClick={() => setShowNew(false)} className="text-[#888] text-sm px-4 py-2 hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      {/* Inbound list */}
      {inbounds.length === 0 && !showNew ? (
        <div className="bg-[#111] border border-[#222] rounded-xl text-center py-16 text-[#555] text-sm">No inbound shipments yet.</div>
      ) : inbounds.length > 0 && (
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                {["Vendor", "Carrier", "Tracking #", "ETA", "Status", "Items", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inbounds.map((inbound) => {
                const isExpanded = expandedId === inbound.id;
                const isReceiving = receivingId === inbound.id;
                const canReceive = inbound.status !== "Received" && inbound.status !== "Cancelled";

                return (
                  <Fragment key={inbound.id}>
                    <tr className="border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-white font-medium">{inbound.vendorName}</p>
                        {inbound.poId && <p className="text-[#444] text-xs">PO linked</p>}
                      </td>
                      <td className="px-5 py-4 text-[#888] text-xs">{inbound.carrier}</td>
                      <td className="px-5 py-4">
                        {inbound.trackingNumber
                          ? <span className="font-mono text-xs text-[#888]">{inbound.trackingNumber}</span>
                          : <span className="text-[#333]">—</span>}
                      </td>
                      <td className="px-5 py-4 text-[#888] text-xs">{inbound.eta || "—"}</td>
                      <td className="px-5 py-4">
                        <select
                          value={inbound.status}
                          onChange={(e) => updateStatus(inbound.id, e.target.value as InboundStatus)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[inbound.status]}`}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => setExpandedId(isExpanded && !isReceiving ? null : inbound.id)} className="flex items-center gap-1 text-xs text-[#555] hover:text-white transition-colors">
                          {inbound.lines.length} {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {canReceive && (
                            <button
                              onClick={() => isReceiving ? setReceivingId(null) : startReceive(inbound.id)}
                              className="text-xs text-[#555] hover:text-green-400 transition-colors font-medium"
                            >
                              Receive
                            </button>
                          )}
                          <button onClick={() => saveInbounds(inbounds.filter((i) => i.id !== inbound.id))} className="text-[#444] hover:text-red-500 transition-colors">
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Receive panel */}
                    {isReceiving && (
                      <tr className="border-b border-[#1a1a1a]">
                        <td colSpan={7} className="px-10 py-5 bg-[#0a0a0a]">
                          <div className="space-y-4 max-w-2xl">
                            <p className="text-xs text-[#555] uppercase tracking-wider font-semibold">Mark items received</p>
                            <div className="space-y-3">
                              {inbound.lines.map((line) => {
                                const remaining = Math.max(0, line.qtyOrdered - line.qtyReceived);
                                const hex = colorwayHex(line.colorwayId);
                                const label = line.description || `${skuName(line.skuId)} ${colorwayName(line.colorwayId)}`.trim();
                                return (
                                  <div key={line.id} className="flex items-center gap-4">
                                    <div className="flex flex-1 items-center gap-2 min-w-0">
                                      {hex && <div className="w-3 h-3 rounded-full border border-[#444] shrink-0" style={{ background: hex }} />}
                                      <span className="text-sm text-white truncate">{label}</span>
                                    </div>
                                    <span className="text-xs text-[#555] shrink-0">{line.qtyReceived}/{line.qtyOrdered} so far</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-xs text-[#555]">+ Receiving</span>
                                      <input
                                        type="number"
                                        className="input w-16 text-center"
                                        min={0}
                                        max={remaining}
                                        value={receiveDraft[line.id] ?? remaining}
                                        onChange={(e) => setReceiveDraft({ ...receiveDraft, [line.id]: Math.min(Math.max(0, +e.target.value), remaining) })}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex gap-3 pt-2 border-t border-[#1a1a1a]">
                              <button onClick={() => confirmReceive(inbound.id)} className="flex items-center gap-1.5 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0]">
                                <Check size={14} /> Confirm Receipt
                              </button>
                              <button onClick={() => setReceivingId(null)} className="text-[#888] text-sm px-4 py-2 hover:text-white">Cancel</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Line item detail */}
                    {isExpanded && !isReceiving && (
                      <tr className="border-b border-[#1a1a1a]">
                        <td colSpan={7} className="px-10 py-4 bg-[#0d0d0d]">
                          <div className="space-y-2">
                            {inbound.lines.map((line) => {
                              const hex = colorwayHex(line.colorwayId);
                              const label = line.description || `${skuName(line.skuId)} ${colorwayName(line.colorwayId)}`.trim();
                              const outstanding = line.qtyOrdered - line.qtyReceived;
                              return (
                                <div key={line.id} className="flex items-center gap-6 text-xs">
                                  <div className="flex flex-1 items-center gap-2 min-w-0">
                                    {hex && <div className="w-3 h-3 rounded-full border border-[#444] shrink-0" style={{ background: hex }} />}
                                    <span className="text-white truncate">{label}</span>
                                  </div>
                                  <span className="text-[#555] shrink-0">Ordered: <span className="text-white">{line.qtyOrdered}</span></span>
                                  <span className={`shrink-0 ${line.qtyReceived > 0 ? "text-green-400" : "text-[#555]"}`}>
                                    Received: {line.qtyReceived}
                                  </span>
                                  {outstanding > 0 && (
                                    <span className="text-yellow-500 shrink-0">Outstanding: {outstanding}</span>
                                  )}
                                </div>
                              );
                            })}
                            {inbound.notes && (
                              <p className="text-[#444] text-xs mt-2 pt-2 border-t border-[#1a1a1a]">{inbound.notes}</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
