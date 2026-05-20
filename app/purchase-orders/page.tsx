"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Pencil, Check, X, ChevronDown, ChevronRight, Upload } from "lucide-react";

type POStatus = "Open" | "Partial" | "Paid" | "Cancelled";
type POItem = { id: string; description: string; qty: number; unitCost: number; account: string };
type Payment = { id: string; date: string; amount: number; method: "Manual" | "CSV Match"; bankRef: string; finTxnIds?: string[] };
type PurchaseOrder = {
  id: string;
  vendorId: string;
  vendorName: string; // fallback display for migrated records
  date: string;
  status: POStatus;
  items: POItem[];
  notes: string;
  payments: Payment[];
};
type Vendor = {
  id: string; name: string; contact: string; email: string; phone: string; notes: string;
  swift: string; bankAccountNumber: string; bankAccountName: string;
  bankName: string; bankAddress: string; beneficiaryAddress: string;
};
type CsvRow = { date: string; description: string; amount: number; raw: string };

const STATUS_COLORS: Record<POStatus, string> = {
  Open: "bg-blue-950 text-blue-400",
  Partial: "bg-yellow-950 text-yellow-400",
  Paid: "bg-green-950 text-green-400",
  Cancelled: "bg-[#222] text-[#555]",
};
const STATUSES: POStatus[] = ["Open", "Partial", "Paid", "Cancelled"];

function poNumber(index: number) { return `PO-${String(index + 1).padStart(3, "0")}`; }
function fmt(n: number) { return `$${n % 1 === 0 ? n.toLocaleString() : n.toFixed(2)}`; }
function calcTotal(items: POItem[]) { return items.reduce((sum, i) => sum + i.qty * i.unitCost, 0); }
function calcPaid(payments: Payment[]) { return payments.reduce((sum, p) => sum + p.amount, 0); }
function blankItem(): POItem { return { id: Date.now().toString(), description: "", qty: 1, unitCost: 0, account: "" }; }

