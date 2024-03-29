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
import { kv, linkStyles, regionMapper } from "../utils/util.ts";
import { DbPerfRun, REGION_PAGE_LOADS, STATS, Stats } from "../types.ts";

interface PerfProps {
  measurement: DbPerfRun[];
  entriesListPerf: number;
  numberOfEntries: number;
  regionPageLoads: Map<string, number>;
  perfStats: Map<string, Stats>;
  regions: Set<string>;
  dbs: Set<string>;
}

// Cache the results of previous runs in the isolate for reuse

//Map of <regionId>.<dbName>.<op> to Stats
const perfStats = new Map<string, Stats>();

//Map of number of page loads per region
let regionPageLoads: Map<string, number> = new Map();

const regions: Set<string> = new Set();
const dbs: Set<string> = new Set();

let numberOfEntries = 0;
let entriesListPerf = 0;

export const handler: Handlers = {
  async GET(req, ctx) {
    if (numberOfEntries === 0) {
      //Get previous runs from all users
      const startEntriesListPerf = Date.now();

      const result = await kv.get([REGION_PAGE_LOADS]);
      if (result.value) {
        regionPageLoads = result.value as Map<string, number>;
      }

      const entries = kv.list({ prefix: [STATS] }, {
        consistency: "eventual",
      });
      for await (const entry of entries) {
        numberOfEntries++;
        const statsKey = entry.key[1] as string;
        const regionId = statsKey.split(".")[0]; //<regionId>.<dbName>.<op>
        const db = statsKey.split(".")[1]; //<regionId>.<dbName>.<op>
        const run = entry.value as Stats;
        perfStats.set(statsKey, run);

        regions.add(regionId);
        dbs.add(db);
      }

      entriesListPerf = Math.round(Date.now() - startEntriesListPerf);
      console.log(
        `Retrieved ${numberOfEntries} stats entries in ${entriesListPerf}ms`,
      );
    } else {
      console.log(
        "Using cached results of",
        numberOfEntries,
        "previous runs across",
        regions.size,
        "regions",
      );
    }

    //Run new local tests
    const [
      denoKvPerf,
      upstashRedisPerf,
      faunaPerf,
      planetScalePerf,
      dynamoDbPerf,
    ] = await Promise.all([
      testDenoKv(),
      testUpstashRedis(),
      testFauna(),
      testPlanetscale(),
      testDynamoDB(),
    ]);

    //Add new local tests to summary
    const localPerf = [
      denoKvPerf,
      dynamoDbPerf,
      faunaPerf,
      planetScalePerf,
      upstashRedisPerf,
    ];

    return await ctx.render({
      measurement: localPerf,
      entriesListPerf,
      numberOfEntries,
      regionPageLoads,
      perfStats,
      regions,
      dbs,
    });
  },
};

