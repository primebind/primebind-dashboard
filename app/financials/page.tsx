"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2 } from "lucide-react";

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  bank: string;
};

const CATEGORIES = ["Advertising", "Manufacturing", "Shipping", "Software", "Design", "Photography", "Contractor", "KS/BackerKit Fees", "Revenue", "Other"];

export default function Financials() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const saved = localStorage.getItem("pb_financials");
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  function save(updated: Transaction[]) {
    setTransactions(updated);
    localStorage.setItem("pb_financials", JSON.stringify(updated));
  }

  function remove(id: string) { save(transactions.filter((t) => t.id !== id)); }

  function updateCategory(id: string, category: string) {
    save(transactions.map((t) => t.id === id ? { ...t, category } : t));
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const bank = file.name.toLowerCase().includes("chase") ? "Chase" : "US Bank";
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      const parsed: Transaction[] = [];
      for (const line of lines.slice(1)) {
        const cols = line.split(",").map((c) => c.replace(/"/g, "").trim());
        if (cols.length < 3) continue;
        const date = cols[0];
        const description = cols[1] || cols[2] || "";
        const amountRaw = cols.find((c) => !isNaN(+c) && c !== "") || "0";
        const amount = parseFloat(amountRaw);
        if (!date || isNaN(amount)) continue;
        parsed.push({ id: `${Date.now()}-${Math.random()}`, date, description, amount, category: "Other", bank });
      }
      save([...transactions, ...parsed]);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const filtered = filter === "All" ? transactions : transactions.filter((t) => t.category === filter);
  const totalIn = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = totalIn - totalOut;

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    total: transactions.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0),
  })).filter((c) => c.total !== 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financials</h1>
          <p className="text-[#888] text-sm mt-1">Upload CSV from US Bank or Chase</p>
        </div>
        <label className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition-colors cursor-pointer">
          <Upload size={16} />
          Import CSV
          <input type="file" accept=".csv" className="hidden" onChange={handleCSV} />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Money In</p>
          <p className="text-3xl font-bold text-green-400">${totalIn.toLocaleString()}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Money Out</p>
          <p className="text-3xl font-bold text-red-400">${totalOut.toLocaleString()}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Net</p>
          <p className={`text-3xl font-bold ${net >= 0 ? "text-white" : "text-red-400"}`}>${net.toLocaleString()}</p>
        </div>
      </div>

      {byCategory.length > 0 && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">By Category</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {byCategory.map(({ cat, total }) => (
              <div key={cat} className="bg-[#1a1a1a] rounded-lg px-3 py-3">
                <p className="text-[#555] text-xs">{cat}</p>
                <p className={`text-sm font-semibold mt-1 ${total >= 0 ? "text-white" : "text-red-400"}`}>
                  {total < 0 ? "-" : ""}${Math.abs(total).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filter === cat ? "bg-white text-black font-medium" : "bg-[#1a1a1a] text-[#888] hover:text-white"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#555] text-sm">
            {transactions.length === 0 ? "No transactions yet. Import a CSV from your bank." : "No transactions in this category."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                {["Date", "Description", "Amount", "Category", "Bank", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a, b) => b.date.localeCompare(a.date)).map((t) => (
                <tr key={t.id} className="border-b border-[#1a1a1a] hover:bg-[#151515]">
                  <td className="px-5 py-3 text-[#888] text-xs">{t.date}</td>
                  <td className="px-5 py-3 text-white max-w-[220px] truncate">{t.description}</td>
                  <td className={`px-5 py-3 font-medium ${t.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {t.amount >= 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={t.category}
                      onChange={(e) => updateCategory(t.id, e.target.value)}
                      className="bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#555]"
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-[#555] text-xs">{t.bank}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => remove(t.id)} className="text-[#444] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
