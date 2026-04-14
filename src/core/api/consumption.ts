/**
 * API client for consumption calculations
 */

import { WUE_ONSITE } from "../../constants";
import {
  QueryMetric,
  QueryMetricResponse,
  UserSettings,
} from "../../shared/types";

const API_BASE_URL = "https://otm-api.antarctica.io/v1/ai-wattch";

let cooldownUntil = 0;
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingPromise: {
  resolve: (value: QueryMetricResponse | void) => void;
  reject: (reason?: any) => void;
} | null = null;

export const calculateConsumptionApi = async (
  metric: QueryMetric,
  config: UserSettings,
): Promise<QueryMetricResponse | void> => {
  // Check rate limit cooldown
  const now = Date.now();

  if (now < cooldownUntil) {
    console.warn("AI Watch: Request skipped due to rate limit cooldown", {
      cooldownUntil,
      now,
    });
    return;
  }

  // Clear previous debounce
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
    if (pendingPromise) {
      pendingPromise.resolve(); // Cancel previous with void
      pendingPromise = null;
    }
  }

  return new Promise((resolve, reject) => {
    pendingPromise = { resolve, reject };
    debounceTimeout = setTimeout(async () => {
      try {
        // Construct simplified API config
        const apiConfig = {
          calculationMethod: config.calculationMethod,
          modelId: config.selectedModel?.modelId || null,
          location: config.location
            ? {
                emissionFactor: config.location.emissionFactor,
                wueOffsite: config.location.wueOffsite,
              }
            : null,
        };

        const response = await fetch(`${API_BASE_URL}/calculate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-AI-Wattch-Client": "extension",
          },
          body: JSON.stringify({
            metrics: [metric],
            config: apiConfig,
          }),
        });

        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

          cooldownUntil = Date.now() + waitTime;
          console.error(`AI Watch: Rate limited. Cooldown for ${waitTime}ms`);
          resolve();
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Calculation API failed: ${response.status} ${response.statusText} - ${errorText}`,
          );
        }

        const parsedResponse = await response.json();
        const data = parsedResponse.data[0];

        const WUE =
          config?.selectedModel?.platform === "chatgpt"
            ? WUE_ONSITE.OPENAI
            : config?.selectedModel?.platform === "claude"
              ? WUE_ONSITE.ANTHROPIC
              : config?.selectedModel?.platform === "gemini"
                ? WUE_ONSITE.GOOGLE
                : 1.2;

        const waterConsumption = data.energyKWh * WUE;

        resolve({
          energyKWh: data.energyKWh,
          carbonEmissionsKgCO2e: data.carbonEmissionsKgCO2e,
          waterConsumption: waterConsumption * 1000, // convert to ml
          lightBulbMinutes: data.energyKWh / 0.005,
          smartphoneCharges: data.energyKWh / 0.04,
        });
      } catch (error) {
        console.error(
          "AI Watch: Failed to calculate consumption via API",
          error,
        );
        resolve();
      } finally {
        debounceTimeout = null;
        pendingPromise = null;
      }
    }, 500); // 500ms debounce
  });
};
