"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { getAllPbRaw, getLocalStorageUsageBytes, restoreAllRaw } from "@/lib/safeStorage";

const QUOTA_ASSUMPTION_BYTES = 5 * 1024 * 1024; // conservative 5MB/origin assumption
const WARN_RATIO = 0.8;

type BackupFile = { exportedAt: string; version: number; data: Record<string, string> };

export default function BackupPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "error" } | null>(null);
  const [usageBytes, setUsageBytes] = useState<number | null>(null);

  function flash(text: string, tone: "ok" | "error" = "ok") {
    setMsg({ text, tone });
    setTimeout(() => setMsg(null), 4000);
  }

  function checkUsage() {
    setUsageBytes(getLocalStorageUsageBytes());
  }

  function doExport() {
    const data = getAllPbRaw();
    const keyCount = Object.keys(data).length;
    if (keyCount === 0) {
      flash("Nothing to export yet — no saved data found.", "error");
      return;
    }
    const payload: BackupFile = { exportedAt: new Date().toISOString(), version: 1, data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `primebind-dashboard-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    flash(`Exported ${keyCount} section${keyCount === 1 ? "" : "s"}.`);
  }

  function triggerImport() {
    fileRef.current?.click();
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      let parsed: BackupFile;
      try {
        parsed = JSON.parse(text);
      } catch {
        flash("That file isn't valid JSON — couldn't read it as a backup.", "error");
        return;
      }
      const data = parsed?.data;
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        flash("That file doesn't look like a PrimeBind dashboard backup.", "error");
        return;
      }
      const keys = Object.keys(data);
      const confirmed = window.confirm(
        `This will overwrite ${keys.length} saved section${keys.length === 1 ? "" : "s"} in this dashboard with the contents of this ` +
          `backup file (exported ${parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleString() : "at an unknown time"}). ` +
          `Anything currently saved will be replaced and this cannot be undone. Continue?`
      );
      if (!confirmed) return;

      const failed = restoreAllRaw(data);
      if (failed.length > 0) {
        window.alert(
          `Restored, but ${failed.length} item(s) failed to write (storage may be full): ${failed.join(", ")}. ` +
            `The rest were restored successfully. Reloading now.`
        );
      }
      window.location.reload();
    };
    reader.onerror = () => flash("Couldn't read that file.", "error");
    reader.readAsText(file);
  }

  const pct = usageBytes !== null ? Math.round((usageBytes / QUOTA_ASSUMPTION_BYTES) * 100) : null;
  const isHigh = pct !== null && pct >= WARN_RATIO * 100;

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-[#555] px-0.5">Backup</p>
      <div className="flex gap-2">
        <button
          onClick={doExport}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs text-[#888] border border-[#333] hover:border-[#555] hover:text-white transition-colors"
          title="Download all saved dashboard data as a JSON file"
        >
          <Download size={12} />
          Export
        </button>
        <button
          onClick={triggerImport}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs text-[#888] border border-[#333] hover:border-[#555] hover:text-white transition-colors"
          title="Restore saved dashboard data from a backup file"
        >
          <Upload size={12} />
          Import
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFileChosen} />
      </div>

      {msg && <p className={`text-xs text-center ${msg.tone === "error" ? "text-red-400" : "text-green-400"}`}>{msg.text}</p>}

      <button onClick={checkUsage} className="w-full text-[10px] text-[#444] hover:text-[#888] transition-colors text-center">
        {usageBytes === null
          ? "Check storage usage"
          : `${(usageBytes / 1024).toFixed(0)} KB used${pct !== null ? ` (~${pct}% of 5MB)` : ""}`}
      </button>
      {isHigh && (
        <p className="text-[10px] text-yellow-500 text-center leading-snug">
          Storage usage is high — export a backup and consider removing old data.
        </p>
      )}
    </div>
  );
}
