import { useEffect, useState } from "react";

// Optional generic, returns undefined initially if not set
export function useStorageObserver<T = any>(key: string): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    // Load initial value
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Storage read error:", chrome.runtime.lastError);
        return;
      }

      setValue(result[key]);
    });

    // Listen for storage changes
    const handleChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === "local" && changes[key]) {
        setValue(changes[key].newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleChange);
    };
  }, [key]);

  return value;
}
