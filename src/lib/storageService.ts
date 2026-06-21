import { browser } from "./browserApi";

export interface DailyRecord {
  date: string;       // "YYYY-MM-DD"
  energy_Wh: number;
  co2_g: number;
  water_ml: number;
  sessions: number;
  prompts: number;
}

const KEY_PREFIX = "day_";

function dateToKey(date: string): string {
  return `${KEY_PREFIX}${date}`;
}

function keyToDate(key: string): string {
  return key.slice(KEY_PREFIX.length);
}

export function getTodayKey(): string {
  return dateToKey(new Date().toLocaleDateString("en-CA"));
}

export async function getDailyRecord(date: string): Promise<DailyRecord | null> {
  try {
    const result = await browser.storage.local.get([dateToKey(date)]);
    return (result[dateToKey(date)] as DailyRecord) ?? null;
  } catch {
    return null;
  }
}

export async function upsertDailyRecord(
  sessionData: Partial<DailyRecord>
): Promise<void> {
  const today = new Date().toLocaleDateString("en-CA");
  const key = dateToKey(today);

  try {
    const result = await browser.storage.local.get([key]);
    const existing: DailyRecord = (result[key] as DailyRecord) ?? {
      date: today,
      energy_Wh: 0,
      co2_g: 0,
      water_ml: 0,
      sessions: 0,
      prompts: 0,
    };

    const updated: DailyRecord = {
      date: today,
      energy_Wh: existing.energy_Wh + (sessionData.energy_Wh ?? 0),
      co2_g: existing.co2_g + (sessionData.co2_g ?? 0),
      water_ml: existing.water_ml + (sessionData.water_ml ?? 0),
      sessions: existing.sessions + (sessionData.sessions ?? 0),
      prompts: existing.prompts + (sessionData.prompts ?? 0),
    };

    await browser.storage.local.set({ [key]: updated });
  } catch (error) {
    console.error("AI Wattch: Failed to upsert daily record:", error);
    throw error;
  }
}

// Returns the last `days` days sorted oldest→newest, missing days omitted.
export async function getDailyRecords(days: number): Promise<DailyRecord[]> {
  const dates: string[] = [];
  const keys: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-CA");
    dates.push(dateStr);
    keys.push(dateToKey(dateStr));
  }

  try {
    const result = await browser.storage.local.get(keys);
    return dates
      .map((date) => (result[dateToKey(date)] as DailyRecord) ?? null)
      .filter((r): r is DailyRecord => r !== null);
  } catch {
    return [];
  }
}

// Deletes any day_* key whose date is older than 365 days.
export async function pruneOldRecords(): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 365);
  const cutoffStr = cutoff.toLocaleDateString("en-CA");

  try {
    const all = await browser.storage.local.get(null);
    const toDelete = Object.keys(all).filter(
      (key) => key.startsWith(KEY_PREFIX) && keyToDate(key) < cutoffStr
    );

    if (toDelete.length > 0) {
      await browser.storage.local.remove(toDelete);
    }
  } catch (error) {
    console.error("AI Wattch: Failed to prune old records:", error);
  }
}
