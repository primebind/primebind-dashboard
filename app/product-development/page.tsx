"use client";

import { Fragment, useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Pencil, Check, X } from "lucide-react";

type Category = "Primary" | "Secondary";
type Owner = "Dylan" | "Enrique" | "Both";
type Status = "Not Started" | "In Progress" | "Blocked" | "Resolved";

type LogEntry = { id: string; date: string; text: string };

type DevItem = {
  id: string;
  category: Category;
  rank: number;
  item: string;
  owner: Owner;
  status: Status;
  updates: LogEntry[];
};

const OWNERS: Owner[] = ["Dylan", "Enrique", "Both"];
const STATUSES: Status[] = ["Not Started", "In Progress", "Blocked", "Resolved"];

const STATUS_COLORS: Record<Status, string> = {
  "Not Started": "bg-[#333] text-[#888]",
  "In Progress": "bg-blue-950 text-blue-400",
  Blocked: "bg-red-950 text-red-400",
  Resolved: "bg-green-950 text-green-400",
};

const OWNER_COLORS: Record<Owner, string> = {
  Dylan: "bg-purple-950 text-purple-300",
  Enrique: "bg-yellow-950 text-yellow-300",
  Both: "bg-[#252525] text-[#aaa]",
};

const today = () => new Date().toISOString().split("T")[0];

const DEFAULTS: DevItem[] = [
  {
    id: "density", category: "Primary", rank: 1, item: "Overall density / solidity", owner: "Dylan", status: "In Progress",
    updates: [{ id: "d1", date: "2026-08-08", text: "Binder doesn't feel solid/dense in hand. Nylon TPU exterior is only .4–.5mm — supplier gluing a spandex layer behind it to get to ~.7mm. Sponge density still unconfirmed. Inner lint is free-floating and needs to be glued down — not acceptable as-is." }],
  },
  {
    id: "zipper", category: "Primary", rank: 2, item: "Zipper / zipper cloth function", owner: "Dylan", status: "In Progress",
    updates: [{ id: "z1", date: "2026-08-08", text: "Looks great (teeth hidden when closed) but the TPU layer over the nylon cloth makes it rigid — doesn't glide, clunky to open, hard to zip closed from fully open. Metal pull/slider may need a sleeker replacement. Next: try zipper cloth with no TPU layer. Fallback if that fails: mimic VaultX (teeth facing outward)." }],
  },
  {
    id: "logo", category: "Primary", rank: 3, item: "Logo peeling", owner: "Dylan", status: "Not Started",
    updates: [{ id: "l1", date: "2026-08-08", text: "Thin nickel-coated metal logo, heat-pressed onto binder + deck box, peels easily under a fingernail. Confirmed peeling on deck box. Mold needs adjusting regardless. Options: better adhesive, or silver stamping instead — but must preserve the current shine/reflection, which matches the metal zipper piece and looks premium." }],
  },
  {
    id: "findmy", category: "Primary", rank: 4, item: "FindMy seamlessness", owner: "Both", status: "In Progress",
    updates: [{ id: "f1", date: "2026-08-08", text: "Functionally solved already (proven in other projects) — purely a cosmetic/integration challenge. Exterior charging/activation tried, looked bad. Better direction: interior of back panel. New idea: sell thin MagSafe power banks as an upsell for periodic charging." }],
  },
  {
    id: "packaging", category: "Secondary", rank: 1, item: "Packaging design", owner: "Both", status: "Not Started",
    updates: [{ id: "p1", date: "2026-08-08", text: "Enrique has ideas already; Dylan to help execute/source. Collaborative, needs a call to go through options." }],
  },
  {
    id: "photos", category: "Secondary", rank: 2, item: "Product photography", owner: "Dylan", status: "Not Started",
    updates: [{ id: "ph1", date: "2026-08-08", text: "Suggested using the same photo team already used for Bullstrap (based in China) — ~$5/pic, great rate if they can shoot these too." }],
  },
  {
    id: "colors", category: "Secondary", rank: 3, item: "Launch color combos", owner: "Enrique", status: "Not Started",
    updates: [{ id: "c1", date: "2026-08-08", text: "Enrique will finalize. Needs Dylan to send generic/representative pics of the combo options — combos can be locked now even though binders aren't functionally finished yet." }],
  },
  {
    id: "marketing", category: "Secondary", rank: 4, item: "Social media / marketing campaign", owner: "Enrique", status: "In Progress",
    updates: [{ id: "m1", date: "2026-08-08", text: "Enrique spearheading this himself, not a Dylan item — flagged to him just for visibility on what's moving in parallel." }],
  },
];

const EMPTY_FORM = { category: "Primary" as Category, item: "", owner: "Enrique" as Owner, status: "Not Started" as Status };

