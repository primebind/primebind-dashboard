"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, BarChart2, Package, DollarSign, Rocket, ClipboardList, Inbox, Bell, ChevronDown, Mail, Globe, Lightbulb, Film, TrendingDown, StickyNote } from "lucide-react";
import BackupPanel from "@/components/BackupPanel";

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

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatKsDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export default function Sidebar() {
  const pathname = usePathname();

  const initialOpen = groups.reduce<Record<string, boolean>>((acc, g) => {
    acc[g.label] = g.items.some((item) => item.href === pathname);
    return acc;
  }, {});

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);
  const [ksDate, setKsDate] = useState("2026-10-01");
  const [editingDate, setEditingDate] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pb_ks_launch_date");
    if (saved) setKsDate(saved);
  }, []);

  function saveKsDate(v: string) {
    setKsDate(v);
    localStorage.setItem("pb_ks_launch_date", v);
  }

  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev };
      groups.forEach((g) => {
        if (g.items.some((item) => item.href === pathname)) next[g.label] = true;
      });
      return next;
    });
  }, [pathname]);

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
        {editingDate ? (
          <input
            type="date"
            autoFocus
            className="w-full bg-transparent text-[#888] text-xs text-center border border-[#333] rounded px-1 py-1 focus:outline-none focus:border-[#555]"
            value={ksDate}
            onChange={(e) => saveKsDate(e.target.value)}
            onBlur={() => setEditingDate(false)}
          />
        ) : (
          <button onClick={() => setEditingDate(true)} className="w-full text-[#555] text-xs text-center hover:text-white transition-colors">
            KS Launch: {formatKsDate(ksDate)}
          </button>
        )}

        <div className="pt-2 border-t border-[#222]">
          <BackupPanel />
        </div>
      </div>
    </aside>
  );
}
