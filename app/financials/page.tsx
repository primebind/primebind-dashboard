"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Upload, Trash2, ChevronRight, ChevronDown, Link, Unlink } from "lucide-react";

type Account = { number: string; name: string; type: string };

const CHART: Account[] = [
  { number: "11000", name: "Accounts Receivable", type: "Accounts Receivable" },
  { number: "12000", name: "Prepaid Expense", type: "Other Current Asset" },
  { number: "12001", name: "Health Insurance Prepayment", type: "Other Current Asset" },
  { number: "12002", name: "Internet Subscriptions Prepaid", type: "Other Current Asset" },
  { number: "12003", name: "Prepaid Rent Expense", type: "Other Current Asset" },
  { number: "12004", name: "Prepaid Expense", type: "Other Current Asset" },
  { number: "12100", name: "Undeposited Funds", type: "Other Current Asset" },
  { number: "12101", name: "Shopify Clearing Account", type: "Other Current Asset" },
  { number: "12200", name: "Inventory", type: "Other Current Asset" },
  { number: "12201", name: "Sample Inventory", type: "Other Current Asset" },
  { number: "12202", name: "Unreceived Inventory", type: "Other Current Asset" },
  { number: "12203", name: "Inventory Asset", type: "Other Current Asset" },
  { number: "12204", name: "Unreceived Inventory - Landed Costs", type: "Other Current Asset" },
  { number: "12205", name: "Unreceived Inventory - Component Parts", type: "Other Current Asset" },
  { number: "12206", name: "Inventory Asset - Warranty Inventory", type: "Other Current Asset" },
  { number: "12250", name: "Inventory Prepayment", type: "Other Current Asset" },
  { number: "13000", name: "Web Development Asset", type: "Fixed Asset" },
  { number: "14000", name: "Leasehold Improvements", type: "Fixed Asset" },
  { number: "15100", name: "Security Deposit", type: "Fixed Asset" },
  { number: "15101", name: "Security Deposits", type: "Other Asset" },
  { number: "16000", name: "Fixed Assets", type: "Fixed Asset" },
  { number: "16001", name: "Accumulated Depreciation - Fixed Assets", type: "Fixed Asset" },
  { number: "20000", name: "Accounts Payable", type: "Accounts Payable" },
  { number: "20001", name: "Accounts Payable (A/P)", type: "Accounts Payable" },
  { number: "20002", name: "A/P - Unreceived POs", type: "Accounts Payable" },
  { number: "22001", name: "Accrued Contractor Payments", type: "Other Current Liability" },
  { number: "22002", name: "Accrued Interest Payable", type: "Other Current Liability" },
  { number: "22003", name: "Accrued Payroll", type: "Other Current Liability" },
  { number: "22004", name: "Accrued PTO", type: "Other Current Liability" },
  { number: "22007", name: "Accrued Purchases", type: "Other Current Liability" },
  { number: "22008", name: "Refunds Payable", type: "Other Current Liability" },
  { number: "26000", name: "Payroll Liabilities", type: "Other Current Liability" },
  { number: "33000", name: "Owner's Investment", type: "Equity" },
  { number: "34000", name: "Owner's Pay & Personal Expenses", type: "Equity" },
  { number: "35000", name: "Partner Contributions", type: "Equity" },
  { number: "36000", name: "Retained Earnings", type: "Equity" },
  { number: "40000", name: "Income", type: "Income" },
  { number: "40001", name: "Sales Refunds", type: "Income" },
  { number: "41001", name: "Amazon Gift Wrap Credits", type: "Income" },
  { number: "41002", name: "Amazon Other Credits", type: "Income" },
  { number: "41003", name: "Amazon Promotional Rebates", type: "Income" },
  { number: "41004", name: "Amazon Refunds", type: "Income" },
  { number: "41005", name: "Amazon Sales", type: "Income" },
  { number: "41006", name: "Amazon Shipping Credits", type: "Income" },
  { number: "41007", name: "Amazon Shipping", type: "Income" },
  { number: "42000", name: "Ebay Sales", type: "Income" },
  { number: "43000", name: "Etsy Sales", type: "Income" },
  { number: "44000", name: "Shopify Income", type: "Income" },
  { number: "44001", name: "Shopify Sales", type: "Income" },
  { number: "44002", name: "Shopify Discounts", type: "Income" },
  { number: "44003", name: "Shopify Refunds", type: "Income" },
  { number: "44004", name: "Shopify Shipping", type: "Income" },
  { number: "45000", name: "Grant Income", type: "Income" },
  { number: "46001", name: "Credit Card Credit", type: "Income" },
  { number: "46002", name: "Credit Card Point Income", type: "Income" },
  { number: "47000", name: "Unapplied Cash Payment Income", type: "Income" },
  { number: "48000", name: "Uncategorized Income", type: "Income" },
  { number: "49000", name: "Wholesale Sales", type: "Income" },
  { number: "50000", name: "Cost of Goods Sold", type: "Cost of Goods Sold" },
  { number: "50001", name: "COGS Control - Shipping", type: "Cost of Goods Sold" },
  { number: "50002", name: "COGS - Duties and Taxes", type: "Cost of Goods Sold" },
  { number: "50003", name: "COGS - Boxes", type: "Cost of Goods Sold" },
  { number: "50004", name: "COGS - Refunds", type: "Cost of Goods Sold" },
  { number: "50005", name: "COGS - Warranties", type: "Cost of Goods Sold" },
  { number: "51000", name: "Amazon COGS", type: "Cost of Goods Sold" },
  { number: "51001", name: "Amazon Shipping Expense", type: "Cost of Goods Sold" },
  { number: "51002", name: "Cost of Goods Sold - Amazon", type: "Cost of Goods Sold" },
  { number: "51003", name: "Amazon COGS - Shipping", type: "Cost of Goods Sold" },
  { number: "51004", name: "Amazon COGS - Duties and Taxes", type: "Cost of Goods Sold" },
  { number: "52000", name: "Ebay COGS", type: "Cost of Goods Sold" },
  { number: "52001", name: "Cost of Goods Sold - Ebay", type: "Cost of Goods Sold" },
  { number: "52002", name: "Ebay COGS - Shipping", type: "Cost of Goods Sold" },
  { number: "52003", name: "Ebay COGS - Duties and Taxes", type: "Cost of Goods Sold" },
  { number: "53000", name: "Shopify COGS", type: "Cost of Goods Sold" },
  { number: "53001", name: "Cost of Goods Sold - Online", type: "Cost of Goods Sold" },
  { number: "53002", name: "Shopify COGS - Shipping", type: "Cost of Goods Sold" },
  { number: "53003", name: "Shopify COGS - Duties and Taxes", type: "Cost of Goods Sold" },
  { number: "53004", name: "Payment Processing Fees", type: "Cost of Goods Sold" },
  { number: "53005", name: "Shopify Deposit Variance/Refunds", type: "Cost of Goods Sold" },
  { number: "54000", name: "Inventory Shrinkage", type: "Cost of Goods Sold" },
  { number: "55000", name: "Referral Fees", type: "Cost of Goods Sold" },
  { number: "56000", name: "International Sales", type: "Cost of Goods Sold" },
  { number: "60100", name: "Bad Debt Expense", type: "Expense" },
  { number: "61000", name: "Advertising & Marketing", type: "Expense" },
  { number: "61100", name: "Ads & Marketing Management", type: "Expense" },
  { number: "61200", name: "Affiliate Marketing Expense", type: "Expense" },
  { number: "61300", name: "Amazon Advertising", type: "Expense" },
  { number: "61400", name: "Conversion Rate Optimization", type: "Expense" },
  { number: "61500", name: "Email Marketing Expense", type: "Expense" },
  { number: "61600", name: "Influencer Marketing Expense", type: "Expense" },
  { number: "61700", name: "Internet Subscriptions - Mktng", type: "Expense" },
  { number: "61800", name: "Marketing Management Expense", type: "Expense" },
  { number: "61900", name: "Other Marketing Expense", type: "Expense" },
  { number: "62000", name: "Payroll Expenses - Marketing", type: "Expense" },
  { number: "62002", name: "Marketing Bonus", type: "Expense" },
  { number: "62003", name: "Payroll Taxes - Marketing", type: "Expense" },
  { number: "62005", name: "Wages - Marketing", type: "Expense" },
  { number: "62006", name: "Worker's Comp Ins - Marketing", type: "Expense" },
  { number: "62100", name: "Photography Props and Equipment", type: "Expense" },
  { number: "62200", name: "Podcasting Supplies Expense", type: "Expense" },
  { number: "62300", name: "Promotional Content", type: "Expense" },
  { number: "62400", name: "Publishing/Articles Expense", type: "Expense" },
  { number: "62500", name: "Search Engine Marketing Expense", type: "Expense" },
  { number: "62600", name: "SMS Marketing Expense", type: "Expense" },
  { number: "62700", name: "Social Marketing Expense", type: "Expense" },
  { number: "62800", name: "Video Editing", type: "Expense" },
  { number: "62900", name: "Web Development Expense", type: "Expense" },
  { number: "70000", name: "Operating Expenses", type: "Expense" },
  { number: "71100", name: "Bookkeeping & Reporting Expense", type: "Expense" },
  { number: "71200", name: "Ebay Selling Fees", type: "Expense" },
  { number: "71300", name: "Amazon Selling Expenses", type: "Expense" },
  { number: "71301", name: "Amazon Management Expense", type: "Expense" },
  { number: "71302", name: "Amazon Selling Fees", type: "Expense" },
  { number: "71400", name: "Bank Charges & Fees", type: "Expense" },
  { number: "71401", name: "Finance Charge", type: "Expense" },
  { number: "71500", name: "Business Management Services", type: "Expense" },
  { number: "71600", name: "Car & Truck", type: "Expense" },
  { number: "71700", name: "Charitable Contributions", type: "Expense" },
  { number: "71800", name: "Dues & Subscriptions", type: "Expense" },
  { number: "71900", name: "Education Expense", type: "Expense" },
  { number: "72000", name: "Internet Subscriptions Expenses", type: "Expense" },
  { number: "72100", name: "Electronics & Equipment Expense", type: "Expense" },
  { number: "72200", name: "Insurance", type: "Expense" },
  { number: "72300", name: "Interest Paid", type: "Expense" },
  { number: "72400", name: "Inventory Purchases", type: "Expense" },
  { number: "72500", name: "Job Supplies", type: "Expense" },
  { number: "72600", name: "Legal & Professional Services", type: "Expense" },
  { number: "72601", name: "Accounting", type: "Expense" },
  { number: "72602", name: "Legal Fees", type: "Expense" },
  { number: "72700", name: "Meals & Entertainment", type: "Expense" },
  { number: "72800", name: "Payroll Expenses - Operations", type: "Expense" },
  { number: "72801", name: "401K Match Expense - Operations", type: "Expense" },
  { number: "72802", name: "Employee Health Insurance - Ops", type: "Expense" },
  { number: "72803", name: "Ops Bonus", type: "Expense" },
  { number: "72804", name: "Payroll Taxes - Operations", type: "Expense" },
  { number: "72805", name: "Wages - Operations", type: "Expense" },
  { number: "72806", name: "Workers' Comp Insurance - Ops", type: "Expense" },
  { number: "72900", name: "Payroll Expenses", type: "Expense" },
  { number: "72901", name: "Employee Health Insurance", type: "Expense" },
  { number: "72902", name: "Other", type: "Expense" },
  { number: "72905", name: "Taxes", type: "Expense" },
  { number: "72907", name: "Wages", type: "Expense" },
  { number: "72908", name: "Worker's Compensation Insurance", type: "Expense" },
  { number: "72909", name: "Salaries & Wages", type: "Expense" },
  { number: "72910", name: "Employee Benefits", type: "Expense" },
  { number: "72911", name: "Contractors", type: "Expense" },
  { number: "72912", name: "Health Insurance", type: "Expense" },
  { number: "72913", name: "Bonus", type: "Expense" },
  { number: "72914", name: "401K Match Expense", type: "Expense" },
  { number: "72915", name: "Employee Distribution", type: "Expense" },
  { number: "72916", name: "Employee Distribution - Taxes", type: "Expense" },
  { number: "73000", name: "Management Expense", type: "Expense" },
  { number: "73100", name: "Office Supplies & Software", type: "Expense" },
  { number: "73200", name: "Office Upgrades and Products", type: "Expense" },
  { number: "73300", name: "Other Business Expenses", type: "Expense" },
  { number: "73400", name: "Printing Expense", type: "Expense" },
  { number: "73500", name: "Product Design Expense", type: "Expense" },
  { number: "73600", name: "Reconciliation Discrepancies", type: "Expense" },
  { number: "73700", name: "Reimbursable Expenses", type: "Expense" },
  { number: "73800", name: "Rent & Lease", type: "Expense" },
  { number: "73801", name: "Leasehold Improvement Expense", type: "Expense" },
  { number: "73900", name: "Repairs & Maintenance", type: "Expense" },
  { number: "74000", name: "Shipping", type: "Expense" },
  { number: "74101", name: "Shipping, Freight & Delivery", type: "Expense" },
  { number: "74102", name: "Influencer - Shipping", type: "Expense" },
  { number: "74103", name: "Tariffs & Import Duties", type: "Expense" },
  { number: "74200", name: "Storage Fees", type: "Expense" },
  { number: "74300", name: "Supplier and Other Gifts", type: "Expense" },
  { number: "74400", name: "Taxes & Licenses", type: "Expense" },
  { number: "74401", name: "City/County Taxes", type: "Expense" },
  { number: "74402", name: "Sales Taxes", type: "Expense" },
  { number: "74500", name: "Technology Expense", type: "Expense" },
  { number: "74600", name: "Travel", type: "Expense" },
  { number: "74700", name: "Uncategorized Expense", type: "Expense" },
  { number: "74800", name: "Utilities", type: "Expense" },
  { number: "74900", name: "Warehouse Supplies", type: "Expense" },
  { number: "75000", name: "Business Consulting", type: "Expense" },
  { number: "75100", name: "Legal Settlement Expense", type: "Expense" },
  { number: "75200", name: "Systems Implementation Expense", type: "Expense" },
  { number: "79000", name: "Depreciation", type: "Expense" },
  { number: "81000", name: "Debt Forgiveness Income", type: "Other Income" },
  { number: "81100", name: "ERC Income", type: "Other Income" },
  { number: "81200", name: "Interest Earned", type: "Other Income" },
  { number: "82000", name: "Asset Write-Off Loss", type: "Other Expense" },
];

