import { DbPerfRun } from "../types.ts";
import { dbMonthlyLimitExceeded, getDefaultRecord, recordTiming } from "./util.ts";

export async function testFauna(): Promise<DbPerfRun> {
  const dbName = "Fauna";
  const defaultRecord = getDefaultRecord(dbName);

  if (defaultRecord.regionId === "unknown" || await dbMonthlyLimitExceeded(dbName, 50000)) {
    //e.g. running locally (don't burn through free tier quota)
    return defaultRecord;
  }

  const token = Deno.env.get("FAUNA_DB_KEY");
  if (!token) {
    throw new Error("environment variable FAUNA_DB_KEY not set");
  }


  //write
  const startWrite = performance.now();
  await queryFauna(token, "mutation CreateATodo { createTodo(data: { title: \"Hello2\" desc: \"World2\" }) { _id title desc } }", {});
  const writeTime = performance.now() - startWrite;

  //read
  const startRead = performance.now();
  await queryFauna(token, "query { getTodo( title: \"Hello\") { title, desc } }", {});
  const readTime = performance.now() - startRead;

  /**
   * Fauna does not support complex transactions natively via GraphQL API.  Technically speaking, all
   * operations in Fauna are transactions.  Ideally it would be nice to load a transaction into the 
   * DB via DQL and then use @relation to reference it (I think?) however the docs aren't very good 
   * at all and I couldn't easily figure out how to do it.
   * 
   * Instead, we use an update mutation to update the record for something different than a standard write.
   */
  // transaction 
  const startAtomic = performance.now();
  await queryFauna(token, "mutation UpdateTodoUsingTransaction{updateTodo(id: \"364525682591531088\",data: {title: \"Hello\" desc: \"This is the new description.\"}) { title desc}}", {});
  const atomicTime = performance.now() - startAtomic;

  const dbPerf: DbPerfRun = {
    dbName: dbName,
    regionId: defaultRecord.regionId,
    writePerformance: writeTime,
    atomicWritePerformance: atomicTime,
    eventualReadPerformance: -1,
    strongReadPerformance: readTime
  };
  await recordTiming(dbPerf);

  return dbPerf;
}

async function queryFauna(token: string, query: string, variables: { [key: string]: unknown }) {

  try {
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
      console.log('fauna errors:', errors)
      // Return the first error if there are any.
      return { data, error: errors[0] };
    }

    return { data };
  } catch (error) {
    return { error };
  }
}