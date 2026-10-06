"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { onStorageIssue, type StorageIssue } from "@/lib/safeStorage";

type Issue = StorageIssue & { id: string };

export default function StorageIssueBanner() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    return onStorageIssue((issue) => {
      setIssues((prev) => [...prev, { ...issue, id: `${Date.now()}-${Math.random()}` }]);
    });
  }, []);

  function dismiss(id: string) {
    setIssues((prev) => prev.filter((i) => i.id !== id));
  }

  if (issues.length === 0) return null;

  return (
    <div className="fixed top-3 inset-x-0 z-[200] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="pointer-events-auto w-full max-w-xl bg-yellow-950 border border-yellow-800 text-yellow-200 text-xs rounded-lg px-4 py-3 flex items-start gap-2.5 shadow-2xl"
        >
          <AlertTriangle size={14} className="shrink-0 mt-0.5 text-yellow-400" />
          <div className="flex-1 leading-relaxed">
            {issue.type === "parse-error" && (
              <p>
                Saved data for <span className="font-mono text-yellow-100">{issue.key}</span> couldn&apos;t be read back — it looks
                corrupted. Nothing was deleted: the unreadable copy was kept at{" "}
                <span className="font-mono text-yellow-100">{issue.backupKey}</span>. This section now shows empty/default data. Use
                &quot;Export Backup&quot; / &quot;Import Backup&quot; in the sidebar if you need to recover anything.
              </p>
            )}
            {issue.type === "write-error" && (
              <p>
                Your last change to <span className="font-mono text-yellow-100">{issue.key}</span> could not be saved — browser storage
                may be full. It will look fine until you reload, then it may revert. Export a backup soon and consider removing old data.
              </p>
            )}
            {issue.type === "read-error" && (
              <p>
                Couldn&apos;t access saved data for <span className="font-mono text-yellow-100">{issue.key}</span> — browser storage may
                be disabled (e.g. private browsing).
              </p>
            )}
          </div>
          <button onClick={() => dismiss(issue.id)} className="shrink-0 text-yellow-500 hover:text-white transition-colors">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
