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
const linkStyles = "text([#0000ee] visited:[#551A8B] dark:[#8cb4ff] dark:visited:[#cda9ef])";

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
    const [denoKvPerf, upstashRedisPerf, faunaPerf, planetScalePerf, dynamoDbPerf] = await Promise.all([
      testDenoKv(), testUpstashRedis(), testFauna(), testPlanetscale(), testDynamoDB()
    ]);

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
          <div id="blog" class="zzzhidden">

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
              <li> <a class={linkStyles} href="#db_latencies_from_your_location">DB latencies from your location</a></li>
              <li> <a class={linkStyles} href="#db_latencies_from_all_over_the_world">DB latencies from all over the world</a></li>
              <li> <a class={linkStyles} href="#analysis">Analysis</a></li>
              <li> <a class={linkStyles} href="#conclusions">Final thoughts</a></li>
            </ul>
            <hr class="w-[50%] m-auto mt-8 mb-8"/>

            <div id="introduction">&nbsp;</div>
            <h2 class="text-2xl font-bold">Introduction</h2>
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
              datacentre which could be far away from the user leading to increased overall response times.
              <img src="/edge_app_architecture.png" alt="Edge application architecture diagram" class=""/>
              The next evolution in this journey are globally distributed databases, hosted in multiple regions
              around the world.  By bringing the database closer to the user and server, both server and database are now closer to all your users 
              around the globe and the latency for database calls can be significantly reduced. Other benefits include increased scalability
              as your traffic is split across many instances, as well as high availability with the ability to provide a database service even
              if one or more database nodes goes offline. Hooray!  Problem solved right?
              Well, not so fast.  It turns out that managing consistent state across each database instance spread around the world is a Seriously Hard
              Problem&trade;.  
            </p>
            <p class="mt-3">
              There are a number of different approaches to solving this problem, each with trade-offs. One approach is to 
              have a single primary region where all writes are sent to, and then asynchronously replicate those writes to the databases in other 
              regions (often referred to as replicas). Writes can be potentially slower depending on how far away the primary region is 
              from the user.  Depending on the consistency
              model of the database (more on this below), reads can be looked at two ways:  
              <ul class="list-disc ml-7 mt-3">
                <li>reading data which guarantees the most up to date data (referred to as strong consistency reads), but may be slower as these 
                  must be read from the primary region</li>
                <li>faster reads from the database region closest to the user or server, but may return stale data (referred 
                  to as eventual consistency reads) as the most recent updates in the primary database might not have made it to the
                  user's closest database yet</li>
              </ul>
              <img src="/edge_server_and_db_architecture.png" alt="Edge server and database architecture diagram" class=""/>
              As you can see the diagram above, if your application can tolerate eventual reads for some or most data, you can potentially save
              a significant amount of latency by not going all the way back to the primary region for reads.  The downside is that you may read
              data which has been updated on the primary region but not yet replicated to the region you are reading from. This is the approach 
              that Deno KV takes with the nice bonus that KV lets you choose if you want to read from a primary or replica database. 
            </p>

            <div id="understanding_database_consistency">&nbsp;</div>
            <h2 class="text-2xl font-bold">Understanding database consistency</h2>
            <p class="mt-3">
              In an ideal world, an update to one database would instantly update all the replica databases around the world making 
              them all consistent with each other.  Unfortunately, the same latency issues that we are trying to solve with global databases
              work against us here, as updating all the global replicas takes time.  The speed of light is only so fast.
            </p>
            <p class="mt-3">
              There are a number of different consistency models that databases can support.  Two common ones are:
              <ul class="list-disc ml-7 mt-3">
                <li>Strong consistency:  All reads are guaranteed to return the most recent write at the cost of higher latency</li>
                <li>Eventual consistency:  Reads may return old/stale data, typically at much lower latencies, but will eventually return the most recent write.  Under
                  normal circumstances, you would expect database writes to be consistent within a number of seconds but many factors can influence this.
                </li>
              </ul>
            </p>
            <p class="mt-3">
              The  <a class={linkStyles} href="https://en.wikipedia.org/wiki/PACELC_theorem">PACELC theorem</a> nicely describes the trade-offs between consistency and latency.  Stronger consistency means higher latency
              and the reverse is true as well with weaker consistency allowing for lower latency.
            </p>
            <p class="mt-3">
              Let's imagine you are located in Australia and the primary region of the database in the US but with a replica in Australia. If
              someone from France updates a record on the database (which gets sent to the US) immediately before you read that record in Australia, depending on
              your consistency model, you may get the old value (eventual consistency) from the Australia replica or the new value (strong 
              consistency) from the US primary region.
            </p>
            <p class="mt-3">
              The consistency model that you use for your application will depend on your application's requirements and what the database
              is capable of.  If you are building a banking application where it is critical to ensure a financial transaction correctly debits 
              one account and credits another for the same amount, you will likely want to use strong consistency and 
              &nbsp; <a class={linkStyles} href="https://en.wikipedia.org/wiki/ACID">ACID transactions</a>.  
              However, if you are building a social media application, eventual consistency of your user's posts may be a better choice as having 
              slightly stale posts is potentially a worthwhile trade-off for the significant performance boost of eventual reads.
            </p>

            <div id="global_databases_for_deploy">&nbsp;</div>
            <h2 class="text-2xl font-bold">Global database options for Deploy</h2>
            <p class="mt-3">
              Running applications on  <a class={linkStyles} href="https://deno.com/deploy">Deno Deploy</a> means serving requests from locations around the globe, 
              from a location closest to the user. Ideally, the database would be located close to the server so that latency between the 
              server and database is minimised for all the database calls made from the server.  Therefore an ideal database for Deno Deploy
              would be one which was globally distributed in multiple regions to decrease latency and thus provide a better user experience. 
              In this post, we'll experiment with the following subset of serverless databases which all offer multi-region replication and 
              work with Deno Deploy:
            </p>
              <h3 class="mt-3 text-xl font-bold">
                <svg class="inline mr-3 text-default h-10 flex-none dark:text-gray-900" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Deno Logo"><g clip-path="url(#clip0_29_599)"><path d="M15 0C23.2843 0 30 6.71572 30 15C30 23.2843 23.2843 30 15 30C6.71572 30 0 23.2843 0 15C0 6.71572 6.71572 0 15 0Z" fill="currentColor"></path><path d="M14.6635 22.3394C14.2788 22.2357 13.8831 22.4584 13.7705 22.8381L13.7655 22.8558L12.7694 26.5472L12.7649 26.565C12.6711 26.9498 12.9011 27.3414 13.2858 27.4451C13.6704 27.549 14.0661 27.3263 14.1787 26.9465L14.1837 26.9289L15.1797 23.2375L15.1843 23.2196C15.1911 23.1919 15.1962 23.164 15.1997 23.1362L15.2026 23.1084L15.179 22.9888L15.1445 22.8166L15.1227 22.7091C15.076 22.619 15.0111 22.5396 14.932 22.4759C14.853 22.4123 14.7615 22.3658 14.6635 22.3394ZM7.7224 18.5379C7.70424 18.5741 7.68883 18.6123 7.67658 18.6522L7.66967 18.6763L6.67358 22.3677L6.669 22.3856C6.57525 22.7704 6.80524 23.1619 7.1899 23.2657C7.57451 23.3695 7.97026 23.1469 8.08287 22.7671L8.08779 22.7494L8.99096 19.4023C8.51793 19.1518 8.09336 18.8628 7.7224 18.5379ZM5.34707 14.2929C4.9624 14.1891 4.56666 14.4117 4.4541 14.7915L4.44912 14.8092L3.45303 18.5006L3.44846 18.5184C3.35471 18.9032 3.58469 19.2947 3.96936 19.3985C4.35397 19.5023 4.74971 19.2797 4.86232 18.8999L4.86725 18.8822L5.86334 15.1908L5.86791 15.173C5.96166 14.7882 5.73174 14.3967 5.34707 14.2929ZM27.682 13.4546C27.2973 13.3508 26.9015 13.5734 26.789 13.9532L26.784 13.9709L25.7879 17.6623L25.7833 17.6801C25.6896 18.0649 25.9196 18.4564 26.3042 18.5602C26.6889 18.664 27.0846 18.4414 27.1972 18.0616L27.2021 18.0439L28.1982 14.3525L28.2028 14.3347C28.2965 13.9499 28.0666 13.5584 27.682 13.4546ZM3.17781 8.52527C2.34361 10.0444 1.81243 11.7112 1.61377 13.4329C1.7088 13.5412 1.83381 13.619 1.97301 13.6563C2.35768 13.7602 2.75342 13.5375 2.86598 13.1577L2.87096 13.1401L3.86705 9.44865L3.87162 9.43084C3.96537 9.04599 3.73539 8.65447 3.35072 8.5507C3.2943 8.53547 3.23623 8.52694 3.17781 8.52527ZM25.159 8.5507C24.7744 8.44687 24.3786 8.66953 24.266 9.04933L24.2611 9.06697L23.265 12.7584L23.2604 12.7762C23.1667 13.161 23.3966 13.5526 23.7813 13.6563C24.1659 13.7602 24.5617 13.5375 24.6743 13.1577L24.6792 13.1401L25.6753 9.44865L25.6799 9.43084C25.7736 9.04599 25.5436 8.65447 25.159 8.5507Z" fill="white"></path><path d="M7.51285 5.04065C7.12824 4.93682 6.73249 5.15948 6.61988 5.53929L6.61495 5.55692L5.61886 9.24833L5.61429 9.26614C5.52054 9.65098 5.75052 10.0425 6.13519 10.1463C6.5198 10.2501 6.91554 10.0274 7.02816 9.64764L7.03308 9.63001L8.02917 5.9386L8.03374 5.92079C8.12749 5.53595 7.89751 5.14442 7.51285 5.04065ZM20.3116 5.73845C19.9269 5.63462 19.5312 5.85727 19.4186 6.23708L19.4136 6.25471L18.7443 8.73499C19.1779 8.94915 19.5917 9.20126 19.9809 9.48839L20.0453 9.53643L20.8279 6.63639L20.8324 6.61858C20.9262 6.23374 20.6963 5.84221 20.3116 5.73845ZM13.7968 1.57642C13.3296 1.61771 12.8647 1.68338 12.4043 1.77317L12.3066 1.79263L11.3782 5.23419L11.3736 5.252C11.2799 5.63684 11.5099 6.02837 11.8945 6.13214C12.2792 6.23596 12.6749 6.01331 12.7875 5.6335L12.7924 5.61587L13.7885 1.92446L13.7931 1.90665C13.8196 1.79831 13.8209 1.68533 13.7968 1.57642ZM22.9626 4.1263L22.7669 4.85169L22.7623 4.86944C22.6686 5.25429 22.8986 5.64581 23.2832 5.74958C23.6678 5.85341 24.0636 5.63075 24.1762 5.25095L24.1811 5.23331L24.2025 5.15462C23.8362 4.81205 23.4511 4.49009 23.0491 4.19022L22.9626 4.1263ZM17.1672 1.69677L16.8139 3.00593L16.8094 3.02374C16.7156 3.40858 16.9456 3.80011 17.3303 3.90388C17.7149 4.0077 18.1106 3.78505 18.2233 3.40524L18.2282 3.38761L18.6 2.00966C18.1624 1.88867 17.719 1.79001 17.2714 1.71405L17.1672 1.69677Z" fill="white"></path><path d="M9.69085 24.6253C9.80341 24.2455 10.1992 24.0229 10.5838 24.1266C10.9685 24.2303 11.1984 24.6219 11.1047 25.0068L11.1001 25.0246L10.3872 27.6664L10.2876 27.6297C9.85836 27.4694 9.43765 27.2873 9.0271 27.0839L9.68587 24.6429L9.69085 24.6253Z" fill="white"></path><path d="M14.4141 8.49082C10.0522 8.49082 6.65918 11.2368 6.65918 14.6517C6.65918 17.8769 9.78123 19.9362 14.6211 19.8331C15.0327 19.8243 15.1517 20.1008 15.2856 20.4734C15.4196 20.846 15.7796 22.8097 16.0665 24.3117C16.3233 25.656 16.5842 27.0052 16.7834 28.3596C19.9439 27.9418 22.8663 26.3807 25.0076 24.0261L22.7237 15.5088C22.1544 13.4518 21.489 11.5564 19.7283 10.1794C18.3118 9.07166 16.5122 8.49082 14.4141 8.49082Z" fill="white"></path><path d="M15.3516 10.957C15.8694 10.957 16.2891 11.3767 16.2891 11.8945C16.2891 12.4123 15.8694 12.832 15.3516 12.832C14.8338 12.832 14.4141 12.4123 14.4141 11.8945C14.4141 11.3767 14.8338 10.957 15.3516 10.957Z" fill="currentColor"></path></g><defs><clipPath id="clip0_29_599"><rect width="30" height="30" fill="white"></rect></clipPath></defs></svg>
                Deno KV</h3>
              <p class="mt-3">
                 <a class={linkStyles} href="https://deno.com/kv">Deno KV</a> is a new global key-value database from the Deno team (currently in private beta). Reads are strongly 
                consistent within the primary region and eventually consistent in replica regions. You can easily choose which consistency
                level you want for your reads. It is built on top of the 
                open source  <a class={linkStyles} href="https://www.foundationdb.org/">FoundationDB</a> (used by Apple's 
                iCloud) and there is no configuration or setup.  Data is replicated to at least 6 datacentres across 3 regions (US, Europe 
                and Asia).  Access is via a custom but  <a class={linkStyles} href="https://deno.land/api?s=Deno.Kv&unstable=">simple API layer</a>.  ACID 
                transactions are supported globally and 
                offer  <a class={linkStyles} href="https://jepsen.io/consistency/models/strict-serializable">strict serializability</a>, the strongest level of
                consistency possible.
              </p>
              <h3 class="mt-3 text-xl font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42.3 47" class="w-8 inline mr-3"><path style="fill:#813eef" d="M32.9 9.9c-2.9 1-4.3 2.7-5.3 5.4-.2.7-.9 1.5-1.6 2.1l2.4 2.6-7.6-5.3L0 0s1.5 9.8 2 13.4c.4 2.5 1 3.7 3 4.8l.8.4 3.4 1.8-2-1.1 9.4 5.2-.1.1L6.4 20c.5 1.8 1.6 5.4 2 7 .5 1.7 1 2.3 2.7 2.9l3 1.1 1.9-.7-2.4 1.6L1.7 47c7.9-7.4 14.6-10 19.5-12.1 6.3-2.7 10-4.5 12.5-10.7 1.8-4.4 3.1-10 4.9-12.2l3.7-4.7c0-.1-7.6 2-9.4 2.6z"></path></svg>
                Fauna</h3>
              <p class="mt-3">
                 <a class={linkStyles} href="https://fauna.com/">Fauna</a> is a serverless 
                NoSQL  <a class={linkStyles} href="https://fauna.com/blog/what-is-a-document-relational-database">document-relational</a> database offering 
                two query languages,  <a class={linkStyles} href="https://docs.fauna.com/fauna/current/api/fql/">Fauna QL (FQL)</a> and  <a class={linkStyles} href="https://docs.fauna.com/fauna/current/api/graphql/">GraphQL</a>.  During database creation,   
                you must choose between two  <a class={linkStyles} href="https://docs.fauna.com/fauna/current/learn/understanding/region_groups">region groups</a> to host your 
                database: US or Europe.  Data is replicated to 3 geographic regions within the region group (i.e. US or Europe), but never outside that region 
                group. For this experiment the US region group was chosen.  True global replication is possible (e.g. hosting in US, Europe and Aisa)
                but only for enterprise customers through their Virtual Private Fauna offering.
              </p>
              <p class="mt-3">
                Fauna offers strong consistency for all reads and writes as well as supporting ACID transactions.  Both Deno KV and Fauna provide
                the strongest consistency model of the databases in the experiment. Despite being a NoSQL
                database, a strength of Fauna is its relational database capabilities such as normalisation, joins and indexes.
              </p>
              <h3 class="mt-3 text-xl font-bold">
                <svg class="inline mr-3 w-8" viewBox="-16.5 0 289 289" preserveAspectRatio="xMidYMid">
                  <g>
                    <path d="M165.258,288.501 L168.766,288.501 L226.027,259.867 L226.98,258.52 L226.98,29.964 L226.027,28.61 L168.766,0 L165.215,0 L165.258,288.501" fill="#5294CF"></path>
                    <path d="M90.741,288.501 L87.184,288.501 L29.972,259.867 L28.811,257.87 L28.222,31.128 L29.972,28.61 L87.184,0 L90.785,0 L90.741,288.501" fill="#1F5B98"></path>
                    <path d="M87.285,0 L168.711,0 L168.711,288.501 L87.285,288.501 L87.285,0 Z" fill="#2D72B8"></path>
                    <path d="M256,137.769 L254.065,137.34 L226.437,134.764 L226.027,134.968 L168.715,132.676 L87.285,132.676 L29.972,134.968 L29.972,91.264 L29.912,91.296 L29.972,91.168 L87.285,77.888 L168.715,77.888 L226.027,91.168 L247.096,102.367 L247.096,95.167 L256,94.193 L255.078,92.395 L226.886,72.236 L226.027,72.515 L168.715,54.756 L87.285,54.756 L29.972,72.515 L29.972,28.61 L0,63.723 L0,94.389 L0.232,94.221 L8.904,95.167 L8.904,102.515 L0,107.28 L0,137.793 L0.232,137.769 L8.904,137.897 L8.904,150.704 L1.422,150.816 L0,150.68 L0,181.205 L8.904,185.993 L8.904,193.426 L0.373,194.368 L0,194.088 L0,224.749 L29.972,259.867 L29.972,215.966 L87.285,233.725 L168.715,233.725 L226.196,215.914 L226.96,216.249 L254.781,196.387 L256,194.408 L247.096,193.426 L247.096,186.142 L245.929,185.676 L226.886,195.941 L226.196,197.381 L168.715,210.584 L168.715,210.6 L87.285,210.6 L87.285,210.584 L29.972,197.325 L29.972,153.461 L87.285,155.745 L87.285,155.801 L168.715,155.801 L226.027,153.461 L227.332,154.061 L254.111,151.755 L256,150.832 L247.096,150.704 L247.096,137.897 L256,137.769" fill="#1A476F"></path>
                    <path d="M226.027,215.966 L226.027,259.867 L256,224.749 L256,194.288 L226.2,215.914 L226.027,215.966" fill="#2D72B8"></path>
                    <path d="M226.027,197.421 L226.2,197.381 L256,181.353 L256,150.704 L226.027,153.461 L226.027,197.421" fill="#2D72B8"></path>
                    <path d="M226.2,91.208 L226.027,91.168 L226.027,134.968 L256,137.769 L256,107.135 L226.2,91.208" fill="#2D72B8"></path>
                    <path d="M226.2,72.687 L256,94.193 L256,63.731 L226.027,28.61 L226.027,72.515 L226.2,72.575 L226.2,72.687" fill="#2D72B8"></path>
                  </g>
                </svg>DynamoDB</h3>
              <p class="mt-3">
                 <a class={linkStyles} href="https://aws.amazon.com/dynamodb/">DynamoDB</a> is a serverless NoSQL key-value database from AWS.  For access, it 
                supports a custom  <a class={linkStyles} href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html">JSON API</a> as 
                well as  <a class={linkStyles} href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ql-reference.html">PartiQL</a> (a SQL-compatible
                query language).  DynamoDB tables, by default, are deployed to a single region. To achieve a multi-region 
                setup, you can enable  <a class={linkStyles} href="https://aws.amazon.com/dynamodb/global-tables/">global tables</a> which creates identical tables in additional regions (in as many regions as you like). 
                Due to the complexity of managing global tables (see analysis below), only a single region in N. Virginia was configured for
                this experiment.
              </p>
              <p class="mt-3">
                Strong consistency is offered within a single region only but not for secondary indexes.  Global tables are eventually consistent 
                with each other.  DynamoDB also supports ACID transactions, but only within a single region.  Transactions are not ACID 
                compliant when replicating to other regions.  DynamoDB also integrates extremely well with other AWS services as well as offering
                a host of enterprise features such as encryption at rest and a multitude of back and restore options. 
              </p>
              <h3 class="mt-3 text-xl font-bold">
              <svg class="inline w-6 mr-3" viewBox="0 0 256 341" version="1.1" preserveAspectRatio="xMidYMid">
                    <g>
                        <path d="M0,298.416784 C56.5542815,354.970323 148.246768,354.970323 204.801032,298.416784 C261.354571,241.86252 261.354571,150.170106 204.801032,93.6158424 L179.200462,119.215688 C221.61634,161.631567 221.61634,230.401059 179.200462,272.816213 C136.785307,315.232092 68.0157428,315.232092 25.5998642,272.816213 L0,298.416784 Z" fill="#00C98D"></path>
                        <path d="M51.200362,247.216367 C79.4772765,275.493137 125.323122,275.493137 153.600615,247.216367 C181.877385,218.939598 181.877385,173.093028 153.600615,144.816259 L128.000769,170.416105 C142.139154,184.55449 142.139154,207.477412 128.000769,221.616521 C113.86166,235.754906 90.9387378,235.754906 76.800353,221.616521 L51.200362,247.216367 Z" fill="#00C98D"></path>
                        <path d="M256,42.415426 C199.445737,-14.1384753 107.753322,-14.1384753 51.1994207,42.415426 C-5.35485714,98.9696894 -5.35485714,190.662104 51.1994207,247.216367 L76.7989048,221.616521 C34.3841124,179.200643 34.3841124,110.431151 76.7989048,68.0159962 C119.214783,25.6001177 187.984275,25.6001177 230.39943,68.0159962 L256,42.415426 Z" fill="#00C98D"></path>
                        <path d="M204.800308,93.6158424 C176.523538,65.3390727 130.676245,65.3390727 102.399475,93.6158424 C74.1219813,121.893336 74.1219813,167.739181 102.399475,196.015951 L127.999321,170.416105 C113.860936,156.27772 113.860936,133.354797 127.999321,119.215688 C142.137706,105.077304 165.060629,105.077304 179.199738,119.215688 L204.800308,93.6158424 Z" fill="#00C98D"></path>
                        <path d="M256,42.415426 C199.445737,-14.1384753 107.753322,-14.1384753 51.1994207,42.415426 C-5.35485714,98.9696894 -5.35485714,190.662104 51.1994207,247.216367 L76.7989048,221.616521 C34.3841124,179.200643 34.3841124,110.431151 76.7989048,68.0159962 C119.214783,25.6001177 187.984275,25.6001177 230.39943,68.0159962 L256,42.415426 Z" fill-opacity="0.4" fill="#FFFFFF"></path>
                        <path d="M204.800308,93.6158424 C176.523538,65.3390727 130.676245,65.3390727 102.399475,93.6158424 C74.1219813,121.893336 74.1219813,167.739181 102.399475,196.015951 L127.999321,170.416105 C113.860936,156.27772 113.860936,133.354797 127.999321,119.215688 C142.137706,105.077304 165.060629,105.077304 179.199738,119.215688 L204.800308,93.6158424 Z" fill-opacity="0.4" fill="#FFFFFF"></path>
                    </g>
                </svg>
                Upstash Redis</h3>
              <p class="mt-3">
                 <a class={linkStyles} href="https://upstash.com/">Upstash</a> takes the well known in-memory  <a class={linkStyles} href="https://redis.io/">Redis database</a> a step further with a durable Redis compatible global database. 
                Access is via Redis APIs.  It offers per request pricing and which scales to zero price if not used (storage still 
                accrues cost).  Upstash Redis only offers eventual consistency.  For this experiment, a primary region of N. Virginia
                was configured with replicas setup in all available replica regions (California, Oregon, Frankfurt, Ireland, Singapore, 
                Sydney and Sao Paulo).  N.b. this would be a potentially expensive setup for a high volume application.
              </p>
              <h3 class="mt-3 text-xl font-bold">
              <svg class="inline mr-3 w-8 bg-white p-1" viewBox="0 0 256 256"preserveAspectRatio="xMidYMid">
                    <g>
                        <path d="M256,128.044218 C255.976145,198.701382 198.701382,255.976145 128.044218,256 L128.044218,256 Z M128,0 C179.977309,0 224.718545,30.9806545 244.765091,75.4833455 L75.4833455,244.765091 C68.2193455,241.492945 61.3149091,237.562764 54.84736,233.050182 L159.8976,128 L128,128 L37.4903855,218.509382 C14.3269236,195.346036 0,163.346036 0,128 C0,57.30752 57.3075782,0 128,0 Z" fill="#000000"></path>
                    </g>
                </svg>
                PlanetScale</h3>
              <p class="mt-3">
                 <a class={linkStyles} href="https://planetscale.com/">PlanetScale</a> offers a serverless MySQL-compatible database built on top 
                of  <a class={linkStyles} href="https://vitess.io/">Vitess</a> and is the only true relational database of the experiment.  
                It offers 11 AWS regions with 4 GCP regions. For this experiment, a primary region of N. Virginia was selected.  Additional replica 
                regions are only available on paid plans (starting at $29/month) and are therefore not included in this experiment.  Being a relational 
                database, access to the data is done via normal SQL queries.  A key offering is the ability to change the schema in 
                isolated branches, similar to a git workflow.  All data is automatically encrypted at rest.  Like MySQL, it only offers
                eventual consistency.
              </p>
              <p class="mt-3">
                Though serverless, PlanetScale isn't necessarily hands off as when your database becomes large  you may need to intervene
                and apply  <a class={linkStyles} href="https://www.digitalocean.com/community/tutorials/understanding-database-sharding">sharding</a>, 
                which can be complicated.
              </p>
              <h3 class="mt-3 text-xl font-bold">Summary</h3>
              <p class="mt-3">
              <div class="mt-5 overflow-x-auto border-1 rounded-md">
                <table class="min-w-full text-left text-sm font-light bg-[#202020]">
                  <thead class="border-b font-medium">
                    <tr>
                      <th class="sticky left-0 z-100 px-6 py-3 bg-[#202c2c]">Database</th>
                      <th class="min-w-[100px] bg-[#202c2c]">Type</th>
                      <th class="min-w-[100px] bg-[#202c2c]">Regions configured in experiment<br/>(* primary)</th>
                      <th class="min-w-[100px] bg-[#202c2c]">Read consistency</th>
                      <th class="min-w-[100px] bg-[#202c2c]">Query model</th>
                      <th class="min-w-[100px] bg-[#202c2c]">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b">
                      <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">Deno KV</td>
                      <td>Key/Value</td>
                      <td>US*, Europe, Asia</td>
                      <td>Strong (with optional eventual)</td>
                      <td>Custom simple API</td>
                      <td>Strictly serializable ACID transactions</td>
                    </tr>
                    <tr class="border-b">
                      <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">Fauna</td>
                      <td>Document store</td>
                      <td>US*</td>
                      <td>Strong</td>
                      <td>Custom FaunaQL or GraphQL</td>
                      <td>Strictly serializable ACID transactions</td>
                    </tr>
                    <tr class="border-b">
                      <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">DynamoDB</td>
                      <td>Key/Value</td>
                      <td>N. Virginia*</td>
                      <td>Strong w/in single region (except for secondary indexes), eventual outwith (and optional within).</td>
                      <td>PartiQL or custom CRUD API</td>
                      <td>At best, serializable ACID transactions in single region only. Some operations are read-committed or not serializable</td>
                    </tr>
                    <tr class="border-b">
                      <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">Upstash Redis</td>
                      <td>Key/Value</td>
                      <td>N. Virginia*, California, Oregon, Frankfurt, Ireland, Singapore, Sydney, Sao Paulo</td>
                      <td>Eventual</td>
                      <td>Redis API</td>
                      <td>Serializable transactions (not ACID compliant)</td>
                    </tr>
                    <tr class="border-b">
                      <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">PlanetScale</td>
                      <td>Relational</td>
                      <td>N. Virginia*</td>
                      <td>Eventual</td>
                      <td>SQL</td>
                      <td>Available but not ACID compliant</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              </p>
          </div>

          <div id="latency_experiment">&nbsp;</div>
          <h2 class="text-2xl font-bold">Latency experiment</h2>
          <p class="mt-3">
            To be highly performant and give users the best experience, a globally distributed server needs a globally distributed database. 
            How well does Deno's new KV database perform from regions around the globe and how does it compare to other globally distributed 
            databases accessed from Deno Deploy?
          </p>
          <p class="mt-3">
            Loading this page sent basic database write and read requests to each database.  The database operations 
            were executed from a Deno Deploy application running in the Google Cloud Platform (GCP) 
            region/datacentre closest to you. Where the read or write operation was sent (i.e. which database region), and therefore
            the latency experienced, depends on how the database provider manages their network, where the primary database is, 
            how many replicas are available, and what operation was used, amongst some factors influencing the latency.
          </p>
            
          <p class="mt-3">
            All results represent the time for the database operation to execute, including the latency between the server
            (i.e. Deno Deploy application instance) and the database. The network latency between your browser and the 
            server is not included in any result below.
          </p>

          <p class="mt-3">
            The experiment aims to test the databases management and latency of global access.  The queries are very simple
            and the data volumes are very small, both of which are unrealistic in a real-world application.  The experiment is not
            meant to be a benchmark of the databases per se, but rather a simple test of the latency of the databases from 
            different regions.
          </p>

          <p class="mt-3"><div class="border-1 p-3 border-red-500">
            <span class="font-bold text-red-500 underline">Important:</span> Please read the analysis on each database below to understand
            the results with the proper context.  Generally speaking, the results are not always directly comparable as the databases have different
            setups, use cases, replica regions, configuration, etc. You should always do your own research, testing and 
            benchmarking to determine which database is best for your use case.
            </div>
          </p>

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

          <div id="analysis">&nbsp;</div>
          <h2 class="text-2xl font-bold">Analysis</h2>
          <h3 class="mt-8 text-xl font-bold">
                <svg class="inline mr-3 text-default h-10 flex-none dark:text-gray-900" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Deno Logo"><g clip-path="url(#clip0_29_599)"><path d="M15 0C23.2843 0 30 6.71572 30 15C30 23.2843 23.2843 30 15 30C6.71572 30 0 23.2843 0 15C0 6.71572 6.71572 0 15 0Z" fill="currentColor"></path><path d="M14.6635 22.3394C14.2788 22.2357 13.8831 22.4584 13.7705 22.8381L13.7655 22.8558L12.7694 26.5472L12.7649 26.565C12.6711 26.9498 12.9011 27.3414 13.2858 27.4451C13.6704 27.549 14.0661 27.3263 14.1787 26.9465L14.1837 26.9289L15.1797 23.2375L15.1843 23.2196C15.1911 23.1919 15.1962 23.164 15.1997 23.1362L15.2026 23.1084L15.179 22.9888L15.1445 22.8166L15.1227 22.7091C15.076 22.619 15.0111 22.5396 14.932 22.4759C14.853 22.4123 14.7615 22.3658 14.6635 22.3394ZM7.7224 18.5379C7.70424 18.5741 7.68883 18.6123 7.67658 18.6522L7.66967 18.6763L6.67358 22.3677L6.669 22.3856C6.57525 22.7704 6.80524 23.1619 7.1899 23.2657C7.57451 23.3695 7.97026 23.1469 8.08287 22.7671L8.08779 22.7494L8.99096 19.4023C8.51793 19.1518 8.09336 18.8628 7.7224 18.5379ZM5.34707 14.2929C4.9624 14.1891 4.56666 14.4117 4.4541 14.7915L4.44912 14.8092L3.45303 18.5006L3.44846 18.5184C3.35471 18.9032 3.58469 19.2947 3.96936 19.3985C4.35397 19.5023 4.74971 19.2797 4.86232 18.8999L4.86725 18.8822L5.86334 15.1908L5.86791 15.173C5.96166 14.7882 5.73174 14.3967 5.34707 14.2929ZM27.682 13.4546C27.2973 13.3508 26.9015 13.5734 26.789 13.9532L26.784 13.9709L25.7879 17.6623L25.7833 17.6801C25.6896 18.0649 25.9196 18.4564 26.3042 18.5602C26.6889 18.664 27.0846 18.4414 27.1972 18.0616L27.2021 18.0439L28.1982 14.3525L28.2028 14.3347C28.2965 13.9499 28.0666 13.5584 27.682 13.4546ZM3.17781 8.52527C2.34361 10.0444 1.81243 11.7112 1.61377 13.4329C1.7088 13.5412 1.83381 13.619 1.97301 13.6563C2.35768 13.7602 2.75342 13.5375 2.86598 13.1577L2.87096 13.1401L3.86705 9.44865L3.87162 9.43084C3.96537 9.04599 3.73539 8.65447 3.35072 8.5507C3.2943 8.53547 3.23623 8.52694 3.17781 8.52527ZM25.159 8.5507C24.7744 8.44687 24.3786 8.66953 24.266 9.04933L24.2611 9.06697L23.265 12.7584L23.2604 12.7762C23.1667 13.161 23.3966 13.5526 23.7813 13.6563C24.1659 13.7602 24.5617 13.5375 24.6743 13.1577L24.6792 13.1401L25.6753 9.44865L25.6799 9.43084C25.7736 9.04599 25.5436 8.65447 25.159 8.5507Z" fill="white"></path><path d="M7.51285 5.04065C7.12824 4.93682 6.73249 5.15948 6.61988 5.53929L6.61495 5.55692L5.61886 9.24833L5.61429 9.26614C5.52054 9.65098 5.75052 10.0425 6.13519 10.1463C6.5198 10.2501 6.91554 10.0274 7.02816 9.64764L7.03308 9.63001L8.02917 5.9386L8.03374 5.92079C8.12749 5.53595 7.89751 5.14442 7.51285 5.04065ZM20.3116 5.73845C19.9269 5.63462 19.5312 5.85727 19.4186 6.23708L19.4136 6.25471L18.7443 8.73499C19.1779 8.94915 19.5917 9.20126 19.9809 9.48839L20.0453 9.53643L20.8279 6.63639L20.8324 6.61858C20.9262 6.23374 20.6963 5.84221 20.3116 5.73845ZM13.7968 1.57642C13.3296 1.61771 12.8647 1.68338 12.4043 1.77317L12.3066 1.79263L11.3782 5.23419L11.3736 5.252C11.2799 5.63684 11.5099 6.02837 11.8945 6.13214C12.2792 6.23596 12.6749 6.01331 12.7875 5.6335L12.7924 5.61587L13.7885 1.92446L13.7931 1.90665C13.8196 1.79831 13.8209 1.68533 13.7968 1.57642ZM22.9626 4.1263L22.7669 4.85169L22.7623 4.86944C22.6686 5.25429 22.8986 5.64581 23.2832 5.74958C23.6678 5.85341 24.0636 5.63075 24.1762 5.25095L24.1811 5.23331L24.2025 5.15462C23.8362 4.81205 23.4511 4.49009 23.0491 4.19022L22.9626 4.1263ZM17.1672 1.69677L16.8139 3.00593L16.8094 3.02374C16.7156 3.40858 16.9456 3.80011 17.3303 3.90388C17.7149 4.0077 18.1106 3.78505 18.2233 3.40524L18.2282 3.38761L18.6 2.00966C18.1624 1.88867 17.719 1.79001 17.2714 1.71405L17.1672 1.69677Z" fill="white"></path><path d="M9.69085 24.6253C9.80341 24.2455 10.1992 24.0229 10.5838 24.1266C10.9685 24.2303 11.1984 24.6219 11.1047 25.0068L11.1001 25.0246L10.3872 27.6664L10.2876 27.6297C9.85836 27.4694 9.43765 27.2873 9.0271 27.0839L9.68587 24.6429L9.69085 24.6253Z" fill="white"></path><path d="M14.4141 8.49082C10.0522 8.49082 6.65918 11.2368 6.65918 14.6517C6.65918 17.8769 9.78123 19.9362 14.6211 19.8331C15.0327 19.8243 15.1517 20.1008 15.2856 20.4734C15.4196 20.846 15.7796 22.8097 16.0665 24.3117C16.3233 25.656 16.5842 27.0052 16.7834 28.3596C19.9439 27.9418 22.8663 26.3807 25.0076 24.0261L22.7237 15.5088C22.1544 13.4518 21.489 11.5564 19.7283 10.1794C18.3118 9.07166 16.5122 8.49082 14.4141 8.49082Z" fill="white"></path><path d="M15.3516 10.957C15.8694 10.957 16.2891 11.3767 16.2891 11.8945C16.2891 12.4123 15.8694 12.832 15.3516 12.832C14.8338 12.832 14.4141 12.4123 14.4141 11.8945C14.4141 11.3767 14.8338 10.957 15.3516 10.957Z" fill="currentColor"></path></g><defs><clipPath id="clip0_29_599"><rect width="30" height="30" fill="white"></rect></clipPath></defs></svg>
                Deno KV
          </h3>
          <div class="mt-4" id="DenoKVAnalysis">
            <table class="text-left bg-[#202020]">
              <thead class="border-b font-medium">
                <tr>
                  <th class="sticky w-56 left-0 z-10 px-6 py-3 bg-[#202c2c]">Metric</th>
                  <th class="min-w-[100px] bg-[#202c2c]">Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Setup/Configuration</td>
                  <td><span class="text-yellow-500">★★★★★</span></td>
                </tr>
                <tr>
                  <td>Local development</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Global distribution</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Ease of use</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Performance</td>
                  <td><span class="text-yellow-500">★★★★★</span></td>
                </tr>
                <tr>
                  <td>Consistency</td>
                  <td><span class="text-yellow-500">★★★★★</span></td>
                </tr>
                <tr>
                  <td>Features/Flexibility</td>
                  <td><span class="text-yellow-500">★★☆☆☆</span></td>
                </tr>
                <tr>
                  <td>Vendor independence</td>
                  <td><span class="text-yellow-500">★★☆☆☆</span></td>
                </tr>
              </tbody>
            </table>
            <p class="mt-8">
              <span class="font-bold">Setup/Configuration: </span>Deno KV easily tops the bunch when it comes to setup and configuration, simply because there is none.  You do not have to 
              create a database, manage connection strings, create credentials, choose regions, manage usernames and passwords, or anything else.
              You just start coding.  Getting started with KV was significantly faster and easier than any of 
              the other solutions.  The Deno core team have suggested in the future some configuration may be available around regions (choice of primary region
              and limiting data to specific regions for example).
            </p>
            <p class="mt-3">
              <span class="font-bold">Local development: </span>Local development is also very easy, again there is no setup.  In production, you are using a distributed database built
              on FoundationDB, however locally you are using a SQLite database which ships with the Deno CLI.  The difference is transparent as the API doesn't change.  
              There's nothing you need to do between development and production setup.  As a beta product with few features, 
              manual effort is needed to populate data into KV stores another dev machine or Deploy branch build.  Manual work
              to manage and delete these branch build KV stores may also be required if they contribute to storage costs.  The Deno core
              team have hinted that they are looking at ways to share KV stores.
            </p>
            <p class="mt-3">
              <span class="font-bold">Global distribution: </span>With database replicas on 3 continents, KV counts as being a truly global database.  However, there is no configuration to let
              you customise where these replicas are, nor which is the primary replica (currently US only).  The Deno team have hinted they
              are looking at adding additional replicas and capabilities to manage regions.
            </p>
            <p class="mt-3">
              <span class="font-bold">Ease of use: </span>Ease of use also scored very high.  The API is simple and intuitive and the nascent documentation is decent. Where Deno KV
              is less user friendly is the manual management required for  <a class={linkStyles} href="https://deno.com/manual/runtime/kv/secondary_indexes">secondary indexes</a>.  You must manually create and carefully manage
              these. It's not overly difficult, but neither is it handled automatically for you.  Expect to see libraries which help manage this.
              KV's approach to keys, built from various parts, allows for nice flexibility of modelling your data, within the confines of a 
              key-value database, as well as good ability to do  <a class={linkStyles} href="https://deno.land/api?s=Deno.Kv&unstable=#method_list_0">range searches</a>.
            </p>
            <p class="mt-3">
              <span class="font-bold">Performance: </span>KV is impressively fast.  Strongly consistent read, write performance and transactions are all either the fastest or very close 
              to the fastest measured in any region of the databases tested.  Eventual read performance is also very fast, 
              second only to Upstash Redis which has many more global replicas configured.
            </p>
            <p class="mt-3">
              <span class="font-bold">Consistency: </span>KV is strongly consistent, up there with Fauna as the most consistent database tested.  However, unlike Fauna, KV has the nice
              option of allowing eventual reads for faster access in use cases where strong consistency is not required.
            </p>
            <p class="mt-3">
              <span class="font-bold">Features/Flexibility: </span>Features and flexibility are one of KV's weakest points.  Like all key-value stores, KV is not best suited to highly relational
              data.  There are no backup capabilities, data streaming, security configuration, or other advanced features.
              Additionally, of the key-value stores out there, KV has fairly  <a class={linkStyles} href="https://deno.land/api?s=Deno.Kv&unstable=">restrictive limits</a> on key length (2kb) and value length (64kb),
              making it unsuitable for some types of data.  Additionally, there is currently a limit of 10 operations per transaction. While this
              may not seem restrictive at first glance, any operations on an index also need to potentially update secondary indexes at the 
              same time as well. Thus if you have 3 secondary indexes, you may limited to only 7 operations in a transaction (plus 
              updating the 3 secondary indexes) to maintain consistency.  Finally, as a beta product, KV lacks maturity in dashboard 
              tooling and the ability to export and import data as well as wiping a database.  Expect to see improvements in all these areas
              as KV matures.
            </p>
            <p class="mt-3">
              <span class="font-bold">Vendor independence: </span>KV's weakest point is perhaps it's vendor lock-in.  As a globally 
              distributed database, KV is only available in Deno Deploy.  However, you can deploy your Deno app yourself to 
              any server and use the KV API with a local SQLite database, though you will not get global distribution of your data.  Deno 
              also has a custom API meaning you cannot simply swap out KV for another database if in the future you migrate off of 
              Deploy or away from KV.  That said, the API is very simple so migrations may not be overly difficult.  The core team have
              also hinted at potentially allowing KV to be used outside of Deploy in the future.
            </p>
            <p class="mt-3">
              <span class="font-bold">Pricing: </span>No pricing has been announced for Deno KV on Deploy yet.
            </p>
          </div>
          <h3 class="mt-8 text-xl font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42.3 47" class="w-8 inline mr-3"><path style="fill:#813eef" d="M32.9 9.9c-2.9 1-4.3 2.7-5.3 5.4-.2.7-.9 1.5-1.6 2.1l2.4 2.6-7.6-5.3L0 0s1.5 9.8 2 13.4c.4 2.5 1 3.7 3 4.8l.8.4 3.4 1.8-2-1.1 9.4 5.2-.1.1L6.4 20c.5 1.8 1.6 5.4 2 7 .5 1.7 1 2.3 2.7 2.9l3 1.1 1.9-.7-2.4 1.6L1.7 47c7.9-7.4 14.6-10 19.5-12.1 6.3-2.7 10-4.5 12.5-10.7 1.8-4.4 3.1-10 4.9-12.2l3.7-4.7c0-.1-7.6 2-9.4 2.6z"></path></svg>
              Fauna
          </h3>
          <div class="mt-8" id="FaunaAnalysis">
            <table class="text-left bg-[#202020]">
              <thead class="border-b font-medium">
                <tr>
                  <th class="sticky w-56 left-0 z-10 px-6 py-3 bg-[#202c2c]">Metric</th>
                  <th class="min-w-[100px] bg-[#202c2c]">Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Setup/Configuration</td>
                  <td><span class="text-yellow-500">★★★☆☆</span></td>
                </tr>
                <tr>
                  <td>Local development</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Global distribution</td>
                  <td><span class="text-yellow-500">★★☆☆☆</span></td>
                </tr>
                <tr>
                  <td>Ease of use</td>
                  <td><span class="text-yellow-500">★★☆☆☆</span></td>
                </tr>
                <tr>
                  <td>Performance</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Consistency</td>
                  <td><span class="text-yellow-500">★★★★★</span></td>
                </tr>
                <tr>
                  <td>Features/Flexibility</td>
                  <td><span class="text-yellow-500">★★★★★</span></td>
                </tr>
                <tr>
                  <td>Vendor independence</td>
                  <td><span class="text-yellow-500">★★★☆☆</span></td>
                </tr>
              </tbody>
            </table>
            <p class="mt-8">
              <span class="font-bold">Setup/Configuration: </span>Creating a Fauna database is straightforward via their web UI.  
              Once the database is created you need to create a  <a class={linkStyles} href="https://docs.fauna.com/fauna/current/learn/understanding/collections">Collection</a>,
              similar to a table in a traditional database, via the UI, in their database specific Fauna Query Language (FQL) or via their GraphQL API.
              You can also add a GraphQL schema to your Collection.  Finally, you need to create a security key to access your database via the 
              javascript client or http POST request.  While nothing was overly difficult, the process was not as simple as other databases 
              and there is a lot of new terminology to learn.  There are few examples of using Fauna with Deno 
              and even the  <a class={linkStyles} href="https://deno.com/deploy/docs/tutorial-faunadb">guide</a> on 
              Deno Deploy documentation can be a challenge to follow.
            </p>
            <p class="mt-3">
              <span class="font-bold">Local development: </span>For  <a class={linkStyles} href="https://docs.fauna.com/fauna/current/build/tools/dev">local development</a>,
              Fauna offers a docker container to run a local instance of Fauna which must be installed and given minor
              configuration to run.  You can run it with persisted data or start with a clean sheet. 
            </p>
            <p class="mt-3">
              <span class="font-bold">Global distribution: </span>Fauna bills itself as a multi-region distributed database.  However, without upgrading to their enterprise plan (which gets you VM isolated
              single tenant customised deployments anywhere you want), you are limited to either Western centric US or Europe region groups (but not a mixture).  With the region
              group, there will be 3 replicas of your data within the region.  Speaking with their support, changes are coming to offer
              an expanded global offering. As of now, however, this may not be ideal if your primary user base is in Asia for example.
            </p>
            <p class="mt-3">
              <span class="font-bold">Ease of use: </span>Fauna had the steepest learning curve of the databases reviewed, however, if you already know GraphQL this will help.
              Fauna's FQL is a powerful language but as a custom built API takes time to learn.  The documentation on the website is OK but lacking
              at times.  It will take considerable time to become comfortable with Fauna as conceptually it is very different to other databases.
            </p>
            <p class="mt-3">
              <span class="font-bold">Performance: </span>Performance wise, Fauna held its ground well, despite being limited to a single region group.  Writes were slow compared to the other
              databases, but strong reads were fast, though as Fauna does not offer eventual consistency reads other databases can significantly outperform Fauna if
              eventual consistency is acceptable.
            </p>
            <p class="mt-3">
              <span class="font-bold">Consistency: </span>Fauna, like KV, offers very strong consistency but as mentioned previously there is no option for eventual read consistency.  This is likely
              due to the fact that Fauna is an active-active database where writes only complete after replication to all replicas.  Everything in Fauna
              is a transaction. 
            </p>
            <p class="mt-3">
              <span class="font-bold">Features/Flexibility: </span>Where Fauna really shines is in it's features and flexibility.  If you invest the time to properly learn Fauna, it will reward you with 
              capabilities not found in other NoSQL databases such as joins, indexes, normalised data, SQL like queries, functions (which 
              are similar to stored procedures), data streaming, backups, temporality (reading data as it was at a point in time), and more.
            </p>
            <p class="mt-3">
              <span class="font-bold">Vendor independence: </span>Fauna is a proprietary database with a custom API and many features.  Once your application is deeply embedded into Fauna migrating
              to another database will be difficult and costly.  On the plus side, unlike KV you can take your Fauna database with you to another 
              edge platform and as the GraphQL API is pure http based there are no libraries to worry about.  Alternatively, 
              using  <a class={linkStyles} href="https://airbyte.com/">Airbyte</a> you can extract your data from Fauna and move it elsewhere.
            </p>
            <p class="mt-3">
              <span class="font-bold">Pricing: </span>There 
              are  <a class={linkStyles} href="https://docs.fauna.com/fauna/current/learn/understanding/billing">7 metrics</a> Fauna uses in its pricing model.
              Their entry level plan gets you $25 worth of services each month which equates to a maximum of 54 million reads, 11 million 
              writes or 25GB of storage.  Costs appear to be middle of the road.
            </p>
          </div>
          <h3 class="mt-8 text-xl font-bold">
                <svg class="inline mr-3 w-8" viewBox="-16.5 0 289 289" preserveAspectRatio="xMidYMid">
                  <g>
                    <path d="M165.258,288.501 L168.766,288.501 L226.027,259.867 L226.98,258.52 L226.98,29.964 L226.027,28.61 L168.766,0 L165.215,0 L165.258,288.501" fill="#5294CF"></path>
                    <path d="M90.741,288.501 L87.184,288.501 L29.972,259.867 L28.811,257.87 L28.222,31.128 L29.972,28.61 L87.184,0 L90.785,0 L90.741,288.501" fill="#1F5B98"></path>
                    <path d="M87.285,0 L168.711,0 L168.711,288.501 L87.285,288.501 L87.285,0 Z" fill="#2D72B8"></path>
                    <path d="M256,137.769 L254.065,137.34 L226.437,134.764 L226.027,134.968 L168.715,132.676 L87.285,132.676 L29.972,134.968 L29.972,91.264 L29.912,91.296 L29.972,91.168 L87.285,77.888 L168.715,77.888 L226.027,91.168 L247.096,102.367 L247.096,95.167 L256,94.193 L255.078,92.395 L226.886,72.236 L226.027,72.515 L168.715,54.756 L87.285,54.756 L29.972,72.515 L29.972,28.61 L0,63.723 L0,94.389 L0.232,94.221 L8.904,95.167 L8.904,102.515 L0,107.28 L0,137.793 L0.232,137.769 L8.904,137.897 L8.904,150.704 L1.422,150.816 L0,150.68 L0,181.205 L8.904,185.993 L8.904,193.426 L0.373,194.368 L0,194.088 L0,224.749 L29.972,259.867 L29.972,215.966 L87.285,233.725 L168.715,233.725 L226.196,215.914 L226.96,216.249 L254.781,196.387 L256,194.408 L247.096,193.426 L247.096,186.142 L245.929,185.676 L226.886,195.941 L226.196,197.381 L168.715,210.584 L168.715,210.6 L87.285,210.6 L87.285,210.584 L29.972,197.325 L29.972,153.461 L87.285,155.745 L87.285,155.801 L168.715,155.801 L226.027,153.461 L227.332,154.061 L254.111,151.755 L256,150.832 L247.096,150.704 L247.096,137.897 L256,137.769" fill="#1A476F"></path>
                    <path d="M226.027,215.966 L226.027,259.867 L256,224.749 L256,194.288 L226.2,215.914 L226.027,215.966" fill="#2D72B8"></path>
                    <path d="M226.027,197.421 L226.2,197.381 L256,181.353 L256,150.704 L226.027,153.461 L226.027,197.421" fill="#2D72B8"></path>
                    <path d="M226.2,91.208 L226.027,91.168 L226.027,134.968 L256,137.769 L256,107.135 L226.2,91.208" fill="#2D72B8"></path>
                    <path d="M226.2,72.687 L256,94.193 L256,63.731 L226.027,28.61 L226.027,72.515 L226.2,72.575 L226.2,72.687" fill="#2D72B8"></path>
                  </g>
                </svg>DynamoDB analysis
          </h3>
          <div class="mt-8" id="DynamoDBAnalysis">
            <table class="text-left bg-[#202020]">
              <thead class="border-b font-medium">
                <tr>
                  <th class="sticky w-56 left-0 z-10 px-6 py-3 bg-[#202c2c]">Metric</th>
                  <th class="min-w-[100px] bg-[#202c2c]">Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Setup/Configuration</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Local development</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Global distribution</td>
                  <td><span class="text-yellow-500">★★★☆☆</span></td>
                </tr>
                <tr>
                  <td>Ease of use</td>
                  <td><span class="text-yellow-500">★★★☆☆</span></td>
                </tr>
                <tr>
                  <td>Performance</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Consistency</td>
                  <td><span class="text-yellow-500">★★★☆☆</span></td>
                </tr>
                <tr>
                  <td>Features/Flexibility</td>
                  <td><span class="text-yellow-500">★★★★★</span></td>
                </tr>
                <tr>
                  <td>Vendor independence</td>
                  <td><span class="text-yellow-500">★★★☆☆</span></td>
                </tr>
              </tbody>
            </table>
            <p class="mt-8">
              <span class="font-bold">Setup/Configuration: </span>As you'd expect from AWS, DynamoDB is highly configurable and can
              be created in a number of ways including programmatically. The console is easy to use and well integrated into the other
              services AWS offers.  Creating a DynamoDB table requires setting the partition key (i.e. primary index), so a basic
              understanding of how DynamoDB works is necessary to start.  There are few examples of using DynamoDB with Deno and
              even the Deno Deploy example is  <a class={linkStyles} href="https://github.com/denoland/deploy_feedback/issues/390">broken and incomplete</a>.
            </p>
            <p class="mt-3">
              <span class="font-bold">Local development: </span>
              AWS  <a class={linkStyles} href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html">provide</a> an executable 
              jar, maven dependency (both Java) or Docker image for local development. Data files can be specified for pre-population and
              sharing.
            </p>
            <p class="mt-3">
              <span class="font-bold">Global distribution: </span>This was a complicated one to rate.  On the one hand, DynamoDB offers
              "global tables" which are replicated tables, offered across 16 different regions.  Picking and choosing which regions you want
              including which is your primary region is great flexibility.  However, there are a number of caveats.  For example, using
              global tables introduces a weaker consistency model.
              Another challenge is that when using global tables, routing of the request is complicated.  Unlike other providers where
              requests are automatically routed to the closest replica region, in DynamoDB using global tables, you must either implement the routing
              logic in the client yourself (e.g. manually map Deploy region to AWS Global Table region) or place a compute layer in front of DynamoDB in each 
              replica region.  Then, in front of the compute layer is another service 
              like  <a class={linkStyles} href="https://aws.amazon.com/route53/">Route53</a> which can route the request to the closest
              compute layer.  Considerations like region outages must either be explicity coded for in the client or health checks configured in 
              Route53 to route around the outage.
            </p>
            <p class="mt-3">
              <span class="font-bold">Ease of use: </span>Ease of use was average amongst the databases tested.  The console is easy to use
              and well integrated into the other services AWS offers.  Understanding how DynamoDB partition keys work is important to utilising
              the service effectively.  Documentation was generally good, however a reasonable amount of reading was required to understand
              how to use the API.  It felt very counter-intuitive to specify the region in the client.  The API is also very verbose, requiring
              a lot of code to achieve simple tasks.
            </p>
            <p class="mt-3">
              <span class="font-bold">Performance: </span>Another challenging one to rate.  This experiment only used a single region deployment
              of DynamoDB, so it was never going to be competitive in reads with other databases having multiple replica regions.  And yet, it still
              performed well, achieving best or second best write performance in every region.  The biggest let down in performance
              comes from the first use of the API which incurred a ~400ms delay, effectively a cold start penalty and something not encountered in any 
              of the other databases.  To make the experiment more consistent and comparable, a dummy request is sent to the API before the 
              experimental requests are sent to eliminate this cold start penalty.  However real world apps will take this hit on every new 
              isolate creation in Deno Deploy so should be carefully considered.
            </p>
            <p class="mt-3">
              <span class="font-bold">Consistency: </span>DynamoDB's consistency model is somewhat complicated.  If using a single region only
              you get strong consistency writes and optionally reads too (default is eventual consistency reads).  However, if using global 
              tables, and you specified a "strong consistent read" it will only be strongly consistent for writes within the same region.  
              This means global tables are effectively only eventually consistent.  Cross region transactions are not ACID compliant leading
              to potential data loss if concurrent writes to the same data occur in multiple regions.
            </p>
            <p class="mt-3">
              <span class="font-bold">Features/Flexibility: </span>Again, as you would expect from AWS, DynamoDB has many features and is very
              flexible.  It is especially good at integrating into other AWS services.  Data can be imported/exported to S3.  Other features
              include data trigger functions, encryption at rest, point in time recovery, on-demand backup and restore, and much more.
            </p>
            <p class="mt-3">
              <span class="font-bold">Vendor independence: </span>Like Deno KV, DynamoDB is not vendor independent.  Once you start using it,
              migrating away will be difficult.  However, while migrating to a different database is difficult, migrating to a different
              edge server (e.g. Cloudflare) is easy as DynamoDB will work with any provider through it's http interface.
            </p>
            <p class="mt-3">
              <span class="font-bold">Pricing: </span> <a class={linkStyles} href="https://aws.amazon.com/dynamodb/pricing/">DynamoDB costs</a> can be a challenge
              to compute.  In the general, reads and writes
              are reasonably priced, storage is among the cheapest, with the first 25GB of storage free. Alongside Upstash, it provides a
              serverless pricing model (pay for only what you use).   However, the cost of global tables can quickly add up as
              each region added incurs additional linear costs for writes and storage.  
            </p>
          </div>

          <h3 class="mt-8 text-xl font-bold">
              <svg class="inline w-6 mr-3" viewBox="0 0 256 341" version="1.1" preserveAspectRatio="xMidYMid">
                    <g>
                        <path d="M0,298.416784 C56.5542815,354.970323 148.246768,354.970323 204.801032,298.416784 C261.354571,241.86252 261.354571,150.170106 204.801032,93.6158424 L179.200462,119.215688 C221.61634,161.631567 221.61634,230.401059 179.200462,272.816213 C136.785307,315.232092 68.0157428,315.232092 25.5998642,272.816213 L0,298.416784 Z" fill="#00C98D"></path>
                        <path d="M51.200362,247.216367 C79.4772765,275.493137 125.323122,275.493137 153.600615,247.216367 C181.877385,218.939598 181.877385,173.093028 153.600615,144.816259 L128.000769,170.416105 C142.139154,184.55449 142.139154,207.477412 128.000769,221.616521 C113.86166,235.754906 90.9387378,235.754906 76.800353,221.616521 L51.200362,247.216367 Z" fill="#00C98D"></path>
                        <path d="M256,42.415426 C199.445737,-14.1384753 107.753322,-14.1384753 51.1994207,42.415426 C-5.35485714,98.9696894 -5.35485714,190.662104 51.1994207,247.216367 L76.7989048,221.616521 C34.3841124,179.200643 34.3841124,110.431151 76.7989048,68.0159962 C119.214783,25.6001177 187.984275,25.6001177 230.39943,68.0159962 L256,42.415426 Z" fill="#00C98D"></path>
                        <path d="M204.800308,93.6158424 C176.523538,65.3390727 130.676245,65.3390727 102.399475,93.6158424 C74.1219813,121.893336 74.1219813,167.739181 102.399475,196.015951 L127.999321,170.416105 C113.860936,156.27772 113.860936,133.354797 127.999321,119.215688 C142.137706,105.077304 165.060629,105.077304 179.199738,119.215688 L204.800308,93.6158424 Z" fill="#00C98D"></path>
                        <path d="M256,42.415426 C199.445737,-14.1384753 107.753322,-14.1384753 51.1994207,42.415426 C-5.35485714,98.9696894 -5.35485714,190.662104 51.1994207,247.216367 L76.7989048,221.616521 C34.3841124,179.200643 34.3841124,110.431151 76.7989048,68.0159962 C119.214783,25.6001177 187.984275,25.6001177 230.39943,68.0159962 L256,42.415426 Z" fill-opacity="0.4" fill="#FFFFFF"></path>
                        <path d="M204.800308,93.6158424 C176.523538,65.3390727 130.676245,65.3390727 102.399475,93.6158424 C74.1219813,121.893336 74.1219813,167.739181 102.399475,196.015951 L127.999321,170.416105 C113.860936,156.27772 113.860936,133.354797 127.999321,119.215688 C142.137706,105.077304 165.060629,105.077304 179.199738,119.215688 L204.800308,93.6158424 Z" fill-opacity="0.4" fill="#FFFFFF"></path>
                    </g>
                </svg>
                Upstash Redis analysis
          </h3>
          <div class="mt-8" id="UpstashRedisAnalysis">
            <table class="text-left bg-[#202020]">
              <thead class="border-b font-medium">
                <tr>
                  <th class="sticky w-56 left-0 z-10 px-6 py-3 bg-[#202c2c]">Metric</th>
                  <th class="min-w-[100px] bg-[#202c2c]">Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Setup/Configuration</td>
                  <td><span class="text-yellow-500">★★★★★</span></td>
                </tr>
                <tr>
                  <td>Local development</td>
                  <td><span class="text-yellow-500">★★☆☆☆</span></td>
                </tr>
                <tr>
                  <td>Global distribution</td>
                  <td><span class="text-yellow-500">★★★★★</span></td>
                </tr>
                <tr>
                  <td>Ease of use</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Performance</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Consistency</td>
                  <td><span class="text-yellow-500">★★☆☆☆</span></td>
                </tr>
                <tr>
                  <td>Features/Flexibility</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Vendor independence</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
              </tbody>
            </table>
            <p class="mt-8">
              <span class="font-bold">Setup/Configuration: </span>Upstash has a simple process to create a database through their 
              UI console.  You choose a name, global or regional configuration, primary region and read region(s) along with a few
              other options.  Connection is maintained through a REST URL and 
              token.   <a class={linkStyles} href="https://docs.upstash.com/redis/quickstarts/deno-deploy">Quick start</a> guides are available for AWS Lambda,
              Vercel functions, Next.js, Fly.io, Deno Deploy and a fair few more.  They are the only provider in this experiment other than KV
              to provide specific instructions for getting up and running on Deno Deploy.
            </p>
            <p class="mt-3">
              <span class="font-bold">Local development: </span>
                 <a class={linkStyles} href="https://docs.upstash.com/redis/sdks/javascriptsdk/developing-or-testing">Local development</a> is achieved through a 
                community supported project called  <a class={linkStyles} href="https://github.com/hiett/serverless-redis-http">Serverless Redis HTTP (SRH)</a>. 
                While Upstash offer support to the maintenance they do not maintain this project
                and one concern would be the single maintainer of the project.  SRH also has a few differences to Upstash Redis.
                Some instructions are provided for running SRH in docker, but there are gaps leaving you to fill in the blanks.  Additionally
                you must install your own Redis server locally, for which no documentation or links are given.
                Compared to the other databases tested, Upstash Redis had the least robust local development experience.
            </p>
            <p class="mt-3">
              <span class="font-bold">Global distribution: </span>Upstash provides 8 regions around the globe (3 US, 2 Europe, 1 Asia,
              1 S. America, and 1 Australia) to use for primary and
              read replicas.  As Upstash charge per 100k commands and each replica write consumes a command, adding additional read
              regions will increase your costs, how much depends on how write-heavy your application is.
            </p>
            <p class="mt-3">
              <span class="font-bold">Ease of use: </span>Upstash was very easy to use with good documentation.  For users with experience
              of Redis this will be a particularly easy database to use as Upstash Redis is Redis compatible.  To get working with Deno
              Deploy, only  <a class={linkStyles} href="https://docs.upstash.com/redis/quickstarts/deno-deploy">a few imports</a> and environment variables are needed.
            </p>
            <p class="mt-3">
              <span class="font-bold">Performance: </span>While achieving 4 star performance, this is really a tale of two use cases. Write
              performance is sub-par (2 stars), while eventual read performance is excellent (5 stars), faster in almost every region than
              the other databases (N.B. remember that Upstash was configured with 8 read regions, while the others have 3 at most).
            </p>
            <p class="mt-3">
              <span class="font-bold">Consistency: </span>A weak point of Upstash Redis is consistency. Their consistency model is eventual
              consistency.  Additionally transactions, while supported in the API,  are not ACID compliant.
            </p>
            <p class="mt-3">
              <span class="font-bold">Features/Flexibility: </span>Upstash Redis is fairly feature rich.  Some features include data
              eviction, encryption at rest, IP whitelisting and backup/restore amongst others.
            </p>
            <p class="mt-3">
              <span class="font-bold">Vendor independence: </span>Like the otherdatabases besides KV, Upstash Redis is portable and you can
              move it to another edge provider.  Additionally, by using a Redis compatible API, you can in theory move to a different Redis 
              installation.  One challenge to that is there are little to no other offerings of globally distributed durable Redis.
            </p>
            <p class="mt-3">
              <span class="font-bold">Pricing: </span>Upstash 
              provides the simplest  <a class={linkStyles} href="https://docs.upstash.com/redis/overall/pricing">pricing model</a> of the databases tested.  With its
              serverless model, you only pay for what you use.  That said, it also has the most expensive read/writes of the databases tested.
              Like DynamoDB global tables, the more read replicas you add the more expensive it becomes, linearly 
              increasing your costs for writes and storage.  Storage at least is very cheap, though unlike DynamoDB does not come with any
              free amount.
            </p>
          </div>
          <h3 class="mt-8 text-xl font-bold">
              <svg class="inline mr-3 w-8 bg-white p-1" viewBox="0 0 256 256"preserveAspectRatio="xMidYMid">
                    <g>
                        <path d="M256,128.044218 C255.976145,198.701382 198.701382,255.976145 128.044218,256 L128.044218,256 Z M128,0 C179.977309,0 224.718545,30.9806545 244.765091,75.4833455 L75.4833455,244.765091 C68.2193455,241.492945 61.3149091,237.562764 54.84736,233.050182 L159.8976,128 L128,128 L37.4903855,218.509382 C14.3269236,195.346036 0,163.346036 0,128 C0,57.30752 57.3075782,0 128,0 Z" fill="#000000"></path>
                    </g>
                </svg>
                PlanetScale
          </h3>
          <div class="mt-8" id="PlanetScaleAnalysis">
            <table class="text-left bg-[#202020]">
              <thead class="border-b font-medium">
                <tr>
                  <th class="sticky w-56 left-0 z-10 px-6 py-3 bg-[#202c2c]">Metric</th>
                  <th class="min-w-[100px] bg-[#202c2c]">Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Setup/Configuration</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Local development</td>
                  <td><span class="text-yellow-500">★★☆☆☆</span></td>
                </tr>
                <tr>
                  <td>Global distribution</td>
                  <td><span class="text-yellow-500">★★★☆☆</span></td>
                </tr>
                <tr>
                  <td>Ease of use</td>
                  <td><span class="text-yellow-500">★★★☆☆</span></td>
                </tr>
                <tr>
                  <td>Performance</td>
                  <td><span class="text-yellow-500">★★★☆☆</span></td>
                </tr>
                <tr>
                  <td>Consistency</td>
                  <td><span class="text-yellow-500">★★☆☆☆</span></td>
                </tr>
                <tr>
                  <td>Features/Flexibility</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
                <tr>
                  <td>Vendor independence</td>
                  <td><span class="text-yellow-500">★★★★☆</span></td>
                </tr>
              </tbody>
            </table>
            <p class="mt-8">
              <span class="font-bold">Setup/Configuration: </span>Setup of a PlanetScale database is straightforward via their UI.
              In addition to a name, you also select a primary region.  Free plans are limited to a single region and single database.
              Like any SQL database, you need to define a schema using traditional SQL (e.g. "CREATE TABLE ...").
            </p>
            <p class="mt-3">
              <span class="font-bold">Local development: </span>PlanetScale does not provide a local development option. Your
              choices are to connect to a development branch of your database which requires a network connection and incurs usage charges,
              or manually setup and connect to a local MySQL instance.
            </p>
            <p class="mt-3">
              <span class="font-bold">Global distribution: </span>In addition to selecting your primary region from 11 AWS or 4 GCP (beta) 
              regions, you can also enable one or more read-only replica regions.  One downside to PlanetScale's global setup is that,
              similar to DynamoDB, you must manage the connections yourself in the client (e.g. decide which region to connect to), 
              unlike other providers who route you to the closest region automatically.
            </p>
            <p class="mt-3">
              <span class="font-bold">Ease of use: </span>PlanetScale is essentially a MySQL database under the hood and therefore
              you have all the power and flexibility of a relational database and SQL interface.  One area to be aware of is that
               <a class={linkStyles} href="https://planetscale.com/docs/concepts/sharding">manual sharding</a> (partioning your data across multiple 
              databases to spread the load) is required if your database
              becomes large (~250GB) or hits limits around write or read throughput.  This is the only database in the experiment
              which requires action at scale.  The other databases are fully managed and scale automatically.  Access to the database
              is via their javascript driver which you can use via 
              a  <a class={linkStyles} href="https://deno.com/manual@v1.34.3/node/how_to_with_npm/planetscale">npm specifier</a> or CDN (unpkg, esh.sh, etc).  
              Though MySQL compatible, 
              there are  <a class={linkStyles} href="https://planetscale.com/docs/learn/operating-without-foreign-key-constraints">no foreign key constraints</a>.
              Such constraints need to be implemented in application logic instead. Finally, when on the
              free tier only, your database will be put to sleep after 7 days of inactivity.  You must manually wake it up via the console 
              and until then it's completely inaccessible.
            </p>
            <p class="mt-3">
              <span class="font-bold">Performance: </span>Across the regions, PlanetScale showed average to good write performance in 
              comparison to the other databases in this experiment.  However, transactions were very very slow.  Read performance was also
              surprisingly slow, slowest of all databases in the experiment (though, like DynamoDB, only one region was configured).  
            </p>
            <p class="mt-3">
              <span class="font-bold">Consistency: </span>PlanetScale's consistency model is eventual consistent. 
              &nbsp; <a class={linkStyles} href="https://dev.to/harshhhdev/planetscale-vitess-legacy-sharded-databases-and-referential-integrity-ikp">Transactions are
              not ACID compliant</a>.  Strongly consistent reads are not supported.
            </p>
            <p class="mt-3">
              <span class="font-bold">Features/Flexibility: </span>PlanetScale's standout feature is 
              its  <a class={linkStyles} href="https://planetscale.com/docs/learn/how-online-schema-change-tools-work">schema management</a> capabilities.
              It offers non-blocking schema changes, branching workflows (manage your production schema like you would with your code), 
              and the ability to revert schema changes.  Insights is another nice tool giving query level performance metrics.
            </p>
            <p class="mt-3">
              <span class="font-bold">Vendor independence: </span>By being MySQL compatible, PlanetScale is perhaps the most vendor independent of
              the databases in the experiment.  They additionally support the Airbyte open source data integration engine giving you 
              an ETL path to move you data to another database.
            </p>
            <p class="mt-3">
              <span class="font-bold">Pricing: </span>PlanetScale has some very generous read/write pricing for it's database.  The entry
              level paid plan gives you 100 billion reads and 50 million writes, far more than any of the other databases.  That said,
              while you also get 10GB storage free, after that the storage is very expensive compared to other databases (10x more expensive
              than Upstash or DynamoDB for example).
            </p>
          </div>

            

          <div id="conclusions">&nbsp;</div>
          <h2 class="text-2xl font-bold">Final thoughts</h2>
          <p class="mt-3">
            The goal of this experiment was to put KV through its paces and compare it to other globally distributed database options
            for use on Deploy.  Having done this, it is clear that KV is a serious contender and a very impressive database.  The team
            appear to have made a great choice by using FoundationDB as the base to work on top of.  With one
            of the strongest consistency models, some of the fastest performance and best in class ease of use, it's an obvious choice
            for many use cases.
          </p>
          <p class="mt-3">
            In terms of individual databases, Fauna is talked highly of in technical circles and I can see its potential.  However, I
            can't get away from its complexity.  Developer time is expensive and unless Fauna really fit the project need, the cost of
            bringing the team up to speed with the database would be high.  It's 'global' offering is also disappointing, though may 
            improve in the future. Being limited to GraphQL API only (i.e. and not FaunaQL) on Deploy is also a potential drawback.
          </p>
          <p class="mt-3">
            DynamoDB was one of the first serverless databases.  Clearly it has proven itself and is a solid choice used by many companies
            large and small.  To me, it feels like a database that has been around for a long time and is showing its age.  It's highly
            performant, but has a mixed consistency model and the global tables feels like a bolt on rather than a core feature.  Also, it
            was the only database in this experiment to incur a cold start penalty (~400ms). That
            said, it's hard to beat it's enterprise features and AWS integrations.  I found the lack of documentation on Deno usage very
            frustrating, though I expect this to improve dramatically once npm specifiers are supported in Deploy.
          </p>
          <p class="mt-3">
            I loved how easy it was to get up and running with Upstash and those familiar with Redis will feel right at home.  Their 
            serverless pricing model is really nice as well as the ability to customise replica regions.  The pricing of reads and writes
            looks expensive and so enabling lots of replicas could be very costly.  Write performance was also disappointing.
          </p>
          <p class="mt-3">
            PlanetScale was a surprise to me having heard great things about it.  Technically it is impressive with Vitess and thus
            a sharded distributed relational database.  Like DynamoDB, their 'global' offering feels like a bolt on and read performance
            is slow.  The need to manually shard your database once it degrades or runs into infrastructure problems is a turn off for me
            and runs counter to the serverless concept. Admittedly, few projects will ever need to undertake this. The schema management 
            features are impressive and it's the definitive database in this
            experiment which can best handle relational data (N.B. Fauna also handles relational data and it would be interesting to pit
            these two against each other with complex scenarios around relational data).  Finally, while you get an astonishing amount
            of reads and writes for your money, storage is 2.5x more than Fauna and 10x more than Upstash or DynamoDB.  100GB of storage
            will cost you $225/month.
          </p>
          <p class="mt-3">
            This leaves us with Deno KV.  Going into this experiment, I didn't expect it to hold up as well as it has against the
            big hitters.  Comparing to DynamoDB, it's as fast doing writes and faster doing reads thanks to replica regions (yes, it's
            not a fair comparison without enabling global tables in DynamoDB).  Impressively, it achieves this with a stronger consistency
            model.  The API is much better than DynamoDB. It's also just such a joy to start coding with since there's nothing to install,
            setup, configure, etc.  This will boost team creativity and productivity (less barriers) as well as reducing development costs.
            As a beta product, it's still lacking in a number of features but if the pricing model is competitive it's a no brainer choice
            for use on Deploy assuming it fits your data modelling needs, unless vendor lock-in is a major consideration.
          </p>
          <p class="mt-3">
            Ultimately which database you choose will depend on your use case.  If you need relational capabilities, go with PlanetScale or 
            Fauna.  If you need enterprise features or AWS integrations, DynamoDB is an obvious choice.  If read performance is critical,
            and you can tolerate eventual consistency, Upstash Redis may be your best choice.  However, for many projects on Deploy, I would
            highly recommend KV.  
          </p>
          <hr class="w-[50%] m-auto mt-8 mb-8"/>
          <p class="mt-8 italic">
            Thank you for reading.  I hope you found this experiment useful.  If you have any questions, comments, or real world experience
            you want to share please reach out in the  <a class={linkStyles} href="https://github.com/cknight/kvSpeedCheck/discussions">project discussions</a>.
            Code for the experiment may also be found in the  <a class={linkStyles} href="https://github.com/cknight/kvSpeedCheck">github repo</a>.
          </p>
          <p class="mt-3 mb-16 italic">
              <span class="font-bold">Disclaimer: </span>I have no affiliation with any of the companies mentioned in this article and
              am a first time user of each of the databases in the experiment.
          </p>

        </div>
      </body>
    </>
  );
}
