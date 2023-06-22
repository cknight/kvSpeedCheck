import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Analysis from "../components/analysis.tsx";
import Conclusion from "../components/conclusion.tsx";
import Databases from "../components/databases.tsx";
import Introduction from "../components/introduction.tsx";
import LatencyExperiment from "../components/latencyExperiment.tsx";
import OperationAndDbResultsTables from "../components/operationResultsTable.tsx";
import RegionResultTable from "../components/regionResultTable.tsx";
import ResultsSelector from "../components/resultsSelector.tsx";
import UnderstandingConsistency from "../components/understandingConsistency.tsx";
import { testDenoKv } from "../db/denoKv.ts";
import { testDynamoDB } from "../db/dynamodb.ts";
import { testFauna } from "../db/fauna.ts";
import { testPlanetscale } from "../db/planetscale.ts";
import { testUpstashRedis } from "../db/upstashRedis.ts";
import { kv, linkStyles, regionMapper } from "../db/util.ts";
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
    const startEntriesListPerf = Date.now();

    const entries = kv.list({prefix: ["dbPerfRun"]}, {consistency: "eventual"});
    let numberOfEntries = 0;
    for await (const entry of entries) {
      //Fix incorrect casing of Planetscale
      const dbName = entry.value.dbName === 'Planetscale' ? 'PlanetScale' : entry.value.dbName;
      const region = regionMapper(entry.value.regionId);

      const statsForRegion = regions.get(entry.value.regionId) || new Map<string, DbPerfRunSummary>();
      
      const statsForDb = statsForRegion.get(dbName) || {
        writePerformanceStats: [],
        atomicWritePerformanceStats: [],
        eventualReadPerformanceStats: [],
        strongReadPerformanceStats: [],
      };
      regions.set(entry.value.regionId, statsForRegion);
      statsForRegion.set(dbName, statsForDb);

      statsForDb.writePerformanceStats.push(entry.value.writePerformance);
      statsForDb.atomicWritePerformanceStats.push(entry.value.atomicWritePerformance);
      statsForDb.eventualReadPerformanceStats.push(entry.value.eventualReadPerformance);
      statsForDb.strongReadPerformanceStats.push(entry.value.strongReadPerformance);
      numberOfEntries++;
    }

    const entriesListPerf = Math.round(Date.now() - startEntriesListPerf);

    //Run new local tests
    const [denoKvPerf, upstashRedisPerf, faunaPerf, planetScalePerf, dynamoDbPerf] = await Promise.all([
      testDenoKv(), testUpstashRedis(), testFauna(), testPlanetscale(), testDynamoDB()
    ]);

    //Add new local tests to summary
    const localPerf = [denoKvPerf, dynamoDbPerf, faunaPerf, planetScalePerf, upstashRedisPerf];
    for (const run of localPerf) {
      if (run.eventualReadPerformance === -1 && run.strongReadPerformance === -1) {
        continue;
      }

      if (regions.get(run.regionId) != undefined) {
        regions.get(run.regionId)!.get(run.dbName)!.writePerformanceStats.push(run.writePerformance);
        regions.get(run.regionId)!.get(run.dbName)!.atomicWritePerformanceStats.push(run.atomicWritePerformance);
        regions.get(run.regionId)!.get(run.dbName)!.eventualReadPerformanceStats.push(run.eventualReadPerformance);
        regions.get(run.regionId)!.get(run.dbName)!.strongReadPerformanceStats.push(run.strongReadPerformance);
      }
    }

    return await ctx.render({measurement: localPerf, entriesListPerf, numberOfEntries, summary: regions});
  },
};

