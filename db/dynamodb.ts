import { ApiFactory } from "https://deno.land/x/aws_api@v0.8.1/client/mod.ts";
import { PutItemInput, ConditionCheck, DynamoDB, Put } from "https://deno.land/x/aws_api@v0.8.1/services/dynamodb/mod.ts";
import { DbPerfRun } from "../types.ts";
import { getDefaultRecord,dbMonthlyLimitExceeded,recordTiming, getErrorRecord } from "./util.ts";

export async function testDynamoDB(): Promise<DbPerfRun> {
  const dbName = "DynamoDB";
  const defaultRecord = getDefaultRecord(dbName);

  try {
    if (defaultRecord.regionId === "unknown" || await dbMonthlyLimitExceeded(dbName, 100000)) {
      //e.g. running locally (don't burn through free tier quota) or quota exceeded
      return defaultRecord;
    }
  
    const accessKey = Deno.env.get("DYNAMODB_ACCESS_KEY");
    const secretKey = Deno.env.get("DYNAMODB_SECRET_ACCESS_KEY");
  
    if (!accessKey || !secretKey) {
      throw new Error(`DynamoDB URL access and/or secret key not set`);
    }
  
    const client = new ApiFactory({ 
      region: "us-east-1", //primary/only region configured for this test
      credentials: {
        awsAccessKeyId: accessKey,
        awsSecretKey: secretKey
      } 
    }).makeNew(DynamoDB);
  
    // *******
    // The next read query relies on a pre-existing partition key '001' in DynamoDB.
    // *******
  
    const eventualReadParams = {
      TableName: "EdgeDbCheck",
      Key: {
        id: {
          S: "001"
        }
      },
      ConsistentRead: false
    };
  
    // *******
    // The next read query relies on a pre-existing partition key '002' in DynamoDB.
    // *******
  
    const strongReadParams = {
      TableName: "EdgeDbCheck",
      Key: {
        id: {
          S: "002"
        }
      },
      ConsistentRead: true
    };
  
    // *******
    // The next transaction condition check relies on a pre-existing partition key '004' in DynamoDB.
    // *******
  
    const transactionConditionCheck: ConditionCheck = {
      TableName: "EdgeDbCheck",
      ConditionExpression: "attribute_exists(id)",
      Key: {
          id: {
            S: "004"
          }
      }
    };
  
    const transactionPut: Put = {
      TableName: "EdgeDbCheck",
      Item: {
        id: {
          S: crypto.randomUUID()
        },
        val: {
          S: "Transaction set at " + Date.now()
        }
      }
    }
  
    const basicWrite: PutItemInput = { 
      TableName: "EdgeDbCheck",
      Item: {
        id: {
          S: crypto.randomUUID()
        },
        val: {
          S: "Value set at " + Date.now()
        }
      }
    };
  
    //The first request to DynamoDB appears to incur a long startup time (cold start), regardless if it is a read or write
    //To make the comparisons with other DBs more 'fair', we do a dummy read first to warm up the connection
    //However, really, this is an important consideration and should be taken into account.
    //warm up takes approx 400ms
    const startWarmup = Date.now();
    await client.getItem({
      TableName: "EdgeDbCheck",
      Key: {
        id: {
          S: "Non existent key - warm up only"
        }
      },
      ConsistentRead: false
    });
    console.log(`DynamoDB warm up took ${Date.now() - startWarmup}ms`);
  
    //write
    const startWrite = Date.now();
    await client.putItem(basicWrite);
    const writeTime = Date.now() - startWrite;
  
    //eventual read
    const startRead = Date.now();
    await client.getItem(eventualReadParams);
    const readTime = Date.now() - startRead;
  
    //transactional write
    const startAtomicWrite = Date.now();
    //Non-sensical transaction which 'put's an item if item with id 004 already exists (which it does)
    await client.transactWriteItems({
      TransactItems: [
        {
          ConditionCheck: transactionConditionCheck
        },
        {
          Put: transactionPut
        }
      ]
    });
    const atomicWrite = Date.now() - startAtomicWrite;
  
    //single region strong read
    const startStrongRead = Date.now();
    await client.getItem(strongReadParams)
    const strongRead = Date.now() - startStrongRead;
  
    const dbPerf: DbPerfRun = {
      dbName: dbName,
      regionId: defaultRecord.regionId,
      writePerformance: writeTime,
      atomicWritePerformance: atomicWrite,
      eventualReadPerformance: readTime,
      strongReadPerformance: strongRead
    };
    await recordTiming(dbPerf);
  
    return dbPerf;
  } catch (e) {
    console.error(e);
    return getErrorRecord(dbName);
  }
}
