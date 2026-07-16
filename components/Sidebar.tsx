"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { LayoutDashboard, Users, BarChart2, Package, DollarSign, Rocket, ClipboardList, Inbox, Bell, ChevronDown, Mail, Globe, Lightbulb, Film, CloudUpload, CloudDownload, TrendingDown, StickyNote } from "lucide-react";

const API_KEY = "pb-updates-2026-secure-key";

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavGroup = { label: string; items: NavItem[] };

const standalone: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/updates", label: "Updates", icon: Bell },
  { href: "/website", label: "Website", icon: Globe },
];

const groups: NavGroup[] = [
  {
    label: "Marketing",
    items: [
      { href: "/influencers", label: "Influencers", icon: Users },
      { href: "/content-ideas", label: "Content Ideas", icon: Film },
      { href: "/ad-ideas", label: "Ad Ideas", icon: Lightbulb },
      { href: "/ads", label: "Ad Performance", icon: BarChart2 },
      { href: "/kit", label: "Kit Subscribers", icon: Mail },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/financials", label: "Financials", icon: DollarSign },
      { href: "/cashflow", label: "Cashflow", icon: TrendingDown },
      { href: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
      { href: "/inbound", label: "Inbounds", icon: Inbox },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/kickstarter", label: "Kickstarter", icon: Rocket },
      { href: "/skus", label: "SKUs", icon: Package },
      { href: "/notes", label: "Notes", icon: StickyNote },
    ],
  },
];

function NavLink({ href, label, icon: Icon, active }: NavItem & { active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
        active ? "bg-white text-black font-medium" : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}

function getPbData(): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith("pb_")) data[k] = localStorage.getItem(k)!;
  }
  return data;
}

// Merge KV data into localStorage — only adds missing entries, never deletes or overwrites local data.
function mergeIntoLocal(remote: Record<string, string>) {
  for (const [key, remoteVal] of Object.entries(remote)) {
    const localVal = localStorage.getItem(key);
    if (!localVal) {
      localStorage.setItem(key, remoteVal);
      continue;
    }
    try {
      const localArr = JSON.parse(localVal);
      const remoteArr = JSON.parse(remoteVal);
      if (Array.isArray(localArr) && Array.isArray(remoteArr)) {
        const localIds = new Set(localArr.map((x: Record<string, string>) => x.id));
        const missing = remoteArr.filter((x: Record<string, string>) => !localIds.has(x.id));
        if (missing.length > 0) {
          localStorage.setItem(key, JSON.stringify([...localArr, ...missing]));
        }
      }
    } catch {
      // not an array — local always wins, skip
    }
  }
}

type SyncStatus = "idle" | "pushing" | "pulling" | "ok" | "error";

export default function Sidebar() {
  const pathname = usePathname();

  const initialOpen = groups.reduce<Record<string, boolean>>((acc, g) => {
    acc[g.label] = g.items.some((item) => item.href === pathname);
    return acc;
  }, {});

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncMsg, setSyncMsg] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev };
      groups.forEach((g) => {
        if (g.items.some((item) => item.href === pathname)) next[g.label] = true;
      });
      return next;
    });
  }, [pathname]);

  // Auto-push to KV whenever any pb_ key changes
  useEffect(() => {
    const original = localStorage.setItem.bind(localStorage);
    localStorage.setItem = (key: string, value: string) => {
      original(key, value);
      if (!key.startsWith("pb_")) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify(getPbData()),
          });
        } catch { /* silent */ }
      }, 3000);
    };
    return () => { localStorage.setItem = original; };
  }, []);

  const flash = (status: SyncStatus, msg: string) => {
    setSyncStatus(status);
    setSyncMsg(msg);
    setTimeout(() => { setSyncStatus("idle"); setSyncMsg(""); }, 2500);
  };

  const push = useCallback(async () => {
    setSyncStatus("pushing");
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
        body: JSON.stringify(getPbData()),
      });
      if (!res.ok) throw new Error();
      flash("ok", "Saved");
    } catch {
      flash("error", "Save failed");
    }
  }, []);

  // Pull merges remote into local — only adds missing entries, never deletes
  const pull = useCallback(async () => {
    setSyncStatus("pulling");
    try {
      const res = await fetch("/api/sync");
      if (!res.ok) throw new Error();
      const data: Record<string, string> = await res.json();
      if (!Object.keys(data).length) { flash("error", "Nothing in cloud"); return; }
      mergeIntoLocal(data);
      flash("ok", "Merged — reloading…");
      setTimeout(() => window.location.reload(), 800);
    } catch {
      flash("error", "Merge failed");
    }
  }, []);

  return (
    <aside className="w-56 shrink-0 border-r border-[#222] flex flex-col h-full">
      <div className="px-6 py-6 border-b border-[#222]">
        <p className="text-xs tracking-widest text-[#888] uppercase mb-1">PrimeBind</p>
        <p className="text-white font-semibold text-sm">Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {standalone.map((item) => (
          <NavLink key={item.href} {...item} active={pathname === item.href} />
        ))}

        <div className="pt-2 space-y-1">
          {groups.map((group) => (
            <div key={group.label}>
              <button
                onClick={() => setOpen((prev) => ({ ...prev, [group.label]: !prev[group.label] }))}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#555] hover:text-[#888] transition-colors"
              >
                {group.label}
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${open[group.label] ? "rotate-0" : "-rotate-90"}`}
                />
              </button>
              {open[group.label] && (
                <div className="space-y-0.5 mt-0.5">
                  {group.items.map((item) => (
                    <NavLink key={item.href} {...item} active={pathname === item.href} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-[#222] space-y-2">
        <div className="flex gap-2">
          <button
            onClick={push}
            disabled={syncStatus === "pushing" || syncStatus === "pulling"}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs text-[#888] border border-[#333] hover:border-[#555] hover:text-white transition-colors disabled:opacity-40"
          >
            <CloudUpload size={12} />
            {syncStatus === "pushing" ? "Saving…" : "Save"}
          </button>
          <button
            onClick={pull}
            disabled={syncStatus === "pushing" || syncStatus === "pulling"}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs text-[#888] border border-[#333] hover:border-[#555] hover:text-white transition-colors disabled:opacity-40"
          >
            <CloudDownload size={12} />
            {syncStatus === "pulling" ? "Merging…" : "Merge"}
          </button>
        </div>
        {syncMsg && (
          <p className={`text-xs text-center ${syncStatus === "error" ? "text-red-400" : "text-green-400"}`}>
            {syncMsg}
          </p>
        )}
        <p className="text-[#555] text-xs text-center">KS Launch: Sept 1, 2026</p>
      </div>
    </aside>
  );
}
