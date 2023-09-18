import { DbPerfRun } from "../types.ts";
import {
  dbMonthlyLimitExceeded,
  getDefaultRecord,
  getErrorRecord,
  recordTiming,
} from "./util.ts";

export async function testFauna(): Promise<DbPerfRun> {
  const dbName = "Fauna";
  const defaultRecord = getDefaultRecord(dbName);

  try {
    if (
      defaultRecord.regionId === "unknown" ||
      await dbMonthlyLimitExceeded(dbName, 50000)
    ) {
      //e.g. running locally (don't burn through free tier quota) or quota exceeded
      return defaultRecord;
    }

    const token = Deno.env.get("FAUNA_DB_KEY");
    if (!token) {
      throw new Error("environment variable FAUNA_DB_KEY not set");
    }

    //write
    const startWrite = Date.now();
    await queryFauna(
      token,
      'mutation CreateATodo { createTodo(data: { title: "' +
        crypto.randomUUID() + '" desc: "Hello world" }) { _id title desc } }',
      {},
    );
    const writeTime = Date.now() - startWrite;

    // *******
    // The next read relies on a pre-existing key 'Hello' in the database.
    // *******

    //read
    const startRead = Date.now();
    await queryFauna(
      token,
      'query { getTodo( title: "Hello") { title, desc } }',
      {},
    );
    const readTime = Date.now() - startRead;

    /**
     * Fauna does not support multi-operation transactions via their GraphQL API.  Technically speaking, all
     * operations in Fauna are transactions, but the goal here was to do a multi-operation transaction.
     * I believe this is possible by defining a logical function on the database itself however the
     * docs aren't very good on this and I couldn't figure out how to do it.
     *
     * Instead, we use an update mutation to update the record for something different than a standard
     * write but this isn't perhaps directly comparable to other databases multi-operation transactions.
     */
    // transaction
    const startAtomic = Date.now();
    await queryFauna(
      token,
      'mutation UpdateTodoUsingTransaction{updateTodo(id: "364525682591531088",data: {title: "Hello" desc: "This is the new description."}) { title desc}}',
      {},
    );
    const atomicTime = Date.now() - startAtomic;

    const dbPerf: DbPerfRun = {
      dbName: dbName,
      regionId: defaultRecord.regionId,
      writePerformance: writeTime,
      atomicWritePerformance: atomicTime,
      eventualReadPerformance: -1,
      strongReadPerformance: readTime,
    };
    await recordTiming(dbPerf);

    return dbPerf;
  } catch (e) {
    console.error(e);
    return getErrorRecord(dbName);
  }
}

async function queryFauna(
  token: string,
  query: string,
  variables: { [key: string]: unknown },
) {
  // Make a POST request to fauna's graphql endpoint with body being
  // the query and its variables.
  const res = await fetch("https://graphql.us.fauna.com/graphql", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const { data, errors } = await res.json();

  if (errors) {
    console.log("fauna errors:", errors);
    throw new Error(errors[0]);
  }

  return { data };
}
