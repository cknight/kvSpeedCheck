import { ApiFactory } from 'https://deno.land/x/aws_api/client/mod.ts';
import { PutItemInput, ConditionCheck, DynamoDB, Put } from 'https://deno.land/x/aws_api/services/dynamodb/mod.ts';
import { DbPerfRun } from "../types.ts";
import { getDefaultRecord,dbMonthlyLimitExceeded,recordTiming } from "./util.ts";

//Transactions are not supported across regions in global tables.
//Must manually manage regions yourself
export async function testDynamoDB(): Promise<DbPerfRun> {
  const dbName = "DynamoDB";
  const defaultRecord = getDefaultRecord(dbName);

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
    region: "us-east-1", 
    credentials: {
      awsAccessKeyId: accessKey,
      awsSecretKey: secretKey
    } 
  }).makeNew(DynamoDB);

  const eventualReadParams = {
    TableName: "EdgeDbCheck",
    Key: {
      id: {
        S: "001"
      }
    },
    ConsistentRead: false
  };

  const strongReadParams = {
    TableName: "EdgeDbCheck",
    Key: {
      id: {
        S: "002"
      }
    },
    ConsistentRead: true
  };

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
        S: "003-" + crypto.randomUUID()
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
        S: "005-" + crypto.randomUUID()
      },
      val: {
        S: "Value set at " + Date.now()
      }
    }
  };

  //The first request to DynamoDB incurs a long startup time (cold start), regardless if it is a read or write
  //To make the comparisons with other DBs more 'fair', we do a dummy read first to warm up the connection
  //However, really, this is an important consideration and should be taken into account.
  //warm up (e.g. takes 434ms from EU to US)
  const startWarmup = performance.now();
  await client.getItem({
    TableName: "EdgeDbCheck",
    Key: {
      id: {
        S: "Non existent key - warm up only"
      }
    },
    ConsistentRead: false
  });
  console.log(`DynamoDB warm up took ${performance.now() - startWarmup}ms`);

  //write
  const startWrite = performance.now();
  await client.putItem(basicWrite);
  const writeTime = performance.now() - startWrite;

  //eventual read
  const startRead = performance.now();
  await client.getItem(eventualReadParams);
  const readTime = performance.now() - startRead;

  //transactional write
  const startAtomicWrite = performance.now();
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
  const atomicWrite = performance.now() - startAtomicWrite;

  //single region strong read
  const startStrongRead = performance.now();
  await client.getItem(strongReadParams)
  const strongRead = performance.now() - startStrongRead;

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
}
