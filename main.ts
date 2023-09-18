/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";
import {
  COMPUTE_STATS_TOPIC,
  DELIVERY_FAILED,
  LAST_MESSAGE_DELIVERY,
  LOCK,
  NEXT_UPDATE,
} from "./types.ts";
import { computeStats } from "./utils/computeStats.ts";

const kv = await Deno.openKv();
const _24_HOURS_IN_MS = 24 * 60 * 60 * 1000;

async function enqueue(topic: string, delay: number): Promise<void> {
  const deliveryTime = Date.now() + delay;
  const topicDeliveryDateKey = [topic, NEXT_UPDATE];

  const result = await kv.atomic()
    .enqueue(topic, {
      delay: delay,
      keysIfUndelivered: [[topic, DELIVERY_FAILED]],
    }) // enqueue next recurring update
    .set(topicDeliveryDateKey, deliveryTime)
    .commit();

  if (result.ok) {
    console.log(
      `------- Enqueued next update for: ${topic} at (${
        (new Date(deliveryTime)).toUTCString()
      } (UTC))`,
    );
  } else {
    const nextDelivery = (await kv.get(topicDeliveryDateKey)).value as number;
    console.log(
      `Failed to queue message for ${topic}, next delivery time is ${nextDelivery} (${
        new Date(nextDelivery).toUTCString()
      } (UTC))`,
    );
  }
}

kv.listenQueue(async (msg: unknown) => {
  const now = Date.now();
  const topic = msg as string;

  console.log(`Received message topic: ${topic}`);

  // Set delivery time of message
  await kv.set([topic, LAST_MESSAGE_DELIVERY], now);

  // Update stats, if this fails then message may be redelivered
  await computeStats();

  // getting this far means the message was successfully delivered,
  // ready for enqueue of next message
  await enqueue(COMPUTE_STATS_TOPIC, _24_HOURS_IN_MS);
});

// Start recurring job if no other isolate has already started it before
const startRecurring = await kv.atomic()
  .check({ key: [COMPUTE_STATS_TOPIC, LOCK], versionstamp: null })
  .set([COMPUTE_STATS_TOPIC, LOCK], true)
  .commit();

if (startRecurring.ok) {
  console.log(
    "Starting recurring job for compute stats with immediate delivery",
  );
  await enqueue(COMPUTE_STATS_TOPIC, 0);
}

// If there was a failed delivery, restart the recurring job
const failedKey = await kv.get([COMPUTE_STATS_TOPIC, DELIVERY_FAILED]);
if (failedKey.value) {
  const topic = failedKey.value as string;
  const shouldRestart = await kv.atomic()
    .check({
      key: [COMPUTE_STATS_TOPIC, DELIVERY_FAILED],
      versionstamp: failedKey.versionstamp,
    })
    .delete([COMPUTE_STATS_TOPIC, DELIVERY_FAILED])
    .commit();

  if (shouldRestart.ok) {
    console.log(
      `Restarting recurring job for topic ${topic} after failed delivery`,
    );
    await enqueue(topic, 0);
  }
}

await start(manifest, { plugins: [twindPlugin(twindConfig)] });
