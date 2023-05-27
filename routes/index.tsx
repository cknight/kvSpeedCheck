import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import OperationAndDbResultsTables from "../componets/operationResultsTable.tsx";
import RegionResultTable from "../componets/regionResultTable.tsx";
import ResultsSelector from "../componets/resultsSelector.tsx";
import { testDenoKv } from "../db/denoKv.ts";
import { testDynamoDB } from "../db/dynamodb.ts";
import { testFauna } from "../db/fauna.ts";
import { testPlanetscale } from "../db/planetscale.ts";
import { testUpstashRedis } from "../db/upstashRedis.ts";
import { kv, regionMapper } from "../db/util.ts";
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
        <style>
          {`:root {
            color-scheme: dark;
          }`}
        </style>
      </Head>
      <body class="bg-[#202020] text-gray-100 w-full h-full font-['sans-serif']">
        <div class="hidden opacity-100 opacity-0"></div>
        <div class="p-4 mx-auto max-w-screen-md">
          <div id="blog" class="hidden">

            <img src="/graph.png" alt="Image of a network graph"/>
            <h1 class="mb-8 mt-8 text-3xl font-bold md:text-4xl lg:text-4xl">Deploy Edge DB comparison</h1>
            <p class="mb-8">By Chris Knight, 20/05/2023</p>
            <p class="italic">
              Deno recently launched a new global database, KV.  In this post, we'll explore and compare a number of global
              database providers, including KV, looking at latencies, characteristics and ease of use for performing common
              database interactions.
            </p>
            <hr class="w-[50%] m-auto mt-8 mb-8"/>

            <h2 class="mt-8 text-2xl font-bold">Introduction</h2>
            <p class="mt-3">
              Before the cloud came along, a typical web application architecture would consist of a web server and a database.
              These typically were hosted in the same datacentre.  This worked well for application teams (with everything
              in the same physical location), but not so well for users far away from the datacentre.  The latency for requests
              to the server could significantly impact the user experience.
              <img src="/traditional_architecture.png" alt="Traditional architecture diagram" class=""/>
              To help solve this problem of users far away, a new concept arrived, sometimes referred to as Edge hosting, where your application
              would be served from multiple global locations with the user being served from the closest location.  This solved
              one problem of long latencies between the user and the server, however, in some ways actually made the experience
              worse as all those server to database calls were still going back to the original datacentre which could be far
              away from the user.
              <img src="/edge_app_architecture.png" alt="Edge application architecture diagram" class=""/>
              The next evolution in this journey are edge databases, hosted in multiple datacentres around the world.  By bringing
              the database closer to the server, the latency for database calls can be significantly reduced.  Hooray!  Problem solved right?
              Well, not so fast.  It turns out that managing consistent state across databases spread around the world is a seriously hard
              problem.  There are a number of different approaches to solving this problem, each with tradeoffs. A typical approach to this
              problem is to have a primary region where all writes are sent to, and then asynchronously replicate those writes to other 
              regions. Writes can be potentially slower depending on how far away the primary region is from the user.  Depending on the consistency
              model of the database, you may have two choices:  strong reads which guarantee the most up to date data, but may be slower as these
              must be done to the primary region, or eventual reads which are faster as they can be read from the database region closest to
              the server, but may return stale data.
              <img src="/edge_server_and_db_architecture.png" alt="Edge server and database architecture diagram" class=""/>
              As you can see the diagram above, if your application can tolerate eventual reads for some or most data, you can potentially save
              a significant amount of latency by reading from the closest region.  This is the approach that Deno KV takes. 
            </p>

            <h2 class="mt-8 text-2xl font-bold">The Databases</h2>
            <p class="mt-3">
              In this post, we'll be comparing the following databases:

            </p>
          </div>
          <p class="mt-3">
            Loading this page sent database write and read requests to the below databases.  The requests 
            were sent from a Deno Deploy application running in a Google Cloud Platform (GCP) datacentre. 
            Where the operation was sent (e.g. which region the database is in) depends on how the DB provider
            manages their network. The network latency between you and the Deploy instance is not included 
            in any figures below.
          </p>
          <p class="mt-8 text-2xl"><span class="font-bold">Your Deno Deploy region:</span> GCP - {regionMapper(measurement[0].regionId)}</p>
          <p class="mt-5 text-2xl font-bold">Your results</p>
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

          <p class="mt-10 text-2xl font-bold">All results</p>
          <p class="text-xs mt-3">(Deno KV returned and processed {data.data.numberOfEntries} performance entries in {data.data.entriesListPerf}ms using eventual consistent reads)</p>
          <span class="inline">Show results for: <ResultsSelector regions={sortedRegions}/></span>
          <div id="results" class="mt-5">
            <OperationAndDbResultsTables summary={summary} />
            {
              sortedRegions.map(region => <RegionResultTable region={region} summary={summary} />) 
            }
          </div>
        </div>
      </body>
    </>
  );
}
