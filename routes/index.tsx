import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import OperationResultsTables from "../componets/operationResultsTable.tsx";
import RegionResultTable from "../componets/regionResultTable.tsx";
import ResultsSelector from "../componets/resultsSelector.tsx";
import { testDenoKv } from "../db/denoKv.ts";
import { testDynamoDB } from "../db/dynamodb.ts";
import { testFauna } from "../db/fauna.ts";
import { testPlanetscale } from "../db/planetscale.ts";
import { testUpstashRedis } from "../db/upstashRedis.ts";
import { kv } from "../db/util.ts";
import { DbPerfRun, DbPerfRunSummary } from "../types.ts";

interface PerfProps {
  measurement: DbPerfRun[];
  entriesListPerf: number;
  numberOfEntries: number;
  summary: Map<string, Map<string, DbPerfRunSummary>>;
}

export const handler: Handlers = {
  async GET(req, ctx) {

    const regions = new Map<string, Map<string, DbPerfRunSummary>>();
      
    //Get previous runs from all users
    const startEntriesListPerf = performance.now();

    const entries = kv.list({prefix: ["dbPerfRun"]}, {consistency: "eventual"});
    let numberOfEntries = 0;
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
      numberOfEntries++;
    }

    const entriesListPerf = Math.round(performance.now() - startEntriesListPerf);

    //Run new local tests
    const denoKvPerf = await testDenoKv();
    const upstashRedisPerf = await testUpstashRedis();
    const faunaPerf = await testFauna();
    const planetScalePerf = await testPlanetscale();
    const dynamoDbPerf = await testDynamoDB();

    //Add new local tests to summary
    const localPerf = [denoKvPerf, upstashRedisPerf, faunaPerf, planetScalePerf, dynamoDbPerf];
    for (const run of localPerf) {
      if (run.eventualReadPerformance === -1 && run.strongReadPerformance === -1) {
        continue;
      }

      regions.get(run.regionId)!.get(run.dbName)!.writePerformanceStats.push(run.writePerformance);
      regions.get(run.regionId)!.get(run.dbName)!.atomicWritePerformanceStats.push(run.atomicWritePerformance);
      regions.get(run.regionId)!.get(run.dbName)!.eventualReadPerformanceStats.push(run.eventualReadPerformance);
      regions.get(run.regionId)!.get(run.dbName)!.strongReadPerformanceStats.push(run.strongReadPerformance);
    }

    return await ctx.render({measurement: localPerf, entriesListPerf, numberOfEntries, summary: regions});
  },
};

export default function Home(data: PageProps<PerfProps>) {
  const { measurement, summary } = data.data;
  const sortedRegions = Array.from(summary.keys()).sort((a, b) => a.localeCompare(b));
  
  function outputPerformance(performance: number): string {
    return performance >= 0 ? performance + "ms" : "-";
  }

  return (
    <>
      <Head>
        <title>Edge DB comparison</title>
      </Head>
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

        <ResultsSelector regions={sortedRegions} />
        <p class="mt-10 text-2xl font-bold">All results:</p>
        <p class="text-xs mt-3">(Deno KV returned and processed {data.data.numberOfEntries} performance entries in {data.data.entriesListPerf}ms using eventual consistent reads)</p>
        <OperationResultsTables summary={summary} />
        <div class="mt-5">
          {
            sortedRegions.map(region => <RegionResultTable region={region} summary={summary} />) 
          }
        </div>
      </div>
    </>
  );
}
