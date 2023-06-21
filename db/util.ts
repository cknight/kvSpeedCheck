import { DbPerfRun, Stats } from "../types.ts";

export const kv = await Deno.openKv();

export const linkStyles = "text([#0000ee] visited:[#551A8B] dark:[#8cb4ff] dark:visited:[#cda9ef])";

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

export function regionMapper(region:string):string {
  switch (region) {
    case "asia-south1":
      return "Mumbai";
    case "asia-south2":
      return "Delhi";
    case "asia-east1":
      return "Taiwan";
    case "asia-east2":
      return "Hong Kong";
    case "asia-northeast1":
      return "Tokyo";
    case "asia-northeast2":
      return "Osaka";
    case "asia-northeast3":
      return "Seoul";
    case "asia-southeast1":
      return "Singapore";
    case "asia-southeast2":
      return "Jakarta";
    case "australia-southeast1":
      return "Sydney";
    case "australia-southeast2":
      return "Melbourne";
    case "europe-north1":
      return "Finland";
    case "europe-west1":
      return "Belgium";
    case "europe-west2":
      return "London";
    case "europe-west3":
      return "Frankfurt";
    case "europe-west4":
      return "Netherlands";
    case "europe-west6":
      return "Zurich";
    case "europe-west8":
      return "Milan";
    case "europe-west9":
      return "Paris";
    case "europe-west12":
      return "Turin";
    case "europe-southwest1":
      return "Madrid";
    case "europe-central2":
      return "Warsaw";
    case "northamerica-northeast1":
      return "Montreal";
    case "northamerica-northeast2":
      return "Toronto";
    case "southamerica-east1":
      return "Sao Paulo";
    case "southamerica-west1":
      return "Santiago"
    case "us-central1":
      return "Iowa";
    case "us-east1":
      return "South Carolina";
    case "us-east4":
      return "N. Virginia";
    case "us-east5":
      return "Ohio";
    case "us-west1":
      return "Oregon";
    case "us-west2":
      return "Los Angeles";
    case "us-west3":
      return "Salt Lake City";
    case "us-west4":
      return "Las Vegas";
    case "us-south1":
      return "Texas";
    case "me-west1":
      return "Tel Aviv";
    case "me-central1":
      return "Doha";
    default:
      return region;
  }
}