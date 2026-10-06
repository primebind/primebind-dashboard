// Safe wrapper around localStorage for this app.
//
// Every page in this dashboard stores its data as JSON under a `pb_*`
// localStorage key, previously via raw `localStorage.getItem` + `JSON.parse`
// and `localStorage.setItem` + `JSON.stringify` with zero error handling.
// If a stored value is ever even slightly malformed (a partial write from a
// browser hiccup, hitting localStorage's per-origin quota, etc.) raw
// `JSON.parse` throws, the page's load effect silently fails, and the user
// sees an empty page with no indication their data is gone.
//
// `loadJSON` / `saveJSON` below are drop-in replacements for those call
// sites that:
//   - never throw / crash the page
//   - never silently discard corrupted data — the raw string is preserved
//     under a `<key>__corrupted_backup_<timestamp>` key for manual recovery
//   - log a clear console.error describing what happened
//   - broadcast a `pb:storage-issue` event so a UI banner can tell the user
//     (see components/StorageIssueBanner.tsx)

export type StorageIssue =
  | { type: "parse-error"; key: string; backupKey: string }
  | { type: "read-error"; key: string }
  | { type: "write-error"; key: string; approxBytes: number };

const ISSUE_EVENT = "pb:storage-issue";

function emitIssue(issue: StorageIssue) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(ISSUE_EVENT, { detail: issue }));
  } catch {
    // CustomEvent should always be available in browsers we support; ignore if not.
  }
}

/**
 * Subscribe to storage read/write problems app-wide (used by the global
 * corruption/quota banner). Returns an unsubscribe function.
 */
export function onStorageIssue(handler: (issue: StorageIssue) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<StorageIssue>).detail);
  window.addEventListener(ISSUE_EVENT, listener);
  return () => window.removeEventListener(ISSUE_EVENT, listener);
}

/**
 * Reads and JSON-parses `key` from localStorage.
 *
 * Returns `fallback` if the key is missing, if localStorage itself is
 * unavailable (e.g. private browsing / storage disabled), or if the stored
 * value can't be parsed as JSON. On a parse failure, the raw corrupted
 * string is copied to a `<key>__corrupted_backup_<timestamp>` key first —
 * it is never destroyed, only the app falls back to `fallback` so it keeps
 * working.
 */
export function loadJSON<T>(key: string, fallback: T): T {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch (err) {
    console.error(
      `[safeStorage] localStorage.getItem("${key}") threw — storage may be disabled or unavailable (e.g. private browsing). Using the default value instead.`,
      err
    );
    emitIssue({ type: "read-error", key });
    return fallback;
  }

  if (raw === null) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    const backupKey = `${key}__corrupted_backup_${Date.now()}`;
    try {
      localStorage.setItem(backupKey, raw);
    } catch (backupErr) {
      console.error(
        `[safeStorage] localStorage["${key}"] is corrupted AND could not be backed up to "${backupKey}" (storage may be full). The corrupted value was left in place at "${key}".`,
        backupErr
      );
    }
    console.error(
      `[safeStorage] localStorage["${key}"] could not be parsed as JSON — the saved data looks corrupted or was partially written. ` +
        `The raw, unreadable value has been preserved at localStorage["${backupKey}"] in case it needs to be recovered manually. ` +
        `The app will continue using an empty/default value for "${key}" instead of crashing.`,
      err
    );
    emitIssue({ type: "parse-error", key, backupKey });
    return fallback;
  }
}

/**
 * JSON-stringifies `value` and writes it to localStorage["key"].
 *
 * Returns `true` on success, `false` on failure (e.g. a QuotaExceededError
 * when the per-origin storage limit is hit). On failure, the caller's
 * in-memory React state has typically already updated, so the current
 * session's UI looks fine — but the write to disk did NOT happen, meaning
 * the change will silently revert on the next reload unless the user is
 * told. This logs clearly and emits a `pb:storage-issue` event so a banner
 * can surface that.
 */
export function saveJSON(key: string, value: unknown): boolean {
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch (err) {
    console.error(`[safeStorage] JSON.stringify failed for localStorage["${key}"] — write aborted, nothing was saved.`, err);
    return false;
  }

  try {
    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    const approxKB = (serialized.length / 1024).toFixed(1);
    console.error(
      `[safeStorage] localStorage.setItem("${key}") failed while writing ~${approxKB}KB (likely QuotaExceededError — ` +
        `total localStorage usage may be near the browser's per-origin limit, typically 5-10MB). ` +
        `This change was NOT saved to disk and will be lost on reload.`,
      err
    );
    emitIssue({ type: "write-error", key, approxBytes: serialized.length });
    return false;
  }
}

/**
 * Directly writes a pre-serialized (already-JSON) string to localStorage["key"],
 * bypassing JSON.stringify. Used by the backup/restore feature, which stores
 * and restores raw string values as-is. Returns true on success.
 */
export function setRawItem(key: string, rawValue: string): boolean {
  try {
    localStorage.setItem(key, rawValue);
    return true;
  } catch (err) {
    console.error(`[safeStorage] localStorage.setItem("${key}") failed during restore (likely QuotaExceededError).`, err);
    emitIssue({ type: "write-error", key, approxBytes: rawValue.length });
    return false;
  }
}

/**
 * Sum of key.length + value.length (UTF-16 code units) across every
 * localStorage entry for this origin — a close approximation of actual
 * browser storage usage in bytes, since localStorage strings are UTF-16.
 */
export function getLocalStorageUsageBytes(): number {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k === null) continue;
      total += k.length;
      const v = localStorage.getItem(k);
      if (v) total += v.length;
    }
  } catch (err) {
    console.error("[safeStorage] Failed to compute localStorage usage.", err);
  }
  return total;
}

/**
 * All `pb_`-prefixed keys currently in localStorage, as raw (already
 * JSON-serialized) strings — the shape used by the Export/Import Backup
 * feature and the existing cloud-sync button in the sidebar.
 */
export function getAllPbRaw(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("pb_")) {
        const v = localStorage.getItem(k);
        if (v !== null) out[k] = v;
      }
    }
  } catch (err) {
    console.error("[safeStorage] Failed to enumerate localStorage for backup export.", err);
  }
  return out;
}

/**
 * Overwrites localStorage for each key/value pair given (raw, pre-serialized
 * JSON strings, as produced by getAllPbRaw / a backup file). Used by Import
 * Backup. Returns the list of keys that failed to write.
 */
export function restoreAllRaw(data: Record<string, string>): string[] {
  const failed: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (!setRawItem(key, value)) failed.push(key);
  }
  return failed;
}
