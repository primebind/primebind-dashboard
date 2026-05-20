"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BarChart2, Package, DollarSign, Rocket, ClipboardList } from "lucide-react";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/influencers", label: "Influencers", icon: Users },
  { href: "/ads", label: "Ad Performance", icon: BarChart2 },
  { href: "/financials", label: "Financials", icon: DollarSign },
  { href: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
  { href: "/kickstarter", label: "Kickstarter", icon: Rocket },
  { href: "/skus", label: "SKUs", icon: Package },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-[#222] flex flex-col h-full">
      <div className="px-6 py-6 border-b border-[#222]">
        <p className="text-xs tracking-widest text-[#888] uppercase mb-1">PrimeBind</p>
        <p className="text-white font-semibold text-sm">Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-white text-black font-medium"
                  : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-[#222]">
        <p className="text-[#555] text-xs">KS Launch: Sept 1, 2026</p>
      </div>
    </aside>
  );
}
