import { Head } from "$fresh/runtime.ts";
import { regionMapper } from "../db/util.ts";

export interface ResultsSelectorProps {
  regions: string[];
}

export default function ResultsSelector(props: ResultsSelectorProps) {
  return (
    <>
      <Head>
        <script defer type="module" src="/selector.js"></script>
      </Head>
      <div class="mt-5">
        <select id="resultsSelector">
          <optgroup label="By operation">
            <option value="writePerformance">Write performance</option>
            <option value="atomicWritePerformance">Atomic write performance</option>
            <option value="eventualReadPerformance">Eventual read performance</option>
            <option value="strongReadPerformance">Strong read performance</option>
          </optgroup>
          <optgroup label="By DB">
            <option value="DenoKV">DenoKV</option>
            <option value="Fauna">Fauna</option>
            <option value="Planetscale">PlanetScale</option>
            <option value="UpstashRedis">Upstash</option>
            <option value="DynamoDB">DynamoDB</option>
          </optgroup>
          <optgroup label="By region">
            {props.regions.map((region) => (
              <option value={regionMapper(region)}>{regionMapper(region)}</option>
            ))}
          </optgroup>
        </select>
      </div>
    </>
  );
}