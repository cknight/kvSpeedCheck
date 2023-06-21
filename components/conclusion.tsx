import { linkStyles } from "../db/util.ts";

export default function Conclusion() {
  return (
    <>
      <div id="conclusions">&nbsp;</div>
      <h2 class="text-2xl font-bold">Final thoughts</h2>
      <p class="mt-3">
        The goal of this experiment was to put KV through its paces and compare it to other globally distributed database options
        for use on Deploy.  Having done this, it is clear that KV is a serious contender and a very impressive database.  The team
        appear to have made a great choice by using FoundationDB as the base to work on top of.  With one
        of the strongest consistency models, some of the fastest performance and best in class ease of use, it's an obvious choice
        for many use cases.
      </p>
      <p class="mt-3">
        In terms of individual databases, Fauna is talked highly of in technical circles and I can see its potential.  However, I
        can't get away from its complexity.  Developer time is expensive and unless Fauna really fit the project need, the cost of
        bringing the team up to speed with the database would be high.  It's 'global' offering is also disappointing, though may 
        improve in the future. Being limited to GraphQL API only (i.e. and not FaunaQL) on Deploy is also a potential drawback.
      </p>
      <p class="mt-3">
        DynamoDB was one of the first serverless databases.  Clearly it has proven itself and is a solid choice used by many companies
        large and small.  To me, it feels like a database that has been around for a long time and is showing its age.  It's highly
        performant, but has a mixed consistency model and the global tables feels like a bolt on rather than a core feature.  Also, it
        was the only database in this experiment to incur a cold start penalty (~400ms). That
        said, it's hard to beat it's enterprise features and AWS integrations.  I found the lack of documentation on Deno usage very
        frustrating, though I expect this to improve dramatically once npm specifiers are supported in Deploy.
      </p>
      <p class="mt-3">
        I loved how easy it was to get up and running with Upstash and those familiar with Redis will feel right at home.  Their 
        serverless pricing model is really nice as well as the ability to customise replica regions.  The pricing of reads and writes
        looks expensive and so enabling lots of replicas could be very costly.  Write performance was also disappointing.
      </p>
      <p class="mt-3">
        PlanetScale was a surprise to me having heard great things about it.  Technically it is impressive with Vitess and thus
        a sharded distributed relational database.  Like DynamoDB, their 'global' offering feels like a bolt on and read performance
        is slow.  The need to manually shard your database once it degrades or runs into infrastructure problems is a turn off for me
        and runs counter to the serverless concept. Admittedly, few projects will ever need to undertake this. The schema management 
        features are impressive and it's the definitive database in this
        experiment which can best handle relational data (N.B. Fauna also handles relational data and it would be interesting to pit
        these two against each other with complex scenarios around relational data).  Finally, while storage is expensive, you get an
        astonishing amount of reads and writes for your money.  If you use your database heavily with many reads/writes PlanetScale
        could make a very compelling case on price.
      </p>
      <p class="mt-3">
        This leaves us with Deno KV.  Going into this experiment, I didn't expect it to hold up as well as it has against the
        big hitters.  Comparing to DynamoDB, it's as fast doing writes and faster doing reads thanks to replica regions (yes, it's
        not a fair comparison without enabling global tables in DynamoDB).  Impressively, it achieves this with a stronger consistency
        model.  The API is much better than DynamoDB. It's also just such a joy to start coding with since there's nothing to install,
        setup, configure, etc.  This will boost team creativity and productivity (less barriers) as well as reducing development costs.
        As a beta product, it's still lacking in a number of features but if the pricing model is competitive it's a no brainer choice
        for use on Deploy assuming it fits your data modelling needs, unless vendor lock-in is a major consideration.
      </p>
      <p class="mt-3">
        Ultimately which database you choose will depend on your use case.  If you need relational capabilities, go with PlanetScale or 
        Fauna.  If you need enterprise features or AWS integrations, DynamoDB is an solid choice.  If read performance is critical,
        and you can tolerate eventual consistency, Upstash Redis may be your best choice.  However, for many projects on Deploy, I would
        highly recommend KV.  
      </p>
      <hr class="w-[50%] m-auto mt-8 mb-8"/>
      <p class="mt-8 italic">
        Thank you for reading.  I hope you found this experiment useful.  If you have any questions, comments, or real world experience
        you want to share please reach out in the  <a class={linkStyles} href="https://github.com/cknight/kvSpeedCheck/discussions">project discussions</a>.
        Code for the experiment may also be found in the  <a class={linkStyles} href="https://github.com/cknight/kvSpeedCheck">github repo</a>.
      </p>
      <p class="mt-3 mb-16 italic">
          <span class="font-bold">Disclaimer: </span>I have no affiliation with any of the companies mentioned in this article and
          am a first time user of each of the databases in the experiment.
      </p>
    </>
  )
}