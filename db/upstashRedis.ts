import { Redis } from "https://deno.land/x/upstash_redis@v1.20.6/mod.ts";
import { dbPerfRun } from "../types.ts";

export async function testUpstashRedis(): Promise<dbPerfRun> {
  const regionId = Deno.env.get("DENO_REGION") || "unknown";

  if (regionId === "unknown") {
    //e.g. running locally (don't burn through free tier quota)
    return {
      dbName: "Upstash Redis",
      regionId,
      writePerformance: -1,
      atomicWritePerformance: -1,
      eventualReadPerformance: -1,
      strongReadPerformance: -1,
    }
  }

  const startRedis = performance.now();
  const redis = new Redis({
    url: Deno.env.get("UPSTASH_REDIS_URL")!,
    token: Deno.env.get("UPSTASH_REDIS_TOKEN")!,
  });
  const upstashStartTime = performance.now() - startRedis;
  console.log("Upstash Redis started in", upstashStartTime, "ms");

  const startWrite = performance.now();
  await redis.set("foo", "bar");
  const writeTime = performance.now() - startWrite;
  
  const startRead = performance.now();
  await redis.get("foo");
  const readTime = performance.now() - startRead;
  
  const startAtomic = performance.now();
  const atomic = redis.multi();
  atomic.set("foo", "bar");
  atomic.set("123", "456");
  await atomic.exec();
  const atomicTime = performance.now() - startAtomic;

  const dbPerf: dbPerfRun = {
    dbName: "Upstash Redis",
    regionId,
    writePerformance: writeTime,
    atomicWritePerformance: atomicTime,
    eventualReadPerformance: readTime,
    strongReadPerformance: -1
  };

  return dbPerf;
}
