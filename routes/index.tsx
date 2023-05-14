import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import RegionResultTable from "../componets/regionResultTable.tsx";
import { testDenoKv } from "../db/denoKv.ts";
import { testFauna } from "../db/fauna.ts";
import { testUpstashRedis } from "../db/upstashRedis.ts";
import { kv } from "../db/util.ts";
import { DbPerfRun, DbPerfRunSummary } from "../types.ts";

interface PerfProps {
  measurement: DbPerfRun[];
  summary: Map<string, Map<string, DbPerfRunSummary>>;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const denoKvPerf = await testDenoKv();
    const upstashRedisPerf = await testUpstashRedis();
    const faunaPerf = await testFauna();

    const regions = new Map<string, Map<string, DbPerfRunSummary>>();
    const entries = kv.list({prefix: ["dbPerfRun"]});
    for await (const entry of entries) {
      const statsForRegion = regions.get(entry.value.regionId) || new Map<string, DbPerfRunSummary>();
      const statsForDb = statsForRegion.get(entry.value.dbName) || {
        writePerformanceStats: [],
        atomicWritePerformanceStats: [],
        eventualReadPerformanceStats: [],
        strongReadPerformanceStats: [],
      };
      regions.set(entry.value.regionId, statsForRegion);
      statsForRegion.set(entry.value.dbName, statsForDb);

      statsForDb.writePerformanceStats.push(entry.value.writePerformance);
      statsForDb.atomicWritePerformanceStats.push(entry.value.atomicWritePerformance);
      statsForDb.eventualReadPerformanceStats.push(entry.value.eventualReadPerformance);
      statsForDb.strongReadPerformanceStats.push(entry.value.strongReadPerformance);
    }

    return await ctx.render({measurement: [denoKvPerf, upstashRedisPerf], summary: regions});
  },
};

export default function Home(data: PageProps<PerfProps>) {
  const { measurement, summary } = data.data;
  const sortedRegions = Array.from(summary.keys()).sort((a, b) => a.localeCompare(b));
  
  function outputPerformance(performance: number): string {
    return performance >= 0 ? performance + "ms" : "not measured";
  }

  return (
    <>
      <Head>
        <title>Edge DB comparison</title>
r      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">Deploy Edge DB comparison</h1>
        <p>Loading this page sent database write and read requests to the below databases.  The requests were sent from a Deno Deploy application running in a Google Cloud Platform (GCP) datacentre.</p>
        <p class="mt-8 text-2xl"><span class="font-bold">Your region:</span> GCP - {measurement[0].regionId}</p>
        <p class="mt-5 text-2xl font-bold">Your results:</p>
        <table class="w-full mt-5 text-left border-b">
          <thead>
            <tr>
              <th>DB</th>
              <th>Write</th>
              <th>Atomic write</th>
              <th>Eventual read</th>
              <th>Strong read</th>
            </tr>
          </thead>
          <tbody>
            {measurement.map(db => {
              return (
                <tr class="border-1">
                  <td>{db.dbName}</td>
                  <td>{outputPerformance(db.writePerformance)}</td>
                  <td>{outputPerformance(db.atomicWritePerformance)}</td>
                  <td>{outputPerformance(db.eventualReadPerformance)}</td>
                  <td>{outputPerformance(db.strongReadPerformance)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <p class="mt-10 text-2xl font-bold">All results:</p>
        <div class="mt-5">
          {
            sortedRegions.map(region => <RegionResultTable region={region} summary={summary} />) 
          }
        </div>
      </div>
    </>
  );
}
