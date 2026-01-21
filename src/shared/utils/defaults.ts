/**
 * Default consumption constants
 */

import { Consumption, ConsumptionByPlatform } from "../types";

export const defaultConsumption: Consumption = {
  energyKWh: 0,
  carbonEmissionsKgCO2e: 0,
  metrics: {
    waterConsumption: 0,
    lightBulbMinutes: 0,
    smartphoneCharges: 0,
  },
};

export const defaultConsumptionByPlatform: ConsumptionByPlatform = {
  chatgptConsumption: defaultConsumption,
  claudeConsumption: defaultConsumption,
  currentConsumption: {
    chatgpt: defaultConsumption,
    claude: defaultConsumption,
  },
};
