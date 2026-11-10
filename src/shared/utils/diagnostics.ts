import { QueryMetric } from "../types";

const DIAGNOSTICS_KEY = "ai_wattch_diagnostics_v1";

export interface DiagnosticTrace {
  traceId: string;
  updatedAt: number;
  platform: string;
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

// updateDiagnostic can now be called more than once per prompt from
// different parts of the pipeline (extraction, then background processing)
// in quick succession. Each call does a read-modify-write against
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

      const traceId = String(metric.startTime || Date.now() / 1000);
      const result = await chrome.storage.local.get(DIAGNOSTICS_KEY);
      const traces = (result[DIAGNOSTICS_KEY] || []) as DiagnosticTrace[];
      const existing = traces.find((trace) => trace.traceId === traceId);
      const base: DiagnosticTrace = existing || {
        traceId,
        updatedAt: Date.now(),
        platform: metric.platform,
        inputChars: metric.inputTextLength || 0,
        outputChars: metric.outputTextLength || 0,
        inputTokens: metric.inputTokens || 0,
        outputTokens: metric.outputTokens || 0,
      };

      const next = {
        ...base,
        ...update,
        updatedAt: Date.now(),
      };
      const nextTraces = [next, ...traces.filter((trace) => trace.traceId !== traceId)]
        .slice(0, 5);
      await chrome.storage.local.set({ [DIAGNOSTICS_KEY]: nextTraces });
    } catch (error) {
      console.warn("AI Wattch: Could not update diagnostics", error);
    }
  };

  writeQueue = writeQueue.then(run);
  return writeQueue;
};

export const getDiagnostics = async (): Promise<DiagnosticTrace[]> => {
  if (typeof chrome === "undefined" || !chrome.storage?.local) return [];
  const result = await chrome.storage.local.get(DIAGNOSTICS_KEY);
  return (result[DIAGNOSTICS_KEY] || []) as DiagnosticTrace[];
};

export const clearDiagnostics = async (): Promise<void> => {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    await chrome.storage.local.remove(DIAGNOSTICS_KEY);
  }
};