function parseCSV(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/['"]/g, "").toLowerCase());
  const col = (names: string[]) => headers.findIndex((h) => names.some((n) => h.includes(n)));
  const dateCol = col(["date"]);
  const amtCol = col(["amount", "debit", "credit"]);
  const descCol = col(["name", "description", "memo", "payee", "transaction"]);
  return lines.slice(1).flatMap((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const raw = parseFloat((cols[amtCol] || "0").replace(/[$,()]/g, ""));
    if (isNaN(raw) || raw === 0) return [];
    return [{ date: cols[dateCol] || "", description: cols[descCol] || "", amount: Math.abs(raw), raw: line }];
  });
}

export default function PurchaseOrders() {
  const [tab, setTab] = useState<"orders" | "vendors">("orders");
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PurchaseOrder | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<{ vendorId: string; date: string; notes: string; items: POItem[] }>({
    vendorId: "", date: new Date().toISOString().slice(0, 10), notes: "", items: [blankItem()],
  });

  // Payment state
  const [payPoId, setPayPoId] = useState<string | null>(null);
  const [payTab, setPayTab] = useState<"manual" | "csv">("manual");
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payFromBank, setPayFromBank] = useState("US Bank");
  const [payFeeAmount, setPayFeeAmount] = useState("");
  const [payFeeAccount, setPayFeeAccount] = useState("71401");
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvMatches, setCsvMatches] = useState<CsvRow[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const BANK_ACCOUNTS = ["US Bank", "Wise", "Other"];

  // Vendor edit state
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [vendorDraft, setVendorDraft] = useState<Vendor>({ id: "", name: "", contact: "", email: "", phone: "", notes: "", swift: "", bankAccountNumber: "", bankAccountName: "", bankName: "", bankAddress: "", beneficiaryAddress: "" });
  const [showNewVendor, setShowNewVendor] = useState(false);
  const [vendorForm, setVendorForm] = useState({ name: "", contact: "", email: "", phone: "", notes: "", swift: "", bankAccountNumber: "", bankAccountName: "", bankName: "", bankAddress: "", beneficiaryAddress: "" });
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);

  useEffect(() => {
    const savedPos = localStorage.getItem("pb_pos");
    if (savedPos) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPos(JSON.parse(savedPos).map((p: any) => ({
        ...p,
        vendorId: p.vendorId || "",
        vendorName: p.vendorName || p.vendor || "",
        payments: p.payments || (p.amountPaid > 0 ? [{ id: "migrated", date: p.date, amount: p.amountPaid, method: "Manual", bankRef: "" }] : []),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: (p.items || []).map((i: any) => ({ ...i, account: i.account ?? "" })),
      })));
    }
    const savedVendors = localStorage.getItem("pb_vendors");
    if (savedVendors) {
      const BLANK_BANKING = { swift: "", bankAccountNumber: "", bankAccountName: "", bankName: "", bankAddress: "", beneficiaryAddress: "" };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setVendors(JSON.parse(savedVendors).map((v: any) => ({ ...BLANK_BANKING, ...v })));
    }
  }, []);

  function savePos(updated: PurchaseOrder[]) { setPos(updated); localStorage.setItem("pb_pos", JSON.stringify(updated)); }
  function saveVendors(updated: Vendor[]) { setVendors(updated); localStorage.setItem("pb_vendors", JSON.stringify(updated)); }

  // Maps plain-text account names (used in PO line items) to chart-of-accounts numbers
  const ACCOUNT_MAP: Record<string, string> = {
    "product design": "73500",
    "contractor": "72911", "contractors": "72911",
    "inventory purchases": "72400",
    "meals & entertainment": "72700", "meals": "72700",
    "travel - transportation": "74600", "travel": "74600",
    "freight & shipping": "74101", "shipping": "74101",
    "entertainment": "72700",
    "gifts": "74300",
    "finance charge": "71401",
    "bank charges & fees": "71400",
  };
  function resolveAccount(text: string): string {
    return ACCOUNT_MAP[text.toLowerCase().trim()] || text;
  }

  // Creates ONE compound transaction in Financials — total matches the bank charge,
  // lines hold the per-account breakdown so the CSV $927.70 can match the parent.
  function postToFinancials(
    main: { date: string; description: string; bank: string },
    lines: { description: string; amount: number; account: string }[]
  ): string[] {
    const existing = JSON.parse(localStorage.getItem("pb_financials") || "[]");
    const id = `po-${Date.now()}-${Math.random()}`;
    const total = lines.reduce((sum, l) => sum + l.amount, 0);
    const entry = { id, date: main.date, description: main.description, amount: total, account: "", bank: main.bank, lines };
    localStorage.setItem("pb_financials", JSON.stringify([...existing, entry]));
    return [id];
  }

  function removeFromFinancials(ids: string[]) {
    if (!ids?.length) return;
    const existing = JSON.parse(localStorage.getItem("pb_financials") || "[]");
    localStorage.setItem("pb_financials", JSON.stringify(existing.filter((t: { id: string }) => !ids.includes(t.id))));
  }

  function deletePayment(poId: string, paymentId: string) {
    savePos(pos.map((p) => {
      if (p.id !== poId) return p;
      const payment = p.payments.find((pay) => pay.id === paymentId);
      if (payment?.finTxnIds) removeFromFinancials(payment.finTxnIds);
      const payments = p.payments.filter((pay) => pay.id !== paymentId);
      const paid = calcPaid(payments);
      const total = calcTotal(p.items);
      const status: POStatus = payments.length === 0 ? "Open" : paid >= total ? "Paid" : "Partial";
      return { ...p, payments, status };
    }));
  }

  function vendorLabel(po: PurchaseOrder) {
    return vendors.find((v) => v.id === po.vendorId)?.name || po.vendorName || "—";
  }

  // ── PO actions ──────────────────────────────────────────────────────────────
  function createPO() {
    const vendor = vendors.find((v) => v.id === newForm.vendorId);
    if (!vendor || newForm.items.every((i) => !i.description.trim())) return;
    const po: PurchaseOrder = {
      id: Date.now().toString(),
      vendorId: newForm.vendorId,
      vendorName: vendor.name,
      date: newForm.date,
      status: "Open",
      items: newForm.items.filter((i) => i.description.trim()),
      notes: newForm.notes.trim(),
      payments: [],
    };
    savePos([...pos, po]);
    setNewForm({ vendorId: vendors[0]?.id || "", date: new Date().toISOString().slice(0, 10), notes: "", items: [blankItem()] });
    setShowNew(false);
  }

  function startEdit(po: PurchaseOrder) { setEditingId(po.id); setDraft({ ...po, items: po.items.map((i) => ({ ...i })) }); }
  function commitEdit() {
    if (!editingId || !draft) return;
    savePos(pos.map((p) => p.id === editingId ? draft : p));
    setEditingId(null); setDraft(null);
  }

  // ── Payment ─────────────────────────────────────────────────────────────────
  function openPay(id: string) {
    const po = pos.find((p) => p.id === id)!;
    const balance = calcTotal(po.items) - calcPaid(po.payments);
    setPayPoId(id);
    setPayTab("manual");
    setPayAmount(balance.toFixed(2));
    setPayDate(new Date().toISOString().slice(0, 10));
    setPayFromBank("US Bank");
    setPayFeeAmount("");
    setPayFeeAccount("71401");
    setCsvRows([]);
    setCsvMatches([]);
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target?.result as string);
      setCsvRows(rows);
      const po = pos.find((p) => p.id === payPoId);
      if (!po) return;
      const balance = calcTotal(po.items) - calcPaid(po.payments);
      setCsvMatches(rows.filter((r) => Math.abs(r.amount - balance) / Math.max(balance, 1) < 0.02));
    };
    reader.readAsText(file);
  }

  function buildLines(po: PurchaseOrder, feeAmt: number, feeAccount: string) {
    const lines = po.items.map((item) => ({
      description: item.description,
      amount: -(item.qty * item.unitCost),
      account: resolveAccount(item.account),
    }));
    if (feeAmt > 0) lines.push({ description: "Wire / transfer fee", amount: -feeAmt, account: feeAccount });
    return lines;
  }

  function logManualPayment() {
    const amount = parseFloat(payAmount);
    if (!payPoId || isNaN(amount) || amount <= 0) return;
    const po = pos.find((p) => p.id === payPoId)!;
    const poIdx = pos.indexOf(po);
    const vendor = vendorLabel(po);
    const balance = calcTotal(po.items) - calcPaid(po.payments);
    const isFullPayment = Math.abs(amount - balance) < 0.02;
    const feeAmt = parseFloat(payFeeAmount) || 0;

    const lines = isFullPayment
      ? buildLines(po, feeAmt, payFeeAccount)
      : [{ description: `${vendor} — ${poNumber(poIdx)}`, amount: -(amount + feeAmt), account: "" },
         ...(feeAmt > 0 ? [{ description: "Wire / transfer fee", amount: -feeAmt, account: payFeeAccount }] : [])];

    const finTxnIds = postToFinancials({ date: payDate, description: `${vendor} — ${poNumber(poIdx)}`, bank: payFromBank }, lines);
    applyPayment(payPoId, { id: Date.now().toString(), date: payDate, amount, method: "Manual", bankRef: "", finTxnIds });
  }

  function logCsvPayment(row: CsvRow) {
    if (!payPoId) return;
    const po = pos.find((p) => p.id === payPoId)!;
    const poIdx = pos.indexOf(po);
    const vendor = vendorLabel(po);
    const balance = calcTotal(po.items) - calcPaid(po.payments);
    const isFullPayment = Math.abs(row.amount - balance) / Math.max(balance, 1) < 0.02;

    const lines = isFullPayment
      ? buildLines(po, 0, "")
      : [{ description: row.description || `${vendor} — ${poNumber(poIdx)}`, amount: -row.amount, account: "" }];

    const finTxnIds = postToFinancials({ date: row.date, description: row.description || `${vendor} — ${poNumber(poIdx)}`, bank: payFromBank }, lines);
    applyPayment(payPoId, { id: Date.now().toString(), date: row.date, amount: row.amount, method: "CSV Match", bankRef: row.description, finTxnIds });
  }

  function applyPayment(id: string, payment: Payment) {
    savePos(pos.map((p) => {
      if (p.id !== id) return p;
      const payments = [...p.payments, payment];
      const paid = calcPaid(payments);
      const total = calcTotal(p.items);
      const status: POStatus = paid >= total ? "Paid" : "Partial";
      return { ...p, payments, status };
    }));
    setPayPoId(null);
  }

  // ── Vendor actions ──────────────────────────────────────────────────────────
  function addVendor() {
    if (!vendorForm.name.trim()) return;
    const v: Vendor = { id: Date.now().toString(), ...vendorForm };
    saveVendors([...vendors, v]);
    setVendorForm({ name: "", contact: "", email: "", phone: "", notes: "", swift: "", bankAccountNumber: "", bankAccountName: "", bankName: "", bankAddress: "", beneficiaryAddress: "" });
    setShowNewVendor(false);
    if (!newForm.vendorId) setNewForm((f) => ({ ...f, vendorId: v.id }));
  }

  function commitVendorEdit() {
    if (!editingVendorId) return;
    saveVendors(vendors.map((v) => v.id === editingVendorId ? vendorDraft : v));
    setEditingVendorId(null);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function updateNewItem(idx: number, patch: Partial<POItem>) {
    setNewForm({ ...newForm, items: newForm.items.map((i, j) => j === idx ? { ...i, ...patch } : i) });
  }
  function updateDraftItem(iIdx: number, patch: Partial<POItem>) {
    setDraft({ ...draft!, items: draft!.items.map((i, j) => j === iIdx ? { ...i, ...patch } : i) });
  }

  const totalOwed = pos.filter((p) => p.status !== "Cancelled").reduce((sum, p) => sum + calcTotal(p.items) - calcPaid(p.payments), 0);
  const openCount = pos.filter((p) => p.status === "Open" || p.status === "Partial").length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Purchase Orders</h1>
          <p className="text-[#888] text-sm mt-1">{openCount} open · {fmt(totalOwed)} outstanding</p>
        </div>
        {tab === "orders" && (
          <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors">
            <Plus size={16} /> New PO
          </button>
        )}
        {tab === "vendors" && (
          <button onClick={() => setShowNewVendor(!showNewVendor)} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors">
            <Plus size={16} /> Add Vendor
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[#222]">
        {(["orders", "vendors"] as const).map((key) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === key ? "text-white border-white" : "text-[#555] border-transparent hover:text-[#888]"}`}>
            {key}
          </button>
        ))}
      </div>

      {/* ── ORDERS TAB ────────────────────────────────────────────────────────── */}
      {tab === "orders" && (
        <>
          {/* New PO form */}
          {showNew && (
            <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-5">
              <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">New Purchase Order</h2>
              {vendors.length === 0 ? (
                <p className="text-sm text-yellow-600">No vendors yet — <button className="underline" onClick={() => setTab("vendors")}>add one first</button>.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-xs text-[#888] mb-1 block">Vendor</label>
                      <select className="input w-full" value={newForm.vendorId} onChange={(e) => setNewForm({ ...newForm, vendorId: e.target.value })}>
                        {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#888] mb-1 block">Date</label>
                      <input type="date" className="input w-full" value={newForm.date} onChange={(e) => setNewForm({ ...newForm, date: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-[#888] mb-1 block">Notes</label>
                      <input className="input w-full" placeholder="Batch 2 sample order" value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#888] uppercase tracking-wider mb-2">Line Items</p>
                    <div className="space-y-2">
                      <div className="hidden sm:grid text-[10px] text-[#444] uppercase tracking-wider mb-1" style={{ gridTemplateColumns: "1fr 3.5rem 5.5rem 5.5rem 5.5rem 1.5rem" }}>
                        <span className="pl-1">Description</span><span className="text-center">Qty</span><span>Unit Cost</span><span>Account</span><span className="text-right">Total</span>
                      </div>
                      {newForm.items.map((item, idx) => (
                        <div key={item.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 3.5rem 5.5rem 5.5rem 5.5rem 1.5rem" }}>
                          <input className="input" placeholder="e.g. 9 Pocket Binder samples" value={item.description} onChange={(e) => updateNewItem(idx, { description: e.target.value })} />
                          <input type="number" className="input text-center" min={1} value={item.qty} onChange={(e) => updateNewItem(idx, { qty: +e.target.value })} />
                          <input type="number" className="input" placeholder="0.00" value={item.unitCost || ""} onChange={(e) => updateNewItem(idx, { unitCost: +e.target.value })} />
                          <input className="input" placeholder="Account #" value={item.account} onChange={(e) => updateNewItem(idx, { account: e.target.value })} />
                          <span className="text-xs text-[#555] text-right pr-1">{fmt(item.qty * item.unitCost)}</span>
                          {newForm.items.length > 1
                            ? <button onClick={() => setNewForm({ ...newForm, items: newForm.items.filter((_, j) => j !== idx) })} className="text-[#444] hover:text-red-500"><X size={13} /></button>
                            : <span />}
                        </div>
                      ))}
                      <button onClick={() => setNewForm({ ...newForm, items: [...newForm.items, blankItem()] })} className="flex items-center gap-1.5 text-xs text-[#444] hover:text-[#888] mt-1">
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
                </>
              )}
            </div>
          )}

          {/* PO list */}
          {pos.length === 0 && !showNew ? (
            <div className="bg-[#111] border border-[#222] rounded-xl text-center py-16 text-[#555] text-sm">No purchase orders yet.</div>
          ) : pos.length > 0 && (
            <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                    {["PO #", "Vendor", "Date", "Total", "Paid", "Balance", "Status", "Items", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pos.map((po, idx) => {
                    const total = calcTotal(po.items);
                    const paid = calcPaid(po.payments);
                    const balance = total - paid;
                    const isExpanded = expandedId === po.id;
                    const isEditing = editingId === po.id;

                    return (
                      <>
                        <tr key={po.id} className="border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors">
                          <td className="px-5 py-4 text-[#555] font-mono text-xs">{poNumber(idx)}</td>
                          <td className="px-5 py-4">
                            {isEditing ? (
                              <select className="input w-32" value={draft!.vendorId} onChange={(e) => setDraft({ ...draft!, vendorId: e.target.value, vendorName: vendors.find((v) => v.id === e.target.value)?.name || "" })}>
                                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                              </select>
                            ) : <span className="text-white font-medium">{vendorLabel(po)}</span>}
                          </td>
                          <td className="px-5 py-4 text-[#888]">
                            {isEditing ? <input type="date" className="input w-32" value={draft!.date} onChange={(e) => setDraft({ ...draft!, date: e.target.value })} /> : po.date}
                          </td>
                          <td className="px-5 py-4 text-white font-medium">{fmt(total)}</td>
                          <td className="px-5 py-4 text-[#888]">{paid > 0 ? fmt(paid) : "—"}</td>
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
                            ) : <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[po.status]}`}>{po.status}</span>}
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
                                    <button onClick={() => openPay(po.id)} className="text-xs text-[#555] hover:text-green-400 transition-colors font-medium">+ Pay</button>
                                  )}
                                  <button onClick={() => startEdit(po)} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button>
                                  <button onClick={() => savePos(pos.filter((p) => p.id !== po.id))} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Payment panel */}
                        {payPoId === po.id && (
                          <tr className="border-b border-[#1a1a1a]">
                            <td colSpan={9} className="px-10 py-4 bg-[#0d0d0d]">
                              <div className="space-y-3 max-w-xl">
                                <div className="flex gap-1">
                                  {(["manual", "csv"] as const).map((t) => (
                                    <button key={t} onClick={() => setPayTab(t)}
                                      className={`text-xs px-3 py-1 rounded font-medium capitalize transition-colors ${payTab === t ? "bg-white text-black" : "bg-[#1a1a1a] text-[#888] hover:text-white"}`}>
                                      {t === "csv" ? "Match CSV" : "Manual"}
                                    </button>
                                  ))}
                                  <button onClick={() => setPayPoId(null)} className="ml-auto text-[#444] hover:text-white"><X size={13} /></button>
                                </div>

                                {payTab === "manual" && (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[10px] text-[#555] uppercase tracking-wider">Amount</label>
                                        <input type="number" className="input w-28" autoFocus placeholder="Amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} onKeyDown={(e) => e.key === "Enter" && logManualPayment()} />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[10px] text-[#555] uppercase tracking-wider">Date</label>
                                        <input type="date" className="input w-36" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[10px] text-[#555] uppercase tracking-wider">Paid from</label>
                                        <select className="input w-28" value={payFromBank} onChange={(e) => setPayFromBank(e.target.value)}>
                                          {BANK_ACCOUNTS.map((b) => <option key={b}>{b}</option>)}
                                        </select>
                                      </div>
                                      <div className="flex items-end gap-2">
                                        <button onClick={logManualPayment} className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-medium hover:bg-[#e0e0e0]">Confirm</button>
                                        <span className="text-xs text-[#555]">Balance: {fmt(balance)}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[10px] text-[#555] uppercase tracking-wider">Fee (optional)</label>
                                        <input type="number" className="input w-20" placeholder="0.00" value={payFeeAmount} onChange={(e) => setPayFeeAmount(e.target.value)} />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[10px] text-[#555] uppercase tracking-wider">Book fee to</label>
                                        <select className="input w-44 text-xs" value={payFeeAccount} onChange={(e) => setPayFeeAccount(e.target.value)}>
                                          <option value="71401">Finance Charge</option>
                                          <option value="71400">Bank Charges & Fees</option>
                                          <option value="72300">Interest Paid</option>
                                          <option value="73300">Other Business Expenses</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {payTab === "csv" && (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <select className="input text-xs w-28" value={payFromBank} onChange={(e) => setPayFromBank(e.target.value)}>
                                        {BANK_ACCOUNTS.map((b) => <option key={b}>{b}</option>)}
                                      </select>
                                      <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-[#333] text-[#888] hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                        <Upload size={12} /> Upload CSV
                                      </button>
                                      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
                                      {csvRows.length > 0 && <span className="text-xs text-[#555]">{csvRows.length} transactions loaded</span>}
                                    </div>

                                    {csvRows.length > 0 && (
                                      <>
                                        {csvMatches.length > 0 ? (
                                          <div className="space-y-1">
                                            <p className="text-xs text-[#555] uppercase tracking-wider">Matching transactions (balance: {fmt(balance)})</p>
                                            {csvMatches.map((row, i) => (
                                              <div key={i} className="flex items-center gap-3 bg-[#111] border border-[#333] rounded-lg px-3 py-2">
                                                <span className="text-xs text-[#555] w-20 shrink-0">{row.date}</span>
                                                <span className="text-xs text-white flex-1 truncate">{row.description}</span>
                                                <span className="text-xs text-green-400 font-medium shrink-0">{fmt(row.amount)}</span>
                                                <button onClick={() => logCsvPayment(row)} className="text-xs bg-white text-black px-2.5 py-1 rounded font-medium hover:bg-[#e0e0e0] shrink-0">Match</button>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-yellow-600">No exact match found for {fmt(balance)}. All transactions:</p>
                                        )}

                                        {csvMatches.length === 0 && (
                                          <div className="space-y-1 max-h-48 overflow-y-auto">
                                            {csvRows.slice(0, 20).map((row, i) => (
                                              <div key={i} className="flex items-center gap-3 bg-[#111] border border-[#1a1a1a] rounded px-3 py-1.5">
                                                <span className="text-xs text-[#555] w-20 shrink-0">{row.date}</span>
                                                <span className="text-xs text-[#888] flex-1 truncate">{row.description}</span>
                                                <span className="text-xs text-white shrink-0">{fmt(row.amount)}</span>
                                                <button onClick={() => logCsvPayment(row)} className="text-xs text-[#555] hover:text-green-400 shrink-0">Match</button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}

                                {/* Payment history */}
                                {po.payments.length > 0 && (
                                  <div className="pt-2 border-t border-[#1a1a1a] space-y-1">
                                    <p className="text-[10px] text-[#444] uppercase tracking-wider">Payment history</p>
                                    {po.payments.map((pmt) => (
                                      <div key={pmt.id} className="flex items-center gap-3 text-xs group">
                                        <span className="text-[#555] w-20">{pmt.date}</span>
                                        <span className="text-white">{fmt(pmt.amount)}</span>
                                        <span className="text-[#444]">{pmt.method}</span>
                                        {pmt.bankRef && <span className="text-[#555] truncate flex-1">{pmt.bankRef}</span>}
                                        <button onClick={() => deletePayment(po.id, pmt.id)} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-red-500">
                                          <X size={11} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
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
                                  <div key={item.id} className="grid gap-2 items-center text-xs" style={{ gridTemplateColumns: "1fr 3rem 5rem 5rem 5rem 1.5rem" }}>
                                    {isEditing ? (
                                      <>
                                        <input className="input" value={item.description} onChange={(e) => updateDraftItem(iIdx, { description: e.target.value })} />
                                        <input type="number" className="input text-center" value={item.qty} onChange={(e) => updateDraftItem(iIdx, { qty: +e.target.value })} />
                                        <input type="number" className="input" value={item.unitCost} onChange={(e) => updateDraftItem(iIdx, { unitCost: +e.target.value })} />
                                        <input className="input" placeholder="Account" value={item.account} onChange={(e) => updateDraftItem(iIdx, { account: e.target.value })} />
                                        <span className="text-[#555] text-right">{fmt(item.qty * item.unitCost)}</span>
                                        <button onClick={() => setDraft({ ...draft!, items: draft!.items.filter((_, j) => j !== iIdx) })} className="text-[#444] hover:text-red-500"><X size={11} /></button>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-white">{item.description}</span>
                                        <span className="text-[#555] text-center">{item.qty}×</span>
                                        <span className="text-[#888]">{fmt(item.unitCost)}</span>
                                        <span className="text-[#555] font-mono">{item.account || "—"}</span>
                                        <span className="text-white font-medium text-right">{fmt(item.qty * item.unitCost)}</span>
                                        <span />
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
        </>
      )}

      {/* ── VENDORS TAB ───────────────────────────────────────────────────────── */}
      {tab === "vendors" && (
        <div className="space-y-4">
          {showNewVendor && (
            <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-5">
              <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">New Vendor</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[["name","Name","Shanghai Dijin Industrial Co."],["contact","Contact","Jason"],["email","Email",""],["phone","Phone","+86 188 0173 9840"],["notes","Notes","Primary manufacturer"]].map(([key, label, placeholder]) => (
                  <div key={key} className={key === "name" ? "col-span-2 sm:col-span-1" : ""}>
                    <label className="text-xs text-[#888] mb-1 block">{label}</label>
                    <input className="input w-full" placeholder={placeholder} value={(vendorForm as Record<string, string>)[key]} onChange={(e) => setVendorForm({ ...vendorForm, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-[#555] uppercase tracking-wider mb-3">Wire / Banking Info</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[["swift","SWIFT / BIC","CHASHKHH"],["bankAccountNumber","Account Number","63007944607"],["bankAccountName","Account Name","Shanghai Dijin Industrial Co., Ltd"],["bankName","Bank Name","JPMorgan Chase Bank N.A., Hong Kong Branch"],["bankAddress","Bank Address","18/F, Chater House, 8 Connaught Rd Central, HK"],["beneficiaryAddress","Beneficiary Address","Room 306, Ascendas Innovation Place, Shanghai"]].map(([key, label, placeholder]) => (
                    <div key={key} className={["bankName","bankAddress","beneficiaryAddress"].includes(key) ? "col-span-2 sm:col-span-3" : ""}>
                      <label className="text-xs text-[#888] mb-1 block">{label}</label>
                      <input className="input w-full" placeholder={placeholder} value={(vendorForm as Record<string, string>)[key]} onChange={(e) => setVendorForm({ ...vendorForm, [key]: e.target.value })} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={addVendor} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0]">Add</button>
                <button onClick={() => setShowNewVendor(false)} className="text-[#888] text-sm px-4 py-2 hover:text-white">Cancel</button>
              </div>
            </div>
          )}

          {vendors.length === 0 && !showNewVendor ? (
            <div className="bg-[#111] border border-[#222] rounded-xl text-center py-16 text-[#555] text-sm">No vendors yet. Add your first above.</div>
          ) : vendors.length > 0 && (
            <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                    {["Name", "Contact", "Email", "Phone", "Notes", "Banking", ""].map((h) => <th key={h} className="text-left px-5 py-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => {
                    const isEd = editingVendorId === v.id;
                    const d = isEd ? vendorDraft : v;
                    const poCount = pos.filter((p) => p.vendorId === v.id).length;
                    const bankExpanded = expandedVendorId === v.id;
                    const hasBanking = v.swift || v.bankAccountNumber || v.bankName;
                    return (
                      <>
                        <tr key={v.id} className="border-b border-[#1a1a1a] hover:bg-[#151515]">
                          <td className="px-5 py-3">
                            {isEd ? <input className="input w-40" value={d.name} onChange={(e) => setVendorDraft({ ...vendorDraft, name: e.target.value })} />
                              : <><span className="text-white font-medium">{v.name}</span>{poCount > 0 && <span className="text-[#555] text-xs ml-2">{poCount} PO{poCount !== 1 ? "s" : ""}</span>}</>}
                          </td>
                          {(["contact", "email", "phone", "notes"] as const).map((field) => (
                            <td key={field} className="px-5 py-3 text-[#888] text-xs">
                              {isEd ? <input className="input w-28" value={d[field]} onChange={(e) => setVendorDraft({ ...vendorDraft, [field]: e.target.value })} /> : (v[field] || "—")}
                            </td>
                          ))}
                          <td className="px-5 py-3">
                            <button onClick={() => setExpandedVendorId(bankExpanded ? null : v.id)}
                              className={`flex items-center gap-1 text-xs transition-colors ${hasBanking ? "text-[#888] hover:text-white" : "text-[#333] hover:text-[#555]"}`}>
                              {hasBanking ? "View" : "Add"} {bankExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                            </button>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2">
                              {isEd ? (
                                <><button onClick={commitVendorEdit} className="text-green-400 hover:text-green-300"><Check size={13} /></button><button onClick={() => setEditingVendorId(null)} className="text-[#555] hover:text-white"><X size={13} /></button></>
                              ) : (
                                <><button onClick={() => { setEditingVendorId(v.id); setVendorDraft({ ...v }); }} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button><button onClick={() => saveVendors(vendors.filter((x) => x.id !== v.id))} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={13} /></button></>
                              )}
                            </div>
                          </td>
                        </tr>

                        {bankExpanded && (
                          <tr className="border-b border-[#1a1a1a]">
                            <td colSpan={7} className="px-10 py-4 bg-[#0d0d0d]">
                              {isEd ? (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 max-w-2xl">
                                  {([["swift","SWIFT / BIC"],["bankAccountNumber","Account Number"],["bankAccountName","Account Name"],["bankName","Bank Name"],["bankAddress","Bank Address"],["beneficiaryAddress","Beneficiary Address"]] as const).map(([field, label]) => (
                                    <div key={field} className={["bankName","bankAddress","beneficiaryAddress"].includes(field) ? "col-span-2 sm:col-span-3" : ""}>
                                      <label className="text-xs text-[#555] mb-0.5 block">{label}</label>
                                      <input className="input w-full text-xs" value={vendorDraft[field]} onChange={(e) => setVendorDraft({ ...vendorDraft, [field]: e.target.value })} />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3 max-w-2xl text-xs">
                                  {([["swift","SWIFT / BIC"],["bankAccountNumber","Account Number"],["bankAccountName","Account Name"],["bankName","Bank Name"],["bankAddress","Bank Address"],["beneficiaryAddress","Beneficiary Address"]] as const).map(([field, label]) => (
                                    v[field] ? (
                                      <div key={field} className={["bankName","bankAddress","beneficiaryAddress"].includes(field) ? "col-span-2 sm:col-span-3" : ""}>
                                        <p className="text-[#444] mb-0.5">{label}</p>
                                        <p className="text-white font-mono">{v[field]}</p>
                                      </div>
                                    ) : null
                                  ))}
                                </div>
                              )}
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
      )}
    </div>
  );
}