export default function Home(data: PageProps<PerfProps>) {
  const { measurement } = data.data;
  //sort regions
  const sortedRegions = Array.from(data.data.regions).sort((a, b) =>
    regionMapper(a).localeCompare(regionMapper(b))
  );

  function outputPerformance(performance: number): string {
    if (performance === -1) {
      return "-";
    } else if (performance === -99) {
      return "Error";
    } else {
      return performance + "ms";
    }
  }

  const totalPageLoads = Array.from(data.data.regionPageLoads.values()).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <>
      <Head>
        <title>Global database comparison on Deploy</title>
        <meta
          name="description"
          content="Comparing latencies, characteristics and features of Deno KV, DynamoDB, Fauna, PlanetScale and Upstash Redis on Deno Deploy"
        />
        <meta
          property="og:title"
          content="Global database comparison on Deploy"
        />
        <meta
          property="og:description"
          content="Comparing latencies, characteristics and features of Deno KV, DynamoDB, Fauna, PlanetScale and Upstash Redis on Deno Deploy"
        />
        <meta
          property="og:image"
          content="https://global-db-comparison.deno.dev/graph.png"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://global-db-comparison.deno.dev/"
        />
        <meta property="og:site_name" content="Blog post and web application" />
        <meta name="twitter:card" content="summary_large_image" />
        <style>
          {`:root {
            color-scheme: dark;
          }`}
        </style>
      </Head>
      <body class="bg-[#202020] text-gray-100 w-full h-full font-['proxima-nova, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, sans-serif']">
        <div class="opacity-100 opacity-0"></div>
        <div class="p-4 mx-auto max-w-screen-md font-light">
          <img src="/graph.png" alt="Image of a network graph" />
          <h1 class="mb-8 mt-8 text-3xl font-bold md:text-4xl lg:text-4xl">
            Global database comparison
          </h1>
          <h2 class="">
            Looking at Deno KV, DynamoDB, Fauna, PlanetScale and Upstash Redis
            on Deno Deploy
          </h2>
          <p class="mb-8 mt-5">By Chris Knight, 20/06/2023 (last updated 19/09/23)</p>
          <p class="italic">
            Deno recently launched a new global database, KV. Is it any good? In
            this post, we'll explore KV and other globally distributed databases
            to see how KV stacks up and what the best options are for use in
            Deno Deploy, examining latencies, characteristics and ease of use
            for performing common database interactions.
          </p>
          <hr class="w-[50%] m-auto mt-8 mb-8" />
          <h2 class="mt-8 text-2xl font-bold">Contents</h2>
          <ul class="list-decimal ml-7 mt-3">
            <li>
              <a class={linkStyles} href="#introduction">Introduction</a>
            </li>
            <li>
              <a class={linkStyles} href="#understanding_database_consistency">
                Understanding database consistency
              </a>
            </li>
            <li>
              <a class={linkStyles} href="#global_databases_for_deploy">
                Global database options for Deploy
              </a>
            </li>
            <li>
              <a class={linkStyles} href="#latency_experiment">
                Latency experiment
              </a>
            </li>
            <li>
              <a class={linkStyles} href="#db_latencies_from_your_location">
                Latencies from your location
              </a>
            </li>
            <li>
              <a
                class={linkStyles}
                href="#db_latencies_from_all_over_the_world"
              >
                Latencies from all over the world
              </a>
            </li>
            <li>
              <a class={linkStyles} href="#analysis">Analysis</a>
            </li>
            <li>
              <a class={linkStyles} href="#conclusions">Final thoughts</a>
            </li>
          </ul>
          <hr class="w-[50%] m-auto mt-8 mb-8" />

          <Introduction />
          <UnderstandingConsistency />
          <Databases />
          <LatencyExperiment />

          <div id="db_latencies_from_your_location">&nbsp;</div>
          <h2 class="text-2xl font-bold">
            Database latencies from your location
          </h2>
          <p class="mt-3">
            Upon loading this page, the following results were recorded for
            database requests from the Deno Deploy application (running in the
            region closest to you) to the various databases:
          </p>
          <p class="mt-8 text-l">
            <span class="font-bold">Your Deno Deploy region:</span>{" "}
            {regionMapper(measurement[0].regionId)}
          </p>
          <div class="mt-5 overflow-x-auto border-1 rounded-md">
            <table class="min-w-full text-left text-sm font-light bg-[#202020]">
              <thead class="border-b font-medium">
                <tr>
                  <th class="sticky left-0 z-10 px-6 py-3 bg-[#202c2c]">DB</th>
                  <th class="min-w-[100px] bg-[#202c2c]">Write</th>
                  <th class="min-w-[100px] bg-[#202c2c]">
                    Transactional write
                  </th>
                  <th class="min-w-[100px] bg-[#202c2c]">Eventual read</th>
                  <th class="min-w-[100px] bg-[#202c2c]">Strong read</th>
                </tr>
              </thead>
              <tbody>
                {measurement.map((db) => {
                  return (
                    <tr class="border-b">
                      <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">
                        {db.dbName}
                      </td>
                      <td>{outputPerformance(db.writePerformance)}</td>
                      <td>{outputPerformance(db.atomicWritePerformance)}</td>
                      <td>{outputPerformance(db.eventualReadPerformance)}</td>
                      <td>{outputPerformance(db.strongReadPerformance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div id="db_latencies_from_all_over_the_world">&nbsp;</div>
          <h2 class="text-2xl font-bold">
            Database latencies from all over the world
          </h2>
          <p class="mt-3">
            Performance results from everyone who has loaded this page are
            summarised below, with stats updated daily.
            <span class="block mt-3 text-xs">
              (Performance entries are held in Deno KV which returned and
              processed statistics for{"  "}{totalPageLoads}{" "}
              performance measurements across {regions.size} regions in{" "}
              {data.data.entriesListPerf}ms.)
            </span>
          </p>
          <div class="mt-5">
            <span class="inline">
              Show results for: <ResultsSelector regions={sortedRegions} />
            </span>
          </div>
          <div id="results" class="mt-5">
            <OperationAndDbResultsTables
              stats={data.data.perfStats}
              regions={data.data.regions}
              dbs={data.data.dbs}
            />
            {sortedRegions.map((region) => (
              <RegionResultTable
                region={region}
                stats={data.data.perfStats}
                dbs={data.data.dbs}
                pageLoads={data.data.regionPageLoads.get(region)!}
              />
            ))}
          </div>

          <Analysis />
          <Conclusion />
        </div>
      </body>
    </>
  );
}
