import { dbPerfRun } from "../types.ts";

export async function testDenoKv(): Promise<dbPerfRun> {
  //measure open performance
  const kv = await Deno.openKv();
  const regionId = Deno.env.get("DENO_REGION") || "unknown";

  //measure write performance
  const startWrite = performance.now();
  await kv.set(["hello"], "world");
  const writePerformance = performance.now() - startWrite;

  //measure write performance
  const startAtomicWrite = performance.now();
  await kv.atomic().set(["hello"], "world").set(["123"], "456").commit();
  const atomicWritePerformance = performance.now() - startAtomicWrite;

  //measure eventual read performance
  const startEventualRead = performance.now();
  await kv.get(["hello"], {consistency: "eventual"});
  const eventualReadPerformance = performance.now() - startEventualRead;

  //measure strong read performance
  const startStrongRead = performance.now();
  await kv.get(["hello"], {consistency: "strong"});
  const strongReadPerformance = performance.now() - startStrongRead;

  const dbPerf: dbPerfRun = {
    dbName: "Deno KV",
    regionId,
    writePerformance,
    atomicWritePerformance,
    eventualReadPerformance,
    strongReadPerformance,
  };

  return dbPerf;
}