export default function Home(data: PageProps<PerfProps>) {
  const { measurement, summary } = data.data;
  const sortedRegions = Array.from(summary.keys()).sort((a, b) => a.localeCompare(b));
  
  function outputPerformance(performance: number): string {
    if (performance === -1) {
      return "-";
    } else if (performance === -99) {
      return "Error";
    } else {
      return performance + "ms";
    }
  }

  return (
    <>
      <Head>
        <title>Global database comparison on Deploy</title>
        <style>
          {`:root {
            color-scheme: dark;
          }`}
        </style>
      </Head>
      <body class="bg-[#202020] text-gray-100 w-full h-full font-['proxima-nova, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, sans-serif']">
        <div class="opacity-100 opacity-0"></div>
        <div class="p-4 mx-auto max-w-screen-md font-light">
          <img src="/graph.png" alt="Image of a network graph"/>
          <h1 class="mb-8 mt-8 text-3xl font-bold md:text-4xl lg:text-4xl">Global database comparison</h1>
          <h2 class="">Looking at Deno KV, DynamoDB, Fauna, PlanetScale and Upstash Redis on Deno Deploy</h2>
          <p class="mb-8 mt-5">By Chris Knight, 20/06/2023</p>
          <p class="italic">
            Deno recently launched a new global database, KV.  Is it any good?  In this post, we'll explore KV and other globally distributed databases
            to see how KV stacks up and what the best options are for use in Deno Deploy, examining latencies, characteristics 
            and ease of use for performing common database interactions.
          </p>
          <hr class="w-[50%] m-auto mt-8 mb-8"/>
          <h2 class="mt-8 text-2xl font-bold">Contents</h2>
          <ul class="list-decimal ml-7 mt-3">
            <li> <a class={linkStyles} href="#introduction">Introduction</a></li>
            <li> <a class={linkStyles} href="#understanding_database_consistency">Understanding database consistency</a></li>
            <li> <a class={linkStyles} href="#global_databases_for_deploy">Global database options for Deploy</a></li>
            <li> <a class={linkStyles} href="#latency_experiment">Latency experiment</a></li>
            <li> <a class={linkStyles} href="#db_latencies_from_your_location">Latencies from your location</a></li>
            <li> <a class={linkStyles} href="#db_latencies_from_all_over_the_world">Latencies from all over the world</a></li>
            <li> <a class={linkStyles} href="#analysis">Analysis</a></li>
            <li> <a class={linkStyles} href="#conclusions">Final thoughts</a></li>
          </ul>
          <hr class="w-[50%] m-auto mt-8 mb-8"/>

          <Introduction/>
          <UnderstandingConsistency/>            
          <Databases/>
          <LatencyExperiment/>

          <div id="db_latencies_from_your_location">&nbsp;</div>
          <h2 class="text-2xl font-bold">Database latencies from your location</h2>
          <p class="mt-3">
            Upon loading this page, the following results were recorded for database requests from the Deno Deploy application (running
            in the region closest to you) to the various databases:
          </p>
          <p class="mt-8 text-l"><span class="font-bold">Your Deno Deploy region:</span> {regionMapper(measurement[0].regionId)}</p>
          <div class="mt-5 overflow-x-auto border-1 rounded-md">
            <table class="min-w-full text-left text-sm font-light bg-[#202020]">
              <thead class="border-b font-medium">
                <tr>
                  <th class="sticky left-0 z-10 px-6 py-3 bg-[#202c2c]">DB</th>
                  <th class="min-w-[100px] bg-[#202c2c]">Write</th>
                  <th class="min-w-[100px] bg-[#202c2c]">Transactional write</th>
                  <th class="min-w-[100px] bg-[#202c2c]">Eventual read</th>
                  <th class="min-w-[100px] bg-[#202c2c]">Strong read</th>
                </tr>
              </thead>
              <tbody>
                {measurement.map(db => {
                  return (
                    <tr class="border-b">
                      <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">{db.dbName}</td>
                      <td>{outputPerformance(db.writePerformance)}</td>
                      <td>{outputPerformance(db.atomicWritePerformance)}</td>
                      <td>{outputPerformance(db.eventualReadPerformance)}</td>
                      <td>{outputPerformance(db.strongReadPerformance)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div id="db_latencies_from_all_over_the_world">&nbsp;</div>
          <h2 class="text-2xl font-bold">Database latencies from all over the world</h2>
          <p class="mt-3">
            Performance results from everyone who has loaded this page are summarised below.  
            <span class="block mt-3 text-xs">(Entries are held in Deno KV which returned and 
            processed {data.data.numberOfEntries.toLocaleString()} performance entries in {data.data.entriesListPerf}ms using eventual 
            consistent reads.)</span>
          </p>
          <div class="mt-5">
            <span class="inline">Show results for: <ResultsSelector regions={sortedRegions}/></span>
          </div>
          <div id="results" class="mt-5">
            <OperationAndDbResultsTables summary={summary} />
            {
              sortedRegions.map(region => <RegionResultTable region={region} summary={summary} />) 
            }
          </div>

          <Analysis/>
          <Conclusion/>
        </div>
      </body>
    </>
  );
}
