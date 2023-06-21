import { DbPerfRun } from "../types.ts";
import { getErrorRecord, kv, recordTiming } from "./util.ts";

export async function testDenoKv(): Promise<DbPerfRun> {
  try {
    //measure write performance
    const startWrite = Date.now();
    await kv.set([crypto.randomUUID()], "world");
    const writePerformance = Date.now() - startWrite;
  
    //measure atomic/transaction write performance
    const startAtomicWrite = Date.now();
    await kv.atomic().set([crypto.randomUUID()], "hello").set([crypto.randomUUID()], "world").commit();
    const atomicWritePerformance = Date.now() - startAtomicWrite;
  
    // *******
    // The next two reads rely on a pre-existing key 'hello' in the KV store.
    // *******
  
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
  } catch (e) {
    console.error(e);
    return getErrorRecord("Deno KV");
  }
}