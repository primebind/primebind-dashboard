"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X, ChevronDown, ChevronRight } from "lucide-react";

type POStatus = "Open" | "Partial" | "Paid" | "Cancelled";

type POItem = { id: string; description: string; qty: number; unitCost: number };

type PurchaseOrder = {
  id: string;
  vendor: string;
  date: string;
  status: POStatus;
  items: POItem[];
  notes: string;
  amountPaid: number;
};

const STATUS_COLORS: Record<POStatus, string> = {
  Open: "bg-blue-950 text-blue-400",
  Partial: "bg-yellow-950 text-yellow-400",
  Paid: "bg-green-950 text-green-400",
  Cancelled: "bg-[#222] text-[#555]",
};

const STATUSES: POStatus[] = ["Open", "Partial", "Paid", "Cancelled"];

function poNumber(index: number) {
  return `PO-${String(index + 1).padStart(3, "0")}`;
}

function fmt(n: number) {
  return `$${n % 1 === 0 ? n.toLocaleString() : n.toFixed(2)}`;
}

function calcTotal(items: POItem[]) {
  return items.reduce((sum, i) => sum + i.qty * i.unitCost, 0);
}

function blankItem(): POItem {
  return { id: Date.now().toString(), description: "", qty: 1, unitCost: 0 };
}

