import { DbPerfRun } from "../types.ts";
import { dbMonthlyLimitExceeded, getDefaultRecord, recordTiming } from "./util.ts";
import { Connection, connect } from "https://unpkg.com/@planetscale/database@^1.4";

export async function testPlanetscale(): Promise<DbPerfRun> {
  const dbName = "Planetscale";
  const defaultRecord = getDefaultRecord(dbName);

  if (defaultRecord.regionId === "unknown" || await dbMonthlyLimitExceeded(dbName, 10000000)) {
    //e.g. running locally (don't burn through free tier quota) or quota exceeded
    return defaultRecord;
  }

  //issue with address already in use
  
  const dbUrl = Deno.env.get("PLANETSCALE_DB_URL");
  if (!dbUrl) {
    throw new Error(`Planetscale DB URL not set`);
  }

  const conn = connect({ url: dbUrl })
  
  //write
  const startWrite = performance.now();
  await conn.execute("insert into ID_VALUE (VALUE) values ('WORLD')");
  const writeTime = performance.now() - startWrite;

  //eventual read
  const startRead = performance.now();
  await conn.execute("select VALUE from ID_VALUE where ID=1");
  const readTime = performance.now() - startRead;

  //atomic transactional write
  const startAtomic = performance.now();
  await conn.transaction(async (tx:Connection) => {
    const insert1 = await tx.execute("insert into ID_VALUE (VALUE) values ('WORLD1_transactional')");
    const insert2 = await tx.execute("insert into ID_VALUE (VALUE) values ('WORLD2_transactional')");
    return [insert1, insert2];
  });
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
