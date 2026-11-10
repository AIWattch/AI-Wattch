import React, { useCallback, useEffect, useState } from "react";
import {
  clearDiagnostics,
  DiagnosticTrace,
  getDiagnostics,
} from "../../../shared/utils/diagnostics";
import { useSettings } from "../../../shared/hooks/useSettings";

const Status: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <span className="mr-2 whitespace-nowrap">
    {label}: <strong>{value || "—"}</strong>
  </span>
);

export const DiagnosticsPanel: React.FC = () => {
  const { settings } = useSettings();
  const [traces, setTraces] = useState<DiagnosticTrace[]>([]);

  const refresh = useCallback(async () => {
    setTraces(await getDiagnostics());
  }, []);

  useEffect(() => {
    void refresh();
    const onChanged = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.ai_wattch_diagnostics_v1) void refresh();
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, [refresh]);

  const clear = async () => {
    await clearDiagnostics();
    setTraces([]);
  };

  // Off by default - render nothing (not even an empty shell) until the
  // user explicitly turns Diagnostics Mode on in Settings.
  if (!settings?.diagnosticsMode) return null;

  return (
    <section className="mt-3 mx-1 p-2 rounded-lg border border-grey-200 bg-midnight-ocean-400 text-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold">Temporary diagnostics · last 5 prompts</span>
        <button className="text-[10px] text-glacier-400" onClick={clear}>Clear</button>
      </div>
      <p className="text-[10px] text-grey-300 mb-2">Counts and processing status only. Prompt and response text are not stored.</p>
      {traces.length === 0 ? (
        <p className="text-[10px] text-grey-300">No prompts recorded yet. Send a new prompt while AI Wattch is active.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {traces.map((trace) => (
            <div key={trace.traceId} className="border-t border-grey-200 pt-2 text-[10px]">
              <div className="flex justify-between mb-1">
                <strong>{trace.platform} · {new Date(trace.updatedAt).toLocaleTimeString()}</strong>
                <span>{trace.inputTokens} in / {trace.outputTokens} out tokens</span>
              </div>
              <div className="text-grey-300 mb-1">{trace.inputChars} input chars · {trace.outputChars} output chars</div>
              <div className="flex flex-wrap text-grey-100">
                <Status
                  label="User node"
                  value={trace.userNodeFound === undefined ? "—" : trace.userNodeFound ? "found" : "NOT FOUND"}
                />
                <Status
                  label="Assistant node"
                  value={trace.assistantNodeFound === undefined ? "—" : trace.assistantNodeFound ? "found" : "NOT FOUND"}
                />
                <Status label="Sent" value={trace.sent === undefined ? "—" : trace.sent ? "yes" : "no"} />
                <Status label="API" value={trace.calculation || "—"} />
                <Status label="Saved" value={trace.saved === undefined ? "—" : trace.saved ? "yes" : "no"} />
              </div>
              {trace.energyKWh !== undefined && <div className="text-grey-300 mt-1">Energy: {trace.energyKWh.toExponential(3)} kWh</div>}
              {trace.error && <div className="text-red-300 mt-1">{trace.error}</div>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