export default function PurchaseOrders() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PurchaseOrder | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<{ vendor: string; date: string; notes: string; items: POItem[] }>({
    vendor: "", date: new Date().toISOString().slice(0, 10), notes: "", items: [blankItem()],
  });
  const [logPayId, setLogPayId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("pb_pos");
    if (saved) setPos(JSON.parse(saved));
  }, []);

  function save(updated: PurchaseOrder[]) {
    setPos(updated);
    localStorage.setItem("pb_pos", JSON.stringify(updated));
  }

  function createPO() {
    if (!newForm.vendor.trim() || newForm.items.every((i) => !i.description.trim())) return;
    const po: PurchaseOrder = {
      id: Date.now().toString(),
      vendor: newForm.vendor.trim(),
      date: newForm.date,
      status: "Open",
      items: newForm.items.filter((i) => i.description.trim()),
      notes: newForm.notes.trim(),
      amountPaid: 0,
    };
    save([...pos, po]);
    setNewForm({ vendor: "", date: new Date().toISOString().slice(0, 10), notes: "", items: [blankItem()] });
    setShowNew(false);
  }

  function startEdit(po: PurchaseOrder) {
    setEditingId(po.id);
    setDraft({ ...po, items: po.items.map((i) => ({ ...i })) });
  }

  function commitEdit() {
    if (!editingId || !draft) return;
    save(pos.map((p) => p.id === editingId ? draft : p));
    setEditingId(null);
    setDraft(null);
  }

  function logPayment(id: string) {
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return;
    save(pos.map((p) => {
      if (p.id !== id) return p;
      const newPaid = p.amountPaid + amount;
      const total = calcTotal(p.items);
      const status: POStatus = newPaid >= total ? "Paid" : "Partial";
      return { ...p, amountPaid: newPaid, status };
    }));
    setLogPayId(null);
    setPayAmount("");
  }

  const totalOwed = pos.filter((p) => p.status !== "Cancelled").reduce((sum, p) => sum + calcTotal(p.items) - p.amountPaid, 0);
  const openCount = pos.filter((p) => p.status === "Open" || p.status === "Partial").length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Purchase Orders</h1>
          <p className="text-[#888] text-sm mt-1">{openCount} open · {fmt(totalOwed)} outstanding</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors">
          <Plus size={16} /> New PO
        </button>
      </div>

      {/* New PO form */}
      {showNew && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">New Purchase Order</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-[#888] mb-1 block">Vendor</label>
              <input className="input w-full" placeholder="Dylan" autoFocus value={newForm.vendor} onChange={(e) => setNewForm({ ...newForm, vendor: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Date</label>
              <input type="date" className="input w-full" value={newForm.date} onChange={(e) => setNewForm({ ...newForm, date: e.target.value })} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-[#888] mb-1 block">Notes</label>
              <input className="input w-full" placeholder="Batch 2 sample order" value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <p className="text-xs text-[#888] uppercase tracking-wider mb-2">Line Items</p>
            <div className="space-y-2">
              {newForm.items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <input className="input flex-1" placeholder="Description (e.g. 9 Pocket Binder samples)" value={item.description} onChange={(e) => setNewForm({ ...newForm, items: newForm.items.map((i, j) => j === idx ? { ...i, description: e.target.value } : i) })} />
                  <input type="number" className="input w-16 text-center" min={1} placeholder="Qty" value={item.qty} onChange={(e) => setNewForm({ ...newForm, items: newForm.items.map((i, j) => j === idx ? { ...i, qty: +e.target.value } : i) })} />
                  <input type="number" className="input w-24" placeholder="Unit cost" value={item.unitCost || ""} onChange={(e) => setNewForm({ ...newForm, items: newForm.items.map((i, j) => j === idx ? { ...i, unitCost: +e.target.value } : i) })} />
                  <span className="text-xs text-[#555] w-16 text-right shrink-0">{fmt(item.qty * item.unitCost)}</span>
                  {newForm.items.length > 1 && (
                    <button onClick={() => setNewForm({ ...newForm, items: newForm.items.filter((_, j) => j !== idx) })} className="text-[#444] hover:text-red-500"><X size={13} /></button>
                  )}
                </div>
              ))}
              <button onClick={() => setNewForm({ ...newForm, items: [...newForm.items, blankItem()] })} className="flex items-center gap-1.5 text-xs text-[#444] hover:text-[#888] transition-colors mt-1">
                <Plus size={11} /> Add line item
              </button>
            </div>
            <div className="flex justify-end mt-3 border-t border-[#222] pt-3">
              <span className="text-sm text-[#888] mr-3">Total</span>
              <span className="text-white font-semibold">{fmt(calcTotal(newForm.items))}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={createPO} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0]">Create PO</button>
            <button onClick={() => setShowNew(false)} className="text-[#888] text-sm px-4 py-2 hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      {/* PO list */}
      {pos.length === 0 && !showNew ? (
        <div className="bg-[#111] border border-[#222] rounded-xl text-center py-16 text-[#555] text-sm">No purchase orders yet. Create your first above.</div>
      ) : pos.length > 0 && (
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">PO #</th>
                <th className="text-left px-5 py-3">Vendor</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Total</th>
                <th className="text-left px-5 py-3">Paid</th>
                <th className="text-left px-5 py-3">Balance</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Items</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {pos.map((po, idx) => {
                const total = calcTotal(po.items);
                const balance = total - po.amountPaid;
                const isExpanded = expandedId === po.id;
                const isEditing = editingId === po.id;
                const d = isEditing && draft ? draft : po;

                return (
                  <>
                    <tr key={po.id} className="border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors">
                      <td className="px-5 py-4 text-[#555] font-mono text-xs">{poNumber(idx)}</td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <input className="input w-28" value={draft!.vendor} onChange={(e) => setDraft({ ...draft!, vendor: e.target.value })} />
                        ) : (
                          <span className="text-white font-medium">{po.vendor}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[#888]">
                        {isEditing ? (
                          <input type="date" className="input w-32" value={draft!.date} onChange={(e) => setDraft({ ...draft!, date: e.target.value })} />
                        ) : po.date}
                      </td>
                      <td className="px-5 py-4 text-white font-medium">{fmt(total)}</td>
                      <td className="px-5 py-4 text-[#888]">{po.amountPaid > 0 ? fmt(po.amountPaid) : "—"}</td>
                      <td className="px-5 py-4">
                        <span className={balance > 0 && po.status !== "Cancelled" ? "text-red-400 font-medium" : "text-[#555]"}>
                          {po.status === "Cancelled" ? "—" : balance > 0 ? fmt(balance) : "Settled"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <select className="input text-xs" value={draft!.status} onChange={(e) => setDraft({ ...draft!, status: e.target.value as POStatus })}>
                            {STATUSES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[po.status]}`}>{po.status}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => setExpandedId(isExpanded ? null : po.id)} className="flex items-center gap-1 text-xs text-[#555] hover:text-white transition-colors">
                          {po.items.length} {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2 items-center">
                          {isEditing ? (
                            <>
                              <button onClick={commitEdit} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
                              <button onClick={() => { setEditingId(null); setDraft(null); }} className="text-[#555] hover:text-white"><X size={14} /></button>
                            </>
                          ) : (
                            <>
                              {po.status !== "Paid" && po.status !== "Cancelled" && (
                                <button onClick={() => { setLogPayId(po.id); setPayAmount(""); }} className="text-xs text-[#555] hover:text-green-400 transition-colors font-medium">+ Pay</button>
                              )}
                              <button onClick={() => startEdit(po)} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button>
                              <button onClick={() => save(pos.filter((p) => p.id !== po.id))} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Log payment row */}
                    {logPayId === po.id && (
                      <tr className="border-b border-[#1a1a1a] bg-[#0d0d0d]">
                        <td colSpan={9} className="px-10 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-[#555]">Log payment</span>
                            <input type="number" className="input w-28" autoFocus placeholder="Amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} onKeyDown={(e) => e.key === "Enter" && logPayment(po.id)} />
                            <button onClick={() => logPayment(po.id)} className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-medium hover:bg-[#e0e0e0]">Confirm</button>
                            <button onClick={() => setLogPayId(null)} className="text-[#555] hover:text-white"><X size={13} /></button>
                            <span className="text-xs text-[#555] ml-auto">Balance: {fmt(balance)}</span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Line items expanded */}
                    {isExpanded && (
                      <tr className="border-b border-[#1a1a1a]">
                        <td colSpan={9} className="px-10 py-3 bg-[#0d0d0d]">
                          <div className="space-y-1.5">
                            {(isEditing ? draft!.items : po.items).map((item, iIdx) => (
                              <div key={item.id} className="flex items-center gap-3 text-xs">
                                {isEditing ? (
                                  <>
                                    <input className="input flex-1" value={item.description} onChange={(e) => setDraft({ ...draft!, items: draft!.items.map((i, j) => j === iIdx ? { ...i, description: e.target.value } : i) })} />
                                    <input type="number" className="input w-14 text-center" value={item.qty} onChange={(e) => setDraft({ ...draft!, items: draft!.items.map((i, j) => j === iIdx ? { ...i, qty: +e.target.value } : i) })} />
                                    <input type="number" className="input w-24" value={item.unitCost} onChange={(e) => setDraft({ ...draft!, items: draft!.items.map((i, j) => j === iIdx ? { ...i, unitCost: +e.target.value } : i) })} />
                                    <span className="text-[#555] w-16 text-right">{fmt(item.qty * item.unitCost)}</span>
                                    <button onClick={() => setDraft({ ...draft!, items: draft!.items.filter((_, j) => j !== iIdx) })} className="text-[#444] hover:text-red-500"><X size={11} /></button>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-white flex-1">{item.description}</span>
                                    <span className="text-[#555]">{item.qty}×</span>
                                    <span className="text-[#888]">{fmt(item.unitCost)}</span>
                                    <span className="text-white font-medium w-16 text-right">{fmt(item.qty * item.unitCost)}</span>
                                  </>
                                )}
                              </div>
                            ))}
                            {isEditing && (
                              <button onClick={() => setDraft({ ...draft!, items: [...draft!.items, blankItem()] })} className="flex items-center gap-1 text-xs text-[#444] hover:text-[#888] mt-1">
                                <Plus size={11} /> Add line
                              </button>
                            )}
                            {po.notes && !isEditing && (
                              <p className="text-[#444] text-xs mt-2 pt-2 border-t border-[#1a1a1a]">{po.notes}</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
