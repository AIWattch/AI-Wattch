import { DailyRecord } from "./storageService";

export interface WeeklySummary {
  energy_Wh: number;
  co2_g: number;
  water_ml: number;
  sessions: number;
  prompts: number;
  smartphone_charges: number;  // energy_Wh / Wh per full smartphone charge
  lightbulb_hours: number;     // energy_Wh / Wh per LED-hour
}

// Not in @antarctica-global/ai-wattch-constants — defined locally
const WH_PER_SMARTPHONE_CHARGE = 15;
const WH_PER_LIGHTBULB_HOUR = 0.01;

export function aggregateWeekly(records: DailyRecord[]): WeeklySummary {
  const totals = records.reduce(
    (acc, r) => ({
      energy_Wh: acc.energy_Wh + r.energy_Wh,
      co2_g:     acc.co2_g     + r.co2_g,
      water_ml:  acc.water_ml  + r.water_ml,
      sessions:  acc.sessions  + r.sessions,
      prompts:   acc.prompts   + r.prompts,
    }),
    { energy_Wh: 0, co2_g: 0, water_ml: 0, sessions: 0, prompts: 0 }
  );

  return {
    ...totals,
    smartphone_charges: totals.energy_Wh / WH_PER_SMARTPHONE_CHARGE,
    lightbulb_hours:    totals.energy_Wh / WH_PER_LIGHTBULB_HOUR,
  };
}
