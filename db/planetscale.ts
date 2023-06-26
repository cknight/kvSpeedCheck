import { DbPerfRun } from "../types.ts";
import { dbMonthlyLimitExceeded, getDefaultRecord, getErrorRecord, recordTiming } from "./util.ts";
import { Connection, connect } from "https://unpkg.com/@planetscale/database@^1.4";

export async function testPlanetscale(): Promise<DbPerfRun> {
  const dbName = "PlanetScale";
  const defaultRecord = getDefaultRecord(dbName);

  try {
    if (defaultRecord.regionId === "unknown" || await dbMonthlyLimitExceeded(dbName, 10000000)) {
      //e.g. running locally (don't burn through free tier quota) or quota exceeded
      return defaultRecord;
    }
  
    const dbUrl = Deno.env.get("PLANETSCALE_DB_URL");
    if (!dbUrl) {
      throw new Error(`PlanetScale DB URL not set`);
    }
  
    const conn = connect({ url: dbUrl })
    
    //write
    const startWrite = Date.now();
    await conn.execute("insert into ID_VALUE (VALUE) values ('" + crypto.randomUUID() + "')");
    const writeTime = Date.now() - startWrite;
  
    // *******
    // The next read relies on a pre-existing key '1' in the database.
    // *******
  
    //eventual read
    const startRead = Date.now();
    await conn.execute("select VALUE from ID_VALUE where ID=1");
    const readTime = Date.now() - startRead;
  
    //transactional write
    const startAtomic = Date.now();
    await conn.transaction(async (tx:Connection) => {
      const insert1 = await tx.execute(`insert into ID_VALUE (VALUE) values ('${crypto.randomUUID()}')`);
      const insert2 = await tx.execute(`insert into ID_VALUE (VALUE) values ('${crypto.randomUUID()}')`);
      return [insert1, insert2];
    });
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
