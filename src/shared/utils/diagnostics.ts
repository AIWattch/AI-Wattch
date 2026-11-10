import { QueryMetric, UserSettings } from "../types";
import { SETTINGS_KEY } from "../../core/storage/settings";
import { sendToBackground } from "../../core/api/communication";
import { MESSAGE_TYPES } from "../../constants";

const DIAGNOSTICS_KEY = "ai_wattch_diagnostics_v1";

// Keep diagnostics small and bounded: at most this many traces per
// (tab, model) bucket, and at most this many tabs tracked at once (oldest
// tab, by its most recent activity, is evicted first).
const MAX_TRACES_PER_BUCKET = 5;
const MAX_TRACKED_TABS = 10;

export interface DiagnosticTrace {
  traceId: string;
  updatedAt: number;
  platform: string;
  // Which browser tab and which selected model this prompt belongs to.
  // Diagnostics are scoped by both so multiple tabs/models running at once
  // don't interleave into one confusing shared list.
  tabId?: number;
  model?: string;
  inputChars: number;
  outputChars: number;
  inputTokens: number;
  outputTokens: number;
  // Whether the DOM node for the user/assistant turn was actually found by
  // the platform's selectors. Distinct from inputChars/outputChars being 0,
  // which can also mean "node found but genuinely empty".
  userNodeFound?: boolean;
  assistantNodeFound?: boolean;
  sent?: boolean;
  calculation?: "success" | "no_result";
  saved?: boolean;
  energyKWh?: number;
  error?: string;
}

// Storage shape: tabId -> model -> most recent traces for that pairing.
type DiagnosticsStore = Record<string, Record<string, DiagnosticTrace[]>>;

const UNKNOWN_TAB = "unknown";
const UNKNOWN_MODEL = "unknown";

// Earlier versions stored a flat DiagnosticTrace[] under this same key.
// Treat anything that isn't the current tab->model->traces shape as empty
// rather than let it linger as orphaned, unreadable cruft.
const asStore = (value: unknown): DiagnosticsStore =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as DiagnosticsStore)
    : {};

// updateDiagnostic can be called more than once per prompt from different
// parts of the pipeline (extraction, then background processing) in quick
// succession. Each call does a read-modify-write against
// chrome.storage.local, so unserialized concurrent calls can race and lose
// an update. Chain every call onto a single queue so they always apply in
// the order they were issued.
let writeQueue: Promise<void> = Promise.resolve();

export const updateDiagnostic = async (
  metric: QueryMetric,
  update: Partial<DiagnosticTrace>,
): Promise<void> => {
  const run = async () => {
    try {
      if (typeof chrome === "undefined" || !chrome.storage?.local) return;

      // Single read covers the gate-check, the model lookup, and the
      // existing traces, so toggling the setting or changing the selected
      // model takes effect immediately (no stale cache) at no extra
      // storage round-trip cost.
      const stored = await chrome.storage.local.get([
        SETTINGS_KEY,
        DIAGNOSTICS_KEY,
      ]);
      const settings = stored[SETTINGS_KEY] as UserSettings | undefined;
      if (!settings?.diagnosticsMode) return; // feature is off: collect nothing

      const tabKey = update.tabId !== undefined ? String(update.tabId) : UNKNOWN_TAB;
      const modelKey =
        settings.selectedModel?.modelId ||
        settings.selectedModel?.modelName ||
        UNKNOWN_MODEL;

      const store = asStore(stored[DIAGNOSTICS_KEY]);
      const tabBucket = store[tabKey] || {};
      const traces = tabBucket[modelKey] || [];

      const traceId = String(metric.startTime || Date.now() / 1000);
      const existing = traces.find((trace) => trace.traceId === traceId);
      const base: DiagnosticTrace = existing || {
        traceId,
        updatedAt: Date.now(),
        platform: metric.platform,
        tabId: update.tabId,
        model: modelKey,
        inputChars: metric.inputTextLength || 0,
        outputChars: metric.outputTextLength || 0,
        inputTokens: metric.inputTokens || 0,
        outputTokens: metric.outputTokens || 0,
      };

      const next: DiagnosticTrace = {
        ...base,
        ...update,
        model: modelKey,
        updatedAt: Date.now(),
      };
      const nextTraces = [
        next,
        ...traces.filter((trace) => trace.traceId !== traceId),
      ].slice(0, MAX_TRACES_PER_BUCKET);

      let nextStore: DiagnosticsStore = {
        ...store,
        [tabKey]: { ...tabBucket, [modelKey]: nextTraces },
      };
      nextStore = evictStaleTabs(nextStore);

      await chrome.storage.local.set({ [DIAGNOSTICS_KEY]: nextStore });
    } catch (error) {
      console.warn("AI Wattch: Could not update diagnostics", error);
    }
  };

  writeQueue = writeQueue.then(run);
  return writeQueue;
};

