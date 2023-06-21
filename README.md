<img src="./static/graph.png" alt="network graph"/>

# Global database comparison on Deploy

This is the code repository for the experiment/blog post hosted at https://global-db-comparison.deno.dev/

In addition to the static content for the blog post, this code will also send database requests to 5 databases:
* Deno KV
* DynamoDB
* Fauna
* PlanetScale
* Upstash Redis

The primary goal is to measure latency of requests between the databases and analyse their features, characteristics,etc.  All requests are sent from this Fresh application running on Deno Deploy.  Deploy was chosen as the edge function provider as it is the only one (currently) which can run KV.

## Environment variables needed
* UPSTASH_REDIS_URL
* UPSTASH_REDIS_TOKEN
* FAUNA_DB_KEY
* PLANETSCALE_DB_URL
* DYNAMODB_ACCESS_KEY
* DYNAMODB_SECRET_ACCESS_KEY

## Database setup
To run locally, you will need to setup a database in each of the providers (except KV).  Some need schemas uploaded or defined, and all need some minor static data inserted (see comments in code for each database).

Note:  By default, database calls (except KV) are disabled when running locally.

## Usage

Start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.
