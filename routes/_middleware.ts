import { MiddlewareHandlerContext } from "$fresh/server.ts";

export async function handler(req: Request, ctx: MiddlewareHandlerContext<unknown>,) {
  const start = Date.now();
  const resp = await ctx.next();

  const path = new URL(req.url).pathname;
  if (path === "/") {
    const referrer = req.headers.get("referer") || 'no-referer';
    //const region = Deno.env.get("DENO_REGION") || 'no-region';
    //const processTime = Date.now() - start;
    console.log("Referrer: ", referrer);
  }

  return resp;
}