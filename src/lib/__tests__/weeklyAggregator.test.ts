import { describe, expect, it } from "vitest";
import { aggregateWeekly } from "../weeklyAggregator";
import type { DailyRecord } from "../storageService";

const makeRecord = (date: string, overrides: Partial<DailyRecord> = {}): DailyRecord => ({
  date,
  energy_Wh: 0,
  co2_g: 0,
  water_ml: 0,
  sessions: 0,
  prompts: 0,
  ...overrides,
});

describe("aggregateWeekly", () => {
  it("correctly sums all fields across 7 records", () => {
    const records = Array.from({ length: 7 }, (_, i) =>
      makeRecord(`2026-06-0${i + 1}`, {
        energy_Wh: 10,
        co2_g: 2,
        water_ml: 50,
        sessions: 1,
        prompts: 3,
      })
    );

    const summary = aggregateWeekly(records);

    expect(summary.energy_Wh).toBe(70);
    expect(summary.co2_g).toBe(14);
    expect(summary.water_ml).toBe(350);
    expect(summary.sessions).toBe(7);
    expect(summary.prompts).toBe(21);
  });

  it("computes smartphone_charges and lightbulb_hours from energy_Wh", () => {
    const records = [makeRecord("2026-06-01", { energy_Wh: 150 })];
    const summary = aggregateWeekly(records);

    expect(summary.smartphone_charges).toBeCloseTo(150 / 15);   // 10
    expect(summary.lightbulb_hours).toBeCloseTo(150 / 0.01);    // 15000
  });

  it("returns all-zero summary for an empty array", () => {
    const summary = aggregateWeekly([]);

    expect(summary.energy_Wh).toBe(0);
    expect(summary.co2_g).toBe(0);
    expect(summary.water_ml).toBe(0);
    expect(summary.sessions).toBe(0);
    expect(summary.prompts).toBe(0);
    expect(summary.smartphone_charges).toBe(0);
    expect(summary.lightbulb_hours).toBe(0);
  });
});
