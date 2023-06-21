import { linkStyles } from "../db/util.ts";

export default function LatencyExperiment() {
  return (
    <>
      <div id="latency_experiment">&nbsp;</div>
      <h2 class="text-2xl font-bold">Latency experiment</h2>
      <p class="mt-3">
        To be highly performant and give users the best experience, a globally distributed server needs a globally distributed database. 
        How well does Deno's new KV database perform from regions around the globe and how does it compare to other globally distributed 
        databases accessed from Deno Deploy?
      </p>
      <p class="mt-3">
        Loading this page sent basic database write and read requests to each database.  The database operations 
        were executed from a Deno Deploy application running in the Google Cloud Platform (GCP) 
        region/datacentre closest to you. Where the read or write operation was sent (i.e. which database region), and therefore
        the latency experienced, depends on how the database provider manages their network, where the primary database is, 
        how many replicas are available, and what operation was used, amongst some factors influencing the latency.
      </p>
        
      <p class="mt-3">
        All results represent the time for the database operation to execute, including the latency between the server
        (i.e. Deno Deploy application instance) and the database. The network latency between your browser and the 
        server is not included in any result below.
      </p>

      <p class="mt-3">
        The experiment aims to test the databases management and latency of global access.  The queries are very simple
        and the data volumes are very small, both of which are unrealistic in a real-world application.  The experiment is not
        meant to be a benchmark of the databases per se, but rather a simple test of the latency of the databases from 
        different regions.
      </p>

      <p class="mt-3">
        The excellent <a class={linkStyles} href="https://www.webpagetest.org/">WebPageTest</a> was used to send requests
        to the different regions and provide the initial population of results.
      </p>

      <p class="mt-3"><div class="border-1 p-3 border-red-500">
        <span class="font-bold text-red-400 underline">Important:</span> Please read the analysis on each database below to understand
        the results with the proper context.  Generally speaking, the results are not always directly comparable as the databases have different
        setups, use cases, replica regions, configuration, etc. You should always do your own research, testing and 
        benchmarking to determine which database is best for your use case.
        </div>
      </p>
    </>
  );
}