"use client";

import { useState, useEffect } from "react";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

type Section = { title: string; bullets: string[] };
type Update = {
  id: string;
  timestamp: string;
  source: string;
  sections: Section[];
  content: string;
};

const DAY_EMOJIS = ["🟣", "🟡", "🔵", "🟢", "🟠", "🔴", "🔴"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toLocalDateStr(date: Date) {
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true, timeZoneName: "short",
  });
}

export default function UpdatesPage() {
  const [allUpdates, setAllUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateStr(new Date()));

  async function fetchUpdates() {
    setLoading(true);
    try {
      const res = await fetch("/api/updates");
      const data = await res.json();
      setAllUpdates(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    }
    setLoading(false);
    setLastRefresh(new Date());
  }

  useEffect(() => {
    fetchUpdates();
    const interval = setInterval(fetchUpdates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = allUpdates.filter((u) => toLocalDateStr(new Date(u.timestamp)) === selectedDate);

  function shiftDay(delta: number) {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + delta);
    setSelectedDate(toLocalDateStr(d));
  }

  const isToday = selectedDate === toLocalDateStr(new Date());

  const displayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Updates</h1>
          <p className="text-[#888] text-sm mt-1">Daily TCG briefings for PrimeBind</p>
        </div>
        <button
          onClick={fetchUpdates}
          className="flex items-center gap-2 text-[#555] hover:text-white transition-colors text-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {lastRefresh && !loading ? `Updated ${lastRefresh.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : "Refresh"}
        </button>
      </div>

      {/* Date navigator */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => shiftDay(-1)}
          className="p-1.5 rounded-md text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <input
          type="date"
          value={selectedDate}
          max={toLocalDateStr(new Date())}
          onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
          className="bg-[#111] border border-[#222] rounded-md px-3 py-1.5 text-sm text-white [color-scheme:dark] cursor-pointer"
        />
        <button
          onClick={() => shiftDay(1)}
          disabled={isToday}
          className="p-1.5 rounded-md text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
        <span className="text-[#555] text-sm">{displayDate}</span>
        {!isToday && (
          <button
            onClick={() => setSelectedDate(toLocalDateStr(new Date()))}
            className="ml-auto text-xs text-[#555] hover:text-white transition-colors"
          >
            Today
          </button>
        )}
      </div>

      {loading && allUpdates.length === 0 ? (
        <div className="text-center py-20 text-[#555] text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#111] border border-[#222] rounded-xl text-center py-20 text-[#555] text-sm">
          No briefing for this date.
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((update) => {
            const d = new Date(update.timestamp);
            const dayIdx = d.getDay();
            return (
              <div key={update.id} className="bg-[#111] border border-[#222] rounded-xl p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{DAY_EMOJIS[dayIdx]}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{update.source}</p>
                      <p className="text-[#444] text-xs">{DAY_NAMES[dayIdx]} · {formatTime(update.timestamp)}</p>
                    </div>
                  </div>
                </div>

                {update.sections && update.sections.length > 0 ? (
                  <div className="space-y-5">
                    {update.sections.map((section, i) => (
                      <div key={i}>
                        <p className="text-[#666] text-xs font-semibold uppercase tracking-wider mb-2">
                          {section.title}
                        </p>
                        <ul className="space-y-1.5">
                          {section.bullets.map((bullet, j) => (
                            <li key={j} className="text-sm text-white flex gap-2 leading-relaxed">
                              <span className="text-[#333] shrink-0 mt-0.5">·</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{update.content}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
