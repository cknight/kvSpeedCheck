import { Redis } from "https://deno.land/x/upstash_redis@v1.20.6/mod.ts";
import { DbPerfRun } from "../types.ts";
import { dbMonthlyLimitExceeded, getDefaultRecord, kv, recordTiming } from "./util.ts";


export async function testUpstashRedis(): Promise<DbPerfRun> {
  const dbName = "Upstash Redis";
  const defaultRecord = getDefaultRecord(dbName);

  if (defaultRecord.regionId === "unknown" || await dbMonthlyLimitExceeded(dbName, 100000)) {
    //e.g. running locally (don't burn through free tier quota)
    return defaultRecord;
  }

  const startRedis = performance.now();
  const upstashRedis = new Redis({
    url: Deno.env.get("UPSTASH_REDIS_URL")!,
    token: Deno.env.get("UPSTASH_REDIS_TOKEN")!,
  });
  const upstashStartTime = performance.now() - startRedis;
  console.log("Upstash Redis started in", upstashStartTime, "ms");

  // measure write performance
  const startWrite = performance.now();
  await upstashRedis.set("foo", "bar");
  const writeTime = performance.now() - startWrite;
  
  // measure eventual read performance (no strong consistency)
  const startRead = performance.now();
  await upstashRedis.get("foo");
  const readTime = performance.now() - startRead;
  
  // measure atomic write performance
  const startAtomic = performance.now();
  const atomic = upstashRedis.multi();
  atomic.set("foo", "bar");
  atomic.set("123", "456");
  await atomic.exec();
  const atomicTime = performance.now() - startAtomic;

  const dbPerf: DbPerfRun = {
    dbName: dbName,
    regionId: defaultRecord.regionId,
    writePerformance: writeTime,
    atomicWritePerformance: atomicTime,
    eventualReadPerformance: readTime,
    strongReadPerformance: -1
  };
  await recordTiming(dbPerf);

  return dbPerf;
}
