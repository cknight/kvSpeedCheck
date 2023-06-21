import { linkStyles } from "../db/util.ts";

export default function Databases() {
  return (
    <>
      <div id="global_databases_for_deploy">&nbsp;</div>
      <h2 class="text-2xl font-bold">Global database options for Deploy</h2>
      <p class="mt-3">
        Running applications on  <a class={linkStyles} href="https://deno.com/deploy">Deno Deploy</a> means serving requests from locations around the globe, 
        from a location closest to the user. Ideally, the database would be located close to the server so that latency between the 
        server and database is minimised for all the database calls made from the server.  Therefore an ideal database for Deno Deploy
        would be one which was globally distributed in multiple regions to decrease latency and thus provide a better user experience. 
        In this post, we'll experiment with the following subset of serverless databases which all offer multi-region replication and 
        work with Deno Deploy:
      </p>
      <h3 class="mt-3 text-xl font-bold">
        <svg class="inline mr-3 text-default h-10 flex-none dark:text-gray-900" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Deno Logo"><g clip-path="url(#clip0_29_599)"><path d="M15 0C23.2843 0 30 6.71572 30 15C30 23.2843 23.2843 30 15 30C6.71572 30 0 23.2843 0 15C0 6.71572 6.71572 0 15 0Z" fill="currentColor"></path><path d="M14.6635 22.3394C14.2788 22.2357 13.8831 22.4584 13.7705 22.8381L13.7655 22.8558L12.7694 26.5472L12.7649 26.565C12.6711 26.9498 12.9011 27.3414 13.2858 27.4451C13.6704 27.549 14.0661 27.3263 14.1787 26.9465L14.1837 26.9289L15.1797 23.2375L15.1843 23.2196C15.1911 23.1919 15.1962 23.164 15.1997 23.1362L15.2026 23.1084L15.179 22.9888L15.1445 22.8166L15.1227 22.7091C15.076 22.619 15.0111 22.5396 14.932 22.4759C14.853 22.4123 14.7615 22.3658 14.6635 22.3394ZM7.7224 18.5379C7.70424 18.5741 7.68883 18.6123 7.67658 18.6522L7.66967 18.6763L6.67358 22.3677L6.669 22.3856C6.57525 22.7704 6.80524 23.1619 7.1899 23.2657C7.57451 23.3695 7.97026 23.1469 8.08287 22.7671L8.08779 22.7494L8.99096 19.4023C8.51793 19.1518 8.09336 18.8628 7.7224 18.5379ZM5.34707 14.2929C4.9624 14.1891 4.56666 14.4117 4.4541 14.7915L4.44912 14.8092L3.45303 18.5006L3.44846 18.5184C3.35471 18.9032 3.58469 19.2947 3.96936 19.3985C4.35397 19.5023 4.74971 19.2797 4.86232 18.8999L4.86725 18.8822L5.86334 15.1908L5.86791 15.173C5.96166 14.7882 5.73174 14.3967 5.34707 14.2929ZM27.682 13.4546C27.2973 13.3508 26.9015 13.5734 26.789 13.9532L26.784 13.9709L25.7879 17.6623L25.7833 17.6801C25.6896 18.0649 25.9196 18.4564 26.3042 18.5602C26.6889 18.664 27.0846 18.4414 27.1972 18.0616L27.2021 18.0439L28.1982 14.3525L28.2028 14.3347C28.2965 13.9499 28.0666 13.5584 27.682 13.4546ZM3.17781 8.52527C2.34361 10.0444 1.81243 11.7112 1.61377 13.4329C1.7088 13.5412 1.83381 13.619 1.97301 13.6563C2.35768 13.7602 2.75342 13.5375 2.86598 13.1577L2.87096 13.1401L3.86705 9.44865L3.87162 9.43084C3.96537 9.04599 3.73539 8.65447 3.35072 8.5507C3.2943 8.53547 3.23623 8.52694 3.17781 8.52527ZM25.159 8.5507C24.7744 8.44687 24.3786 8.66953 24.266 9.04933L24.2611 9.06697L23.265 12.7584L23.2604 12.7762C23.1667 13.161 23.3966 13.5526 23.7813 13.6563C24.1659 13.7602 24.5617 13.5375 24.6743 13.1577L24.6792 13.1401L25.6753 9.44865L25.6799 9.43084C25.7736 9.04599 25.5436 8.65447 25.159 8.5507Z" fill="white"></path><path d="M7.51285 5.04065C7.12824 4.93682 6.73249 5.15948 6.61988 5.53929L6.61495 5.55692L5.61886 9.24833L5.61429 9.26614C5.52054 9.65098 5.75052 10.0425 6.13519 10.1463C6.5198 10.2501 6.91554 10.0274 7.02816 9.64764L7.03308 9.63001L8.02917 5.9386L8.03374 5.92079C8.12749 5.53595 7.89751 5.14442 7.51285 5.04065ZM20.3116 5.73845C19.9269 5.63462 19.5312 5.85727 19.4186 6.23708L19.4136 6.25471L18.7443 8.73499C19.1779 8.94915 19.5917 9.20126 19.9809 9.48839L20.0453 9.53643L20.8279 6.63639L20.8324 6.61858C20.9262 6.23374 20.6963 5.84221 20.3116 5.73845ZM13.7968 1.57642C13.3296 1.61771 12.8647 1.68338 12.4043 1.77317L12.3066 1.79263L11.3782 5.23419L11.3736 5.252C11.2799 5.63684 11.5099 6.02837 11.8945 6.13214C12.2792 6.23596 12.6749 6.01331 12.7875 5.6335L12.7924 5.61587L13.7885 1.92446L13.7931 1.90665C13.8196 1.79831 13.8209 1.68533 13.7968 1.57642ZM22.9626 4.1263L22.7669 4.85169L22.7623 4.86944C22.6686 5.25429 22.8986 5.64581 23.2832 5.74958C23.6678 5.85341 24.0636 5.63075 24.1762 5.25095L24.1811 5.23331L24.2025 5.15462C23.8362 4.81205 23.4511 4.49009 23.0491 4.19022L22.9626 4.1263ZM17.1672 1.69677L16.8139 3.00593L16.8094 3.02374C16.7156 3.40858 16.9456 3.80011 17.3303 3.90388C17.7149 4.0077 18.1106 3.78505 18.2233 3.40524L18.2282 3.38761L18.6 2.00966C18.1624 1.88867 17.719 1.79001 17.2714 1.71405L17.1672 1.69677Z" fill="white"></path><path d="M9.69085 24.6253C9.80341 24.2455 10.1992 24.0229 10.5838 24.1266C10.9685 24.2303 11.1984 24.6219 11.1047 25.0068L11.1001 25.0246L10.3872 27.6664L10.2876 27.6297C9.85836 27.4694 9.43765 27.2873 9.0271 27.0839L9.68587 24.6429L9.69085 24.6253Z" fill="white"></path><path d="M14.4141 8.49082C10.0522 8.49082 6.65918 11.2368 6.65918 14.6517C6.65918 17.8769 9.78123 19.9362 14.6211 19.8331C15.0327 19.8243 15.1517 20.1008 15.2856 20.4734C15.4196 20.846 15.7796 22.8097 16.0665 24.3117C16.3233 25.656 16.5842 27.0052 16.7834 28.3596C19.9439 27.9418 22.8663 26.3807 25.0076 24.0261L22.7237 15.5088C22.1544 13.4518 21.489 11.5564 19.7283 10.1794C18.3118 9.07166 16.5122 8.49082 14.4141 8.49082Z" fill="white"></path><path d="M15.3516 10.957C15.8694 10.957 16.2891 11.3767 16.2891 11.8945C16.2891 12.4123 15.8694 12.832 15.3516 12.832C14.8338 12.832 14.4141 12.4123 14.4141 11.8945C14.4141 11.3767 14.8338 10.957 15.3516 10.957Z" fill="currentColor"></path></g><defs><clipPath id="clip0_29_599"><rect width="30" height="30" fill="white"></rect></clipPath></defs></svg>
        Deno KV</h3>
      <p class="mt-3">
          <a class={linkStyles} href="https://deno.com/kv">Deno KV</a> is a new global key-value database from the Deno team (currently in private beta). Reads are strongly 
        consistent within the primary region and eventually consistent in replica regions. You can easily choose which consistency
        level you want for your reads. It is built on top of the 
        open source  <a class={linkStyles} href="https://www.foundationdb.org/">FoundationDB</a> (used by Apple's 
        iCloud) and there is no configuration or setup.  Data is replicated to at least 6 datacentres across 3 regions (US, Europe 
        and Asia).  Access is via a custom but  <a class={linkStyles} href="https://deno.land/api?s=Deno.Kv&unstable=">simple API layer</a>.  ACID 
        transactions are supported globally and 
        offer  <a class={linkStyles} href="https://jepsen.io/consistency/models/strict-serializable">strict serializability</a>, the strongest level of
        consistency possible.
      </p>
      <h3 class="mt-3 text-xl font-bold">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42.3 47" class="w-8 inline mr-3"><path style="fill:#813eef" d="M32.9 9.9c-2.9 1-4.3 2.7-5.3 5.4-.2.7-.9 1.5-1.6 2.1l2.4 2.6-7.6-5.3L0 0s1.5 9.8 2 13.4c.4 2.5 1 3.7 3 4.8l.8.4 3.4 1.8-2-1.1 9.4 5.2-.1.1L6.4 20c.5 1.8 1.6 5.4 2 7 .5 1.7 1 2.3 2.7 2.9l3 1.1 1.9-.7-2.4 1.6L1.7 47c7.9-7.4 14.6-10 19.5-12.1 6.3-2.7 10-4.5 12.5-10.7 1.8-4.4 3.1-10 4.9-12.2l3.7-4.7c0-.1-7.6 2-9.4 2.6z"></path></svg>
        Fauna</h3>
      <p class="mt-3">
          <a class={linkStyles} href="https://fauna.com/">Fauna</a> is a serverless 
        NoSQL  <a class={linkStyles} href="https://fauna.com/blog/what-is-a-document-relational-database">document-relational</a> database offering 
        two query languages,  <a class={linkStyles} href="https://docs.fauna.com/fauna/current/api/fql/">Fauna QL (FQL)</a> and  <a class={linkStyles} href="https://docs.fauna.com/fauna/current/api/graphql/">GraphQL</a>.  During database creation,   
        you must choose between two  <a class={linkStyles} href="https://docs.fauna.com/fauna/current/learn/understanding/region_groups">region groups</a> to host your 
        database: US or Europe.  Data is replicated to 3 geographic regions within the region group (i.e. US or Europe), but never outside that region 
        group. For this experiment the US region group was chosen.  True global replication is possible (e.g. hosting in US, Europe and Aisa)
        but only for enterprise customers through their Virtual Private Fauna offering.
      </p>
      <p class="mt-3">
        Fauna offers strong consistency for all reads and writes as well as supporting ACID transactions.  Both Deno KV and Fauna provide
        the strongest consistency model of the databases in the experiment. Despite being a NoSQL
        database, a strength of Fauna is its relational database capabilities such as normalisation, joins and indexes.
      </p>
      <h3 class="mt-3 text-xl font-bold">
        <svg class="inline mr-3 w-8" viewBox="-16.5 0 289 289" preserveAspectRatio="xMidYMid">
          <g>
            <path d="M165.258,288.501 L168.766,288.501 L226.027,259.867 L226.98,258.52 L226.98,29.964 L226.027,28.61 L168.766,0 L165.215,0 L165.258,288.501" fill="#5294CF"></path>
            <path d="M90.741,288.501 L87.184,288.501 L29.972,259.867 L28.811,257.87 L28.222,31.128 L29.972,28.61 L87.184,0 L90.785,0 L90.741,288.501" fill="#1F5B98"></path>
            <path d="M87.285,0 L168.711,0 L168.711,288.501 L87.285,288.501 L87.285,0 Z" fill="#2D72B8"></path>
            <path d="M256,137.769 L254.065,137.34 L226.437,134.764 L226.027,134.968 L168.715,132.676 L87.285,132.676 L29.972,134.968 L29.972,91.264 L29.912,91.296 L29.972,91.168 L87.285,77.888 L168.715,77.888 L226.027,91.168 L247.096,102.367 L247.096,95.167 L256,94.193 L255.078,92.395 L226.886,72.236 L226.027,72.515 L168.715,54.756 L87.285,54.756 L29.972,72.515 L29.972,28.61 L0,63.723 L0,94.389 L0.232,94.221 L8.904,95.167 L8.904,102.515 L0,107.28 L0,137.793 L0.232,137.769 L8.904,137.897 L8.904,150.704 L1.422,150.816 L0,150.68 L0,181.205 L8.904,185.993 L8.904,193.426 L0.373,194.368 L0,194.088 L0,224.749 L29.972,259.867 L29.972,215.966 L87.285,233.725 L168.715,233.725 L226.196,215.914 L226.96,216.249 L254.781,196.387 L256,194.408 L247.096,193.426 L247.096,186.142 L245.929,185.676 L226.886,195.941 L226.196,197.381 L168.715,210.584 L168.715,210.6 L87.285,210.6 L87.285,210.584 L29.972,197.325 L29.972,153.461 L87.285,155.745 L87.285,155.801 L168.715,155.801 L226.027,153.461 L227.332,154.061 L254.111,151.755 L256,150.832 L247.096,150.704 L247.096,137.897 L256,137.769" fill="#1A476F"></path>
            <path d="M226.027,215.966 L226.027,259.867 L256,224.749 L256,194.288 L226.2,215.914 L226.027,215.966" fill="#2D72B8"></path>
            <path d="M226.027,197.421 L226.2,197.381 L256,181.353 L256,150.704 L226.027,153.461 L226.027,197.421" fill="#2D72B8"></path>
            <path d="M226.2,91.208 L226.027,91.168 L226.027,134.968 L256,137.769 L256,107.135 L226.2,91.208" fill="#2D72B8"></path>
            <path d="M226.2,72.687 L256,94.193 L256,63.731 L226.027,28.61 L226.027,72.515 L226.2,72.575 L226.2,72.687" fill="#2D72B8"></path>
          </g>
        </svg>DynamoDB</h3>
      <p class="mt-3">
          <a class={linkStyles} href="https://aws.amazon.com/dynamodb/">DynamoDB</a> is a serverless NoSQL key-value database from AWS.  For access, it 
        supports a custom  <a class={linkStyles} href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html">JSON API</a> as 
        well as  <a class={linkStyles} href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ql-reference.html">PartiQL</a> (a SQL-compatible
        query language).  DynamoDB tables, by default, are deployed to a single region. To achieve a multi-region 
        setup, you can enable  <a class={linkStyles} href="https://aws.amazon.com/dynamodb/global-tables/">global tables</a> which creates identical tables in additional regions (in as many regions as you like). 
        Due to the complexity of managing global tables (see analysis below), only a single region in N. Virginia was configured for
        this experiment.
      </p>
      <p class="mt-3">
        Strong consistency is offered within a single region only but not for secondary indexes.  Global tables are eventually consistent 
        with each other.  DynamoDB also supports ACID transactions, but only within a single region.  Transactions are not ACID 
        compliant when replicating to other regions.  DynamoDB also integrates extremely well with other AWS services as well as offering
        a host of enterprise features such as encryption at rest and a multitude of back and restore options. 
      </p>
      <h3 class="mt-3 text-xl font-bold">
      <svg class="inline w-6 mr-3" viewBox="0 0 256 341" version="1.1" preserveAspectRatio="xMidYMid">
            <g>
                <path d="M0,298.416784 C56.5542815,354.970323 148.246768,354.970323 204.801032,298.416784 C261.354571,241.86252 261.354571,150.170106 204.801032,93.6158424 L179.200462,119.215688 C221.61634,161.631567 221.61634,230.401059 179.200462,272.816213 C136.785307,315.232092 68.0157428,315.232092 25.5998642,272.816213 L0,298.416784 Z" fill="#00C98D"></path>
                <path d="M51.200362,247.216367 C79.4772765,275.493137 125.323122,275.493137 153.600615,247.216367 C181.877385,218.939598 181.877385,173.093028 153.600615,144.816259 L128.000769,170.416105 C142.139154,184.55449 142.139154,207.477412 128.000769,221.616521 C113.86166,235.754906 90.9387378,235.754906 76.800353,221.616521 L51.200362,247.216367 Z" fill="#00C98D"></path>
                <path d="M256,42.415426 C199.445737,-14.1384753 107.753322,-14.1384753 51.1994207,42.415426 C-5.35485714,98.9696894 -5.35485714,190.662104 51.1994207,247.216367 L76.7989048,221.616521 C34.3841124,179.200643 34.3841124,110.431151 76.7989048,68.0159962 C119.214783,25.6001177 187.984275,25.6001177 230.39943,68.0159962 L256,42.415426 Z" fill="#00C98D"></path>
                <path d="M204.800308,93.6158424 C176.523538,65.3390727 130.676245,65.3390727 102.399475,93.6158424 C74.1219813,121.893336 74.1219813,167.739181 102.399475,196.015951 L127.999321,170.416105 C113.860936,156.27772 113.860936,133.354797 127.999321,119.215688 C142.137706,105.077304 165.060629,105.077304 179.199738,119.215688 L204.800308,93.6158424 Z" fill="#00C98D"></path>
                <path d="M256,42.415426 C199.445737,-14.1384753 107.753322,-14.1384753 51.1994207,42.415426 C-5.35485714,98.9696894 -5.35485714,190.662104 51.1994207,247.216367 L76.7989048,221.616521 C34.3841124,179.200643 34.3841124,110.431151 76.7989048,68.0159962 C119.214783,25.6001177 187.984275,25.6001177 230.39943,68.0159962 L256,42.415426 Z" fill-opacity="0.4" fill="#FFFFFF"></path>
                <path d="M204.800308,93.6158424 C176.523538,65.3390727 130.676245,65.3390727 102.399475,93.6158424 C74.1219813,121.893336 74.1219813,167.739181 102.399475,196.015951 L127.999321,170.416105 C113.860936,156.27772 113.860936,133.354797 127.999321,119.215688 C142.137706,105.077304 165.060629,105.077304 179.199738,119.215688 L204.800308,93.6158424 Z" fill-opacity="0.4" fill="#FFFFFF"></path>
            </g>
        </svg>
        Upstash Redis</h3>
      <p class="mt-3">
          <a class={linkStyles} href="https://upstash.com/">Upstash</a> takes the well known in-memory  <a class={linkStyles} href="https://redis.io/">Redis database</a> a step further with a durable Redis compatible global database. 
        Access is via Redis APIs.  It offers per request pricing and which scales to zero price if not used (storage still 
        accrues cost).  Upstash Redis only offers eventual consistency.  For this experiment, a primary region of N. Virginia
        was configured with replicas setup in all available replica regions (California, Oregon, Frankfurt, Ireland, Singapore, 
        Sydney and Sao Paulo).  N.b. this would be a potentially expensive setup for a high volume application.
      </p>
      <h3 class="mt-3 text-xl font-bold">
      <svg class="inline mr-3 w-8 bg-white p-1" viewBox="0 0 256 256"preserveAspectRatio="xMidYMid">
            <g>
                <path d="M256,128.044218 C255.976145,198.701382 198.701382,255.976145 128.044218,256 L128.044218,256 Z M128,0 C179.977309,0 224.718545,30.9806545 244.765091,75.4833455 L75.4833455,244.765091 C68.2193455,241.492945 61.3149091,237.562764 54.84736,233.050182 L159.8976,128 L128,128 L37.4903855,218.509382 C14.3269236,195.346036 0,163.346036 0,128 C0,57.30752 57.3075782,0 128,0 Z" fill="#000000"></path>
            </g>
        </svg>
        PlanetScale</h3>
      <p class="mt-3">
          <a class={linkStyles} href="https://planetscale.com/">PlanetScale</a> offers a serverless MySQL-compatible database built on top 
        of  <a class={linkStyles} href="https://vitess.io/">Vitess</a> and is the only true relational database of the experiment.  
        It offers 11 AWS regions with 4 GCP regions. For this experiment, a primary region of N. Virginia was selected.  Additional replica 
        regions are only available on paid plans (starting at $29/month) and are therefore not included in this experiment.  Being a relational 
        database, access to the data is done via normal SQL queries.  A key offering is the ability to change the schema in 
        isolated branches, similar to a git workflow.  All data is automatically encrypted at rest.  Like MySQL, it only offers
        eventual consistency.
      </p>
      <p class="mt-3">
        Though serverless, PlanetScale isn't necessarily hands off as when your database becomes large  you may need to intervene
        and apply  <a class={linkStyles} href="https://www.digitalocean.com/community/tutorials/understanding-database-sharding">sharding</a>, 
        which can be complicated.
      </p>
      <h3 class="mt-3 text-xl font-bold">Summary</h3>
      <p class="mt-3">
        <div class="mt-5 overflow-x-auto border-1 rounded-md">
          <table class="min-w-full text-left text-sm font-light bg-[#202020]">
            <thead class="border-b font-medium">
              <tr>
                <th class="sticky left-0 z-100 px-6 py-3 bg-[#202c2c]">Database</th>
                <th class="min-w-[100px] bg-[#202c2c]">Type</th>
                <th class="min-w-[100px] bg-[#202c2c]">Regions configured in experiment<br/>(* primary)</th>
                <th class="min-w-[100px] bg-[#202c2c]">Read consistency</th>
                <th class="min-w-[100px] bg-[#202c2c]">Query model</th>
                <th class="min-w-[100px] bg-[#202c2c]">Transactions</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b">
                <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">Deno KV</td>
                <td>Key/Value</td>
                <td>US*, Europe, Asia</td>
                <td>Strong (with optional eventual)</td>
                <td>Custom simple API</td>
                <td>Strictly serializable ACID transactions</td>
              </tr>
              <tr class="border-b">
                <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">Fauna</td>
                <td>Document store</td>
                <td>US*</td>
                <td>Strong</td>
                <td>Custom FaunaQL or GraphQL</td>
                <td>Strictly serializable ACID transactions</td>
              </tr>
              <tr class="border-b">
                <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">DynamoDB</td>
                <td>Key/Value</td>
                <td>N. Virginia*</td>
                <td>Strong w/in single region (except for secondary indexes), eventual outwith (and optional within).</td>
                <td>PartiQL or custom CRUD API</td>
                <td>At best, serializable ACID transactions in single region only. Some operations are read-committed or not serializable</td>
              </tr>
              <tr class="border-b">
                <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">Upstash Redis</td>
                <td>Key/Value</td>
                <td>N. Virginia*, California, Oregon, Frankfurt, Ireland, Singapore, Sydney, Sao Paulo</td>
                <td>Eventual</td>
                <td>Redis API</td>
                <td>Serializable transactions (not ACID compliant)</td>
              </tr>
              <tr class="border-b">
                <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">PlanetScale</td>
                <td>Relational</td>
                <td>N. Virginia*</td>
                <td>Eventual</td>
                <td>SQL</td>
                <td>Available but not ACID compliant</td>
              </tr>
            </tbody>
          </table>
        </div>
      </p>
    </>
  );
}