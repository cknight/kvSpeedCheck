import { HandlerContext, Handlers } from "$fresh/server.ts";
import { computeStats } from "../../utils/computeStats.ts";

export const handler: Handlers = {
  async GET(_req: Request, _ctx: HandlerContext) {
    const url = new URL(_req.url);
    const token = url.searchParams.get("token");
    if (token === Deno.env.get("TOKEN")) {
      const start = Date.now();
      await computeStats();
      return new Response("Stats updated!");
    } else {
      return new Response("Request not authorized", { status: 403 });
    }
  },
};
