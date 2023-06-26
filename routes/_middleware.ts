import { MiddlewareHandlerContext } from "$fresh/server.ts";

export async function handler(req: Request, ctx: MiddlewareHandlerContext<unknown>,) {
  //const start = Date.now();
  const resp = await ctx.next();

  const path = new URL(req.url).pathname;
  if (path === "/") {
    //const region = Deno.env.get("DENO_REGION") || 'no-region';
    //const processTime = Date.now() - start;
    if (req.headers.get("referer")) {
      console.log("******* Referrer: ", req.headers.get("referer"));
    }
  }

  return resp;
}