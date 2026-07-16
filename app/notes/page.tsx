"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Pencil, X } from "lucide-react";

type Category = "General" | "Ask Dylan" | "To Consider";

type Note = {
  id: string;
  text: string;
  category: Category;
  resolved: boolean;
  createdAt: string;
};

const CATEGORY_COLORS: Record<Category, string> = {
  General: "text-[#888] bg-[#1a1a1a] border-[#333]",
  "Ask Dylan": "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  "To Consider": "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

const CATEGORIES: Category[] = ["General", "Ask Dylan", "To Consider"];

const EMPTY_FORM = { text: "", category: "General" as Category };

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState<Category | "All">("All");
  const [showResolved, setShowResolved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Note>({ id: "", text: "", category: "General", resolved: false, createdAt: "" });

  useEffect(() => {
    const saved = localStorage.getItem("pb_notes");
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  function save(updated: Note[]) {
    setNotes(updated);
    localStorage.setItem("pb_notes", JSON.stringify(updated));
  }

  function add() {
    if (!form.text.trim()) return;
    save([{ id: Date.now().toString(), ...form, resolved: false, createdAt: new Date().toISOString().split("T")[0] }, ...notes]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function toggleResolved(id: string) {
    save(notes.map((n) => (n.id === id ? { ...n, resolved: !n.resolved } : n)));
  }

  function remove(id: string) {
    save(notes.filter((n) => n.id !== id));
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setDraft({ ...note });
  }

  function commitEdit() {
    if (!editingId || !draft.text.trim()) return;
    save(notes.map((n) => (n.id === editingId ? draft : n)));
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  const byCategory = filter === "All" ? notes : notes.filter((n) => n.category === filter);
  const visible = showResolved ? byCategory : byCategory.filter((n) => !n.resolved);

  const counts = CATEGORIES.reduce<Record<string, number>>((acc, c) => {
    acc[c] = notes.filter((n) => n.category === c && !n.resolved).length;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-[#888] text-sm mt-1">Things to remember, questions for Dylan, and things to consider along the way</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors"
        >
          <Plus size={16} /> Add Note
        </button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === c
                  ? "bg-white text-black border-white"
                  : "text-[#888] border-[#333] hover:border-[#555] hover:text-white"
              }`}
            >
              {c} {c !== "All" && counts[c] > 0 && <span className="ml-1 opacity-60">{counts[c]}</span>}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className="text-xs text-[#666] hover:text-white transition-colors"
        >
          {showResolved ? "Hide resolved" : "Show resolved"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">New Note</h2>
          <div>
            <label className="text-xs text-[#888] mb-1 block">Note</label>
            <textarea
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#555] resize-none"
              rows={3}
              placeholder="e.g. Ask Dylan about PP white pages supplier lead time"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-[#888] mb-1 block">Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, category: c })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.category === c
                      ? "bg-white text-black border-white"
                      : "text-[#888] border-[#333] hover:border-[#555] hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={add} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0]">
              Add
            </button>
            <button onClick={() => setShowForm(false)} className="text-[#888] text-sm px-4 py-2 hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="bg-[#111] border border-[#222] rounded-xl text-center py-16 text-[#555] text-sm">
            {filter === "All" ? "No notes yet. Add your first above." : `No notes tagged "${filter}".`}
          </div>
        ) : (
          visible.map((note) => {
            const isEditing = editingId === note.id;
            return (
              <div
                key={note.id}
                className={`bg-[#111] border border-[#222] rounded-xl p-5 flex gap-4 items-start ${note.resolved && !isEditing ? "opacity-50" : ""}`}
              >
                {!isEditing && (
                  <button
                    onClick={() => toggleResolved(note.id)}
                    className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition-colors ${
                      note.resolved ? "bg-white border-white text-black" : "border-[#444] text-transparent hover:border-[#666]"
                    }`}
                  >
                    <Check size={12} />
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#555] resize-none"
                        rows={3}
                        value={draft.text}
                        onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                        autoFocus
                      />
                      <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setDraft({ ...draft, category: c })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              draft.category === c
                                ? "bg-white text-black border-white"
                                : "text-[#888] border-[#333] hover:border-[#555] hover:text-white"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={`text-white text-sm leading-snug ${note.resolved ? "line-through" : ""}`}>{note.text}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[note.category]}`}>{note.category}</span>
                        <span className="text-[#333]">·</span>
                        <span className="text-[#555] text-xs">{note.createdAt}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={commitEdit} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
                      <button onClick={cancelEdit} className="text-[#555] hover:text-white"><X size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(note)} className="text-[#444] hover:text-white transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => remove(note.id)} className="text-[#444] hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