export default function ProductDevelopment() {
  const [items, setItems] = useState<DevItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logDraft, setLogDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<DevItem>>({});

  useEffect(() => {
    const saved = localStorage.getItem("pb_product_dev");
    setItems(saved ? JSON.parse(saved) : DEFAULTS);
  }, []);

  function save(updated: DevItem[]) {
    setItems(updated);
    localStorage.setItem("pb_product_dev", JSON.stringify(updated));
  }

  function nextRank(category: Category) {
    const inCat = items.filter((i) => i.category === category);
    return inCat.length ? Math.max(...inCat.map((i) => i.rank)) + 1 : 1;
  }

  function add() {
    if (!form.item.trim()) return;
    const entry: DevItem = { id: Date.now().toString(), rank: nextRank(form.category), ...form, updates: [] };
    save([...items, entry]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function remove(id: string) { save(items.filter((i) => i.id !== id)); }

  function updateOwner(id: string, owner: Owner) {
    save(items.map((i) => (i.id === id ? { ...i, owner } : i)));
  }

  function updateStatus(id: string, status: Status) {
    save(items.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  function toggleExpand(id: string) { setExpandedId(expandedId === id ? null : id); }

  function addLog(id: string) {
    if (!logDraft.trim()) return;
    const entry: LogEntry = { id: Date.now().toString(), date: today(), text: logDraft.trim() };
    save(items.map((i) => (i.id === id ? { ...i, updates: [entry, ...i.updates] } : i)));
    setLogDraft("");
  }

  function removeLog(id: string, logId: string) {
    save(items.map((i) => (i.id === id ? { ...i, updates: i.updates.filter((u) => u.id !== logId) } : i)));
  }

  function startEdit(item: DevItem) {
    setEditingId(item.id);
    setEditDraft({ ...item });
  }

  function commitEdit() {
    if (!editingId || !editDraft.item?.trim()) return;
    save(items.map((i) => (i.id === editingId ? { ...i, ...editDraft } : i)));
    setEditingId(null);
    setEditDraft({});
  }

  function cancelEdit() { setEditingId(null); setEditDraft({}); }

  const primary = [...items.filter((i) => i.category === "Primary")].sort((a, b) => a.rank - b.rank);
  const secondary = [...items.filter((i) => i.category === "Secondary")].sort((a, b) => a.rank - b.rank);

  function Section({ title, rows }: { title: string; rows: DevItem[] }) {
    return (
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#222]">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">{title}</h2>
        </div>
        {rows.length === 0 ? (
          <div className="text-center py-10 text-[#555] text-sm">Nothing here yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 w-10">#</th>
                <th className="text-left px-5 py-3">Item</th>
                <th className="text-left px-5 py-3">Owner</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Log</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const isExpanded = expandedId === item.id;
                const isEditing = editingId === item.id;
                return (
                  <Fragment key={item.id}>
                    <tr className="border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors">
                      <td className="px-5 py-4 text-[#555] font-mono">{item.rank}</td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <input className="input w-full" value={editDraft.item || ""} onChange={(e) => setEditDraft({ ...editDraft, item: e.target.value })} autoFocus />
                        ) : (
                          <span className="text-white font-medium">{item.item}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={isEditing ? editDraft.owner : item.owner}
                          onChange={(e) => isEditing ? setEditDraft({ ...editDraft, owner: e.target.value as Owner }) : updateOwner(item.id, e.target.value as Owner)}
                          className={`text-xs px-2 py-1 rounded-md border-0 font-medium focus:outline-none cursor-pointer ${OWNER_COLORS[(isEditing ? editDraft.owner : item.owner) as Owner]}`}
                        >
                          {OWNERS.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={isEditing ? editDraft.status : item.status}
                          onChange={(e) => isEditing ? setEditDraft({ ...editDraft, status: e.target.value as Status }) : updateStatus(item.id, e.target.value as Status)}
                          className={`text-xs px-2 py-1 rounded-md border-0 font-medium focus:outline-none cursor-pointer ${STATUS_COLORS[(isEditing ? editDraft.status : item.status) as Status]}`}
                        >
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        {!isEditing && (
                          <button onClick={() => toggleExpand(item.id)} className="flex items-center gap-1.5 text-xs text-[#555] hover:text-white transition-colors">
                            <span className="text-[#888]">{item.updates.length}</span>
                            {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={commitEdit} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
                              <button onClick={cancelEdit} className="text-[#555] hover:text-white"><X size={14} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(item)} className="text-[#444] hover:text-white transition-colors"><Pencil size={13} /></button>
                              <button onClick={() => remove(item.id)} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-b border-[#1a1a1a]">
                        <td colSpan={6} className="px-10 pb-4 pt-2 bg-[#0d0d0d]">
                          {item.updates.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {item.updates.map((u) => (
                                <div key={u.id} className="flex items-start gap-2 text-xs">
                                  <span className="text-[#555] shrink-0 font-mono">{u.date}</span>
                                  <span className="text-[#aaa] leading-snug">{u.text}</span>
                                  <button onClick={() => removeLog(item.id, u.id)} className="ml-auto shrink-0 text-[#333] hover:text-red-500 transition-colors"><Trash2 size={11} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <input
                              className="input flex-1 text-xs"
                              placeholder="Log an update…"
                              value={logDraft}
                              onChange={(e) => setLogDraft(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") addLog(item.id); }}
                            />
                            <button onClick={() => addLog(item.id)} className="flex items-center gap-1 text-xs bg-[#1a1a1a] border border-[#333] text-[#888] hover:text-white px-2.5 py-1.5 rounded-md transition-colors">
                              <Plus size={11} /> Add
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
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Product Development</h1>
          <p className="text-[#888] text-sm mt-1">Ranked priorities for the physical product, with owner, status, and a running log per item</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">New Item</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-[#888] mb-1 block">Item</label>
              <input className="input w-full" placeholder="e.g. Deck box magnet strength" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Category</label>
              <select className="input w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}>
                <option>Primary</option>
                <option>Secondary</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Owner</label>
              <select className="input w-full" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value as Owner })}>
                {OWNERS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={add} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0]">Add</button>
            <button onClick={() => setShowForm(false)} className="text-[#888] text-sm px-4 py-2 hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      <Section title="Primary — Product Feel/Function" rows={primary} />
      <Section title="Secondary — Parallel Workstreams" rows={secondary} />
    </div>
  );
}
