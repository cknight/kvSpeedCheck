export default function Introduction() {
  return (
    <>
      <div id="introduction">&nbsp;</div>
      <h2 class="text-2xl font-bold">Introduction</h2>
      <p class="mt-3">
        Before the cloud came along, a typical web application architecture
        would consist of a web server and a database. These typically were
        hosted in the same datacentre. This worked well for application teams
        (with everything in the same physical location), but not so well for
        users far away from the datacentre. The time it takes for data to travel
        a network, known as latency, for requests from the browser to the server
        could significantly impact the user experience.
        <img
          src="/traditional_architecture.png"
          alt="Traditional architecture diagram"
          class=""
        />
        To help solve this problem of users far away, a new concept arrived,
        sometimes referred to as Edge hosting, where your application would be
        served from multiple global locations with the user being served from
        the closest location. This solved one problem of long latencies between
        the user's browser and the server. However, ironically, this made the
        experience worse for some applications and users as all those server to
        database calls were still going back to the original datacentre which
        could be far away from the user leading to increased overall response
        times.
        <img
          src="/edge_app_architecture.png"
          alt="Edge application architecture diagram"
          class=""
        />
        The next evolution in this journey are globally distributed databases,
        hosted in multiple regions around the world. By bringing the database
        closer to the user and server, both server and database are now closer
        to all your users around the globe and the latency for database calls
        can be significantly reduced. Other benefits include increased
        scalability as your traffic is split across many instances, as well as
        high availability with the ability to provide a database service even if
        one or more database nodes goes offline. Hooray! Problem solved right?
        Well, not so fast. It turns out that managing consistent state across
        each database instance spread around the world is a Seriously Hard
        Problem&trade;.
      </p>
      <p class="mt-3">
        There are a number of different approaches to solving this problem, each
        with trade-offs. One approach is to have a single primary region where
        all writes are sent to, and then asynchronously replicate those writes
        to the databases in other regions (often referred to as replicas).
        Writes can be potentially slower depending on how far away the primary
        region is from the user. Depending on the consistency model of the
        database (more on this below), reads can be looked at two ways:
        <ul class="list-disc ml-7 mt-3">
          <li>
            reading data which guarantees the most up to date data (referred to
            as strong consistency reads), but may be slower as these must be
            read from the primary region
          </li>
          <li>
            faster reads from the database region closest to the user or server,
            but may return stale data (referred to as eventual consistency
            reads) as the most recent updates in the primary database might not
            have made it to the user's closest database yet
          </li>
        </ul>
        <img
          src="/edge_server_and_db_architecture.png"
          alt="Edge server and database architecture diagram"
          class=""
        />
        As you can see the diagram above, if your application can tolerate
        eventual reads for some or most data, you can potentially save a
        significant amount of latency by not going all the way back to the
        primary region for reads. The downside is that you may read data which
        has been updated on the primary region but not yet replicated to the
        region you are reading from. This is the approach that Deno KV takes
        with the nice bonus that KV lets you choose if you want to read from a
        primary or replica database.
      </p>
    </>
  );
}
