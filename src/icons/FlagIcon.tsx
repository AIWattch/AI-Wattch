import { useState, useEffect, useRef } from "react";

// In-memory cache of URL → blobURL
const iconCache = new Map<string, string>();

const FlagIcon = ({
  flagIcon,
  countryCode,
  className,
}: {
  flagIcon?: string;
  countryCode: string;
  className?: string;
}) => {
  const [src, setSrc] = useState(flagIcon);

  const refetch = useRef({
    hasTriedFallback: false,
    hasRetriedFallback: false,
  });

  // --------------------------
  // Fetch + Cache helper
  // --------------------------
  const fetchAndCacheIcon = async (url: string) => {
    // Hit cache first
    if (iconCache.has(url)) {
      return iconCache.get(url)!;
    }

    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error("Failed to fetch icon");

    const svgText = await res.text();
    const blobUrl = URL.createObjectURL(
      new Blob([svgText], { type: "image/svg+xml" })
    );

    iconCache.set(url, blobUrl);
    return blobUrl;
  };

  // --------------------------
  // Fallback logic
  // --------------------------
  const getIconFallBack = async (isRetry: boolean = false) => {
    if (!flagIcon) return;

    if (
      refetch.current.hasTriedFallback &&
      refetch.current.hasRetriedFallback
    ) {
      return;
    }

    if (!isRetry) refetch.current.hasTriedFallback = true;
    else refetch.current.hasRetriedFallback = true;

    try {
      const blobUrl = await fetchAndCacheIcon(flagIcon);
      setSrc(blobUrl);
      return;
    } catch (err) {
      if (!refetch.current.hasRetriedFallback) {
        return setTimeout(() => getIconFallBack(true), 500);
      }
      console.error("Failed to load fallback flag:", err);
    }
  };

  // Cleanup blob URL on unmount or src change
  useEffect(() => {
    return () => {
      if (src?.startsWith("blob:") && !iconCache.has(flagIcon!)) {
        URL.revokeObjectURL(src);
      }
    };
  }, [src, flagIcon]);

  // Try loading from cache immediately on mount
  useEffect(() => {
    if (!flagIcon) return;

    if (iconCache.has(flagIcon)) {
      setSrc(iconCache.get(flagIcon)!);
    } else {
      setSrc(flagIcon);
    }
  }, [flagIcon]);

  if (!src) return null;

  return (
    <img
      src={src}
      alt={countryCode}
      onError={() => getIconFallBack().catch(console.error)}
      className={className || "w-[15px] h-[15px] rounded-full object-cover"}
    />
  );
};

export default FlagIcon;
