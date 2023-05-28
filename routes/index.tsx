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
        <div class="opacity-100 opacity-0"></div>
        <div class="p-4 mx-auto max-w-screen-md">
          <div id="blog" class="hidden">

            <img src="/graph.png" alt="Image of a network graph"/>
            <h1 class="mb-8 mt-8 text-3xl font-bold md:text-4xl lg:text-4xl">Global database comparison</h1>
            <p class="mb-8">By Chris Knight, 20/05/2023</p>
            <p class="italic">
              Deno recently launched a new global database, KV.  To properly test drive KV, in this post we'll explore 
              and compare a number of different global databases, all accessed via Deno Deploy, examining latencies, characteristics 
              and ease of use for performing common database interactions.
            </p>
            <hr class="w-[50%] m-auto mt-8 mb-8"/>

            <h2 class="mt-8 text-2xl font-bold">Introduction</h2>
            <p class="mt-3">
              Before the cloud came along, a typical web application architecture would consist of a web server and a database.
              These typically were hosted in the same datacentre.  This worked well for application teams (with everything
              in the same physical location), but not so well for users far away from the datacentre.  The time 
              it takes for data to travel a network, known as latency, for requests to the server could significantly impact 
              the user experience.
              <img src="/traditional_architecture.png" alt="Traditional architecture diagram" class=""/>
              To help solve this problem of users far away, a new concept arrived, sometimes referred to as Edge hosting, where your application
              would be served from multiple global locations with the user being served from the closest location.  This solved
              one problem of long latencies between the user's browser and the server. However, ironically, this 
              made the experience worse for some applications and users as all those server to database calls were still going back to the original 
              datacentre which could be far away from the user.
              <img src="/edge_app_architecture.png" alt="Edge application architecture diagram" class=""/>
              The next evolution in this journey are global (sometimes referred to as edge) databases, hosted in multiple datacentres
              around the world.  By bringing the database closer to the server, both server and database are now closer to all your users 
              around the globe and the latency for database calls can be significantly reduced.  Hooray!  Problem solved right?
              Well, not so fast.  It turns out that managing consistent state across databases spread around the world is a Seriously Hard
              Problem&trade;.  
            </p>
            <p class="mt-3">
              There are a number of different approaches to solving this problem, each with tradeoffs. A typical approach is to 
              have a single primary region where all writes are sent to, and then asynchronously replicate those writes to the databases in other 
              regions (sometimes referred to as replicas). Writes can be potentially slower depending on how far away the primary region is 
              from the user.  Depending on the consistency
              model of the database (more on this below), you may have two choices:  strong reads which guarantee the most up to date data, but may be 
              slower as these must be done to the primary region, or eventual reads which are faster as they can be read from the database 
              region closest to the server, but may return stale data.
              <img src="/edge_server_and_db_architecture.png" alt="Edge server and database architecture diagram" class=""/>
              As you can see the diagram above, if your application can tolerate eventual reads for some or most data, you can potentially save
              a significant amount of latency by reading from the closest region.  This is the approach that Deno KV takes. 
            </p>

            <h2 class="mt-8 text-2xl font-bold">Consistency</h2>
            <p class="mt-3">
              In an ideal world, an update to one database would instantly update all the replica databases around the world making 
              them all consistent with each other.  Unfortunately, the same latency issues that we are trying to solve with global databases
              work against us here, as updating all the global replicas takes time. 
            </p>
            <p class="mt-3">
              There are a number of different consistency models that databases can support.  Two common ones are:
              <ul class="list-disc ml-7 mt-3">
                <li>Strong consistency:  All reads are guaranteed to return the most recent write at the cost of higher latency (depending on your request region)</li>
                <li>Eventual consistency:  Reads may return stale data, typically at much lower latencies, but will eventually return the most recent write.  Under
                  normal circumstances, you would expect databases to be consistent within a second or so but many factors can influence this.
                </li>
              </ul>
            </p>
            <p class="mt-3">
              The consistency model that you use for your application will depend on your application's requirements.  If you are building a banking
              application where it is critical to ensure financial data between parties is consistent when reading data, you will likely want to use strong consistency.  
              However, if you are building a social media application, eventual consistency of your user's posts may be a better choice as having 
              slightly stale posts is potentially a worthwhile trade-off for the significant performance boost of eventual reads.
            </p>

            <h2 class="mt-8 text-2xl font-bold">Databases</h2>
            <p class="mt-3">
              In this post, we'll be comparing the following databases:

            </p>
          </div>

          <h2 class="mt-8 text-2xl font-bold">Use Case</h2>
          <p class="mt-3">
            In order to compare the databases, we need a frame of reference application. The one used for this experiment is:
            <br/><br/>
            <ul class="list-disc ml-7">
              <li>The app server will be deployed on the edge (capable of running simultaneously on a multitude of servers around the
                 world), using Deno Deploy as your chosen edge platform</li>
              <li>There will be several read and writes from the app server to the database</li>
              <li>The users of the app are spread across the globe</li>
              <li>Performance and user experience is critical</li>
            </ul>
          </p>

          <h2 class="mt-8 text-2xl font-bold">Experiment</h2>
          <p class="mt-3">
            Loading this page sent basic database write and read requests to each database.  The DB operations 
            were executed from a Deno Deploy application running in the Google Cloud Platform (GCP) 
            region/datacentre closest to you. Where the read or write operation was sent (i.e. which DB region), and therefore
            the latency experienced, depends on how the DB provider manages their network, where the primary database is, 
            how many replicas are available, and what operation was used, amongst some factors influencing the latency.
          </p>
            
          <p class="mt-3">
            All results represent the time for the database operation to execute, including the latency between the server
            (i.e. Deno Deploy application instance) and the database. The network latency between your browser and the 
            server is not included in any result below.
          </p>

          <p class="mt-3">
            <span class="font-bold text-red-500">Important:</span> Please read the conclusions on each DB below to understand
            the results with the proper context.  Generally speaking, the results are not always directly comparable as the DBs have different
            setups, use cases, primary and replica regions, configuration, etc.  The results are meant to give you a general idea
            of the performance of each DB, but should not be used to make a final decision on which DB to use.  You should always
            do your own investigation, testing and benchmarking to determine which DB is best for your use case.
          </p>

          <h2 class="mt-8 text-2xl font-bold">Your Results</h2>
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
                  <th class="min-w-[100px] bg-[#202c2c]">Atomic write</th>
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

          <h2 class="mt-8 text-2xl font-bold">All Results</h2>
          <p class="mt-3">
            Performance results from everyone who has loaded this page are stored in Deno KV and summarised below.  
            To compile the data used in the tables below, Deno KV returned and 
            processed {data.data.numberOfEntries.toLocaleString()} performance entries in {data.data.entriesListPerf}ms using eventual 
            consistent reads.
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
        </div>
      </body>
    </>
  );
}
