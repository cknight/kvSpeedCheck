import { DbPerfRun, Stats } from "../types.ts";

export const kv = await Deno.openKv();

export async function recordTiming(dbPerfRun: DbPerfRun): Promise<void> {
  for(let attempts = 0; attempts < 10; attempts++) {
    const key = ["dbPerfRun", Date.now()];
    const result = await kv.atomic()
                      .check({ key, versionstamp: null }) // `null` versionstamps mean 'no value'
                      .set(key, dbPerfRun)
                      .commit();
    if (result.ok) {
      return;
    } else {
      console.log(`Duplicate entry found for key ${key}, retrying...`);
    }
  }
  console.log('Failed to persist dbPerfRun after 10 attempts, giving up.')
}

export async function dbMonthlyLimitExceeded(dbName: string, maxMonthlyLimit: number): Promise<boolean> {
  const currentMonth = await kv.get([dbName, "current-month"]);
  if (currentMonth.value === null || currentMonth.value !== new Date().getMonth()) {
    await kv.set([dbName, "current-month"], new Date().getMonth());
    await kv.set([dbName, "current-month-requests"], 0);
  } else {
    const currentMonthRequests = await kv.get([dbName, "current-month-requests"]);
    if (currentMonthRequests.value > maxMonthlyLimit) {
      console.log(`${dbName} quota exceeded for this month, skipping measurement.`);
      return true;
    } 
    
    await kv.set(["current-month-requests"], currentMonthRequests.value + 3);
  }
  return false;
}

export function getDefaultRecord(dbName: string): DbPerfRun {
  return {
    dbName,
    regionId: Deno.env.get("DENO_REGION") || "unknown",
    writePerformance: -1,
    atomicWritePerformance: -1,
    eventualReadPerformance: -1,
    strongReadPerformance: -1,
  };
}

export function stats(stats: number[]): Stats {
  if (stats.length === 0 || stats.includes(-1)) return {
    min: -1,
    max: -1,
    avg: -1,
    p95: -1,
  };

  const min = Math.round(Math.min(...stats));
  const avg = Math.round((stats.reduce((a, b) => a + b, 0) / stats.length));
  const p95 = Math.round(stats.length > 10 ? stats.sort((a, b) => a - b)[Math.floor(stats.length * 0.95) - 1] : -1);
  const max = Math.round(Math.max(...stats));

  return {
    min,
    max,
    avg,
    p95
  }
}
