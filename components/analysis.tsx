import { linkStyles } from "../utils/util.ts";

export default function Analysis() {
  return (
    <>
      <div id="analysis">&nbsp;</div>
      <h2 class="text-2xl font-bold">Analysis</h2>
      <h3 class="mt-8 text-xl font-bold">
        <svg
          class="inline mr-3 text-default h-10 flex-none dark:text-gray-900"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Deno Logo"
        >
          <g clip-path="url(#clip0_29_599)">
            <path
              d="M15 0C23.2843 0 30 6.71572 30 15C30 23.2843 23.2843 30 15 30C6.71572 30 0 23.2843 0 15C0 6.71572 6.71572 0 15 0Z"
              fill="currentColor"
            >
            </path>
            <path
              d="M14.6635 22.3394C14.2788 22.2357 13.8831 22.4584 13.7705 22.8381L13.7655 22.8558L12.7694 26.5472L12.7649 26.565C12.6711 26.9498 12.9011 27.3414 13.2858 27.4451C13.6704 27.549 14.0661 27.3263 14.1787 26.9465L14.1837 26.9289L15.1797 23.2375L15.1843 23.2196C15.1911 23.1919 15.1962 23.164 15.1997 23.1362L15.2026 23.1084L15.179 22.9888L15.1445 22.8166L15.1227 22.7091C15.076 22.619 15.0111 22.5396 14.932 22.4759C14.853 22.4123 14.7615 22.3658 14.6635 22.3394ZM7.7224 18.5379C7.70424 18.5741 7.68883 18.6123 7.67658 18.6522L7.66967 18.6763L6.67358 22.3677L6.669 22.3856C6.57525 22.7704 6.80524 23.1619 7.1899 23.2657C7.57451 23.3695 7.97026 23.1469 8.08287 22.7671L8.08779 22.7494L8.99096 19.4023C8.51793 19.1518 8.09336 18.8628 7.7224 18.5379ZM5.34707 14.2929C4.9624 14.1891 4.56666 14.4117 4.4541 14.7915L4.44912 14.8092L3.45303 18.5006L3.44846 18.5184C3.35471 18.9032 3.58469 19.2947 3.96936 19.3985C4.35397 19.5023 4.74971 19.2797 4.86232 18.8999L4.86725 18.8822L5.86334 15.1908L5.86791 15.173C5.96166 14.7882 5.73174 14.3967 5.34707 14.2929ZM27.682 13.4546C27.2973 13.3508 26.9015 13.5734 26.789 13.9532L26.784 13.9709L25.7879 17.6623L25.7833 17.6801C25.6896 18.0649 25.9196 18.4564 26.3042 18.5602C26.6889 18.664 27.0846 18.4414 27.1972 18.0616L27.2021 18.0439L28.1982 14.3525L28.2028 14.3347C28.2965 13.9499 28.0666 13.5584 27.682 13.4546ZM3.17781 8.52527C2.34361 10.0444 1.81243 11.7112 1.61377 13.4329C1.7088 13.5412 1.83381 13.619 1.97301 13.6563C2.35768 13.7602 2.75342 13.5375 2.86598 13.1577L2.87096 13.1401L3.86705 9.44865L3.87162 9.43084C3.96537 9.04599 3.73539 8.65447 3.35072 8.5507C3.2943 8.53547 3.23623 8.52694 3.17781 8.52527ZM25.159 8.5507C24.7744 8.44687 24.3786 8.66953 24.266 9.04933L24.2611 9.06697L23.265 12.7584L23.2604 12.7762C23.1667 13.161 23.3966 13.5526 23.7813 13.6563C24.1659 13.7602 24.5617 13.5375 24.6743 13.1577L24.6792 13.1401L25.6753 9.44865L25.6799 9.43084C25.7736 9.04599 25.5436 8.65447 25.159 8.5507Z"
              fill="white"
            >
            </path>
            <path
              d="M7.51285 5.04065C7.12824 4.93682 6.73249 5.15948 6.61988 5.53929L6.61495 5.55692L5.61886 9.24833L5.61429 9.26614C5.52054 9.65098 5.75052 10.0425 6.13519 10.1463C6.5198 10.2501 6.91554 10.0274 7.02816 9.64764L7.03308 9.63001L8.02917 5.9386L8.03374 5.92079C8.12749 5.53595 7.89751 5.14442 7.51285 5.04065ZM20.3116 5.73845C19.9269 5.63462 19.5312 5.85727 19.4186 6.23708L19.4136 6.25471L18.7443 8.73499C19.1779 8.94915 19.5917 9.20126 19.9809 9.48839L20.0453 9.53643L20.8279 6.63639L20.8324 6.61858C20.9262 6.23374 20.6963 5.84221 20.3116 5.73845ZM13.7968 1.57642C13.3296 1.61771 12.8647 1.68338 12.4043 1.77317L12.3066 1.79263L11.3782 5.23419L11.3736 5.252C11.2799 5.63684 11.5099 6.02837 11.8945 6.13214C12.2792 6.23596 12.6749 6.01331 12.7875 5.6335L12.7924 5.61587L13.7885 1.92446L13.7931 1.90665C13.8196 1.79831 13.8209 1.68533 13.7968 1.57642ZM22.9626 4.1263L22.7669 4.85169L22.7623 4.86944C22.6686 5.25429 22.8986 5.64581 23.2832 5.74958C23.6678 5.85341 24.0636 5.63075 24.1762 5.25095L24.1811 5.23331L24.2025 5.15462C23.8362 4.81205 23.4511 4.49009 23.0491 4.19022L22.9626 4.1263ZM17.1672 1.69677L16.8139 3.00593L16.8094 3.02374C16.7156 3.40858 16.9456 3.80011 17.3303 3.90388C17.7149 4.0077 18.1106 3.78505 18.2233 3.40524L18.2282 3.38761L18.6 2.00966C18.1624 1.88867 17.719 1.79001 17.2714 1.71405L17.1672 1.69677Z"
              fill="white"
            >
            </path>
            <path
              d="M9.69085 24.6253C9.80341 24.2455 10.1992 24.0229 10.5838 24.1266C10.9685 24.2303 11.1984 24.6219 11.1047 25.0068L11.1001 25.0246L10.3872 27.6664L10.2876 27.6297C9.85836 27.4694 9.43765 27.2873 9.0271 27.0839L9.68587 24.6429L9.69085 24.6253Z"
              fill="white"
            >
            </path>
            <path
              d="M14.4141 8.49082C10.0522 8.49082 6.65918 11.2368 6.65918 14.6517C6.65918 17.8769 9.78123 19.9362 14.6211 19.8331C15.0327 19.8243 15.1517 20.1008 15.2856 20.4734C15.4196 20.846 15.7796 22.8097 16.0665 24.3117C16.3233 25.656 16.5842 27.0052 16.7834 28.3596C19.9439 27.9418 22.8663 26.3807 25.0076 24.0261L22.7237 15.5088C22.1544 13.4518 21.489 11.5564 19.7283 10.1794C18.3118 9.07166 16.5122 8.49082 14.4141 8.49082Z"
              fill="white"
            >
            </path>
            <path
              d="M15.3516 10.957C15.8694 10.957 16.2891 11.3767 16.2891 11.8945C16.2891 12.4123 15.8694 12.832 15.3516 12.832C14.8338 12.832 14.4141 12.4123 14.4141 11.8945C14.4141 11.3767 14.8338 10.957 15.3516 10.957Z"
              fill="currentColor"
            >
            </path>
          </g>
          <defs>
            <clipPath id="clip0_29_599">
              <rect width="30" height="30" fill="white"></rect>
            </clipPath>
          </defs>
        </svg>
        Deno KV
      </h3>
      <div class="mt-4" id="DenoKVAnalysis">
        <table class="text-left bg-[#202020]">
          <thead class="border-b font-medium">
            <tr>
              <th class="sticky w-56 left-0 z-10 px-6 py-3 bg-[#202c2c]">
                Metric
              </th>
              <th class="min-w-[100px] bg-[#202c2c]">Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Setup/Configuration</td>
              <td>
                <span class="text-yellow-500">★★★★★</span>
              </td>
            </tr>
            <tr>
              <td>Local development</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Global distribution</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Ease of use</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Performance</td>
              <td>
                <span class="text-yellow-500">★★★★★</span>
              </td>
            </tr>
            <tr>
              <td>Consistency</td>
              <td>
                <span class="text-yellow-500">★★★★★</span>
              </td>
            </tr>
            <tr>
              <td>Features/Flexibility</td>
              <td>
                <span class="text-yellow-500">★★★☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Vendor independence</td>
              <td>
                <span class="text-yellow-500">★★☆☆☆</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="mt-8">
          <span class="font-bold">Setup/Configuration: </span>Deno KV easily tops
          the bunch when it comes to setup and configuration, simply because
          there is none. You do not have to create a database, manage connection
          strings, create credentials, choose regions, manage usernames and
          passwords, or anything else. You just start coding. Getting started
          with KV was significantly faster and easier than any of the other
          solutions. The Deno core team have suggested in the future some
          configuration may be available around regions (choice of primary
          region and limiting data to specific regions for example).
        </p>
        <p class="mt-3">
          <span class="font-bold">Local development: </span>Local development is
          also very easy, again there is no setup. In production, you are using
          a globally distributed database built on FoundationDB, and locally you
          are using a SQLite database which ships with the Deno CLI. The
          difference is transparent as the API doesn't change. There's nothing
          you need to do between development and production setup. As a beta
          product with few features, manual effort is needed to populate data
          into KV stores on another dev machine or Deploy branch build. Manual
          work to manage and delete these branch build KV stores may also be
          required if they contribute to storage costs. Using an access token you
          can access your remote KV store locally, which is very handy for testing
          and local development.
        </p>
        <p class="mt-3">
          <span class="font-bold">Global distribution: </span>With database
          replicas on 3 continents, KV counts as being a truly global database.
          Deploy Free tier customers are limited to a single read/write region.
          Deploy Pro users can configure which read regions are enabled (up to 4), while
          enterprise customers can further configure which region is the primary replica.
          The Deno team have hinted they are looking at adding additional
          replicas and capabilities to manage regions.
        </p>
        <p class="mt-3">
          <span class="font-bold">Ease of use: </span>Ease of use also scored
          very high. The API is simple and intuitive and the nascent
          documentation is decent. Where Deno KV is less user friendly is the
          manual management required for{" "}
          <a
            class={linkStyles}
            href="https://deno.com/manual/runtime/kv/secondary_indexes"
          >
            secondary indexes
          </a>. You must manually create and carefully manage these. It's not
          overly difficult, but neither is it handled automatically for you.
          Expect to see libraries which help manage this. KV's approach to keys,
          built from various parts, allows for nice flexibility of modelling
          your data, within the confines of a key-value database, as well as
          good ability to do{" "}
          <a
            class={linkStyles}
            href="https://deno.land/api?s=Deno.Kv&unstable=#method_list_0"
          >
            range searches
          </a>.
        </p>
        <p class="mt-3">
          <span class="font-bold">Performance: </span>KV is impressively fast.
          Strongly consistent read, write performance and transactions are all
          either the fastest or very close to the fastest measured in any region
          of the databases tested. Eventual read performance is also very fast,
          second only to Upstash Redis which has many more global replicas
          configured.
        </p>
        <p class="mt-3">
          <span class="font-bold">Consistency: </span>KV is strongly consistent,
          up there with Fauna as the most consistent database tested. However,
          unlike Fauna, KV has the nice option of allowing eventual reads for
          faster access in use cases where strong consistency is not required.
        </p>
        <p class="mt-3">
          <span class="font-bold">Features/Flexibility: </span>Features and
          flexibility are one of KV's weaker points. Like all key-value stores,
          KV is not best suited to highly relational data. There are no backup
          capabilities, data streaming, security configuration, or other
          advanced features, though the core team have confirmed that KV's data
          is always encrypted at rest. Additionally, of the key-value stores out
          there, KV has fairly{" "}
          <a
            class={linkStyles}
            href="https://deno.land/api?s=Deno.Kv&unstable="
          >
            restrictive limits
          </a>{" "}
          on key length (2kb) and value length (64kb), making it unsuitable for
          some types of data. There is also a limit of 1000
          operations per transaction (or 800kb transaction size, whichever is hit first). 
          KV recently introduced the ability to remotely connect to a KV store on Deploy,
          allowing <a class={linkStyles} href="https://www.youtube.com/watch?v=gFvVYoG0UrM">containerised apps to connect to KV</a> for example.  It's also useful for
          import and export of data to KV.
          Finally, as a beta product, KV lacks maturity in
          dashboard tooling. Expect to see improvements in all these areas as KV
          matures.
        </p>
        <p class="mt-3">
          <span class="font-bold">Vendor independence: </span>KV's weakest point
          is perhaps it's vendor lock-in. As a globally distributed database, KV
          is only available in Deno Deploy. However, with the new addition of remote
          connections to KV, it's possible access KV from other edge platforms via
          containerised Deno deployments.  Access from other runtimes is not supported.
          Deno also has a custom API meaning you cannot simply swap out KV for
          another database if in the future you migrate off of Deploy or away
          from KV. That said, the API is very simple so migrations may not be
          overly difficult. The core team have also hinted at potentially
          allowing KV to be used outside of Deploy in the future.
        </p>
        <p class="mt-3">
          <span class="font-bold">Pricing: </span><a class={linkStyles} href="https://deno.com/deploy/pricing">Pricing</a> has now been announced for 
          Deno KV.  Free tier is capped at 1GB of storage, while the $20/month Pro tier
          comes with 5GB included.  In an unusual move, KV places usage caps per day rather
          than per month. Also of note, the Pro tier isn't just for the database, but for
          Deploy hosting as well.  E.g. for the Pro plan, if you stay within the 5GB limit and
          45K/read, 15k/write per day, you effectively get KV for free if you are paying to host
          anyway.  Exceeding the KV plan limits appears to be much more expensive than most of the 
          competing databases (except perhaps Upstash Redis), though this significantly depends on your workload and comparisons
          are hard.
        </p>
      </div>

      <h3 class="mt-8 text-xl font-bold">
        <svg
          class="inline mr-3 w-8"
          viewBox="-16.5 0 289 289"
          preserveAspectRatio="xMidYMid"
        >
          <g>
            <path
              d="M165.258,288.501 L168.766,288.501 L226.027,259.867 L226.98,258.52 L226.98,29.964 L226.027,28.61 L168.766,0 L165.215,0 L165.258,288.501"
              fill="#5294CF"
            >
            </path>
            <path
              d="M90.741,288.501 L87.184,288.501 L29.972,259.867 L28.811,257.87 L28.222,31.128 L29.972,28.61 L87.184,0 L90.785,0 L90.741,288.501"
              fill="#1F5B98"
            >
            </path>
            <path
              d="M87.285,0 L168.711,0 L168.711,288.501 L87.285,288.501 L87.285,0 Z"
              fill="#2D72B8"
            >
            </path>
            <path
              d="M256,137.769 L254.065,137.34 L226.437,134.764 L226.027,134.968 L168.715,132.676 L87.285,132.676 L29.972,134.968 L29.972,91.264 L29.912,91.296 L29.972,91.168 L87.285,77.888 L168.715,77.888 L226.027,91.168 L247.096,102.367 L247.096,95.167 L256,94.193 L255.078,92.395 L226.886,72.236 L226.027,72.515 L168.715,54.756 L87.285,54.756 L29.972,72.515 L29.972,28.61 L0,63.723 L0,94.389 L0.232,94.221 L8.904,95.167 L8.904,102.515 L0,107.28 L0,137.793 L0.232,137.769 L8.904,137.897 L8.904,150.704 L1.422,150.816 L0,150.68 L0,181.205 L8.904,185.993 L8.904,193.426 L0.373,194.368 L0,194.088 L0,224.749 L29.972,259.867 L29.972,215.966 L87.285,233.725 L168.715,233.725 L226.196,215.914 L226.96,216.249 L254.781,196.387 L256,194.408 L247.096,193.426 L247.096,186.142 L245.929,185.676 L226.886,195.941 L226.196,197.381 L168.715,210.584 L168.715,210.6 L87.285,210.6 L87.285,210.584 L29.972,197.325 L29.972,153.461 L87.285,155.745 L87.285,155.801 L168.715,155.801 L226.027,153.461 L227.332,154.061 L254.111,151.755 L256,150.832 L247.096,150.704 L247.096,137.897 L256,137.769"
              fill="#1A476F"
            >
            </path>
            <path
              d="M226.027,215.966 L226.027,259.867 L256,224.749 L256,194.288 L226.2,215.914 L226.027,215.966"
              fill="#2D72B8"
            >
            </path>
            <path
              d="M226.027,197.421 L226.2,197.381 L256,181.353 L256,150.704 L226.027,153.461 L226.027,197.421"
              fill="#2D72B8"
            >
            </path>
            <path
              d="M226.2,91.208 L226.027,91.168 L226.027,134.968 L256,137.769 L256,107.135 L226.2,91.208"
              fill="#2D72B8"
            >
            </path>
            <path
              d="M226.2,72.687 L256,94.193 L256,63.731 L226.027,28.61 L226.027,72.515 L226.2,72.575 L226.2,72.687"
              fill="#2D72B8"
            >
            </path>
          </g>
        </svg>DynamoDB
      </h3>
      <div class="mt-8" id="DynamoDBAnalysis">
        <table class="text-left bg-[#202020]">
          <thead class="border-b font-medium">
            <tr>
              <th class="sticky w-56 left-0 z-10 px-6 py-3 bg-[#202c2c]">
                Metric
              </th>
              <th class="min-w-[100px] bg-[#202c2c]">Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Setup/Configuration</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Local development</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Global distribution</td>
              <td>
                <span class="text-yellow-500">★★★☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Ease of use</td>
              <td>
                <span class="text-yellow-500">★★★☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Performance</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Consistency</td>
              <td>
                <span class="text-yellow-500">★★★☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Features/Flexibility</td>
              <td>
                <span class="text-yellow-500">★★★★★</span>
              </td>
            </tr>
            <tr>
              <td>Vendor independence</td>
              <td>
                <span class="text-yellow-500">★★★☆☆</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="mt-8">
          <span class="font-bold">Setup/Configuration: </span>As you'd expect
          from AWS, DynamoDB is highly configurable and can be created in a
          number of ways including programmatically. The console is easy to use
          and well integrated into the other services AWS offers. Creating a
          DynamoDB table requires setting the partition key (i.e. primary
          index), so a basic understanding of how DynamoDB works is necessary to
          start.
        </p>
        <p class="mt-3">
          <span class="font-bold">Local development: </span>
          AWS{" "}
          <a
            class={linkStyles}
            href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html"
          >
            provide
          </a>{" "}
          an executable jar, maven dependency (both Java) or Docker image for
          local development. Data files can be specified for pre-population and
          sharing.
        </p>
        <p class="mt-3">
          <span class="font-bold">Global distribution: </span>This was a
          complicated one to rate. On the one hand, DynamoDB offers "global
          tables" which are replicated tables, offered across 16 different
          regions. Picking and choosing which regions you want including which
          is your primary region is great flexibility. However, there are a
          number of caveats. For example, using global tables introduces a
          weaker consistency model. Another challenge is that when using global
          tables, routing of the request is complicated. Unlike other providers
          where requests are automatically routed to the closest replica region,
          in DynamoDB using global tables, you must either implement the routing
          logic in the client yourself (e.g. manually map Deploy region to AWS
          Global Table region) or place a compute layer in front of DynamoDB in
          each replica region. Then, in front of the compute layer is another
          service like{" "}
          <a class={linkStyles} href="https://aws.amazon.com/route53/">
            Route53
          </a>{" "}
          which can route the request to the closest compute layer.
          Considerations like region outages must either be explicity coded for
          in the client or health checks configured in Route53 to route around
          the outage.
        </p>
        <p class="mt-3">
          <span class="font-bold">Ease of use: </span>Ease of use was average
          amongst the databases tested. The console is easy to use and well
          integrated into the other services AWS offers. Understanding how
          DynamoDB partition keys work is important to utilising the service
          effectively. Documentation was generally good, however a reasonable
          amount of reading was required to understand how to use the API. It
          felt very counter-intuitive to specify the region in the client. The
          API is also very verbose, requiring a lot of code to achieve simple
          tasks. There are few examples of using DynamoDB with Deno and even the
          Deno Deploy example is{" "}
          <a
            class={linkStyles}
            href="https://github.com/denoland/deploy_feedback/issues/390"
          >
            broken and incomplete
          </a>.
        </p>
        <p class="mt-3">
          <span class="font-bold">Performance: </span>Another challenging one to
          rate. This experiment only used a single region deployment of
          DynamoDB, so it was never going to be competitive in reads with other
          databases having multiple replica regions. And yet, it still performed
          well, achieving best or second best write performance in every region.
          The biggest let down in performance comes from the first use of the
          API which incurs a ~200-600ms delay, effectively a cold start penalty
          and something not encountered in any of the other databases. To make
          the experiment more consistent and comparable, a dummy request is sent
          to the API before the experimental requests are sent to eliminate this
          cold start penalty. However real world apps will take this hit on
          every new isolate creation in Deno Deploy so should be carefully
          considered.
        </p>
        <p class="mt-3">
          <span class="font-bold">Consistency: </span>DynamoDB's consistency
          model is somewhat complicated. If using a single region only you get
          strong consistency writes and optionally reads too (default is
          eventual consistency reads). However, if using global tables, and you
          specified a "strong consistent read" it will only be strongly
          consistent for writes within the same region. This means global tables
          are effectively only eventually consistent. Cross region transactions
          are not ACID compliant leading to potential data loss if concurrent
          writes to the same data occur in multiple regions.
        </p>
        <p class="mt-3">
          <span class="font-bold">Features/Flexibility: </span>Again, as you
          would expect from AWS, DynamoDB has many features and is very
          flexible. It is especially good at integrating into other AWS
          services. Data can be imported/exported to S3. Other features include
          data trigger functions, encryption at rest, point in time recovery,
          on-demand backup and restore, and much more.
        </p>
        <p class="mt-3">
          <span class="font-bold">Vendor independence: </span>Like Deno KV,
          DynamoDB is not vendor independent. Once you start using it, migrating
          away will be difficult. However, while migrating to a different
          database is difficult, migrating to a different edge server (e.g.
          Cloudflare) is easy as DynamoDB will work with any provider through
          it's http interface.
        </p>
        <p class="mt-3">
          <span class="font-bold">Pricing: </span>{" "}
          <a class={linkStyles} href="https://aws.amazon.com/dynamodb/pricing/">
            DynamoDB costs
          </a>{" "}
          can be a challenge to compute. In the general, reads and writes are
          reasonably priced, storage is among the cheapest, with the first 25GB
          of storage free. Alongside Upstash, it provides a serverless pricing
          model (pay for only what you use). However, the cost of global tables
          can quickly add up as each region added incurs additional linear costs
          for writes and storage.
        </p>
      </div>

      <h3 class="mt-8 text-xl font-bold">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 42.3 47"
          class="w-8 inline mr-3"
        >
          <path
            style="fill:#813eef"
            d="M32.9 9.9c-2.9 1-4.3 2.7-5.3 5.4-.2.7-.9 1.5-1.6 2.1l2.4 2.6-7.6-5.3L0 0s1.5 9.8 2 13.4c.4 2.5 1 3.7 3 4.8l.8.4 3.4 1.8-2-1.1 9.4 5.2-.1.1L6.4 20c.5 1.8 1.6 5.4 2 7 .5 1.7 1 2.3 2.7 2.9l3 1.1 1.9-.7-2.4 1.6L1.7 47c7.9-7.4 14.6-10 19.5-12.1 6.3-2.7 10-4.5 12.5-10.7 1.8-4.4 3.1-10 4.9-12.2l3.7-4.7c0-.1-7.6 2-9.4 2.6z"
          >
          </path>
        </svg>
        Fauna
      </h3>
      <div class="mt-8" id="FaunaAnalysis">
        <table class="text-left bg-[#202020]">
          <thead class="border-b font-medium">
            <tr>
              <th class="sticky w-56 left-0 z-10 px-6 py-3 bg-[#202c2c]">
                Metric
              </th>
              <th class="min-w-[100px] bg-[#202c2c]">Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Setup/Configuration</td>
              <td>
                <span class="text-yellow-500">★★★☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Local development</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Global distribution</td>
              <td>
                <span class="text-yellow-500">★★☆☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Ease of use</td>
              <td>
                <span class="text-yellow-500">★★☆☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Performance</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Consistency</td>
              <td>
                <span class="text-yellow-500">★★★★★</span>
              </td>
            </tr>
            <tr>
              <td>Features/Flexibility</td>
              <td>
                <span class="text-yellow-500">★★★★★</span>
              </td>
            </tr>
            <tr>
              <td>Vendor independence</td>
              <td>
                <span class="text-yellow-500">★★★☆☆</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="mt-8">
          <span class="font-bold">Setup/Configuration: </span>Creating a Fauna
          database is straightforward via their web UI. Once the database is
          created you need to create a{" "}
          <a
            class={linkStyles}
            href="https://docs.fauna.com/fauna/current/learn/understanding/collections"
          >
            Collection
          </a>, similar to a table in a traditional database, via the UI, in
          their database specific Fauna Query Language (FQL) or via their
          GraphQL API. You can also add a GraphQL schema to your Collection.
          Finally, you need to create a security key to access your database via
          the javascript client or http POST request. While nothing was overly
          difficult, the process was not as simple as other databases and there
          is a lot of new terminology to learn.
        </p>
        <p class="mt-3">
          <span class="font-bold">Local development: </span>For{" "}
          <a
            class={linkStyles}
            href="https://docs.fauna.com/fauna/current/build/tools/dev"
          >
            local development
          </a>, Fauna offers a docker container to run a local instance of Fauna
          which must be installed and given minor configuration to run. You can
          run it with persisted data or start with a clean sheet.
        </p>
        <p class="mt-3">
          <span class="font-bold">Global distribution: </span>Fauna bills itself
          as a multi-region distributed database. However, without upgrading to
          their enterprise plan (which gets you VM isolated single tenant
          customised deployments anywhere you want), you are limited to either
          Western centric US or Europe region groups (but not a mixture). With
          the region group, there will be 3 replicas of your data within the
          region. Speaking with their support, potential changes are coming to
          offer an expanded global offering. As of now, however, this may not be
          ideal if your primary user base is in Asia for example.
        </p>
        <p class="mt-3">
          <span class="font-bold">Ease of use: </span>Fauna had the steepest
          learning curve of the databases reviewed, however, if you already know
          GraphQL this will help. Fauna's FQL is a powerful language but as a
          custom built API takes time to learn. The documentation on the website
          is OK but lacking at times. It will take considerable time to become
          comfortable with Fauna as conceptually it is very different to other
          databases. There are few examples of using Fauna with Deno and even
          the{" "}
          <a
            class={linkStyles}
            href="https://deno.com/deploy/docs/tutorial-faunadb"
          >
            guide
          </a>{" "}
          on Deno Deploy documentation can be a challenge to follow.
        </p>
        <p class="mt-3">
          <span class="font-bold">Performance: </span>Performance wise, Fauna
          held its ground well, despite being limited to a single region group.
          Writes were slow compared to the other databases, but strong reads
          were fast, though as Fauna does not offer eventual consistency reads
          other databases can significantly outperform Fauna if eventual
          consistency is acceptable.
        </p>
        <p class="mt-3">
          <span class="font-bold">Consistency: </span>Fauna, like KV, offers very
          strong consistency but as mentioned previously there is no option for
          eventual read consistency. This is likely due to the fact that Fauna
          is an active-active database where writes only complete after
          replication to all replicas. Everything in Fauna is a transaction.
        </p>
        <p class="mt-3">
          <span class="font-bold">Features/Flexibility: </span>Where Fauna really
          shines is in it's features and flexibility. If you invest the time to
          properly learn Fauna, it will reward you with capabilities not found
          in other NoSQL databases such as joins, indexes, normalised data, SQL
          like queries, functions (which are similar to stored procedures), data
          streaming, backups, temporality (reading data as it was at a point in
          time), and more.
        </p>
        <p class="mt-3">
          <span class="font-bold">Vendor independence: </span>Fauna is a
          proprietary database with a custom API and many features. Once your
          application is deeply embedded into Fauna migrating to another
          database will be difficult and costly. On the plus side, unlike KV you
          can take your Fauna database with you to another edge platform and as
          the GraphQL API is pure http based there are no libraries to worry
          about. Alternatively, using{" "}
          <a class={linkStyles} href="https://airbyte.com/">Airbyte</a>{" "}
          you can extract your data from Fauna and move it elsewhere.
        </p>
        <p class="mt-3">
          <span class="font-bold">Pricing: </span>There are{" "}
          <a
            class={linkStyles}
            href="https://docs.fauna.com/fauna/current/learn/understanding/billing"
          >
            7 metrics
          </a>{" "}
          Fauna uses in its pricing model. Their entry level plan gets you $25
          worth of services each month which equates to a maximum of 54 million
          reads, 11 million writes or 25GB of storage. Costs appear to be middle
          of the road.
        </p>
      </div>

      <h3 class="mt-8 text-xl font-bold">
        <svg
          class="inline mr-3 w-8 bg-white p-1"
          viewBox="0 0 256 256"
          preserveAspectRatio="xMidYMid"
        >
          <g>
            <path
              d="M256,128.044218 C255.976145,198.701382 198.701382,255.976145 128.044218,256 L128.044218,256 Z M128,0 C179.977309,0 224.718545,30.9806545 244.765091,75.4833455 L75.4833455,244.765091 C68.2193455,241.492945 61.3149091,237.562764 54.84736,233.050182 L159.8976,128 L128,128 L37.4903855,218.509382 C14.3269236,195.346036 0,163.346036 0,128 C0,57.30752 57.3075782,0 128,0 Z"
              fill="#000000"
            >
            </path>
          </g>
        </svg>
        PlanetScale
      </h3>
      <div class="mt-8" id="PlanetScaleAnalysis">
        <table class="text-left bg-[#202020]">
          <thead class="border-b font-medium">
            <tr>
              <th class="sticky w-56 left-0 z-10 px-6 py-3 bg-[#202c2c]">
                Metric
              </th>
              <th class="min-w-[100px] bg-[#202c2c]">Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Setup/Configuration</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Local development</td>
              <td>
                <span class="text-yellow-500">★★☆☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Global distribution</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Ease of use</td>
              <td>
                <span class="text-yellow-500">★★★☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Performance</td>
              <td>
                <span class="text-yellow-500">★★★☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Consistency</td>
              <td>
                <span class="text-yellow-500">★★☆☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Features/Flexibility</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Vendor independence</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="mt-8">
          <span class="font-bold">Setup/Configuration: </span>Setup of a
          PlanetScale database is straightforward via their UI. In addition to a
          name, you also select a primary region. Free plans are limited to a
          single region and single database. Like any SQL database, you need to
          define a schema using traditional SQL (e.g. "CREATE TABLE ...").
        </p>
        <p class="mt-3">
          <span class="font-bold">Local development: </span>PlanetScale does not
          provide a local development option. Your choices are to connect to a
          development branch of your database which requires a network
          connection and incurs usage charges, or manually setup and connect to
          a local MySQL instance. No instructions are given for the latter.
        </p>
        <p class="mt-3">
          <span class="font-bold">Global distribution: </span>In addition to
          selecting your primary region from 11 AWS or 4 GCP (beta) regions, you
          can also enable one or more read-only replica regions. One downside to
          PlanetScale's global setup is that, similar to DynamoDB, you must
          manage the connections yourself in the client (e.g. decide which
          region to connect to), unlike other providers who route you to the
          closest region automatically.
        </p>
        <p class="mt-3">
          <span class="font-bold">Ease of use: </span>PlanetScale is essentially
          a MySQL database under the hood and therefore you have all the power
          and flexibility of a relational database and SQL interface. One area
          to be aware of is that{" "}
          <a
            class={linkStyles}
            href="https://planetscale.com/docs/concepts/sharding"
          >
            manual sharding
          </a>{" "}
          (partioning your data across multiple databases to spread the load) is
          required if your database becomes large (~250GB) or hits limits around
          write or read throughput. This is the only database in the experiment
          which requires action at scale. The other databases are fully managed
          and scale automatically. Access to the database is via their
          javascript driver which you can use via a{" "}
          <a
            class={linkStyles}
            href="https://deno.com/manual@v1.34.3/node/how_to_with_npm/planetscale"
          >
            npm specifier
          </a>{" "}
          or CDN (unpkg, esh.sh, etc). Though MySQL compatible, there are{" "}
          <a
            class={linkStyles}
            href="https://planetscale.com/docs/learn/operating-without-foreign-key-constraints"
          >
            no foreign key constraints
          </a>. Such constraints need to be implemented in application logic
          instead. Finally, when on the free tier only, your database will be
          put to sleep after 7 days of inactivity. You must manually wake it up
          via the console and until then it's completely inaccessible.
        </p>
        <p class="mt-3">
          <span class="font-bold">Performance: </span>Across the regions,
          PlanetScale showed average to good write performance in comparison to
          the other databases in this experiment. However, transactions were
          very slow. Read performance was also surprisingly slow, slowest of all
          databases in the experiment (though, like DynamoDB, only one region
          was configured).
        </p>
        <p class="mt-3">
          <span class="font-bold">Consistency: </span>PlanetScale's consistency
          model is eventual consistent. &nbsp;<a
            class={linkStyles}
            href="https://dev.to/harshhhdev/planetscale-vitess-legacy-sharded-databases-and-referential-integrity-ikp"
          >
            Transactions are not ACID compliant
          </a>. Strongly consistent reads are not supported.
        </p>
        <p class="mt-3">
          <span class="font-bold">Features/Flexibility: </span>PlanetScale's
          standout feature is its{" "}
          <a
            class={linkStyles}
            href="https://planetscale.com/docs/learn/how-online-schema-change-tools-work"
          >
            schema management
          </a>{" "}
          capabilities. It offers non-blocking schema changes, branching
          workflows (manage your production schema like you would with your
          code), and the ability to revert schema changes. Insights is another
          nice tool giving query level performance metrics.
        </p>
        <p class="mt-3">
          <span class="font-bold">Vendor independence: </span>By being MySQL
          compatible, PlanetScale is perhaps the most vendor independent of the
          databases in the experiment. They additionally support the Airbyte
          open source data integration engine giving you an ETL path to move you
          data to another database.
        </p>
        <p class="mt-3">
          <span class="font-bold">Pricing: </span>PlanetScale has some incredibly
          generous read/write{" "}
          <a
            class={linkStyles}
            href="https://planetscale.com/docs/concepts/billing"
          >
            pricing
          </a>{" "}
          for it's database that puts it in a league of its own. The entry level
          paid plan gives you 100 billion (yes, billion) reads and 50 million
          writes. That's 850 times more reads per dollar spend than the next
          most cheapest database for reads (DynamoDB). On the flip side, while
          you also get 10GB storage free, after that the storage is very
          expensive compared to other databases (10x more expensive than Upstash
          or DynamoDB for example). However, many databases will stay under the
          free 10GB and so this may not be an issue.
        </p>
      </div>

      <h3 class="mt-8 text-xl font-bold">
        <svg
          class="inline w-6 mr-3"
          viewBox="0 0 256 341"
          version="1.1"
          preserveAspectRatio="xMidYMid"
        >
          <g>
            <path
              d="M0,298.416784 C56.5542815,354.970323 148.246768,354.970323 204.801032,298.416784 C261.354571,241.86252 261.354571,150.170106 204.801032,93.6158424 L179.200462,119.215688 C221.61634,161.631567 221.61634,230.401059 179.200462,272.816213 C136.785307,315.232092 68.0157428,315.232092 25.5998642,272.816213 L0,298.416784 Z"
              fill="#00C98D"
            >
            </path>
            <path
              d="M51.200362,247.216367 C79.4772765,275.493137 125.323122,275.493137 153.600615,247.216367 C181.877385,218.939598 181.877385,173.093028 153.600615,144.816259 L128.000769,170.416105 C142.139154,184.55449 142.139154,207.477412 128.000769,221.616521 C113.86166,235.754906 90.9387378,235.754906 76.800353,221.616521 L51.200362,247.216367 Z"
              fill="#00C98D"
            >
            </path>
            <path
              d="M256,42.415426 C199.445737,-14.1384753 107.753322,-14.1384753 51.1994207,42.415426 C-5.35485714,98.9696894 -5.35485714,190.662104 51.1994207,247.216367 L76.7989048,221.616521 C34.3841124,179.200643 34.3841124,110.431151 76.7989048,68.0159962 C119.214783,25.6001177 187.984275,25.6001177 230.39943,68.0159962 L256,42.415426 Z"
              fill="#00C98D"
            >
            </path>
            <path
              d="M204.800308,93.6158424 C176.523538,65.3390727 130.676245,65.3390727 102.399475,93.6158424 C74.1219813,121.893336 74.1219813,167.739181 102.399475,196.015951 L127.999321,170.416105 C113.860936,156.27772 113.860936,133.354797 127.999321,119.215688 C142.137706,105.077304 165.060629,105.077304 179.199738,119.215688 L204.800308,93.6158424 Z"
              fill="#00C98D"
            >
            </path>
            <path
              d="M256,42.415426 C199.445737,-14.1384753 107.753322,-14.1384753 51.1994207,42.415426 C-5.35485714,98.9696894 -5.35485714,190.662104 51.1994207,247.216367 L76.7989048,221.616521 C34.3841124,179.200643 34.3841124,110.431151 76.7989048,68.0159962 C119.214783,25.6001177 187.984275,25.6001177 230.39943,68.0159962 L256,42.415426 Z"
              fill-opacity="0.4"
              fill="#FFFFFF"
            >
            </path>
            <path
              d="M204.800308,93.6158424 C176.523538,65.3390727 130.676245,65.3390727 102.399475,93.6158424 C74.1219813,121.893336 74.1219813,167.739181 102.399475,196.015951 L127.999321,170.416105 C113.860936,156.27772 113.860936,133.354797 127.999321,119.215688 C142.137706,105.077304 165.060629,105.077304 179.199738,119.215688 L204.800308,93.6158424 Z"
              fill-opacity="0.4"
              fill="#FFFFFF"
            >
            </path>
          </g>
        </svg>
        Upstash Redis
      </h3>
      <div class="mt-8" id="UpstashRedisAnalysis">
        <table class="text-left bg-[#202020]">
          <thead class="border-b font-medium">
            <tr>
              <th class="sticky w-56 left-0 z-10 px-6 py-3 bg-[#202c2c]">
                Metric
              </th>
              <th class="min-w-[100px] bg-[#202c2c]">Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Setup/Configuration</td>
              <td>
                <span class="text-yellow-500">★★★★★</span>
              </td>
            </tr>
            <tr>
              <td>Local development</td>
              <td>
                <span class="text-yellow-500">★★☆☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Global distribution</td>
              <td>
                <span class="text-yellow-500">★★★★★</span>
              </td>
            </tr>
            <tr>
              <td>Ease of use</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Performance</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Consistency</td>
              <td>
                <span class="text-yellow-500">★★☆☆☆</span>
              </td>
            </tr>
            <tr>
              <td>Features/Flexibility</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
            <tr>
              <td>Vendor independence</td>
              <td>
                <span class="text-yellow-500">★★★★☆</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="mt-8">
          <span class="font-bold">Setup/Configuration: </span>Upstash has a
          simple process to create a database through their UI console. You
          choose a name, global or regional configuration, primary region and
          read region(s) along with a few other options. Connection is
          maintained through a REST URL and token.{" "}
          <a
            class={linkStyles}
            href="https://docs.upstash.com/redis/quickstarts/deno-deploy"
          >
            Quick start
          </a>{" "}
          guides are available for AWS Lambda, Vercel functions, Next.js,
          Fly.io, Deno Deploy and a fair few more. They are the only provider in
          this experiment other than KV to provide specific instructions for
          getting up and running on Deno Deploy.
        </p>
        <p class="mt-3">
          <span class="font-bold">Local development: </span>
          <a
            class={linkStyles}
            href="https://docs.upstash.com/redis/sdks/javascriptsdk/developing-or-testing"
          >
            Local development
          </a>{" "}
          is achieved through a community supported project called{" "}
          <a
            class={linkStyles}
            href="https://github.com/hiett/serverless-redis-http"
          >
            Serverless Redis HTTP (SRH)
          </a>. While Upstash offer support to the maintenance they do not
          maintain this project and one concern would be the single maintainer
          of the project. SRH also has a few differences to Upstash Redis. Some
          instructions are provided for running SRH in docker, but there are
          gaps leaving you to fill in the blanks. Additionally you must install
          your own Redis server locally, for which no documentation or links are
          given. Compared to the other databases tested, Upstash Redis had the
          least robust local development experience.
        </p>
        <p class="mt-3">
          <span class="font-bold">Global distribution: </span>Upstash provides 8
          regions around the globe (3 US, 2 Europe, 1 Asia, 1 S. America, and 1
          Australia) to use for primary and read replicas. As Upstash charge per
          100k commands and each replica write consumes a command, adding
          additional read regions will increase your costs, how much depends on
          how write-heavy your application is.
        </p>
        <p class="mt-3">
          <span class="font-bold">Ease of use: </span>Upstash was very easy to
          use with good documentation. For users with experience of Redis this
          will be a particularly easy database to use as Upstash Redis is Redis
          compatible. To get working with Deno Deploy, only{" "}
          <a
            class={linkStyles}
            href="https://docs.upstash.com/redis/quickstarts/deno-deploy"
          >
            a few imports
          </a>{" "}
          and environment variables are needed.
        </p>
        <p class="mt-3">
          <span class="font-bold">Performance: </span>While achieving 4 star
          performance, this is really a tale of two use cases. Write performance
          is sub-par (2 stars), while eventual read performance is excellent (5
          stars), faster in almost every region than the other databases (N.B.
          remember that Upstash was configured with 8 read regions, while the
          others have 3 at most).
        </p>
        <p class="mt-3">
          <span class="font-bold">Consistency: </span>A weak point of Upstash
          Redis is consistency. Their consistency model is eventual consistency.
          Additionally transactions, while supported in the API, are not ACID
          compliant.
        </p>
        <p class="mt-3">
          <span class="font-bold">Features/Flexibility: </span>Upstash Redis is
          fairly feature rich. Some features include data eviction, encryption
          at rest, IP whitelisting and backup/restore amongst others.
        </p>
        <p class="mt-3">
          <span class="font-bold">Vendor independence: </span>Like the other
          databases besides KV, Upstash Redis is portable and you can move it to
          another edge provider. Additionally, by using a Redis compatible API,
          you can in theory move to a different Redis installation. One
          challenge to that is there are little to no other offerings of
          globally distributed durable Redis.
        </p>
        <p class="mt-3">
          <span class="font-bold">Pricing: </span>Upstash provides the simplest
          {" "}
          <a
            class={linkStyles}
            href="https://docs.upstash.com/redis/overall/pricing"
          >
            pricing model
          </a>{" "}
          of the databases tested. With its serverless model, you only pay for
          what you use. That said, it also has the most expensive read/writes of
          the databases tested. Like DynamoDB global tables, the more read
          replicas you add the more expensive it becomes, linearly increasing
          your costs for writes and storage. Storage at least is very cheap,
          though unlike DynamoDB does not come with any free amount.
        </p>
      </div>
    </>
  );
}
