import { describe, expect, it } from "vitest";
import { aggregateRecords } from "../aggregator";
import type { DailyRecord } from "../storageService";

const makeRecord = (
  date: string,
  overrides: Partial<DailyRecord> = {}
): DailyRecord => ({
  date,
  energy_Wh: 0,
  co2_g: 0,
  water_ml: 0,
  sessions: 0,
  prompts: 0,
  ...overrides,
});

describe("aggregateRecords", () => {
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

    const summary = aggregateRecords(records);

    expect(summary.energy_Wh).toBe(70);
    expect(summary.co2_g).toBe(14);
    expect(summary.water_ml).toBe(350);
    expect(summary.sessions).toBe(7);
    expect(summary.prompts).toBe(21);
    expect(summary.smartphone_charges).toBeCloseTo(70 / 15);
    expect(summary.lightbulb_hours).toBeCloseTo(70 / 0.01);
  });

  it("correctly sums all fields across 30 records", () => {
    const records = Array.from({ length: 30 }, (_, i) => {
      const d = new Date("2026-06-01");
      d.setDate(d.getDate() + i);
      return makeRecord(d.toLocaleDateString("en-CA"), {
        energy_Wh: 5,
        co2_g: 1,
        water_ml: 20,
        sessions: 2,
        prompts: 4,
      });
    });

    const summary = aggregateRecords(records);

    expect(summary.energy_Wh).toBe(150);
    expect(summary.co2_g).toBe(30);
    expect(summary.water_ml).toBe(600);
    expect(summary.sessions).toBe(60);
    expect(summary.prompts).toBe(120);
  });

  it("merges byModel data for the same product across multiple days", () => {
    const records = [
      makeRecord("2026-06-01", {
        energy_Wh: 10,
        byModel: { Claude: { energy_Wh: 10, co2_g: 2, water_ml: 50, sessions: 1, prompts: 3 } },
      }),
      makeRecord("2026-06-02", {
        energy_Wh: 20,
        byModel: { Claude: { energy_Wh: 20, co2_g: 4, water_ml: 100, sessions: 2, prompts: 6 } },
      }),
    ];

    const summary = aggregateRecords(records);

    expect(summary.byModel.Claude).toBeDefined();
    expect(summary.byModel.Claude.energy_Wh).toBe(30);
    expect(summary.byModel.Claude.co2_g).toBe(6);
    expect(summary.byModel.Claude.water_ml).toBe(150);
    expect(summary.byModel.Claude.sessions).toBe(3);
    expect(summary.byModel.Claude.prompts).toBe(9);
  });

  it("keeps distinct byModel entries for different products", () => {
    const records = [
      makeRecord("2026-06-01", {
        energy_Wh: 10,
        byModel: { Claude: { energy_Wh: 10, co2_g: 2, water_ml: 50, sessions: 1, prompts: 3 } },
      }),
      makeRecord("2026-06-02", {
        energy_Wh: 8,
        byModel: { ChatGPT: { energy_Wh: 8, co2_g: 1, water_ml: 30, sessions: 1, prompts: 2 } },
      }),
    ];

    const summary = aggregateRecords(records);

    expect(Object.keys(summary.byModel)).toHaveLength(2);
    expect(summary.byModel.Claude.energy_Wh).toBe(10);
    expect(summary.byModel.ChatGPT.energy_Wh).toBe(8);
  });

  it("grand total energy_Wh equals the sum of all byModel entries", () => {
    const records = [
      makeRecord("2026-06-01", {
        energy_Wh: 30,
        byModel: {
          Claude: { energy_Wh: 20, co2_g: 0, water_ml: 0, sessions: 0, prompts: 0 },
          ChatGPT: { energy_Wh: 10, co2_g: 0, water_ml: 0, sessions: 0, prompts: 0 },
        },
      }),
    ];

    const summary = aggregateRecords(records);
    const byModelTotal = Object.values(summary.byModel).reduce(
      (sum, m) => sum + m.energy_Wh,
      0
    );

    expect(summary.energy_Wh).toBe(30);
    expect(byModelTotal).toBe(30);
  });

  it("returns zeros and empty byModel for an empty array", () => {
    const summary = aggregateRecords([]);

    expect(summary.energy_Wh).toBe(0);
    expect(summary.co2_g).toBe(0);
    expect(summary.water_ml).toBe(0);
    expect(summary.sessions).toBe(0);
    expect(summary.prompts).toBe(0);
    expect(summary.smartphone_charges).toBe(0);
    expect(summary.lightbulb_hours).toBe(0);
    expect(summary.byModel).toEqual({});
  });
});
