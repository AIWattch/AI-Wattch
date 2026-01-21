/**
 * Formatting utilities for AI Wattch
 */

interface FormattedEnergy {
  value: string;
  unit: string;
}

// Format energy values
export const formatEnergy = (energy: number): FormattedEnergy => {
  // in kwh
  if (energy >= 1) {
    return {
      value: energy.toFixed(2),
      unit: "kWh",
    };
  }
  return {
    value: (energy * 1000).toFixed(2),
    unit: "Wh",
  };
};

// Format emissions values
export const formatEmissions = (emissions: number): FormattedEnergy => {
  // emission is in kg
  if (emissions < 1) {
    return {
      value: (emissions * 1000).toFixed(2),
      unit: "gCO₂e",
    };
  }
  return {
    value: emissions.toFixed(2),
    unit: "kgCO₂e",
  };
};
