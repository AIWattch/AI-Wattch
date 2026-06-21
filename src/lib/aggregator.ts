import type { DailyRecord } from "./storageService";

export interface ModelRollup {
  energy_Wh: number;
  co2_g: number;
  water_ml: number;
  sessions: number;
  prompts: number;
}

export interface RollupSummary extends ModelRollup {
  byModel: Record<string, ModelRollup>;
  smartphone_charges: number; // energy_Wh / Wh per full smartphone charge
  lightbulb_hours: number;    // energy_Wh / Wh per LED-hour
}

// Not in @antarctica-global/ai-wattch-constants — defined locally
const WH_PER_SMARTPHONE_CHARGE = 15;
const WH_PER_LIGHTBULB_HOUR = 0.01;

export function aggregateRecords(records: DailyRecord[]): RollupSummary {
  const byModel: Record<string, ModelRollup> = {};

  const totals = records.reduce(
    (acc, r) => {
      if (r.byModel) {
        for (const [product, metrics] of Object.entries(r.byModel)) {
          if (!byModel[product]) {
            byModel[product] = {
              energy_Wh: 0,
              co2_g: 0,
              water_ml: 0,
              sessions: 0,
              prompts: 0,
            };
          }
          byModel[product].energy_Wh += metrics.energy_Wh;
          byModel[product].co2_g += metrics.co2_g;
          byModel[product].water_ml += metrics.water_ml;
          byModel[product].sessions += metrics.sessions;
          byModel[product].prompts += metrics.prompts;
        }
      }

      return {
        energy_Wh: acc.energy_Wh + r.energy_Wh,
        co2_g: acc.co2_g + r.co2_g,
        water_ml: acc.water_ml + r.water_ml,
        sessions: acc.sessions + r.sessions,
        prompts: acc.prompts + r.prompts,
      };
    },
    { energy_Wh: 0, co2_g: 0, water_ml: 0, sessions: 0, prompts: 0 }
  );

  return {
    ...totals,
    byModel,
    smartphone_charges: totals.energy_Wh / WH_PER_SMARTPHONE_CHARGE,
    lightbulb_hours: totals.energy_Wh / WH_PER_LIGHTBULB_HOUR,
  };
}
