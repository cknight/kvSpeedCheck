import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";

interface dbPerf {
  openPerformance: number;
  regionId: string;
  writePerformance: number;
  atomicWritePerformance: number;
  eventualReadPerformance: number;
  strongReadPerformance: number;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const startOpen = performance.now();
    const kv = await Deno.openKv();
    const openPerformance = performance.now() - startOpen;

    const regionId = Deno.env.get("DENO_REGION") || "unknown";

    //warm up
    await kv.set(["hello"], "world");
    await kv.get(["hello"], {consistency: "eventual"});
    await kv.get(["hello"], {consistency: "strong"});

    const startWrite = performance.now();
    await kv.set(["hello"], "world");
    const writePerformance = performance.now() - startWrite;

    const startAtomicWrite = performance.now();
    await kv.atomic().set(["atomic hello"], "world").commit();
    const atomicWritePerformance = performance.now() - startAtomicWrite;

    const startEventualRead = performance.now();
    const eventualVal = await kv.get(["hello"], {consistency: "eventual"}) as string;
    const eventualReadPerformance = performance.now() - startEventualRead;

    const startStrongRead = performance.now();
    const strongVal = await kv.get(["hello"], {consistency: "strong"}) as string;
    const strongReadPerformance = performance.now() - startStrongRead;

    const dbPerf: dbPerf = {
      openPerformance,
      regionId,
      writePerformance,
      atomicWritePerformance,
      eventualReadPerformance,
      strongReadPerformance,
    };

    return await ctx.render(dbPerf);
  },
};

export default function Home({data}: PageProps<dbPerf>) {
  return (
    <>
      <Head>
        <title>KV Speed Check</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1>KV Speed Check</h1>
        <p>Open KV: {data.openPerformance}ms</p>
        <p>Region: {data.regionId}</p>
        <p>Write KV: {data.writePerformance}ms</p>
        <p>Atomic Write KV: {data.atomicWritePerformance}ms</p>
        <p>Eventual Read KV: {data.eventualReadPerformance}ms</p>
        <p>Strong Read KV: {data.strongReadPerformance}ms</p>
      </div>
    </>
  );
}
