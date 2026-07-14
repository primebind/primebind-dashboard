"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

type Status = "Idea" | "Posted" | "Winner" | "Loser";
type Platform = "TikTok" | "Instagram" | "YouTube" | "Other";
type Format = "Video" | "Reel" | "Carousel" | "Photo" | "Story";

type ContentIdea = {
  id: string;
  concept: string;
  platform: Platform;
  format: Format;
  status: Status;
  notes: string;
  createdAt: string;
};

const STATUS_COLORS: Record<Status, string> = {
  Idea: "text-[#888] bg-[#1a1a1a] border-[#333]",
  Posted: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  Winner: "text-green-400 bg-green-400/10 border-green-400/30",
  Loser: "text-red-400 bg-red-400/10 border-red-400/30",
};

const STATUSES: Status[] = ["Idea", "Posted", "Winner", "Loser"];
const PLATFORMS: Platform[] = ["TikTok", "Instagram", "YouTube", "Other"];
const FORMATS: Format[] = ["Video", "Reel", "Carousel", "Photo", "Story"];

const EMPTY_FORM = { concept: "", platform: "TikTok" as Platform, format: "Video" as Format, status: "Idea" as Status, notes: "" };

export default function ContentIdeas() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState<Status | "All">("All");

  useEffect(() => {
    const saved = localStorage.getItem("pb_content_ideas");
    if (saved) setIdeas(JSON.parse(saved));
  }, []);

  function save(updated: ContentIdea[]) {
    setIdeas(updated);
    localStorage.setItem("pb_content_ideas", JSON.stringify(updated));
  }

  function add() {
    if (!form.concept.trim()) return;
    save([{ id: Date.now().toString(), ...form, createdAt: new Date().toISOString().split("T")[0] }, ...ideas]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function updateStatus(id: string, status: Status) {
    save(ideas.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  function remove(id: string) {
    save(ideas.filter((i) => i.id !== id));
  }

  const visible = filter === "All" ? ideas : ideas.filter((i) => i.status === filter);

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = ideas.filter((i) => i.status === s).length;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content Ideas</h1>
          <p className="text-[#888] text-sm mt-1">Capture, track, and grade organic content concepts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors"
        >
          <Plus size={16} /> Add Idea
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["All", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === s
                ? "bg-white text-black border-white"
                : "text-[#888] border-[#333] hover:border-[#555] hover:text-white"
            }`}
          >
            {s} {s !== "All" && counts[s] > 0 && <span className="ml-1 opacity-60">{counts[s]}</span>}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">New Idea</h2>
          <div>
            <label className="text-xs text-[#888] mb-1 block">Concept</label>
            <input
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#555]"
              placeholder="e.g. Moving my childhood collection into a PB binder (Part 1)"
              value={form.concept}
              onChange={(e) => setForm({ ...form, concept: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[#888] mb-1 block">Platform</label>
              <select
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#555]"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}
              >
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Format</label>
              <select
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#555]"
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value as Format })}
              >
                {FORMATS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Status</label>
              <select
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#555]"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
              >
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#888] mb-1 block">Notes</label>
            <textarea
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#555] resize-none"
              rows={3}
              placeholder="Hook, angle, references, why it might work..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
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
            {filter === "All" ? "No ideas yet. Add your first above." : `No ideas with status "${filter}".`}
          </div>
        ) : (
          visible.map((idea) => (
            <div key={idea.id} className="bg-[#111] border border-[#222] rounded-xl p-5 flex gap-4 items-start">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium leading-snug">{idea.concept}</p>
                {idea.notes && <p className="text-[#666] text-xs mt-1.5 leading-relaxed">{idea.notes}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[#555] text-xs">{idea.platform}</span>
                  <span className="text-[#333]">·</span>
                  <span className="text-[#555] text-xs">{idea.format}</span>
                  <span className="text-[#333]">·</span>
                  <span className="text-[#555] text-xs">{idea.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={idea.status}
                  onChange={(e) => updateStatus(idea.id, e.target.value as Status)}
                  className={`text-xs px-2.5 py-1 rounded-full border bg-transparent focus:outline-none cursor-pointer ${STATUS_COLORS[idea.status]}`}
                >
                  {STATUSES.map((s) => <option key={s} value={s} className="bg-[#1a1a1a] text-white">{s}</option>)}
                </select>
                <button onClick={() => remove(idea.id)} className="text-[#444] hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
