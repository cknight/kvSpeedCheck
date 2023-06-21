import { Head } from "$fresh/runtime.ts";
import { regionMapper } from "../db/util.ts";

export interface ResultsSelectorProps {
  regions: string[];
}

export default function ResultsSelector(props: ResultsSelectorProps) {
  const regions = props.regions.map((region) => regionMapper(region)).sort((a, b) => a.localeCompare(b)); 
  return (
    <>
      <Head>
        <script defer type="module" src="/selector.js"></script>
      </Head>
      <div class="mt-5">
        <select id="resultsSelector" class="p-2 text-lg bg-[#202020] border-4 rounded border-blue-400">
          <optgroup label="By operation">
            <option value="writePerformance">Write performance</option>
            <option value="atomicWritePerformance">Transactional write performance</option>
            <option value="eventualReadPerformance">Eventual read performance</option>
            <option value="strongReadPerformance">Strong read performance</option>
          </optgroup>
          <optgroup label="By DB">
            <option value="DenoKV">DenoKV</option>
            <option value="DynamoDB">DynamoDB</option>
            <option value="Fauna">Fauna</option>
            <option value="PlanetScale">PlanetScale</option>
            <option value="UpstashRedis">Upstash</option>
          </optgroup>
          <optgroup label="By region">
            {regions.map((region) => (
              <option value={region}>{region}</option>
            ))}
          </optgroup>
        </select>
      </div>
    </>
  );
}