function accountByNumber(num: string): Account | undefined {
  return CHART.find((a) => a.number === num);
}

const TYPE_FILTERS = ["All", "Income", "COGS", "Expense", "Equity", "Asset", "Liability"];

function matchesFilter(account: string, filter: string): boolean {
  if (filter === "All") return true;
  const acct = accountByNumber(account);
  if (!acct) return filter === "All";
  const t = acct.type;
  if (filter === "Income") return t === "Income" || t === "Other Income";
  if (filter === "COGS") return t === "Cost of Goods Sold";
  if (filter === "Expense") return t === "Expense" || t === "Other Expense";
  if (filter === "Equity") return t === "Equity";
  if (filter === "Asset") return t.includes("Asset") || t === "Accounts Receivable";
  if (filter === "Liability") return t.includes("Liability") || t === "Accounts Payable";
  return true;
}

function AccountInput({ value, onChange }: { value: string; onChange: (num: string) => void }) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const acct = accountByNumber(value);
  const displayLabel = acct ? `${acct.number} — ${acct.name}` : value || "— unassigned";

  const suggestions =
    input.length >= 3
      ? CHART.filter(
          (a) =>
            a.number.startsWith(input) ||
            a.name.toLowerCase().includes(input.toLowerCase())
        ).slice(0, 10)
      : [];

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      {open ? (
        <input
          autoFocus
          className="w-52 bg-[#1a1a1a] border border-[#555] rounded px-2 py-1 text-xs text-white focus:outline-none placeholder-[#555]"
          placeholder="Type account # or name…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      ) : (
        <button
          onClick={() => { setInput(""); setOpen(true); }}
          className={`text-left text-xs px-2 py-1 rounded transition-colors hover:bg-[#2a2a2a] ${value ? "text-white" : "text-[#444] italic"}`}
        >
          {displayLabel}
        </button>
      )}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-80 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl max-h-52 overflow-y-auto">
          {suggestions.map((a) => (
            <button
              key={a.number}
              className="w-full text-left px-3 py-2 text-xs hover:bg-[#2a2a2a] transition-colors flex items-baseline gap-2"
              onMouseDown={() => {
                onChange(a.number);
                setOpen(false);
              }}
            >
              <span className="text-white font-mono shrink-0">{a.number}</span>
              <span className="text-[#888] truncate">{a.name}</span>
              <span className="text-[#444] ml-auto shrink-0">{a.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type TransactionLine = { description: string; amount: number; account: string };
type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  account: string;
  bank: string;
  lines?: TransactionLine[];
  matchedPoId?: string;
};
type PoSummary = { id: string; poNum: string; vendorName: string; total: number; balance: number; items: { description: string; qty: number; unitCost: number; account: string }[] };

const ACCOUNT_TYPE_GROUPS = [
  "Accounts Receivable",
  "Other Current Asset",
  "Fixed Asset",
  "Other Asset",
  "Accounts Payable",
  "Other Current Liability",
  "Equity",
  "Income",
  "Cost of Goods Sold",
  "Expense",
  "Other Income",
  "Other Expense",
];

export default function Financials() {
  const [tab, setTab] = useState<"transactions" | "accounts">("transactions");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("All");
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(null);
  const [matchingTxnId, setMatchingTxnId] = useState<string | null>(null);
  const [poList, setPoList] = useState<PoSummary[]>([]);

  useEffect(() => {
    const savedPos = localStorage.getItem("pb_pos");
    if (savedPos) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed: any[] = JSON.parse(savedPos);
      setPoList(parsed.map((p, idx) => {
        const total = (p.items || []).reduce((s: number, i: { qty: number; unitCost: number }) => s + i.qty * i.unitCost, 0);
        const paid = (p.payments || []).reduce((s: number, pay: { amount: number }) => s + pay.amount, 0);
        return { id: p.id, poNum: `PO-${String(idx + 1).padStart(3, "0")}`, vendorName: p.vendorName || "—", total, balance: total - paid, items: p.items || [] };
      }));
    }
    const saved = localStorage.getItem("pb_financials");
    if (saved) {
      const parsed = JSON.parse(saved);
      // migrate old category field to account
      setTransactions(parsed.map((t: Transaction & { category?: string }) => ({
        ...t,
        account: t.account || "",
      })));
    }
  }, []);

  function save(updated: Transaction[]) {
    setTransactions(updated);
    localStorage.setItem("pb_financials", JSON.stringify(updated));
  }

  function remove(id: string) { save(transactions.filter((t) => t.id !== id)); }

  function updateAccount(id: string, account: string) {
    save(transactions.map((t) => (t.id === id ? { ...t, account } : t)));
  }

  function matchToPO(txnId: string, po: PoSummary) {
    save(transactions.map((t) => t.id === txnId ? { ...t, matchedPoId: po.id, account: "" } : t));
    setMatchingTxnId(null);
  }

  function unmatchPO(txnId: string) {
    save(transactions.map((t) => t.id === txnId ? { ...t, matchedPoId: undefined } : t));
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
        parsed.push({ id: `${Date.now()}-${Math.random()}`, date, description, amount, account: "", bank });
      }
      save([...transactions, ...parsed]);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const filtered = transactions.filter((t) => {
    if (filter === "All") return true;
    if (t.lines) return t.lines.some((l) => matchesFilter(l.account, filter));
    return matchesFilter(t.account, filter);
  });
  const totalIn = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = totalIn - totalOut;

  const byAccount = Array.from(
    transactions.reduce((map, t) => {
      if (t.lines) {
        t.lines.forEach((l) => {
          const key = l.account || "__unassigned";
          map.set(key, (map.get(key) || 0) + l.amount);
        });
      } else {
        const key = t.account || "__unassigned";
        map.set(key, (map.get(key) || 0) + t.amount);
      }
      return map;
    }, new Map<string, number>())
  )
    .map(([num, total]) => {
      const acct = accountByNumber(num);
      return { num, name: acct?.name ?? "Unassigned", total };
    })
    .filter((a) => a.total !== 0)
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#222]">
        {(["transactions", "accounts"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? "border-white text-white" : "border-transparent text-[#555] hover:text-[#888]"
            }`}
          >
            {t === "accounts" ? "Chart of Accounts" : "Transactions"}
          </button>
        ))}
      </div>

      {tab === "transactions" && (
        <>
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
              <p className={`text-3xl font-bold ${net >= 0 ? "text-white" : "text-red-400"}`}>
                ${net.toLocaleString()}
              </p>
            </div>
          </div>

          {byAccount.length > 0 && (
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">By Account</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {byAccount.map(({ num, name, total }) => (
                  <div key={num} className="bg-[#1a1a1a] rounded-lg px-3 py-3">
                    <p className="text-[#444] text-[10px] font-mono">{num}</p>
                    <p className="text-[#666] text-xs truncate">{name}</p>
                    <p className={`text-sm font-semibold mt-1 ${total >= 0 ? "text-white" : "text-red-400"}`}>
                      {total < 0 ? "-" : ""}${Math.abs(total).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  filter === f ? "bg-white text-black font-medium" : "bg-[#1a1a1a] text-[#888] hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="bg-[#111] border border-[#222] rounded-xl overflow-visible">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-[#555] text-sm">
                {transactions.length === 0
                  ? "No transactions yet. Import a CSV from your bank."
                  : "No transactions in this category."}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-wider">
                    {["Date", "Description", "Amount", "Account", "Bank", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((t) => {
                      const isExpanded = expandedTxnId === t.id;
                      const isSplit = !!t.lines?.length;
                      const matchedPo = t.matchedPoId ? poList.find((p) => p.id === t.matchedPoId) : undefined;
                      const isExpandable = isSplit || !!matchedPo;
                      return (
                        <Fragment key={t.id}>
                          <tr
                            className={`border-b border-[#1a1a1a] hover:bg-[#151515] ${isExpandable ? "cursor-pointer" : ""}`}
                            onClick={isExpandable ? () => setExpandedTxnId(isExpanded ? null : t.id) : undefined}
                          >
                            <td className="px-5 py-3 text-[#888] text-xs">{t.date}</td>
                            <td className="px-5 py-3 max-w-[220px]">
                              <div className="flex items-center gap-2">
                                {isExpandable && (isExpanded ? <ChevronDown size={11} className="text-[#555] shrink-0" /> : <ChevronRight size={11} className="text-[#555] shrink-0" />)}
                                <span className="text-white truncate">{t.description}</span>
                                {isSplit && <span className="text-[10px] text-[#555] bg-[#1a1a1a] px-1.5 py-0.5 rounded shrink-0">{t.lines!.length} lines</span>}
                                {matchedPo && <span className="text-[10px] text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded shrink-0">{matchedPo.items.length} lines</span>}
                              </div>
                            </td>
                            <td className={`px-5 py-3 font-medium ${t.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {t.amount >= 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                            </td>
                            <td className="px-5 py-3 relative" onClick={(e) => e.stopPropagation()}>
                              {t.matchedPoId ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs bg-purple-950 text-purple-400 px-2 py-0.5 rounded-full font-medium">
                                    {poList.find((p) => p.id === t.matchedPoId)?.poNum ?? "PO"} · {poList.find((p) => p.id === t.matchedPoId)?.vendorName ?? "—"}
                                  </span>
                                  <button onClick={() => unmatchPO(t.id)} className="text-[#444] hover:text-[#888]"><Unlink size={11} /></button>
                                </div>
                              ) : isSplit ? (
                                <span className="text-[#333] text-xs italic">— split</span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <AccountInput value={t.account} onChange={(num) => updateAccount(t.id, num)} />
                                  {poList.length > 0 && (
                                    <button
                                      onClick={() => setMatchingTxnId(matchingTxnId === t.id ? null : t.id)}
                                      className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-colors ${matchingTxnId === t.id ? "bg-purple-950 text-purple-400" : "text-[#444] hover:text-[#888]"}`}
                                    >
                                      <Link size={10} /> PO
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3 text-[#555] text-xs">{t.bank}</td>
                            <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => remove(t.id)} className="text-[#444] hover:text-red-500 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                          {isSplit && isExpanded && (
                            <tr className="border-b border-[#1a1a1a]">
                              <td colSpan={6} className="px-10 py-3 bg-[#0d0d0d]">
                                <div className="space-y-1.5">
                                  {t.lines!.map((line, i) => (
                                    <div key={i} className="flex items-center gap-4 text-xs">
                                      <span className="text-white flex-1">{line.description}</span>
                                      <span className={`font-medium shrink-0 ${line.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        ${Math.abs(line.amount).toFixed(2)}
                                      </span>
                                      <span className="text-[#555] w-48 text-right shrink-0">
                                        {CHART.find((a) => a.number === line.account)?.name || line.account || "—"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}

                          {matchedPo && isExpanded && (
                            <tr className="border-b border-[#1a1a1a]">
                              <td colSpan={6} className="px-10 py-3 bg-[#0d0d0d]">
                                <p className="text-[10px] text-purple-400 uppercase tracking-wider mb-2">{matchedPo.poNum} · {matchedPo.vendorName}</p>
                                <div className="space-y-1.5">
                                  {matchedPo.items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 text-xs">
                                      <span className="text-white flex-1">{item.description}</span>
                                      <span className="text-[#555] shrink-0">{item.qty} × ${item.unitCost.toLocaleString()}</span>
                                      <span className="text-red-400 font-medium shrink-0">${(item.qty * item.unitCost).toLocaleString()}</span>
                                      <span className="text-[#555] w-48 text-right shrink-0">
                                        {CHART.find((a) => a.number === item.account)?.name || item.account || "—"}
                                      </span>
                                    </div>
                                  ))}
                                  <div className="flex justify-end pt-1.5 border-t border-[#1a1a1a] text-xs">
                                    <span className="text-[#555] mr-3">Total</span>
                                    <span className="text-white font-medium">${matchedPo.total.toLocaleString()}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}

                          {matchingTxnId === t.id && (
                            <tr className="border-b border-[#1a1a1a]">
                              <td colSpan={6} className="px-10 py-3 bg-[#0a0a0a]">
                                <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Match to Purchase Order</p>
                                {(() => {
                                  const close = poList.filter((p) => Math.abs(p.total - Math.abs(t.amount)) / Math.max(Math.abs(t.amount), 1) <= 0.1);
                                  const display = close.length > 0 ? close : poList;
                                  return (
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                      {display.map((po) => (
                                        <div key={po.id} className="flex items-center gap-3 text-xs bg-[#111] border border-[#1a1a1a] rounded-lg px-3 py-2 hover:border-[#333]">
                                          <span className="text-purple-400 font-mono shrink-0">{po.poNum}</span>
                                          <span className="text-white flex-1 truncate">{po.vendorName}</span>
                                          <span className="text-[#555] shrink-0">${po.total.toLocaleString()}</span>
                                          {po.balance > 0 && <span className="text-red-400 text-[10px] shrink-0">bal ${po.balance.toLocaleString()}</span>}
                                          <button onClick={() => matchToPO(t.id, po)} className="bg-white text-black text-[10px] px-2 py-0.5 rounded font-medium hover:bg-[#e0e0e0] shrink-0">
                                            Match
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
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
        </>
      )}

      {tab === "accounts" && (
        <div className="space-y-6">
          {ACCOUNT_TYPE_GROUPS.map((group) => {
            const accounts = CHART.filter((a) => a.type === group);
            if (accounts.length === 0) return null;
            return (
              <div key={group} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-[#222]">
                  <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">{group}</h2>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {accounts.map((a) => (
                      <tr key={a.number} className="border-b border-[#1a1a1a] hover:bg-[#151515]">
                        <td className="px-5 py-2.5 w-24 font-mono text-[#555] text-xs">{a.number}</td>
                        <td className="px-5 py-2.5 text-white text-sm">{a.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