// Bounds how many tabs' diagnostics are kept around at once. Without this,
// someone who leaves many tabs open across many days would grow this
// store without limit, since each tab only ever touches its own bucket.
const evictStaleTabs = (store: DiagnosticsStore): DiagnosticsStore => {
  const tabKeys = Object.keys(store);
  if (tabKeys.length <= MAX_TRACKED_TABS) return store;

  const lastActivity = (tabKey: string): number =>
    Math.max(
      0,
      ...Object.values(store[tabKey]).flatMap((traces) =>
        traces.map((trace) => trace.updatedAt),
      ),
    );

  const staleFirst = [...tabKeys].sort(
    (a, b) => lastActivity(a) - lastActivity(b),
  );
  const toDrop = new Set(staleFirst.slice(0, tabKeys.length - MAX_TRACKED_TABS));

  return Object.fromEntries(
    Object.entries(store).filter(([tabKey]) => !toDrop.has(tabKey)),
  );
};

// Content scripts have no chrome.tabs API to look up their own tab id, so
// ask the background script - it resolves the id from the message sender.
// Only meaningful (and only ever called) from a content-script context;
// cached for the life of the page since a tab's own id never changes.
let tabIdPromise: Promise<number | undefined> | undefined;

const getCurrentTabId = (): Promise<number | undefined> => {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return Promise.resolve(undefined);
  }
  if (!tabIdPromise) {
    tabIdPromise = sendToBackground<number | null>({
      type: MESSAGE_TYPES.GET_TAB_ID,
    })
      .then((id) => id ?? undefined)
      .catch(() => undefined);
  }
  return tabIdPromise;
};

// Convenience wrapper for content-script call sites (messages.ts,
// content.ts): resolves the current tab id and forwards to
// updateDiagnostic. Background call sites already know their tab from the
// message sender and should call updateDiagnostic directly with it.
export const recordDiagnostic = async (
  metric: QueryMetric,
  update: Partial<DiagnosticTrace>,
): Promise<void> => {
  const tabId = await getCurrentTabId();
  return updateDiagnostic(metric, { ...update, tabId });
};

// Returns the current tab's traces, grouped by model. Content-script
// context only (resolves its own tab id the same way recordDiagnostic
// does).
export const getDiagnostics = async (): Promise<
  Record<string, DiagnosticTrace[]>
> => {
  if (typeof chrome === "undefined" || !chrome.storage?.local) return {};
  const tabId = await getCurrentTabId();
  const tabKey = tabId !== undefined ? String(tabId) : UNKNOWN_TAB;

  const result = await chrome.storage.local.get(DIAGNOSTICS_KEY);
  const store = asStore(result[DIAGNOSTICS_KEY]);
  return store[tabKey] || {};
};

// Clears only the current tab's diagnostics (all models), leaving other
// tabs' in-progress diagnostics untouched.
export const clearDiagnostics = async (): Promise<void> => {
  if (typeof chrome === "undefined" || !chrome.storage?.local) return;
  const tabId = await getCurrentTabId();
  const tabKey = tabId !== undefined ? String(tabId) : UNKNOWN_TAB;

  const result = await chrome.storage.local.get(DIAGNOSTICS_KEY);
  const store = asStore(result[DIAGNOSTICS_KEY]);
  if (!(tabKey in store)) return;

  const { [tabKey]: _removed, ...rest } = store;
  await chrome.storage.local.set({ [DIAGNOSTICS_KEY]: rest });
};
