export interface ResultsSelectorProps {
  regions: string[];
}

export default function ResultsSelector(props: ResultsSelectorProps) {
  return (
    <div class="mt-5">
      <select id="resultsSelector">
        <optgroup label="By operation">
          <option value="write">Write performance</option>
          <option value="atomicWrite">Atomic write performance</option>
          <option value="eventualRead">Eventual read performance</option>
          <option value="strongRead">Strong read performance</option>
        </optgroup>
        <optgroup label="By DB">
          <option value="DenoKV">DenoKV</option>
          <option value="Fauna">Fauna</option>
          <option value="PlanetScale">PlanetScale</option>
          <option value="Upstash">Upstash</option>
          <option value="DynamoDB">DynamoDB</option>
        </optgroup>
        <optgroup label="By region">
          {props.regions.map((region) => (
            <option value={region}>{region}</option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}