import { linkStyles } from "../db/util.ts";

export default function UnderstandingConsistency() {
  return (
    <>
      <div id="understanding_database_consistency">&nbsp;</div>
      <h2 class="text-2xl font-bold">Understanding database consistency</h2>
      <p class="mt-3">
        In an ideal world, an update to one database would instantly update all the replica databases around the world making 
        them all consistent with each other.  Unfortunately, the same latency issues that we are trying to solve with global databases
        work against us here, as updating all the global replicas takes time.  The speed of light is only so fast.
      </p>
      <p class="mt-3">
        There are a number of different consistency models that databases can support.  Two common ones are:
        <ul class="list-disc ml-7 mt-3">
          <li>Strong consistency:  All reads are guaranteed to return the most recent write at the cost of higher latency</li>
          <li>Eventual consistency:  Reads may return old/stale data, typically at much lower latencies, but will eventually return the most recent write.  Under
            normal circumstances, you would expect database writes to be consistent within a number of seconds but many factors can influence this.
          </li>
        </ul>
      </p>
      <p class="mt-3">
        The  <a class={linkStyles} href="https://en.wikipedia.org/wiki/PACELC_theorem">PACELC theorem</a> nicely 
        describes the trade-offs between consistency and latency.  Stronger consistency means higher latency
        and the reverse is true as well with weaker consistency allowing for lower latency.
      </p>
      <p class="mt-3">
        Let's imagine you are located in Australia and the primary region of the database in the US but with a replica in Australia. If
        someone from France updates a record on the database (which gets sent to the US) immediately before you read that record in Australia, depending on
        your consistency model, you may get the old value (eventual consistency) from the Australia replica or the new value (strong 
        consistency) from the US primary region.
      </p>
      <p class="mt-3">
        The consistency model that you use for your application will depend on your application's requirements and what the database
        is capable of.  If you are building a banking application where it is critical to ensure a financial transaction correctly debits 
        one account and credits another for the same amount, you will likely want to use strong consistency and 
        &nbsp;<a class={linkStyles} href="https://en.wikipedia.org/wiki/ACID">ACID transactions</a>.  
        However, if you are building a social media application, eventual consistency of your user's posts may be a better choice as having 
        slightly stale posts is potentially a worthwhile trade-off for the significant performance boost of eventual reads.
      </p>
    </>
  );
}