/**
 * Dev/test-only helper — never import from production code.
 * Writes synthetic backdated daily records so you can verify aggregation
 * and pruning without waiting a year.
 *
 * Usage in a Vitest test:
 *   import { seedDailyRecords } from "./seedStorage";
 *   await seedDailyRecords(store, 366, new Date("2026-06-20"));
 *
 * Usage for manual QA (call from browser devtools via a test build only):
 *   NOT wired into the production background script.
 */

import type { DailyRecord } from "../storageService";

export interface SeedRecord extends Omit<DailyRecord, "date"> {}

/**
 * Populates an in-memory store object (as used in Vitest mocks) with
 * `count` backdated daily records ending on `now`.
 *
 * @param store  The mutable store object backing the browser.storage mock.
 * @param count  Number of days to seed (e.g. 366 to test pruning).
 * @param now    Reference "today". Pass a fixed date so tests are deterministic.
 */
export function seedDailyRecords(
  store: Record<string, unknown>,
  count: number,
  now: Date = new Date()
): void {
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-CA");
    const key = `day_${dateStr}`;
    store[key] = {
      date: dateStr,
      energy_Wh: 10 + (i % 5) * 3,
      co2_g: 2 + (i % 3),
      water_ml: 50 + (i % 7) * 10,
      sessions: 1,
      prompts: 2 + (i % 4),
      byModel: {
        Claude: {
          energy_Wh: 6 + (i % 5),
          co2_g: 1,
          water_ml: 30,
          sessions: 1,
          prompts: 1 + (i % 4),
        },
        ChatGPT: {
          energy_Wh: 4 + (i % 3),
          co2_g: 1,
          water_ml: 20,
          sessions: 0,
          prompts: 1,
        },
      },
    } satisfies DailyRecord;
  }
}
