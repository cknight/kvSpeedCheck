import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { testDenoKv } from "../db/denoKv.ts";
import { testUpstashRedis } from "../db/upstashRedis.ts";
import { dbPerfRun } from "../types.ts";


export const handler: Handlers = {
  async GET(req, ctx) {
    const denoKvPerf = await testDenoKv();
    const upstashRedisPerf = await testUpstashRedis();

    return await ctx.render([denoKvPerf, upstashRedisPerf]);
  },
};

export default function Home(data: PageProps<dbPerfRun[]>) {
  function outputPerformance(performance: number): string {
    return performance >= 0 ? performance + "ms" : "not measured";
  }

  return (
    <>
      <Head>
        <title>KV Speed Check</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">Edge DB speed showdown</h1>
        <p class="mt-5">Source of DB requests region: GCP - {data.data[0].regionId}</p>

        {
          data.data.map(db => {
            return (
            <>
              <p class="mt-5 font-semibold text-xl">{db.dbName}</p>
              <p>Write: {outputPerformance(db.writePerformance)}</p>
              <p>Atomic write: {outputPerformance(db.atomicWritePerformance)}</p>
              <p>Eventual Read: {outputPerformance(db.eventualReadPerformance)}</p>
              <p>Strong Read: {outputPerformance(db.strongReadPerformance)}</p>
            </>
          )})
        }
      </div>
    </>
  );
}
