import {
  ATOMIC_WRITE,
  DB_PERF_RUN,
  DbPerfRun,
  EVENTUAL_READ,
  STATS,
  STRONG_READ,
  WRITE,
} from "../types.ts";
import { kv, stats } from "./util.ts";

export async function computeStats() {
  const start = Date.now();
  let count = 0;

  const entriesIterator = kv.list({ prefix: [DB_PERF_RUN] }, {
    consistency: "eventual",
  });

  // map of <region>.<db>.<op> -> array of performance measurements
  const runBuckets: Map<string, number[]> = new Map();

  // map of <region> -> number of measurements for that region
  const regionRuns: Map<string, number> = new Map();

  for await (const entry of entriesIterator) {
    const run = entry.value as DbPerfRun;
    //Fix incorrect casing of Planetscale
    const dbName = run.dbName === "Planetscale" ? "PlanetScale" : run.dbName;
    const keyBase = run.regionId + "." + dbName + ".";

    addArrayVal(runBuckets, keyBase + WRITE, run.writePerformance);
    addArrayVal(runBuckets, keyBase + ATOMIC_WRITE, run.atomicWritePerformance);
    addArrayVal(
      runBuckets,
      keyBase + EVENTUAL_READ,
      run.eventualReadPerformance,
    );
    addArrayVal(runBuckets, keyBase + STRONG_READ, run.strongReadPerformance);
    incrementRegionCount(regionRuns, run.regionId, dbName);

    count++;
  }

  for (const [key, val] of runBuckets.entries()) {
    // key is in the format: <region>.<db>.<op>
    kv.set([STATS, key], stats(val));
  }

  console.log(
    `Computed stats for ${count} measurements in ${Date.now() - start}ms`,
  );
}
function addArrayVal(map: Map<string, number[]>, key: string, val: number) {
  let arr = map.get(key);
  if (!arr) {
    arr = [];
    map.set(key, arr);
  }
  arr.push(val);
}

function incrementRegionCount(
  regionRuns: Map<string, number>,
  regionId: string,
  dbName: string,
) {
  if (dbName === "Deno KV") {
    const count = regionRuns.get(regionId) || 0;
    regionRuns.set(regionId, count + 1);
  }
}
