import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAllTimeTotal,
  getAllTimeTotal,
  getDailyRecord,
  getDailyRecords,
  incrementAllTimeTotal,
  pruneOldRecords,
  upsertDailyRecord,
  type DailyRecord,
} from "../storageService";

// In-memory store backing the mock
let store: Record<string, unknown> = {};
// Controlled return value for getBytesInUse — 0 means "not over quota"
let mockBytesInUse = 0;

vi.mock("../../lib/browserApi", () => ({
  browser: {
    storage: {
      local: {
        get: vi.fn(async (keys: string[] | null) => {
          if (keys === null) return { ...store };
          return Object.fromEntries(
            (keys as string[]).map((k) => [k, store[k]])
          );
        }),
        set: vi.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
        remove: vi.fn(async (keys: string[]) => {
          keys.forEach((k) => delete store[k]);
        }),
        getBytesInUse: vi.fn(async () => mockBytesInUse),
      },
    },
  },
}));

// Resolve the mock path the same way storageService.ts imports it
vi.mock("../browserApi", () => ({
  browser: {
    storage: {
      local: {
        get: vi.fn(async (keys: string[] | null) => {
          if (keys === null) return { ...store };
          return Object.fromEntries(
            (keys as string[]).map((k) => [k, store[k]])
          );
        }),
        set: vi.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
        remove: vi.fn(async (keys: string[]) => {
          keys.forEach((k) => delete store[k]);
        }),
        getBytesInUse: vi.fn(async () => mockBytesInUse),
      },
    },
  },
}));

beforeEach(() => {
  store = {};
  mockBytesInUse = 0;
  vi.clearAllMocks();
});

describe("upsertDailyRecord", () => {
  it("accumulates values across multiple calls on the same day", async () => {
    await upsertDailyRecord("Claude", { energy_Wh: 10, co2_g: 5, water_ml: 100, sessions: 1, prompts: 3 });
    await upsertDailyRecord("Claude", { energy_Wh: 20, co2_g: 8, water_ml: 200, sessions: 1, prompts: 5 });
    await upsertDailyRecord("Claude", { energy_Wh: 5,  co2_g: 2, water_ml: 50,  sessions: 0, prompts: 1 });

    const today = new Date().toLocaleDateString("en-CA");
    const record = await getDailyRecord(today);

    expect(record).not.toBeNull();
    expect(record!.energy_Wh).toBe(35);
    expect(record!.co2_g).toBe(15);
    expect(record!.water_ml).toBe(350);
    expect(record!.sessions).toBe(2);
    expect(record!.prompts).toBe(9);
  });

  it("creates a fresh record when none exists", async () => {
    await upsertDailyRecord("Claude", { energy_Wh: 7, prompts: 1 });
    const today = new Date().toLocaleDateString("en-CA");
    const record = await getDailyRecord(today);

    expect(record!.energy_Wh).toBe(7);
    expect(record!.co2_g).toBe(0);
    expect(record!.prompts).toBe(1);
  });

  it("accumulates byModel breakdown per product and keeps products separate", async () => {
    await upsertDailyRecord("Claude", { energy_Wh: 10, co2_g: 2, water_ml: 50, sessions: 1, prompts: 3 });
    await upsertDailyRecord("ChatGPT", { energy_Wh: 8, co2_g: 1, water_ml: 30, sessions: 1, prompts: 2 });
    await upsertDailyRecord("Claude", { energy_Wh: 5, co2_g: 1, water_ml: 25, sessions: 0, prompts: 1 });

    const today = new Date().toLocaleDateString("en-CA");
    const record = await getDailyRecord(today);

    expect(record!.energy_Wh).toBe(23);
    expect(record!.byModel!.Claude.energy_Wh).toBe(15);
    expect(record!.byModel!.Claude.prompts).toBe(4);
    expect(record!.byModel!.ChatGPT.energy_Wh).toBe(8);
    expect(record!.byModel!.ChatGPT.prompts).toBe(2);
  });

  it("skips the daily write when storage remains over quota after pruning", async () => {
    mockBytesInUse = 5 * 1024 * 1024; // 5 MB > 4 MB threshold

    await upsertDailyRecord("Claude", { energy_Wh: 10, co2_g: 2, water_ml: 50, sessions: 1, prompts: 1 });

    const today = new Date().toLocaleDateString("en-CA");
    const record = await getDailyRecord(today);

    expect(record).toBeNull();
  });
});

