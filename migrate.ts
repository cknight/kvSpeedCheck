/// <reference lib="deno.unstable" />

import { DbPerfRun, Stats } from "./types.ts";
import { replaceLocalDataWithRemote } from "https://deno.land/x/kv_utils@1.1.1/mod.ts";

//const remoteKv = await Deno.openKv("https://api.deno.com/databases/913c3c96-e8c9-4234-a433-46da55aa7b3f/connect");
const localKv = await Deno.openKv();

// const result = await replaceLocalDataWithRemote("https://api.deno.com/databases/913c3c96-e8c9-4234-a433-46da55aa7b3f/connect", [{prefix: ["dbPerfRun"]}]);
// if (!result.ok) {
//   console.log("Failed to replace local data with remote data");
//   console.log(result.failedKeys);
//   Deno.exit(1);
// }

let count = 0;
const entriesIterator = localKv.list({ prefix: ["dbPerfRun"] }, {
  consistency: "eventual",
});

const runBuckets: Map<string, number[]> = new Map();
for await (const entry of entriesIterator) {
  const run = entry.value as DbPerfRun;
  const keyBase = run.regionId + "." + run.dbName + ".";
  addArrayVal(runBuckets, keyBase + "write", run.writePerformance);
  addArrayVal(runBuckets, keyBase + "atomicWrite", run.atomicWritePerformance);
  addArrayVal(runBuckets, keyBase + "eventualRead", run.eventualReadPerformance);
  addArrayVal(runBuckets, keyBase + "strongRead", run.strongReadPerformance);
  count++;
}

console.log(`Processed ${count} entries`);

const runStats: Map<string, Stats> = new Map();
for (const [key, val] of runBuckets.entries()) {
  runStats.set(key, stats(val));
  localKv.set(["stats", key], stats(val));
}

console.log(runStats.get("europe-west1.Deno KV.write"));

function addArrayVal(map: Map<string, number[]>, key: string, val: number) {
  let arr = map.get(key);
  if (!arr) {
    arr = [];
    map.set(key, arr);
  }
  arr.push(val);
}

function stats(stats: number[]): Stats {
  if (stats.length === 0 || stats.includes(-1)) {
    return {
      min: -1,
      max: -1,
      avg: -1,
      p95: -1,
    };
  }

  const min = Math.round(Math.min(...stats));
  const avg = Math.round(stats.reduce((a, b) => a + b, 0) / stats.length);
  const p95 = Math.round(
    stats.length > 10
      ? stats.sort((a, b) => a - b)[Math.floor(stats.length * 0.95) - 1]
      : -1,
  );
  const max = Math.round(Math.max(...stats));

  return {
    min,
    max,
    avg,
    p95,
  };
}
