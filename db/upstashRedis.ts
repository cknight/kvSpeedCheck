import { Redis } from "https://deno.land/x/upstash_redis@v1.20.6/mod.ts";
import { DbPerfRun } from "../types.ts";
import { dbMonthlyLimitExceeded, getDefaultRecord, getErrorRecord, recordTiming } from "./util.ts";


export async function testUpstashRedis(): Promise<DbPerfRun> {
  const dbName = "Upstash Redis";
  const defaultRecord = getDefaultRecord(dbName);

  try {
    if (defaultRecord.regionId === "unknown" || await dbMonthlyLimitExceeded(dbName, 100000)) {
      //e.g. running locally (don't burn through free tier quota)
      return defaultRecord;
    }
  
    const upstashRedis = new Redis({
      url: Deno.env.get("UPSTASH_REDIS_URL")!,
      token: Deno.env.get("UPSTASH_REDIS_TOKEN")!,
    });
  
    // measure write performance
    const startWrite = Date.now();
    await upstashRedis.set(crypto.randomUUID(), "hello world");
    const writeTime = Date.now() - startWrite;
  
    // *******
    // The next read relies on a pre-existing key 'foo' in the database.
    // *******
    
    // measure eventual read performance (no strong consistency)
    const startRead = Date.now();
    await upstashRedis.get("foo");
    const readTime = Date.now() - startRead;
    
    // measure atomic write performance
    const startAtomic = Date.now();
    const atomic = upstashRedis.multi();
    atomic.set(crypto.randomUUID(), "hello");
    atomic.set(crypto.randomUUID(), "world");
    await atomic.exec();
    const atomicTime = Date.now() - startAtomic;
  
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
  } catch (e) {
    console.error(e);
    return getErrorRecord(dbName);
  }
}
