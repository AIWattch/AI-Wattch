import { useEffect, useState } from "react";
import { browser } from "../../lib/browserApi";

// Optional generic, returns undefined initially if not set
export function useStorageObserver<T = any>(key: string): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    // Load initial value
    browser.storage.local.get([key]).then((result) => {
      setValue(result[key]);
    }).catch((err) => {
      console.error("Storage read error:", err);
    });

    // Listen for storage changes
    const handleChange = (
      changes: { [key: string]: browser.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === "local" && changes[key]) {
        setValue(changes[key].newValue);
      }
    };

    browser.storage.onChanged.addListener(handleChange);

    return () => {
      browser.storage.onChanged.removeListener(handleChange);
    };
  }, [key]);

  return value;
}
