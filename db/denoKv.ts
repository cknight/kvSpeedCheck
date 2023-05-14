import { DbPerfRun } from "../types.ts";
import { kv, recordTiming } from "./util.ts";

export async function testDenoKv(): Promise<DbPerfRun> {
  //measure write performance
  const startWrite = Date.now();
  await kv.set(["hello"], "world");
  const writePerformance = Date.now() - startWrite;

  //measure write performance
  const startAtomicWrite = Date.now();
  await kv.atomic().set(["hello"], "world").set(["123"], "456").commit();
  const atomicWritePerformance = Date.now() - startAtomicWrite;

  //measure eventual read performance
  const startEventualRead = Date.now();
  await kv.get(["hello"], {consistency: "eventual"});
  const eventualReadPerformance = Date.now() - startEventualRead;

  //measure strong read performance
  const startStrongRead = Date.now();
  await kv.get(["hello"], {consistency: "strong"});
  const strongReadPerformance = Date.now() - startStrongRead;

  const regionId = Deno.env.get("DENO_REGION") || "unknown";

  const dbPerf: DbPerfRun = {
    dbName: "Deno KV",
    regionId,
    writePerformance,
    atomicWritePerformance,
    eventualReadPerformance,
    strongReadPerformance,
  };
  await recordTiming(dbPerf);

  return dbPerf;
}