describe("getDailyRecords", () => {
  it("returns records sorted oldest→newest and skips missing days", async () => {
    const todayStr = new Date().toLocaleDateString("en-CA");
    const d2 = new Date(); d2.setDate(d2.getDate() - 2);
    const twoDaysAgoStr = d2.toLocaleDateString("en-CA");

    // Only seed today and two days ago — yesterday is missing
    store[`day_${todayStr}`] = { date: todayStr, energy_Wh: 10, co2_g: 1, water_ml: 50, sessions: 1, prompts: 2 } satisfies DailyRecord;
    store[`day_${twoDaysAgoStr}`] = { date: twoDaysAgoStr, energy_Wh: 5, co2_g: 0.5, water_ml: 25, sessions: 1, prompts: 1 } satisfies DailyRecord;

    const records = await getDailyRecords(7);

    expect(records).toHaveLength(2);
    expect(records[0].date).toBe(twoDaysAgoStr); // oldest first
    expect(records[1].date).toBe(todayStr);
  });

  it("returns an empty array when no records exist", async () => {
    const records = await getDailyRecords(7);
    expect(records).toEqual([]);
  });
});

describe("pruneOldRecords", () => {
  it("deletes records older than 365 days and keeps recent ones", async () => {
    const makeDate = (daysAgo: number): string => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toLocaleDateString("en-CA");
    };

    const day364 = makeDate(364);
    const day366 = makeDate(366);

    const base: Omit<DailyRecord, "date"> = { energy_Wh: 1, co2_g: 0.1, water_ml: 10, sessions: 1, prompts: 1 };
    store[`day_${day364}`] = { date: day364, ...base };
    store[`day_${day366}`] = { date: day366, ...base };

    await pruneOldRecords();

    expect(store[`day_${day366}`]).toBeUndefined();
    expect(store[`day_${day364}`]).toBeDefined();
  });
});

describe("getAllTimeTotal", () => {
  it("returns zeroed RollupTotal with empty byModel when no key exists", async () => {
    const total = await getAllTimeTotal();

    expect(total.energy_Wh).toBe(0);
    expect(total.co2_g).toBe(0);
    expect(total.water_ml).toBe(0);
    expect(total.sessions).toBe(0);
    expect(total.prompts).toBe(0);
    expect(total.byModel).toEqual({});
  });
});

describe("incrementAllTimeTotal", () => {
  it("accumulates grand totals and byModel for a single product", async () => {
    await incrementAllTimeTotal("Claude", { energy_Wh: 10, co2_g: 2, water_ml: 50, sessions: 1, prompts: 3 });
    await incrementAllTimeTotal("Claude", { energy_Wh: 5, co2_g: 1, water_ml: 25, sessions: 1, prompts: 2 });

    const total = await getAllTimeTotal();

    expect(total.energy_Wh).toBe(15);
    expect(total.co2_g).toBe(3);
    expect(total.water_ml).toBe(75);
    expect(total.sessions).toBe(2);
    expect(total.prompts).toBe(5);
    expect(total.byModel.Claude.energy_Wh).toBe(15);
    expect(total.byModel.Claude.prompts).toBe(5);
  });

  it("tracks distinct products in byModel independently", async () => {
    await incrementAllTimeTotal("Claude", { energy_Wh: 10, co2_g: 2, water_ml: 50, sessions: 1, prompts: 3 });
    await incrementAllTimeTotal("ChatGPT", { energy_Wh: 8, co2_g: 1, water_ml: 30, sessions: 1, prompts: 2 });

    const total = await getAllTimeTotal();

    expect(Object.keys(total.byModel)).toHaveLength(2);
    expect(total.byModel.Claude.energy_Wh).toBe(10);
    expect(total.byModel.ChatGPT.energy_Wh).toBe(8);
    expect(total.energy_Wh).toBe(18);
  });

  it("grand total energy_Wh equals sum of byModel entries", async () => {
    await incrementAllTimeTotal("Claude", { energy_Wh: 12, co2_g: 0, water_ml: 0, sessions: 0, prompts: 0 });
    await incrementAllTimeTotal("Gemini", { energy_Wh: 8, co2_g: 0, water_ml: 0, sessions: 0, prompts: 0 });

    const total = await getAllTimeTotal();
    const byModelSum = Object.values(total.byModel).reduce((s, m) => s + m.energy_Wh, 0);

    expect(total.energy_Wh).toBe(20);
    expect(byModelSum).toBe(20);
  });
});

describe("clearAllTimeTotal", () => {
  it("removes the all-time total key", async () => {
    await incrementAllTimeTotal("Claude", { energy_Wh: 10, co2_g: 2, water_ml: 50, sessions: 1, prompts: 3 });
    await clearAllTimeTotal();

    const total = await getAllTimeTotal();

    expect(total.energy_Wh).toBe(0);
    expect(total.byModel).toEqual({});
  });

  it("pruneOldRecords does not touch the alltime_total key", async () => {
    await incrementAllTimeTotal("Claude", { energy_Wh: 5, co2_g: 1, water_ml: 20, sessions: 1, prompts: 2 });
    await pruneOldRecords();

    const total = await getAllTimeTotal();

    expect(total.energy_Wh).toBe(5);
  });
});
